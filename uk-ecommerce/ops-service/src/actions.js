// What happens when the owner approves or rejects something.
import { now } from './db.js';
import { decideApproval } from './lib/approvals.js';
import { raiseException } from './lib/exceptions.js';
import { submitSupplierOrders } from './orders.js';
import { publishApprovedProduct, applyApprovedPrice } from './catalogue.js';

export async function decide(ctx, id, decision, by) {
  const { db, log } = ctx;
  const a = decideApproval(db, id, decision, by);
  if (!a) return { ok: false, error: 'not_found' };
  if (a.status !== decision) return { ok: false, error: 'already_decided', approval: a };
  const payload = a.payload ? JSON.parse(a.payload) : {};
  let result = { ok: true };
  const approved = decision === 'approved';

  switch (a.type) {
    case 'order_fulfilment':
      if (approved) {
        db.prepare("UPDATE orders SET state = 'approved', updated_at = ? WHERE id = ? AND state = 'awaiting_approval'").run(now(), a.ref);
        result = await submitSupplierOrders(ctx, a.ref, { approvedBy: by });
      } else {
        db.prepare("UPDATE orders SET state = 'rejected_by_owner', updated_at = ? WHERE id = ?").run(now(), a.ref);
        raiseException(db, { source: 'orders', ref: a.ref, severity: 'warning', message: `Order ${a.ref} rejected — cancel and refund it in Shopify admin so the customer is not left waiting` });
      }
      break;
    case 'manual_purchase':
    case 'supplier_payment':
      if (approved) db.prepare("UPDATE supplier_orders SET status = 'confirmed', external_id = COALESCE(external_id, 'manual'), updated_at = ? WHERE idempotency_key = ?").run(now(), a.ref);
      else raiseException(db, { source: 'fulfilment', ref: a.ref, severity: 'error', message: `Supplier order ${a.ref} not placed/paid by owner — the customer order is still open` });
      break;
    case 'product_publication':
      if (approved) result = await publishApprovedProduct(ctx, a.ref);
      break;
    case 'price_change':
      if (approved) result = await applyApprovedPrice(ctx, a.ref, payload.proposedPrice);
      else db.prepare("UPDATE price_changes SET status = 'rejected' WHERE sku = ? AND status = 'pending_approval'").run(a.ref);
      break;
    case 'return_case':
      db.prepare('UPDATE return_cases SET status = ?, updated_at = ? WHERE id = ?').run(approved ? 'approved_send_instructions' : 'declined_review_reply', now(), Number(a.ref));
      break;
    case 'refund':
      db.prepare('UPDATE return_cases SET status = ?, updated_at = ? WHERE id = ?').run(approved ? 'refund_approved_issue_in_shopify' : 'refund_declined', now(), Number(a.ref));
      break;
    default:
      break;
  }
  log.info('approvals', 'Decision recorded', { id, type: a.type, ref: a.ref, decision, by });
  return { ...result, approval: a };
}
