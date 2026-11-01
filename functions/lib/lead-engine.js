/**
 * APTO Pro — shared lead engine (used by scan-leads.js and scheduled-scan.js)
 *
 *  - SerpAPI collectors (Google/Bing) — same queries for manual + hourly scans
 *  - SerpAPI monthly-quota guard (account endpoint is free and doesn't count)
 *  - Free structured sources: PlanIt planning applications (aggregated council
 *    planning data) and Contracts Finder (official UK gov OCDS API)
 *  - AI scoring via Anthropic with a rule-based fallback when the AI call fails
 *  - Cross-run dedupe (normalised URL + hash of title/snippet) and saving to
 *    the Supabase `leads` table
 */
const crypto = require('crypto');

const SERP_TIMEOUT_MS   = 30000; // long OR-queries measured at ~25s on SerpAPI
const CLAUDE_TIMEOUT_MS = 25000;
const FREE_TIMEOUT_MS   = 15000;
const UA = { 'User-Agent': 'APTO-Pro-lead-scanner/1.0 (+https://apto-pro.com/pro/)' };

const TRADE_TERMS = {
  plumbing:        ['plumber', 'plumbing', 'boiler repair', 'burst pipe', 'no hot water', 'leak fix'],
  electrical:      ['electrician', 'electrics', 'fuse box', 'rewire', 'electrical fault'],
  decorating:      ['decorator', 'painter decorator', 'painting decorating', 'wallpapering'],
  gardening:       ['gardener', 'garden maintenance', 'lawn care', 'landscaper', 'hedge trim'],
  building:        ['builder', 'building work', 'house extension', 'loft conversion', 'renovation'],
  'dog-grooming':  ['dog groomer', 'dog grooming', 'mobile dog groomer'],
  cleaning:        ['cleaner', 'domestic cleaning', 'end of tenancy clean', 'carpet cleaning'],
  removals:        ['removal company', 'man and van', 'house removals', 'moving company'],
  hvac:            ['boiler service', 'gas engineer', 'central heating repair', 'air conditioning'],
  locksmith:       ['locksmith', 'locked out', 'lock replacement'],
  catering:        ['caterer', 'event catering', 'wedding catering', 'buffet service'],
  photography:     ['photographer', 'wedding photographer', 'event photographer'],
  'windows-doors': ['window fitter', 'double glazing', 'UPVC windows', 'door replacement'],
  hairdressing:    ['mobile hairdresser', 'hairdresser', 'home hair stylist'],
  general:         ['handyman', 'odd jobs', 'home maintenance', 'DIY help'],
  carer:           ['carer', 'home help', 'elderly care', 'care worker'],
  clearance:       ['house clearance', 'rubbish removal', 'garden waste removal'],
  roofing:         ['roofer', 'roof repair', 'flat roof', 'roof leak'],
  plastering:      ['plasterer', 'plastering', 'skim plaster', 'ceiling repair'],
  tiling:          ['tiler', 'tile fitting', 'bathroom tiling', 'kitchen tiling'],
};
const JOB_TERMS = {
  plumbing: ['plumber wanted', 'plumber needed', 'subcontractor plumber'],
  electrical: ['electrician wanted', 'electrician needed'],
  decorating: ['decorator wanted', 'painter wanted'],
  gardening: ['gardener wanted', 'landscaper wanted'],
  building: ['builder wanted', 'builder needed', 'subcontractor builder'],
  cleaning: ['cleaner wanted', 'cleaner needed'],
  removals: ['removal driver wanted', 'man and van wanted'],
  hvac: ['gas engineer wanted', 'heating engineer wanted'],
  general: ['handyman wanted', 'odd job man wanted'],
  carer: ['carer wanted', 'care worker wanted'],
  clearance: ['clearance driver wanted'],
  roofing: ['roofer wanted', 'roofing subcontractor'],
  plastering: ['plasterer wanted'],
  tiling: ['tiler wanted'],
};
const INTENTS = [
  'looking for a', 'can anyone recommend', 'need a', 'after a',
  'any recommendations for', 'does anyone know a good', 'looking to get',
  'need someone to', 'getting quotes for', 'any good', 'recommendations please',
  'need help with', 'who does', 'anyone used a', 'can someone recommend',
];

// Keywords used to map planning descriptions / contract titles to trades.
const STRUCTURED_KEYWORDS = {
  plumbing:   ['plumbing', 'bathroom', 'toilet', 'drainage', 'shower room', 'wc'],
  electrical: ['electrical', 'solar panel', 'photovoltaic', 'ev charg', 'lighting', 'rewir'],
  decorating: ['redecorat', 'painting', 'render', 'decoration'],
  gardening:  ['landscap', 'garden', 'grounds maintenance', 'tree', 'hedge'],
  building:   ['extension', 'loft conversion', 'outbuilding', 'erection of', 'demolition', 'conversion', 'refurbish', 'alteration', 'construction', 'dormer', 'garage'],
  cleaning:   ['cleaning', 'cleansing'],
  removals:   ['removal', 'relocation'],
  hvac:       ['heat pump', 'boiler', 'air conditioning', 'ventilation', 'hvac', 'heating'],
  locksmith:  ['lock', 'access control'],
  catering:   ['catering'],
  photography:['photograph'],
  'windows-doors': ['window', 'door', 'glazing', 'upvc'],
  general:    ['repairs', 'maintenance', 'handyman'],
  carer:      ['care service', 'home care', 'domiciliary'],
  clearance:  ['clearance', 'waste removal'],
  roofing:    ['roof', 'slate', 'dormer', 'guttering'],
  plastering: ['plaster', 'render'],
  tiling:     ['tiling', 'tiles'],
};
// Contracts Finder CPV prefixes -> trades.
const CPV_TRADES = [
  ['4533', 'plumbing'], ['4531', 'electrical'], ['4544', 'decorating'], ['7731', 'gardening'],
  ['4521', 'building'], ['4545', 'building'], ['4540', 'building'], ['9091', 'cleaning'],
  ['9839', 'removals'], ['4533', 'hvac'], ['4526', 'roofing'], ['4541', 'plastering'],
  ['4543', 'tiling'], ['4542', 'windows-doors'], ['5552', 'catering'], ['7996', 'photography'],
  ['8531', 'carer'], ['9050', 'clearance'], ['5070', 'general'], ['5080', 'general'],
];

const PROMO = ['we offer', 'our services', 'call us', 'get a quote from us', 'we specialise', 'free quote', 'book now'];
const URGENT = ['urgent', 'asap', 'emergency', 'today', 'tonight', 'tomorrow', 'burst', 'leak', 'no hot water', 'locked out', 'flood'];

async function fetchWithTimeout(url, options = {}, timeoutMs = SERP_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try { return await fetch(url, { ...options, signal: controller.signal }); }
  finally { clearTimeout(timer); }
}

function interleave(lists) {
  const out = []; const max = lists.reduce((m, l) => Math.max(m, l.length), 0);
  for (let i = 0; i < max; i++) for (const l of lists) if (i < l.length) out.push(l[i]);
  return out;
}
function orGroup(terms) {
  const list = (Array.isArray(terms) ? terms : [terms]).filter(Boolean);
  if (list.length <= 1) return `"${list[0] || ''}"`;
  return '(' + list.map(t => `"${t}"`).join(' OR ') + ')';
}

// ── SerpAPI ───────────────────────────────────────────────────────────────────
async function serpSearch(params, serpKey) {
  const url = new URL('https://serpapi.com/search.json');
  url.searchParams.set('api_key', serpKey);
  for (const [k, v] of Object.entries(params)) if (v) url.searchParams.set(k, String(v));
  const res = await fetchWithTimeout(url.toString(), {}, SERP_TIMEOUT_MS);
  const data = await res.json();
  if (data.error && /hasn't returned any results/i.test(data.error)) return [];
  if (data.error) throw new Error(`SerpAPI: ${data.error}`);
  return data.organic_results || data.news_results || [];
}

// SerpAPI's account endpoint is free (does not use a search credit).
async function serpQuota(serpKey) {
  if (!serpKey) return { ok: false, left: 0, error: 'SERPAPI_KEY not set' };
  try {
    const res = await fetchWithTimeout(`https://serpapi.com/account.json?api_key=${encodeURIComponent(serpKey)}`, {}, 10000);
    const d = await res.json();
    if (d.error) return { ok: false, left: 0, error: d.error };
    return { ok: true, left: Number(d.total_searches_left) || 0, perMonth: d.searches_per_month, used: d.this_month_usage, renews: d.plan_renewal_date };
  } catch (e) { return { ok: false, left: 0, error: e.message }; }
}

function normaliseSerp(items, label) {
  return items.map(item => ({
    title: item.title || '', snippet: item.snippet || item.description || '',
    link: item.link || item.url || '',
    source: (() => { try { return new URL(item.link || item.url || '').hostname; } catch { return label; } })(),
    engine: label,
  })).filter(i => i.link && i.title);
}

// Collector definitions in priority order (most productive first), so callers
// with a small SerpAPI budget can take the first N.
function buildSerpDefs({ trade = 'plumbing', location = '', searchType = 'customer', tbs = '' }) {
  const isJob = searchType === 'jobs', isAll = trade === 'all';
  const loc = location ? ` "${location}"` : '';
  const list = isJob ? (JOB_TERMS[trade] || [trade + ' wanted']) : (TRADE_TERMS[trade] || [trade]);
  const allTerms = isAll ? (isJob ? ['tradesperson wanted', 'subcontractor needed', 'tradesman wanted']
    : ['plumber', 'electrician', 'builder', 'cleaner', 'gardener', 'decorator', 'roofer', 'handyman']) : list;
  const term = orGroup(allTerms);
  const [i1, i2, i3, i4, i5] = INTENTS;
  const g = (label, q, extra = {}) => ({ label, params: { engine: 'google', q, num: 20, hl: 'en', gl: 'uk', tbs, ...extra } });
  if (isJob) return [
    g('google-open', `${term}${loc} -"we offer" -"our services"`),
    g('google-reddit', `${term}${loc} site:reddit.com`),
    g('google-gumtree', `${term}${loc} site:gumtree.com`),
    { label: 'bing', params: { engine: 'bing', q: `${term}${loc || ' UK'}`, count: 20, mkt: 'en-GB' } },
  ];
  return [
    g('google-open', `("${i1}" OR "${i2}" OR "${i3}") ${term}${loc} -"we offer" -"our services" -"call us today" -"get a quote from us" -"we specialise" -site:nextdoor.co.uk`),
    g('google-facebook', `("${i1}" OR "${i2}" OR "${i3}" OR "${INTENTS[10]}") ${term}${loc} site:facebook.com`),
    g('google-reddit', `("${i1}" OR "${i2}" OR "${i3}") ${term}${loc} site:reddit.com`),
    { label: 'bing', params: { engine: 'bing', q: `("${i1}" OR "${i2}" OR "${i3}") ${term}${loc || ' UK'} -"we offer" -"our services"`, count: 20, mkt: 'en-GB', freshness: tbs ? 'Week' : undefined } },
    g('google-mumsnet', `("${i1}" OR "${i2}" OR "${i5}" OR "${INTENTS[5]}") ${term}${loc} site:mumsnet.com`),
    g('google-gumtree', `("${i1}" OR "${i3}" OR "wanted") ${term}${loc} site:gumtree.com`),
    g('google-forums', `("${i2}" OR "${i1}" OR "${INTENTS[10]}" OR "${INTENTS[11]}") ${term}${loc} (site:forums.moneysavingexpert.com OR site:diychatroom.com OR site:buildhub.org.uk OR site:pistonheads.com)`),
    g('google-open2', `("${i4}" OR "${INTENTS[6]}" OR "${INTENTS[7]}" OR "${INTENTS[8]}" OR "${INTENTS[9]}") ${term}${loc} -"we offer" -"our services" -site:nextdoor.co.uk`, { num: 10, start: 10 }),
  ];
}

async function runSerpDefs(defs, serpKey) {
  const settled = await Promise.allSettled(defs.map(d => serpSearch(d.params, serpKey)));
  const lists = [], debug = [];
  settled.forEach((r, i) => {
    if (r.status === 'fulfilled') { const n = normaliseSerp(r.value, defs[i].label); lists.push(n); debug.push({ label: defs[i].label, count: n.length }); }
    else { lists.push([]); debug.push({ label: defs[i].label, count: 0, error: r.reason?.message }); console.error(`Collector ${defs[i].label} failed:`, r.reason?.message); }
  });
  return { lists, debug };
}

// ── Geocoding (postcodes.io, free, no key) ───────────────────────────────────
async function geocode(location) {
  if (!location || /^uk$/i.test(location.trim())) return null;
  const q = location.split(',')[0].trim();
  try {
    if (/^[A-Z]{1,2}\d[A-Z\d]?\s*(\d[A-Z]{2})?$/i.test(q)) {
      const full = /\d[A-Z]{2}$/i.test(q.replace(/\s/g, ''));
      const r = await fetchWithTimeout(`https://api.postcodes.io/${full ? 'postcodes' : 'outcodes'}/${encodeURIComponent(q)}`, {}, 8000);
      const d = await r.json();
      if (d.result) return { lat: d.result.latitude, lng: d.result.longitude, region: d.result.region || (d.result.european_electoral_region || [])[0] || null, name: q };
    }
    const r = await fetchWithTimeout(`https://api.postcodes.io/places?q=${encodeURIComponent(q)}&limit=20`, {}, 8000);
    const d = await r.json();
    const rank = { City: 0, Town: 1, Village: 2, Suburban_Area: 3, Hamlet: 5, Other_Settlement: 6 };
    const best = (d.result || []).filter(p => (p.name_1 || '').toLowerCase() === q.toLowerCase())
      .sort((a, b) => (rank[a.local_type] ?? 4) - (rank[b.local_type] ?? 4))[0];
    if (best) return { lat: best.latitude, lng: best.longitude, region: best.region || null, name: best.name_1 };
  } catch (e) { console.error('geocode failed:', e.message); }
  return null;
}

function tradesFromText(text) {
  const t = (text || '').toLowerCase(); const out = [];
  for (const [trade, kws] of Object.entries(STRUCTURED_KEYWORDS)) if (kws.some(k => t.includes(k))) out.push(trade);
  return out;
}
const tradeMatches = (trade, trades) => trade === 'all' || trades.includes(trade);

// ── Free source 1: planning applications (PlanIt aggregates UK council data) ─
async function planningLeads({ trade, geo, radiusMiles = 10, days = 30 }) {
  if (!geo) return { leads: [], debug: { label: 'planning', skipped: 'no geocodable location' } };
  const km = Math.min(Math.max(radiusMiles, 2), 30) * 1.609;
  const dLat = km / 111, dLng = km / (111 * Math.cos(geo.lat * Math.PI / 180));
  const bbox = [geo.lng - dLng, geo.lat - dLat, geo.lng + dLng, geo.lat + dLat].map(n => n.toFixed(4)).join(',');
  try {
    // PlanIt is rate limited and occasionally returns an HTML error page; retry once.
    let d = null;
    for (let attempt = 0; attempt < 2 && !d; attempt++) {
      if (attempt) await new Promise(r => setTimeout(r, 8000));
      const res = await fetchWithTimeout(`https://www.planit.org.uk/api/applics/json?bbox=${bbox}&pg_sz=200&sort=-start_date`, { headers: UA }, FREE_TIMEOUT_MS * 2);
      const text = await res.text();
      try { d = JSON.parse(text); } catch { if (attempt) throw new Error(`PlanIt returned non-JSON (HTTP ${res.status})`); }
    }
    const cutoff = Date.now() - days * 864e5;
    const leads = [];
    for (const r of d.records || []) {
      const date = Date.parse(r.start_date || r.last_different || '');
      if (date && date < cutoff) continue;
      // Skip tree-works notices (unless gardening) and paperwork-only applications.
      if (r.app_type === 'Trees' && trade !== 'gardening') continue;
      if (/^\s*(variation|discharge|non[- ]material|removal) of condition/i.test(r.description || '')) continue;
      const trades = tradesFromText(r.description);
      if (r.app_type === 'Trees') trades.push('gardening');
      if (!tradeMatches(trade, trades)) continue;
      const pc = (r.postcode || (r.address || '').match(/[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}\s*$/i)?.[0] || '').trim();
      leads.push({
        isGenuineLead: true, aiScored: false, kind: 'planning',
        score: 60 + (/(extension|loft|conversion|refurbish|roof)/i.test(r.description) ? 10 : 0) + (r.app_size === 'Small' ? 5 : 0),
        headline: `Planning application: ${(r.description || '').slice(0, 90)}`,
        urgency: 'Normal',
        detectedLocation: pc || r.area_name || geo.name,
        detectedTrade: trade === 'all' ? (trades[0] || 'building') : trade,
        reply: 'Planning applicant — work may need a contractor once approved. Approach via a polite letter/flyer to the address, not unsolicited calls.',
        sourceUrl: r.link || r.url, sourceName: `Planning (${r.area_name || 'council'})`,
        _title: r.name || '', _snippet: r.description || '',
      });
    }
    return { leads: leads.slice(0, 15), debug: { label: 'planning', records: (d.records || []).length, matched: leads.length } };
  } catch (e) { return { leads: [], debug: { label: 'planning', error: e.message } }; }
}

// ── Free source 2: Contracts Finder (official UK gov OCDS API) ───────────────
async function contractsLeads({ trade, geo, days = 14 }) {
  const from = new Date(Date.now() - days * 864e5).toISOString().slice(0, 19);
  try {
    let url = `https://www.contractsfinder.service.gov.uk/Published/Notices/OCDS/Search?publishedFrom=${from}&stages=tender&limit=100`;
    const releases = [];
    for (let page = 0; page < 3 && url; page++) {
      const res = await fetchWithTimeout(url, { headers: UA }, FREE_TIMEOUT_MS);
      const d = await res.json();
      releases.push(...(d.releases || []));
      url = d.links?.next || null;
    }
    const leads = [];
    for (const r of releases) {
      const t = r.tender || {};
      const cpv = String(t.classification?.id || '');
      const trades = new Set(tradesFromText(`${t.title} ${t.description || ''}`));
      for (const [p, tr] of CPV_TRADES) if (cpv.startsWith(p)) trades.add(tr);
      if (!tradeMatches(trade, [...trades])) continue;
      const regions = (t.items || []).flatMap(i => i.deliveryAddresses || []).map(a => a.region).filter(Boolean);
      if (geo?.region && regions.length && !regions.some(x => x.toLowerCase() === geo.region.toLowerCase())) continue;
      const value = t.value?.amount;
      if (value && value > 2_000_000) continue; // keep to jobs a sole trader / small firm could take
      const buyer = (r.parties || []).find(p => (p.roles || []).includes('buyer'))?.name || r.buyer?.name || 'Public buyer';
      const ocid = r.ocid || '';
      const noticeId = (r.id || '').split('-').slice(0, 5).join('-');
      leads.push({
        isGenuineLead: true, aiScored: false, kind: 'contract',
        score: 65 + (value && value < 100000 ? 10 : 0),
        headline: `Public contract: ${(t.title || '').slice(0, 90)}${value ? ` (£${Math.round(value).toLocaleString('en-GB')})` : ''}`,
        urgency: t.tenderPeriod?.endDate && Date.parse(t.tenderPeriod.endDate) - Date.now() < 7 * 864e5 ? 'High' : 'Normal',
        detectedLocation: (geo?.region && regions.find(x => x.toLowerCase() === geo.region.toLowerCase())) || regions[0] || 'UK',
        detectedTrade: trade === 'all' ? ([...trades][0] || 'general') : trade,
        reply: `Tender from ${buyer}${t.tenderPeriod?.endDate ? `, closes ${t.tenderPeriod.endDate.slice(0, 10)}` : ''}. Respond via the Contracts Finder notice.`,
        sourceUrl: noticeId ? `https://www.contractsfinder.service.gov.uk/Notice/${noticeId}` : `https://www.contractsfinder.service.gov.uk/Search?ocid=${ocid}`,
        sourceName: 'Contracts Finder (gov.uk)',
        _title: t.title || '', _snippet: t.description || '',
      });
    }
    return { leads: leads.slice(0, 15), debug: { label: 'contracts-finder', releases: releases.length, matched: leads.length } };
  } catch (e) { return { leads: [], debug: { label: 'contracts-finder', error: e.message } }; }
}

// ── Scoring: Anthropic first, rule-based fallback ────────────────────────────
function ruleScore(c, { trade, isJob }) {
  const text = `${c.title} ${c.snippet}`.toLowerCase();
  if (PROMO.some(p => text.includes(p))) return null;
  const intent = INTENTS.some(p => text.includes(p)) || /recommend|wanted|needed|anyone know|quotes?/.test(text);
  const terms = (isJob ? JOB_TERMS[trade] : TRADE_TERMS[trade]) || (trade === 'all' ? Object.values(TRADE_TERMS).flat() : [trade]);
  const tradeHit = terms.some(t => text.includes(t.toLowerCase()));
  if (!intent || !tradeHit) return null;
  const urgent = URGENT.some(u => text.includes(u));
  return {
    isGenuineLead: true, aiScored: false,
    score: Math.min(95, 50 + (intent ? 15 : 0) + (tradeHit ? 10 : 0) + (urgent ? 15 : 0) + (/reddit|mumsnet|facebook|gumtree|forum/.test(c.source) ? 5 : 0)),
    headline: c.title.slice(0, 90), urgency: urgent ? 'High' : 'Normal',
    detectedLocation: null, detectedTrade: trade === 'all' ? 'general' : trade,
    reply: `Hi, I saw your post — I'm a local ${trade === 'all' ? 'tradesperson' : trade.replace('-', ' ')} and would be happy to help. Can I ask a couple of quick questions and give you a quote?`,
    sourceUrl: c.link, sourceName: c.source,
  };
}

async function scoreCandidates(candidates, { trade, isJob, areaCtx }) {
  if (!candidates.length) return { leads: [], aiUsed: false };
  const tradeLabel = trade === 'all' ? 'any trade' : trade;
  const prompt = `You are APTO Pro Lead Filter. Find genuine posts from people SEEKING ${isJob ? 'a self-employed' : 'a'} ${tradeLabel} ${isJob ? 'for a job/subcontract' : 'service'} ${areaCtx}.
Exclude tradespeople/businesses advertising their OWN services, directory pages and off-topic content. When in doubt, include.
Return ONLY a valid JSON array (empty [] if none):
[{"isGenuineLead":true,"score":80,"headline":"what they need in 10 words","urgency":"High","detectedLocation":"Brighton","detectedTrade":"Plumbing","reply":"friendly reply as tradesperson under 40 words","sourceUrl":"https://...","sourceName":"reddit.com"}]
RESULTS:
${JSON.stringify(candidates.map(({ title, snippet, link, source }) => ({ title, snippet, link, source })))}`;
  try {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');
    const res = await fetchWithTimeout('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 4000, messages: [{ role: 'user', content: prompt }] }),
    }, CLAUDE_TIMEOUT_MS);
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(`Anthropic ${res.status}: ${data.error?.message || 'error'}`);
    const raw = (data.content || []).map(b => b.text || '').join('');
    let arr;
    try { arr = JSON.parse(raw.replace(/```json|```/g, '').trim()); }
    catch { const s = raw.indexOf('['), e = raw.lastIndexOf(']'); arr = JSON.parse(raw.slice(s, e + 1)); }
    if (!Array.isArray(arr)) throw new Error('AI returned non-array');
    const byUrl = new Map(candidates.map(c => [c.link, c]));
    const leads = arr.filter(l => l && l.isGenuineLead).map(l => {
      const c = byUrl.get(l.sourceUrl) || {};
      return { ...l, aiScored: true, _title: c.title || '', _snippet: c.snippet || '' };
    });
    return { leads, aiUsed: true };
  } catch (e) {
    console.error('AI scoring failed, using rule-based fallback:', e.message);
    const leads = candidates.map(c => { const l = ruleScore(c, { trade, isJob }); return l && { ...l, _title: c.title, _snippet: c.snippet }; }).filter(Boolean);
    return { leads, aiUsed: false, aiError: e.message };
  }
}

// ── Dedupe + Supabase ─────────────────────────────────────────────────────────
function normaliseUrl(u) {
  try {
    const x = new URL(String(u).split('#')[0]);
    let host = x.hostname.toLowerCase().replace(/^(www|m|mobile|old)\./, '');
    const keep = ['id', 'story_fbid', 'p', 'v', 't', 'ocid'];
    const qs = [...x.searchParams].filter(([k]) => keep.includes(k)).sort().map(([k, v]) => `${k}=${v}`).join('&');
    return `${host}${x.pathname.replace(/\/+$/, '')}${qs ? '?' + qs : ''}`.toLowerCase();
  } catch { return String(u || '').toLowerCase(); }
}
function contentHash(title, snippet) {
  const norm = `${title || ''} ${snippet || ''}`.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
  return crypto.createHash('sha1').update(norm).digest('hex').slice(0, 16);
}
// The leads table has no hash column, so the content hash is carried in the
// stored URL's fragment (#apto=<hash>). Browsers ignore it; dedupe reads it.
function hashFromStoredUrl(u) { const m = String(u || '').match(/#apto=([a-f0-9]{16})/); return m ? m[1] : null; }

function sbHeaders(extra = {}) {
  const k = process.env.SUPABASE_SERVICE_KEY;
  return { apikey: k, Authorization: `Bearer ${k}`, 'Content-Type': 'application/json', ...extra };
}
async function sbGet(path) {
  const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/${path}`, { headers: sbHeaders() });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${body?.message || 'request failed'}`);
  return body;
}

async function existingKeys(userId) {
  const rows = await sbGet(`leads?user_id=eq.${encodeURIComponent(userId)}&select=source_url&order=found_at.desc&limit=2000`);
  const urls = new Set(), hashes = new Set();
  for (const r of Array.isArray(rows) ? rows : []) {
    urls.add(normaliseUrl(r.source_url)); const h = hashFromStoredUrl(r.source_url); if (h) hashes.add(h);
  }
  return { urls, hashes };
}

// Saves only leads not already stored for this user. Returns { saved, skipped }.
async function saveNewLeads(userId, leads, { trade, location }) {
  if (!userId || !leads.length) return { saved: 0, skipped: 0 };
  const { urls, hashes } = await existingKeys(userId);
  const rows = [];
  for (const l of leads) {
    if (!l.sourceUrl) continue;
    const nu = normaliseUrl(l.sourceUrl), h = contentHash(l._title || l.headline, l._snippet || '');
    if (urls.has(nu) || hashes.has(h)) continue;
    urls.add(nu); hashes.add(h);
    rows.push({
      user_id: userId,
      trade: String(l.detectedTrade || trade || '').toLowerCase().slice(0, 50),
      location: l.detectedLocation || location || 'UK',
      headline: l.headline,
      score: Math.round(Number(l.score) || 0),
      urgency: l.urgency || 'Normal',
      reply: l.reply || '',
      source_url: `${String(l.sourceUrl).split('#')[0]}#apto=${h}`,
      source_name: `${l.sourceName || ''}${l.aiScored ? '' : ' (rule-scored)'}`.trim(),
      is_read: false,
      found_at: new Date().toISOString(),
    });
  }
  if (!rows.length) return { saved: 0, skipped: leads.length };
  const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/leads`, {
    method: 'POST', headers: sbHeaders({ Prefer: 'return=minimal' }), body: JSON.stringify(rows),
  });
  if (!res.ok) throw new Error(`Supabase insert ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return { saved: rows.length, skipped: leads.length - rows.length };
}

// Location per user: there's no location column in user_settings, so the
// server records the last manual-scan location in auth app_metadata.
async function getUserLocation(userId) {
  try {
    const res = await fetch(`${process.env.SUPABASE_URL}/auth/v1/admin/users/${userId}`, { headers: sbHeaders() });
    const u = await res.json();
    return { location: u?.app_metadata?.apto_location || u?.user_metadata?.location || '', radius: Number(u?.app_metadata?.apto_radius) || 10 };
  } catch { return { location: '', radius: 10 }; }
}
async function setUserLocation(userId, location, radius) {
  try {
    const res = await fetch(`${process.env.SUPABASE_URL}/auth/v1/admin/users/${userId}`, { headers: sbHeaders() });
    const u = await res.json();
    if (u?.app_metadata?.apto_location === location && Number(u?.app_metadata?.apto_radius) === radius) return;
    await fetch(`${process.env.SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
      method: 'PUT', headers: sbHeaders(),
      body: JSON.stringify({ app_metadata: { ...(u?.app_metadata || {}), apto_location: location, apto_radius: radius } }),
    });
  } catch (e) { console.error('setUserLocation failed:', e.message); }
}

function dedupeCandidates(items) {
  const seen = new Set();
  return items.filter(i => { const k = normaliseUrl(i.link); if (!i.link || seen.has(k)) return false; seen.add(k); return true; });
}

module.exports = {
  TRADE_TERMS, INTENTS, fetchWithTimeout, interleave, buildSerpDefs, runSerpDefs, serpQuota,
  geocode, planningLeads, contractsLeads, scoreCandidates, ruleScore, saveNewLeads,
  normaliseUrl, contentHash, sbGet, getUserLocation, setUserLocation, dedupeCandidates,
};
