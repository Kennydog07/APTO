import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from './env.ts';
import type { ToolId } from '../../shared/tools.ts';

/** Server-side Supabase client using the service-role key. Never import this in the browser. */
let client: SupabaseClient | undefined;
export function db(): SupabaseClient {
  client ??= createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

export const OUTPUT_BUCKET = 'outputs';

export type JobStatus =
  'awaiting_payment' | 'paid' | 'generating' | 'done' | 'failed' | 'abandoned';

export interface JobRow {
  id: string;
  tool: ToolId;
  /** 'purchase' = paid order, 'usage' = one use of a credit pack. */
  kind: 'purchase' | 'usage';
  inputs: Record<string, unknown> | null;
  status: JobStatus;
  stripe_session_id: string | null;
  stripe_payment_intent: string | null;
  amount_pence: number;
  email: string | null;
  result: unknown;
  output_paths: string[];
  regenerations_used: number;
  regen_note: string | null;
  regen_failed: boolean;
  attempts: number;
  trigger_count: number;
  last_error: string | null;
  cost_tokens_in: number;
  cost_tokens_out: number;
  created_at: string;
  paid_at: string | null;
  generation_started_at: string | null;
  completed_at: string | null;
  refunded_at: string | null;
}

export async function getJob(id: string): Promise<JobRow | null> {
  const { data, error } = await db().from('jobs').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as JobRow | null;
}

export async function updateJob(id: string, patch: Partial<JobRow>): Promise<void> {
  const { error } = await db().from('jobs').update(patch).eq('id', id);
  if (error) throw error;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isUuid(v: unknown): v is string {
  return typeof v === 'string' && UUID_RE.test(v);
}
