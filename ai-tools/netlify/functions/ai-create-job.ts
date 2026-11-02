/**
 * POST /ai/api/create-job  { tool, inputs }
 * Validates inputs, stores the job (awaiting_payment) and returns a Stripe Checkout URL.
 * No AI is called here.
 */
import type { Config, Context } from '@netlify/functions';
import { z } from 'zod';
import { db } from '../lib/db.ts';
import { errorJson, hashedIp, json, readJson } from '../lib/http.ts';
import { allowRequest } from '../lib/rate-limit.ts';
import { budgetStatus } from '../lib/spend.ts';
import { stripe } from '../lib/stripe.ts';
import { isStripeTestMode, appUrl } from '../lib/env.ts';
import { GENERATORS } from '../lib/generators/index.ts';
import { TOOLS, donePath, isToolId } from '../../shared/tools.ts';

export const config: Config = { path: '/ai/api/create-job', method: 'POST' };

export default async (req: Request, context: Context) => {
  const body = (await readJson(req)) as {
    tool?: unknown;
    inputs?: unknown;
    testForceFail?: unknown;
  } | null;
  if (!body || !isToolId(body.tool)) return errorJson(400, 'Unknown tool');
  const tool = TOOLS[body.tool];
  const generator = GENERATORS[tool.id];
  if (!tool.live || !generator) return errorJson(404, 'This tool is not available yet');

  // Kill switch: pause new checkouts once today's AI budget is used up.
  const budget = await budgetStatus();
  if (budget.over)
    return errorJson(503, 'We’re taking a short break – back shortly.', { paused: true });

  if (!(await allowRequest('create-job', hashedIp(req, context), 10, 3600))) {
    return errorJson(429, 'Too many attempts. Please try again in an hour.');
  }

  const parsed = (generator.purchaseSchema ?? generator.inputSchema).safeParse(body.inputs ?? {});
  if (!parsed.success) {
    return errorJson(400, 'Please check the form', {
      fields: z.flattenError(parsed.error as z.ZodError).fieldErrors,
    });
  }
  const inputs = parsed.data as Record<string, unknown>;
  // Test-only hook used by scripts/e2e.ts to exercise the failure -> refund path.
  if (isStripeTestMode() && body.testForceFail === true) inputs._test_force_fail = true;

  const { data: job, error } = await db()
    .from('jobs')
    .insert({ tool: tool.id, inputs, status: 'awaiting_payment', amount_pence: tool.pricePence })
    .select('id')
    .single();
  if (error || !job) {
    console.error('job insert failed', error);
    return errorJson(500, 'Something went wrong. Please try again.');
  }

  try {
    const site = appUrl();
    const session = await stripe().checkout.sessions.create(
      {
        mode: 'payment',
        currency: 'gbp',
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: 'gbp',
              unit_amount: tool.pricePence,
              product_data: { name: tool.stripeProductName },
            },
          },
        ],
        client_reference_id: job.id,
        metadata: { job_id: job.id, tool: tool.id },
        payment_intent_data: { metadata: { job_id: job.id, tool: tool.id } },
        success_url: `${site}${donePath(tool.id, job.id)}`,
        cancel_url: `${site}${tool.route}?cancelled=1`,
        custom_text: {
          submit: {
            message:
              'Your file is created and supplied straight after payment, so the 14-day cancellation right no longer applies. If we can’t create it, you are refunded automatically.',
          },
        },
      },
      { idempotencyKey: `checkout-${job.id}` },
    );
    await db().from('jobs').update({ stripe_session_id: session.id }).eq('id', job.id);
    return json({ url: session.url, jobId: job.id });
  } catch (e) {
    console.error('stripe checkout create failed', e);
    await db()
      .from('jobs')
      .update({ status: 'abandoned', last_error: String(e) })
      .eq('id', job.id);
    return errorJson(502, 'Payment provider unavailable. Please try again shortly.');
  }
};
