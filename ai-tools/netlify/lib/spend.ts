import { db } from './db.ts';
import { estimateCostGbp, isOverBudget, parseBudgetCap } from '../../shared/budget.ts';

export function budgetCapGbp(): number {
  return parseBudgetCap(process.env.DAILY_AI_BUDGET_GBP);
}

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getTodaySpendGbp(): Promise<number> {
  const { data, error } = await db()
    .from('daily_spend')
    .select('est_cost_gbp')
    .eq('date', todayUtc())
    .maybeSingle();
  if (error) throw error;
  return Number(data?.est_cost_gbp ?? 0);
}

/**
 * Kill switch: are we accepting new checkouts today?
 * Fails CLOSED (returns over=true) if the spend table can't be read, so a broken
 * database never leads to unbounded AI spend.
 */
export async function budgetStatus(): Promise<{ over: boolean; spentGbp: number; capGbp: number }> {
  const capGbp = budgetCapGbp();
  try {
    const spentGbp = await getTodaySpendGbp();
    return { over: isOverBudget(spentGbp, capGbp), spentGbp, capGbp };
  } catch (e) {
    console.error('budget check failed, pausing checkouts', e);
    return { over: true, spentGbp: NaN, capGbp };
  }
}

/** Add usage to today's total. Never throws: a paid job must not fail because of bookkeeping. */
export async function recordSpend(model: string, tokensIn: number, tokensOut: number) {
  const cost = estimateCostGbp(model, tokensIn, tokensOut);
  try {
    const { error } = await db().rpc('add_daily_spend', {
      p_tokens_in: tokensIn,
      p_tokens_out: tokensOut,
      p_cost_gbp: cost,
    });
    if (error) console.error('failed to record AI spend', error);
  } catch (e) {
    console.error('failed to record AI spend', e);
  }
  return cost;
}
