import { TOOLS } from '../../../shared/tools';
import { withBase } from '../../../shared/paths';
import { ToolLanding } from '../../components/ToolLanding';
import { STORY_FAQS } from './content';
import { BedtimeStoryForm } from './Form';
import { BedtimeStoryResult, type BedtimeStoryDisplay } from './Result';
import sample from '../../samples/bedtime-story.json';

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
      form={<BedtimeStoryForm />}
      sampleIntro="The start of a sample story. Yours arrives as a printable A5 PDF with a cover, borders and a “The End” page."
      sample={<BedtimeStoryResult r={sample as BedtimeStoryDisplay} sample />}
      faqs={STORY_FAQS}
    />
  );
}
