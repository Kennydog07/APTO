import type { ToolId } from '../../../shared/tools.ts';
import type { ToolGenerator } from './types.ts';
import { parkingAppealGenerator } from './parking-appeal.ts';

/** Registry of built tools. Tools without an entry cannot be purchased. */
export const GENERATORS: Partial<Record<ToolId, ToolGenerator>> = {
  'parking-appeal': parkingAppealGenerator as ToolGenerator,
};
