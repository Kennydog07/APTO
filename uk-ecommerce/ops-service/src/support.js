// Customer support automation (Workflow 08).
//  * Escalation keywords always win over everything else.
//  * Order details are only disclosed when the sender's email matches the
//    email on that order — never to anyone else.
//  * Replies are built from verified facts; the optional AI step may only
//    rephrase those facts, and is rejected if it introduces any new number.
import { now } from './db.js';

const ESCALATE_RULES = [
  ['chargeback', /charge ?back|dispute (the|this) (payment|charge)|paypal (claim|dispute)|bank (claim|dispute)/i],
  ['legal', /solicitor|lawyer|legal action|trading standards|small claims|court|ombudsman|consumer rights act/i],
  ['safety', /injur|burn|fire|smok|sharp edge|cut (me|my)|hurt|unsafe|dangerous|choking|allergic|recall/i],
  ['fraud', /fraud|didn'?t (place|make) (this|the|an) order|unauthori[sz]ed|stolen card|scam/i],
  ['damaged_missing', /damaged|broken|missing (item|part|parcel)|never (arrived|received|came)|(says|shows|marked as) delivered but|wrong item|faulty|defect/i],
  ['refund_request', /refund|money back|reimburse/i],
  ['complaint', /complain|unacceptable|disgusted|terrible service|formal complaint/i],
];
const ROUTINE_RULES = [
  ['change_address', /change (my |the )?(delivery |shipping )?address|wrong address|update (my )?address/i],
  ['cancel_order', /cancel/i],
  ['return_howto', /return|send (it )?back|exchange/i],
  ['order_status', /where is my order|order status|(hasn'?t|has not|not yet|still not) (arrived|come|turned up)|has (my order|it) (shipped|been dispatched|dispatched)|tracking|track my|dispatch/i],
  ['delivery_time', /how long|when will|delivery time|arrive|estimated delivery/i],
  ['product_info', /dimension|size|measure|how (big|wide|tall|deep)|material|made of|weight|fit/i],
];

export function classify(text) {
  for (const [cat, re] of ESCALATE_RULES) if (re.test(text)) return { category: cat, escalate: true };
  for (const [cat, re] of ROUTINE_RULES) if (re.test(text)) return { category: cat, escalate: false };
  return { category: 'other', escalate: false };
}

export function extractOrderName(text) {
  const m = text.match(/#\s?(\d{3,10})\b/) || text.match(/\border(?:\s+(?:number|no\.?|ref))?\s*[:#]?\s*(\d{3,10})\b/i);
  return m ? `#${m[1]}` : null;
}

const STATUS_TEXT = {
  received: 'we have received your order and it is being prepared for our supplier',
  ready: 'your order has been checked and is being passed to our supplier',
  awaiting_approval: 'your order is being checked by our team before it is passed to our supplier',
  submitted: 'your order has been placed with our UK supplier and is awaiting dispatch',
  partially_submitted: 'part of your order has been placed with our supplier',
  shipped: 'your order has been dispatched',
  partially_shipped: 'part of your order has been dispatched',
  delivered: 'the carrier reports your order as delivered',
};

function orderFacts(db, orderName, fromEmail) {
  const o = db.prepare('SELECT * FROM orders WHERE name = ?').get(orderName);
  if (!o || !o.email || !fromEmail || o.email.trim().toLowerCase() !== fromEmail.trim().toLowerCase()) return null;
  const tracking = db.prepare('SELECT supplier, tracking_number, tracking_company, tracking_url FROM supplier_orders WHERE order_id = ? AND tracking_number IS NOT NULL').all(o.id);
  return { order: o, tracking };
}

function templateReply(category, ctx, facts) {
  const sc = ctx.cfg.support;
  const sign = `\n\nKind regards,\n${sc.storeName} customer care`;
  if (category === 'order_status' || category === 'delivery_time') {
    if (!facts) {
      return `Thank you for getting in touch. To protect your privacy we can only share order details with the email address used to place the order. Please reply from that address and include your order number (it starts with #, for example #1001).${sign}`;
    }
    const st = STATUS_TEXT[facts.order.state] ?? 'your order is being processed';
    let msg = `Thank you for your message about order ${facts.order.name}. Our records show that ${st}.`;
    for (const t of facts.tracking) {
      msg += `\n\nTracking (${t.tracking_company}): ${t.tracking_number}${t.tracking_url ? `\n${t.tracking_url}` : ''}`;
    }
    if (!facts.tracking.length) msg += ` ${sc.dispatchStatement} You will receive an email with tracking as soon as our supplier provides it.`;
    return msg + sign;
  }
  if (category === 'return_howto') {
    return `Thank you for getting in touch. You can cancel your order for any reason within ${sc.cancellationDays} days of receiving it, under the Consumer Contracts Regulations. ${sc.returnsAddressNote} Please reply with your order number and the item(s) you would like to return, and we will send full instructions. Our full returns policy is here: ${sc.returnsPolicyUrl}.${sign}`;
  }
  return null;
}

function productReply(db, text, sc) {
  const products = db.prepare("SELECT title, specs, delivery_estimate FROM products WHERE approved = 1 AND status = 'active' AND specs IS NOT NULL").all();
  const words = text.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
  let best = null, bestHits = 0;
  for (const p of products) {
    const hits = words.filter((w) => p.title.toLowerCase().includes(w)).length;
    if (hits > bestHits) { best = p; bestHits = hits; }
  }
  if (!best || bestHits < 2) return null;
  return `Thank you for your question about the ${best.title}. The supplier's specifications are:\n\n${best.specs}\n\nIf you need anything else, just reply to this email.\n\nKind regards,\n${sc.storeName} customer care`;
}

// Hallucination guard: every number in the AI text must appear as a whole
// number token in the facts (substring matches are not enough).
export function introducesNewNumbers(aiText, factsText) {
  const tokens = (t) => (t.match(/\d+(?:[.,:/-]\d+)*/g) ?? []);
  const known = new Set(tokens(factsText));
  return tokens(aiText).some((n) => !known.has(n));
}

export async function handleEnquiry(ctx, msg) {
  const { db, cfg, ai, log } = ctx;
  if (msg.messageId) {
    const dup = db.prepare('SELECT * FROM support_tickets WHERE message_id = ?').get(msg.messageId);
    if (dup) return { duplicate: true, ticketId: dup.id, action: 'none' };
  }
  const text = `${msg.subject ?? ''}\n${msg.body ?? ''}`;
  const { category, escalate } = classify(text);
  const orderName = extractOrderName(text);
  const facts = orderName ? orderFacts(db, orderName, msg.fromEmail) : null;
  const sc = cfg.support;
  const acknowledgement = `Thank you for contacting ${sc.storeName}. We have received your message and a member of our team will reply personally within 2 working days.\n\nKind regards,\n${sc.storeName} customer care`;

  let action = 'escalate';
  let reply = null;
  if (!escalate && sc.autoReplyCategories.includes(category)) {
    reply = category === 'product_info' ? productReply(db, text, sc) : templateReply(category, ctx, facts);
    if (reply) action = 'auto_reply';
  }

  // Optional AI polish of an already-correct template (never for escalations).
  if (action === 'auto_reply' && ai?.enabled) {
    const r = await ai.draft({
      purpose: 'support_reply',
      system: 'You rewrite customer-service emails for a UK online shop in warm, concise British English. Use ONLY the facts in the draft. Do not add promises, dates, prices, numbers, discounts or apologies for things not in the draft. Output only the email text.',
      prompt: `Customer message:\n${text.slice(0, 2000)}\n\nApproved draft reply (facts are fixed):\n${reply}`,
    });
    if (r.text && !introducesNewNumbers(r.text, reply)) reply = r.text;
  }

  const status = action === 'auto_reply' ? 'auto_replied' : 'escalated';
  const info = db.prepare(`INSERT INTO support_tickets (message_id, channel, from_email, subject, body, category, order_name, verified, draft_reply, status, created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)`).run(msg.messageId ?? null, msg.channel ?? 'email', msg.fromEmail ?? null, (msg.subject ?? '').slice(0, 300),
    (msg.body ?? '').slice(0, 5000), category, orderName, facts ? 1 : 0, reply, status, now());
  log.info('support', 'Enquiry handled', { ticket: Number(info.lastInsertRowid), category, action, verified: Boolean(facts) });
  return { ticketId: Number(info.lastInsertRowid), category, verified: Boolean(facts), action, reply, acknowledgement: action === 'escalate' ? acknowledgement : null };
}
