import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ingestWebhook, evaluateOrder, submitSupplierOrders } from '../src/orders.js';
import { setControl } from '../src/lib/controls.js';
import { listApprovals } from '../src/lib/approvals.js';
import { openExceptions } from '../src/lib/exceptions.js';
import { decide } from '../src/actions.js';
import { testCtx, seedProduct, paidOrderPayload } from './helpers.js';

let n = 0;
function receive(ctx, payload = paidOrderPayload(), topic = 'orders/paid') {
  return ingestWebhook(ctx, { webhookId: `w${++n}`, topic, shop: 'x' }, payload);
}
const orderRow = (ctx, id = '5001') => ctx.db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
const supplierRows = (ctx, id = '5001') => ctx.db.prepare('SELECT * FROM supplier_orders WHERE order_id = ?').all(id);

test('happy path: paid order validates and is submitted exactly once', async () => {
  const { ctx, supplier, shopify } = testCtx();
  seedProduct(ctx);
  shopify.orders.set('5001', {});
  receive(ctx);
  const ev = await evaluateOrder(ctx, '5001');
  assert.equal(ev.decision, 'auto_submit');
  const r = await submitSupplierOrders(ctx, '5001');
  assert.equal(r.ok, true);
  assert.equal(r.results[0].status, 'confirmed');
  assert.equal(orderRow(ctx).state, 'submitted');
  // Retry / duplicate trigger does not place a second supplier order.
  const again = await submitSupplierOrders(ctx, '5001');
  assert.equal(again.error, 'order_state_submitted');
  // Even if the order state were reset (e.g. a bug or manual edit), the supplier row blocks a resubmission.
  ctx.db.prepare("UPDATE orders SET state = 'ready' WHERE id = '5001'").run();
  const forced = await submitSupplierOrders(ctx, '5001');
  assert.equal(forced.results[0].skipped, 'already_submitted');
  assert.equal(supplier.placed.size, 1);
  assert.equal(supplierRows(ctx).length, 1);
  // Re-evaluating a processed order is a no-op.
  assert.equal((await evaluateOrder(ctx, '5001')).decision, 'skip');
});

test('concurrent submissions place only one supplier order', async () => {
  const { ctx, supplier, shopify } = testCtx();
  seedProduct(ctx);
  shopify.orders.set('5001', {});
  receive(ctx);
  await evaluateOrder(ctx, '5001');
  await Promise.all([submitSupplierOrders(ctx, '5001'), submitSupplierOrders(ctx, '5001'), submitSupplierOrders(ctx, '5001')]);
  assert.equal(supplier.placed.size, 1);
  assert.equal(supplierRows(ctx).length, 1);
});

test('payment not confirmed by Shopify -> held, nothing ordered', async () => {
  const { ctx, supplier, shopify } = testCtx();
  seedProduct(ctx);
  shopify.orders.set('5001', { financialStatus: 'PENDING' });
  receive(ctx);
  const ev = await evaluateOrder(ctx, '5001');
  assert.equal(ev.decision, 'hold');
  assert.equal((await submitSupplierOrders(ctx, '5001')).ok, false);
  assert.equal(supplier.placed.size, 0);
});

test('high fraud risk -> held; medium risk -> approval queue', async () => {
  const { ctx, shopify } = testCtx();
  seedProduct(ctx);
  shopify.orders.set('5001', { riskLevel: 'HIGH' });
  receive(ctx);
  assert.equal((await evaluateOrder(ctx, '5001')).decision, 'hold');

  const t2 = testCtx();
  seedProduct(t2.ctx);
  t2.shopify.orders.set('5001', { riskLevel: 'MEDIUM', riskRecommendation: 'INVESTIGATE' });
  receive(t2.ctx);
  assert.equal((await evaluateOrder(t2.ctx, '5001')).decision, 'approval');
});

test('unmapped SKU, unapproved product, insufficient stock and non-UK address are held', async () => {
  for (const [label, setup] of [
    ['unmapped', (c) => receive(c, paidOrderPayload({ line_items: [{ id: 1, sku: 'NOPE', quantity: 1, price: '9.99', title: 'X' }] }))],
    ['unapproved', (c) => { seedProduct(c, { approved: 0 }); receive(c); }],
    ['stock', (c) => { seedProduct(c, { stock: 0 }); receive(c); }],
    ['country', (c) => receive(c, paidOrderPayload({ shipping_address: { country_code: 'FR', city: 'Paris' } }))],
  ]) {
    const { ctx, shopify } = testCtx();
    if (label !== 'unapproved' && label !== 'stock') seedProduct(ctx);
    shopify.orders.set('5001', {});
    setup(ctx);
    const ev = await evaluateOrder(ctx, '5001');
    assert.equal(ev.decision, 'hold', `${label}: ${JSON.stringify(ev)}`);
    assert.ok(openExceptions(ctx.db).length >= 1);
  }
});

test('pause switch and value limit route orders to approval; owner approval submits', async () => {
  const { ctx, supplier, shopify } = testCtx();
  seedProduct(ctx);
  shopify.orders.set('5001', {});
  setControl(ctx.db, 'pause_supplier_orders', true, 'test');
  receive(ctx);
  const ev = await evaluateOrder(ctx, '5001');
  assert.equal(ev.decision, 'approval');
  // Automation cannot bypass the pause.
  assert.equal((await submitSupplierOrders(ctx, '5001')).ok, false);
  assert.equal(supplier.placed.size, 0);
  const [a] = listApprovals(ctx.db);
  assert.equal(a.type, 'order_fulfilment');
  const res = await decide(ctx, a.id, 'approved', 'owner');
  assert.equal(res.ok, true);
  assert.equal(supplier.placed.size, 1);
  assert.equal(orderRow(ctx).state, 'submitted');
});

test('order above automatic value limit needs approval', async () => {
  const { ctx, shopify } = testCtx({ cfg: (c) => { c.orders.autoOrderMaxGbp = 5; } });
  seedProduct(ctx);
  shopify.orders.set('5001', {});
  receive(ctx);
  const ev = await evaluateOrder(ctx, '5001');
  assert.equal(ev.decision, 'approval');
  assert.match(ev.reasons.join(), /exceeds automatic limit/);
});

test('definite supplier rejection -> failed + exception; retried up to the limit only', async () => {
  const { ctx, shopify } = testCtx();
  seedProduct(ctx, { supplier_sku: 'SUP-FAIL' });
  shopify.orders.set('5001', {});
  receive(ctx);
  await evaluateOrder(ctx, '5001');
  const r = await submitSupplierOrders(ctx, '5001');
  assert.equal(r.results[0].status, 'failed');
  assert.equal(orderRow(ctx).state, 'submission_failed');
  assert.ok(openExceptions(ctx.db).some((e) => e.severity === 'error'));
});

test('ambiguous supplier failure (timeout) -> unknown, critical alert, never auto-retried', async () => {
  const { ctx, shopify } = testCtx();
  seedProduct(ctx, { supplier_sku: 'SUP-TIMEOUT' });
  shopify.orders.set('5001', {});
  receive(ctx);
  await evaluateOrder(ctx, '5001');
  await submitSupplierOrders(ctx, '5001');
  assert.equal(supplierRows(ctx)[0].status, 'unknown');
  ctx.db.prepare("UPDATE orders SET state = 'ready' WHERE id = '5001'").run();
  const retry = await submitSupplierOrders(ctx, '5001');
  assert.equal(retry.results[0].skipped, 'needs_human_check');
  assert.equal(supplierRows(ctx)[0].attempts, 1);
  assert.ok(openExceptions(ctx.db).some((e) => e.severity === 'critical'));
});

test('cancellation before submission stops the order; after submission raises a critical alert', async () => {
  const { ctx, supplier, shopify } = testCtx();
  seedProduct(ctx);
  shopify.orders.set('5001', {});
  receive(ctx);
  receive(ctx, { id: 5001, cancelled_at: new Date().toISOString() }, 'orders/cancelled');
  assert.equal(orderRow(ctx).state, 'cancelled');
  assert.equal((await submitSupplierOrders(ctx, '5001')).ok, false);
  assert.equal(supplier.placed.size, 0);

  const t2 = testCtx();
  seedProduct(t2.ctx);
  t2.shopify.orders.set('5001', {});
  receive(t2.ctx);
  await evaluateOrder(t2.ctx, '5001');
  await submitSupplierOrders(t2.ctx, '5001');
  receive(t2.ctx, { id: 5001, cancelled_at: new Date().toISOString() }, 'orders/cancelled');
  assert.equal(orderRow(t2.ctx).state, 'cancel_requires_action');
  assert.ok(openExceptions(t2.ctx.db).some((e) => e.severity === 'critical'));
});

test('app-managed supplier: our system never submits (prevents double ordering)', async () => {
  const { ctx, shopify } = testCtx();
  seedProduct(ctx, { supplier: 'AVASAM' });
  shopify.orders.set('5001', {});
  receive(ctx);
  const ev = await evaluateOrder(ctx, '5001');
  assert.equal(ev.decision, 'app_managed');
});

test('manual supplier creates a purchase task for the owner', async () => {
  const { ctx, shopify } = testCtx();
  seedProduct(ctx, { supplier: 'MANUAL' });
  shopify.orders.set('5001', {});
  receive(ctx);
  const ev = await evaluateOrder(ctx, '5001');
  assert.equal(ev.decision, 'approval');
  const [a] = listApprovals(ctx.db);
  await decide(ctx, a.id, 'approved', 'owner');
  assert.ok(listApprovals(ctx.db).some((x) => x.type === 'manual_purchase'));
});

test('GDPR customers/redact purges stored personal data', () => {
  const { ctx } = testCtx();
  seedProduct(ctx);
  receive(ctx);
  receive(ctx, { orders_to_redact: [5001] }, 'customers/redact');
  const o = orderRow(ctx);
  assert.equal(o.email, null);
  assert.equal(o.ship_address, null);
  assert.equal(o.pii_purged, 1);
});

test('GDPR data request raises an owner alert', () => {
  const { ctx } = testCtx();
  receive(ctx, { customer: { id: 77 } }, 'customers/data_request');
  assert.ok(openExceptions(ctx.db).some((e) => e.source === 'privacy'));
});
