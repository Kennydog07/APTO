import { TOOLS } from '../../../shared/tools';
import { Faq, PriceBadge } from '../../components/ui';
import { Seo, faqJsonLd } from '../../lib/seo';
import { PARKING_FAQS } from './content';
import { ParkingAppealForm } from './Form';
import { ParkingAppealResult, type ParkingAppealDisplay } from './Result';
import sample from '../../samples/parking-appeal.json';

const tool = TOOLS['parking-appeal'];

export function ParkingAppealPage() {
  return (
    <>
      <Seo
        title={tool.metaTitle}
        description={tool.metaDescription}
        path={tool.route}
        ogImage="/og/parking-appeal.png"
        jsonLd={[
          faqJsonLd(PARKING_FAQS),
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
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Parking ticket appeal letter writer
        </h1>
        <p className="mt-2 text-lg text-stone-700">{tool.tagline}</p>
        <div className="mt-3">
          <PriceBadge pence={tool.pricePence} />
        </div>
      </section>
      <section aria-label="Write your appeal" className="mx-auto max-w-3xl px-4">
        <ParkingAppealForm />
      </section>
      <section aria-labelledby="sample-h" className="mx-auto max-w-3xl px-4 pt-12">
        <h2 id="sample-h" className="text-2xl font-bold">
          What you’ll get
        </h2>
        <p className="mb-4 mt-1 text-stone-700">
          A sample using made-up details. Yours is written from your facts only, as PDF + Word.
        </p>
        <ParkingAppealResult r={sample as ParkingAppealDisplay} sample />
      </section>
      <Faq items={PARKING_FAQS} />
    </>
  );
}
