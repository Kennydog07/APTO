import { TOOLS } from '../../../shared/tools';
import { ToolLanding } from '../../components/ToolLanding';
import { SPEECH_FAQS } from './content';
import { SpeechWriterForm } from './Form';
import { SpeechResult, type SpeechDisplay } from './Result';
import sample from '../../samples/speech-writer.json';

export function SpeechWriterPage() {
  return (
    <ToolLanding
      tool={TOOLS['speech-writer']}
      h1="Speech writer: wedding, eulogy, retirement & leaving speeches"
      form={<SpeechWriterForm />}
      sampleIntro="A short sample best man speech using made-up people. Yours comes as a large-print PDF and Word file with printable cue cards."
      sample={<SpeechResult r={sample as SpeechDisplay} sample />}
      faqs={SPEECH_FAQS}
    />
  );
}
