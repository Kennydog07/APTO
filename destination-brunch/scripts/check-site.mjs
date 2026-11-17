// Checks the built website in dist/ (run `npm run build` first, or just `npm test`).
// Fails if anything would mislead customers or break SEO; prints launch to-dos as warnings.
import fs from 'node:fs';
import path from 'node:path';
import { PRODUCTS } from '../src/data/products.ts';

const dist = path.resolve(import.meta.dirname, '../dist');
const pub = path.resolve(import.meta.dirname, '../public');
const errors = [];
const warnings = [];
const GUMROAD = /^https:\/\/([a-z0-9-]+\.)?gumroad\.com\/l\/[A-Za-z0-9_-]+\/?(\?[^\s#]*)?$/;

const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const files = walk(dist);
const html = files.filter((f) => f.endsWith('.html'));
const routeOf = (f) => '/' + path.relative(dist, f).replace(/\\/g, '/').replace(/(index)?\.html$/, '').replace(/\/$/, '');
const exists = (urlPath) => {
  const p = decodeURIComponent(urlPath.split(/[?#]/)[0]).replace(/\/$/, '') || '/';
  if (p === '/') return fs.existsSync(path.join(dist, 'index.html'));
  return [p, `${p}.html`, `${p}/index.html`].some((c) => fs.existsSync(path.join(dist, c)) && fs.statSync(path.join(dist, c)).isFile());
};
const attr = (tag, name) => (tag.match(new RegExp(`\\s${name}="([^"]*)"`)) || [])[1];

const titles = new Map();
const descs = new Map();
let buyLinks = 0;

for (const f of html) {
  const route = routeOf(f);
  const s = fs.readFileSync(f, 'utf8');
  const is404 = route === '/404';
  const title = (s.match(/<title>([^<]*)<\/title>/) || [])[1];
  const desc = (s.match(/<meta name="description" content="([^"]*)"/) || [])[1];
  if (!title) errors.push(`${route}: missing <title>`);
  if (!desc) errors.push(`${route}: missing meta description`);
  if (!is404) {
    if (titles.has(title)) errors.push(`${route}: duplicate title (also ${titles.get(title)})`);
    if (descs.has(desc)) errors.push(`${route}: duplicate description (also ${descs.get(desc)})`);
    titles.set(title, route);
    descs.set(desc, route);
    if (!/<link rel="canonical" href="https?:\/\/[^"]+"/.test(s)) errors.push(`${route}: missing canonical URL`);
    const canon = (s.match(/<link rel="canonical" href="([^"]+)"/) || [])[1] || '';
    if (/\.html$/.test(canon) || (canon && new URL(canon).pathname.length > 1 && canon.endsWith('/'))) errors.push(`${route}: canonical should be a clean URL, got ${canon}`);
    if (canon && new URL(canon).pathname !== (route || '/')) errors.push(`${route}: canonical ${canon} does not match the page`);
  }
  if (desc && (desc.length < 50 || desc.length > 170)) warnings.push(`${route}: description is ${desc.length} characters (aim for 50-160)`);
  const h1s = (s.match(/<h1[\s>]/g) || []).length;
  if (h1s !== 1) errors.push(`${route}: has ${h1s} <h1> headings (should be 1)`);
  const og = (s.match(/<meta property="og:image" content="([^"]+)"/) || [])[1];
  if (!og) errors.push(`${route}: missing og:image`);
  else if (!fs.existsSync(path.join(pub, new URL(og).pathname))) errors.push(`${route}: og:image file not found ${new URL(og).pathname}`);

  for (const m of s.matchAll(/<img\b[^>]*>/g)) {
    if (attr(m[0], 'alt') === undefined) errors.push(`${route}: image without alt text: ${attr(m[0], 'src')}`);
    const src = attr(m[0], 'src');
    if (src?.startsWith('/') && !fs.existsSync(path.join(dist, src))) errors.push(`${route}: missing image ${src}`);
  }
  for (const m of s.matchAll(/<a\b[^>]*>/g)) {
    const href = attr(m[0], 'href');
    if (!href) continue;
    if (href.startsWith('/') && !href.startsWith('//') && !exists(href)) errors.push(`${route}: broken link ${href}`);
    if (/data-buy/.test(m[0])) {
      buyLinks++;
      const id = attr(m[0], 'data-product');
      const p = PRODUCTS.find((x) => x.id === id);
      if (!p) errors.push(`${route}: Download Now for unknown product ${id}`);
      else {
        if (p.status !== 'published') errors.push(`${route}: Download Now shown for "${id}" which is ${p.status}`);
        if (!GUMROAD.test(href)) errors.push(`${route}: Download Now for "${id}" is not a Gumroad product link: ${href}`);
        if (href !== p.gumroadURL.trim()) errors.push(`${route}: Download Now for "${id}" points to ${href}, not its own Gumroad link`);
        if (!/rel="[^"]*noopener/.test(m[0])) errors.push(`${route}: Download Now link missing rel="noopener"`);
      }
    } else if (/gumroad\.com/.test(href)) {
      if (!href.includes('gumroad.com/privacy')) errors.push(`${route}: Gumroad link outside a Download Now button: ${href}`);
    }
  }
  if (/To complete before launch/.test(s)) warnings.push(`${route}: has "To complete before launch" items (see src/data/site.ts)`);
}

// Products: published+linked must be buyable; nothing else may be.
for (const p of PRODUCTS) {
  const page = path.join(dist, 'guides', `${p.id}.html`);
  const visible = ['published', 'coming-soon'].includes(p.status);
  if (!visible && fs.existsSync(page)) errors.push(`/guides/${p.id}: ${p.status} product page was built`);
  if (visible && !fs.existsSync(page)) errors.push(`/guides/${p.id}: page missing`);
  if (visible && fs.existsSync(page)) {
    const s = fs.readFileSync(page, 'utf8');
    const buyable = p.status === 'published' && GUMROAD.test(p.gumroadURL.trim());
    const has = new RegExp(`data-buy[^>]*data-product="${p.id}"|data-product="${p.id}"[^>]*data-buy`).test(s) || s.includes(`href="${p.gumroadURL.trim()}"`) && !!p.gumroadURL.trim();
    if (buyable && !has) errors.push(`/guides/${p.id}: published with a valid link but no Download Now button`);
    if (!buyable && has) errors.push(`/guides/${p.id}: not buyable but shows Download Now`);
    if (!buyable && !/Coming soon/.test(s)) errors.push(`/guides/${p.id}: not buyable but no "Coming soon" label`);
    if (buyable && !/"@type":"Product"/.test(s)) errors.push(`/guides/${p.id}: missing Product structured data`);
    if (!buyable && /"@type":"Product"/.test(s)) errors.push(`/guides/${p.id}: Product/Offer structured data on a product that cannot be bought`);
  }
}

// Sitemap
const sm = fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8');
const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
for (const l of locs) if (!exists(l)) errors.push(`sitemap lists ${l}, which does not exist`);
for (const f of html) {
  const r = routeOf(f) || '/';
  if (r !== '/404' && !locs.includes(r)) warnings.push(`sitemap does not list ${r}`);
}
if (!fs.readFileSync(path.join(dist, 'robots.txt'), 'utf8').includes('Sitemap:')) errors.push('robots.txt has no Sitemap line');

const purchasable = PRODUCTS.filter((p) => p.status === 'published' && GUMROAD.test(p.gumroadURL.trim())).length;
console.log(`Checked ${html.length} pages, ${locs.length} sitemap URLs. Buyable products: ${purchasable}. Download Now links: ${buyLinks}.`);
const uniq = (a) => [...new Set(a)];
if (warnings.length) console.log(`\nWarnings (${uniq(warnings).length}):\n  - ` + uniq(warnings).join('\n  - '));
if (errors.length) {
  console.error(`\nERRORS (${uniq(errors).length}):\n  - ` + uniq(errors).join('\n  - '));
  process.exit(1);
}
console.log('\nAll checks passed.');
