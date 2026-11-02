import { describe, expect, it } from 'vitest';

process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret';
const { signJobId, verifyJobSig } = await import('../netlify/lib/pipeline.ts');

describe('background trigger signature', () => {
  const id = '6f1c8a52-1b2c-4d3e-9f00-0123456789ab';
  it('verifies a correct signature', () => {
    expect(verifyJobSig(id, signJobId(id))).toBe(true);
  });
  it('rejects wrong, missing or swapped signatures', () => {
    expect(verifyJobSig(id, 'nope')).toBe(false);
    expect(verifyJobSig(id, undefined)).toBe(false);
    expect(verifyJobSig('00000000-0000-0000-0000-000000000000', signJobId(id))).toBe(false);
  });
});
