/**
 * Credit pack fulfilment and credit return, against an in-memory fake of the few
 * Supabase calls they use.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

type Row = Record<string, unknown>;
const tables: Record<string, Row[]> = { credits: [], jobs: [] };
const emails: { to: unknown; subject: string }[] = [];

function query(table: string) {
  const filters: [string, unknown][] = [];
  let patch: Row | null = null;
  const rows = () => tables[table]!.filter((r) => filters.every(([k, v]) => r[k] === v));
  const q = {
    select: () => q,
    eq: (k: string, v: unknown) => (filters.push([k, v]), q),
    maybeSingle: async () => ({ data: rows()[0] ?? null, error: null }),
    insert: async (row: Row) => (tables[table]!.push({ ...row }), { error: null }),
    update: (p: Row) => ((patch = p), q),
    then: (resolve: (v: unknown) => void) => {
      if (patch) rows().forEach((r) => Object.assign(r, patch));
      resolve({ error: null });
    },
  };
  return q;
}

vi.mock('../netlify/lib/db.ts', () => ({
  db: () => ({
    from: query,
    rpc: async (fn: string, args: { p_token: string; p_amount?: number }) => {
      const row = tables.credits!.find((c) => c.token === args.p_token);
      if (fn === 'add_credits') {
        if (!row) return { data: -1, error: null };
        row.remaining = (row.remaining as number) + args.p_amount!;
        return { data: row.remaining, error: null };
      }
      if (fn === 'use_credit') {
        if (!row || (row.remaining as number) <= 0) return { data: -1, error: null };
        row.remaining = (row.remaining as number) - 1;
        return { data: row.remaining, error: null };
      }
      return { data: null, error: null };
    },
  }),
  updateJob: async (id: string, patch: Row) => {
    const job = tables.jobs!.find((j) => j.id === id);
    if (job) Object.assign(job, patch);
  },
}));
vi.mock('../netlify/lib/email.ts', () => ({
  sendEmail: async (to: unknown, subject: string) => void emails.push({ to, subject }),
  emailLayout: (t: string, b: string) => t + b,
  button: (h: string) => h,
  escapeHtml: (s: string) => s,
}));

const { fulfilCreditPack, spendCredit, addCredits } = await import('../netlify/lib/credits.ts');
const { handleFailure } = await import('../netlify/lib/pipeline.ts');

function job(over: Row = {}) {
  const j = {
    id: crypto.randomUUID(),
    tool: 'listing-writer',
    kind: 'purchase',
    email: 'a@example.com',
    inputs: { kind: 'pack' },
    ...over,
  };
  tables.jobs!.push(j);
  return j as never;
}

describe('credit packs', () => {
  beforeEach(() => {
    tables.credits = [];
    tables.jobs = [];
    emails.length = 0;
  });

  it('a new purchase creates a 10-credit token, completes the job and emails the link', async () => {
    const j = job();
    await fulfilCreditPack(j);
    expect(tables.credits).toHaveLength(1);
    const c = tables.credits![0]!;
    expect(c.remaining).toBe(10);
    expect(c.token).toMatch(/^[A-Za-z0-9]{32}$/);
    const stored = tables.jobs![0]!;
    expect(stored.status).toBe('done');
    expect((stored.result as { display: { token: string } }).display.token).toBe(c.token);
    expect(emails[0]).toMatchObject({
      to: 'a@example.com',
      subject: 'Your 10 listings are ready to use',
    });
  });

  it('is idempotent: fulfilling the same job twice does not create a second token', async () => {
    const j = job();
    await fulfilCreditPack(j);
    await fulfilCreditPack(j);
    expect(tables.credits).toHaveLength(1);
  });

  it('"buy 10 more" tops up the existing token', async () => {
    await fulfilCreditPack(job());
    const token = tables.credits![0]!.token as string;
    tables.credits![0]!.remaining = 2;
    await fulfilCreditPack(job({ inputs: { kind: 'pack', topUpToken: token } }));
    expect(tables.credits).toHaveLength(1);
    expect(tables.credits![0]!.remaining).toBe(12);
    expect(emails[1]!.subject).toBe('10 more listings added');
  });

  it('a top-up for an unknown token falls back to a fresh token', async () => {
    await fulfilCreditPack(job({ inputs: { kind: 'pack', topUpToken: 'Z'.repeat(32) } }));
    expect(tables.credits).toHaveLength(1);
    expect(tables.credits![0]!.token).not.toBe('Z'.repeat(32));
  });

  it('spending stops at zero and failed uses can be given back', async () => {
    tables.credits!.push({ token: 't', remaining: 1 });
    expect(await spendCredit('t')).toBe(0);
    expect(await spendCredit('t')).toBe(-1);
    expect(await addCredits('t', 1)).toBe(1);
    expect(await spendCredit('missing')).toBe(-1);
  });

  it('a failed listing (usage job) returns the credit, strips photos and is not refunded in Stripe', async () => {
    tables.credits!.push({ token: 'tok', remaining: 4 });
    const j = job({
      kind: 'usage',
      email: null,
      inputs: { kind: 'listing', token: 'tok', images: [{ data: 'x' }] },
    });
    await handleFailure(j, 'boom', false);
    const stored = tables.jobs![0]!;
    expect(stored.status).toBe('failed');
    expect((stored.inputs as Row).images).toBeUndefined();
    expect(stored.refunded_at).toBeUndefined();
    expect(tables.credits![0]!.remaining).toBe(5);
  });
});
