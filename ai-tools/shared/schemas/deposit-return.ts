import { z } from 'zod';

/** Form inputs for the deposit return letter tool. Validated in the browser AND in create-job. */

export const DISPUTE_REASONS = {
  wear_and_tear: 'Fair wear and tear',
  pre_existing: 'It was already like that when I moved in',
  cleaned: 'I cleaned or fixed it before leaving',
  no_evidence: 'No evidence or receipts given',
  too_much: 'The amount is too high',
  other: 'Other reason',
} as const;
export type DisputeReason = keyof typeof DISPUTE_REASONS;

export const EVIDENCE_ITEMS = {
  agreement: 'Tenancy agreement or occupation contract',
  checkin: 'Check-in inventory',
  checkout: 'Check-out report',
  photos_in: 'Dated photos or video from moving in',
  photos_out: 'Dated photos or video from moving out',
  receipts: 'Receipts (e.g. professional cleaning)',
  messages: 'Emails or messages with the landlord or agent',
  protection: 'Deposit protection certificate or prescribed information',
} as const;
export type EvidenceItem = keyof typeof EVIDENCE_ITEMS;

export const DEPOSIT_LIMITS = {
  name: 100,
  address: 300,
  scheme: 80,
  item: 120,
  note: 300,
  maxDeductions: 10,
  extra: 1500,
} as const;

const text = (max: number, label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} must be ${max} characters or fewer`);
const isoDate = (label: string) =>
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, `Enter ${label}`)
    .refine((d) => !Number.isNaN(Date.parse(d)), 'Enter a valid date');
const pounds = (label: string) =>
  z.coerce
    .number({ message: `Enter ${label}` })
    .min(0, `${label} can’t be negative`)
    .max(50000, 'Amounts over £50,000 need a solicitor, not a letter');

export const deductionSchema = z.object({
  item: text(DEPOSIT_LIMITS.item, 'What the deduction is for'),
  amount: pounds('the amount').refine((n) => n > 0, 'Enter an amount above 0'),
  accept: z.boolean().default(false),
  reason: z
    .enum(Object.keys(DISPUTE_REASONS) as [DisputeReason, ...DisputeReason[]])
    .default('other'),
  note: z.string().trim().max(DEPOSIT_LIMITS.note).optional().default(''),
});
export type Deduction = z.infer<typeof deductionSchema>;

export const depositReturnSchema = z
  .object({
    nation: z.enum(['england', 'wales', 'scotland', 'ni'], { message: 'Choose where the home is' }),
    landlordName: text(DEPOSIT_LIMITS.name, 'Landlord or agent name'),
    landlordAddress: text(DEPOSIT_LIMITS.address, 'Landlord or agent address'),
    propertyAddress: text(DEPOSIT_LIMITS.address, 'Rented property address'),
    tenancyStart: isoDate('the date the tenancy started'),
    moveOut: isoDate('the date you moved out'),
    deposit: pounds('the deposit').refine((n) => n > 0, 'Enter the deposit you paid'),
    returned: pounds('how much you’ve had back').default(0),
    protectedStatus: z.enum(['yes', 'no', 'unknown'], { message: 'Tell us if it was protected' }),
    scheme: z.string().trim().max(DEPOSIT_LIMITS.scheme).optional().default(''),
    timesAsked: z.enum(['none', 'once', 'twice'], { message: 'Tell us how often you’ve asked' }),
    deductions: z.array(deductionSchema).max(DEPOSIT_LIMITS.maxDeductions).default([]),
    evidence: z
      .array(z.enum(Object.keys(EVIDENCE_ITEMS) as [EvidenceItem, ...EvidenceItem[]]))
      .default([]),
    tenantName: text(DEPOSIT_LIMITS.name, 'Your name'),
    tenantAddress: text(DEPOSIT_LIMITS.address, 'Your current address'),
    extra: z.string().trim().max(DEPOSIT_LIMITS.extra).optional().default(''),
  })
  .refine((v) => v.returned < v.deposit, {
    path: ['returned'],
    message: 'You’ve already had the full deposit back',
  })
  .refine((v) => v.moveOut >= v.tenancyStart, {
    path: ['moveOut'],
    message: 'Move-out must be after the tenancy started',
  });

export type DepositReturnInputs = z.infer<typeof depositReturnSchema>;

const round = (n: number) => Math.round(n * 100) / 100;

/** What the tenant is asking for: deposit, minus anything returned, minus deductions they accept. */
export function depositSums(v: Pick<DepositReturnInputs, 'deposit' | 'returned' | 'deductions'>) {
  const accepted = round(v.deductions.filter((d) => d.accept).reduce((s, d) => s + d.amount, 0));
  const disputed = round(v.deductions.filter((d) => !d.accept).reduce((s, d) => s + d.amount, 0));
  const owed = Math.max(0, round(v.deposit - v.returned - accepted));
  return { accepted, disputed, owed };
}

export const gbp = (n: number) =>
  `£${n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
