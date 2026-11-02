/**
 * The shared purchase -> generation pipeline used by every tool.
 *
 *   create-job  ->  Stripe Checkout  ->  stripe-webhook (status=paid)
 *      -> triggerGeneration() -> generate-background -> runGeneration()
 *      -> status=done + email      OR      status=failed + automatic refund + apology email
 *
 * Safety nets (see functions/sweeper.ts): re-triggers paid jobs that never started,
 * fails+refunds jobs stuck in "generating", and retries refunds that errored.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';
import { db, getJob, updateJob, type JobRow } from './db.ts';
import { appUrl, env, isStripeTestMode, siteOrigin } from './env.ts';
import { generateStructured } from './ai.ts';
import { uploadOutputs, signedDownloads } from './storage.ts';
import { refundPayment } from './stripe.ts';
import { button, emailLayout, escapeHtml, sendEmail } from './email.ts';
import { GENERATORS } from './generators/index.ts';
import { addCredits, fulfilCreditPack, withoutImages } from './credits.ts';
import type { StoredResult } from './generators/types.ts';
import { TOOLS, donePath, formatPrice } from '../../shared/tools.ts';

// ---------- signed internal trigger ----------

/** HMAC so only our own functions can start a generation run. */
export function signJobId(jobId: string): string {
  return createHmac('sha256', env('STRIPE_WEBHOOK_SECRET'))
    .update(`generate:${jobId}`)
    .digest('hex');
}

export function verifyJobSig(jobId: string, sig: unknown): boolean {
  if (typeof sig !== 'string') return false;
  const expected = Buffer.from(signJobId(jobId));
  const given = Buffer.from(sig);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

/** Fire-and-forget call to the background function (it replies 202 immediately). */
export async function triggerGeneration(jobId: string): Promise<boolean> {
  try {
    const res = await fetch(`${siteOrigin()}/.netlify/functions/ai-generate-background`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jobId, sig: signJobId(jobId) }),
    });
    if (!res.ok) console.error('generate-background trigger returned', res.status);
    return res.ok;
  } catch (e) {
    console.error('failed to trigger generate-background (sweeper will retry)', e);
    return false;
  }
}

// ---------- generation ----------

/** Delays between the 3 attempts (1 try + 2 retries). Overridable for tests. */
export const RETRY_DELAYS_MS = [5_000, 20_000];
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Generate outputs for a paid job. Idempotent: the job is atomically "claimed"
 * (paid -> generating), so duplicate triggers do nothing.
 */
export async function runGeneration(jobId: string): Promise<void> {
  const { data: claimed, error } = await db()
    .from('jobs')
    .update({ status: 'generating', generation_started_at: new Date().toISOString() })
    .eq('id', jobId)
    .eq('status', 'paid')
    .select('*')
    .maybeSingle();
  if (error) throw error;
  if (!claimed) {
    console.log(`job ${jobId} not claimable (already running, done, or unpaid) – skipping`);
    return;
  }
  const job = claimed as JobRow;

  // Credit pack purchase: no AI call, just create/top up the credits.
  if (TOOLS[job.tool].credits && job.kind === 'purchase') {
    try {
      if (isStripeTestMode() && job.inputs?._test_force_fail === true) {
        throw new Error('Forced failure (test mode)');
      }
      await fulfilCreditPack(job);
    } catch (e) {
      console.error(`credit pack fulfilment failed for ${job.id}`, e);
      await handleFailure(job, String(e), false);
    }
    return;
  }

  const isRegen = job.regenerations_used > 0 && job.result != null;
  const generator = GENERATORS[job.tool];

  let tokensIn = 0;
  let tokensOut = 0;
  let lastError: unknown;

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    if (attempt > 0) await sleep(RETRY_DELAYS_MS[attempt - 1]!);
    try {
      if (!generator) throw new Error(`No generator registered for tool ${job.tool}`);
      if (isStripeTestMode() && job.inputs?._test_force_fail === true) {
        throw new Error('Forced failure (test mode)');
      }
      const inputs = generator.inputSchema.parse(job.inputs);
      const previous = isRegen ? (job.result as StoredResult).output : undefined;
      const { output, usage } = await generateStructured(
        generator.prompt,
        inputs,
        isRegen ? { previous, note: job.regen_note ?? '' } : undefined,
      );
      tokensIn += usage.tokensIn;
      tokensOut += usage.tokensOut;

      const { display, files } = await generator.build(inputs, output);
      const paths = await uploadOutputs(job.id, files);
      const result: StoredResult = { output, display };

      await updateJob(job.id, {
        status: 'done',
        result,
        // Usage jobs (listing photos): drop the images as soon as we're done with them.
        ...(job.kind === 'usage' ? { inputs: withoutImages(job.inputs) } : {}),
        output_paths: paths,
        completed_at: new Date().toISOString(),
        attempts: job.attempts + attempt + 1,
        cost_tokens_in: job.cost_tokens_in + tokensIn,
        cost_tokens_out: job.cost_tokens_out + tokensOut,
        regen_failed: false,
        last_error: null,
      });
      await emailSuccess(job, paths, isRegen);
      return;
    } catch (e) {
      lastError = e;
      console.error(`job ${job.id} attempt ${attempt + 1} failed`, e);
    }
  }

  await updateJob(job.id, {
    attempts: job.attempts + RETRY_DELAYS_MS.length + 1,
    cost_tokens_in: job.cost_tokens_in + tokensIn,
    cost_tokens_out: job.cost_tokens_out + tokensOut,
  });
  await handleFailure(job, String(lastError), isRegen);
}

/**
 * A job could not be generated.
 *  - First generation: mark failed, refund in full, email an apology.
 *  - Free regeneration: the customer already has a good result, so just restore it.
 */
export async function handleFailure(job: JobRow, reason: string, isRegen: boolean): Promise<void> {
  const last_error = reason.slice(0, 1000);
  if (job.kind === 'usage') {
    // One use of a credit pack failed: give the credit back. Nothing to refund in Stripe.
    await updateJob(job.id, { status: 'failed', last_error, inputs: withoutImages(job.inputs) });
    const token = job.inputs?.token;
    if (typeof token === 'string')
      await addCredits(token, 1).catch((e) => console.error('credit refund failed', e));
    return;
  }
  if (isRegen) {
    await updateJob(job.id, { status: 'done', regen_failed: true, last_error });
    return;
  }
  await updateJob(job.id, { status: 'failed', last_error });
  const refunded = await refundJob(job);
  const tool = TOOLS[job.tool];
  await sendEmail(
    job.email,
    `Sorry – we couldn't create your ${tool.name.toLowerCase()}`,
    emailLayout(
      'Sorry, something went wrong',
      `<p>We weren't able to create your ${escapeHtml(tool.name.toLowerCase())} this time.</p>
       <p>${
         refunded
           ? `We've refunded the full ${formatPrice(job.amount_pence)} to your card. Refunds usually appear within 5–10 working days.`
           : `We'll refund the full ${formatPrice(job.amount_pence)} to your card automatically – no action is needed from you.`
       }</p><p>You're welcome to try again.</p>${button(`${appUrl()}${tool.route}`, 'Try again')}`,
    ),
  );
}

/** Full refund; safe to call repeatedly (Stripe idempotency key + refunded_at guard). */
export async function refundJob(
  job: Pick<JobRow, 'id' | 'stripe_payment_intent' | 'refunded_at'>,
): Promise<boolean> {
  if (job.refunded_at) return true;
  if (!job.stripe_payment_intent) {
    console.error(`job ${job.id} has no payment intent – cannot refund automatically`);
    return false;
  }
  try {
    await refundPayment(job.stripe_payment_intent, job.id);
    await updateJob(job.id, { refunded_at: new Date().toISOString() });
    return true;
  } catch (e) {
    console.error(`refund failed for job ${job.id} (sweeper will retry)`, e);
    return false;
  }
}

async function emailSuccess(job: JobRow, paths: string[], isRegen: boolean) {
  const tool = TOOLS[job.tool];
  const links = await signedDownloads(paths);
  const page = `${appUrl()}${donePath(job.tool, job.id)}`;
  await sendEmail(
    job.email,
    isRegen
      ? `Your updated ${tool.name.toLowerCase()} is ready`
      : `Your ${tool.name.toLowerCase()} is ready`,
    emailLayout(
      isRegen ? 'Your updated version is ready' : 'Your download is ready',
      `<p>Thanks for using ${escapeHtml(tool.name)}. Your files are below. Download links work for 7 days.</p>
       ${links.map((l) => button(l.url, `Download ${l.filename}`)).join('')}
       <p>You can also view and copy the text on <a href="${escapeHtml(page)}">your results page</a>.</p>`,
    ),
  );
}

/** Re-export so functions only import from the pipeline. */
export { getJob };
