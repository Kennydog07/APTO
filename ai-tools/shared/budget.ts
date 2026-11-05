/**
 * AI cost estimation and the daily budget kill switch (pure functions, unit-tested).
 * Prices are Google Gemini API paid-tier list prices in USD per million tokens (output includes
 * thinking tokens). Checked 2026-11-05 at https://ai.google.dev/gemini-api/docs/pricing.
 * Update if they change, or when GEMINI_MODEL is set to a model not listed here.
 */

export const PRICES_USD_PER_MTOK: Record<string, { input: number; output: number }> = {
  'gemini-3.5-flash-lite': { input: 0.3, output: 2.5 },
  'gemini-3.6-flash': { input: 1.5, output: 7.5 },
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
