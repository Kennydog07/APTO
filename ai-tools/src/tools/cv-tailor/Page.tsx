import { TOOLS } from '../../../shared/tools';
import { withBase } from '../../../shared/paths';
import { ToolLanding } from '../../components/ToolLanding';
import { CV_FAQS } from './content';
import { CvTailorForm } from './Form';
import { CvResult, type CvDisplay } from './Result';
import sample from '../../samples/cv-tailor.json';

function Mascot() {
  const src = (w: number, ext: string) => withBase(`/img/mascot-cv-${w}.${ext}`);
  return (
    <picture>
      <source type="image/webp" srcSet={`${src(600, 'webp')} 600w, ${src(1024, 'webp')} 1024w`} sizes="(max-width: 768px) 100vw, 720px" />
      <img
        src={src(1024, 'jpg')}
        srcSet={`${src(600, 'jpg')} 600w, ${src(1024, 'jpg')} 1024w`}
        sizes="(max-width: 768px) 100vw, 720px"
        width={1024}
        height={768}
        alt="APTO mascot reading his tailored CV"
        className="mt-5 h-auto w-full rounded-2xl border border-stone-200 shadow-sm"
        fetchPriority="high"
      />
    </picture>
  );
}

export function CvTailorPage() {
  return (
    <ToolLanding
      tool={TOOLS['cv-tailor']}
      hero={<Mascot />}
      h1="Tailor your CV to a job advert + cover letter"
      form={<CvTailorForm />}
      sampleIntro="An extract from a sample using made-up details. Yours comes as PDF and Word, with a full list of changes."
      sample={<CvResult r={sample as CvDisplay} sample />}
      faqs={CV_FAQS}
    />
  );
}
