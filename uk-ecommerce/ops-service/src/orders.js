// Order pipeline: verified webhook -> stored order -> validation ->
// (auto | approval | hold) -> idempotent supplier submission -> tracking.
//
// Safety principles:
//  * One supplier order per (Shopify order, supplier), enforced by a UNIQUE
//    constraint and an atomic "claim" update — duplicate webhooks, retries
//    and concurrent workers cannot double-order.
//  * An ambiguous failure (timeout, 5xx) is NEVER retried automatically: the
//    supplier may have accepted it. It becomes a critical exception for a human.
//  * Anything unusual goes to the approval queue rather than proceeding.
import { now, tx } from './db.js';
import { isPaused } from './lib/controls.js';
import { raiseException } from './lib/exceptions.js';
import { requestApproval } from './lib/approvals.js';

const money = (v) => (v === undefined || v === null || v === '' ? null : Math.round(Number(v) * 100) / 100);
const DONE_STATES = new Set(['submitted', 'confirmed', 'awaiting_payment', 'awaiting_manual', 'app_managed', 'shipped', 'delivered']);

/** Keep only what operations need (data minimisation). */
export function extractOrder(p) {
  const a = p.shipping_address ?? {};
  return {
    id: String(p.id),
    name: p.name ?? `#${p.order_number ?? p.id}`,
    email: p.email ?? p.contact_email ?? null,
    created_at: p.created_at ?? now(),
    financial_status: p.financial_status ?? null,
    cancelled_at: p.cancelled_at ?? null,
    currency: p.currency ?? p.presentment_currency ?? null,
    subtotal_gbp: money(p.subtotal_price),
    total_gbp: money(p.total_price),
    tax_gbp: money(p.total_tax),
    shipping_gbp: money(p.total_shipping_price_set?.shop_money?.amount ?? 0),
    ship_country: a.country_code ?? null,
    ship_address: JSON.stringify({ name: a.name, address1: a.address1, address2: a.address2, city: a.city, province: a.province, zip: a.zip, phone: a.phone }),
    tags: Array.isArray(p.tags) ? p.tags.join(',') : (p.tags ?? ''),
    lines: (p.line_items ?? []).map((l) => ({
      line_id: String(l.id), sku: l.sku ?? null, variant_id: l.variant_id ? String(l.variant_id) : null,
      title: l.title ?? l.name ?? '', quantity: Number(l.quantity) || 0, unit_price_gbp: money(l.price),
    })),
  };
}

function upsertOrder(db, o) {
  const existing = db.prepare('SELECT id, state FROM orders WHERE id = ?').get(o.id);
  if (existing) {
    db.prepare(`UPDATE orders SET financial_status = ?, cancelled_at = COALESCE(?, cancelled_at), tags = ?, updated_at = ? WHERE id = ?`)
      .run(o.financial_status, o.cancelled_at, o.tags, now(), o.id);
    return false;
  }
  db.prepare(`INSERT INTO orders (id, name, email, created_at, financial_status, cancelled_at, currency, subtotal_gbp, total_gbp, tax_gbp,
      shipping_gbp, ship_country, ship_address, tags, state, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(o.id, o.name, o.email, o.created_at, o.financial_status, o.cancelled_at, o.currency, o.subtotal_gbp, o.total_gbp, o.tax_gbp,
      o.shipping_gbp, o.ship_country, o.ship_address, o.tags, 'received', now());
  const ins = db.prepare('INSERT OR IGNORE INTO order_lines (order_id, line_id, sku, variant_id, title, quantity, unit_price_gbp) VALUES (?,?,?,?,?,?,?)');
  for (const l of o.lines) ins.run(o.id, l.line_id, l.sku, l.variant_id, l.title, l.quantity, l.unit_price_gbp);
  return true;
}

function setState(db, id, state, reason = null) {
  db.prepare('UPDATE orders SET state = ?, state_reason = ?, updated_at = ? WHERE id = ?').run(state, reason, now(), id);
}

/**
 * Record a verified webhook. Returns { duplicate, created, orderId, topic, forward }.
 * `forward` tells the caller whether n8n should evaluate this order.
 */
export function ingestWebhook(ctx, meta, payload) {
  const { db, log } = ctx;
  return tx(db, () => {
    const seen = db.prepare('INSERT OR IGNORE INTO webhook_events (webhook_id, topic, shop, resource_id, received_at) VALUES (?,?,?,?,?)')
      .run(meta.webhookId, meta.topic ?? 'unknown', meta.shop ?? null, String(payload?.id ?? ''), now());
    if (seen.changes === 0) {
      log.info('webhook', 'Duplicate webhook ignored', { webhookId: meta.webhookId, topic: meta.topic });
      return { duplicate: true };
    }
    const topic = meta.topic;
    if (topic === 'orders/paid' || topic === 'orders/create' || topic === 'orders/updated') {
      const o = extractOrder(payload);
      const created = upsertOrder(db, o);
      return { duplicate: false, created, orderId: o.id, topic, forward: topic === 'orders/paid' };
    }
    if (topic === 'orders/cancelled') {
      const id = String(payload.id);
      const o = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
      if (!o) return { duplicate: false, orderId: id, topic, forward: false };
      db.prepare('UPDATE orders SET cancelled_at = ?, updated_at = ? WHERE id = ?').run(payload.cancelled_at ?? now(), now(), id);
      const placed = db.prepare('SELECT * FROM supplier_orders WHERE order_id = ?').all(id).filter((s) => DONE_STATES.has(s.status) || s.status === 'submitting' || s.status === 'unknown');
      if (placed.length) {
        raiseException(db, { source: 'orders', ref: id, severity: 'critical', message: `Order ${o.name} was cancelled after a supplier order was placed — cancel it with the supplier and check the refund`, details: { suppliers: placed.map((p) => p.supplier) } });
        setState(db, id, 'cancel_requires_action', 'Cancelled after supplier submission');
      } else setState(db, id, 'cancelled', 'Cancelled before supplier submission');
      return { duplicate: false, orderId: id, topic, forward: false };
    }
    if (topic === 'fulfillments/create' || topic === 'orders/fulfilled') {
      const id = String(payload.order_id ?? payload.id);
      if (db.prepare('SELECT 1 FROM orders WHERE id = ?').get(id)) setState(db, id, 'shipped', 'Fulfilment reported by Shopify');
      return { duplicate: false, orderId: id, topic, forward: false };
    }
    if (topic === 'refunds/create') {
      const id = String(payload.order_id);
      raiseException(db, { source: 'refunds', ref: id, severity: 'warning', message: `Refund issued in Shopify for order ${id} — check whether the supplier order needs cancelling` });
      return { duplicate: false, orderId: id, topic, forward: false };
    }
    if (topic === 'customers/data_request') {
      raiseException(db, { source: 'privacy', ref: String(payload?.customer?.id ?? ''), severity: 'error', message: 'Customer data access request received via Shopify — respond within one month (UK GDPR). Export their data from Shopify admin.' });
      return { duplicate: false, topic, forward: false };
    }
    if (topic === 'customers/redact') {
      const ids = (payload.orders_to_redact ?? []).map(String);
      for (const oid of ids) purgeOrderPii(db, oid);
      return { duplicate: false, topic, forward: false };
    }
    return { duplicate: false, topic, forward: false };
  });
}

export function purgeOrderPii(db, orderId) {
  return db.prepare("UPDATE orders SET email = NULL, ship_address = NULL, pii_purged = 1, updated_at = ? WHERE id = ?").run(now(), orderId).changes;
}

function linesWithProducts(db, orderId) {
  return db.prepare(`SELECT l.*, p.title AS product_title, p.supplier, p.supplier_sku, p.supplier_variant_id, p.cost_gbp, p.shipping_gbp,
      p.stock, p.status AS product_status, p.approved
    FROM order_lines l LEFT JOIN products p ON p.sku = l.sku WHERE l.order_id = ?`).all(orderId);
}

function todaysAutoSpend(db) {
  const day = now().slice(0, 10);
  return db.prepare("SELECT COALESCE(SUM(cost_gbp),0) AS s FROM supplier_orders WHERE substr(created_at,1,10) = ? AND status NOT IN ('failed','pending')").get(day).s;
}

/**
 * Validate an order and decide what happens next.
 * decision: auto_submit | approval | hold | exception | app_managed | skip
 */
export async function evaluateOrder(ctx, orderId) {
  const { db, cfg, shopify, suppliers, log } = ctx;
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(String(orderId));
  if (!order) return { decision: 'exception', reasons: ['Order not found in operations database'] };
  if (!['received', 'evaluated_hold'].includes(order.state)) return { decision: 'skip', reasons: [`Order already in state ${order.state}`], state: order.state };

  const reasons = [];
  const hold = (why, severity = 'warning') => {
    setState(db, order.id, 'held', why);
    raiseException(db, { source: 'orders', ref: order.id, severity, message: `Order ${order.name} held: ${why}` });
    log.warn('orders', 'Order held', { order: order.name, why });
    return { decision: 'hold', reasons: [why] };
  };

  // 1–2. Payment status confirmed with Shopify (not just trusted from the webhook body).
  let status;
  try { status = await shopify.getOrderStatus(order.id); } catch (e) {
    raiseException(db, { source: 'shopify', ref: order.id, severity: 'error', message: `Could not confirm payment for ${order.name}: ${e.message}` });
    return { decision: 'exception', reasons: ['Payment status could not be confirmed (will retry)'] };
  }
  if (!status) return hold('Order not found in Shopify');
  if (status.financialStatus !== 'PAID') return hold(`Payment status is ${status.financialStatus}, not PAID`);

  // 3. Cancellation and fraud holds.
  if (status.cancelledAt || order.cancelled_at) { setState(db, order.id, 'cancelled', 'Cancelled'); return { decision: 'skip', reasons: ['Order cancelled'] }; }
  if (status.riskLevel === 'HIGH' || status.riskRecommendation === 'CANCEL') return hold('High fraud risk reported by Shopify', 'error');
  const tags = `${order.tags ?? ''},${(status.tags ?? []).join(',')}`.toLowerCase();
  if (/\bhold\b|do-not-fulfil|manual-review/.test(tags)) return hold('Order tagged for manual review');
  if (order.currency && order.currency !== 'GBP') return hold(`Unexpected currency ${order.currency}`);
  if (!cfg.orders.shipToCountries.includes(order.ship_country)) return hold(`Shipping country ${order.ship_country} is outside the configured delivery area`);

  // 4. SKU -> supplier mapping.
  const lines = linesWithProducts(db, order.id);
  if (!lines.length) return hold('Order has no line items');
  for (const l of lines) {
    if (!l.sku || !l.supplier) return hold(`Line "${l.title}" has no supplier mapping (SKU ${l.sku ?? 'missing'})`, 'error');
    if (!l.approved) return hold(`Product ${l.sku} is not approved for sale`, 'error');
    if (!l.supplier_sku) return hold(`Product ${l.sku} has no supplier SKU`, 'error');
  }

  // 5. Inventory.
  for (const l of lines) {
    if (l.stock !== null && l.stock < l.quantity) return hold(`Insufficient supplier stock for ${l.sku} (have ${l.stock}, need ${l.quantity})`, 'error');
  }

  const groups = {};
  for (const l of lines) (groups[l.supplier] ??= []).push(l);
  const cost = lines.reduce((s, l) => s + l.quantity * ((l.cost_gbp ?? 0) + (l.shipping_gbp ?? 0)), 0);
  const modes = Object.keys(groups).map((s) => suppliers.get(s).mode);

  if (modes.every((m) => m === 'app_managed')) {
    setState(db, order.id, 'ready', 'Supplier app places order');
    return { decision: 'app_managed', reasons: ['Supplier app handles order placement'], suppliers: Object.keys(groups), estimatedCostGbp: cost };
  }

  // 6. Approval rules.
  if (isPaused(db, 'pause_supplier_orders')) reasons.push('Automatic supplier orders are paused');
  if (modes.includes('manual')) reasons.push('Supplier requires manual purchase');
  if (cost > cfg.orders.autoOrderMaxGbp) reasons.push(`Supplier cost £${cost.toFixed(2)} exceeds automatic limit £${cfg.orders.autoOrderMaxGbp}`);
  if (todaysAutoSpend(db) + cost > cfg.orders.dailyAutoOrderCapGbp) reasons.push('Daily automatic supplier-spend cap would be exceeded');
  if (status.riskLevel === 'MEDIUM' || status.riskRecommendation === 'INVESTIGATE') reasons.push('Medium fraud risk — Shopify recommends investigating');

  if (reasons.length) {
    setState(db, order.id, 'awaiting_approval', reasons.join('; '));
    requestApproval(db, { type: 'order_fulfilment', ref: order.id, summary: `Order ${order.name} (£${order.total_gbp}) — ${reasons.join('; ')}`, payload: { estimatedCostGbp: Math.round(cost * 100) / 100, suppliers: Object.keys(groups) } });
    return { decision: 'approval', reasons, estimatedCostGbp: cost };
  }
  setState(db, order.id, 'ready', 'Validated for automatic submission');
  return { decision: 'auto_submit', reasons: ['All checks passed'], suppliers: Object.keys(groups), estimatedCostGbp: cost };
}

/**
 * Submit supplier orders for a validated order. Safe to call repeatedly.
 * @param {{ approvedBy?: string }} opts  owner approval bypasses the pause/limits
 */
export async function submitSupplierOrders(ctx, orderId, { approvedBy = null } = {}) {
  const { db, cfg, suppliers, log } = ctx;
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(String(orderId));
  if (!order) return { ok: false, error: 'order_not_found' };
  if (order.cancelled_at) return { ok: false, error: 'order_cancelled' };
  const allowed = approvedBy ? ['ready', 'awaiting_approval', 'approved', 'submitting', 'partially_submitted'] : ['ready', 'submitting', 'partially_submitted'];
  if (!allowed.includes(order.state)) return { ok: false, error: `order_state_${order.state}` };
  if (!approvedBy && isPaused(db, 'pause_supplier_orders')) return { ok: false, error: 'supplier_orders_paused' };

  const lines = linesWithProducts(db, order.id);
  const groups = {};
  for (const l of lines) (groups[l.supplier] ??= []).push(l);
  const address = order.ship_address ? JSON.parse(order.ship_address) : null;
  const results = [];

  for (const [supplier, glines] of Object.entries(groups)) {
    const adapter = suppliers.get(supplier);
    const key = `${order.id}:${supplier}`;
    const cost = glines.reduce((s, l) => s + l.quantity * ((l.cost_gbp ?? 0) + (l.shipping_gbp ?? 0)), 0);
    db.prepare(`INSERT OR IGNORE INTO supplier_orders (order_id, supplier, idempotency_key, status, cost_gbp, created_at, updated_at)
      VALUES (?,?,?,?,?,?,?)`).run(order.id, supplier, key, 'pending', Math.round(cost * 100) / 100, now(), now());
    const row = db.prepare('SELECT * FROM supplier_orders WHERE idempotency_key = ?').get(key);

    if (DONE_STATES.has(row.status)) { results.push({ supplier, status: row.status, skipped: 'already_submitted', externalId: row.external_id }); continue; }
    if (row.status === 'unknown') { results.push({ supplier, status: 'unknown', skipped: 'needs_human_check' }); continue; }
    if (row.status === 'submitting') {
      const age = (Date.now() - Date.parse(row.claimed_at)) / 60_000;
      if (age > cfg.orders.submitStaleMinutes) {
        db.prepare("UPDATE supplier_orders SET status = 'unknown', updated_at = ? WHERE id = ?").run(now(), row.id);
        raiseException(db, { source: 'fulfilment', ref: order.id, severity: 'critical', message: `Supplier submission for ${order.name} (${supplier}) stalled — check the supplier account before retrying` });
      }
      results.push({ supplier, status: 'submitting', skipped: 'in_progress' });
      continue;
    }
    if (row.status === 'failed' && row.attempts >= cfg.orders.maxSubmitAttempts) {
      results.push({ supplier, status: 'failed', skipped: 'max_attempts' });
      continue;
    }
    // Atomic claim: only one caller can move pending/failed -> submitting.
    const claim = db.prepare("UPDATE supplier_orders SET status = 'submitting', claimed_at = ?, attempts = attempts + 1, updated_at = ? WHERE id = ? AND status IN ('pending','failed')")
      .run(now(), now(), row.id);
    if (claim.changes !== 1) { results.push({ supplier, skipped: 'claimed_elsewhere' }); continue; }

    try {
      const r = await adapter.submitOrder({ idempotencyKey: key, order, lines: glines, address });
      const st = r.status === 'confirmed' ? 'confirmed' : r.status; // awaiting_payment | awaiting_manual | app_managed
      db.prepare('UPDATE supplier_orders SET status = ?, external_id = ?, last_error = NULL, updated_at = ? WHERE id = ?').run(st, r.externalId ?? null, now(), row.id);
      if (st === 'awaiting_manual') {
        requestApproval(db, { type: 'manual_purchase', ref: key, summary: `Place ${supplier} order for ${order.name}: ${glines.map((l) => `${l.quantity} × ${l.supplier_sku}`).join(', ')}`, payload: { orderName: order.name, supplier, lines: glines.map((l) => ({ supplierSku: l.supplier_sku, qty: l.quantity })) } });
      }
      if (st === 'awaiting_payment') {
        requestApproval(db, { type: 'supplier_payment', ref: key, summary: `Pay ${supplier} order ${r.externalId} for ${order.name} (est. £${cost.toFixed(2)})`, payload: { externalId: r.externalId } });
      }
      log.info('fulfilment', 'Supplier order recorded', { order: order.name, supplier, status: st, externalId: r.externalId, approvedBy });
      results.push({ supplier, status: st, externalId: r.externalId ?? null, duplicate: Boolean(r.duplicate) });
    } catch (e) {
      const definite = e.definite === true;
      db.prepare('UPDATE supplier_orders SET status = ?, last_error = ?, updated_at = ? WHERE id = ?').run(definite ? 'failed' : 'unknown', String(e.message).slice(0, 500), now(), row.id);
      raiseException(db, {
        source: 'fulfilment', ref: order.id, severity: definite ? 'error' : 'critical',
        message: definite ? `Supplier ${supplier} rejected order ${order.name}: ${e.message}` : `Supplier ${supplier} outcome unknown for ${order.name} — verify in supplier account; automatic retry disabled`,
      });
      log.error('fulfilment', 'Supplier submission failed', { order: order.name, supplier, definite, error: e.message });
      results.push({ supplier, status: definite ? 'failed' : 'unknown', error: e.message });
    }
  }
  const states = db.prepare('SELECT status FROM supplier_orders WHERE order_id = ?').all(order.id).map((r) => r.status);
  const allDone = states.length && states.every((s) => DONE_STATES.has(s));
  setState(db, order.id, allDone ? 'submitted' : states.some((s) => DONE_STATES.has(s)) ? 'partially_submitted' : 'submission_failed', null);
  return { ok: allDone, orderId: order.id, results };
}

export function listOrders(db, { state, limit = 50 } = {}) {
  const cols = 'id, name, created_at, financial_status, total_gbp, state, state_reason, updated_at';
  return state ? db.prepare(`SELECT ${cols} FROM orders WHERE state = ? ORDER BY created_at DESC LIMIT ?`).all(state, limit)
    : db.prepare(`SELECT ${cols} FROM orders ORDER BY created_at DESC LIMIT ?`).all(limit);
}

/** Orders that arrived but were never evaluated (e.g. n8n was down). */
export function pendingEvaluation(db, olderThanMinutes = 5) {
  const cutoff = new Date(Date.now() - olderThanMinutes * 60_000).toISOString();
  return db.prepare("SELECT id, name FROM orders WHERE state = 'received' AND financial_status = 'paid' AND updated_at < ?").all(cutoff);
}
