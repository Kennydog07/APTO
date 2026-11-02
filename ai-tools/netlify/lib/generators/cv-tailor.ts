import { cvTailorSchema, type CvTailorInputs } from '../../../shared/schemas/cv-tailor.ts';
import { cvTailorPrompt, type CvOutput } from '../../../prompts/cv-tailor.ts';
import { buildCoverLetter, cvToDocx, cvToPdf, cvToText } from '../docs/cv.ts';
import { letterToText } from '../docs/letter.ts';
import { letterToPdf } from '../docs/pdf.ts';
import { letterToDocx } from '../docs/docx.ts';
import type { ToolGenerator } from './types.ts';

/** Shape shown on the done page (see src/tools/cv-tailor/Result.tsx). */
export interface CvDisplay {
  cvText: string;
  coverLetterText: string;
  changes: string[];
}

const DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export const cvTailorGenerator: ToolGenerator<CvTailorInputs, CvOutput> = {
  inputSchema: cvTailorSchema as never,
  prompt: cvTailorPrompt,
  async build(_inputs, output) {
    const letter = buildCoverLetter(output);
    const title = `${output.cv.full_name} – cover letter`;
    const [cvPdf, cvDocx, clPdf, clDocx] = await Promise.all([
      cvToPdf(output.cv),
      cvToDocx(output.cv),
      letterToPdf(letter, title),
      letterToDocx(letter, title),
    ]);
    const display: CvDisplay = {
      cvText: cvToText(output.cv),
      coverLetterText: letterToText(letter),
      changes: output.changes_made,
    };
    return {
      display,
      files: [
        {
          filename: 'tailored-cv.pdf',
          label: 'CV (PDF)',
          contentType: 'application/pdf',
          bytes: cvPdf,
        },
        { filename: 'tailored-cv.docx', label: 'CV (Word)', contentType: DOCX, bytes: cvDocx },
        {
          filename: 'cover-letter.pdf',
          label: 'Cover letter (PDF)',
          contentType: 'application/pdf',
          bytes: clPdf,
        },
        {
          filename: 'cover-letter.docx',
          label: 'Cover letter (Word)',
          contentType: DOCX,
          bytes: clDocx,
        },
      ],
    };
  },
};
