// Budget-guarded Claude client. Every call is checked against the monthly
// AI cap BEFORE it is made, and its real token usage is recorded after.
// With no ANTHROPIC_API_KEY the system falls back to approved templates.
import Anthropic from '@anthropic-ai/sdk';
import { now } from './db.js';

// USD per million tokens (input, output). Keep in step with Anthropic's price list.
export const PRICES_USD_PER_MTOK = {
  'claude-opus-5-5': [4, 20],
  'claude-sonnet-5-5': [2, 10],
  'claude-haiku-5-5': [0.1, 0.5],
};

export function monthSpendGbp(db, month = now().slice(0, 7)) {
  return db.prepare('SELECT COALESCE(SUM(cost_gbp),0) AS s FROM ai_usage WHERE substr(ts,1,7) = ?').get(month).s;
}

export function costGbp(model, inTok, outTok, usdToGbp) {
  const [pi, po] = PRICES_USD_PER_MTOK[model] ?? PRICES_USD_PER_MTOK['claude-opus-5-5'];
  return ((inTok * pi + outTok * po) / 1_000_000) * usdToGbp;
}

export function createAi(ctx, { client } = {}) {
  const { db, cfg, log } = ctx;
  const enabled = Boolean(client) || cfg.ai.apiKeyPresent;
  const anthropic = client ?? (enabled ? new Anthropic() : null);
  const maxTokens = 1500;

  return {
    enabled,
    remainingBudgetGbp: () => Math.max(0, cfg.ai.monthlyBudgetGbp - monthSpendGbp(db)),

    /**
     * Returns { text } or { skipped: reason }. Never throws for budget/refusal —
     * callers fall back to templates.
     */
    async draft({ system, prompt, purpose }) {
      if (!enabled) return { skipped: 'ai_disabled' };
      const model = cfg.ai.model;
      // Worst-case cost of this call must fit in what is left this month.
      const worst = costGbp(model, Math.ceil((system.length + prompt.length) / 3), maxTokens, cfg.ai.usdToGbp);
      const spent = monthSpendGbp(db);
      if (spent + worst > cfg.ai.monthlyBudgetGbp) {
        log.warn('ai', 'Monthly AI budget reached — using templates', { spent, cap: cfg.ai.monthlyBudgetGbp });
        return { skipped: 'budget_exhausted' };
      }
      try {
        const params = { model, max_tokens: maxTokens, system, messages: [{ role: 'user', content: prompt }], output_config: { effort: 'low' } };
        // Server-side refusal fallback is supported on these models via the beta endpoint.
        const res = ['claude-opus-5-5', 'claude-sonnet-5-5'].includes(model)
          ? await anthropic.beta.messages.create({ ...params, betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' })
          : await anthropic.messages.create(params);
        const inTok = res.usage?.input_tokens ?? 0;
        const outTok = res.usage?.output_tokens ?? 0;
        const cost = costGbp(res.model ?? model, inTok, outTok, cfg.ai.usdToGbp);
        db.prepare('INSERT INTO ai_usage (ts, model, purpose, input_tokens, output_tokens, cost_gbp) VALUES (?,?,?,?,?,?)').run(now(), res.model ?? model, purpose, inTok, outTok, cost);
        if (res.stop_reason === 'refusal') return { skipped: 'refusal' };
        const text = (res.content ?? []).filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();
        return text ? { text } : { skipped: 'empty' };
      } catch (e) {
        log.error('ai', 'Claude API call failed — using templates', { error: e.message, status: e.status });
        return { skipped: 'api_error' };
      }
    },
  };
}
