import { z } from 'zod';

export const SPEECH_TYPES = {
  best_man: 'Best man',
  maid_of_honour: 'Maid of honour',
  father_of_bride: 'Father of the bride',
  groom: 'Groom',
  eulogy: 'Eulogy',
  retirement: 'Retirement',
  leaving_do: 'Leaving do',
} as const;
export type SpeechType = keyof typeof SPEECH_TYPES;

export const SPEECH_TONES = {
  heartfelt: 'Heartfelt',
  funny: 'Funny',
  balanced: 'Balanced',
} as const;
export type SpeechTone = keyof typeof SPEECH_TONES;

/** Eulogies can't be "funny": they are heartfelt, optionally with light warmth (= balanced). */
export const EULOGY_TONE_LABELS: Partial<Record<SpeechTone, string>> = {
  heartfelt: 'Heartfelt',
  balanced: 'Heartfelt with light warmth',
};

export const SPEECH_MINUTES = [3, 5, 8] as const;
export const WORDS_PER_MINUTE = 130;

export const SPEECH_LIMITS = {
  speakerName: 80,
  relationship: 120,
  subjectNames: 150,
  anecdote: 600,
  minAnecdotes: 2,
  maxAnecdotes: 5,
  avoid: 500,
} as const;

const text = (max: number, label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} must be ${max} characters or fewer`);

export const speechWriterSchema = z
  .object({
    speechType: z.enum(
      [
        'best_man',
        'maid_of_honour',
        'father_of_bride',
        'groom',
        'eulogy',
        'retirement',
        'leaving_do',
      ],
      { message: 'Choose the type of speech' },
    ),
    speakerName: text(SPEECH_LIMITS.speakerName, 'Your name'),
    relationship: text(SPEECH_LIMITS.relationship, 'Your relationship'),
    subjectNames: text(SPEECH_LIMITS.subjectNames, 'Name(s)'),
    anecdotes: z
      .array(z.string().trim().max(SPEECH_LIMITS.anecdote, 'Keep each story to 600 characters'))
      .transform((arr) => arr.filter((s) => s.length > 0))
      .pipe(
        z
          .array(z.string())
          .min(SPEECH_LIMITS.minAnecdotes, 'Add at least 2 stories or facts')
          .max(SPEECH_LIMITS.maxAnecdotes, 'Add up to 5 stories or facts'),
      ),
    tone: z.enum(['heartfelt', 'funny', 'balanced'], { message: 'Choose a tone' }),
    minutes: z.union([z.literal(3), z.literal(5), z.literal(8)], { message: 'Choose a length' }),
    avoid: z.string().trim().max(SPEECH_LIMITS.avoid).optional().default(''),
  })
  .refine((v) => !(v.speechType === 'eulogy' && v.tone === 'funny'), {
    path: ['tone'],
    message: 'For a eulogy, choose heartfelt or heartfelt with light warmth',
  });

export type SpeechWriterInputs = z.infer<typeof speechWriterSchema>;

export const targetWords = (minutes: number) => minutes * WORDS_PER_MINUTE;
