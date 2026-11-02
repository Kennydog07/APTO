/**
 * GET /ai/api/job-status?job=<uuid>
 * Polled every 3s by the done page. The unguessable job id acts as the access token.
 * Never returns inputs or email.
 */
import type { Config } from '@netlify/functions';
import { getJob, isUuid } from '../lib/db.ts';
import { errorJson, json } from '../lib/http.ts';
import { downloadLabel, signedDownloads } from '../lib/storage.ts';
import type { StoredResult } from '../lib/generators/types.ts';
import { TOOLS } from '../../shared/tools.ts';

export const config: Config = { path: '/ai/api/job-status', method: 'GET' };

export default async (req: Request) => {
  const id = new URL(req.url).searchParams.get('job');
  if (!isUuid(id)) return errorJson(400, 'Invalid job id');
  const job = await getJob(id);
  if (!job) return errorJson(404, 'Job not found');

  // Map internal statuses to what the UI needs.
  const base = { tool: job.tool, status: job.status };
  if (job.status !== 'done') {
    return json({ ...base, refunded: Boolean(job.refunded_at) });
  }
  if (!job.result) return json({ ...base, status: 'expired' }); // purged after 30 days

  const downloads = (await signedDownloads(job.output_paths)).map((d) => ({
    ...d,
    label: downloadLabel(d.filename),
  }));
  return json({
    ...base,
    result: (job.result as StoredResult).display,
    downloads,
    canRegenerate:
      job.regenerations_used < 1 && job.kind === 'purchase' && !TOOLS[job.tool].credits,
    regenFailed: job.regen_failed,
  });
};
