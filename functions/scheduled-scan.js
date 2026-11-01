/**
 * APTO Pro — Scheduled Lead Scanner (hourly trigger, see netlify.toml; work runs in scan-worker-background.js)
 *
 * For every user with alerts enabled, uses that user's trade (user_settings)
 * and location (last manual-scan location, stored in auth app_metadata) and:
 *   - every run:      Contracts Finder (free, official gov API)
 *   - every 6 hours:  planning applications near the user (free)
 *   - once a day (SERP_HOUR_UTC, default 07:00 UTC): the same SerpAPI
 *     collectors as scan-leads, capped by a monthly-quota guard so the free
 *     250 searches/month plan isn't exhausted.
 * New leads are deduped against everything already stored for that user and
 * saved to Supabase `leads`. No emails or notifications are sent here.
 */
const E = require('./lib/lead-engine');

const SERP_HOUR_UTC       = Number(process.env.SERP_HOUR_UTC ?? 7);
const SERP_RESERVE        = Number(process.env.SERP_RESERVE ?? 100); // kept back for manual scans
const SERP_MAX_PER_USER   = Number(process.env.SERP_MAX_PER_USER ?? 3);

function daysLeftInMonth(renews) {
  const end = renews ? Date.parse(renews) : NaN;
  const now = Date.now();
  if (!isNaN(end) && end > now) return Math.max(1, Math.ceil((end - now) / 864e5));
  const d = new Date(); return new Date(d.getUTCFullYear(), d.getUTCMonth() + 1, 0).getUTCDate() - d.getUTCDate() + 1;
}

async function scanUser(setting, opts) {
  const trade = setting.trade || 'plumbing';
  const { location, radius } = await E.getUserLocation(setting.user_id);
  const geo = await E.geocode(location);
  const report = { user: setting.user_id.slice(0, 8), trade, location: location || 'UK', sources: {}, saved: 0 };
  const leads = [];

  const cf = await E.contractsLeads({ trade, geo });
  report.sources.contracts = cf.debug; leads.push(...cf.leads);

  if (opts.runPlanning) {
    const pl = await E.planningLeads({ trade, geo, radiusMiles: radius });
    report.sources.planning = pl.debug; leads.push(...pl.leads);
  }

  if (opts.serpPerUser > 0) {
    const defs = E.buildSerpDefs({ trade, location, tbs: 'qdr:d2' }) // daily run; 2-day window overlaps, dedupe drops repeats.slice(0, opts.serpPerUser);
    const { lists, debug } = await E.runSerpDefs(defs, process.env.SERPAPI_KEY);
    report.sources.serp = debug;
    const candidates = E.dedupeCandidates(E.interleave(lists)).slice(0, 50);
    const scored = await E.scoreCandidates(candidates, { trade, isJob: false, areaCtx: location ? `in or near ${location}` : 'anywhere in the UK' });
    report.sources.scoring = { candidates: candidates.length, genuine: scored.leads.length, aiUsed: scored.aiUsed, aiError: scored.aiError };
    leads.push(...scored.leads);
  }

  const r = await E.saveNewLeads(setting.user_id, leads, { trade, location });
  report.found = leads.length; report.saved = r.saved; report.duplicates = r.skipped;
  return report;
}

async function run({ forceSerp = false, forcePlanning = false, dryRunSerp = false } = {}) {
  const hour = new Date().getUTCHours();
  let settings;
  try { settings = await E.sbGet('user_settings?alerts_enabled=eq.true&select=user_id,trade,alert_min_score'); }
  catch (e) { console.error('Could not load user_settings:', e.message); return { success: false, error: e.message }; }
  if (!Array.isArray(settings)) { console.error('user_settings response was not a list'); return { success: false, error: 'bad user_settings response' }; }
  console.log(`Scheduled scan: ${settings.length} users with alerts enabled`);

  let serpPerUser = 0, quota = null;
  if ((hour === SERP_HOUR_UTC || forceSerp) && !dryRunSerp && settings.length) {
    quota = await E.serpQuota(process.env.SERPAPI_KEY);
    if (quota.ok) {
      const daily = Math.floor(Math.max(0, quota.left - SERP_RESERVE) / daysLeftInMonth(quota.renews));
      serpPerUser = Math.min(SERP_MAX_PER_USER, Math.floor(daily / settings.length));
    }
    console.log(`SerpAPI guard: left=${quota.ok ? quota.left : 'unknown'} perUser=${serpPerUser}${quota.ok ? '' : ' (' + quota.error + ')'}`);
  }
  const runPlanning = forcePlanning || hour % 6 === 0;

  const reports = [];
  for (const s of settings) {
    if (!s || !s.user_id) continue;
    try { reports.push(await scanUser(s, { serpPerUser, runPlanning })); }
    catch (e) { console.error(`Scan failed for user ${String(s.user_id).slice(0, 8)}:`, e.message); reports.push({ user: String(s.user_id).slice(0, 8), error: e.message }); }
  }
  console.log('Scheduled scan results:', JSON.stringify(reports));
  return { success: true, usersScanned: settings.length, serpPerUser, serpLeftBefore: quota?.left ?? null, reports };
}

exports.run = run;

// Netlify scheduled functions are capped at 30s, but one SerpAPI query can
// take ~25s, so the hourly trigger just hands off to the background worker
// (scan-worker-background.js, 15-minute limit), which calls run().
exports.cronToken = () => require('crypto').createHmac('sha256', process.env.SUPABASE_SERVICE_KEY || '').update('apto-scan-worker').digest('hex');
exports.handler = async () => {
  try {
    const base = process.env.URL || 'https://apto-pro.com';
    const res = await fetch(`${base}/.netlify/functions/scan-worker-background`, {
      method: 'POST', headers: { 'x-apto-cron': exports.cronToken() }, body: '{}',
    });
    console.log(`Scheduled scan: handed off to background worker (HTTP ${res.status})`);
    return { statusCode: 200, body: JSON.stringify({ dispatched: res.status }) };
  } catch (err) {
    console.error('Scheduled scan dispatch error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
