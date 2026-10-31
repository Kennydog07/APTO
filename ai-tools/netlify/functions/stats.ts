/**
 * GET /api/stats?key=<STATS_API_KEY>
 * Read-only, anonymised stats for the marketing bot. No personal data. See MARKETING_BOT.md.
 */
import type { Config } from '@netlify/functions';
import { timingSafeEqual } from 'node:crypto';
import { db } from '../lib/db.ts';
import { env } from '../lib/env.ts';
import { errorJson, json } from '../lib/http.ts';
import { budgetCapGbp } from '../lib/spend.ts';
import { TOOL_IDS, TOOLS } from '../../shared/tools.ts';

export const config: Config = { path: '/api/stats', method: 'GET' };

interface Row {
  tool: string;
  created: number;
  paid: number;
  done: number;
  failed: number;
  refunded: number;
  revenue_pence: number;
  refunded_pence: number;
  usage_done?: number;
}

function keyMatches(given: string | null): boolean {
  const expected = Buffer.from(env('STATS_API_KEY'));
  const actual = Buffer.from(given ?? '');
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

const pct = (num: number, den: number) => (den === 0 ? 0 : Math.round((num / den) * 1000) / 10);

async function windowStats(since: Date) {
  const { data, error } = await db().rpc('stats_for_window', { p_since: since.toISOString() });
  if (error) throw error;
  const rows = (data ?? []) as Row[];
  const perTool = Object.fromEntries(
    TOOL_IDS.filter((id) => TOOLS[id].live).map((id) => {
      const r = rows.find((x) => x.tool === id);
      const created = Number(r?.created ?? 0);
      const paid = Number(r?.paid ?? 0);
      return [
        id,
        {
          jobs_created: created,
          jobs_paid: paid,
          jobs_done: Number(r?.done ?? 0),
          failures: Number(r?.failed ?? 0),
          refunds: Number(r?.refunded ?? 0),
          revenue_gbp: Number(r?.revenue_pence ?? 0) / 100,
          refunded_gbp: Number(r?.refunded_pence ?? 0) / 100,
          net_revenue_gbp: (Number(r?.revenue_pence ?? 0) - Number(r?.refunded_pence ?? 0)) / 100,
          conversion_rate_pct: pct(paid, created),
          ...(TOOLS[id].credits ? { uses_completed: Number(r?.usage_done ?? 0) } : {}),
        },
      ];
    }),
  );
  const sum = (k: keyof Row) => rows.reduce((a, r) => a + Number(r[k] ?? 0), 0);
  return {
    since: since.toISOString(),
    totals: {
      jobs_created: sum('created'),
      jobs_paid: sum('paid'),
      failures: sum('failed'),
      refunds: sum('refunded'),
      revenue_gbp: sum('revenue_pence') / 100,
      net_revenue_gbp: (sum('revenue_pence') - sum('refunded_pence')) / 100,
      conversion_rate_pct: pct(sum('paid'), sum('created')),
    },
    per_tool: perTool,
  };
}

export default async (req: Request) => {
  if (!keyMatches(new URL(req.url).searchParams.get('key'))) return errorJson(401, 'Unauthorised');

  const now = new Date();
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const daysAgo = (n: number) => new Date(todayStart.getTime() - (n - 1) * 86_400_000);

  const [today, last7, last30, spend] = await Promise.all([
    windowStats(todayStart),
    windowStats(daysAgo(7)),
    windowStats(daysAgo(30)),
    db()
      .from('daily_spend')
      .select('date, tokens_in, tokens_out, est_cost_gbp')
      .gte('date', daysAgo(30).toISOString().slice(0, 10))
      .order('date', { ascending: false }),
  ]);
  if (spend.error) return errorJson(500, 'stats unavailable');

  const todaySpend = Number(
    spend.data?.find((d) => d.date === todayStart.toISOString().slice(0, 10))?.est_cost_gbp ?? 0,
  );
  return json({
    generated_at: now.toISOString(),
    currency: 'GBP',
    timezone: 'UTC',
    windows: { today, last_7_days: last7, last_30_days: last30 },
    ai_spend: {
      today_gbp: todaySpend,
      daily_cap_gbp: budgetCapGbp(),
      checkouts_paused: todaySpend >= budgetCapGbp(),
      daily: (spend.data ?? []).map((d) => ({
        date: d.date,
        tokens_in: Number(d.tokens_in),
        tokens_out: Number(d.tokens_out),
        est_cost_gbp: Number(d.est_cost_gbp),
      })),
    },
    tools: TOOL_IDS.filter((id) => TOOLS[id].live).map((id) => ({
      id,
      name: TOOLS[id].name,
      route: TOOLS[id].route,
      price_gbp: TOOLS[id].pricePence / 100,
      ...(TOOLS[id].credits ? { uses_per_purchase: TOOLS[id].credits } : {}),
    })),
  });
};
