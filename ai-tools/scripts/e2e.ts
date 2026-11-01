/**
 * End-to-end test against a running site in Stripe TEST mode.
 *
 *   Terminal 1:  npx netlify dev                         (serves http://localhost:8888)
 *   Terminal 2:  npm run e2e                             (automated, see below)
 *            or  npm run e2e -- --manual                 (real Checkout page in your browser)
 *            or  npm run e2e -- --tool=speech-writer     (any live tool; default parking-appeal)
 *
 * Automated mode creates a real test-mode PaymentIntent (card pm_card_visa), then sends a
 * correctly signed checkout.session.completed webhook to the site. This exercises the real
 * webhook, background generation, storage, downloads, regeneration and the real refund API.
 * It then forces a failure (test mode only) and checks the job is refunded automatically.
 *
 * Manual mode needs:  stripe listen --forward-to localhost:8888/ai/api/stripe-webhook
 * (and STRIPE_WEBHOOK_SECRET in .env set to the whsec_ that command prints). Pay with 4242 4242 4242 4242.
 *
 * Env (from .env): STRIPE_SECRET_KEY (sk_test_ only), STRIPE_WEBHOOK_SECRET, STATS_API_KEY.
 * Optional: E2E_BASE_URL (default http://localhost:8888), E2E_EMAIL (to receive the emails).
 */
import Stripe from 'stripe';
import { SAMPLE_INPUTS, SAMPLE_PHOTO_JPEG_BASE64 } from './sample-inputs.ts';
import { TOOLS, isToolId } from '../shared/tools.ts';
import { withBase } from '../shared/paths.ts';

const BASE = (process.env.E2E_BASE_URL || 'http://localhost:8888').replace(/\/+$/, '');
const KEY = process.env.STRIPE_SECRET_KEY || '';
const WHSEC = process.env.STRIPE_WEBHOOK_SECRET || '';
const EMAIL = process.env.E2E_EMAIL || 'e2e-test@example.com';
const MANUAL = process.argv.includes('--manual');
const toolArg = process.argv.find((a) => a.startsWith('--tool='))?.slice(7) ?? 'parking-appeal';
if (!isToolId(toolArg) || !(toolArg in SAMPLE_INPUTS)) {
  console.error(`Unknown tool or no sample inputs: ${toolArg}`);
  process.exit(1);
}
const TOOL = toolArg as keyof typeof SAMPLE_INPUTS;
const PRICE = TOOLS[TOOL].pricePence;
const IS_PACK = Boolean(TOOLS[TOOL].credits);

if (!KEY.startsWith('sk_test_')) {
  console.error('Refusing to run: STRIPE_SECRET_KEY must be a TEST key (sk_test_...).');
  process.exit(1);
}
const stripe = new Stripe(KEY);

let failures = 0;
function check(cond: unknown, label: string) {
  console.log(`${cond ? '  ✓' : '  ✗'} ${label}`);
  if (!cond) failures++;
}

async function api<T = Record<string, unknown>>(
  path: string,
  body?: unknown,
): Promise<{ status: number; json: T }> {
  // `path` is app-relative ("/api/..."); the tools live under /ai on the site.
  const res = await fetch(`${BASE}${withBase(path)}`, {
    method: body ? 'POST' : 'GET',
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, json: (await res.json().catch(() => ({}))) as T };
}

interface JobStatus {
  status: string;
  refunded?: boolean;
  downloads?: { url: string; filename: string }[];
  canRegenerate?: boolean;
  result?: unknown;
}

async function waitFor(
  jobId: string,
  done: (s: JobStatus) => boolean,
  timeoutMs = 240_000,
): Promise<JobStatus> {
  const start = Date.now();
  let last: JobStatus = { status: 'unknown' };
  while (Date.now() - start < timeoutMs) {
    last = (await api<JobStatus>(`/api/job-status?job=${jobId}`)).json;
    if (done(last)) return last;
    process.stdout.write(`    …${last.status}\r`);
    await new Promise((r) => setTimeout(r, 3000));
  }
  return last;
}

async function createJob(extra: Record<string, unknown> = {}) {
  const { status, json } = await api<{ url?: string; jobId?: string; error?: string }>(
    '/api/create-job',
    {
      tool: TOOL,
      inputs: SAMPLE_INPUTS[TOOL],
      ...extra,
    },
  );
  check(
    status === 200 && json.url?.startsWith('https://checkout.stripe.com'),
    `create-job returns a Checkout URL (${status} ${json.error ?? ''})`,
  );
  return json as { url: string; jobId: string };
}

/** Simulate a completed Checkout: real test PaymentIntent + signed webhook. */
async function simulatePayment(jobId: string) {
  const sessions = await stripe.checkout.sessions.list({ limit: 20 });
  const session = sessions.data.find((s) => s.client_reference_id === jobId);
  check(Boolean(session), 'Stripe Checkout Session exists for the job');

  const pi = await stripe.paymentIntents.create({
    amount: session?.amount_total ?? PRICE,
    currency: 'gbp',
    payment_method: 'pm_card_visa',
    automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
    confirm: true,
    metadata: { job_id: jobId, e2e: 'true' },
  });
  check(pi.status === 'succeeded', 'test PaymentIntent succeeded');

  const payload = JSON.stringify({
    id: `evt_e2e_${Date.now()}`,
    object: 'event',
    type: 'checkout.session.completed',
    api_version: null,
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        ...session,
        object: 'checkout.session',
        payment_status: 'paid',
        status: 'complete',
        payment_intent: pi.id,
        customer_details: { email: EMAIL },
        metadata: { job_id: jobId, tool: TOOL },
      },
    },
  });
  const header = stripe.webhooks.generateTestHeaderString({ payload, secret: WHSEC });
  const res = await fetch(`${BASE}${withBase('/api/stripe-webhook')}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'stripe-signature': header },
    body: payload,
  });
  check(res.status === 200, `webhook accepted (${res.status})`);

  const bad = await fetch(`${BASE}${withBase('/api/stripe-webhook')}`, {
    method: 'POST',
    headers: { 'stripe-signature': 't=1,v1=deadbeef' },
    body: payload,
  });
  check(bad.status === 400, 'webhook rejects a bad signature');
  return pi.id;
}

async function checkDownloads(s: JobStatus) {
  check(
    (s.downloads?.length ?? 0) >= 2,
    `has downloads (${s.downloads?.map((d) => d.filename).join(', ')})`,
  );
  for (const d of s.downloads ?? []) {
    const res = await fetch(d.url);
    const bytes = new Uint8Array(await res.arrayBuffer());
    const magic = String.fromCharCode(...bytes.slice(0, 4));
    const ok = d.filename.endsWith('.pdf') ? magic === '%PDF' : magic.startsWith('PK');
    check(res.ok && ok, `downloads ${d.filename} (${bytes.length} bytes)`);
  }
}

console.log(`E2E for ${TOOL} against ${BASE}\n`);
const site = await api<{ accepting: boolean }>('/api/site-status');
check(site.json.accepting === true, 'site is accepting orders (budget not exceeded)');

if (TOOL === 'cv-tailor') {
  console.log('\n0. CV upload + free preview');
  const { Document, Packer, Paragraph } = await import('docx');
  const cv = SAMPLE_INPUTS['cv-tailor'].cvText;
  const docx = await Packer.toBuffer(
    new Document({ sections: [{ children: cv.split('\n').map((t) => new Paragraph(t)) }] }),
  );
  const ex = await api<{ text?: string; type?: string }>('/api/cv-extract', {
    data: Buffer.from(docx).toString('base64'),
  });
  check(
    ex.status === 200 && ex.json.type === 'docx' && ex.json.text?.includes('Acme Limited'),
    `cv-extract reads a DOCX (${ex.status})`,
  );
  const bad = await api('/api/cv-extract', { data: Buffer.from('not a cv').toString('base64') });
  check(bad.status === 400, 'cv-extract rejects a non-PDF/DOCX file');
  const pv = await api<{ fit?: string; bullets?: string[] }>('/api/cv-preview', {
    cvText: cv,
    advert: SAMPLE_INPUTS['cv-tailor'].advert,
  });
  check(
    (pv.status === 200 && pv.json.bullets?.length === 3) || pv.status === 429,
    `free preview returns 3 bullets (${pv.status}${pv.status === 429 ? ': daily preview limit already used' : ''})`,
  );
}

console.log('\n1. Happy path');
const job = await createJob();
if (MANUAL) {
  console.log(`\n  Open this URL and pay with 4242 4242 4242 4242:\n  ${job.url}\n`);
} else {
  await simulatePayment(job.jobId);
}
const done = await waitFor(
  job.jobId,
  (s) => ['done', 'failed'].includes(s.status),
  MANUAL ? 600_000 : 240_000,
);
check(done.status === 'done', `job finished as done (got ${done.status})`);
check(done.result != null && typeof done.result === 'object', 'inline result returned');
if (IS_PACK) {
  console.log('\n2. Credit pack: magic link, credits, one listing');
  const token = (done.result as { token?: string } | undefined)?.token ?? '';
  check(/^[A-Za-z0-9]{32}$/.test(token), 'pack result contains a 32-char token');
  const credits = await api<{ remaining: number }>(`/api/credits?token=${token}`);
  check(credits.json.remaining === TOOLS[TOOL].credits, `credits = ${credits.json.remaining}`);
  const listingJob = crypto.randomUUID();
  const gen = await api<{ status: string; result?: { title?: string }; remaining: number }>(
    '/api/listing-generate',
    {
      jobId: listingJob,
      token,
      platform: 'ebay',
      notes: 'Plain red square, used for an automated test.',
      images: [{ mediaType: 'image/jpeg', data: SAMPLE_PHOTO_JPEG_BASE64 }],
    },
  );
  check(
    gen.status === 200 || gen.status === 202,
    `listing-generate accepted (${gen.status} ${gen.json.status})`,
  );
  const listing =
    gen.json.status === 'done'
      ? { status: 'done', result: gen.json.result }
      : await waitFor(listingJob, (s) => ['done', 'failed'].includes(s.status));
  check(
    listing.status === 'done' && Boolean((listing.result as { title?: string })?.title),
    'listing written with a title',
  );
  const after = await api<{ remaining: number }>(`/api/credits?token=${token}`);
  check(
    after.json.remaining === TOOLS[TOOL].credits! - 1,
    `one credit used (${after.json.remaining} left)`,
  );
  const dupe = await api('/api/listing-generate', {
    jobId: listingJob,
    token,
    platform: 'ebay',
    images: [{ mediaType: 'image/jpeg', data: SAMPLE_PHOTO_JPEG_BASE64 }],
  });
  check(dupe.status === 409, 're-using a request id is refused (credit given back)');
  const afterDupe = await api<{ remaining: number }>(`/api/credits?token=${token}`);
  check(
    afterDupe.json.remaining === after.json.remaining,
    'credit returned after the refused duplicate',
  );
  const regen = await api('/api/regenerate', { job: job.jobId, note: 'x' });
  check(regen.status === 409, 'credit packs have no free regeneration');
} else {
  check(done.canRegenerate === true, 'free regeneration offered');
  await checkDownloads(done);

  console.log('\n2. Free regeneration');
  const regen = await api(`/api/regenerate`, { job: job.jobId, note: 'Make it a little shorter.' });
  check(regen.status === 202, `regenerate accepted (${regen.status})`);
  const afterRegen = await waitFor(
    job.jobId,
    (s) => s.status === 'done' && s.canRegenerate === false,
  );
  check(
    afterRegen.status === 'done' && afterRegen.canRegenerate === false,
    'regenerated, no more free regenerations',
  );
  const regen2 = await api(`/api/regenerate`, { job: job.jobId, note: 'again' });
  check(regen2.status === 409, 'second regeneration refused');
}

if (!MANUAL) {
  console.log('\n3. Failure -> automatic refund (forced, test mode only; takes ~30s for retries)');
  const failJob = await createJob({ testForceFail: true });
  const piId = await simulatePayment(failJob.jobId);
  const failed = await waitFor(failJob.jobId, (s) => s.status === 'failed' && s.refunded === true);
  check(failed.status === 'failed', `job marked failed (got ${failed.status})`);
  check(failed.refunded === true, 'job marked refunded');
  const refunds = await stripe.refunds.list({ payment_intent: piId });
  check(
    refunds.data.length === 1 && refunds.data[0]?.amount === PRICE,
    'exactly one full refund in Stripe',
  );
}

console.log('\n4. Stats endpoint');
const badStats = await api('/api/stats?key=wrong');
check(badStats.status === 401, 'stats rejects a wrong key');
if (process.env.STATS_API_KEY) {
  const stats = await api<{
    windows: { today: { per_tool: Record<string, { jobs_paid: number }> } };
  }>(`/api/stats?key=${encodeURIComponent(process.env.STATS_API_KEY)}`);
  check(
    stats.status === 200 && (stats.json.windows?.today?.per_tool?.[TOOL]?.jobs_paid ?? 0) >= 1,
    'stats show paid jobs today',
  );
}

console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
