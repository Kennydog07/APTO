/**
 * Scheduled daily. Data retention (stated in the privacy policy):
 *  - Jobs older than 30 days: delete output files and wipe inputs, email and results.
 *    The anonymised row (tool, status, amount, tokens, timestamps) is kept for stats.
 *  - Credit packs older than 30 days: email wiped.
 *  - Checkouts never completed after 25 hours: marked abandoned.
 *  - Rate-limit counters older than 2 days: deleted.
 */
import type { Config } from '@netlify/functions';
import { db } from '../lib/db.ts';
import { deleteOutputs } from '../lib/storage.ts';

// 03:17 UTC every day (quiet time; off the hour to avoid scheduler congestion).
export const config: Config = { schedule: '17 3 * * *' };

/** Scheduled functions are stopped after 30s: stop starting new batches after 20s. */
const TIME_BUDGET_MS = 20_000;

const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();

export default async () => {
  const started = Date.now();
  // Process in batches so a backlog can never time the function out; tomorrow's run continues.
  for (let batch = 0; batch < 20 && Date.now() - started < TIME_BUDGET_MS; batch++) {
    const { data, error } = await db()
      .from('jobs')
      .select('id, output_paths')
      .lt('created_at', daysAgo(30))
      .is('purged_at', null)
      .limit(100);
    if (error) throw error;
    if (!data || data.length === 0) break;

    const paths = data.flatMap((j) => (j.output_paths as string[]) ?? []);
    await deleteOutputs(paths);
    const { error: upErr } = await db()
      .from('jobs')
      .update({
        inputs: null,
        email: null,
        result: null,
        regen_note: null,
        output_paths: [],
        stripe_session_id: null,
        last_error: null,
        purged_at: new Date().toISOString(),
      })
      .in(
        'id',
        data.map((j) => j.id),
      );
    if (upErr) throw upErr;
    console.log(`retention: purged ${data.length} jobs`);
  }

  await db()
    .from('credits')
    .update({ email: null })
    .lt('created_at', daysAgo(30))
    .not('email', 'is', null);
  await db()
    .from('jobs')
    .update({ status: 'abandoned' })
    .eq('status', 'awaiting_payment')
    .lt('created_at', daysAgo(25 / 24));
  await db().from('rate_limits').delete().lt('window_start', daysAgo(2));
};
