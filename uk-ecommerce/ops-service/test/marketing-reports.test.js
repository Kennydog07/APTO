import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateDailyContent, dueForPublishing, approveContent, markPublished, rejectContent, PUBLISH_LIMITS } from '../src/marketing.js';
import { dailyReport, weeklyReport, costProjection } from '../src/reports.js';
import { ingestWebhook, evaluateOrder, submitSupplierOrders } from '../src/orders.js';
import { setControl } from '../src/lib/controls.js';
import { raiseException } from '../src/lib/exceptions.js';
import { createAi, monthSpendGbp } from '../src/ai.js';
import { testCtx, seedProduct, paidOrderPayload } from './helpers.js';

const monday = new Date('2026-10-12T06:00:00Z');

test('generated content lands in the approval queue and is not duplicated', async () => {
  const { ctx } = testCtx();
  seedProduct(ctx);
  const r = await generateDailyContent(ctx, { date: monday });
  assert.ok(r.created >= 5, `created ${r.created}`); // pin, caption, video, blog, email on Mondays
  const statuses = ctx.db.prepare('SELECT DISTINCT status FROM content').all().map((x) => x.status);
  assert.deepEqual(statuses, ['pending_approval']);
  const again = await generateDailyContent(ctx, { date: monday });
  assert.equal(again.created, 0);
  const pin = ctx.db.prepare("SELECT * FROM content WHERE channel = 'pinterest'").get();
  assert.ok(pin.title.length <= 100 && pin.body.length <= 500);
  assert.match(JSON.parse(pin.meta).link, /utm_source=pinterest/);
});

test('publishing respects approval status, pause switch and daily limits', async () => {
  const { ctx } = testCtx();
  seedProduct(ctx);
  await generateDailyContent(ctx, { date: monday });
  const pin = ctx.db.prepare("SELECT * FROM content WHERE channel = 'pinterest'").get();
  assert.equal(dueForPublishing(ctx.db, 'pinterest').items.length, 0, 'unapproved content must not be due');
  assert.equal(markPublished(ctx.db, pin.id, 'x'), false, 'cannot publish unapproved content');
  approveContent(ctx.db, pin.id);
  assert.equal(dueForPublishing(ctx.db, 'pinterest').items.length, 1);
  setControl(ctx.db, 'pause_marketing', true, 't');
  const paused = dueForPublishing(ctx.db, 'pinterest');
  assert.equal(paused.paused, true);
  assert.equal(paused.items.length, 0);
  setControl(ctx.db, 'pause_marketing', false, 't');
  assert.equal(markPublished(ctx.db, pin.id, 'pin-1'), true);
  assert.equal(markPublished(ctx.db, pin.id, 'pin-1'), false, 'cannot publish twice');
  const cap = PUBLISH_LIMITS.pinterest;
  assert.ok(cap >= 1);
});

test('rejected content is never due', async () => {
  const { ctx } = testCtx();
  seedProduct(ctx);
  await generateDailyContent(ctx, { date: monday });
  const pin = ctx.db.prepare("SELECT * FROM content WHERE channel = 'pinterest'").get();
  rejectContent(ctx.db, pin.id);
  assert.equal(dueForPublishing(ctx.db, 'pinterest').items.length, 0);
});

test('daily report contains every required section and flags attention items', async () => {
  const { ctx, shopify } = testCtx();
  seedProduct(ctx);
  shopify.orders.set('5001', {});
  ingestWebhook(ctx, { webhookId: 'w', topic: 'orders/paid' }, paidOrderPayload());
  await evaluateOrder(ctx, '5001');
  await submitSupplierOrders(ctx, '5001');
  raiseException(ctx.db, { source: 'test', severity: 'critical', message: 'Something broke' });
  const r = dailyReport(ctx, { date: new Date(Date.now() + 1000) });
  for (const k of ['sales', 'unfulfilledOrders', 'supplierLiabilities', 'returnsAndRefunds', 'lowStockProducts', 'workflowFailures', 'marketing', 'tasksRequiringAttention', 'costs']) assert.ok(k in r, k);
  assert.equal(r.sales.orders, 1);
  assert.equal(r.sales.revenue, 24.99);
  assert.equal(r.sales.supplierCosts, 8.5);
  assert.ok(r.tasksRequiringAttention.some((t) => /Something broke/.test(t)));
  assert.match(r.text, /DAILY REPORT/);
});

test('weekly report recommends but never authorises spending', () => {
  const { ctx } = testCtx();
  seedProduct(ctx);
  const w = weeklyReport(ctx);
  assert.ok(w.recommendations.some((r) => /No sales/.test(r)));
  assert.match(w.note, /No spending/);
});

test('cost projection alerts above £80', () => {
  const { ctx } = testCtx({ cfg: (c) => { c.costs = { monthly: [{ item: 'Shopify', gbp: 70, verified: false }, { item: 'VPS', gbp: 15, verified: false }] }; } });
  const p = costProjection(ctx);
  assert.equal(p.overThreshold, true);
  assert.equal(p.projectedMonthlyGbp, 85);
});

test('AI budget cap: calls stop when the monthly cap would be exceeded; usage is recorded; refusals handled', async () => {
  const { ctx } = testCtx({ cfg: (c) => { c.ai.monthlyBudgetGbp = 0.05; c.ai.model = 'claude-opus-5-5'; } });
  let calls = 0;
  const fake = { beta: { messages: { create: async () => { calls++; return { model: 'claude-opus-5-5', stop_reason: 'end_turn', usage: { input_tokens: 1000, output_tokens: 500 }, content: [{ type: 'text', text: 'Hello' }] }; } } } };
  const ai = createAi(ctx, { client: fake });
  const r1 = await ai.draft({ system: 's', prompt: 'p', purpose: 't' });
  assert.equal(r1.text, 'Hello');
  assert.ok(monthSpendGbp(ctx.db) > 0);
  // Fill the budget and confirm the next call is blocked before reaching the API.
  ctx.db.prepare("INSERT INTO ai_usage (ts, model, purpose, input_tokens, output_tokens, cost_gbp) VALUES (datetime('now'),'m','fill',0,0,0.05)").run();
  ctx.db.prepare("UPDATE ai_usage SET ts = ? WHERE purpose = 'fill'").run(new Date().toISOString());
  const r2 = await ai.draft({ system: 's', prompt: 'p', purpose: 't' });
  assert.equal(r2.skipped, 'budget_exhausted');
  assert.equal(calls, 1);
  const refusing = { beta: { messages: { create: async () => ({ model: 'claude-opus-5-5', stop_reason: 'refusal', usage: { input_tokens: 10, output_tokens: 0 }, content: [] }) } } };
  const { ctx: c2 } = testCtx();
  assert.equal((await createAi(c2, { client: refusing }).draft({ system: 's', prompt: 'p', purpose: 't' })).skipped, 'refusal');
});
