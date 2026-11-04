import type { ReactNode } from 'react';
import { TOOLS } from '../../../shared/tools';
import { HowItWorks, type HowStep } from '../../components/HowItWorks';
import { ToolLanding } from '../../components/ToolLanding';
import { SANTA_FAQS } from './content';
import { SantaLetterForm } from './Form';
import { SantaLetterResult, type SantaLetterDisplay } from './Result';
import sample from '../../samples/santa-letter.json';

const STEPS: HowStep[] = [
  {
    t: 'Tell us about your child',
    d: 'Their first name, age and 1 to 3 good things they did this year.',
  },
  {
    t: 'Add the little touches',
    d: 'Optional: a gentle encouragement, a sibling or pet, a vague present hint. Then pick a tone.',
  },
  { t: 'Pay £1.99', d: 'Secure checkout by Stripe.' },
  {
    t: 'Father Christmas writes',
    d: 'A warm letter from the North Pole, ready about a minute after payment.',
  },
  {
    t: 'Print and deliver',
    d: 'A4 PDF: the letter, a Nice List certificate and an envelope “c/o the fireplace”.',
  },
];

/**
 * Hero image slot. A mascot picture will be added later, like the other tools:
 *   <picture> with /img/mascot-santa-{600,1024}.{webp,jpg} via withBase (see bedtime-story/Page.tsx).
 * Until then nothing is rendered.
 */
const HERO: ReactNode = null;

export function SantaLetterPage() {
  return (
    <ToolLanding
      tool={TOOLS['santa-letter']}
      h1="Personalised letter from Santa"
      hero={HERO}
      extra={<HowItWorks steps={STEPS} />}
      form={<SantaLetterForm />}
      sampleIntro="The start of a sample letter. Yours is a printable A4 PDF with festive borders, a Nice List certificate and an envelope."
      sample={<SantaLetterResult r={sample as SantaLetterDisplay} sample />}
      faqs={SANTA_FAQS}
    />
  );
}
