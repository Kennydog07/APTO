/**
 * UK consumer rights used by the refund & complaint letter. STATIC CONFIG: the right used, the
 * one-line summary and the next steps come from here, never from the AI.
 * Checked 2026-11-05 against:
 *   Consumer Rights Act 2015 (30-day short-term right to reject; one repair/replacement then refund or
 *   price reduction; 6-month presumption; no deduction in first 6 months except cars):
 *     https://www.which.co.uk/consumer-rights/advice/what-do-i-do-if-i-have-a-faulty-product-aTTEK2g0YuEy
 *     https://www.legislation.gov.uk/ukpga/2015/15/section/22 and /section/24
 *     https://www.gov.uk/accepting-returns-and-giving-refunds (6 months; 6 years, 5 in Scotland)
 *   Delivery within 30 days unless agreed: https://www.legislation.gov.uk/ukpga/2015/15/section/28
 *   Services with reasonable care and skill: https://www.legislation.gov.uk/ukpga/2015/15/section/49
 *   Consumer Contracts Regulations 14-day cancellation (online/phone/mail):
 *     https://www.gov.uk/accepting-returns-and-giving-refunds
 *   Energy: supplier first, 8 weeks or deadlock letter, then Energy Ombudsman (within 12 months of deadlock):
 *     https://www.energyombudsman.org/faqs
 *   Section 75 (credit card, item over £100 up to £30,000), chargeback, PayPal:
 *     https://www.citizensadvice.org.uk/consumer/somethings-gone-wrong-with-a-purchase/getting-your-money-back-if-you-paid-by-card-or-paypal/
 *     https://www.moneyhelper.org.uk/en/everyday-money/credit/how-youre-protected-when-you-pay-by-card
 * Re-check every 6 months (see FACTS_TO_VERIFY.md).
 */
export const CONSUMER_RULES_CHECKED = '2026-11-05';

export type ComplaintType = 'faulty' | 'not_delivered' | 'poor_service' | 'energy_bill';
export type PaymentMethod = 'credit' | 'debit' | 'paypal' | 'other';

export const SHORT_TERM_REJECT_DAYS = 30;
export const PRESUMPTION_MONTHS = 6;
export const CLAIM_LIMIT_YEARS = 6; // 5 in Scotland
export const CCR_CANCEL_DAYS = 14;
export const DELIVERY_DEFAULT_DAYS = 30;
export const ENERGY_WAIT_WEEKS = 8;
export const S75_MIN_EXCLUSIVE = 100;
export const S75_MAX = 30000;
export const REPLY_DAYS = 14;

export type RightKey =
  | 'short_term_reject'
  | 'repair_or_replace'
  | 'final_reject'
  | 'repair_after_6_months'
  | 'possibly_out_of_time'
  | 'non_delivery'
  | 'services'
  | 'energy';

export interface RightChoice {
  key: RightKey;
  /** One line shown to the user, e.g. "You're within 30 days, so you can ask for a full refund." */
  summary: string;
  /** General legal points the letter may rely on (passed to the AI; no section numbers or case law). */
  letterPoints: string[];
  nextSteps: string[];
}

/** Whole days between two ISO dates (UTC noon, so DST can't shift it). */
export function daysBetween(fromIso: string, to: Date): number {
  const [y, m, d] = fromIso.split('-').map(Number);
  const from = Date.UTC(y!, m! - 1, d!, 12);
  const t = Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate(), 12);
  return Math.round((t - from) / 86_400_000);
}

/** True if `to` is within `months` calendar months of the ISO date. */
export function withinMonths(fromIso: string, to: Date, months: number): boolean {
  const [y, m, d] = fromIso.split('-').map(Number);
  const limit = Date.UTC(y!, m! - 1 + months, d!, 12);
  return Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate(), 12) <= limit;
}

export function paymentNote(method: PaymentMethod, price: number): string | null {
  if (method === 'credit' && price > S75_MIN_EXCLUSIVE && price <= S75_MAX)
    return 'You paid by credit card for something costing over £100 and up to £30,000, so you may be able to claim from your card provider under Section 75 of the Consumer Credit Act if the trader won’t put things right.';
  if (method === 'credit' || method === 'debit')
    return 'You paid by card, so you may be able to ask your bank or card provider for a chargeback. Ask soon: banks usually set time limits (often 120 days).';
  if (method === 'paypal')
    return 'You paid by PayPal, so you may be able to use PayPal Buyer Protection. Check PayPal’s time limits.';
  return null;
}

export function chooseRight(v: {
  type: ComplaintType;
  /** Delivery date for goods, or when the service was done / the bill date. */
  date: string;
  boughtOnline: boolean;
  repairAttempted: boolean;
  today: Date;
}): RightChoice {
  const days = daysBetween(v.date, v.today);
  const replyStep = `Give the company ${REPLY_DAYS} days to reply. Keep copies of everything you send and receive.`;
  switch (v.type) {
    case 'faulty': {
      const ccr =
        v.boughtOnline && days <= CCR_CANCEL_DAYS
          ? [
              'Because you bought online, you can also cancel within 14 days of receiving the item for any reason, then return it within a further 14 days.',
            ]
          : [];
      if (days <= SHORT_TERM_REJECT_DAYS)
        return {
          key: 'short_term_reject',
          summary: 'You’re within 30 days, so you can ask for a full refund.',
          letterPoints: [
            'Goods must be of satisfactory quality, fit for purpose and as described.',
            'Within 30 days of delivery the consumer can reject faulty goods for a full refund (the short-term right to reject).',
          ],
          nextSteps: [replyStep, ...ccr],
        };
      if (withinMonths(v.date, v.today, PRESUMPTION_MONTHS)) {
        if (v.repairAttempted)
          return {
            key: 'final_reject',
            summary:
              'A repair or replacement hasn’t fixed it, so you can ask for a full refund or a price reduction.',
            letterPoints: [
              'Goods must be of satisfactory quality, fit for purpose and as described.',
              'After one unsuccessful repair or replacement, the consumer can reject the goods for a refund or keep them with a price reduction.',
              'Within 6 months of delivery, no deduction for use can be made from a refund (except for motor vehicles), and a fault is presumed to have been there at delivery unless the trader proves otherwise.',
            ],
            nextSteps: [replyStep],
          };
        return {
          key: 'repair_or_replace',
          summary:
            'You’re past 30 days but within 6 months: you can ask for a repair or replacement, and the fault is presumed to have been there when it was delivered.',
          letterPoints: [
            'Goods must be of satisfactory quality, fit for purpose and as described.',
            'After 30 days, the trader has one opportunity to repair or replace faulty goods, within a reasonable time and without significant inconvenience; if that fails, the consumer can ask for a refund or price reduction.',
            'Within 6 months of delivery, a fault is presumed to have been there at delivery unless the trader proves otherwise.',
          ],
          nextSteps: [replyStep],
        };
      }
      if (days <= CLAIM_LIMIT_YEARS * 365)
        return {
          key: 'repair_after_6_months',
          summary:
            'You’re past 6 months, so you can still ask for a repair or replacement, but you may need to show the fault was there when it was delivered.',
          letterPoints: [
            'Goods must be of satisfactory quality, fit for purpose and as described, and should last a reasonable time.',
            'The trader has one opportunity to repair or replace faulty goods; if that fails, the consumer can ask for a refund (which may be reduced for use) or a price reduction.',
          ],
          nextSteps: [
            replyStep,
            'An independent report on the fault (for example from a repairer) can help show it was there at delivery.',
          ],
        };
      return {
        key: 'possibly_out_of_time',
        summary:
          'It’s more than 6 years since delivery (5 in Scotland), so you may be out of time to claim. The letter asks politely for a goodwill remedy.',
        letterPoints: ['Ask politely for a goodwill remedy; do not claim a legal right.'],
        nextSteps: [replyStep],
      };
    }
    case 'not_delivered':
      return {
        key: 'non_delivery',
        summary:
          'The trader must deliver by the agreed date, or within 30 days if no date was agreed. If they don’t, you can set a final deadline and then cancel for a full refund.',
        letterPoints: [
          'Unless a delivery time was agreed, goods must be delivered without undue delay and within 30 days of the contract.',
          'If delivery is late, the consumer can set a further reasonable period for delivery and, if the goods still do not arrive, treat the contract as at an end and get a full refund.',
          'Goods remain the trader’s responsibility until they are delivered to the consumer.',
        ],
        nextSteps: [
          replyStep,
          ...(v.boughtOnline
            ? [
                'Because you bought online, you can also cancel the order for any reason until 14 days after delivery.',
              ]
            : []),
        ],
      };
    case 'poor_service':
      return {
        key: 'services',
        summary:
          'Services must be carried out with reasonable care and skill, so you can ask for the work to be put right or for a price reduction.',
        letterPoints: [
          'A service must be performed with reasonable care and skill, and as described.',
          'If it is not, the consumer can require the trader to repeat or fix the service at no extra cost within a reasonable time, or, if that is impossible or not done, ask for a price reduction (which can be up to the full price).',
        ],
        nextSteps: [
          replyStep,
          ...(v.boughtOnline
            ? [
                'If you agreed the service online or by phone, you may also have had 14 days to cancel from the day you agreed it.',
              ]
            : []),
          'If the trader belongs to a trade association, it may have a free complaints or dispute scheme.',
        ],
      };
    case 'energy_bill':
      return {
        key: 'energy',
        summary:
          'Complain to your supplier first. If it isn’t sorted within 8 weeks, or you get a deadlock letter, you can take it to the Energy Ombudsman for free.',
        letterPoints: [
          'This is a formal complaint, and the customer asks for it to be handled under the supplier’s complaints procedure.',
          'If the complaint is not resolved within 8 weeks, or the supplier issues a deadlock letter, the customer can refer it to the Energy Ombudsman.',
        ],
        nextSteps: [
          'Keep paying your usual bills or Direct Debit while the complaint is looked at, unless the supplier agrees otherwise.',
          'If it isn’t sorted after 8 weeks, or the supplier sends a deadlock letter, take it to the Energy Ombudsman (free). After a deadlock letter you have 12 months to do this.',
          'Send meter readings with dates and photos if the bill is based on estimates.',
        ],
      };
  }
}

export const REFUND_DISCLAIMER = 'This is a letter-writing tool, not legal advice.';
