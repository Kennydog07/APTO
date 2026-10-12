import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtempSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createApp } from '../src/app.js';
import { hashPassword, verifyPassword } from '../src/dashboard/auth.js';
import { backupDatabase, restoreDatabase } from '../src/lib/backup.js';
import { openDb } from '../src/db.js';
import { testCtx, seedProduct, API_TOKEN } from './helpers.js';

const PASSWORD = 'correct horse battery staple';

async function withServer(fn) {
  const t = testCtx({ cfg: (c) => { c.dashboard.passwordHash = hashPassword(PASSWORD); c.dashboard.username = 'owner'; } });
  const server = createServer(createApp(t.ctx));
  await new Promise((r) => server.listen(0, r));
  const base = `http://127.0.0.1:${server.address().port}`;
  try { return await fn(base, t); } finally { server.close(); }
}
const form = (o) => ({ method: 'POST', redirect: 'manual', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(o).toString() });

async function login(base) {
  const r = await fetch(`${base}/dashboard/login`, form({ username: 'owner', password: PASSWORD }));
  assert.equal(r.status, 303);
  const cookie = r.headers.get('set-cookie').split(';')[0];
  const page = await (await fetch(`${base}/dashboard`, { headers: { cookie } })).text();
  const csrf = page.match(/name="csrf" value="([^"]+)"/)[1];
  return { cookie, csrf, page };
}

test('password hashing round-trip and weak password rejected', () => {
  const h = hashPassword(PASSWORD);
  assert.equal(verifyPassword(PASSWORD, h), true);
  assert.equal(verifyPassword('wrong password!!', h), false);
  assert.throws(() => hashPassword('short'));
});

test('dashboard and API are protected', async () => {
  await withServer(async (base) => {
    const r = await fetch(`${base}/dashboard`, { redirect: 'manual' });
    assert.equal(r.status, 303);
    assert.equal(r.headers.get('location'), '/dashboard/login');
    assert.equal((await fetch(`${base}/api/reports/daily`)).status, 401);
    assert.equal((await fetch(`${base}/api/reports/daily`, { headers: { authorization: 'Bearer wrong' } })).status, 401);
    assert.equal((await fetch(`${base}/api/reports/daily`, { headers: { authorization: `Bearer ${API_TOKEN}` } })).status, 200);
    const h = (await fetch(`${base}/dashboard/login`)).headers;
    assert.equal(h.get('x-frame-options'), 'DENY');
    assert.match(h.get('content-security-policy'), /default-src 'none'/);
  });
});

test('login: wrong password refused, rate-limited after 5 failures', async () => {
  await withServer(async (base) => {
    for (let i = 0; i < 5; i++) assert.equal((await fetch(`${base}/dashboard/login`, form({ username: 'owner', password: 'nope' }))).status, 401);
    assert.equal((await fetch(`${base}/dashboard/login`, form({ username: 'owner', password: PASSWORD }))).status, 429);
  });
});

test('signed-in owner sees all sections; cookie is HttpOnly + SameSite=Strict', async () => {
  await withServer(async (base, t) => {
    seedProduct(t.ctx);
    const r = await fetch(`${base}/dashboard/login`, form({ username: 'owner', password: PASSWORD }));
    assert.match(r.headers.get('set-cookie'), /HttpOnly; SameSite=Strict/);
    const { page } = await login(base);
    for (const s of ['Sales', 'Orders', 'Products', 'Marketing', 'Finance', 'Alerts', 'Emergency controls']) assert.match(page, new RegExp(s));
    assert.match(page, /TEST MODE/);
  });
});

test('emergency pause works from dashboard; CSRF enforced; API can pause but not resume', async () => {
  await withServer(async (base, t) => {
    const { cookie, csrf } = await login(base);
    const noCsrf = await fetch(`${base}/dashboard/controls`, { ...form({ key: 'pause_supplier_orders', paused: 'true' }), headers: { 'Content-Type': 'application/x-www-form-urlencoded', cookie } });
    assert.equal(noCsrf.status, 403);
    const ok = await fetch(`${base}/dashboard/controls`, { ...form({ key: 'pause_supplier_orders', paused: 'true', csrf }), headers: { 'Content-Type': 'application/x-www-form-urlencoded', cookie } });
    assert.equal(ok.status, 303);
    const c = await (await fetch(`${base}/api/controls`, { headers: { authorization: `Bearer ${API_TOKEN}` } })).json();
    assert.equal(c.pause_supplier_orders.paused, true);
    const resume = await fetch(`${base}/api/controls`, { method: 'POST', headers: { authorization: `Bearer ${API_TOKEN}`, 'content-type': 'application/json' }, body: JSON.stringify({ key: 'pause_supplier_orders', paused: false }) });
    assert.equal(resume.status, 403);
    const pause = await fetch(`${base}/api/controls`, { method: 'POST', headers: { authorization: `Bearer ${API_TOKEN}`, 'content-type': 'application/json' }, body: JSON.stringify({ key: 'pause_marketing', paused: true }) });
    assert.equal(pause.status, 200);
    // Sign out revokes the session server-side.
    await fetch(`${base}/dashboard/logout`, { ...form({ csrf }), headers: { 'Content-Type': 'application/x-www-form-urlencoded', cookie } });
    assert.equal((await fetch(`${base}/dashboard`, { headers: { cookie }, redirect: 'manual' })).status, 303);
  });
});

test('dashboard escapes untrusted data (no stored XSS via product titles)', async () => {
  await withServer(async (base, t) => {
    seedProduct(t.ctx, { title: '<script>alert(1)</script>' });
    const { cookie } = await login(base);
    const html = await (await fetch(`${base}/dashboard/products`, { headers: { cookie } })).text();
    assert.ok(!html.includes('<script>alert(1)</script>'));
    assert.ok(html.includes('&lt;script&gt;'));
  });
});

test('encrypted backup restores intact; wrong passphrase fails; restore refuses to overwrite without --force', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'opsbk-'));
  const dbFile = path.join(dir, 'ops.sqlite');
  const db = openDb(dbFile);
  db.prepare("INSERT INTO controls (key, value, updated_at, updated_by) VALUES ('pause_marketing','true','t','t')").run();
  db.close();
  const bak = path.join(dir, 'x.bak');
  backupDatabase(dbFile, bak, 'a-long-test-passphrase');
  const target = path.join(dir, 'restored.sqlite');
  assert.throws(() => restoreDatabase(bak, target, 'wrong-passphrase-123'), /Wrong passphrase/);
  restoreDatabase(bak, target, 'a-long-test-passphrase');
  const r = openDb(target);
  assert.equal(r.prepare("SELECT value FROM controls WHERE key = 'pause_marketing'").get().value, 'true');
  r.close();
  assert.throws(() => restoreDatabase(bak, target, 'a-long-test-passphrase'), /--force/);
  writeFileSync(path.join(dir, 'junk.bak'), 'nope');
  assert.throws(() => restoreDatabase(path.join(dir, 'junk.bak'), path.join(dir, 'n.sqlite'), 'a-long-test-passphrase'));
  assert.ok(existsSync(target));
});
