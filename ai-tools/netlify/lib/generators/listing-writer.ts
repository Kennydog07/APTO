import {
  listingJobInputsSchema,
  listingPurchaseSchema,
  PLATFORMS,
  type ListingJobInputs,
} from '../../../shared/schemas/listing-writer.ts';
import { listingWriterPrompt, type ListingOutput } from '../../../prompts/listing-writer.ts';
import type { ToolGenerator } from './types.ts';

/** Shape shown in the listing writer (see src/tools/listing-writer/Result.tsx). */
export interface ListingDisplay {
  platform: string;
  title: string;
  description: string;
  category: string;
  itemSpecifics: { name: string; value: string }[];
  condition: string;
  keywords: string[];
  checks: string[];
}

export function toListingDisplay(
  inputs: Pick<ListingJobInputs, 'platform'>,
  o: ListingOutput,
): ListingDisplay {
  return {
    platform: PLATFORMS[inputs.platform],
    title: o.title,
    description: o.description,
    category: o.category,
    itemSpecifics: o.item_specifics,
    condition: o.condition,
    keywords: o.keywords,
    checks: o.checks.map((c) => (/^check:/i.test(c) ? c : `check: ${c}`)),
  };
}

export const listingWriterGenerator: ToolGenerator<ListingJobInputs, ListingOutput> = {
  inputSchema: listingJobInputsSchema as never,
  purchaseSchema: listingPurchaseSchema,
  prompt: listingWriterPrompt,
  async build(inputs, output) {
    // Text only: shown on screen with copy buttons, no files to download.
    return { display: toListingDisplay(inputs, output), files: [] };
  },
};
