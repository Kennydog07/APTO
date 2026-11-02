import { z } from 'zod';

/** Form inputs for the parking appeal tool. Validated in the browser AND in create-job. */

export const PARKING_GROUNDS = {
  signage_unclear: 'Signage was unclear or missing',
  valid_ticket_displayed: 'A valid ticket or permit was displayed',
  grace_period: 'I was within the grace period',
  machine_broken: 'The payment machine was broken',
  loading_unloading: 'I was loading or unloading',
  medical_emergency: 'Medical emergency',
  vehicle_sold_or_stolen: 'The vehicle had been sold or stolen',
  procedural_error: 'There is an error on the ticket',
  other: 'Other',
} as const;

export type ParkingGround = keyof typeof PARKING_GROUNDS;
const groundKeys = Object.keys(PARKING_GROUNDS) as [ParkingGround, ...ParkingGround[]];

export const LIMITS = {
  issuerName: 120,
  ticketRef: 40,
  location: 200,
  vehicleReg: 12,
  whatHappened: 1500,
  otherGround: 300,
  appellantName: 100,
  appellantAddress: 300,
} as const;

const text = (max: number, label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} must be ${max} characters or fewer`);

export const parkingAppealSchema = z
  .object({
    ticketType: z.enum(['council', 'private'], { message: 'Choose the ticket type' }),
    issuerName: text(LIMITS.issuerName, 'Issuer name'),
    ticketRef: text(LIMITS.ticketRef, 'Ticket reference'),
    ticketDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter the date of the ticket')
      .refine((d) => !Number.isNaN(Date.parse(d)), 'Enter a valid date'),
    location: text(LIMITS.location, 'Location'),
    vehicleReg: text(LIMITS.vehicleReg, 'Vehicle registration'),
    whatHappened: z
      .string()
      .trim()
      .min(20, 'Please describe what happened (at least 20 characters)')
      .max(LIMITS.whatHappened, `Keep this to ${LIMITS.whatHappened} characters or fewer`),
    grounds: z.array(z.enum(groundKeys)).min(1, 'Tick at least one ground for appeal'),
    otherGround: z.string().trim().max(LIMITS.otherGround).optional().default(''),
    appellantName: text(LIMITS.appellantName, 'Your name'),
    appellantAddress: text(LIMITS.appellantAddress, 'Your address'),
  })
  .refine((v) => !v.grounds.includes('other') || v.otherGround.length > 0, {
    path: ['otherGround'],
    message: 'Describe your other ground',
  });

export type ParkingAppealInputs = z.infer<typeof parkingAppealSchema>;
