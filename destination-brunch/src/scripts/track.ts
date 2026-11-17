// Privacy-friendly tracking helpers. No cookies; nothing is sent anywhere unless an
// analytics provider is switched on in src/data/site.ts.
//
// - Keeps UTM campaign tags (utm_source, utm_medium, utm_campaign, utm_content, utm_term)
//   for the browser session, so a visitor arriving from a Facebook / Pinterest / TikTok
//   post keeps their campaign attribution as they browse.
// - Adds those UTM tags to the Gumroad link when "Download Now" is clicked, so Gumroad's
//   own analytics can attribute any sale to the campaign.
// - Sends events: "Destination View", "Product View", "Download Click".
//   A "Download Click" is an outbound click to Gumroad. It is NOT a completed purchase.

type Props = Record<string, string | number>;
declare global {
  interface Window {
    plausible?: (event: string, opts?: { props?: Props }) => void;
    umami?: { track: (event: string, data?: Props) => void };
  }
}

const KEY = 'db_utm';
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

function readUtm(): Record<string, string> {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

// Capture UTM tags from the landing URL (first touch in this session wins, unless a new campaign arrives).
(() => {
  const p = new URLSearchParams(location.search);
  const found: Record<string, string> = {};
  for (const k of UTM_KEYS) {
    const v = p.get(k);
    if (v) found[k] = v.slice(0, 100);
  }
  if (Object.keys(found).length) {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(found));
    } catch {
      /* storage blocked: ignore */
    }
  }
})();

function referrerSource(): string {
  try {
    if (!document.referrer) return 'direct';
    const h = new URL(document.referrer).hostname;
    return h === location.hostname ? 'internal' : h.replace(/^www\./, '');
  } catch {
    return 'unknown';
  }
}

export function track(event: string, props: Props = {}): void {
  const utm = readUtm();
  const all: Props = { ...props, source: utm.utm_source || referrerSource() };
  if (utm.utm_campaign) all.campaign = utm.utm_campaign;
  if (utm.utm_medium) all.medium = utm.utm_medium;
  try {
    if (window.plausible) window.plausible(event, { props: all });
    else if (window.umami) window.umami.track(event, all);
  } catch {
    /* never break the page for analytics */
  }
}

// Page-type events
const b = document.body.dataset;
const sendPageEvent = () => {
  if (b.trackType === 'destination') track('Destination View', { city: b.trackCity || '' });
  if (b.trackType === 'product')
    track('Product View', { city: b.trackCity || '', product: b.trackProduct || '', category: b.trackCategory || '' });
};
// Analytics scripts load with "defer"; wait for them.
if (document.readyState === 'complete') sendPageEvent();
else addEventListener('load', sendPageEvent, { once: true });

// Download Now clicks -> Gumroad
document.addEventListener('click', (e) => {
  const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[data-buy]');
  if (!a) return;
  const utm = readUtm();
  if (Object.keys(utm).length) {
    try {
      const u = new URL(a.href);
      for (const [k, v] of Object.entries(utm)) if (!u.searchParams.has(k)) u.searchParams.set(k, v);
      a.href = u.toString();
    } catch {
      /* leave link unchanged */
    }
  }
  track('Download Click', {
    product: a.dataset.product || '',
    city: a.dataset.city || '',
    category: a.dataset.category || '',
    price: Number(a.dataset.price || 0),
    placement: a.dataset.place || '',
  });
});
