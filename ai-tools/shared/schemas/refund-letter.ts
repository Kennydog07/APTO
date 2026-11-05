import { z } from 'zod';

/** Form inputs for the refund & complaint letter tool. Validated in the browser AND in create-job. */

export const COMPLAINT_TYPES = {
  faulty: 'Faulty or not as described',
  not_delivered: 'Not delivered',
  poor_service: 'Poor service or workmanship',
  energy_bill: 'Wrong energy bill',
} as const;
export type ComplaintTypeKey = keyof typeof COMPLAINT_TYPES;

export const OUTCOMES = {
  refund: 'A full refund',
  repair: 'A repair',
  replacement: 'A replacement',
  partial: 'A partial refund (price reduction)',
  redo: 'The work redone or fixed',
  bill: 'A corrected bill',
  delivery: 'Delivery by a firm date, or a refund',
} as const;
export type OutcomeKey = keyof typeof OUTCOMES;

/** What the date field means for each complaint type (used for labels and the letter). */
export const DATE_LABEL: Record<ComplaintTypeKey, string> = {
  faulty: 'Date it was delivered or collected',
  not_delivered: 'Date you ordered',
  poor_service: 'Date the work was finished',
  energy_bill: 'Date of the bill',
};

export const REFUND_LIMITS = {
  company: 100,
  address: 300,
  item: 150,
  ref: 40,
  problem: 1200,
  contact: 500,
  name: 100,
} as const;

const text = (max: number, label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} must be ${max} characters or fewer`);

export const refundLetterSchema = z.object({
  complaintType: z.enum(Object.keys(COMPLAINT_TYPES) as [ComplaintTypeKey, ...ComplaintTypeKey[]], {
    message: 'Choose what went wrong',
  }),
  companyName: text(REFUND_LIMITS.company, 'Company name'),
  companyAddress: text(REFUND_LIMITS.address, 'Company address'),
  item: text(REFUND_LIMITS.item, 'What you bought'),
  orderRef: z.string().trim().max(REFUND_LIMITS.ref).optional().default(''),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter the date')
    .refine((d) => !Number.isNaN(Date.parse(d)), 'Enter a valid date')
    .refine((d) => Date.parse(d) <= Date.now() + 86_400_000, 'The date can’t be in the future'),
  price: z.coerce
    .number({ message: 'Enter the price' })
    .min(0, 'Enter the price')
    .max(100000, 'Amounts over £100,000 need a solicitor, not a letter'),
  paymentMethod: z.enum(['credit', 'debit', 'paypal', 'other'], { message: 'Choose how you paid' }),
  boughtOnline: z.boolean().default(false),
  repairAttempted: z.boolean().default(false),
  problem: text(REFUND_LIMITS.problem, 'What went wrong'),
  contactSoFar: z.string().trim().max(REFUND_LIMITS.contact).optional().default(''),
  outcome: z.enum(Object.keys(OUTCOMES) as [OutcomeKey, ...OutcomeKey[]], {
    message: 'Choose what you want',
  }),
  customerName: text(REFUND_LIMITS.name, 'Your name'),
  customerAddress: text(REFUND_LIMITS.address, 'Your address'),
});

export type RefundLetterInputs = z.infer<typeof refundLetterSchema>;
