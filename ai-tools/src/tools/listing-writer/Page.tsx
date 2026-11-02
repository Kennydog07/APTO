import { TOOLS } from '../../../shared/tools';
import { withBase } from '../../../shared/paths';
import { ToolLanding } from '../../components/ToolLanding';
import { LISTING_FAQS } from './content';
import { ListingWriterApp } from './App';
import { ListingResult, type ListingDisplay } from './Result';
import sample from '../../samples/listing-writer.json';

const tool = TOOLS['listing-writer'];

function Mascot() {
  const src = (w: number, ext: string) => withBase(`/img/mascot-listing-${w}.${ext}`);
  return (
    <picture>
      <source type="image/webp" srcSet={`${src(600, 'webp')} 600w, ${src(1024, 'webp')} 1024w`} sizes="(max-width: 768px) 100vw, 720px" />
      <img
        src={src(1024, 'jpg')}
        srcSet={`${src(600, 'jpg')} 600w, ${src(1024, 'jpg')} 1024w`}
        sizes="(max-width: 768px) 100vw, 720px"
        width={1024}
        height={768}
        alt="APTO mascot photographing clothes to sell online"
        className="mt-5 h-auto w-full rounded-2xl border border-stone-200 shadow-sm"
        fetchPriority="high"
      />
    </picture>
  );
}

export function ListingWriterPage() {
  return (
    <ToolLanding
      tool={tool}
      hero={<Mascot />}
      h1="eBay & Vinted listing writer from photos"
      priceNote={`for ${tool.credits} listings · no account`}
      form={<ListingWriterApp />}
      sampleIntro="A sample eBay listing from photos of a coat. Every field has a one-tap copy button."
      sample={<ListingResult r={sample as ListingDisplay} sample />}
      faqs={LISTING_FAQS}
    />
  );
}
