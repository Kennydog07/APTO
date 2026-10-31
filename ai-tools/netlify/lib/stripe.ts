import Stripe from 'stripe';
import { env } from './env.ts';

let client: Stripe | undefined;
export function stripe(): Stripe {
  client ??= new Stripe(env('STRIPE_SECRET_KEY'), { maxNetworkRetries: 2 });
  return client;
}

/**
 * Full refund of a payment. Idempotent: Stripe de-duplicates on the idempotency key,
 * so calling this twice for the same job never refunds twice.
 */
export async function refundPayment(paymentIntentId: string, jobId: string) {
  return stripe().refunds.create(
    {
      payment_intent: paymentIntentId,
      reason: 'requested_by_customer',
      metadata: { job_id: jobId },
    },
    { idempotencyKey: `refund-${jobId}` },
  );
}
