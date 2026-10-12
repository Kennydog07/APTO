// SQLite persistence using Node's built-in driver (no native build step).
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const SCHEMA = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS controls (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  updated_by TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS webhook_events (
  webhook_id TEXT PRIMARY KEY,
  topic TEXT NOT NULL,
  shop TEXT,
  resource_id TEXT,
  received_at TEXT NOT NULL,
  forwarded INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT,
  created_at TEXT,
  financial_status TEXT,
  cancelled_at TEXT,
  currency TEXT,
  subtotal_gbp REAL,
  total_gbp REAL,
  tax_gbp REAL,
  shipping_gbp REAL,
  ship_country TEXT,
  ship_address TEXT,
  tags TEXT,
  state TEXT NOT NULL DEFAULT 'received',
  state_reason TEXT,
  pii_purged INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS order_lines (
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  line_id TEXT NOT NULL,
  sku TEXT,
  variant_id TEXT,
  title TEXT,
  quantity INTEGER NOT NULL,
  unit_price_gbp REAL,
  PRIMARY KEY (order_id, line_id)
);

CREATE TABLE IF NOT EXISTS products (
  sku TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  shopify_product_id TEXT,
  shopify_variant_id TEXT,
  inventory_item_id TEXT,
  supplier TEXT NOT NULL,
  supplier_sku TEXT,
  supplier_variant_id TEXT,
  cost_gbp REAL,
  shipping_gbp REAL,
  price_gbp REAL,
  competitor_price_gbp REAL,
  stock INTEGER,
  status TEXT NOT NULL DEFAULT 'draft',
  approved INTEGER NOT NULL DEFAULT 0,
  cost_verified INTEGER NOT NULL DEFAULT 0,
  delivery_estimate TEXT,
  specs TEXT,
  handle TEXT,
  image_url TEXT,
  benefits TEXT,
  stock_mismatch_count INTEGER NOT NULL DEFAULT 0,
  last_checked_at TEXT,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS supplier_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL REFERENCES orders(id),
  supplier TEXT NOT NULL,
  idempotency_key TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL,
  external_id TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  cost_gbp REAL,
  tracking_number TEXT,
  tracking_company TEXT,
  tracking_url TEXT,
  tracking_synced INTEGER NOT NULL DEFAULT 0,
  delivered_at TEXT,
  claimed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (order_id, supplier)
);

CREATE TABLE IF NOT EXISTS approvals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  ref TEXT NOT NULL,
  summary TEXT NOT NULL,
  payload TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL,
  decided_at TEXT,
  decided_by TEXT,
  UNIQUE (type, ref, status)
);

CREATE TABLE IF NOT EXISTS exceptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fingerprint TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL,
  ref TEXT,
  severity TEXT NOT NULL,
  message TEXT NOT NULL,
  details TEXT,
  occurrences INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'open',
  notified INTEGER NOT NULL DEFAULT 0,
  first_seen TEXT NOT NULL,
  last_seen TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL,
  level TEXT NOT NULL,
  source TEXT NOT NULL,
  message TEXT NOT NULL,
  data TEXT
);

CREATE TABLE IF NOT EXISTS content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fingerprint TEXT NOT NULL UNIQUE,
  channel TEXT NOT NULL,
  kind TEXT NOT NULL,
  product_sku TEXT,
  title TEXT,
  body TEXT NOT NULL,
  meta TEXT,
  status TEXT NOT NULL DEFAULT 'pending_approval',
  scheduled_for TEXT,
  published_at TEXT,
  external_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS support_tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message_id TEXT UNIQUE,
  channel TEXT NOT NULL,
  from_email TEXT,
  subject TEXT,
  body TEXT,
  category TEXT NOT NULL,
  order_name TEXT,
  verified INTEGER NOT NULL DEFAULT 0,
  draft_reply TEXT,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS return_cases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  kind TEXT NOT NULL,
  within_cancellation_window INTEGER,
  status TEXT NOT NULL,
  refund_amount_gbp REAL,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS price_changes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sku TEXT NOT NULL,
  old_price_gbp REAL,
  new_price_gbp REAL NOT NULL,
  reason TEXT,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ai_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL,
  model TEXT NOT NULL,
  purpose TEXT NOT NULL,
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  cost_gbp REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS marketing_metrics (
  day TEXT NOT NULL,
  channel TEXT NOT NULL,
  impressions INTEGER, clicks INTEGER, sessions INTEGER, orders INTEGER,
  PRIMARY KEY (day, channel)
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  csrf TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_state ON orders(state);
CREATE INDEX IF NOT EXISTS idx_content_status ON content(status);
CREATE INDEX IF NOT EXISTS idx_exceptions_status ON exceptions(status);
CREATE INDEX IF NOT EXISTS idx_logs_ts ON logs(ts);
`;

export function openDb(file) {
  if (file !== ':memory:') mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec(SCHEMA);
  return db;
}

export const now = () => new Date().toISOString();

// Run fn inside a transaction (BEGIN IMMEDIATE takes the write lock up front).
export function tx(db, fn) {
  db.exec('BEGIN IMMEDIATE');
  try {
    const r = fn();
    db.exec('COMMIT');
    return r;
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
}
