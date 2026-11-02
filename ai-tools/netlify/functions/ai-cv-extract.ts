/**
 * POST /ai/api/cv-extract  { data: <base64 of a PDF or DOCX, max 2MB> }  ->  { text, type, words }
 * Text extraction only: no AI call, nothing stored.
 */
import type { Config, Context } from '@netlify/functions';
import { errorJson, hashedIp, json, readJson } from '../lib/http.ts';
import { allowRequest } from '../lib/rate-limit.ts';
import { CvExtractError, extractCvText } from '../lib/cv-extract.ts';
import { CV_LIMITS } from '../../shared/schemas/cv-tailor.ts';

export const config: Config = { path: '/ai/api/cv-extract', method: 'POST' };

export default async (req: Request, context: Context) => {
  const body = (await readJson(req, 3_000_000)) as { data?: unknown } | null;
  if (!body || typeof body.data !== 'string' || !/^[A-Za-z0-9+/]+=*$/.test(body.data)) {
    return errorJson(400, 'Please upload your CV as a PDF or Word (.docx) file.');
  }
  if (!(await allowRequest('cv-extract', hashedIp(req, context), 20, 3600))) {
    return errorJson(429, 'Too many uploads. Please try again later.');
  }
  try {
    const { text, type } = await extractCvText(new Uint8Array(Buffer.from(body.data, 'base64')));
    if (text.length > CV_LIMITS.cvTextMax) {
      return errorJson(
        400,
        'Your CV is very long. Please shorten it to under about 4 pages and try again.',
      );
    }
    return json({ text, type, words: text.split(/\s+/).filter(Boolean).length });
  } catch (e) {
    if (e instanceof CvExtractError) return errorJson(400, e.message);
    console.error('cv-extract failed', e);
    return errorJson(500, 'Something went wrong reading your CV. Please try again.');
  }
};
