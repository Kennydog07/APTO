// Tracking synchronisation (Workflow 07). Only tracking numbers that come
// from the supplier are ever used — nothing is generated or guessed.
import { now } from './db.js';
import { raiseException } from './lib/exceptions.js';

const TRACKING_RE = /^[A-Za-z0-9-]{6,40}$/;

export function validTrackingNumber(n) {
  return typeof n === 'string' && TRACKING_RE.test(n.trim());
}

async function pushToShopify(ctx, so, t) {
  const { db, cfg, shopify, log } = ctx;
  const res = await shopify.createFulfilment(so.order_id, { number: t.number, company: t.company, url: t.url ?? null }, cfg.shopify.notifyCustomerOnFulfilment);
  db.prepare(`UPDATE supplier_orders SET tracking_number = ?, tracking_company = ?, tracking_url = ?, tracking_synced = 1,
      status = CASE WHEN ? THEN 'delivered' ELSE 'shipped' END, delivered_at = CASE WHEN ? THEN ? ELSE delivered_at END, updated_at = ? WHERE id = ?`)
    .run(t.number, t.company, t.url ?? null, t.delivered ? 1 : 0, t.delivered ? 1 : 0, now(), now(), so.id);
  const remaining = db.prepare("SELECT COUNT(*) AS c FROM supplier_orders WHERE order_id = ? AND tracking_synced = 0 AND status NOT IN ('app_managed')").get(so.order_id).c;
  db.prepare('UPDATE orders SET state = ?, updated_at = ? WHERE id = ?').run(remaining ? 'partially_shipped' : 'shipped', now(), so.order_id);
  log.info('tracking', 'Tracking synced to Shopify', { orderId: so.order_id, supplier: so.supplier, carrier: t.company });
  return res;
}

/** Poll suppliers for tracking on confirmed orders. */
export async function syncTracking(ctx) {
  const { db, suppliers } = ctx;
  const pending = db.prepare("SELECT * FROM supplier_orders WHERE status = 'confirmed' AND tracking_synced = 0 AND external_id IS NOT NULL").all();
  const out = { checked: 0, synced: 0, overdue: [], errors: [] };
  for (const so of pending) {
    out.checked++;
    try {
      const t = await suppliers.get(so.supplier).getTracking(so.external_id);
      if (t && validTrackingNumber(t.number)) { await pushToShopify(ctx, so, t); out.synced++; }
      else if ((Date.now() - Date.parse(so.created_at)) / 86_400_000 > 3) {
        out.overdue.push(so.order_id);
        raiseException(db, { source: 'tracking', ref: so.order_id, severity: 'warning', message: `No tracking from ${so.supplier} after 3 days for order ${so.order_id}` });
      }
    } catch (e) {
      out.errors.push({ id: so.id, error: e.message });
      raiseException(db, { source: 'tracking', ref: so.order_id, severity: 'warning', message: `Tracking lookup failed for ${so.supplier}: ${e.message}` });
    }
  }
  return out;
}

/** Tracking pushed by a supplier webhook or entered by the owner for a manual order. */
export async function recordTracking(ctx, { orderId, supplier, number, company, url, delivered = false }) {
  const { db } = ctx;
  if (!validTrackingNumber(number)) return { ok: false, error: 'invalid_tracking_number' };
  const so = db.prepare('SELECT * FROM supplier_orders WHERE order_id = ? AND supplier = ?').get(String(orderId), supplier);
  if (!so) return { ok: false, error: 'supplier_order_not_found' };
  if (so.tracking_synced && so.tracking_number === number) return { ok: true, duplicate: true };
  await pushToShopify(ctx, so, { number: number.trim(), company: company || 'Other', url, delivered });
  return { ok: true };
}
