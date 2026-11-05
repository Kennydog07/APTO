import { z } from 'zod';
import type { FlightFacts } from '../rules/flight-compensation.ts';

/** Form inputs for the flight delay & cancellation claim tool. Validated in the browser AND in create-job. */

export const EXPENSE_TYPES = {
  meals: 'Meals and drinks',
  hotel: 'Hotel',
  transport: 'Transport',
  other: 'Other',
} as const;
export type ExpenseType = keyof typeof EXPENSE_TYPES;

export const LIMITS = {
  airline: 80,
  flightNumber: 10,
  reason: 300,
  passengerName: 80,
  maxPassengers: 9,
  bookingRef: 20,
  expenseDesc: 120,
  maxExpenses: 10,
  name: 100,
  address: 300,
  email: 120,
  extra: 1000,
} as const;

const text = (max: number, label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} must be ${max} characters or fewer`);

const iata = (label: string) =>
  z
    .string()
    .trim()
    .toUpperCase()
    // The full airport check (against the bundled list) runs in create-job's preCheck, so the
    // ~90 KB airport list is not pulled into every page's JavaScript.
    .regex(/^[A-Z]{3}$/, `Choose the ${label} airport from the list`);

export const expenseSchema = z.object({
  type: z.enum(Object.keys(EXPENSE_TYPES) as [ExpenseType, ...ExpenseType[]]),
  description: z.string().trim().max(LIMITS.expenseDesc).optional().default(''),
  amount: z.coerce
    .number({ message: 'Enter an amount' })
    .positive('Enter an amount above 0')
    .max(5000, 'Amounts over £5,000 need a solicitor, not a letter'),
  receipt: z.boolean().default(false),
});

export const flightDelayClaimSchema = z
  .object({
    airline: text(LIMITS.airline, 'Airline'),
    airlineBase: z.enum(['uk', 'eu', 'other', 'unsure'], {
      message: 'Tell us where the airline is based',
    }),
    flightNumber: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9]{2}\s?\d{1,4}[A-Z]?$/, 'Enter a flight number like BA 123 or U2 8123'),
    flightDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter the date of the flight')
      .refine((d) => !Number.isNaN(Date.parse(d)), 'Enter a valid date'),
    from: iata('departure'),
    to: iata('arrival'),
    what: z.enum(['delayed', 'cancelled', 'denied'], { message: 'Choose what happened' }),
    delayHours: z.coerce.number().int().min(0).max(96),
    delayMinutes: z.coerce.number().int().min(0).max(59),
    notice: z.enum(['lt7', '7to14', '14plus']).optional(),
    rerouted: z.boolean().default(false),
    rerouteDepartedEarlyMins: z.coerce
      .number()
      .int()
      .min(0)
      .max(24 * 60)
      .default(0),
    reasonGiven: z.string().trim().max(LIMITS.reason).optional().default(''),
    passengers: z
      .array(text(LIMITS.passengerName, 'Passenger name'))
      .min(1, 'Add at least one passenger')
      .max(LIMITS.maxPassengers, `Up to ${LIMITS.maxPassengers} passengers per letter`),
    bookingRef: text(LIMITS.bookingRef, 'Booking reference'),
    expenses: z.array(expenseSchema).max(LIMITS.maxExpenses).default([]),
    claimantName: text(LIMITS.name, 'Your name'),
    claimantAddress: text(LIMITS.address, 'Your address'),
    claimantEmail: z.string().trim().email('Enter a valid email').max(LIMITS.email),
    extra: z.string().trim().max(LIMITS.extra).optional().default(''),
  })
  .refine((v) => v.from !== v.to, { path: ['to'], message: 'Arrival must differ from departure' })
  .refine((v) => v.what !== 'cancelled' || !!v.notice, {
    path: ['notice'],
    message: 'Tell us when you were told about the cancellation',
  });

export type FlightDelayClaimInputs = z.infer<typeof flightDelayClaimSchema>;

/** The subset of inputs the eligibility calculator needs (also used on the form before payment). */
export function flightFacts(v: {
  from: string;
  to: string;
  airlineBase: FlightDelayClaimInputs['airlineBase'];
  what: FlightDelayClaimInputs['what'];
  delayHours: number;
  delayMinutes: number;
  notice?: FlightDelayClaimInputs['notice'];
  rerouted?: boolean;
  rerouteDepartedEarlyMins?: number;
  passengers: unknown[];
}): FlightFacts {
  return {
    from: v.from,
    to: v.to,
    airlineBase: v.airlineBase,
    what: v.what,
    arrivalDelayMins: v.delayHours * 60 + v.delayMinutes,
    notice: v.notice,
    rerouted: v.rerouted,
    rerouteDepartedEarlyMins: v.rerouteDepartedEarlyMins,
    passengers: Math.max(1, v.passengers.length),
  };
}

/** Total of the expenses claimed, in pounds. */
export const expensesTotal = (e: { amount: number }[]) =>
  Math.round(e.reduce((s, x) => s + x.amount, 0) * 100) / 100;
