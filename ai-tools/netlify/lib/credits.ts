/**
 * Credit packs (listing writer). The token in the magic link is the only key: no cookies,
 * no accounts. Spending is atomic in Postgres (use_credit), so credits can't go negative.
 */
import { randomBytes } from 'node:crypto';
import { db, updateJob, type JobRow } from './db.ts';
import { appUrl } from './env.ts';
import { button, emailLayout, escapeHtml, sendEmail } from './email.ts';
import { TOOLS, type ToolId } from '../../shared/tools.ts';
import type { ListingImage } from '../../shared/schemas/listing-writer.ts';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/** 32 random characters from [A-Za-z0-9] (rejection sampling, so no modulo bias). */
export function newToken(length = 32): string {
  let out = '';
  while (out.length < length) {
    for (const b of randomBytes(length)) {
      if (b < 248 && out.length < length) out += ALPHABET[b % 62];
    }
  }
  return out;
}

export function magicLink(tool: ToolId, token: string): string {
  return `${appUrl()}${TOOLS[tool].route}?token=${token}`;
}

export async function getCredits(
  token: string,
): Promise<{ remaining: number; tool: ToolId } | null> {
  const { data, error } = await db()
    .from('credits')
    .select('remaining, tool')
    .eq('token', token)
    .maybeSingle();
  if (error) throw error;
  return data as { remaining: number; tool: ToolId } | null;
}

/** Spend one credit. Returns credits left, or -1 if the token is invalid or empty. */
export async function spendCredit(token: string): Promise<number> {
  const { data, error } = await db().rpc('use_credit', { p_token: token });
  if (error) throw error;
  return Number(data);
}

/** Add credits (top-up) or give one back after a failed generation. Returns new balance or -1. */
export async function addCredits(token: string, amount: number): Promise<number> {
  const { data, error } = await db().rpc('add_credits', { p_token: token, p_amount: amount });
  if (error) throw error;
  return Number(data);
}

/**
 * Fulfil a paid pack purchase: create a new token (or top up an existing one),
 * mark the job done and email the magic link. Called from runGeneration after the job is claimed.
 */
export async function fulfilCreditPack(job: JobRow): Promise<void> {
  const tool = TOOLS[job.tool];
  const amount = tool.credits ?? 0;
  const topUp = typeof job.inputs?.topUpToken === 'string' ? job.inputs.topUpToken : null;

  let token: string | null = null;
  let remaining = -1;
  if (topUp) {
    remaining = await addCredits(topUp, amount);
    if (remaining >= 0) token = topUp;
  }
  if (!token) {
    // Idempotent on job_id: if a row already exists for this job (retry), reuse it.
    const { data: existing } = await db()
      .from('credits')
      .select('token, remaining')
      .eq('job_id', job.id)
      .maybeSingle();
    if (existing) {
      token = existing.token as string;
      remaining = Number(existing.remaining);
    } else {
      token = newToken();
      const { error } = await db()
        .from('credits')
        .insert({ token, tool: job.tool, remaining: amount, email: job.email, job_id: job.id });
      if (error) throw error;
      remaining = amount;
    }
  }

  await updateJob(job.id, {
    status: 'done',
    result: { output: null, display: { token, added: amount, remaining, topUp: Boolean(topUp) } },
    completed_at: new Date().toISOString(),
    last_error: null,
  });

  const link = magicLink(job.tool, token);
  await sendEmail(
    job.email,
    topUp ? `${amount} more listings added` : `Your ${amount} listings are ready to use`,
    emailLayout(
      topUp ? `${amount} more listings added` : 'Your listing credits are ready',
      `<p>You have <strong>${remaining}</strong> listing${remaining === 1 ? '' : 's'} to use with ${escapeHtml(tool.name)}.</p>
       ${button(link, 'Open the listing writer')}
       <p style="font-size:13px;color:#57534e">This private link is your key: anyone with it can use your listings, so don't share it.
       Bookmark it, or keep this email.</p>`,
    ),
  );
}

/** Remove photos from stored inputs once they are no longer needed (data minimisation). */
export function withoutImages(
  inputs: Record<string, unknown> | null,
): Record<string, unknown> | null {
  if (!inputs || !Array.isArray(inputs.images)) return inputs;
  const { images, ...rest } = inputs as { images: ListingImage[] } & Record<string, unknown>;
  return { ...rest, image_count: images.length };
}

/** Server-side check that decoded bytes really are the declared image type. */
export function looksLikeImage(img: ListingImage): boolean {
  const head = Buffer.from(img.data.slice(0, 24), 'base64');
  if (img.mediaType === 'image/jpeg') return head[0] === 0xff && head[1] === 0xd8;
  if (img.mediaType === 'image/png') return head.subarray(1, 4).toString('latin1') === 'PNG';
  return (
    head.subarray(0, 4).toString('latin1') === 'RIFF' &&
    head.subarray(8, 12).toString('latin1') === 'WEBP'
  );
}
