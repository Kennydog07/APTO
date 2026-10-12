// Serves the rendered preview and checks it in Chromium at mobile and desktop
// sizes. Writes screenshots and a JSON results file to out/.
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'out');
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml' };
const server = createServer((req, res) => {
  const p = path.join(OUT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(OUT) || !existsSync(p)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': types[path.extname(p)] ?? 'application/octet-stream' });
  res.end(readFileSync(p));
});
await new Promise((r) => server.listen(0, r));
const base = `http://127.0.0.1:${server.address().port}`;

const exe = ['/opt/pw-browsers/chromium/chrome-linux/chrome', '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(existsSync);
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const results = [];
const check = (name, pass, detail = '') => { results.push({ name, pass, detail }); console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`); };

const pages = ['index', 'product', 'collection', 'cart', 'contact', 'faq', 'about', '404'];
const viewports = { mobile: { width: 390, height: 844 }, desktop: { width: 1366, height: 900 } };

for (const [vpName, vp] of Object.entries(viewports)) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1 });
  for (const p of pages) {
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error' && !/404|Failed to load resource/.test(m.text())) errors.push(m.text()); });
    await page.route('**/recommendations/**', (r) => r.fulfill({ status: 200, body: '' }));
    await page.goto(`${base}/${p}.html`, { waitUntil: 'networkidle' });
    const m = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      h1: document.querySelectorAll('h1').length,
      imgsNoAlt: [...document.querySelectorAll('img')].filter((i) => !i.hasAttribute('alt')).length,
      unlabelled: [...document.querySelectorAll('input:not([type=hidden]):not([type=radio]), select, textarea')].filter((el) => !(el.id && document.querySelector(`label[for="${el.id}"]`)) && !el.getAttribute('aria-label')).length,
      smallTargets: [...document.querySelectorAll('button, .button, .icon-button')].filter((b) => { const r = b.getBoundingClientRect(); return r.width > 0 && (r.height < 40 || r.width < 40); }).length,
    }));
    check(`${vpName}/${p}: no horizontal scroll`, m.overflow <= 0, `overflow ${m.overflow}px`);
    check(`${vpName}/${p}: exactly one h1`, m.h1 === 1, `h1 count ${m.h1}`);
    check(`${vpName}/${p}: all images have alt`, m.imgsNoAlt === 0);
    check(`${vpName}/${p}: all form fields labelled`, m.unlabelled === 0, `${m.unlabelled} unlabelled`);
    check(`${vpName}/${p}: tap targets >= 40px`, m.smallTargets === 0, `${m.smallTargets} small`);
    check(`${vpName}/${p}: no JavaScript errors`, errors.length === 0, errors.join(' | '));
    await page.screenshot({ path: path.join(OUT, `${p}-${vpName}.png`), fullPage: true });
    await page.close();
  }

  // Interactions on the product page
  const page = await ctx.newPage();
  await page.route('**/cart/add.js', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"items":[{"id":1002,"quantity":1}]}' }));
  await page.route('**/cart.js', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"item_count":1}' }));
  await page.goto(`${base}/product.html`, { waitUntil: 'networkidle' });
  await page.click('label:has-text("Grey")');
  const after = await page.evaluate(() => ({ id: document.querySelector('[data-variant-id]').value, stock: document.querySelector('[data-stock]').textContent.trim(), url: location.search }));
  check(`${vpName}/product: variant switch updates id, stock and URL`, after.id === '1002' && /Only 2 left/.test(after.stock) && after.url.includes('variant=1002'), JSON.stringify(after));
  await page.click('[data-add-button]');
  await page.waitForSelector('[data-added]:not([hidden])', { timeout: 3000 }).catch(() => {});
  const added = await page.evaluate(() => ({ msg: !document.querySelector('[data-added]').hidden, count: document.querySelector('[data-cart-count]').textContent }));
  check(`${vpName}/product: add to basket shows confirmation and updates count`, added.msg && added.count === '1', JSON.stringify(added));
  const ld = await page.evaluate(() => [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => { try { return JSON.parse(s.textContent)['@type']; } catch { return 'INVALID'; } }));
  check(`${vpName}/product: Product structured data is valid JSON-LD`, ld.includes('Product') && !ld.includes('INVALID'), ld.join(','));
  if (vpName === 'mobile') {
    await page.click('[data-menu-toggle]');
    const open = await page.evaluate(() => !document.getElementById('MobileMenu').hidden);
    check('mobile: menu toggle opens navigation', open);
    await page.keyboard.press('Escape');
    check('mobile: Escape closes navigation', await page.evaluate(() => document.getElementById('MobileMenu').hidden));
  }
  await page.close();
  await ctx.close();
}

await browser.close();
server.close();
writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(results, null, 2));
const failed = results.filter((r) => !r.pass).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
