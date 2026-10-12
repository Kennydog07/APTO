// Marketing content engine (Workflows 09 and 10).
// Content is generated ONLY from verified product data, always lands in
// 'pending_approval', and can only be published after the owner approves it.
import { createHash } from 'node:crypto';
import { now } from './db.js';
import { isPaused } from './lib/controls.js';
import { introducesNewNumbers } from './support.js';

const clip = (s, n) => (s.length <= n ? s : s.slice(0, n - 1).trimEnd() + '…');
const isoWeek = (d) => {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const y = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return `${t.getUTCFullYear()}-W${String(Math.ceil(((t - y) / 86_400_000 + 1) / 7)).padStart(2, '0')}`;
};
const fp = (...parts) => createHash('sha256').update(parts.join('|')).digest('hex').slice(0, 32);

export const PUBLISH_LIMITS = { pinterest: 5, instagram: 1, facebook: 1 };

function productUrl(base, p, channel, campaign) {
  const u = new URL(`/products/${p.handle ?? p.sku.toLowerCase()}`, base);
  u.searchParams.set('utm_source', channel);
  u.searchParams.set('utm_medium', 'organic');
  u.searchParams.set('utm_campaign', campaign);
  return u.toString();
}

export function buildItems(p, { storeName, baseUrl, date }) {
  const benefits = (p.benefits ?? '').split('|').map((s) => s.trim()).filter(Boolean);
  const top = benefits.slice(0, 3);
  const week = isoWeek(date);
  const items = [];
  const keywords = [p.title.toLowerCase(), 'small space storage', 'home organisation uk', 'renter friendly'].join(', ');

  items.push({
    channel: 'pinterest', kind: 'pin', fingerprint: fp('pinterest', 'pin', p.sku, week),
    title: clip(`${p.title} — ${top[0] ?? 'tidy small-space storage'}`, 100),
    body: clip(`${p.title}. ${top.join('. ')}${top.length ? '.' : ''} Delivered from UK stock — see the product page for delivery estimates and full specifications.`, 500),
    meta: { link: productUrl(baseUrl, p, 'pinterest', week), imageUrl: p.image_url, keywords,
      visualBrief: `Bright, natural-light photo of the ${p.title} in use in a small UK home (kitchen, bathroom or hallway). Use only supplier-licensed or own photography. 2:3 vertical, text overlay: "${clip(top[0] ?? p.title, 40)}".` },
  });
  items.push({
    channel: 'instagram', kind: 'caption', fingerprint: fp('instagram', 'caption', p.sku, week),
    title: p.title,
    body: `${top[0] ?? p.title}.\n\n${top.slice(1).map((b) => `• ${b}`).join('\n')}\n\nFull specs and delivery info at the link in bio.\n\n#homeorganisation #smallspaceliving #renterfriendly #ukhome`,
    meta: { imageUrl: p.image_url, link: productUrl(baseUrl, p, 'instagram', week) },
  });
  items.push({
    channel: 'video', kind: 'short_script', fingerprint: fp('video', 'short', p.sku, week),
    title: `Short video: ${p.title}`,
    body: [
      'FORMAT: 20–30s vertical (9:16). Real product footage only — no simulated results.',
      `HOOK (0–3s): On-screen text "${clip(top[0] ?? 'Small space, sorted', 45)}". Show the cluttered "before" area.`,
      `SCENE 1 (3–10s): Unbox / place the ${p.title}. Narration: "This is the ${p.title}."`,
      ...top.map((b, i) => `SCENE ${i + 2}: Demonstrate: ${b}. Caption: "${clip(b, 50)}"`),
      'END (last 3s): Product on shelf/counter. Caption + narration: "Specs and delivery info at the link."',
      `CAPTION: ${p.title} — ${top.join(' · ')}`,
      'CALL TO ACTION: "See full specifications on our website."',
      'COMPLIANCE: do not claim capacities, timings or results that are not in the supplier specification.',
    ].join('\n'),
    meta: { specs: p.specs },
  });
  if (date.getUTCDay() === 1) { // Mondays: long-form drafts
    items.push({
      channel: 'blog', kind: 'buying_guide_draft', fingerprint: fp('blog', 'guide', p.sku, week),
      title: `How to choose ${p.title.toLowerCase().replace(/^the /, '')} for a small UK home`,
      body: [
        `# How to choose ${p.title.toLowerCase()} for a small UK home`,
        '## Measure first', 'Explain how to measure the space (cupboard depth, shelf height, door clearance) before buying. [OWNER: add practical tips from your own testing]',
        '## What to look for', ...top.map((b) => `- ${b}`),
        '## Specifications', p.specs ?? '[OWNER: insert supplier specifications]',
        '## Care and safety', '[OWNER: add care instructions from supplier documentation]',
        `## Where to buy`, `Link: ${productUrl(baseUrl, p, 'blog', week)}`,
        '_Draft generated from product data — review, add genuine first-hand detail and fact-check before publishing._',
      ].join('\n\n'),
      meta: { internalLinks: ['/collections/all', '/pages/faqs', '/policies/shipping-policy'] },
    });
    items.push({
      channel: 'email', kind: 'newsletter_section', fingerprint: fp('email', 'newsletter', p.sku, week),
      title: `This week: ${p.title}`,
      body: `Subject: ${clip(`Small-space idea: ${p.title}`, 60)}\nPreview: ${clip(top[0] ?? '', 90)}\n\n${p.title}\n${top.map((b) => `• ${b}`).join('\n')}\n\nSee it: ${productUrl(baseUrl, p, 'email', week)}\n\n[Send ONLY via Shopify Email to subscribers who opted in. Unsubscribe link is added automatically by Shopify Email.]`,
      meta: {},
    });
  }
  return items;
}

export async function generateDailyContent(ctx, { date = new Date(), maxProducts = 2 } = {}) {
  const { db, cfg, ai } = ctx;
  const products = db.prepare("SELECT * FROM products WHERE approved = 1 AND status = 'active' ORDER BY sku").all();
  if (!products.length) return { created: 0, skipped: 0, note: 'No active approved products yet' };
  const dayIndex = Math.floor(date.getTime() / 86_400_000);
  const chosen = Array.from({ length: Math.min(maxProducts, products.length) }, (_, i) => products[(dayIndex * maxProducts + i) % products.length]);
  let created = 0, skipped = 0;
  const ins = db.prepare(`INSERT OR IGNORE INTO content (fingerprint, channel, kind, product_sku, title, body, meta, status, created_at, updated_at)
    VALUES (?,?,?,?,?,?,?,'pending_approval',?,?)`);
  for (const p of chosen) {
    for (const item of buildItems(p, { storeName: cfg.support.storeName, baseUrl: cfg.storeUrl, date })) {
      let body = item.body;
      if (ai?.enabled && ['caption', 'pin'].includes(item.kind)) {
        const r = await ai.draft({ purpose: `marketing_${item.kind}`, system: 'You polish social media copy for a UK home-organisation shop. British English. Keep every fact exactly as given; add no numbers, claims, prices, urgency or discounts. Output only the copy.', prompt: body });
        if (r.text && !introducesNewNumbers(r.text, body)) body = r.text;
      }
      const res = ins.run(item.fingerprint, item.channel, item.kind, p.sku, item.title, body, JSON.stringify(item.meta), now(), now());
      if (res.changes) created++; else skipped++;
    }
  }
  return { created, skipped };
}

export function approveContent(db, id, { scheduledFor = null } = {}) {
  const r = db.prepare("UPDATE content SET status = 'approved', scheduled_for = COALESCE(?, scheduled_for, ?), updated_at = ? WHERE id = ? AND status IN ('pending_approval','rejected')")
    .run(scheduledFor, now(), now(), id);
  return r.changes === 1;
}
export function rejectContent(db, id) {
  return db.prepare("UPDATE content SET status = 'rejected', updated_at = ? WHERE id = ? AND status = 'pending_approval'").run(now(), id).changes === 1;
}

/** Items that may be published now: approved, due, within daily limits, marketing not paused. */
export function dueForPublishing(db, channel) {
  if (isPaused(db, 'pause_marketing')) return { paused: true, items: [] };
  const today = now().slice(0, 10);
  const done = db.prepare("SELECT COUNT(*) AS c FROM content WHERE channel = ? AND status = 'published' AND substr(published_at,1,10) = ?").get(channel, today).c;
  const limit = Math.max(0, (PUBLISH_LIMITS[channel] ?? 1) - done);
  const items = limit ? db.prepare("SELECT * FROM content WHERE channel = ? AND status = 'approved' AND scheduled_for <= ? ORDER BY scheduled_for LIMIT ?").all(channel, now(), limit) : [];
  return { paused: false, remainingToday: limit, items: items.map((i) => ({ ...i, meta: JSON.parse(i.meta ?? '{}') })) };
}

export function markPublished(db, id, externalId) {
  // Guard: only approved content can ever be marked published.
  return db.prepare("UPDATE content SET status = 'published', published_at = ?, external_id = ?, updated_at = ? WHERE id = ? AND status = 'approved'")
    .run(now(), externalId ?? null, now(), id).changes === 1;
}
