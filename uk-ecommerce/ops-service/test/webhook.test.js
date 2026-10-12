import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { computeHmac, verifyShopifyHmac, checkWebhookRequest } from '../src/shopify/webhook.js';
import { createApp } from '../src/app.js';
import { testCtx, seedProduct, paidOrderPayload, SECRET, SHOP } from './helpers.js';

test('HMAC: valid signature verifies, tampered body and wrong secret fail', () => {
  const body = Buffer.from('{"id":1}');
  const sig = computeHmac(body, SECRET);
  assert.equal(verifyShopifyHmac(body, sig, SECRET), true);
  assert.equal(verifyShopifyHmac(Buffer.from('{"id":2}'), sig, SECRET), false);
  assert.equal(verifyShopifyHmac(body, sig, 'other-secret'), false);
  assert.equal(verifyShopifyHmac(body, '', SECRET), false);
  assert.equal(verifyShopifyHmac(body, sig, ''), false);
});

test('Webhook check rejects wrong shop and missing webhook id', () => {
  const raw = Buffer.from('{}');
  const h = { 'x-shopify-hmac-sha256': computeHmac(raw, SECRET), 'x-shopify-shop-domain': 'evil.myshopify.com', 'x-shopify-webhook-id': 'w1' };
  assert.equal(checkWebhookRequest({ rawBody: raw, headers: h, secret: SECRET, expectedShop: SHOP }).error, 'unexpected_shop');
  const h2 = { ...h, 'x-shopify-shop-domain': SHOP, 'x-shopify-webhook-id': undefined };
  assert.equal(checkWebhookRequest({ rawBody: raw, headers: h2, secret: SECRET, expectedShop: SHOP }).error, 'missing_webhook_id');
});

async function withServer(ctx, fn) {
  const server = createServer(createApp(ctx));
  await new Promise((r) => server.listen(0, r));
  const base = `http://127.0.0.1:${server.address().port}`;
  try { return await fn(base); } finally { server.close(); }
}

function post(base, payload, { id = 'wh-1', topic = 'orders/paid', secret = SECRET } = {}) {
  const raw = JSON.stringify(payload);
  return fetch(`${base}/webhooks/shopify`, { method: 'POST', body: raw, headers: {
    'Content-Type': 'application/json', 'X-Shopify-Hmac-Sha256': computeHmac(Buffer.from(raw), secret),
    'X-Shopify-Shop-Domain': SHOP, 'X-Shopify-Topic': topic, 'X-Shopify-Webhook-Id': id } });
}

test('HTTP: verified paid-order webhook is stored once; duplicate delivery is ignored; forged one rejected', async () => {
  const { ctx } = testCtx();
  seedProduct(ctx);
  await withServer(ctx, async (base) => {
    const r1 = await post(base, paidOrderPayload());
    assert.equal(r1.status, 200);
    assert.equal((await r1.json()).duplicate, false);
    const r2 = await post(base, paidOrderPayload());
    assert.equal((await r2.json()).duplicate, true);
    const forged = await post(base, paidOrderPayload({ id: 6000 }), { id: 'wh-2', secret: 'attacker' });
    assert.equal(forged.status, 401);
  });
  assert.equal(ctx.db.prepare('SELECT COUNT(*) AS c FROM orders').get().c, 1);
  assert.equal(ctx.db.prepare('SELECT COUNT(*) AS c FROM order_lines').get().c, 1);
});

test('HTTP: same order re-sent with a NEW webhook id does not duplicate the order', async () => {
  const { ctx } = testCtx();
  seedProduct(ctx);
  await withServer(ctx, async (base) => {
    await post(base, paidOrderPayload(), { id: 'a' });
    await post(base, paidOrderPayload(), { id: 'b' });
  });
  assert.equal(ctx.db.prepare('SELECT COUNT(*) AS c FROM orders').get().c, 1);
  assert.equal(ctx.db.prepare('SELECT COUNT(*) AS c FROM order_lines').get().c, 1);
});
