/**
 * Scheduled every 10 minutes. Safety net so jobs never get stuck unattended:
 *  1. Paid jobs that never started (trigger lost)        -> trigger again (up to 3 times)
 *  2. Paid jobs still not started after 30 minutes       -> fail + refund
 *  3. Jobs stuck in "generating" for over 20 minutes     -> fail + refund (function crashed/timed out)
 *  4. Failed jobs whose refund call errored              -> retry the refund
 */
import type { Config } from '@netlify/functions';
import { db, updateJob, type JobRow } from '../lib/db.ts';
import { handleFailure, refundJob, triggerGeneration } from '../lib/pipeline.ts';

export const config: Config = { schedule: '*/10 * * * *' };

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();
const isRegen = (j: JobRow) => j.regenerations_used > 0 && j.result != null;

export default async () => {
  const jobs = db().from('jobs');

  // 1 + 2: paid but not started
  const { data: paid } = await jobs
    .select('*')
    .eq('status', 'paid')
    .lt('paid_at', minutesAgo(3))
    .limit(50);
  for (const job of (paid ?? []) as JobRow[]) {
    if (job.trigger_count < 3) {
      await updateJob(job.id, { trigger_count: job.trigger_count + 1 });
      await triggerGeneration(job.id);
    } else if (job.paid_at && job.paid_at < minutesAgo(30)) {
      await handleFailure(job, 'Generation never started after 3 triggers', isRegen(job));
    }
  }

  // 3: stuck generating
  const { data: stuck } = await db()
    .from('jobs')
    .select('*')
    .eq('status', 'generating')
    .lt('generation_started_at', minutesAgo(20))
    .limit(50);
  for (const job of (stuck ?? []) as JobRow[]) {
    await handleFailure(job, 'Generation timed out', isRegen(job));
  }

  // 4: refunds that previously errored
  const { data: unrefunded } = await db()
    .from('jobs')
    .select('id, stripe_payment_intent, refunded_at')
    .eq('status', 'failed')
    .is('refunded_at', null)
    .not('stripe_payment_intent', 'is', null)
    .limit(50);
  for (const job of unrefunded ?? []) await refundJob(job as JobRow);
};
