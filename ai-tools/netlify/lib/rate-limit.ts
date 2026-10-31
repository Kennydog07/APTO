import { db } from './db.ts';

/**
 * Fixed-window rate limit backed by Postgres (atomic rate_limit_hit function).
 * Returns true if allowed. Fails OPEN on database errors so an outage of the
 * counter never blocks paying customers (the budget cap still protects spend).
 */
export async function allowRequest(
  action: string,
  ipHash: string,
  max: number,
  windowSeconds: number,
): Promise<boolean> {
  const { data, error } = await db().rpc('rate_limit_hit', {
    p_key: `${action}:${ipHash}`,
    p_window_seconds: windowSeconds,
    p_max: max,
  });
  if (error) {
    console.error('rate limit check failed (allowing request)', error);
    return true;
  }
  return data === true;
}
