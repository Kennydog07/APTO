// Central configuration. Every secret comes from the environment; nothing
// sensitive is hard-coded. See .env.example for the full list.
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(here, '..');

function num(name, fallback) {
  const v = process.env[name];
  if (v === undefined || v === '') return fallback;
  const n = Number(v);
  if (!Number.isFinite(n)) throw new Error(`Environment variable ${name} must be a number`);
  return n;
}
function bool(name, fallback) {
  const v = process.env[name];
  if (v === undefined || v === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(v.toLowerCase());
}
function str(name, fallback = '') {
  const v = process.env[name];
  return v === undefined || v === '' ? fallback : v;
}

export function loadJson(rel) {
  const p = path.join(ROOT, 'config', rel);
  return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : {};
}

export function loadConfig() {
  const testMode = bool('TEST_MODE', true); // safe default: test mode ON
  const cfg = {
    env: str('NODE_ENV', 'development'),
    testMode,
    port: num('PORT', 8080),
    publicBaseUrl: str('PUBLIC_BASE_URL', 'http://localhost:8080'),
    storeUrl: str('STORE_URL', 'https://example.co.uk'),
    dbPath: str('DB_PATH', path.join(ROOT, 'data', 'ops.sqlite')),
    apiToken: str('OPS_API_TOKEN'),
    shopify: {
      shopDomain: str('SHOPIFY_SHOP_DOMAIN'), // e.g. your-store.myshopify.com
      apiVersion: str('SHOPIFY_API_VERSION', '2026-07'),
      adminToken: str('SHOPIFY_ADMIN_TOKEN'),
      clientId: str('SHOPIFY_CLIENT_ID'),
      clientSecret: str('SHOPIFY_CLIENT_SECRET'),
      webhookSecret: str('SHOPIFY_WEBHOOK_SECRET'),
      notifyCustomerOnFulfilment: bool('SHOPIFY_NOTIFY_CUSTOMER', true),
    },
    n8n: {
      orderWebhookUrl: str('N8N_ORDER_WEBHOOK_URL'),
      sharedSecret: str('N8N_SHARED_SECRET'),
    },
    dashboard: {
      username: str('DASHBOARD_USERNAME', 'owner'),
      passwordHash: str('DASHBOARD_PASSWORD_HASH'),
      secureCookies: bool('SECURE_COOKIES', !testMode),
      sessionHours: num('SESSION_HOURS', 12),
    },
    ai: {
      apiKeyPresent: Boolean(process.env.ANTHROPIC_API_KEY),
      model: str('AI_MODEL', 'claude-opus-5-5'),
      monthlyBudgetGbp: num('AI_MONTHLY_BUDGET_GBP', 15),
      usdToGbp: num('USD_TO_GBP', 0.79),
    },
    orders: {
      autoOrderMaxGbp: num('AUTO_ORDER_MAX_GBP', 75),
      dailyAutoOrderCapGbp: num('DAILY_AUTO_ORDER_CAP_GBP', 300),
      submitStaleMinutes: num('SUBMIT_STALE_MINUTES', 15),
      maxSubmitAttempts: num('MAX_SUBMIT_ATTEMPTS', 3),
      shipToCountries: str('SHIP_TO_COUNTRIES', 'GB').split(',').map((s) => s.trim()),
    },
    retention: {
      piiDays: num('PII_RETENTION_DAYS', 90),
      logDays: num('LOG_RETENTION_DAYS', 90),
    },
    budget: {
      alertMonthlyGbp: num('BUDGET_ALERT_GBP', 80),
    },
    alerts: {
      ownerEmail: str('OWNER_ALERT_EMAIL'),
    },
    pricing: loadJson('pricing.json'),
    costs: loadJson('costs.json'),
    suppliers: loadJson('suppliers.json'),
    support: loadJson('support.json'),
  };
  return cfg;
}

// Fail fast in production if the essentials are missing.
export function assertProductionReady(cfg) {
  const missing = [];
  if (!cfg.apiToken || cfg.apiToken.length < 32) missing.push('OPS_API_TOKEN (32+ chars)');
  if (!cfg.dashboard.passwordHash) missing.push('DASHBOARD_PASSWORD_HASH');
  if (!cfg.testMode) {
    if (!cfg.shopify.shopDomain) missing.push('SHOPIFY_SHOP_DOMAIN');
    if (!cfg.shopify.webhookSecret) missing.push('SHOPIFY_WEBHOOK_SECRET');
    if (!cfg.shopify.adminToken && !(cfg.shopify.clientId && cfg.shopify.clientSecret)) {
      missing.push('SHOPIFY_ADMIN_TOKEN or SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET');
    }
  }
  return missing;
}
