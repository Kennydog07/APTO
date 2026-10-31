/** Shared landing-page layout for every tool: h1, price, form above the fold, sample, FAQs. */
import type { ReactNode } from 'react';
import type { ToolConfig } from '../../shared/tools';
import { Faq, PriceBadge } from './ui';
import { Seo, faqJsonLd } from '../lib/seo';

export function ToolLanding(p: {
  tool: ToolConfig;
  h1: string;
  form: ReactNode;
  sample: ReactNode;
  sampleIntro: string;
  faqs: { q: string; a: string }[];
  priceNote?: string;
}) {
  const { tool } = p;
  return (
    <>
      <Seo
        title={tool.metaTitle}
        description={tool.metaDescription}
        path={tool.route}
        ogImage={`/og/${tool.id}.png`}
        jsonLd={[
          faqJsonLd(p.faqs),
          {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: tool.name,
            description: tool.metaDescription,
            offers: {
              '@type': 'Offer',
              price: (tool.pricePence / 100).toFixed(2),
              priceCurrency: 'GBP',
              availability: 'https://schema.org/InStock',
            },
          },
        ]}
      />
      <section className="mx-auto max-w-3xl px-4 pb-6 pt-6 sm:pt-10">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{p.h1}</h1>
        <p className="mt-2 text-lg text-stone-700">{tool.tagline}</p>
        <div className="mt-3">
          <PriceBadge pence={tool.pricePence} note={p.priceNote} />
        </div>
      </section>
      <section aria-label={p.h1} className="mx-auto max-w-3xl px-4">
        {p.form}
      </section>
      <section aria-labelledby="sample-h" className="mx-auto max-w-3xl px-4 pt-12">
        <h2 id="sample-h" className="text-2xl font-bold">
          What you’ll get
        </h2>
        <p className="mb-4 mt-1 text-stone-700">{p.sampleIntro}</p>
        {p.sample}
      </section>
      <Faq items={p.faqs} />
    </>
  );
}

/** Consent text under every pay button (UK digital content rules). */
export function CheckoutSmallPrint({ what }: { what: string }) {
  return (
    <p className="text-xs text-stone-600">
      Secure payment by Stripe. Your {what} is ready about a minute after payment, with one free
      regeneration. By paying you agree to our{' '}
      <a href="/terms" className="underline">
        terms
      </a>{' '}
      and to your {what} being supplied straight away, so the 14-day cancellation right no longer
      applies (
      <a href="/refunds" className="underline">
        refund policy
      </a>
      ).
    </p>
  );
}

/** Turn zod issues into { field: [messages] } for the form fields. */
export function issuesToFieldErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const errs: Record<string, string[]> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? 'form');
    (errs[key] ??= []).push(issue.message);
  }
  return errs;
}
