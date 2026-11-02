/**
 * AI cost estimation and the daily budget kill switch (pure functions, unit-tested).
 * Prices are Anthropic list prices in USD per million tokens. Update if they change.
 */

export const PRICES_USD_PER_MTOK: Record<string, { input: number; output: number }> = {
  'claude-sonnet-5-5': { input: 2, output: 10 },
  'claude-haiku-5-5': { input: 0.1, output: 0.5 },
  'claude-opus-5-5': { input: 4, output: 20 },
};

/** Used for any model not in the table above, so unknown models are never under-counted. */
export const FALLBACK_PRICE = { input: 10, output: 50 };

/** Deliberately a little pessimistic so the estimate errs on the side of caution. */
export const USD_TO_GBP = 0.8;

export const DEFAULT_DAILY_BUDGET_GBP = 10;

export function estimateCostGbp(model: string, tokensIn: number, tokensOut: number): number {
  const price = PRICES_USD_PER_MTOK[model] ?? FALLBACK_PRICE;
  const usd = (tokensIn * price.input + tokensOut * price.output) / 1_000_000;
  return Math.round(usd * USD_TO_GBP * 10_000) / 10_000;
}

/** Parse DAILY_AI_BUDGET_GBP. Blank or invalid values fall back to the default (£10). */
export function parseBudgetCap(raw: string | undefined): number {
  const n = Number(raw);
  if (raw === undefined || raw.trim() === '' || !Number.isFinite(n) || n < 0) {
    return DEFAULT_DAILY_BUDGET_GBP;
  }
  return n;
}

/** True when today's spend has reached the cap, i.e. new checkouts must pause. */
export function isOverBudget(spentTodayGbp: number, capGbp: number): boolean {
  return spentTodayGbp >= capGbp;
}
