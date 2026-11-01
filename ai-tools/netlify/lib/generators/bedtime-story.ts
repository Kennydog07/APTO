import {
  bedtimeStorySchema,
  type BedtimeStoryInputs,
} from '../../../shared/schemas/bedtime-story.ts';
import { bedtimeStoryPrompt, type BedtimeStoryOutput } from '../../../prompts/bedtime-story.ts';
import { storyToPdf } from '../docs/story-pdf.ts';
import type { ToolGenerator } from './types.ts';

/** Shape shown on the done page (see src/tools/bedtime-story/Result.tsx). */
export interface BedtimeStoryDisplay {
  childName: string;
  title: string;
  pages: string[];
}

export const bedtimeStoryGenerator: ToolGenerator<BedtimeStoryInputs, BedtimeStoryOutput> = {
  inputSchema: bedtimeStorySchema as never,
  prompt: bedtimeStoryPrompt,
  async build(inputs, output) {
    const pdf = await storyToPdf({
      childName: inputs.childName,
      title: output.title,
      pages: output.pages,
      ageBand: inputs.ageBand,
    });
    const display: BedtimeStoryDisplay = {
      childName: inputs.childName,
      title: output.title,
      pages: output.pages,
    };
    return {
      display,
      // File name deliberately does not contain the child's name.
      files: [
        {
          filename: 'bedtime-story.pdf',
          label: 'Download PDF',
          contentType: 'application/pdf',
          bytes: pdf,
        },
      ],
    };
  },
};
