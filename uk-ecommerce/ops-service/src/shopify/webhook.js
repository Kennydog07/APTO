// Shopify webhook verification. Shopify signs the *raw* request body with
// HMAC-SHA256 using the app's client secret and sends it base64-encoded in
// X-Shopify-Hmac-Sha256. We must verify against the exact bytes received.
import { createHmac, timingSafeEqual } from 'node:crypto';

export function computeHmac(rawBody, secret) {
  return createHmac('sha256', secret).update(rawBody).digest('base64');
}

export function verifyShopifyHmac(rawBody, headerValue, secret) {
  if (!secret || !headerValue || !rawBody) return false;
  const expected = Buffer.from(computeHmac(rawBody, secret), 'utf8');
  const given = Buffer.from(String(headerValue), 'utf8');
  if (expected.length !== given.length) return false;
  return timingSafeEqual(expected, given);
}

/**
 * Full request check. Returns { ok, status, error?, meta? }.
 * - HMAC must match.
 * - Shop domain must match the configured store (prevents cross-store replay).
 * - Webhook ID is required for idempotency.
 */
export function checkWebhookRequest({ rawBody, headers, secret, expectedShop }) {
  const h = (k) => headers[k.toLowerCase()];
  if (!verifyShopifyHmac(rawBody, h('x-shopify-hmac-sha256'), secret)) {
    return { ok: false, status: 401, error: 'invalid_hmac' };
  }
  const shop = h('x-shopify-shop-domain');
  if (expectedShop && shop !== expectedShop) return { ok: false, status: 401, error: 'unexpected_shop' };
  const webhookId = h('x-shopify-webhook-id') || h('x-shopify-event-id');
  if (!webhookId) return { ok: false, status: 400, error: 'missing_webhook_id' };
  return {
    ok: true,
    status: 200,
    meta: { webhookId, topic: h('x-shopify-topic'), shop, triggeredAt: h('x-shopify-triggered-at') },
  };
}
