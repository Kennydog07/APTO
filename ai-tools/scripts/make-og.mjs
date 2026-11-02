/**
 * One-off helper: render 1200x630 Open Graph PNGs into public/og/ using Playwright's Chromium.
 * Run after changing tool names/taglines:  node scripts/make-og.mjs
 * (Playwright is not a project dependency; this uses a globally available install.)
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Keep in sync with shared/tools.ts + src/config/brand.ts
const BRAND = 'APTO Quick Tools';
const cards = [
  { file: 'default', title: 'Small AI tools.<br>Pay once. No account.', price: '' },
  { file: 'parking-appeal', title: 'Parking ticket<br>appeal letter', price: '£3.99' },
  { file: 'bedtime-story', title: 'Personalised<br>bedtime story', price: '£2.99' },
  { file: 'speech-writer', title: 'Wedding, eulogy &amp;<br>leaving speeches', price: '£4.99' },
  { file: 'listing-writer', title: 'eBay &amp; Vinted<br>listing writer', price: '10 for £1.99' },
  { file: 'cv-tailor', title: 'Tailored CV &amp;<br>cover letter', price: '£4.99' },
];

const logo = fs.readFileSync(path.join(root, 'public/logo.jpg')).toString('base64');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
fs.mkdirSync(path.join(root, 'public/og'), { recursive: true });
for (const c of cards) {
  await page.setContent(`<html><body style="margin:0;width:1200px;height:630px;font-family:Arial,Helvetica,sans-serif;background:linear-gradient(135deg,#1e3a8a,#1d4ed8);color:#fff;display:flex;flex-direction:column;justify-content:space-between;padding:70px;box-sizing:border-box">
    <div style="display:flex;align-items:center;gap:20px;font-size:34px;font-weight:bold"><img src="data:image/jpeg;base64,${logo}" style="width:72px;height:72px;border-radius:12px">${BRAND}</div>
    <div style="font-size:84px;font-weight:800;line-height:1.05">${c.title}</div>
    <div style="font-size:36px;display:flex;gap:24px;align-items:center">${c.price ? `<span style="background:#fff;color:#1d4ed8;font-weight:bold;padding:10px 24px;border-radius:999px">${c.price}</span>` : ''}<span>Pay once · No account · Instant download</span></div>
  </body></html>`);
  await page.screenshot({ path: path.join(root, `public/og/${c.file}.png`) });
  console.log('wrote', c.file);
}
await browser.close();
