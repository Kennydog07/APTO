import { TOOLS } from '../../../shared/tools';
import { withBase } from '../../../shared/paths';
import { HowItWorks, type HowStep } from '../../components/HowItWorks';
import { ToolLanding } from '../../components/ToolLanding';
import { SPEECH_FAQS } from './content';
import { SpeechWriterForm } from './Form';
import { SpeechResult, type SpeechDisplay } from './Result';
import sample from '../../samples/speech-writer.json';

const STEPS: HowStep[] = [
  { t: 'Tell us about the occasion', d: 'Your name, your relationship and the type of speech.' },
  { t: 'Add your stories', d: '2 to 5 stories or facts, then pick the tone and length.' },
  { t: 'Pay £4.99', d: 'Secure checkout by Stripe.' },
  {
    t: 'Your speech is written',
    d: 'Built around your own stories, at a comfortable speaking pace with [pause] marks.',
  },
  { t: 'Download and practise', d: 'PDF and Word file, with printable cue cards.' },
];

function Mascot() {
  const src = (w: number, ext: string) => withBase(`/img/mascot-speech-${w}.${ext}`);
  return (
    <picture>
      <source
        type="image/webp"
        srcSet={`${src(600, 'webp')} 600w, ${src(1024, 'webp')} 1024w`}
        sizes="(max-width: 768px) 100vw, 720px"
      />
      <img
        src={src(1024, 'jpg')}
        srcSet={`${src(600, 'jpg')} 600w, ${src(1024, 'jpg')} 1024w`}
        sizes="(max-width: 768px) 100vw, 720px"
        width={1024}
        height={768}
        alt="APTO mascot giving a wedding speech"
        className="mt-5 h-auto w-full rounded-2xl border border-stone-200 shadow-sm"
        fetchPriority="high"
      />
    </picture>
  );
}

export function SpeechWriterPage() {
  return (
    <ToolLanding
      tool={TOOLS['speech-writer']}
      hero={<Mascot />}
      extra={<HowItWorks steps={STEPS} />}
      h1="Speech writer: wedding, eulogy, retirement & leaving speeches"
      form={<SpeechWriterForm />}
      sampleIntro="A short sample best man speech using made-up people. Yours comes as a large-print PDF and Word file with printable cue cards."
      sample={<SpeechResult r={sample as SpeechDisplay} sample />}
      faqs={SPEECH_FAQS}
    />
  );
}
