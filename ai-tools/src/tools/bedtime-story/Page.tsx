import { TOOLS } from '../../../shared/tools';
import { withBase } from '../../../shared/paths';
import { HowItWorks, type HowStep } from '../../components/HowItWorks';
import { ToolLanding } from '../../components/ToolLanding';
import { STORY_FAQS } from './content';
import { BedtimeStoryForm } from './Form';
import { BedtimeStoryResult, type BedtimeStoryDisplay } from './Result';
import sample from '../../samples/bedtime-story.json';

const STEPS: HowStep[] = [
  { t: 'Tell us about your child', d: 'Their first name, age and 1 to 3 favourite things to star in the story.' },
  { t: 'Pick a theme and length', d: 'Choose an optional theme and how long the story should be.' },
  { t: 'Pay £2.99', d: 'Secure checkout by Stripe.' },
  { t: 'Your story is written', d: 'A gentle, personalised bedtime story starring your child.' },
  { t: 'Download and print', d: 'A printable A5 PDF with a cover, borders and a “The End” page.' },
];

function Mascot() {
  const src = (w: number, ext: string) => withBase(`/img/mascot-bedtime-${w}.${ext}`);
  return (
    <picture>
      <source type="image/webp" srcSet={`${src(600, 'webp')} 600w, ${src(1024, 'webp')} 1024w`} sizes="(max-width: 768px) 100vw, 720px" />
      <img
        src={src(1024, 'jpg')}
        srcSet={`${src(600, 'jpg')} 600w, ${src(1024, 'jpg')} 1024w`}
        sizes="(max-width: 768px) 100vw, 720px"
        width={1024}
        height={768}
        alt="APTO mascot reading a bedtime story to a mini APTO tucked up in bed"
        className="mt-5 h-auto w-full rounded-2xl border border-stone-200 shadow-sm"
        fetchPriority="high"
      />
    </picture>
  );
}

export function BedtimeStoryPage() {
  return (
    <ToolLanding
      tool={TOOLS['bedtime-story']}
      h1="Personalised bedtime story for your child"
      hero={<Mascot />}
      extra={<HowItWorks steps={STEPS} />}
      form={<BedtimeStoryForm />}
      sampleIntro="The start of a sample story. Yours arrives as a printable A5 PDF with a cover, borders and a “The End” page."
      sample={<BedtimeStoryResult r={sample as BedtimeStoryDisplay} sample />}
      faqs={STORY_FAQS}
    />
  );
}
