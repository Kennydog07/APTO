/**
 * POST /api/cv-preview  { cvText, advert }  ->  { fit, bullets[3] }
 * The ONLY AI call made before payment: a cheap model, max 300 tokens,
 * 3 per IP per day, and switched off when the daily budget is used up.
 */
import type { Config, Context } from '@netlify/functions';
import { z } from 'zod';
import { errorJson, hashedIp, json, readJson } from '../lib/http.ts';
import { allowRequest } from '../lib/rate-limit.ts';
import { budgetStatus } from '../lib/spend.ts';
import { generateStructured } from '../lib/ai.ts';
import { cvPreviewPrompt } from '../../prompts/cv-preview.ts';
import { cvPreviewSchema } from '../../shared/schemas/cv-tailor.ts';

export const config: Config = { path: '/api/cv-preview', method: 'POST' };

export default async (req: Request, context: Context) => {
  const parsed = cvPreviewSchema.safeParse(await readJson(req, 100_000));
  if (!parsed.success) {
    return errorJson(400, 'Please check the form', {
      fields: z.flattenError(parsed.error).fieldErrors,
    });
  }
  if ((await budgetStatus()).over) {
    return errorJson(503, 'The free preview is taking a break – back shortly.', { paused: true });
  }
  if (!(await allowRequest('cv-preview', hashedIp(req, context), 3, 86_400))) {
    return errorJson(429, 'You’ve used today’s 3 free previews. You can still tailor your CV.');
  }
  try {
    const { output } = await generateStructured(cvPreviewPrompt, parsed.data);
    return json(output);
  } catch (e) {
    console.error('cv preview failed', e);
    return errorJson(502, 'The preview isn’t available right now. You can still tailor your CV.');
  }
};
