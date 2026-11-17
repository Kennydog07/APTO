// OPTIONAL helper: regenerates social-sharing images (public/og/*.jpg) and app icons.
// Run after adding a city or product:   node scripts/make-images.mjs
// Needs Playwright on your computer:    npm install --no-save playwright && npx playwright install chromium
// The website builds fine without running this; new cities just use the default share image.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import os from 'node:os';
import { DESTINATIONS } from '../src/data/destinations.ts';
import { PRODUCTS } from '../src/data/products.ts';

const root = path.resolve(import.meta.dirname, '..');
const pub = path.join(root, 'public');
const url = (p) => pathToFileURL(path.join(pub, p)).href;
const LABEL = { brunch: 'Brunch guide', 'happy-hours': 'Happy hours guide', 'daily-deals': 'Daily deals guide' };

const css = `
@font-face{font-family:P;src:url(${url('fonts/playfair.woff2')})}
@font-face{font-family:P;font-style:italic;src:url(${url('fonts/playfair-italic.woff2')})}
@font-face{font-family:I;src:url(${url('fonts/inter.woff2')})}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;overflow:hidden;font-family:I;color:#fff}
.og{position:relative;width:1200px;height:630px;padding:56px 64px;display:flex;flex-direction:column;justify-content:space-between;background:var(--deep) center/cover}
.og::before{content:"";position:absolute;inset:0;background:linear-gradient(100deg,color-mix(in srgb,var(--deep) 94%,transparent) 0%,color-mix(in srgb,var(--deep) 70%,transparent) 55%,color-mix(in srgb,var(--deep) 25%,transparent) 100%)}
.og>*{position:relative}
.brand{display:flex;align-items:center;gap:14px;font-family:P;font-size:30px;font-weight:600}
.brand em{color:#f5e6c4;font-weight:500}
.mark{width:54px;height:54px;border-radius:50%;display:grid;place-items:center;font-family:P;font-weight:700;font-size:28px;color:#2a0a14;background:linear-gradient(135deg,#f5e6c4,#dcbb7e 55%,#b48f4c)}
.kick{font-size:22px;letter-spacing:.2em;text-transform:uppercase;color:#f5e6c4;margin-bottom:14px}
h1{font-family:P;font-weight:600;font-size:104px;line-height:1;letter-spacing:-1px}
h1 em{color:#f5e6c4;font-weight:500}
.sub{font-size:28px;color:rgba(255,255,255,.88);margin-top:18px;max-width:820px}
.bar{display:flex;gap:12px}
.pill{border:1.5px solid rgba(255,255,255,.4);border-radius:99px;padding:10px 20px;font-size:21px;background:rgba(0,0,0,.2)}
.pill.g{background:linear-gradient(135deg,#fbf3e2,#dcbb7e);color:#2a0a14;border:0;font-weight:700}
`;

const page = ({ deep, img, kicker, title, sub, pills }) => `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>
<div class="og" style="--deep:${deep};${img ? `background-image:url(${url(img)})` : ''}">
  <div class="brand"><span class="mark">D</span> Destination <em>: Brunch</em></div>
  <div><p class="kick">${kicker}</p><h1>${title}</h1>${sub ? `<p class="sub">${sub}</p>` : ''}</div>
  <div class="bar">${pills.map((p, i) => `<span class="pill${i === 0 ? ' g' : ''}">${p}</span>`).join('')}</div>
</div></body></html>`;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1200, height: 630 } });
const tab = await ctx.newPage();
// Pages are loaded from a temporary file so they can use the local fonts and photos.
const tmp = path.join(os.tmpdir(), 'db-og.html');
const load = async (html) => { fs.writeFileSync(tmp, html); await tab.goto(pathToFileURL(tmp).href, { waitUntil: 'load' }); };
const shoot = async (html, out) => {
  await load(html);
  await tab.evaluate(() => document.fonts.ready);
  await tab.screenshot({ path: path.join(pub, out), type: 'jpeg', quality: 84 });
  console.log('wrote public/' + out);
};
fs.mkdirSync(path.join(pub, 'og'), { recursive: true });

const live = DESTINATIONS.filter((d) => ['published', 'coming-soon'].includes(d.status));
await shoot(page({ deep: '#2a0a14', img: 'images/destinations/dubai-1600.webp', kicker: 'City guides', title: 'Find the <em>brunch.</em><br>Find the deals.', sub: 'Brunch, happy hour and dining deals guides for cities worldwide.', pills: ['Browse guides', ...live.slice(0, 4).map((d) => d.city)] }), 'og/default.jpg');

for (const d of live) {
  const prods = PRODUCTS.filter((p) => p.destination === d.slug && ['published', 'coming-soon'].includes(p.status));
  const img = d.image ? `images/destinations/${d.slug}-1600.webp` : null;
  const kinds = [...new Set(prods.map((p) => LABEL[p.category].replace(' guide', '').toLowerCase()))];
  await shoot(page({ deep: d.theme.deep, img, kicker: `${d.country}`, title: `${d.city}`, sub: `${kinds.join(' & ').replace(/^./, (c) => c.toUpperCase())} ${prods.length > 1 ? 'guides' : 'guide'}. ${d.tagline}`, pills: [d.status === 'coming-soon' ? 'Coming soon' : 'City guide', ...d.areas.slice(0, 3)] }), `og/${d.slug}.jpg`);
  for (const p of prods) {
    await shoot(page({ deep: d.theme.deep, img, kicker: `${d.city} · ${LABEL[p.category]}`, title: p.title.startsWith('Destination : Brunch') ? `${d.city} <em>${LABEL[p.category].replace(' guide', '').toLowerCase()}</em>` : p.title, sub: p.shortDescription, pills: [p.status === 'coming-soon' ? 'Coming soon' : 'Download now', ...p.highlights.slice(0, 2)] }), `og/${p.id}.jpg`);
  }
}

// App icons
const icon = (size) => `<!doctype html><html><head><style>${css}body{width:${size}px;height:${size}px;background:#2a0a14;display:grid;place-items:center}.mark{width:${size * 0.8}px;height:${size * 0.8}px;font-size:${size * 0.46}px}</style></head><body><span class="mark">D</span></body></html>`;
for (const [size, out] of [[32, 'favicon-32.png'], [180, 'apple-touch-icon.png'], [192, 'icon-192.png'], [512, 'icon-512.png']]) {
  await tab.setViewportSize({ width: size, height: size });
  await load(icon(size));
  await tab.evaluate(() => document.fonts.ready);
  await tab.screenshot({ path: path.join(pub, out) });
  console.log('wrote public/' + out);
}
await browser.close();
