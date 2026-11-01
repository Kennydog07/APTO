/**
 * APTO Flip Finder — paid app access (£3.99 one-off)
 * GET /api/flipfinder?action=config                 -> { live, buyUrl, price }
 * GET /api/flipfinder?action=status&session_id=cs_… -> { paid: bool }
 * GET /api/flipfinder?action=app&session_id=cs_…    -> the app (HTML) if paid
 * GET /api/flipfinder?action=download&session_id=…  -> the app as a download if paid
 *
 * Purchase flow: Stripe Payment Link (FLIPFINDER_PAYMENT_LINK) -> Stripe redirects to
 * /flip-finder/thanks?session_id={CHECKOUT_SESSION_ID}. stripe-webhook.js records the paid
 * checkout session in Supabase `subscriptions` (plan 'flipfinder', status 'paid',
 * stripe_subscription_id = checkout session id). This function only serves the app when
 * that row exists, so the app is never publicly reachable.
 */
const APP_HTML = require('./lib/flipfinder-app.js');

const json = (code, body) => ({ statusCode: code, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify(body) });

async function isPaid(sessionId) {
  if (!/^cs_(live|test)_[A-Za-z0-9]{10,200}$/.test(sessionId || '')) return false;
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) throw new Error('not configured');
  const qs = new URLSearchParams({ select: 'status', stripe_subscription_id: `eq.${sessionId}`, plan: 'eq.flipfinder', limit: '1' });
  const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/subscriptions?${qs}`, {
    headers: { apikey: process.env.SUPABASE_SERVICE_KEY, Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}` }
  });
  if (!res.ok) throw new Error('lookup failed ' + res.status);
  const rows = await res.json();
  return Array.isArray(rows) && rows.some((r) => r.status === 'paid');
}

exports.handler = async (event) => {
  const q = event.queryStringParameters || {};
  const action = q.action || 'config';
  if (action === 'config') {
    const url = process.env.FLIPFINDER_PAYMENT_LINK || '';
    const live = /^https:\/\/buy\.stripe\.com\//.test(url);
    return json(200, { live, buyUrl: live ? url : null, price: '£3.99' });
  }
  let paid = false;
  try { paid = await isPaid(q.session_id); }
  catch (e) { console.error('flipfinder access error', e.message); return json(503, { error: 'Could not check your purchase right now. Please try again in a minute.' }); }
  if (action === 'status') return json(200, { paid });
  if (!paid) {
    return { statusCode: 302, headers: { Location: '/flip-finder/?access=missing', 'Cache-Control': 'no-store' }, body: '' };
  }
  const headers = { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow' };
  if (action === 'download') headers['Content-Disposition'] = 'attachment; filename="APTO-Flip-Finder.html"';
  return { statusCode: 200, headers, body: APP_HTML };
};
