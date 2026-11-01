import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the database: daily_spend lookup returns whatever `spendRow` holds.
let spendRow: { data: unknown; error: unknown } = { data: null, error: null };
vi.mock('../netlify/lib/db.ts', () => ({
  db: () => ({
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => spendRow }) }) }),
    rpc: async () => ({ data: null, error: null }),
  }),
}));

const { budgetStatus } = await import('../netlify/lib/spend.ts');

describe('budgetStatus (server kill switch)', () => {
  beforeEach(() => {
    delete process.env.DAILY_AI_BUDGET_GBP;
  });
  it('accepts orders when under the default £10 cap', async () => {
    spendRow = { data: { est_cost_gbp: '3.5' }, error: null };
    expect(await budgetStatus()).toMatchObject({ over: false, spentGbp: 3.5, capGbp: 10 });
  });
  it('accepts orders on a fresh day with no spend row', async () => {
    spendRow = { data: null, error: null };
    expect((await budgetStatus()).over).toBe(false);
  });
  it('pauses when the env cap is reached', async () => {
    process.env.DAILY_AI_BUDGET_GBP = '2';
    spendRow = { data: { est_cost_gbp: 2.01 }, error: null };
    expect((await budgetStatus()).over).toBe(true);
  });
  it('fails closed (pauses) if spend cannot be read', async () => {
    spendRow = { data: null, error: new Error('db down') };
    expect((await budgetStatus()).over).toBe(true);
  });
});
