import type { ToolId } from '../../../shared/tools.ts';
import type { ToolGenerator } from './types.ts';
import { parkingAppealGenerator } from './parking-appeal.ts';
import { bedtimeStoryGenerator } from './bedtime-story.ts';
import { speechWriterGenerator } from './speech-writer.ts';
import { listingWriterGenerator } from './listing-writer.ts';
import { cvTailorGenerator } from './cv-tailor.ts';
import { santaLetterGenerator } from './santa-letter.ts';
import { flightDelayClaimGenerator } from './flight-delay-claim.ts';
import { depositReturnGenerator } from './deposit-return.ts';
import { refundLetterGenerator } from './refund-letter.ts';

/** Registry of built tools. Tools without an entry cannot be purchased. */
export const GENERATORS: Partial<Record<ToolId, ToolGenerator>> = {
  'parking-appeal': parkingAppealGenerator as ToolGenerator,
  'bedtime-story': bedtimeStoryGenerator as ToolGenerator,
  'speech-writer': speechWriterGenerator as ToolGenerator,
  'listing-writer': listingWriterGenerator as ToolGenerator,
  'cv-tailor': cvTailorGenerator as ToolGenerator,
  'santa-letter': santaLetterGenerator as ToolGenerator,
  'flight-delay-claim': flightDelayClaimGenerator as ToolGenerator,
  'deposit-return': depositReturnGenerator as ToolGenerator,
  'refund-letter': refundLetterGenerator as ToolGenerator,
};
