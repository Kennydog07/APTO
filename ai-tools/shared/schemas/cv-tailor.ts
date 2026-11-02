import { z } from 'zod';

export const CV_LIMITS = {
  /** Upload size (checked in the browser and on the server). */
  maxFileBytes: 2 * 1024 * 1024,
  cvTextMin: 200,
  cvTextMax: 15_000,
  advertMin: 100,
  advertMax: 6000,
  notes: 500,
} as const;

const cvText = z
  .string()
  .trim()
  .min(CV_LIMITS.cvTextMin, 'Upload your CV first')
  .max(CV_LIMITS.cvTextMax, 'Your CV is very long – please shorten it to under 15,000 characters');
const advert = z
  .string()
  .trim()
  .min(CV_LIMITS.advertMin, 'Paste the full job advert (at least 100 characters)')
  .max(CV_LIMITS.advertMax, 'Keep the advert to 6,000 characters');

export const cvTailorSchema = z.object({
  cvText,
  advert,
  notes: z
    .string()
    .trim()
    .max(CV_LIMITS.notes, 'Keep notes to 500 characters')
    .optional()
    .default(''),
});
export type CvTailorInputs = z.infer<typeof cvTailorSchema>;

export const cvPreviewSchema = z.object({ cvText, advert });
export type CvPreviewInputs = z.infer<typeof cvPreviewSchema>;
