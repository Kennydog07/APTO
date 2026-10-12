// Server-rendered owner dashboard. No external scripts or fonts; every
// value is HTML-escaped; every form carries the session CSRF token.
export const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const gbp = (n) => `£${(Math.round((n ?? 0) * 100) / 100).toFixed(2)}`;

const CSS = `
:root{--bg:#f6f5f2;--card:#fff;--ink:#1f2421;--muted:#5f6b66;--line:#e3e1db;--accent:#2f5d50;--warn:#9a5b00;--bad:#a12a2a;--ok:#2e6b3a}
@media (prefers-color-scheme:dark){:root{--bg:#141716;--card:#1d2120;--ink:#e9ece8;--muted:#a3ada8;--line:#2e3432;--accent:#7fbfa9;--warn:#e0a84a;--bad:#ef7b7b;--ok:#86c99a}}
*{box-sizing:border-box}body{margin:0;font:15px/1.45 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:var(--bg);color:var(--ink)}
header{position:sticky;top:0;background:var(--card);border-bottom:1px solid var(--line);padding:10px 16px;display:flex;gap:12px;align-items:center;justify-content:space-between;z-index:2}
header strong{font-size:16px}nav{display:flex;gap:6px;overflow-x:auto;padding:8px 16px;background:var(--card);border-bottom:1px solid var(--line)}
nav a{white-space:nowrap;text-decoration:none;color:var(--ink);padding:6px 10px;border-radius:999px;border:1px solid var(--line);font-size:14px}
nav a[aria-current=page]{background:var(--accent);color:#fff;border-color:var(--accent)}
main{max-width:1100px;margin:0 auto;padding:16px;display:grid;gap:16px}
.grid{display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr))}
section.card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px 16px}
h1{font-size:20px;margin:0}h2{font-size:15px;margin:0 0 10px;text-transform:uppercase;letter-spacing:.04em;color:var(--muted)}
.kpis{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.kpi{border:1px solid var(--line);border-radius:10px;padding:10px}
.kpi b{display:block;font-size:20px}.kpi span{color:var(--muted);font-size:13px}
table{width:100%;border-collapse:collapse;font-size:14px}td,th{padding:6px 4px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}
.badge{display:inline-block;padding:1px 8px;border-radius:999px;font-size:12px;border:1px solid currentColor}
.critical,.error{color:var(--bad)}.warning{color:var(--warn)}.info,.ok{color:var(--ok)}
.banner{padding:10px 14px;border-radius:10px;border:1px solid var(--warn);color:var(--warn);background:var(--card)}
form.inline{display:inline}button{font:inherit;padding:8px 14px;border-radius:8px;border:1px solid var(--line);background:var(--card);color:var(--ink);cursor:pointer;min-height:40px}
button.primary{background:var(--accent);border-color:var(--accent);color:#fff}button.danger{border-color:var(--bad);color:var(--bad)}
.row{display:flex;gap:8px;flex-wrap:wrap;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--line)}
.muted{color:var(--muted)}pre{white-space:pre-wrap;font:13px/1.4 ui-monospace,Menlo,Consolas,monospace;background:var(--bg);padding:8px;border-radius:8px;max-height:240px;overflow:auto}
input,select{font:inherit;padding:8px;border-radius:8px;border:1px solid var(--line);background:var(--card);color:var(--ink);min-height:40px;width:100%}
label{display:block;margin:8px 0 4px}.login{max-width:380px;margin:10vh auto}
`;

export function layout({ title, active = '', body, csrf, testMode }) {
  const tabs = [['/dashboard', 'Overview'], ['/dashboard/approvals', 'Approvals'], ['/dashboard/orders', 'Orders'], ['/dashboard/products', 'Products'], ['/dashboard/content', 'Marketing'], ['/dashboard/alerts', 'Alerts']];
  return `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>${esc(title)} · Operations</title><style>${CSS}</style></head><body>
<header><strong>Operations</strong>${csrf ? `<form class="inline" method="post" action="/dashboard/logout"><input type="hidden" name="csrf" value="${esc(csrf)}"><button>Sign out</button></form>` : ''}</header>
${csrf ? `<nav aria-label="Dashboard sections">${tabs.map(([h, l]) => `<a href="${h}"${h === active ? ' aria-current="page"' : ''}>${l}</a>`).join('')}</nav>` : ''}
<main>${testMode ? '<div class="banner" role="status">TEST MODE — no real supplier orders, Shopify changes or publishing take place.</div>' : ''}${body}</main></body></html>`;
}

export function loginPage({ error, testMode }) {
  return layout({ title: 'Sign in', testMode, body: `<section class="card login"><h1>Sign in</h1>
  ${error ? `<p class="error" role="alert">${esc(error)}</p>` : ''}
  <form method="post" action="/dashboard/login"><label for="u">Username</label><input id="u" name="username" autocomplete="username" required>
  <label for="p">Password</label><input id="p" name="password" type="password" autocomplete="current-password" required>
  <p><button class="primary" type="submit">Sign in</button></p></form></section>` });
}

const kpi = (label, value) => `<div class="kpi"><b>${esc(value)}</b><span>${esc(label)}</span></div>`;

export function overviewPage(d) {
  const controls = Object.entries(d.controls).map(([k, c]) => `<div class="row"><span>${esc(c.label)} — <b class="${c.paused ? 'error' : 'ok'}">${c.paused ? 'PAUSED' : 'running'}</b></span>
    <form class="inline" method="post" action="/dashboard/controls"><input type="hidden" name="csrf" value="${esc(d.csrf)}"><input type="hidden" name="key" value="${esc(k)}">
    <input type="hidden" name="paused" value="${c.paused ? 'false' : 'true'}"><button class="${c.paused ? 'primary' : 'danger'}">${c.paused ? 'Resume' : 'Pause'}</button></form></div>`).join('');
  const s = d.sales;
  const body = `
<div class="grid">
<section class="card"><h2>Sales</h2><div class="kpis">${kpi("Today's orders", s.today.orders)}${kpi('This week', s.week.orders)}${kpi('This month', s.month.orders)}
${kpi('Revenue (month)', gbp(s.month.revenue))}${kpi('Avg order value', gbp(s.month.aov))}${kpi('Est. contribution (month)', gbp(s.month.contribution))}</div></section>
<section class="card"><h2>Emergency controls</h2>${controls}<p class="muted">Pausing is immediate. Automations re-check these switches before every action.</p></section>
<section class="card"><h2>Orders</h2><div class="kpis">${Object.entries(d.orderStates).map(([k, v]) => kpi(k.replace(/_/g, ' '), v)).join('') || '<p class="muted">No orders yet.</p>'}</div></section>
<section class="card"><h2>Products</h2><div class="kpis">${kpi('Active', d.products.active)}${kpi('Low stock', d.products.lowStock)}${kpi('Needs review', d.products.review)}${kpi('Poor margin', d.products.poorMargin)}</div>
${d.products.best.length ? `<p class="muted">Best sellers (30 days): ${d.products.best.map((b) => `${esc(b.title ?? b.sku)} (${b.units})`).join(', ')}</p>` : ''}</section>
<section class="card"><h2>Marketing</h2><div class="kpis">${kpi('Awaiting approval', d.content.pending_approval ?? 0)}${kpi('Scheduled', d.content.approved ?? 0)}${kpi('Published', d.content.published ?? 0)}${kpi('Rejected', d.content.rejected ?? 0)}</div></section>
<section class="card"><h2>Finance (month to date)</h2><table>
<tr><td>Revenue</td><td>${gbp(s.month.revenue)}</td></tr><tr><td>Supplier costs</td><td>${gbp(s.month.supplierCosts)}</td></tr>
<tr><td>Payment fees (est.)</td><td>${gbp(s.month.paymentFees)}</td></tr><tr><td>Refunds approved</td><td>${gbp(d.refunds)}</td></tr>
<tr><td>Software (projected)</td><td>${gbp(d.costs.projectedMonthlyGbp)}${d.costs.overThreshold ? ' <span class="badge error">over £' + esc(d.costs.alertThresholdGbp) + '</span>' : ''}</td></tr>
<tr><td>AI spend</td><td>${gbp(d.costs.aiMonthToDateGbp)}</td></tr><tr><td><b>Estimated operating result</b></td><td><b>${gbp(s.month.contribution - d.costs.projectedMonthlyGbp)}</b></td></tr></table>
<p class="muted">Estimates only — Shopify and your bookkeeping are the source of truth.</p></section>
<section class="card"><h2>Alerts</h2>${d.alerts.length ? d.alerts.slice(0, 8).map((a) => `<div class="row"><span><span class="badge ${esc(a.severity)}">${esc(a.severity)}</span> ${esc(a.message)}</span></div>`).join('') : '<p class="ok">No open alerts.</p>'}
<p><a href="/dashboard/alerts">All alerts</a> · <a href="/dashboard/approvals">${d.approvals} awaiting approval</a></p></section>
</div>`;
  return layout({ title: 'Overview', active: '/dashboard', body, csrf: d.csrf, testMode: d.testMode });
}

export function approvalsPage({ approvals, csrf, testMode }) {
  const body = `<section class="card"><h2>Awaiting your decision (${approvals.length})</h2>
${approvals.map((a) => `<div class="row"><div><span class="badge">${esc(a.type.replace(/_/g, ' '))}</span> ${esc(a.summary)}<div class="muted">${esc(a.created_at)}</div></div>
<div><form class="inline" method="post" action="/dashboard/approvals/${a.id}"><input type="hidden" name="csrf" value="${esc(csrf)}"><input type="hidden" name="decision" value="approved"><button class="primary">Approve</button></form>
<form class="inline" method="post" action="/dashboard/approvals/${a.id}"><input type="hidden" name="csrf" value="${esc(csrf)}"><input type="hidden" name="decision" value="rejected"><button class="danger">Reject</button></form></div></div>`).join('') || '<p class="ok">Nothing waiting.</p>'}
<p class="muted">Approving a refund does not move money — issue it in Shopify admin. Approving a manual purchase means you have placed it with the supplier.</p></section>`;
  return layout({ title: 'Approvals', active: '/dashboard/approvals', body, csrf, testMode });
}

export function ordersPage({ orders, csrf, testMode }) {
  const body = `<section class="card"><h2>Recent orders</h2><table><thead><tr><th>Order</th><th>Total</th><th>State</th></tr></thead><tbody>
${orders.map((o) => `<tr><td>${esc(o.name)}<div class="muted">${esc(o.created_at?.slice(0, 16).replace('T', ' '))}</div></td><td>${gbp(o.total_gbp)}</td><td>${esc(o.state.replace(/_/g, ' '))}${o.state_reason ? `<div class="muted">${esc(o.state_reason)}</div>` : ''}</td></tr>`).join('') || '<tr><td colspan="3" class="muted">No orders yet.</td></tr>'}
</tbody></table></section>
<section class="card"><h2>Add tracking (manual supplier orders)</h2><form method="post" action="/dashboard/tracking"><input type="hidden" name="csrf" value="${esc(csrf)}">
<label for="o">Shopify order ID</label><input id="o" name="orderId" required><label for="s">Supplier code</label><input id="s" name="supplier" required>
<label for="n">Tracking number (from the supplier)</label><input id="n" name="number" required pattern="[A-Za-z0-9-]{6,40}">
<label for="c">Carrier</label><input id="c" name="company" placeholder="Royal Mail, Evri, DPD…" required><p><button class="primary">Save and notify customer</button></p></form></section>`;
  return layout({ title: 'Orders', active: '/dashboard/orders', body, csrf, testMode });
}

export function productsPage({ products, csrf, testMode }) {
  const body = `<section class="card"><h2>Products</h2><table><thead><tr><th>Product</th><th>Price</th><th>Cost+ship</th><th>Stock</th><th>Status</th></tr></thead><tbody>
${products.map((p) => `<tr><td>${esc(p.title)}<div class="muted">${esc(p.sku)} · ${esc(p.supplier)}</div></td><td>${gbp(p.price_gbp)}</td><td>${gbp((p.cost_gbp ?? 0) + (p.shipping_gbp ?? 0))}${p.cost_verified ? '' : ' <span class="badge warning">unverified</span>'}</td><td>${esc(p.stock ?? '—')}</td><td>${esc(p.status)}${p.approved ? '' : ' <span class="badge warning">not approved</span>'}</td></tr>`).join('') || '<tr><td colspan="5" class="muted">No products imported yet.</td></tr>'}
</tbody></table></section>`;
  return layout({ title: 'Products', active: '/dashboard/products', body, csrf, testMode });
}

export function contentPage({ items, csrf, testMode }) {
  const body = `<section class="card"><h2>Content awaiting approval (${items.length})</h2>
${items.map((c) => `<div class="row" style="display:block"><div><span class="badge">${esc(c.channel)} · ${esc(c.kind.replace(/_/g, ' '))}</span> <b>${esc(c.title)}</b></div>
<pre>${esc(c.body)}</pre>
<form class="inline" method="post" action="/dashboard/content/${c.id}"><input type="hidden" name="csrf" value="${esc(csrf)}"><input type="hidden" name="action" value="approve"><button class="primary">Approve &amp; schedule</button></form>
<form class="inline" method="post" action="/dashboard/content/${c.id}"><input type="hidden" name="csrf" value="${esc(csrf)}"><input type="hidden" name="action" value="reject"><button class="danger">Reject</button></form></div>`).join('') || '<p class="ok">Nothing waiting.</p>'}</section>`;
  return layout({ title: 'Marketing', active: '/dashboard/content', body, csrf, testMode });
}

export function alertsPage({ alerts, csrf, testMode }) {
  const body = `<section class="card"><h2>Open alerts (${alerts.length})</h2>
${alerts.map((a) => `<div class="row"><div><span class="badge ${esc(a.severity)}">${esc(a.severity)}</span> ${esc(a.message)}<div class="muted">${esc(a.source)} · seen ${esc(a.occurrences)}× · last ${esc(a.last_seen.slice(0, 16).replace('T', ' '))}</div></div>
<form class="inline" method="post" action="/dashboard/alerts/${a.id}/resolve"><input type="hidden" name="csrf" value="${esc(csrf)}"><button>Mark resolved</button></form></div>`).join('') || '<p class="ok">No open alerts.</p>'}</section>`;
  return layout({ title: 'Alerts', active: '/dashboard/alerts', body, csrf, testMode });
}
