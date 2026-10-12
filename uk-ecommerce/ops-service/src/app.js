// HTTP application: Shopify webhooks, the n8n-facing API and the owner dashboard.
import { openDb, now } from './db.js';
import { createLogger } from './lib/log.js';
import { getControls, setControl, CONTROL_KEYS } from './lib/controls.js';
import { raiseException, openExceptions, resolveException, takeUnnotified } from './lib/exceptions.js';
import { listApprovals } from './lib/approvals.js';
import { checkWebhookRequest } from './shopify/webhook.js';
import { createShopifyClient, createMockShopify } from './shopify/client.js';
import { createSupplierRegistry } from './suppliers/index.js';
import { ingestWebhook, evaluateOrder, submitSupplierOrders, listOrders, pendingEvaluation, purgeOrderPii } from './orders.js';
import { syncInventory, runPricingMonitor, prepareCandidate } from './catalogue.js';
import { syncTracking, recordTracking } from './tracking.js';
import { handleEnquiry } from './support.js';
import { generateDailyContent, approveContent, rejectContent, dueForPublishing, markPublished } from './marketing.js';
import { dailyReport, weeklyReport, costProjection, vatThresholdCheck } from './reports.js';
import { createReturnCase } from './returns.js';
import { calculate, recommendPrice } from './pricing.js';
import { scoreProduct } from './scoring.js';
import { createAi } from './ai.js';
import { decide } from './actions.js';
import { safeEqual, verifyPassword, createSessionStore, createLoginLimiter, parseCookies, sessionCookie } from './dashboard/auth.js';
import * as views from './dashboard/views.js';

const MAX_BODY = 1_000_000;

export function createContext(cfg, overrides = {}) {
  const db = overrides.db ?? openDb(cfg.dbPath);
  const log = overrides.log ?? createLogger(db, { quiet: overrides.quiet });
  const shopify = overrides.shopify ?? (cfg.testMode ? createMockShopify({ assumePaid: true }) : createShopifyClient(cfg.shopify, { log }));
  const suppliers = overrides.suppliers ?? createSupplierRegistry(cfg, overrides.supplierAdapters);
  const ctx = { cfg, db, log, shopify, suppliers, fetchImpl: overrides.fetchImpl ?? fetch };
  ctx.ai = overrides.ai ?? createAi(ctx);
  return ctx;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY) { reject(Object.assign(new Error('payload_too_large'), { status: 413 })); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; img-src 'self' data:; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",
  'Cache-Control': 'no-store',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

function send(res, status, body, headers = {}) {
  const isHtml = typeof body === 'string';
  res.writeHead(status, { ...SECURITY_HEADERS, 'Content-Type': isHtml ? 'text/html; charset=utf-8' : 'application/json', ...headers });
  res.end(isHtml ? body : JSON.stringify(body));
}
const redirect = (res, to, headers = {}) => { res.writeHead(303, { ...SECURITY_HEADERS, Location: to, ...headers }); res.end(); };

async function forwardToN8n(ctx, payload, webhookId) {
  const { cfg, db, log, fetchImpl } = ctx;
  if (!cfg.n8n.orderWebhookUrl) return false;
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetchImpl(cfg.n8n.orderWebhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Ops-Token': cfg.n8n.sharedSecret }, body: JSON.stringify(payload) });
      if (r.ok) { db.prepare('UPDATE webhook_events SET forwarded = 1 WHERE webhook_id = ?').run(webhookId); return true; }
    } catch (e) { log.warn('webhook', 'Forward to n8n failed', { attempt: i + 1, error: e.message }); }
    await new Promise((r) => setTimeout(r, 300 * 2 ** i));
  }
  // Not fatal: Workflow 05's schedule fallback picks up unevaluated orders.
  log.warn('webhook', 'n8n unreachable; order left for scheduled pickup', { webhookId });
  return false;
}

export function dashboardData(ctx, csrf) {
  const { db, cfg } = ctx;
  const d = new Date();
  const startDay = d.toISOString().slice(0, 10);
  const startWeek = new Date(d.getTime() - 7 * 86_400_000).toISOString();
  const startMonth = `${d.toISOString().slice(0, 7)}-01`;
  const agg = (since) => {
    const orders = db.prepare("SELECT id, total_gbp, tax_gbp FROM orders WHERE created_at >= ? AND financial_status = 'paid'").all(since);
    const revenue = orders.reduce((s, o) => s + (o.total_gbp ?? 0), 0);
    const net = orders.reduce((s, o) => s + (o.total_gbp ?? 0) - (o.tax_gbp ?? 0), 0);
    const supplierCosts = orders.reduce((s, o) => s + db.prepare('SELECT COALESCE(SUM(cost_gbp),0) AS s FROM supplier_orders WHERE order_id = ?').get(o.id).s, 0);
    const p = cfg.pricing;
    const paymentFees = orders.reduce((s, o) => s + (o.total_gbp ?? 0) * ((p.paymentFeePct ?? 0) + (p.platformTxnFeePct ?? 0) + (p.fxFeePct ?? 0)) + (p.paymentFeeFixedGbp ?? 0), 0);
    return { orders: orders.length, revenue, supplierCosts, paymentFees, aov: orders.length ? revenue / orders.length : 0, contribution: net - supplierCosts - paymentFees };
  };
  const productRows = db.prepare('SELECT * FROM products').all();
  const low = cfg.pricing.lowStockThreshold ?? 5;
  return {
    csrf, testMode: cfg.testMode,
    sales: { today: agg(startDay), week: agg(startWeek), month: agg(startMonth) },
    controls: getControls(db),
    orderStates: Object.fromEntries(db.prepare('SELECT state, COUNT(*) AS n FROM orders GROUP BY state').all().map((r) => [r.state, r.n])),
    products: {
      active: productRows.filter((p) => p.status === 'active').length,
      lowStock: productRows.filter((p) => p.approved && p.stock !== null && p.stock <= low).length,
      review: productRows.filter((p) => !p.approved || p.status.startsWith('paused')).length,
      poorMargin: productRows.filter((p) => p.status === 'paused_margin').length,
      best: db.prepare(`SELECT l.sku, p.title, SUM(l.quantity) AS units FROM order_lines l JOIN orders o ON o.id = l.order_id LEFT JOIN products p ON p.sku = l.sku
        WHERE o.created_at >= ? GROUP BY l.sku ORDER BY units DESC LIMIT 5`).all(new Date(d.getTime() - 30 * 86_400_000).toISOString()),
    },
    content: Object.fromEntries(db.prepare('SELECT status, COUNT(*) AS n FROM content GROUP BY status').all().map((r) => [r.status, r.n])),
    refunds: db.prepare("SELECT COALESCE(SUM(refund_amount_gbp),0) AS s FROM return_cases WHERE status = 'refund_approved_issue_in_shopify' AND updated_at >= ?").get(startMonth).s,
    costs: costProjection(ctx, d),
    vat: vatThresholdCheck(ctx, d),
    alerts: openExceptions(db),
    approvals: listApprovals(db).length,
  };
}

export function createApp(ctx) {
  const { cfg, db, log } = ctx;
  const sessions = createSessionStore(db, cfg.dashboard.sessionHours);
  const limiter = createLoginLimiter();

  const apiAuth = (req) => {
    const h = req.headers.authorization ?? '';
    return h.startsWith('Bearer ') && cfg.apiToken && safeEqual(h.slice(7), cfg.apiToken);
  };
  const sessionOf = (req) => sessions.get(parseCookies(req.headers.cookie).ops_session);

  // [method, pattern, handler, kind]  kind: public | api | page | form
  const routes = [];
  const add = (m, p, h, kind) => routes.push([m, p, h, kind]);

  add('GET', /^\/healthz$/, () => ({ status: 200, body: { ok: true, testMode: cfg.testMode, time: now() } }), 'public');

  add('POST', /^\/webhooks\/shopify$/, async ({ req, raw }) => {
    const check = checkWebhookRequest({ rawBody: raw, headers: req.headers, secret: cfg.shopify.webhookSecret, expectedShop: cfg.shopify.shopDomain || undefined });
    if (!check.ok) { log.warn('webhook', 'Rejected webhook', { error: check.error }); return { status: check.status, body: { error: check.error } }; }
    let payload;
    try { payload = JSON.parse(raw.toString('utf8')); } catch { return { status: 400, body: { error: 'invalid_json' } }; }
    const r = ingestWebhook(ctx, check.meta, payload);
    if (r.forward) forwardToN8n(ctx, { orderId: r.orderId, topic: r.topic, webhookId: check.meta.webhookId }, check.meta.webhookId); // async, after 200
    return { status: 200, body: { ok: true, duplicate: Boolean(r.duplicate) } };
  }, 'public');

  // ---- API for n8n (Bearer token) ----
  add('POST', /^\/api\/orders\/([\w-]+)\/evaluate$/, async ({ m }) => ({ body: await evaluateOrder(ctx, m[1]) }), 'api');
  add('POST', /^\/api\/orders\/([\w-]+)\/submit$/, async ({ m }) => ({ body: await submitSupplierOrders(ctx, m[1]) }), 'api');
  add('GET', /^\/api\/orders\/pending-evaluation$/, () => ({ body: { orders: pendingEvaluation(db) } }), 'api');
  add('POST', /^\/api\/inventory\/sync$/, async () => ({ body: await syncInventory(ctx) }), 'api');
  add('POST', /^\/api\/pricing\/monitor$/, async () => ({ body: { reviews: await runPricingMonitor(ctx) } }), 'api');
  add('POST', /^\/api\/pricing\/calculate$/, ({ json }) => ({ body: { breakdown: calculate(json, cfg.pricing), recommended: recommendPrice(json, cfg.pricing) } }), 'api');
  add('POST', /^\/api\/research\/score$/, ({ json }) => {
    const rows = Array.isArray(json?.rows) ? json.rows : [];
    const scored = rows.map((r) => scoreProduct(r, cfg.pricing)).sort((a, b) => b.score - a.score);
    return { body: { scored } };
  }, 'api');
  add('POST', /^\/api\/products\/candidates$/, async ({ json }) => {
    const out = [];
    for (const r of json?.rows ?? []) out.push(await prepareCandidate(ctx, r));
    return { body: { results: out } };
  }, 'api');
  add('POST', /^\/api\/tracking\/sync$/, async () => ({ body: await syncTracking(ctx) }), 'api');
  add('POST', /^\/api\/tracking$/, async ({ json }) => ({ body: await recordTracking(ctx, json ?? {}) }), 'api');
  add('POST', /^\/api\/support\/enquiry$/, async ({ json }) => ({ body: await handleEnquiry(ctx, json ?? {}) }), 'api');
  add('POST', /^\/api\/returns$/, ({ json }) => ({ body: createReturnCase(ctx, json ?? {}) }), 'api');
  add('POST', /^\/api\/marketing\/generate$/, async ({ json }) => ({ body: await generateDailyContent(ctx, { date: json?.date ? new Date(json.date) : new Date() }) }), 'api');
  add('GET', /^\/api\/marketing\/due$/, ({ url }) => ({ body: dueForPublishing(db, url.searchParams.get('channel') ?? 'pinterest') }), 'api');
  add('POST', /^\/api\/marketing\/(\d+)\/published$/, ({ m, json }) => {
    const ok = markPublished(db, Number(m[1]), json?.externalId);
    return { status: ok ? 200 : 409, body: { ok } };
  }, 'api');
  add('POST', /^\/api\/metrics$/, ({ json }) => {
    const st = db.prepare(`INSERT INTO marketing_metrics (day, channel, impressions, clicks, sessions, orders) VALUES (?,?,?,?,?,?)
      ON CONFLICT(day, channel) DO UPDATE SET impressions=excluded.impressions, clicks=excluded.clicks, sessions=excluded.sessions, orders=excluded.orders`);
    for (const r of json?.rows ?? []) st.run(r.day, r.channel, r.impressions ?? null, r.clicks ?? null, r.sessions ?? null, r.orders ?? null);
    return { body: { ok: true } };
  }, 'api');
  add('GET', /^\/api\/reports\/daily$/, () => ({ body: dailyReport(ctx) }), 'api');
  add('GET', /^\/api\/reports\/weekly$/, () => ({ body: weeklyReport(ctx) }), 'api');
  add('POST', /^\/api\/errors$/, ({ json }) => {
    const e = raiseException(db, { source: `n8n:${json?.workflow ?? 'unknown'}`, ref: json?.executionId ?? null, severity: json?.severity ?? 'error', message: String(json?.message ?? 'Workflow failed').slice(0, 500), details: { node: json?.node, url: json?.url } });
    return { body: { ok: true, id: e.id, occurrences: e.occurrences } };
  }, 'api');
  add('GET', /^\/api\/alerts\/pending$/, () => ({ body: { alerts: takeUnnotified(db) } }), 'api');
  add('POST', /^\/api\/logs$/, ({ json }) => { log[json?.level === 'error' ? 'error' : json?.level === 'warn' ? 'warn' : 'info'](`n8n:${json?.workflow ?? '?'}`, String(json?.message ?? ''), json?.data); return { body: { ok: true } }; }, 'api');
  add('GET', /^\/api\/controls$/, () => ({ body: getControls(db) }), 'api');
  // The API token can PAUSE (fail-safe) but only the owner, via the dashboard, can resume.
  add('POST', /^\/api\/controls$/, ({ json }) => {
    if (!CONTROL_KEYS[json?.key]) return { status: 400, body: { error: 'unknown_control' } };
    if (json.paused !== true) return { status: 403, body: { error: 'resume_requires_dashboard' } };
    return { body: setControl(db, json.key, true, 'api') };
  }, 'api');
  add('POST', /^\/api\/maintenance\/purge$/, () => {
    const cutoff = new Date(Date.now() - cfg.retention.piiDays * 86_400_000).toISOString();
    const ids = db.prepare("SELECT id FROM orders WHERE pii_purged = 0 AND state IN ('shipped','delivered','cancelled','rejected_by_owner') AND updated_at < ?").all(cutoff);
    for (const { id } of ids) purgeOrderPii(db, id);
    const logs = db.prepare('DELETE FROM logs WHERE ts < ?').run(new Date(Date.now() - cfg.retention.logDays * 86_400_000).toISOString()).changes;
    const tickets = db.prepare("UPDATE support_tickets SET body = NULL, from_email = NULL WHERE created_at < ?").run(cutoff).changes;
    return { body: { ordersPurged: ids.length, logsDeleted: logs, ticketsRedacted: tickets } };
  }, 'api');

  // ---- Owner dashboard ----
  add('GET', /^\/dashboard\/login$/, () => ({ html: views.loginPage({ testMode: cfg.testMode }) }), 'public');
  add('POST', /^\/dashboard\/login$/, ({ req, form, res }) => {
    const ip = req.socket.remoteAddress ?? 'unknown';
    if (limiter.blocked(ip)) return { status: 429, html: views.loginPage({ error: 'Too many attempts. Try again in 15 minutes.', testMode: cfg.testMode }) };
    const okUser = safeEqual(form.get('username'), cfg.dashboard.username);
    const okPass = cfg.dashboard.passwordHash && verifyPassword(form.get('password') ?? '', cfg.dashboard.passwordHash);
    if (!okUser || !okPass) {
      limiter.fail(ip);
      log.warn('dashboard', 'Failed login', { ip });
      return { status: 401, html: views.loginPage({ error: 'Incorrect username or password.', testMode: cfg.testMode }) };
    }
    limiter.reset(ip);
    const s = sessions.create(cfg.dashboard.username);
    log.info('dashboard', 'Owner signed in', { ip });
    redirect(res, '/dashboard', { 'Set-Cookie': sessionCookie(s.id, { secure: cfg.dashboard.secureCookies, maxAgeSeconds: cfg.dashboard.sessionHours * 3600 }) });
    return null;
  }, 'public');
  add('POST', /^\/dashboard\/logout$/, ({ session, res }) => {
    sessions.destroy(session.id);
    redirect(res, '/dashboard/login', { 'Set-Cookie': sessionCookie('', { secure: cfg.dashboard.secureCookies, maxAgeSeconds: 0 }) });
    return null;
  }, 'form');
  add('GET', /^\/dashboard\/?$/, ({ session }) => ({ html: views.overviewPage(dashboardData(ctx, session.csrf)) }), 'page');
  add('GET', /^\/dashboard\/approvals$/, ({ session }) => ({ html: views.approvalsPage({ approvals: listApprovals(db), csrf: session.csrf, testMode: cfg.testMode }) }), 'page');
  add('GET', /^\/dashboard\/orders$/, ({ session }) => ({ html: views.ordersPage({ orders: listOrders(db, { limit: 100 }), csrf: session.csrf, testMode: cfg.testMode }) }), 'page');
  add('GET', /^\/dashboard\/products$/, ({ session }) => ({ html: views.productsPage({ products: db.prepare('SELECT * FROM products ORDER BY title').all(), csrf: session.csrf, testMode: cfg.testMode }) }), 'page');
  add('GET', /^\/dashboard\/content$/, ({ session }) => ({ html: views.contentPage({ items: db.prepare("SELECT * FROM content WHERE status = 'pending_approval' ORDER BY created_at LIMIT 50").all(), csrf: session.csrf, testMode: cfg.testMode }) }), 'page');
  add('GET', /^\/dashboard\/alerts$/, ({ session }) => ({ html: views.alertsPage({ alerts: openExceptions(db), csrf: session.csrf, testMode: cfg.testMode }) }), 'page');
  add('POST', /^\/dashboard\/approvals\/(\d+)$/, async ({ m, form, res }) => { await decide(ctx, Number(m[1]), form.get('decision'), cfg.dashboard.username); redirect(res, '/dashboard/approvals'); return null; }, 'form');
  add('POST', /^\/dashboard\/content\/(\d+)$/, ({ m, form, res }) => {
    if (form.get('action') === 'approve') approveContent(db, Number(m[1])); else rejectContent(db, Number(m[1]));
    redirect(res, '/dashboard/content'); return null;
  }, 'form');
  add('POST', /^\/dashboard\/controls$/, ({ form, res }) => {
    if (CONTROL_KEYS[form.get('key')]) {
      setControl(db, form.get('key'), form.get('paused') === 'true', cfg.dashboard.username);
      log.warn('controls', 'Control changed by owner', { key: form.get('key'), paused: form.get('paused') });
    }
    redirect(res, '/dashboard'); return null;
  }, 'form');
  add('POST', /^\/dashboard\/alerts\/(\d+)\/resolve$/, ({ m, res }) => { resolveException(db, Number(m[1])); redirect(res, '/dashboard/alerts'); return null; }, 'form');
  add('POST', /^\/dashboard\/tracking$/, async ({ form, res }) => {
    await recordTracking(ctx, { orderId: form.get('orderId'), supplier: form.get('supplier'), number: form.get('number'), company: form.get('company') });
    redirect(res, '/dashboard/orders'); return null;
  }, 'form');

  return async function handler(req, res) {
    const url = new URL(req.url, 'http://localhost');
    try {
      const route = routes.find(([m, p]) => m === req.method && p.test(url.pathname));
      if (!route) return send(res, 404, { error: 'not_found' });
      const [, pattern, fn, kind] = route;
      const raw = req.method === 'POST' ? await readBody(req) : Buffer.alloc(0);
      let json = null, form = new URLSearchParams();
      const type = req.headers['content-type'] ?? '';
      if (raw.length && type.includes('application/json') && !url.pathname.startsWith('/webhooks/')) {
        try { json = JSON.parse(raw.toString('utf8')); } catch { return send(res, 400, { error: 'invalid_json' }); }
      }
      if (raw.length && type.includes('application/x-www-form-urlencoded')) form = new URLSearchParams(raw.toString('utf8'));

      let session = null;
      if (kind === 'api' && !apiAuth(req)) return send(res, 401, { error: 'unauthorised' });
      if (kind === 'page' || kind === 'form') {
        session = sessionOf(req);
        if (!session) return kind === 'page' ? redirect(res, '/dashboard/login') : send(res, 401, { error: 'unauthorised' });
        if (kind === 'form' && !safeEqual(form.get('csrf'), session.csrf)) return send(res, 403, { error: 'csrf' });
      }
      const out = await fn({ req, res, url, m: url.pathname.match(pattern), raw, json, form, session });
      if (out === null) return; // handler already responded (redirect)
      if (out.html !== undefined) return send(res, out.status ?? 200, out.html);
      return send(res, out.status ?? 200, out.body ?? {});
    } catch (e) {
      log.error('http', 'Unhandled error', { path: url.pathname, error: e.message });
      if (e.status === 413) return send(res, 413, { error: 'payload_too_large' });
      return send(res, 500, { error: 'internal_error' });
    }
  };
}
