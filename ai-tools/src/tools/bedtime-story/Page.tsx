import { TOOLS } from '../../../shared/tools';
import { ToolLanding } from '../../components/ToolLanding';
import { STORY_FAQS } from './content';
import { BedtimeStoryForm } from './Form';
import { BedtimeStoryResult, type BedtimeStoryDisplay } from './Result';
import sample from '../../samples/bedtime-story.json';

export function BedtimeStoryPage() {
  return (
    <ToolLanding
      tool={TOOLS['bedtime-story']}
      h1="Personalised bedtime story for your child"
      form={<BedtimeStoryForm />}
      sampleIntro="The start of a sample story. Yours arrives as a printable A5 PDF with a cover, borders and a “The End” page."
      sample={<BedtimeStoryResult r={sample as BedtimeStoryDisplay} sample />}
      faqs={STORY_FAQS}
    />
  );
}
