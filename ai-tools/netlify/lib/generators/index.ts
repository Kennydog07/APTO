import type { ToolId } from '../../../shared/tools.ts';
import type { ToolGenerator } from './types.ts';
import { parkingAppealGenerator } from './parking-appeal.ts';
import { bedtimeStoryGenerator } from './bedtime-story.ts';
import { speechWriterGenerator } from './speech-writer.ts';
import { listingWriterGenerator } from './listing-writer.ts';
import { cvTailorGenerator } from './cv-tailor.ts';

/** Registry of built tools. Tools without an entry cannot be purchased. */
export const GENERATORS: Partial<Record<ToolId, ToolGenerator>> = {
  'parking-appeal': parkingAppealGenerator as ToolGenerator,
  'bedtime-story': bedtimeStoryGenerator as ToolGenerator,
  'speech-writer': speechWriterGenerator as ToolGenerator,
  'listing-writer': listingWriterGenerator as ToolGenerator,
  'cv-tailor': cvTailorGenerator as ToolGenerator,
};
