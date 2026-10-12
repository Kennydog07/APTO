// Generates the 14 importable n8n workflows in ../n8n-workflows from one
// place, so retries, logging, error handling and test mode are consistent.
//
// Usage:  node tools/build-n8n-workflows.mjs
// Edit n8n-workflows/config.json (owner email etc.) then re-run.
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'n8n-workflows');
mkdirSync(OUT, { recursive: true });
const cfgFile = path.join(OUT, 'config.json');
const CFG = existsSync(cfgFile) ? JSON.parse(readFileSync(cfgFile, 'utf8')) : {};
const C = {
  opsBaseUrl: 'http://ops-service:8080',
  ownerEmail: 'owner@example.com',
  storeEmail: 'hello@example.co.uk',
  storeName: 'Nook & Order',
  testMode: true,
  researchFeedUrl: '',
  pinterestBoardId: '',
  ...CFG,
};

// Stable 16-character workflow IDs so cross-references survive import.
const ID = {
  wf01: 'NoWf01Research00', wf02: 'NoWf02Approval00', wf03: 'NoWf03Inventory0', wf04: 'NoWf04Pricing000', wf05: 'NoWf05NewOrder00',
  wf06: 'NoWf06Fulfil0000', wf07: 'NoWf07Tracking00', wf08: 'NoWf08Support000', wf09: 'NoWf09Content000', wf10: 'NoWf10Publish000',
  wf11: 'NoWf11Report0000', wf12: 'NoWf12Errors0000', wf13: 'NoWf13Optimise00', wf14: 'NoWf14Returns000',
};
// Credential placeholders: create these in n8n with exactly these names, then
// re-select them on each node after import (n8n matches by id).
const CRED = {
  ops: { httpHeaderAuth: { id: 'REPLACE_OPS_API_CRED', name: 'Ops service API (Bearer)' } },
  inbound: { httpHeaderAuth: { id: 'REPLACE_INBOUND_CRED', name: 'Inbound webhook secret (X-Ops-Token)' } },
  smtp: { smtp: { id: 'REPLACE_SMTP_CRED', name: 'Store SMTP' } },
  imap: { imap: { id: 'REPLACE_IMAP_CRED', name: 'Support mailbox IMAP' } },
  pinterest: { httpHeaderAuth: { id: 'REPLACE_PINTEREST_CRED', name: 'Pinterest API (Bearer)' } },
  feed: { httpHeaderAuth: { id: 'REPLACE_FEED_CRED', name: 'Research feed (optional)' } },
};

function wf(num, name, build, { errorWorkflow = true } = {}) {
  const nodes = [];
  const connections = {};
  let x = 0;
  const add = (node, at) => {
    const n = { id: randomUUID(), position: at ?? [x += 260, 300], ...node };
    nodes.push(n);
    return n.name;
  };
  const link = (from, to, output = 0) => {
    connections[from] ??= { main: [] };
    while (connections[from].main.length <= output) connections[from].main.push([]);
    connections[from].main[output].push({ node: to, type: 'main', index: 0 });
  };
  build({ add, link, setX: (v) => { x = v; } });
  // Manual trigger on every scheduled workflow: one-click test runs from the editor / CLI.
  const sched = nodes.find((n) => n.type === 'n8n-nodes-base.scheduleTrigger');
  if (sched && connections[sched.name]) {
    const manual = { id: randomUUID(), name: 'Manual test run', type: 'n8n-nodes-base.manualTrigger', typeVersion: 1, position: [sched.position[0], sched.position[1] + 160], parameters: {} };
    nodes.push(manual);
    connections[manual.name] = JSON.parse(JSON.stringify(connections[sched.name]));
  }
  return {
    id: ID[`wf${String(num).padStart(2, '0')}`],
    name: `${String(num).padStart(2, '0')} — ${name}`,
    active: false,
    nodes,
    connections,
    settings: { executionOrder: 'v1', saveManualExecutions: true, saveDataErrorExecution: 'all', saveDataSuccessExecution: 'all', timezone: 'Europe/London', ...(errorWorkflow ? { errorWorkflow: ID.wf12 } : {}) },
    pinData: {},
    tags: [],
    meta: { templateCredsSetupCompleted: false },
  };
}

// ---------- node factories ----------
const schedule = (name, rule) => ({ name, type: 'n8n-nodes-base.scheduleTrigger', typeVersion: 1.2, parameters: { rule: { interval: [rule] } } });
const cron = (expression) => ({ field: 'cronExpression', expression });
const config = () => ({
  name: 'Config', type: 'n8n-nodes-base.code', typeVersion: 2,
  parameters: { jsCode: `// Edit n8n-workflows/config.json and rebuild, or change here.\nconst _cfg = ${JSON.stringify({ opsBaseUrl: C.opsBaseUrl, ownerEmail: C.ownerEmail, storeEmail: C.storeEmail, storeName: C.storeName, testMode: C.testMode })};\nconst items = $input.all();\nreturn (items.length ? items : [{ json: {} }]).map((i) => ({ json: { ...i.json, _cfg } }));` },
});
const cfgExpr = (k) => `$('Config').first().json._cfg.${k}`;
function ops(name, method, pathExpr, body) {
  return {
    name, type: 'n8n-nodes-base.httpRequest', typeVersion: 4.2,
    parameters: {
      method, url: `={{ ${cfgExpr('opsBaseUrl')} }}${pathExpr}`,
      authentication: 'genericCredentialType', genericAuthType: 'httpHeaderAuth',
      ...(body ? { sendBody: true, specifyBody: 'json', jsonBody: body } : {}),
      options: { timeout: 60000 },
    },
    credentials: CRED.ops, retryOnFail: true, maxTries: 3, waitBetweenTries: 5000,
  };
}
const logNode = (name, workflow, message, data = '{}') => ({
  ...ops(name, 'POST', '/api/logs', `={{ JSON.stringify({ workflow: ${JSON.stringify(workflow)}, level: 'info', message: ${JSON.stringify(message)}, data: ${data} }) }}`),
  continueOnFail: true,
});
const ifNode = (name, left, op, right, type = 'string') => ({
  name, type: 'n8n-nodes-base.if', typeVersion: 2,
  parameters: {
    conditions: {
      options: { caseSensitive: true, leftValue: '', typeValidation: 'loose' },
      conditions: [{ id: randomUUID(), leftValue: left, rightValue: right, operator: { type, operation: op, ...(op === 'true' || op === 'false' || op === 'notEmpty' || op === 'empty' ? { singleValue: true } : {}) } }],
      combinator: 'and',
    },
    options: {},
  },
});
const code = (name, jsCode) => ({ name, type: 'n8n-nodes-base.code', typeVersion: 2, parameters: { jsCode } });
const email = (name, toExpr, subjectExpr, textExpr) => ({
  name, type: 'n8n-nodes-base.emailSend', typeVersion: 2.1,
  parameters: { fromEmail: `={{ ${cfgExpr('storeEmail')} }}`, toEmail: toExpr, subject: subjectExpr, emailFormat: 'text', text: textExpr, options: {} },
  credentials: CRED.smtp, retryOnFail: true, maxTries: 3, waitBetweenTries: 10000,
});
const inboundWebhook = (name, pathName) => ({
  name, type: 'n8n-nodes-base.webhook', typeVersion: 2, webhookId: randomUUID(),
  parameters: { httpMethod: 'POST', path: pathName, authentication: 'headerAuth', responseMode: 'onReceived', options: {} },
  credentials: CRED.inbound,
});
const TEST_PREFIX = `={{ ${cfgExpr('testMode')} ? '[TEST] ' : '' }}`;

const workflows = [];

// 01 Weekly product research
workflows.push(['01-weekly-product-research.json', wf(1, 'Weekly product research', ({ add, link }) => {
  const t = add(schedule('Every Monday 06:00', cron('0 6 * * 1')));
  const c = add(config()); link(t, c);
  const f = add({ name: 'Fetch candidate feed (CSV)', type: 'n8n-nodes-base.httpRequest', typeVersion: 4.2, parameters: { url: C.researchFeedUrl || 'https://example.com/REPLACE-with-supplier-catalogue-export.csv', options: { response: { response: { responseFormat: 'text' } }, timeout: 60000 } }, retryOnFail: true, maxTries: 3, waitBetweenTries: 10000 });
  link(c, f);
  const p = add(code('Parse CSV', `// Feed = an export from an AUTHORISED source (your supplier's catalogue export / API,\n// or your own research sheet published as CSV). Never scrape sites that forbid it.\nconst text = $input.first().json.data ?? '';\nconst lines = text.split(/\\r?\\n/).filter(Boolean);\nif (lines.length < 2) return [{ json: { rows: [] } }];\nconst parse = (l) => { const out = []; let f = '', q = false; for (let i = 0; i < l.length; i++) { const ch = l[i]; if (q) { if (ch === '"' && l[i+1] === '"') { f += '"'; i++; } else if (ch === '"') q = false; else f += ch; } else if (ch === '"') q = true; else if (ch === ',') { out.push(f); f = ''; } else f += ch; } out.push(f); return out; };\nconst head = parse(lines[0]).map((h) => h.trim());\nconst rows = lines.slice(1).map((l) => { const v = parse(l); return Object.fromEntries(head.map((h, i) => [h, (v[i] ?? '').trim()])); });\nreturn [{ json: { rows } }];`));
  link(f, p);
  const s = add(ops('Score candidates', 'POST', '/api/research/score', '={{ JSON.stringify({ rows: $json.rows }) }}')); link(p, s);
  const sum = add(code('Build recommendations', `const s = $input.first().json.scored ?? [];\nconst ready = s.filter((x) => x.status === 'ready_for_approval').slice(0, 5);\nconst verify = s.filter((x) => x.status === 'needs_verification').slice(0, 10);\nconst fmt = (x) => \`- \${x.score} \${x.sku} \${x.name}\${x.provisional ? ' [PROVISIONAL]' : ''}\\n    \${(x.reasons ?? []).join('; ')}\`;\nconst text = ['WEEKLY PRODUCT RESEARCH', '', 'Ready for your approval (send to Workflow 02):', ...ready.map(fmt), '', 'Need verification first:', ...verify.map(fmt), '', \`Rejected: \${s.filter((x) => x.status === 'reject').length}\`, '', 'These are recommendations only. Nothing has been listed or purchased.'].join('\\n');\nreturn [{ json: { text, ready: ready.length, total: s.length } }];`));
  link(s, sum);
  const e = add(email('Email owner', `={{ ${cfgExpr('ownerEmail')} }}`, `${TEST_PREFIX}Weekly product research: {{ $json.ready }} ready for review`, '={{ $json.text }}')); link(sum, e);
  const l = add(logNode('Log run', 'wf01', 'Research scored', '{ total: $json.total, ready: $json.ready }')); link(sum, l);
})]);

// 02 Product approval
workflows.push(['02-product-approval.json', wf(2, 'Product approval (draft listing)', ({ add, link }) => {
  const t = add(inboundWebhook('New candidate (webhook)', 'ops-new-candidate'));
  const c = add(config()); link(t, c);
  const p = add(ops('Validate & create Shopify draft', 'POST', '/api/products/candidates', "={{ JSON.stringify({ rows: $('New candidate (webhook)').first().json.body.rows ?? [$('New candidate (webhook)').first().json.body] }) }}")); link(c, p);
  const s = add(code('Summarise', `const r = $input.first().json.results ?? [];\nconst ok = r.filter((x) => x.ok);\nconst text = r.map((x) => \`\${x.ok ? 'DRAFT CREATED — awaiting your approval in the dashboard' : 'NOT ELIGIBLE'}: \${x.score?.name} (score \${x.score?.score})\${x.ok ? '' : '\\n   ' + (x.score?.reasons ?? []).join('; ')}\`).join('\\n');\nreturn [{ json: { text, drafts: ok.length, total: r.length } }];`)); link(p, s);
  const e = add(email('Email owner', `={{ ${cfgExpr('ownerEmail')} }}`, `${TEST_PREFIX}{{ $json.drafts }} product draft(s) awaiting approval`, '={{ $json.text }}\n\nApprove or reject in the dashboard → Approvals. Nothing is published until you approve.')); link(s, e);
  const l = add(logNode('Log run', 'wf02', 'Candidates processed', '{ drafts: $json.drafts, total: $json.total }')); link(s, l);
})]);

// 03 Inventory monitoring
workflows.push(['03-inventory-monitoring.json', wf(3, 'Inventory monitoring (every 6 hours)', ({ add, link }) => {
  const t = add(schedule('Every 6 hours', { field: 'hours', hoursInterval: 6 }));
  const c = add(config()); link(t, c);
  const s = add(ops('Sync supplier stock', 'POST', '/api/inventory/sync')); link(c, s);
  const l = add(logNode('Log run', 'wf03', 'Inventory sync complete', '{ checked: $json.checked, paused: $json.paused, restored: $json.restored, mismatches: $json.mismatches }')); link(s, l);
})]);

// 04 Pricing monitor
workflows.push(['04-pricing-monitor.json', wf(4, 'Pricing monitor (twice daily)', ({ add, link }) => {
  const t = add(schedule('07:00 and 19:00', cron('0 7,19 * * *')));
  const c = add(config()); link(t, c);
  const s = add(ops('Recalculate margins', 'POST', '/api/pricing/monitor')); link(c, s);
  const l = add(logNode('Log run', 'wf04', 'Pricing monitor complete', '{ reviewed: ($json.reviews ?? []).length }')); link(s, l);
})]);

// 05 New paid order
workflows.push(['05-new-paid-order.json', wf(5, 'New paid order (verified webhook)', ({ add, link, setX }) => {
  const w = add(inboundWebhook('Verified order from ops-service', 'ops-new-paid-order'), [260, 200]);
  const toItem = add(code('To order item', `// ops-service has already verified the Shopify HMAC and de-duplicated the webhook.\nreturn [{ json: { orderId: String($input.first().json.body.orderId) } }];`), [520, 200]);
  link(w, toItem);
  const sch = add(schedule('Fallback every 15 min', { field: 'minutes', minutesInterval: 15 }), [260, 420]);
  const cfgSch = add({ ...config(), name: 'Config (fallback)' }, [520, 420]); link(sch, cfgSch);
  const pend = add({ ...ops('Orders missed by webhook', 'GET', '/api/orders/pending-evaluation'), parameters: { ...ops('x', 'GET', '/api/orders/pending-evaluation').parameters, url: `={{ $('Config (fallback)').first().json._cfg.opsBaseUrl }}/api/orders/pending-evaluation` } }, [780, 420]);
  link(cfgSch, pend);
  const split = add(code('One item per order', `return ($input.first().json.orders ?? []).map((o) => ({ json: { orderId: String(o.id) } }));`), [1040, 420]);
  link(pend, split);
  setX(1040);
  const c = add(config(), [1040, 200]); link(toItem, c); link(split, c);
  const ev = add(ops('Validate order', 'POST', "/api/orders/{{ $('Config').item.json.orderId }}/evaluate"), [1300, 300]); link(c, ev);
  const iff = add(ifNode('Eligible for automatic submission?', '={{ $json.decision }}', 'equals', 'auto_submit'), [1560, 300]); link(ev, iff);
  const ex = add({ name: 'Run 06 Supplier fulfilment', type: 'n8n-nodes-base.executeWorkflow', typeVersion: 1.2,
    parameters: { workflowId: { __rl: true, value: ID.wf06, mode: 'id' }, workflowInputs: { mappingMode: 'defineBelow', value: { orderId: "={{ $('Config').item.json.orderId }}" }, matchingColumns: [], schema: [{ id: 'orderId', displayName: 'orderId', required: false, defaultMatch: false, display: true, canBeUsedToMatch: true, type: 'string' }] }, options: { waitForSubWorkflow: true } } }, [1820, 200]);
  link(iff, ex, 0);
  const l = add(logNode('Log decision', 'wf05', 'Order evaluated (not auto-submitted)', "{ orderId: $('Config').item.json.orderId, decision: $json.decision, reasons: $json.reasons }"), [1820, 420]);
  link(iff, l, 1);
})]);

// 06 Supplier fulfilment
workflows.push(['06-supplier-fulfilment.json', wf(6, 'Supplier fulfilment (idempotent)', ({ add, link }) => {
  const t = add({ name: 'Called by workflow 05', type: 'n8n-nodes-base.executeWorkflowTrigger', typeVersion: 1.1, parameters: { workflowInputs: { values: [{ name: 'orderId' }] } } });
  const c = add(config()); link(t, c);
  const s = add(ops('Submit to supplier (idempotent)', 'POST', "/api/orders/{{ $('Config').item.json.orderId }}/submit")); link(c, s);
  const iff = add(ifNode('Submitted?', '={{ $json.ok }}', 'true', '', 'boolean')); link(s, iff);
  const ok = add(logNode('Log success', 'wf06', 'Supplier order recorded', "{ orderId: $('Config').item.json.orderId, results: $json.results }")); link(iff, ok, 0);
  const bad = add({ ...ops('Escalate failure', 'POST', '/api/errors', "={{ JSON.stringify({ workflow: 'wf06', severity: 'error', message: 'Supplier submission did not complete for order ' + $('Config').item.json.orderId + ': ' + JSON.stringify($json.results ?? $json.error), executionId: $execution.id }) }}"), continueOnFail: true });
  link(iff, bad, 1);
})]);

// 07 Tracking updates
workflows.push(['07-tracking-updates.json', wf(7, 'Tracking updates', ({ add, link }) => {
  const t = add(schedule('Every 2 hours', { field: 'hours', hoursInterval: 2 }), [260, 200]);
  const c = add(config(), [520, 200]); link(t, c);
  const s = add(ops('Poll suppliers & sync to Shopify', 'POST', '/api/tracking/sync'), [780, 200]); link(c, s);
  const l = add(logNode('Log run', 'wf07', 'Tracking sync complete', '{ checked: $json.checked, synced: $json.synced, overdue: $json.overdue }'), [1040, 200]); link(s, l);
  const w = add(inboundWebhook('Supplier tracking push', 'ops-tracking-push'), [260, 420]);
  const c2 = add({ ...config(), name: 'Config (push)' }, [520, 420]); link(w, c2);
  const r = add({ ...ops('Record pushed tracking', 'POST', '/api/tracking', "={{ JSON.stringify($('Supplier tracking push').first().json.body) }}"), parameters: { ...ops('x', 'POST', '/api/tracking', "={{ JSON.stringify($('Supplier tracking push').first().json.body) }}").parameters, url: `={{ $('Config (push)').first().json._cfg.opsBaseUrl }}/api/tracking` } }, [780, 420]);
  link(c2, r);
})]);

// 08 Customer support
workflows.push(['08-customer-support.json', wf(8, 'Customer support (email)', ({ add, link }) => {
  const t = add({ name: 'New support email', type: 'n8n-nodes-base.emailReadImap', typeVersion: 2, parameters: { mailbox: 'INBOX', postProcessAction: 'read', format: 'simple', options: { customEmailConfig: '["UNSEEN"]' } }, credentials: CRED.imap }, [260, 300]);
  const c = add(config(), [520, 300]); link(t, c);
  const n = add(code('Normalise message', `return $input.all().map((i) => { const j = i.json; const from = String(j.from ?? '').match(/<([^>]+)>/)?.[1] ?? String(j.from ?? '').trim();\n  return { json: { ...j, enquiry: { messageId: j.messageId ?? j.headers?.['message-id'] ?? null, channel: 'email', fromEmail: from, subject: j.subject ?? '', body: String(j.textPlain ?? j.text ?? '').slice(0, 5000) } } }; });`), [780, 300]);
  link(c, n);
  const h = add(ops('Classify & draft reply', 'POST', '/api/support/enquiry', '={{ JSON.stringify($json.enquiry) }}'), [1040, 300]); link(n, h);
  const sw = add(ifNode('Safe to auto-reply?', '={{ $json.action }}', 'equals', 'auto_reply'), [1300, 300]); link(h, sw);
  const toExpr = `={{ ${cfgExpr('testMode')} ? ${cfgExpr('ownerEmail')} : $('Normalise message').item.json.enquiry.fromEmail }}`;
  const subj = `${TEST_PREFIX}Re: {{ $('Normalise message').item.json.enquiry.subject }}`;
  const a = add(email('Send verified reply', toExpr, subj, '={{ $json.reply }}'), [1560, 200]); link(sw, a, 0);
  const ack = add(email('Send acknowledgement', toExpr, subj, '={{ $json.acknowledgement }}'), [1560, 420]); link(sw, ack, 1);
  const fw = add(email('Escalate to owner', `={{ ${cfgExpr('ownerEmail')} }}`, `=[ESCALATION: {{ $('Classify & draft reply').item.json.category }}] {{ $('Normalise message').item.json.enquiry.subject }}`, "=From: {{ $('Normalise message').item.json.enquiry.fromEmail }}\nCategory: {{ $('Classify & draft reply').item.json.category }}\nVerified order owner: {{ $('Classify & draft reply').item.json.verified }}\nTicket: #{{ $('Classify & draft reply').item.json.ticketId }}\n\n{{ $('Normalise message').item.json.enquiry.body }}\n\nReply personally. Refunds, disputes and safety issues must never be answered automatically."), [1820, 420]);
  link(ack, fw);
})]);

// 09 Marketing content generation
workflows.push(['09-marketing-content-generation.json', wf(9, 'Marketing content generation (daily)', ({ add, link }) => {
  const t = add(schedule('Daily 05:30', cron('30 5 * * *')));
  const c = add(config()); link(t, c);
  const g = add(ops('Generate drafts into approval queue', 'POST', '/api/marketing/generate', '={{ JSON.stringify({ date: $now.toISO() }) }}')); link(c, g);
  const l = add(logNode('Log run', 'wf09', 'Content generated for approval', '{ created: $json.created, skipped: $json.skipped, note: $json.note }')); link(g, l);
})]);

// 10 Social publishing
workflows.push(['10-social-publishing.json', wf(10, 'Social publishing (approved content only)', ({ add, link }) => {
  const t = add(schedule('Hourly 09:00–20:00', cron('5 9-20 * * *')));
  const c = add(config()); link(t, c);
  const d = add(ops('Get approved, due Pinterest pins', 'GET', '/api/marketing/due?channel=pinterest')); link(c, d);
  const s = add(code('One item per pin', `const r = $input.first().json;\nif (r.paused) return [];\nreturn (r.items ?? []).filter((i) => i.status === 'approved').map((i) => ({ json: i }));`)); link(d, s);
  const tm = add(ifNode('Test mode?', `={{ ${cfgExpr('testMode')} }}`, 'true', '', 'boolean')); link(s, tm);
  const skip = add(logNode('Log (test mode — not published)', 'wf10', 'Would publish pin (test mode)', '{ id: $json.id, title: $json.title }')); link(tm, skip, 0);
  const pin = add({ name: 'Create Pinterest pin', type: 'n8n-nodes-base.httpRequest', typeVersion: 4.2,
    parameters: { method: 'POST', url: 'https://api.pinterest.com/v5/pins', authentication: 'genericCredentialType', genericAuthType: 'httpHeaderAuth', sendBody: true, specifyBody: 'json',
      jsonBody: `={{ JSON.stringify({ board_id: ${JSON.stringify(C.pinterestBoardId || 'REPLACE_BOARD_ID')}, title: $json.title, description: $json.body, link: $json.meta.link, media_source: { source_type: 'image_url', url: $json.meta.imageUrl } }) }}`, options: { timeout: 30000 } },
    credentials: CRED.pinterest, retryOnFail: true, maxTries: 2, waitBetweenTries: 30000 });
  link(tm, pin, 1);
  const mark = add(ops('Mark as published', 'POST', "/api/marketing/{{ $('One item per pin').item.json.id }}/published", '={{ JSON.stringify({ externalId: $json.id }) }}')); link(pin, mark);
})]);

// 11 Daily business report
workflows.push(['11-daily-business-report.json', wf(11, 'Daily business report', ({ add, link }) => {
  const t = add(schedule('Daily 07:30', cron('30 7 * * *')));
  const c = add(config()); link(t, c);
  const p = add({ ...ops('Data retention purge', 'POST', '/api/maintenance/purge'), continueOnFail: true }); link(c, p);
  const r = add(ops('Build report', 'GET', '/api/reports/daily')); link(p, r);
  const e = add(email('Email owner', `={{ ${cfgExpr('ownerEmail')} }}`, `${TEST_PREFIX}Daily report — {{ $json.sales.orders }} orders, {{ $json.tasksRequiringAttention.length }} need attention`, '={{ $json.text }}\n\nDashboard: open your ops dashboard for detail.')); link(r, e);
})]);

// 12 Error management (also polls ops-service for new critical exceptions)
workflows.push(['12-error-management.json', wf(12, 'Error management', ({ add, link }) => {
  const t = add({ name: 'Workflow failed', type: 'n8n-nodes-base.errorTrigger', typeVersion: 1, parameters: {} }, [260, 200]);
  const c = add(config(), [520, 200]); link(t, c);
  const rec = add({ ...ops('Record error', 'POST', '/api/errors', "={{ JSON.stringify({ workflow: $('Workflow failed').first().json.workflow?.name, executionId: $('Workflow failed').first().json.execution?.id, node: $('Workflow failed').first().json.execution?.lastNodeExecuted, message: $('Workflow failed').first().json.execution?.error?.message ?? 'Unknown error', url: $('Workflow failed').first().json.execution?.url, severity: 'error' }) }}"), continueOnFail: true }, [780, 200]);
  link(c, rec);
  const sch = add(schedule('Every 30 minutes', { field: 'minutes', minutesInterval: 30 }), [260, 420]);
  const c2 = add({ ...config(), name: 'Config (poll)' }, [520, 420]); link(sch, c2);
  const pend = add({ ...ops('Unnotified critical alerts', 'GET', '/api/alerts/pending'), parameters: { ...ops('x', 'GET', '/api/alerts/pending').parameters, url: `={{ $('Config (poll)').first().json._cfg.opsBaseUrl }}/api/alerts/pending` } }, [1040, 300]);
  link(rec, pend); link(c2, pend);
  const any = add(ifNode('Anything to tell the owner?', '={{ ($json.alerts ?? []).length }}', 'gt', 0, 'number'), [1300, 300]); link(pend, any);
  const fmt = add(code('Format alert', `const a = $input.first().json.alerts;\nreturn [{ json: { subject: \`\${a.length} issue(s) need your attention\`, text: a.map((x) => \`[\${x.severity.toUpperCase()}] \${x.message} (seen \${x.occurrences}×)\`).join('\\n') + '\\n\\nDetails: dashboard → Alerts.' } }];`), [1560, 200]);
  link(any, fmt, 0);
  const e = add({ ...email('Alert owner', "={{ $('Config (poll)').isExecuted ? $('Config (poll)').first().json._cfg.ownerEmail : $('Config').first().json._cfg.ownerEmail }}", '={{ $json.subject }}', '={{ $json.text }}'), parameters: { ...email('x', '', '', '').parameters, fromEmail: "={{ $('Config (poll)').isExecuted ? $('Config (poll)').first().json._cfg.storeEmail : $('Config').first().json._cfg.storeEmail }}", toEmail: "={{ $('Config (poll)').isExecuted ? $('Config (poll)').first().json._cfg.ownerEmail : $('Config').first().json._cfg.ownerEmail }}", subject: '={{ $json.subject }}', text: '={{ $json.text }}' } }, [1820, 200]);
  link(fmt, e);
}, { errorWorkflow: false })]);

// 13 Weekly optimisation
workflows.push(['13-weekly-optimisation.json', wf(13, 'Weekly optimisation', ({ add, link }) => {
  const t = add(schedule('Mondays 08:00', cron('0 8 * * 1')));
  const c = add(config()); link(t, c);
  const r = add(ops('Analyse the week', 'GET', '/api/reports/weekly')); link(c, r);
  const f = add(code('Format', `const w = $input.first().json;\nconst text = ['WEEKLY OPTIMISATION', '', \`Orders: \${w.sales.orders} · Revenue £\${w.sales.revenue} · Est. contribution £\${w.sales.estimatedContribution}\`, \`Return rate: \${(w.returnRate * 100).toFixed(1)}% · Conversion: \${w.conversionRate === null ? 'no traffic data' : (w.conversionRate * 100).toFixed(2) + '%'}\`, '', 'Top products:', ...(w.productPerformance ?? []).slice(0, 5).map((p) => \`- \${p.title ?? p.sku}: \${p.units} units, £\${(p.revenue ?? 0).toFixed(2)}\`), '', 'Recommendations:', ...w.recommendations.map((r) => '- ' + r), '', w.note].join('\\n');\nreturn [{ json: { text } }];`)); link(r, f);
  const e = add(email('Email owner', `={{ ${cfgExpr('ownerEmail')} }}`, `${TEST_PREFIX}Weekly optimisation report`, '={{ $json.text }}')); link(f, e);
})]);

// 14 Returns and refunds
workflows.push(['14-returns-and-refunds.json', wf(14, 'Returns and refunds', ({ add, link }) => {
  const t = add(inboundWebhook('Return request (webhook)', 'ops-return-request'));
  const c = add(config()); link(t, c);
  const r = add(ops('Create return case', 'POST', '/api/returns', "={{ JSON.stringify({ orderName: $('Return request (webhook)').first().json.body.orderName, fromEmail: $('Return request (webhook)').first().json.body.email, reason: $('Return request (webhook)').first().json.body.reason }) }}")); link(c, r);
  const reply = add(email('Reply to customer', `={{ ${cfgExpr('testMode')} ? ${cfgExpr('ownerEmail')} : $('Return request (webhook)').first().json.body.email }}`, `${TEST_PREFIX}Your return request`, '={{ $json.reply }}')); link(r, reply);
  const o = add(email('Notify owner', `={{ ${cfgExpr('ownerEmail')} }}`, `${TEST_PREFIX}Return case {{ $('Create return case').item.json.caseId ? '#' + $('Create return case').item.json.caseId : '(unverified request)' }} needs a decision`, "={{ JSON.stringify($('Create return case').item.json.assessment ?? $('Create return case').item.json, null, 2) }}\n\nRefunds are never issued automatically. Decide in dashboard → Approvals, then issue any refund in Shopify admin.")); link(reply, o);
})]);

for (const [file, w] of workflows) writeFileSync(path.join(OUT, file), JSON.stringify(w, null, 2) + '\n');
if (!existsSync(cfgFile)) writeFileSync(cfgFile, JSON.stringify({ ownerEmail: C.ownerEmail, storeEmail: C.storeEmail, storeName: C.storeName, opsBaseUrl: C.opsBaseUrl, testMode: true, researchFeedUrl: '', pinterestBoardId: '' }, null, 2) + '\n');
console.log(`Wrote ${workflows.length} workflows to ${OUT}`);
