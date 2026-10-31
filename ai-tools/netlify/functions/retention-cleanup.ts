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

export const config: Config = { schedule: '@daily' };

const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();

export default async () => {
  // Process in batches so a backlog can never time the function out.
  for (let batch = 0; batch < 20; batch++) {
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
