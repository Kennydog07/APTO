# Destination : Brunch

*Discover the destination. Find the deals. Enjoy more.*

This is the storefront website for your city brunch, happy hour and daily deals guides. Visitors choose a city, read what each guide includes, click **Download Now**, and buy on **Gumroad**. Gumroad handles payment and delivery.

The website is built with [Astro](https://astro.build), a fast static-site tool. Every page is plain HTML, so Google can read it without running JavaScript. Hosting on Netlify's free tier is enough.

---

## The short version

All your products, prices and cities are in **four files** inside `src/data/`:

| File | What it controls |
|---|---|
| `pricing.ts` | The prices: **Brunch $4.99** and **Happy Hours / Daily Deals $2.49** |
| `destinations.ts` | Cities: name, country, region, photo, intro text, colours |
| `products.ts` | Guides: title, description, features, screenshots, **Gumroad link**, **status** |
| `site.ts` | Contact email, business details, social links, analytics |

You never need to touch the page layouts. Edit these files, save, commit and push, and Netlify rebuilds the site in about a minute.

> **Safety net:** if you make a mistake, such as a wrong Gumroad link, a missing photo or a typo in a status, the build **stops with a plain-English message** saying what to fix. Broken changes never reach customers; the live site just stays as it was.

---

## How to edit files without installing anything

1. Open your repository on **github.com**.
2. Go to the file, for example `destination-brunch/src/data/products.ts`.
3. Click the **pencil icon** (Edit).
4. Make your change.
5. Click **Commit changes**.
6. Netlify rebuilds automatically. Check the **Deploys** tab in Netlify: a green "Published" means it worked; a red "Failed" shows the message telling you what to fix.

---

## 1. Insert a Gumroad link and start selling a guide

This is the most important task. A **Download Now** button appears only when **both** of these are true:

- the product has a real Gumroad **product** link, **and**
- its `status` is `'published'`.

Until then, the guide shows a clear **Coming soon** label and cannot be bought.

**Steps**

1. In Gumroad, create the product (for example "Destination : Brunch — Dubai").
2. Set the Gumroad price to **exactly** the price on the website (`pricing.ts`): $4.99 for brunch, $2.49 for happy hours / daily deals.
3. In Gumroad, copy the product's **share link**. It looks like
   `https://yourname.gumroad.com/l/dubai-brunch`
   ⚠️ Use the link to the **individual product**, not your general Gumroad profile page.
4. Open `src/data/products.ts` and find the product (search for `id: 'dubai-brunch'`).
5. Paste the link between the quotes and change the status:

   ```ts
   status: 'published',
   gumroadURL: 'https://yourname.gumroad.com/l/dubai-brunch',
   ```

6. Commit. After the rebuild, the Dubai guide shows **Download Now**, which opens that exact Gumroad page.

The build refuses links that are not Gumroad product links, storefront links, and the same link used on two products, so a customer can never be sent to the wrong product.

---

## 2. Publish, hide or "coming soon" a guide or city

Every city (`destinations.ts`) and product (`products.ts`) has a `status`:

| status | What happens |
|---|---|
| `'published'` | Listed on the site. Buyable once a Gumroad link is set. |
| `'coming-soon'` | Listed with a **Coming soon** label. No buy button. |
| `'draft'` | Not on the live site. Visible only when you preview on your own computer (`npm run dev`). |
| `'hidden'` | Never shown anywhere. |

A city only appears when it has at least one guide that is published or coming soon. Product pages and the sitemap update automatically.

---

## 3. Change a price

Open `src/data/pricing.ts`:

```ts
export const PRICES = {
  brunch: 4.99,
  deals: 2.49,
};
```

Change the number and commit. Every card, product page, "From $x" label, FAQ answer and Google product data updates. **Then update the matching prices on Gumroad**, so the website and checkout always agree.

To give **one** guide a different price, add `priceUSD` to that product in `products.ts`:

```ts
priceUSD: 3.99,
```

---

## 4. Add a brunch app

1. Open `src/data/products.ts`.
2. Copy a whole product block, from `{` to `},`. The Dubai one is a good template.
3. Paste it before the line `/* ---- Example of a future product`.
4. Change:
   - `id`: lowercase with dashes, e.g. `'edinburgh-brunch'`. This becomes the web address `/guides/edinburgh-brunch`.
   - `destination`: the city's `slug` from `destinations.ts`, e.g. `'edinburgh'`.
   - `title`, `shortDescription`, `description`.
   - `highlights`: exactly **three** short benefits for the product card.
   - `features`: only list things the app **really does**. `BRUNCH_CORE` is the shared list for the standard brunch app; add `DRINKS` only where alcohol is legal, and `ARABIC` only if the app has an Arabic version.
   - `screenshots` (see section 7).
   - `status: 'coming-soon'` and `gumroadURL: ''` until it is on Gumroad.
   - `lastUpdated`: the month you last checked the information, e.g. `'2026-12'`, or `''` if not checked.
   - `seoTitle` and `seoDescription`: what Google shows. Keep the description under about 155 characters and don't include prices (they are added automatically).
5. If the city is new, add it first (section 6).

## 5. Add a happy hours or daily deals app

Same as section 4, but set `category` to:

- `'happy-hours'`: happy hours and drinks offers. **Never use this for places where alcohol promotions are not allowed**, such as Saudi Arabia.
- `'daily-deals'`: business lunches, restaurant specials, family deals and other food offers.

The price ($2.49) is applied automatically. `Daily Deals Riyadh` and `Happy Hour Dubai` are ready-made examples; the `hhFeatures(...)` and `dealShots(...)` shortcuts fill in the standard happy hour app features and screenshots.

For an app that is **both** a brunch and a happy hour guide (like *Brunch & Happy Hour Paris*), use `category: 'happy-hours'` and add `alsoIn: ['brunch'],` so it also shows under the Brunch filter. It is priced as a happy hour guide unless you add `priceUSD`.

---

## 6. Add a city

1. Open `src/data/destinations.ts`.
2. Copy a whole city block and paste it at the end of the list (before the final `];`).
3. Change every value:
   - `slug`: lowercase with dashes, e.g. `'edinburgh'`. This becomes `/destinations/edinburgh`.
   - `city`, `country`.
   - `region`: one of `'Middle East'`, `'Europe'`, `'Asia'`, `'North America'`. To add a new region, also add it to the `Region` line near the top of the file.
   - `tagline`, `areas`, `brunchDays`, `intro` (1–3 genuine paragraphs; avoid thin copy-paste text).
   - `featured: true` to show it on the homepage.
   - `alcoholFree: true` where venues don't serve alcohol.
   - `theme`: four colours. Copy them from that city app's `styles.css` (`--maroon`, `--maroon-deep`, `--gold`, `--on-gold`).
   - `seoTitle`, `seoDescription`.
4. Add the photo (below), or set `image: null` to use a coloured cover until you have one.

**City photo**

- Use only photos you may use commercially: your own, CC0, CC BY (with credit) or paid stock. The existing photos are the same Wikimedia Commons photos your city apps use, credited on `/credits`.
- Save two sizes in `public/images/destinations/`:
  `edinburgh-1600.webp` (1600px wide) and `edinburgh-800.webp` (800px wide).
  Free converters such as [squoosh.app](https://squoosh.app) can resize and save as WebP.
- Fill in `image.alt` (a description of the photo) and the `credit` details.

---

## 7. Add screenshots

1. On your phone, open the city app and take 2–3 screenshots: the home screen, a venue card and the category picker work well.
2. Name them after the product, e.g. `edinburgh-brunch-1.webp`, `-2`, `-3` (PNG or JPG is fine too).
3. Upload them to `public/images/screens/` (on GitHub: open the folder, then **Add file → Upload files**).
4. In `products.ts`, the `shots('edinburgh-brunch', 'Edinburgh')` shortcut points at `-1.webp`, `-2.webp` and `-3.webp` automatically. For other names, list them yourself:

   ```ts
   screenshots: [
     { src: '/images/screens/edinburgh-brunch-1.png', alt: 'Edinburgh brunch guide home screen' },
   ],
   ```

If a screenshot file is missing, the build tells you which one.

---

## 8. Reviews

The reviews section stays hidden until you add **genuine** customer reviews to `src/data/reviews.ts` (instructions are in the file). Never invent or alter reviews.

---

## 9. Marketing links and analytics (for Grokbot and social posts)

**Links for social posts.** Add UTM tags so you can see which posts bring visitors:

```
https://YOUR-SITE/destinations/dubai?utm_source=pinterest&utm_medium=social&utm_campaign=dubai_brunch_launch
https://YOUR-SITE/guides/dubai-brunch?utm_source=facebook&utm_medium=social&utm_campaign=weekend_post
```

Use `utm_source` = facebook, instagram, pinterest, tiktok, x, threads, youtube, google…

The site remembers those tags while the visitor browses and **adds them to the Gumroad link** when they click Download Now, so Gumroad's own analytics can attribute sales to the campaign.

**Analytics (optional, privacy-friendly, no cookie banner needed).** In `src/data/site.ts`:

- **Plausible** (paid, simple): set `provider: 'plausible'` and `plausibleDomain: 'yourdomain.com'`.
- **Umami Cloud** (free tier): set `provider: 'umami'` and `umamiWebsiteId: '…'`.

Events recorded: **Destination View**, **Product View** and **Download Click** (with product, city, price and campaign). In Plausible, add these names under *Site settings → Goals*.

> A **Download Click** is someone going to Gumroad. **It is not a sale.** Real sales are in your Gumroad dashboard. If you later want sales on the same dashboard, Gumroad offers a "Ping" (webhook) for each sale; that would need a small Netlify Function and is not built yet.

---

## 10. Before you launch (checklist)

- [ ] Fill in `src/data/site.ts`: `contactEmail`, `legalName`, `businessAddress` (if required), `governingLaw`, `refundPolicy`, then `legalLastReviewed`. Yellow "To complete before launch" boxes on the legal pages disappear as you fill these in.
- [ ] Have the Privacy, Terms and Refunds pages checked for the countries you sell to (for example UK/EU consumer and digital-content rules, and VAT, which Gumroad collects as merchant of record in many countries).
- [ ] Create each Gumroad product, at the same price as the website.
- [ ] Decide how buyers get access on Gumroad (for example, a link in the Gumroad "content" section). ⚠️ The city apps are currently public at their `*.netlify.app` addresses, so anyone with the address can use them without paying. Consider password-protecting them or moving them behind the Gumroad delivery.
- [ ] Paste the Gumroad links and set `status: 'published'`.
- [ ] Add your social profile links in `site.ts`.
- [ ] Set your own domain (section 12) and submit `https://YOUR-SITE/sitemap.xml` in Google Search Console.

---

## 11. Deploy to Netlify (first time)

This creates a **new** Netlify site. It does not change any existing site.

1. Log in to [app.netlify.com](https://app.netlify.com).
2. **Add new project → Import an existing project → GitHub**, then pick this repository.
3. Set:
   - **Branch to deploy:** the branch that contains this folder (e.g. `main` once merged).
   - **Base directory:** `destination-brunch`
   - **Build command:** `npm run build` (already set in `netlify.toml`)
   - **Publish directory:** `destination-brunch/dist` (already set in `netlify.toml`)
4. Click **Deploy**. Your site appears at `something.netlify.app`. Rename it under *Project configuration → Change project name*, e.g. `destination-brunch`.

Every later commit to that branch redeploys automatically.

## 12. Use your own domain

In Netlify: **Domain management → Add a domain**, then follow the DNS steps. Then add an environment variable **`SITE_URL`** = `https://yourdomain.com` (*Project configuration → Environment variables*) and redeploy, so canonical links, the sitemap and share images use your domain.

---

## For developers

```bash
cd destination-brunch
npm install
npm run dev       # preview at http://localhost:4321 (drafts are visible here)
npm run build     # production build into dist/
npm test          # build + automatic checks (SEO tags, links, Gumroad button rules, sitemap)
npm run images    # optional: regenerate share images & icons (needs Playwright installed)
```

Requires Node.js 22.23.4 or newer.

```
destination-brunch/
├── src/
│   ├── data/          ← the files you edit (catalogue, prices, settings, FAQs, reviews)
│   ├── lib/           ← catalogue rules (visibility, "can it be bought?") and SEO data
│   ├── components/    ← header, footer, cards, Download Now button, filters, FAQ…
│   ├── layouts/       ← page template with SEO / social tags
│   ├── pages/         ← home, destinations, guides, legal pages, sitemap, robots.txt
│   ├── scripts/       ← small browser scripts: menu, filters, tracking
│   └── styles/        ← one stylesheet, using the same design system as the city apps
├── public/            ← photos, screenshots, fonts, icons, share images
├── scripts/           ← check-site.mjs (tests), make-images.mjs (share images)
└── netlify.toml
```

**The purchase rule** lives in one place: `canBuy()` in `src/lib/catalog.ts` (status `published` + a valid Gumroad product link). `BuyButton.astro` is the only component that renders a purchase link. Product/Offer structured data is only added for buyable products.
