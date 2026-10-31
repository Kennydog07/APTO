/**
 * POST /api/regenerate  { job, note }
 * Uses the job's ONE free regeneration. The previous output and the note are sent to the AI.
 */
import type { Config } from '@netlify/functions';
import { db, isUuid } from '../lib/db.ts';
import { errorJson, json, readJson } from '../lib/http.ts';
import { triggerGeneration } from '../lib/pipeline.ts';
import { TOOL_IDS, TOOLS } from '../../shared/tools.ts';

/** Credit-pack tools have no free regeneration (each use costs a credit). */
const CREDIT_TOOLS = TOOL_IDS.filter((id) => TOOLS[id].credits);

export const config: Config = { path: '/api/regenerate', method: 'POST' };

const MAX_NOTE = 500;

export default async (req: Request) => {
  const body = (await readJson(req)) as { job?: unknown; note?: unknown } | null;
  if (!body || !isUuid(body.job)) return errorJson(400, 'Invalid job id');
  const note = typeof body.note === 'string' ? body.note.trim().slice(0, MAX_NOTE) : '';

  // Atomic: only a finished job that hasn't used its regeneration can be re-queued.
  // (Paid jobs are always completed even if the daily budget is reached.)
  const { data, error } = await db()
    .from('jobs')
    .update({
      status: 'paid',
      regenerations_used: 1,
      regen_note: note,
      regen_failed: false,
      trigger_count: 1,
    })
    .eq('id', body.job)
    .eq('status', 'done')
    .eq('regenerations_used', 0)
    .eq('kind', 'purchase')
    .not('tool', 'in', `(${CREDIT_TOOLS.join(',')})`)
    .not('result', 'is', null)
    .select('id');
  if (error) return errorJson(500, 'Something went wrong');
  if (!data || data.length === 0)
    return errorJson(409, 'This job has already used its free regeneration');

  await triggerGeneration(body.job);
  return json({ ok: true }, 202);
};
