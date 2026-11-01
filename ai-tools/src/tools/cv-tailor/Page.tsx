import { TOOLS } from '../../../shared/tools';
import { ToolLanding } from '../../components/ToolLanding';
import { CV_FAQS } from './content';
import { CvTailorForm } from './Form';
import { CvResult, type CvDisplay } from './Result';
import sample from '../../samples/cv-tailor.json';

export function CvTailorPage() {
  return (
    <ToolLanding
      tool={TOOLS['cv-tailor']}
      h1="Tailor your CV to a job advert + cover letter"
      form={<CvTailorForm />}
      sampleIntro="An extract from a sample using made-up details. Yours comes as PDF and Word, with a full list of changes."
      sample={<CvResult r={sample as CvDisplay} sample />}
      faqs={CV_FAQS}
    />
  );
}
