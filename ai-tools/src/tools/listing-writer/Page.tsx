import { TOOLS } from '../../../shared/tools';
import { ToolLanding } from '../../components/ToolLanding';
import { LISTING_FAQS } from './content';
import { ListingWriterApp } from './App';
import { ListingResult, type ListingDisplay } from './Result';
import sample from '../../samples/listing-writer.json';

const tool = TOOLS['listing-writer'];

export function ListingWriterPage() {
  return (
    <ToolLanding
      tool={tool}
      h1="eBay & Vinted listing writer from photos"
      priceNote={`for ${tool.credits} listings · no account`}
      form={<ListingWriterApp />}
      sampleIntro="A sample eBay listing from photos of a coat. Every field has a one-tap copy button."
      sample={<ListingResult r={sample as ListingDisplay} sample />}
      faqs={LISTING_FAQS}
    />
  );
}
