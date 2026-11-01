/**
 * GET /ai/api/site-status -> { accepting: boolean }
 * Forms call this on load and show "back shortly" when the daily AI budget is used up.
 */
import type { Config } from '@netlify/functions';
import { json } from '../lib/http.ts';
import { budgetStatus } from '../lib/spend.ts';

export const config: Config = { path: '/ai/api/site-status', method: 'GET' };

export default async () => {
  const { over } = await budgetStatus();
  return json({ accepting: !over }, 200, { 'cache-control': 'public, max-age=30' });
};
