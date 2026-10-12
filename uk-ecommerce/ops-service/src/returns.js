// Returns, cancellations and refund requests (Workflow 14).
// UK consumer law summary used here (owner must confirm with an adviser):
//  * Consumer Contracts Regulations 2013: for distance sales the customer may
//    cancel within 14 days of receiving the goods, then has 14 days to send
//    them back; refund due within 14 days of getting the goods back (or proof
//    of return).
//  * Consumer Rights Act 2015: faulty goods — 30-day short-term right to reject.
// This module NEVER issues refunds. It creates a case and, where a refund may
// be due, an approval for the owner.
import { now } from './db.js';
import { requestApproval } from './lib/approvals.js';
import { raiseException } from './lib/exceptions.js';

const FAULT_RE = /faulty|broken|damaged|defect|doesn'?t work|not working|wrong item|missing part/i;
const DAY = 86_400_000;

export function assessReturn({ reason, deliveredAt, at = new Date() }) {
  const faulty = FAULT_RE.test(reason ?? '');
  const days = deliveredAt ? Math.floor((at - new Date(deliveredAt)) / DAY) : null;
  if (faulty) {
    return { kind: 'faulty', withinWindow: days === null ? null : days <= 30, route: 'review',
      note: days !== null && days <= 30 ? 'Within 30-day short-term right to reject (Consumer Rights Act 2015)' : 'Faulty-goods claim: owner review required' };
  }
  if (days === null) return { kind: 'change_of_mind', withinWindow: null, route: 'review', note: 'Delivery date unknown — owner to confirm eligibility' };
  if (days <= 14) return { kind: 'change_of_mind', withinWindow: true, route: 'instructions', note: `Within 14-day cancellation period (day ${days})` };
  return { kind: 'change_of_mind', withinWindow: false, route: 'review', note: `Outside 14-day cancellation period (day ${days}) — discretionary` };
}

export function createReturnCase(ctx, { orderName, fromEmail, reason }) {
  const { db, cfg, log } = ctx;
  const o = db.prepare('SELECT * FROM orders WHERE name = ?').get(orderName);
  if (!o || !o.email || o.email.toLowerCase() !== String(fromEmail ?? '').toLowerCase()) {
    return { ok: false, error: 'order_not_verified', reply: `To protect your privacy we can only discuss an order with the email address used to buy it. Please reply from that address with your order number.` };
  }
  const delivered = db.prepare('SELECT MAX(delivered_at) AS d FROM supplier_orders WHERE order_id = ?').get(o.id).d;
  const a = assessReturn({ reason, deliveredAt: delivered });
  const status = a.route === 'instructions' ? 'awaiting_return_address' : 'needs_review';
  const info = db.prepare(`INSERT INTO return_cases (order_id, reason, kind, within_cancellation_window, status, notes, created_at, updated_at)
    VALUES (?,?,?,?,?,?,?,?)`).run(o.id, String(reason).slice(0, 2000), a.kind, a.withinWindow === null ? null : a.withinWindow ? 1 : 0, status, a.note, now(), now());
  const caseId = Number(info.lastInsertRowid);
  // Even a clear statutory cancellation needs the supplier's returns address, so the owner confirms it.
  requestApproval(db, { type: 'return_case', ref: String(caseId), summary: `Return case #${caseId} for ${o.name}: ${a.kind} — ${a.note}`, payload: { orderId: o.id, orderTotal: o.total_gbp } });
  if (a.kind === 'faulty') raiseException(db, { source: 'returns', ref: o.id, severity: 'warning', message: `Faulty/damaged report for ${o.name} — check for any safety issue and contact the supplier` });
  log.info('returns', 'Return case created', { caseId, kind: a.kind, route: a.route });
  const sc = cfg.support;
  const reply = a.route === 'instructions'
    ? `Thank you — we have opened return case #${caseId} for order ${o.name}. You are within your 14-day cancellation period. ${sc.returnsAddressNote} We will email the returns address within 2 working days. Once the item is on its way back, your refund will be processed within 14 days of us receiving it or proof of postage.`
    : `Thank you — we have opened case #${caseId} for order ${o.name}. A member of our team will review it and reply within 2 working days.`;
  return { ok: true, caseId, assessment: a, reply: `${reply}\n\nKind regards,\n${sc.storeName} customer care` };
}

/** Owner proposes a refund amount; it is recorded as pending approval only. */
export function proposeRefund(ctx, caseId, amountGbp) {
  const { db } = ctx;
  const c = db.prepare('SELECT * FROM return_cases WHERE id = ?').get(caseId);
  if (!c) return { ok: false, error: 'not_found' };
  db.prepare('UPDATE return_cases SET refund_amount_gbp = ?, status = ?, updated_at = ? WHERE id = ?').run(amountGbp, 'refund_pending_approval', now(), caseId);
  requestApproval(db, { type: 'refund', ref: String(caseId), summary: `Refund £${amountGbp} for return case #${caseId} — issue it in Shopify admin after approving`, payload: { amountGbp } });
  return { ok: true };
}
