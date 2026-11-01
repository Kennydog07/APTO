import type { ReactNode } from 'react';
import { BRAND } from '../config/brand';
import { LIVE_TOOLS } from '../../shared/tools';
import { Link } from '../lib/router';
import { withBase } from '../../shared/paths';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-stone-50 text-stone-900">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
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
            {LIVE_TOOLS.map((t) => (
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
              {LIVE_TOOLS.map((t) => (
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
