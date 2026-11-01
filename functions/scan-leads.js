/**
 * APTO Pro — Lead Scanner v9 (manual scan, GET /api/scan-leads)
 *
 * v9: collectors/scoring/dedupe moved to ./lib/lead-engine.js (shared with
 * the hourly scheduled-scan) and:
 *   - adds free structured sources: planning applications near the location
 *     and Contracts Finder (official gov tenders), mapped to trades
 *   - adds a public site:facebook.com collector (search-engine results only;
 *     Facebook itself is never accessed directly)
 *   - SerpAPI quota guard: SerpAPI collectors are skipped when the monthly
 *     allowance is nearly used up (free sources still run)
 *   - AI scoring falls back to keyword/urgency rules if the Anthropic call
 *     fails (leads are marked aiScored:false / "(rule-scored)")
 *   - genuine leads are saved to the user's `leads` table, deduped across
 *     runs (normalised URL + title/snippet hash); the scan location is
 *     remembered so the hourly scan can use it
 * Debug (?debug=true with SCAN_DEBUG=true) reports per-source counts.
 */
const E = require('./lib/lead-engine');
const SERP_MIN_LEFT = Number(process.env.SERP_MANUAL_MIN_LEFT ?? 10);

// ── AUTH ─────────────────────────────────────────────────────────────────────
// This endpoint spends money on every call (paid third-party APIs), so it only
// serves signed-in users. The browser sends the Supabase session JWT as
// "Authorization: Bearer <token>"; we verify it with Supabase exactly like
// get-unread-leads.js does. No/invalid token -> 401.
async function getAuthedUser(event) {
  const raw   = (event.headers && (event.headers['authorization'] || event.headers['Authorization'])) || '';
  const token = raw.startsWith('Bearer ') ? raw.slice(7).trim() : '';
  if (!token) return { status: 401, error: 'Sign in required' };
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    return { status: 500, error: 'Auth is not configured on the server' };
  }
  try {
    const res = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
      headers: { 'Authorization': `Bearer ${token}`, 'apikey': process.env.SUPABASE_ANON_KEY }
    });
    if (!res.ok) return { status: 401, error: 'Invalid or expired session' };
    const user = await res.json();
    if (!user || !user.id) return { status: 401, error: 'Invalid or expired session' };
    return { user };
  } catch (err) {
    console.error('Auth check failed:', err.message);
    return { status: 503, error: 'Sign-in service unavailable — please try again later' };
  }
}

// ── MAIN HANDLER ─────────────────────────────────────────────────────────────

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin':  process.env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  const auth = await getAuthedUser(event);
  if (auth.error) return { statusCode: auth.status, headers, body: JSON.stringify({ error: auth.error }) };

  const debug = { debugEnabled: false, sources: {} };
  try {
    const params     = event.queryStringParameters || {};
    debug.debugEnabled = params.debug === 'true' && process.env.SCAN_DEBUG === 'true';
    const trade      = params.trade || 'plumbing';
    const mode       = params.mode  || 'local';
    const location   = mode === 'national' ? '' : (params.location || '');
    const searchType = params.searchType || 'customer';
    const days       = params.days || '7';
    const radius     = parseInt(params.radius, 10) || 10;
    const isJob      = searchType === 'jobs';
    const tbs        = days && days !== '0' ? `qdr:d${days}` : '';
    const areaCtx    = mode === 'national' ? 'anywhere in the UK' : `in or near ${location || 'the UK'}`;
    const serpKey    = process.env.SERPAPI_KEY;

    if (location) await E.setUserLocation(auth.user.id, location, radius);

    // Free structured sources (customer searches only), run alongside SerpAPI.
    const geoP = location ? E.geocode(location) : Promise.resolve(null);
    const structuredP = isJob ? Promise.resolve([]) : geoP.then(geo => Promise.all([
      E.planningLeads({ trade, geo, radiusMiles: radius, days: Math.max(30, Number(days) || 30) }),
      E.contractsLeads({ trade, geo: mode === 'national' ? null : geo, days: 14 }),
    ]));

    // SerpAPI, guarded by the monthly quota.
    const quota = await E.serpQuota(serpKey);
    const defs  = E.buildSerpDefs({ trade, location, searchType, tbs });
    let serpLists = [], serpRan = false;
    if (quota.ok && quota.left >= defs.length + SERP_MIN_LEFT) {
      serpRan = true;
      const r = await E.runSerpDefs(defs, serpKey);
      serpLists = r.lists; debug.sources.serp = r.debug;
    } else {
      debug.sources.serp = { skipped: quota.ok ? `quota low (${quota.left} left)` : quota.error };
      console.log('SerpAPI skipped:', debug.sources.serp.skipped);
    }
    let candidates = E.dedupeCandidates(E.interleave(serpLists));

    // Retry once without the date filter if nothing came back and quota allows.
    if (serpRan && candidates.length === 0 && tbs && quota.left >= defs.length + 3 + SERP_MIN_LEFT) {
      const r = await E.runSerpDefs(E.buildSerpDefs({ trade, location, searchType, tbs: '' }).slice(0, 3), serpKey);
      debug.sources.serpRetry = r.debug;
      candidates = E.dedupeCandidates(E.interleave(r.lists));
    }
    candidates = candidates.slice(0, 50);

    const scored = await E.scoreCandidates(candidates, { trade, isJob, areaCtx });
    debug.sources.scoring = { candidates: candidates.length, genuine: scored.leads.length, aiUsed: scored.aiUsed, aiError: scored.aiError };

    const structured = await structuredP;
    for (const s of structured) debug.sources[s.debug.label] = s.debug;

    const leads = [...scored.leads, ...structured.flatMap(s => s.leads)]
      .sort((a, b) => (b.score || 0) - (a.score || 0));

    let save = { saved: 0, skipped: 0 };
    try { save = await E.saveNewLeads(auth.user.id, leads, { trade, location }); }
    catch (e) { console.error('Saving leads failed:', e.message); debug.saveError = e.message; }

    const out = leads.map(({ _title, _snippet, ...l }) => l);
    return {
      statusCode: 200, headers,
      body: JSON.stringify({
        leads: out,
        totalSearched: candidates.length + structured.reduce((n, s) => n + (s.debug.records || s.debug.releases || 0), 0),
        totalGenuine: out.length,
        savedNew: save.saved,
        aiScored: scored.aiUsed,
        serpUsed: serpRan,
        trade, location, searchType, radius, daysSearched: days,
        collectorsRun: (serpRan ? defs.length : 0) + structured.length,
        ...(out.length === 0 ? { message: 'No results found — try UK-wide or Any time' } : {}),
        ...(debug.debugEnabled ? { debug } : {})
      })
    };
  } catch (err) {
    console.error('Scanner error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message, ...(debug.debugEnabled ? { debug } : {}) }) };
  }
};
