import { z } from 'zod';
import { AGE_BANDS, type AgeBand } from './bedtime-story.ts';

/**
 * Santa letter inputs. Data minimisation: FIRST names only (child, sibling, pet), no
 * surname, address or photo. Used only for this letter and deleted with the job after 30 days.
 */

export { AGE_BANDS, type AgeBand };

export const SANTA_TONES = {
  magical: 'Magical',
  funny: 'Funny',
  cosy: 'Cosy',
} as const;
export type SantaTone = keyof typeof SANTA_TONES;

export const SANTA_LIMITS = {
  name: 30,
  goodThing: 120,
  maxGoodThings: 3,
  encouragement: 120,
  presentHint: 60,
} as const;

/** Same rule as the bedtime story: letters, spaces, hyphens and apostrophes only. */
const firstName = (requiredMsg: string) =>
  z
    .string()
    .trim()
    .min(1, requiredMsg)
    .max(SANTA_LIMITS.name, 'Keep the name to 30 characters or fewer')
    .regex(/^[\p{L}][\p{L}' ’-]*$/u, 'Use letters only (first name only, please)');

const optionalFirstName = z
  .string()
  .trim()
  .max(SANTA_LIMITS.name, 'Keep the name to 30 characters or fewer')
  .regex(/^([\p{L}][\p{L}' ’-]*)?$/u, 'Use letters only (first name only, please)')
  .optional()
  .default('');

export const santaLetterSchema = z.object({
  childName: firstName("Enter your child's first name"),
  ageBand: z.enum(['2-4', '5-7', '8-10'], { message: 'Choose an age band' }),
  goodThings: z
    .array(z.string().trim().max(SANTA_LIMITS.goodThing, 'Keep each one to a sentence'))
    .transform((arr) => arr.filter((s) => s.length > 0))
    .pipe(
      z
        .array(z.string())
        .min(1, 'Add at least one good thing they did this year')
        .max(SANTA_LIMITS.maxGoodThings, 'Add up to 3 good things'),
    ),
  encouragement: z
    .string()
    .trim()
    .max(SANTA_LIMITS.encouragement, 'Keep it to one short sentence')
    .optional()
    .default(''),
  siblingName: optionalFirstName,
  petName: optionalFirstName,
  presentHint: z
    .string()
    .trim()
    .max(SANTA_LIMITS.presentHint, 'Keep the hint short')
    .optional()
    .default(''),
  tone: z.enum(['magical', 'funny', 'cosy'], { message: 'Choose a tone' }),
});

export type SantaLetterInputs = z.infer<typeof santaLetterSchema>;
