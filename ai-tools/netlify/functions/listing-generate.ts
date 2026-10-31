/**
 * POST /api/listing-generate  { jobId, token, platform, notes, images[] }
 *
 * Spends one credit and writes a listing SYNCHRONOUSLY when it can. The browser generates
 * jobId (a UUID), so if this request times out or the connection drops it can still poll
 * /api/job-status?job=<jobId>:
 *   - finishes in time  -> 200 { status: 'done', result, remaining }
 *   - runs out of time  -> 202 { status: 'pending', jobId, remaining } and the background
 *                          function finishes it; the page polls job-status.
 *   - fails completely  -> the credit is given back automatically.
 *
 * LISTING_SYNC_TIMEOUT_MS (default 20000, per spec) must stay well below Netlify's 60s
 * synchronous function limit.
 */
import type { Config, Context } from '@netlify/functions';
import { z } from 'zod';
import { db, isUuid } from '../lib/db.ts';
import { errorJson, hashedIp, json, readJson } from '../lib/http.ts';
import { allowRequest } from '../lib/rate-limit.ts';
import { budgetStatus } from '../lib/spend.ts';
import { addCredits, looksLikeImage, useCredit, withoutImages } from '../lib/credits.ts';
import { generateStructured } from '../lib/ai.ts';
import { triggerGeneration } from '../lib/pipeline.ts';
import { listingWriterGenerator } from '../lib/generators/listing-writer.ts';
import {
  listingRequestSchema,
  tokenSchema,
  type ListingJobInputs,
} from '../../shared/schemas/listing-writer.ts';

export const config: Config = { path: '/api/listing-generate', method: 'POST' };

const TOOL = 'listing-writer';

export default async (req: Request, context: Context) => {
  const started = Date.now();
  const syncMs = Number(process.env.LISTING_SYNC_TIMEOUT_MS) || 20_000;

  const body = (await readJson(req, 5_000_000)) as Record<string, unknown> | null;
  if (!body) return errorJson(400, 'Invalid request');
  if (!isUuid(body.jobId)) return errorJson(400, 'Invalid request id');
  const token = tokenSchema.safeParse(body.token);
  if (!token.success) return errorJson(400, 'Invalid link');
  const parsed = listingRequestSchema.safeParse(body);
  if (!parsed.success) {
    return errorJson(400, 'Please check the form', {
      fields: z.flattenError(parsed.error).fieldErrors,
    });
  }
  if (!parsed.data.images.every(looksLikeImage))
    return errorJson(400, 'One of the photos could not be read');

  if (!(await allowRequest('listing-generate', hashedIp(req, context), 30, 3600))) {
    return errorJson(429, 'Too many listings in a short time. Please try again later.');
  }

  // Credits are already paid for, so they keep working when new checkouts are paused –
  // up to a hard ceiling of twice the daily budget.
  const budget = await budgetStatus();
  if (budget.spentGbp >= budget.capGbp * 2 || Number.isNaN(budget.spentGbp)) {
    return errorJson(503, 'We’re taking a short break – back shortly. Your credits are safe.', {
      paused: true,
    });
  }

  const remaining = await useCredit(token.data);
  if (remaining < 0)
    return errorJson(402, 'You have no listings left on this link.', { remaining: 0 });

  const inputs: ListingJobInputs = { kind: 'listing', token: token.data, ...parsed.data };
  const now = new Date().toISOString();
  const { error: insertError } = await db().from('jobs').insert({
    id: body.jobId,
    tool: TOOL,
    kind: 'usage',
    inputs,
    status: 'generating',
    amount_pence: 0,
    paid_at: now,
    generation_started_at: now,
    trigger_count: 1,
  });
  if (insertError) {
    await addCredits(token.data, 1); // give the credit back
    return errorJson(409, 'This request was already submitted');
  }

  try {
    const { output, usage } = await generateStructured(
      listingWriterGenerator.prompt,
      inputs,
      undefined,
      started + syncMs,
    );
    const { display } = await listingWriterGenerator.build(inputs, output);
    await db()
      .from('jobs')
      .update({
        status: 'done',
        result: { output, display },
        inputs: withoutImages(inputs),
        completed_at: new Date().toISOString(),
        attempts: 1,
        cost_tokens_in: usage.tokensIn,
        cost_tokens_out: usage.tokensOut,
      })
      .eq('id', body.jobId);
    return json({ status: 'done', jobId: body.jobId, result: display, remaining });
  } catch (e) {
    // Out of time (or a transient error): hand over to the background function.
    console.warn(`listing ${body.jobId} falling back to background`, e);
    await db().from('jobs').update({ status: 'paid', attempts: 1 }).eq('id', body.jobId);
    await triggerGeneration(body.jobId);
    return json({ status: 'pending', jobId: body.jobId, remaining }, 202);
  }
};
