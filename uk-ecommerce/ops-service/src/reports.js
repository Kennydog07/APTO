// Daily business report (Workflow 11), weekly optimisation (Workflow 13)
// and the operating-cost projection. Figures are estimates built from the
// operations database; Shopify and your accounts remain the source of truth.
import { now } from './db.js';
import { withDefaults } from './pricing.js';
import { monthSpendGbp } from './ai.js';
import { getControls } from './lib/controls.js';
import { openExceptions } from './lib/exceptions.js';
import { listApprovals } from './lib/approvals.js';

const r2 = (n) => Math.round((n ?? 0) * 100) / 100;
const dayOf = (d) => d.toISOString().slice(0, 10);

export function costProjection(ctx, at = new Date()) {
  const { db, cfg } = ctx;
  const fixed = (cfg.costs.monthly ?? []).reduce((s, i) => s + i.gbp, 0) - ((cfg.costs.monthly ?? []).find((i) => /AI API/.test(i.item))?.gbp ?? 0);
  const month = dayOf(at).slice(0, 7);
  const aiSoFar = monthSpendGbp(db, month);
  const day = at.getUTCDate();
  const daysInMonth = new Date(Date.UTC(at.getUTCFullYear(), at.getUTCMonth() + 1, 0)).getUTCDate();
  const aiProjected = Math.min(cfg.ai.monthlyBudgetGbp, (aiSoFar / Math.max(1, day)) * daysInMonth);
  const projected = fixed + aiProjected;
  return {
    fixedGbp: r2(fixed), aiMonthToDateGbp: r2(aiSoFar), aiProjectedGbp: r2(aiProjected), projectedMonthlyGbp: r2(projected),
    alertThresholdGbp: cfg.budget.alertMonthlyGbp, overThreshold: projected > cfg.budget.alertMonthlyGbp,
    unverifiedItems: (cfg.costs.monthly ?? []).filter((i) => !i.verified).map((i) => i.item),
  };
}

/**
 * UK VAT registration threshold monitor (for traders not yet VAT-registered).
 * Compulsory registration applies if taxable turnover in the last 12 months
 * exceeds the threshold, or is expected to in the next 30 days alone.
 * Uses paid order totals as a proxy for taxable turnover (confirm with your accountant).
 */
export function vatThresholdCheck(ctx, at = new Date()) {
  const { db, cfg } = ctx;
  const threshold = Number(process.env.VAT_THRESHOLD_GBP ?? 90000);
  const sum = (days) => db.prepare("SELECT COALESCE(SUM(total_gbp),0) AS s FROM orders WHERE financial_status = 'paid' AND created_at >= ? AND created_at <= ?")
    .get(new Date(at.getTime() - days * 86_400_000).toISOString(), at.toISOString()).s;
  const rolling12m = r2(sum(365));
  const last30 = r2(sum(30));
  const pct = rolling12m / threshold;
  let level = 'ok';
  if (pct >= 0.9 || last30 >= threshold) level = 'critical';
  else if (pct >= 0.75) level = 'warning';
  return {
    applies: !cfg.pricing.vatRegistered, threshold, rolling12mTurnoverGbp: rolling12m, last30DaysGbp: last30, percentOfThreshold: Math.round(pct * 1000) / 10, level,
    message: level === 'ok' ? null : `Rolling 12-month turnover £${rolling12m} is ${Math.round(pct * 100)}% of the £${threshold} VAT threshold — speak to your accountant about registering (you must notify HMRC within 30 days of exceeding it).`,
  };
}

function orderEconomics(ctx, orders) {
  const a = withDefaults(ctx.cfg.pricing);
  let revenue = 0, net = 0, supplier = 0, fees = 0;
  for (const o of orders) {
    const total = o.total_gbp ?? 0;
    revenue += total;
    net += total - (o.tax_gbp ?? 0);
    fees += total * (a.paymentFeePct + a.platformTxnFeePct + a.fxFeePct) + a.paymentFeeFixedGbp;
    supplier += ctx.db.prepare('SELECT COALESCE(SUM(cost_gbp),0) AS s FROM supplier_orders WHERE order_id = ?').get(o.id).s;
  }
  const returnsAllowance = net * a.returnsAllowancePct;
  return { revenue: r2(revenue), netOfVat: r2(net), supplierCosts: r2(supplier), paymentFees: r2(fees), returnsAllowance: r2(returnsAllowance),
    estimatedContribution: r2(net - supplier - fees - returnsAllowance - orders.length * (a.cacPerOrderGbp + a.otherVariablePerOrderGbp)) };
}

export function dailyReport(ctx, { date = new Date() } = {}) {
  const { db, cfg } = ctx;
  const since = new Date(date.getTime() - 86_400_000).toISOString();
  const orders = db.prepare("SELECT * FROM orders WHERE created_at >= ? AND created_at < ? AND financial_status = 'paid'").all(since, date.toISOString());
  const econ = orderEconomics(ctx, orders);
  const unfulfilled = db.prepare("SELECT name, state, state_reason, created_at FROM orders WHERE state NOT IN ('shipped','delivered','cancelled') ORDER BY created_at").all();
  const liabilities = db.prepare("SELECT supplier, COUNT(*) AS n, COALESCE(SUM(cost_gbp),0) AS gbp FROM supplier_orders WHERE status IN ('awaiting_payment','awaiting_manual','confirmed','submitted') AND tracking_synced = 0 GROUP BY supplier").all();
  const returns = db.prepare("SELECT status, COUNT(*) AS n FROM return_cases WHERE status NOT IN ('closed') GROUP BY status").all();
  const lowStock = db.prepare("SELECT sku, title, stock, status FROM products WHERE approved = 1 AND (stock <= ? OR status LIKE 'paused%')").all(cfg.pricing.lowStockThreshold ?? 5);
  const failures = db.prepare("SELECT source, severity, message, occurrences FROM exceptions WHERE last_seen >= ? ORDER BY last_seen DESC").all(since);
  const content = Object.fromEntries(db.prepare('SELECT status, COUNT(*) AS n FROM content GROUP BY status').all().map((r) => [r.status, r.n]));
  const published = db.prepare('SELECT channel, COUNT(*) AS n FROM content WHERE published_at >= ? GROUP BY channel').all(since);
  const metrics = db.prepare('SELECT channel, impressions, clicks, sessions, orders FROM marketing_metrics WHERE day = ?').all(dayOf(new Date(date.getTime() - 86_400_000)));
  const approvals = listApprovals(db);
  const critical = openExceptions(db).filter((e) => ['critical', 'error'].includes(e.severity));
  const support = db.prepare("SELECT status, COUNT(*) AS n FROM support_tickets WHERE created_at >= ? GROUP BY status").all(since);
  const costs = costProjection(ctx, date);
  const controls = getControls(db);
  const vat = vatThresholdCheck(ctx, date);

  const attention = [
    ...critical.map((e) => `[${e.severity.toUpperCase()}] ${e.message}`),
    ...approvals.map((a) => `[APPROVAL] ${a.summary}`),
    ...(vat.applies && vat.message ? [`[VAT] ${vat.message}`] : []),
    ...(costs.overThreshold ? [`[BUDGET] Projected monthly software cost £${costs.projectedMonthlyGbp} exceeds £${costs.alertThresholdGbp}`] : []),
    ...Object.values(controls).filter((c) => c.paused).map((c) => `[PAUSED] ${c.label}`),
  ];

  const report = {
    generatedAt: now(), period: { from: since, to: date.toISOString() }, testMode: cfg.testMode,
    sales: { orders: orders.length, ...econ, averageOrderValue: orders.length ? r2(econ.revenue / orders.length) : 0 },
    unfulfilledOrders: unfulfilled, supplierLiabilities: liabilities, returnsAndRefunds: returns, lowStockProducts: lowStock,
    workflowFailures: failures, marketing: { content, publishedLast24h: published, metrics }, support, costs, vatThreshold: vat, tasksRequiringAttention: attention,
  };
  report.text = renderText(report);
  return report;
}

function renderText(r) {
  const L = [];
  L.push(`DAILY REPORT ${r.period.to.slice(0, 10)}${r.testMode ? ' [TEST MODE]' : ''}`);
  L.push(`Orders: ${r.sales.orders} | Revenue £${r.sales.revenue} | Est. contribution £${r.sales.estimatedContribution} | AOV £${r.sales.averageOrderValue}`);
  L.push(`Unfulfilled orders: ${r.unfulfilledOrders.length} | Supplier liabilities: £${r2(r.supplierLiabilities.reduce((s, x) => s + x.gbp, 0))}`);
  L.push(`Low-stock/paused products: ${r.lowStockProducts.length} | Failures (24h): ${r.workflowFailures.length}`);
  L.push(`Content awaiting approval: ${r.marketing.content.pending_approval ?? 0} | Published (24h): ${r.marketing.publishedLast24h.reduce((s, x) => s + x.n, 0)}`);
  if (r.vatThreshold.applies) L.push(`VAT threshold: rolling 12-month turnover £${r.vatThreshold.rolling12mTurnoverGbp} (${r.vatThreshold.percentOfThreshold}% of £${r.vatThreshold.threshold})`);
  L.push(`Projected monthly software cost: £${r.costs.projectedMonthlyGbp} (alert at £${r.costs.alertThresholdGbp})`);
  L.push('');
  L.push(r.tasksRequiringAttention.length ? 'NEEDS YOUR ATTENTION:' : 'Nothing needs your attention today.');
  for (const t of r.tasksRequiringAttention) L.push(`- ${t}`);
  return L.join('\n');
}

export function weeklyReport(ctx, { date = new Date() } = {}) {
  const { db } = ctx;
  const since = new Date(date.getTime() - 7 * 86_400_000).toISOString();
  const since14 = new Date(date.getTime() - 14 * 86_400_000).toISOString();
  const orders = db.prepare("SELECT * FROM orders WHERE created_at >= ? AND financial_status = 'paid'").all(since);
  const econ = orderEconomics(ctx, orders);
  const bySku = db.prepare(`SELECT l.sku, p.title, SUM(l.quantity) AS units, SUM(l.quantity * l.unit_price_gbp) AS revenue
    FROM order_lines l JOIN orders o ON o.id = l.order_id LEFT JOIN products p ON p.sku = l.sku
    WHERE o.created_at >= ? AND o.financial_status = 'paid' GROUP BY l.sku ORDER BY revenue DESC`).all(since);
  const active = db.prepare("SELECT sku, title, price_gbp, cost_gbp, shipping_gbp, updated_at FROM products WHERE approved = 1 AND status = 'active'").all();
  const soldRecently = new Set(db.prepare('SELECT DISTINCT l.sku FROM order_lines l JOIN orders o ON o.id = l.order_id WHERE o.created_at >= ?').all(since14).map((r) => r.sku));
  const returns = db.prepare('SELECT COUNT(*) AS n FROM return_cases WHERE created_at >= ?').get(since).n;
  const supplierIssues = db.prepare("SELECT ref, COUNT(*) AS n FROM exceptions WHERE source IN ('fulfilment','tracking','inventory') AND last_seen >= ? GROUP BY ref").all(since);
  const traffic = db.prepare('SELECT channel, SUM(sessions) AS sessions, SUM(orders) AS orders, SUM(clicks) AS clicks, SUM(impressions) AS impressions FROM marketing_metrics WHERE day >= ? GROUP BY channel').all(since.slice(0, 10));
  const sessions = traffic.reduce((s, t) => s + (t.sessions ?? 0), 0);

  const recs = [];
  for (const p of active) if (!soldRecently.has(p.sku)) recs.push(`No sales for ${p.title} in 14 days — review imagery/price or nominate a replacement from the research queue.`);
  const refundRate = orders.length ? returns / orders.length : 0;
  if (refundRate > 0.1) recs.push(`Return rate ${(refundRate * 100).toFixed(0)}% this week — investigate product quality and descriptions.`);
  if (supplierIssues.length >= 3) recs.push(`${supplierIssues.length} supplier-related issues this week — review supplier reliability.`);
  if (sessions > 200 && orders.length / sessions < 0.005) recs.push('Conversion below 0.5% on meaningful traffic — review product pages, delivery messaging and pricing.');
  if (!recs.length) recs.push('No issues detected by the rule set this week.');

  return {
    generatedAt: now(), period: { from: since, to: date.toISOString() },
    sales: { orders: orders.length, ...econ }, productPerformance: bySku, returnRate: r2(refundRate), supplierIssues, traffic,
    conversionRate: sessions ? r2(orders.length / sessions) : null, recommendations: recs,
    note: 'Recommendations only. No spending, price changes or new products are authorised by this report.',
  };
}
