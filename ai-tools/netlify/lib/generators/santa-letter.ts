import { santaLetterSchema, type SantaLetterInputs } from '../../../shared/schemas/santa-letter.ts';
import {
  SANTA_SIGNATURE,
  santaLetterPrompt,
  type SantaLetterOutput,
} from '../../../prompts/santa-letter.ts';
import { santaToPdf } from '../docs/santa-pdf.ts';
import { ukDate } from '../docs/letter.ts';
import type { ToolGenerator } from './types.ts';

/** Shape shown on the done page (see src/tools/santa-letter/Result.tsx). */
export interface SantaLetterDisplay {
  childName: string;
  greeting: string;
  paragraphs: string[];
  postscript: string;
  signOff: string;
  signature: string;
}

export const santaLetterGenerator: ToolGenerator<SantaLetterInputs, SantaLetterOutput> = {
  inputSchema: santaLetterSchema as never,
  prompt: santaLetterPrompt,
  async build(inputs, output) {
    const display: SantaLetterDisplay = {
      childName: inputs.childName,
      greeting: `Dear ${inputs.childName},`,
      paragraphs: output.paragraphs,
      postscript: output.postscript ?? '',
      signOff: 'With love from the North Pole,',
      signature: SANTA_SIGNATURE,
    };
    const pdf = await santaToPdf({
      childName: inputs.childName,
      paragraphs: output.paragraphs,
      postscript: output.postscript ?? '',
      signature: SANTA_SIGNATURE,
      dateText: ukDate(),
    });
    return {
      display,
      // File name deliberately does not contain the child's name.
      files: [
        {
          filename: 'letter-from-santa.pdf',
          label: 'Download PDF',
          contentType: 'application/pdf',
          bytes: pdf,
        },
      ],
    };
  },
};
