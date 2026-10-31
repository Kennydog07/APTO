/** GET /api/credits?token=<token>  ->  { tool, remaining } */
import type { Config } from '@netlify/functions';
import { errorJson, json } from '../lib/http.ts';
import { getCredits } from '../lib/credits.ts';
import { TOKEN_RE } from '../../shared/schemas/listing-writer.ts';

export const config: Config = { path: '/api/credits', method: 'GET' };

export default async (req: Request) => {
  const token = new URL(req.url).searchParams.get('token') ?? '';
  if (!TOKEN_RE.test(token)) return errorJson(400, 'Invalid link');
  const credits = await getCredits(token);
  if (!credits) return errorJson(404, 'This link is not valid. Check the email we sent you.');
  return json(credits);
};
