import { describe, expect, it } from 'vitest';
import {
  DEFAULT_DAILY_BUDGET_GBP,
  estimateCostGbp,
  isOverBudget,
  parseBudgetCap,
} from '../shared/budget.ts';

describe('budget kill switch', () => {
  it('defaults the cap to £10 when unset, blank or invalid', () => {
    expect(DEFAULT_DAILY_BUDGET_GBP).toBe(10);
    expect(parseBudgetCap(undefined)).toBe(10);
    expect(parseBudgetCap('')).toBe(10);
    expect(parseBudgetCap('abc')).toBe(10);
    expect(parseBudgetCap('-5')).toBe(10);
  });
  it('reads a valid cap', () => {
    expect(parseBudgetCap('25')).toBe(25);
    expect(parseBudgetCap('2.5')).toBe(2.5);
    expect(parseBudgetCap('0')).toBe(0);
  });
  it('pauses at or above the cap, not below', () => {
    expect(isOverBudget(9.99, 10)).toBe(false);
    expect(isOverBudget(10, 10)).toBe(true);
    expect(isOverBudget(12, 10)).toBe(true);
    expect(isOverBudget(0, 0)).toBe(true); // a cap of 0 pauses everything
  });
  it('estimates cost from token counts', () => {
    // Gemini 3.5 Flash-Lite: $0.30 in / $2.50 out per MTok, x0.8 GBP
    expect(estimateCostGbp('gemini-3.5-flash-lite', 1_000_000, 0)).toBeCloseTo(0.24);
    expect(estimateCostGbp('gemini-3.5-flash-lite', 0, 1_000_000)).toBeCloseTo(2);
    expect(estimateCostGbp('gemini-3.5-flash-lite', 1500, 1200)).toBeCloseTo(0.0028, 4);
  });
  it('prices unknown models pessimistically', () => {
    expect(estimateCostGbp('some-future-model', 1_000_000, 0)).toBeGreaterThan(
      estimateCostGbp('gemini-3.6-flash', 1_000_000, 0),
    );
  });
});
