import { z } from 'zod';

/**
 * Bedtime story inputs. Data minimisation: FIRST name only, no surname, no photo.
 * The name is deleted with the job after 30 days and used for nothing else.
 */

export const AGE_BANDS = {
  '2-4': 'Age 2–4',
  '5-7': 'Age 5–7',
  '8-10': 'Age 8–10',
} as const;
export type AgeBand = keyof typeof AGE_BANDS;

export const STORY_THEMES = {
  bravery: 'Bravery',
  kindness: 'Kindness',
  first_day_school: 'First day at school',
  new_sibling: 'A new brother or sister',
  bedtime_routine: 'Bedtime routine',
} as const;
export type StoryTheme = keyof typeof STORY_THEMES;

export const STORY_LENGTHS = {
  short: 'Short (about 5 minutes)',
  long: 'Long (about 10 minutes)',
} as const;
export type StoryLength = keyof typeof STORY_LENGTHS;

export const STORY_LIMITS = { childName: 30, favourite: 40, maxFavourites: 3 } as const;

export const bedtimeStorySchema = z.object({
  childName: z
    .string()
    .trim()
    .min(1, "Enter your child's first name")
    .max(STORY_LIMITS.childName, 'Keep the name to 30 characters or fewer')
    // Letters (any language), spaces, hyphens and apostrophes. Blocks emails, numbers, URLs etc.
    .regex(/^[\p{L}][\p{L}' ’-]*$/u, 'Use letters only (first name only, please)'),
  ageBand: z.enum(['2-4', '5-7', '8-10'], { message: 'Choose an age band' }),
  favourites: z
    .array(z.string().trim().max(STORY_LIMITS.favourite, 'Keep each favourite thing short'))
    .transform((arr) => arr.filter((s) => s.length > 0))
    .pipe(
      z
        .array(z.string())
        .min(1, 'Add at least one favourite thing')
        .max(STORY_LIMITS.maxFavourites, 'Add up to 3 favourite things'),
    ),
  theme: z
    .enum(['', 'bravery', 'kindness', 'first_day_school', 'new_sibling', 'bedtime_routine'])
    .optional()
    .default(''),
  length: z.enum(['short', 'long'], { message: 'Choose a length' }),
});

export type BedtimeStoryInputs = z.infer<typeof bedtimeStorySchema>;
