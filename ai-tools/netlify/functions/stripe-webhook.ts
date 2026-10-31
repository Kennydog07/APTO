/**
 * POST /api/stripe-webhook  (configure this URL in the Stripe dashboard)
 * Events: checkout.session.completed, checkout.session.expired
 */
import type { Config } from '@netlify/functions';
import type Stripe from 'stripe';
import { db, isUuid } from '../lib/db.ts';
import { env } from '../lib/env.ts';
import { stripe } from '../lib/stripe.ts';
import { triggerGeneration } from '../lib/pipeline.ts';

export const config: Config = { path: '/api/stripe-webhook', method: 'POST' };

export default async (req: Request) => {
  const signature = req.headers.get('stripe-signature');
  const payload = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe().webhooks.constructEventAsync(
      payload,
      signature ?? '',
      env('STRIPE_WEBHOOK_SECRET'),
    );
  } catch (e) {
    console.warn('invalid stripe signature', e);
    return new Response('Invalid signature', { status: 400 });
  }

  if (
    event.type === 'checkout.session.completed' ||
    event.type === 'checkout.session.async_payment_succeeded'
  ) {
    const session = event.data.object;
    const jobId = session.metadata?.job_id;
    if (!isUuid(jobId)) return new Response('ignored: no job id', { status: 200 });
    if (session.payment_status !== 'paid')
      return new Response('ignored: not paid yet', { status: 200 });

    const paymentIntent =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : (session.payment_intent?.id ?? null);

    // Conditional update: only the first delivery of this event moves the job to "paid".
    const { data, error } = await db()
      .from('jobs')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        email: session.customer_details?.email ?? null,
        stripe_payment_intent: paymentIntent,
        stripe_session_id: session.id,
        amount_pence: session.amount_total ?? 0,
        trigger_count: 1,
      })
      .eq('id', jobId)
      .in('status', ['awaiting_payment', 'abandoned'])
      .select('id');
    if (error) {
      console.error('failed to mark job paid', error);
      return new Response('db error', { status: 500 }); // Stripe will retry
    }
    if (data && data.length > 0) await triggerGeneration(jobId);
  }

  if (event.type === 'checkout.session.expired') {
    const jobId = event.data.object.metadata?.job_id;
    if (isUuid(jobId)) {
      await db()
        .from('jobs')
        .update({ status: 'abandoned' })
        .eq('id', jobId)
        .eq('status', 'awaiting_payment');
    }
  }

  return new Response('ok', { status: 200 });
};
