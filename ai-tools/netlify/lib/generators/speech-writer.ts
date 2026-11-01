import {
  SPEECH_TYPES,
  speechWriterSchema,
  type SpeechWriterInputs,
} from '../../../shared/schemas/speech-writer.ts';
import {
  speechWordCount,
  speechWriterPrompt,
  type SpeechOutput,
} from '../../../prompts/speech-writer.ts';
import { speechToDocx, speechToPdf, type SpeechDoc } from '../docs/speech.ts';
import type { ToolGenerator } from './types.ts';

/** Shape shown on the done page (see src/tools/speech-writer/Result.tsx). */
export interface SpeechDisplay {
  title: string;
  subtitle: string;
  speechText: string;
  cueCards: { heading: string; points: string[] }[];
  wordCount: number;
  estimatedMinutes: number;
}

export function buildSpeechDoc(inputs: SpeechWriterInputs, output: SpeechOutput): SpeechDoc {
  const words = speechWordCount(output.speech_paragraphs);
  return {
    title: output.title,
    subtitle: `${SPEECH_TYPES[inputs.speechType]} speech · about ${Math.max(1, Math.round(words / 130))} minutes`,
    paragraphs: output.speech_paragraphs,
    cueCards: output.cue_cards,
  };
}

export const speechWriterGenerator: ToolGenerator<SpeechWriterInputs, SpeechOutput> = {
  inputSchema: speechWriterSchema as never,
  prompt: speechWriterPrompt,
  async build(inputs, output) {
    const doc = buildSpeechDoc(inputs, output);
    const [pdf, docx] = await Promise.all([speechToPdf(doc), speechToDocx(doc)]);
    const wordCount = speechWordCount(output.speech_paragraphs);
    const display: SpeechDisplay = {
      title: doc.title,
      subtitle: doc.subtitle,
      speechText: output.speech_paragraphs.join('\n\n'),
      cueCards: output.cue_cards,
      wordCount,
      estimatedMinutes: Math.round((wordCount / 130) * 10) / 10,
    };
    return {
      display,
      files: [
        {
          filename: 'speech.pdf',
          label: 'Download PDF',
          contentType: 'application/pdf',
          bytes: pdf,
        },
        {
          filename: 'speech.docx',
          label: 'Download Word',
          contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          bytes: docx,
        },
      ],
    };
  },
};
