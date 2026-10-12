import { test } from 'node:test';
import assert from 'node:assert/strict';
import { syncInventory, runPricingMonitor, prepareCandidate } from '../src/catalogue.js';
import { syncTracking, recordTracking } from '../src/tracking.js';
import { ingestWebhook, evaluateOrder, submitSupplierOrders } from '../src/orders.js';
import { setControl } from '../src/lib/controls.js';
import { listApprovals } from '../src/lib/approvals.js';
import { decide } from '../src/actions.js';
import { testCtx, seedProduct, paidOrderPayload } from './helpers.js';

const product = (ctx, sku = 'SKU-1') => ctx.db.prepare('SELECT * FROM products WHERE sku = ?').get(sku);

test('stock drops to zero -> product paused in Shopify; stock returns -> restored', async () => {
  const { ctx, supplier, shopify } = testCtx();
  seedProduct(ctx);
  supplier.setStock('SUP-1', 0, 6, 2.5);
  const s1 = await syncInventory(ctx);
  assert.deepEqual(s1.paused, ['SKU-1']);
  assert.equal(product(ctx).status, 'paused_stock');
  assert.ok(shopify.calls.some((c) => c.op === 'setProductStatus' && c.args[1] === 'DRAFT'));
  supplier.setStock('SUP-1', 12, 6, 2.5);
  const s2 = await syncInventory(ctx);
  assert.deepEqual(s2.restored, ['SKU-1']);
  assert.equal(product(ctx).status, 'active');
  assert.equal(product(ctx).stock, 12);
});

test('restock does not republish while product publication is paused', async () => {
  const { ctx, supplier } = testCtx();
  seedProduct(ctx, { status: 'paused_stock' });
  setControl(ctx.db, 'pause_product_publication', true, 't');
  supplier.setStock('SUP-1', 12, 6, 2.5);
  await syncInventory(ctx);
  assert.equal(product(ctx).status, 'paused_stock');
});

test('pricing monitor: small cost rise auto-adjusts within limit; big rise needs approval; approval applies', async () => {
  const { ctx, supplier, shopify } = testCtx();
  seedProduct(ctx, { price_gbp: 19.99, cost_gbp: 6.5, shipping_gbp: 2.5 });
  supplier.setStock('SUP-1', 20, 10, 2.5); // modest rise
  await runPricingMonitor(ctx);
  const p1 = product(ctx);
  assert.ok(p1.price_gbp > 19.99 && p1.price_gbp <= 19.99 * 1.1 + 0.01, `price ${p1.price_gbp}`);
  assert.ok(shopify.calls.some((c) => c.op === 'setVariantPrice'));

  supplier.setStock('SUP-1', 20, 13, 2.5); // large rise
  await runPricingMonitor(ctx);
  const a = listApprovals(ctx.db).find((x) => x.type === 'price_change');
  assert.ok(a, 'approval expected');
  const before = product(ctx).price_gbp;
  await decide(ctx, a.id, 'approved', 'owner');
  assert.ok(product(ctx).price_gbp > before);
});

test('pricing monitor never changes price while price changes are paused', async () => {
  const { ctx, supplier, shopify } = testCtx();
  seedProduct(ctx, { price_gbp: 19.99, cost_gbp: 6.5 });
  setControl(ctx.db, 'pause_price_changes', true, 't');
  supplier.setStock('SUP-1', 20, 10, 2.5);
  await runPricingMonitor(ctx);
  assert.equal(product(ctx).price_gbp, 19.99);
  assert.ok(!shopify.calls.some((c) => c.op === 'setVariantPrice'));
  assert.ok(listApprovals(ctx.db).some((x) => x.type === 'price_change'));
});

test('negative margin pauses the product', async () => {
  const { ctx, supplier } = testCtx();
  seedProduct(ctx);
  supplier.setStock('SUP-1', 20, 40, 2.5);
  await runPricingMonitor(ctx);
  assert.equal(product(ctx).status, 'paused_margin');
});

test('candidate approval: draft created, publication waits for owner, respects publication pause', async () => {
  const { ctx, shopify } = testCtx();
  const row = { candidate_id: 'C9', product_name: 'Over-door hooks', category: 'Home organisation', supplier_code: 'MOCK', supplier_sku: 'S9',
    supplier_cost_gbp: '4', shipping_cost_gbp: '2', est_selling_price_gbp: '16.99', cost_verified: 'yes', stock_verified: 'yes', uk_warehouse: 'yes',
    tracked_delivery: 'yes', supplier_api: 'yes', uk_delivery_estimate: '2-3 working days (supplier)', imagery_rights: 'yes', safety_risk: 'low', returns_risk: 'low',
    demand_score: '6', marketing_score: '7', repeat_score: '4' };
  const r = await prepareCandidate(ctx, row);
  assert.equal(r.ok, true);
  assert.ok(shopify.calls.some((c) => c.op === 'createDraftProduct'));
  assert.equal(product(ctx, 'C9').approved, 0);
  const a = listApprovals(ctx.db).find((x) => x.type === 'product_publication');
  setControl(ctx.db, 'pause_product_publication', true, 't');
  const blocked = await decide(ctx, a.id, 'approved', 'owner');
  assert.equal(blocked.error, 'product_publication_paused');
  const bad = await prepareCandidate(ctx, { ...row, candidate_id: 'C10', cost_verified: 'no' });
  assert.equal(bad.ok, false);
});

async function submittedOrder() {
  const t = testCtx();
  seedProduct(t.ctx);
  t.shopify.orders.set('5001', {});
  ingestWebhook(t.ctx, { webhookId: 'w', topic: 'orders/paid' }, paidOrderPayload());
  await evaluateOrder(t.ctx, '5001');
  await submitSupplierOrders(t.ctx, '5001');
  return t;
}

test('tracking from supplier is synced to Shopify once and the order marked shipped', async () => {
  const { ctx, supplier, shopify } = await submittedOrder();
  const so = ctx.db.prepare('SELECT * FROM supplier_orders').get();
  const none = await syncTracking(ctx);
  assert.equal(none.synced, 0); // no tracking yet -> nothing invented
  supplier.setTracking(so.external_id, { number: 'RM123456789GB', company: 'Royal Mail', url: 'https://www.royalmail.com/track-your-item' });
  const r = await syncTracking(ctx);
  assert.equal(r.synced, 1);
  const f = shopify.calls.filter((c) => c.op === 'createFulfilment');
  assert.equal(f.length, 1);
  assert.equal(f[0].args[1].number, 'RM123456789GB');
  assert.equal(ctx.db.prepare("SELECT state FROM orders WHERE id = '5001'").get().state, 'shipped');
  await syncTracking(ctx);
  assert.equal(shopify.calls.filter((c) => c.op === 'createFulfilment').length, 1);
});

test('manually entered tracking is validated; duplicates ignored', async () => {
  const { ctx } = await submittedOrder();
  assert.equal((await recordTracking(ctx, { orderId: '5001', supplier: 'MOCK', number: 'bad no!', company: 'X' })).ok, false);
  assert.equal((await recordTracking(ctx, { orderId: '5001', supplier: 'MOCK', number: 'DPD-12345678', company: 'DPD' })).ok, true);
  assert.equal((await recordTracking(ctx, { orderId: '5001', supplier: 'MOCK', number: 'DPD-12345678', company: 'DPD' })).duplicate, true);
});
