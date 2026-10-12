import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handleEnquiry, classify, introducesNewNumbers } from '../src/support.js';
import { assessReturn, createReturnCase, proposeRefund } from '../src/returns.js';
import { ingestWebhook } from '../src/orders.js';
import { listApprovals } from '../src/lib/approvals.js';
import { testCtx, seedProduct, paidOrderPayload } from './helpers.js';

function withOrder() {
  const t = testCtx();
  seedProduct(t.ctx);
  ingestWebhook(t.ctx, { webhookId: 'w1', topic: 'orders/paid' }, paidOrderPayload());
  t.ctx.db.prepare("UPDATE orders SET state = 'shipped' WHERE id = '5001'").run();
  t.ctx.db.prepare(`INSERT INTO supplier_orders (order_id, supplier, idempotency_key, status, tracking_number, tracking_company, tracking_synced, created_at, updated_at)
    VALUES ('5001','MOCK','5001:MOCK','shipped','RM123456789GB','Royal Mail',1,datetime('now'),datetime('now'))`).run();
  return t;
}

test('classification: escalation keywords beat routine categories', () => {
  assert.equal(classify('Where is my order? I will raise a chargeback').category, 'chargeback');
  assert.equal(classify('The bin cracked and cut my hand').category, 'safety');
  assert.equal(classify('I want a refund').category, 'refund_request');
  assert.equal(classify("My order hasn't arrived yet").category, 'order_status');
  assert.equal(classify('Can I change my delivery address?').category, 'change_address');
  assert.equal(classify('What are the dimensions of the pantry bin?').category, 'product_info');
});

test('WISMO from the order email gets real status and supplier tracking', async () => {
  const { ctx } = withOrder();
  const r = await handleEnquiry(ctx, { messageId: 'm1', fromEmail: 'Alex@Example.com', subject: 'Where is my order #1001', body: '' });
  assert.equal(r.action, 'auto_reply');
  assert.equal(r.verified, true);
  assert.match(r.reply, /dispatched/);
  assert.match(r.reply, /RM123456789GB/);
});

test('WISMO from a different email reveals nothing about the order', async () => {
  const { ctx } = withOrder();
  const r = await handleEnquiry(ctx, { messageId: 'm2', fromEmail: 'stranger@example.com', subject: 'Where is my order #1001', body: '' });
  assert.equal(r.verified, false);
  assert.doesNotMatch(r.reply, /RM123456789GB|dispatched|Leeds|Alex/);
  assert.match(r.reply, /email address used to place the order/);
});

test('escalations get only a neutral acknowledgement; duplicates ignored', async () => {
  const { ctx } = withOrder();
  const r = await handleEnquiry(ctx, { messageId: 'm3', fromEmail: 'alex@example.com', subject: 'Damaged item #1001', body: 'It arrived broken, I want a refund' });
  assert.equal(r.action, 'escalate');
  assert.equal(r.reply, null);
  assert.match(r.acknowledgement, /team will reply/);
  const dup = await handleEnquiry(ctx, { messageId: 'm3', fromEmail: 'alex@example.com', subject: 'x', body: 'y' });
  assert.equal(dup.duplicate, true);
});

test('product question answered only from verified specs', async () => {
  const { ctx } = withOrder();
  const r = await handleEnquiry(ctx, { messageId: 'm4', fromEmail: 'a@b.com', subject: 'Question', body: 'What are the dimensions of the stackable pantry bin?' });
  assert.equal(r.action, 'auto_reply');
  assert.match(r.reply, /30 × 20 × 15 cm/);
});

test('AI rewrite that invents numbers is rejected (hallucination guard)', () => {
  assert.equal(introducesNewNumbers('Your parcel RM123456789GB arrives in 2 days', 'Tracking RM123456789GB'), true);
  assert.equal(introducesNewNumbers('Your tracking is RM123456789GB.', 'Tracking RM123456789GB'), false);
});

test('AI polish is used only when it keeps the facts', async () => {
  const { ctx } = withOrder();
  ctx.ai = { enabled: true, draft: async () => ({ text: 'Good news — it will arrive tomorrow by 10am, order 1001!' }) };
  const r = await handleEnquiry(ctx, { messageId: 'm5', fromEmail: 'alex@example.com', subject: 'Where is my order #1001', body: '' });
  assert.doesNotMatch(r.reply, /10am/);
});

test('returns: statutory windows assessed correctly', () => {
  const at = new Date('2026-10-20');
  assert.equal(assessReturn({ reason: 'changed my mind', deliveredAt: '2026-10-10', at }).route, 'instructions');
  assert.equal(assessReturn({ reason: 'changed my mind', deliveredAt: '2026-09-01', at }).withinWindow, false);
  assert.equal(assessReturn({ reason: 'it arrived broken', deliveredAt: '2026-10-01', at }).kind, 'faulty');
  assert.equal(assessReturn({ reason: 'changed my mind', deliveredAt: null, at }).route, 'review');
});

test('return case requires verified email; refunds only ever go to approval', () => {
  const { ctx } = withOrder();
  assert.equal(createReturnCase(ctx, { orderName: '#1001', fromEmail: 'x@y.com', reason: 'no' }).ok, false);
  const c = createReturnCase(ctx, { orderName: '#1001', fromEmail: 'alex@example.com', reason: 'changed my mind' });
  assert.equal(c.ok, true);
  proposeRefund(ctx, c.caseId, 24.99);
  assert.ok(listApprovals(ctx.db).some((a) => a.type === 'refund'));
});
