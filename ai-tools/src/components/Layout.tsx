import type { ReactNode } from 'react';
import { BRAND } from '../config/brand';
import { TOOLS, isInSeason } from '../../shared/tools';
import { useNavTools, useToday } from '../lib/season';
import { Link } from '../lib/router';
import { withBase } from '../../shared/paths';

const MINI_APPS: { href: string; name: string; price: string; seasonal?: 'santa-letter' }[] = [
  { href: '/flip-finder/', name: '🔎 Flip Finder', price: '£3.99' },
  { href: '/ai/parking-appeal/', name: '🅿️ Parking Ticket Appeal', price: '£3.99' },
  { href: '/ai/bedtime-story/', name: '🌙 Bedtime Story', price: '£2.99' },
  { href: '/ai/speech-writer/', name: '🎤 Speech Writer', price: '£4.99' },
  { href: '/ai/listing-writer/', name: '🏷️ eBay & Vinted Listings', price: '£1.99 / 10' },
  { href: '/ai/cv-tailor/', name: '📄 CV & Cover Letter', price: '£4.99' },
  {
    href: '/ai/santa-letter/',
    name: '🎅 Letter from Santa',
    price: '£1.99',
    seasonal: 'santa-letter' as const,
  },
  { href: '/ai/flight-delay-claim/', name: '✈️ Flight Delay Claim', price: '£3.99' },
];

/** Main APTO site bar, so every /ai/ page has a way back to apto-pro.com (matches the main site's nav). */
function AptoBar() {
  // Seasonal items (Santa) are shown in the first render and hidden after mount out of season.
  const today = useToday();
  const apps = MINI_APPS.filter(
    (m) => !m.seasonal || !today || isInSeason(TOOLS[m.seasonal], today),
  );
  const a = 'rounded px-2 py-1 text-[#cfd8e3] hover:bg-white/10 hover:text-white';
  return (
    <div className="relative z-40 bg-[#0d1f35] text-[13px] font-semibold">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-2 gap-y-1 px-4 py-1.5">
        <a href="/" className="mr-1 font-black text-white">
          APTO <span className="text-[#eb6e14]">TOOLS</span>
        </a>
        <a href="/" className={a}>
          ← Home
        </a>
        <a href="/money" className={a}>
          Money &amp; AI
        </a>
        <a href="/pro/" className={a}>
          APTO Pro
        </a>
        <details className="relative">
          <summary className={`${a} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}>
            Mini Apps ▾
          </summary>
          <div className="absolute left-0 top-full z-50 mt-1 w-[270px] max-w-[calc(100vw-2rem)] rounded-xl border border-stone-200 bg-white p-1 shadow-xl">
            {apps.map((m) => (
              <a
                key={m.href}
                href={m.href}
                className="flex justify-between gap-3 rounded-lg px-3 py-2 text-stone-900 hover:bg-orange-50"
              >
                <span>{m.name}</span>
                <b className="whitespace-nowrap text-[#eb6e14]">{m.price}</b>
              </a>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const tools = useNavTools();
  return (
    <div className="flex min-h-screen flex-col bg-stone-50 text-stone-900">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <AptoBar />
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-bold text-stone-900">
            <img
              src={withBase(BRAND.logo)}
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 rounded"
            />
            <span>{BRAND.name}</span>
          </Link>
          <nav aria-label="Main" className="hidden gap-4 text-sm sm:flex">
            {tools.map((t) => (
              <Link
                key={t.id}
                href={t.route}
                className="text-stone-700 hover:text-blue-700 hover:underline"
              >
                {t.shortName}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main id="main" className="flex-1">
        {children}
      </main>
      <footer className="border-t border-stone-200 bg-white text-sm text-stone-600">
        <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 sm:grid-cols-3">
          <div>
            <p className="font-semibold text-stone-800">{BRAND.name}</p>
            <p className="mt-1">{BRAND.tagline}</p>
          </div>
          <nav aria-label="Tools">
            <p className="font-semibold text-stone-800">Tools</p>
            <ul className="mt-1 space-y-1">
              {tools.map((t) => (
                <li key={t.id}>
                  <Link href={t.route} className="hover:underline">
                    {t.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/blog" className="hover:underline">
                  Blog
                </Link>
              </li>
            </ul>
          </nav>
          <nav aria-label="Legal">
            <p className="font-semibold text-stone-800">Help &amp; legal</p>
            <ul className="mt-1 space-y-1">
              <li>
                <Link href="/terms" className="hover:underline">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:underline">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/refunds" className="hover:underline">
                  Refund policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:underline">
                  Contact
                </Link>
              </li>
              <li>
                <a href="/" className="font-semibold text-stone-800 hover:underline">
                  ← Back to APTO home
                </a>
              </li>
            </ul>
          </nav>
        </div>
        <p className="mx-auto max-w-5xl px-4 pb-6 text-xs">
          © {BRAND.legalName}. Secure payments by Stripe. No account needed. No tracking cookies.
        </p>
      </footer>
    </div>
  );
}
