import { BRAND } from '../config/brand';
import { LIVE_TOOLS, formatPrice } from '../../shared/tools';
import { Link } from '../lib/router';
import { Seo } from '../lib/seo';

export function HomePage() {
  return (
    <>
      <Seo
        title={`${BRAND.name} – ${BRAND.tagline}`}
        path="/"
        description="Small, useful AI tools for everyday jobs: appeal a parking ticket and more. Pay once, download instantly, no account needed."
      />
      <section className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">{BRAND.tagline}</h1>
        <p className="mt-3 max-w-2xl text-lg text-stone-700">
          Answer a few questions, pay once with Stripe, and download the result. No sign-up, no
          subscription, and your details are deleted after 30 days.
        </p>
      </section>
      <section
        aria-label="Tools"
        className="mx-auto grid max-w-5xl gap-4 px-4 pb-14 sm:grid-cols-2"
      >
        {LIVE_TOOLS.map((t) => (
          <Link
            key={t.id}
            href={t.route}
            className="block rounded-lg border border-stone-200 bg-white p-5 shadow-sm hover:border-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-700/30"
          >
            <h2 className="text-xl font-bold">{t.name}</h2>
            <p className="mt-1 text-stone-700">{t.tagline}</p>
            <p className="mt-3 font-semibold text-blue-800">{formatPrice(t.pricePence)} →</p>
          </Link>
        ))}
      </section>
    </>
  );
}
