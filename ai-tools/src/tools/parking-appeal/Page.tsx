import { TOOLS } from '../../../shared/tools';
import { withBase } from '../../../shared/paths';
import { HowItWorks, type HowStep } from '../../components/HowItWorks';
import { ToolLanding } from '../../components/ToolLanding';
import { PARKING_FAQS } from './content';
import { ParkingAppealForm } from './Form';

// No sample letter on this page on purpose: a full sample could simply be copied.
const STEPS: HowStep[] = [
  {
    t: 'Enter your ticket details',
    d: 'Council PCN or private charge, who issued it, the reference, date, registration and location.',
  },
  { t: 'Tell us what happened', d: 'Tick your grounds for appeal and explain in your own words.' },
  { t: 'Pay £3.99', d: 'Secure checkout by Stripe.' },
  {
    t: 'Your letter is written',
    d: 'A formal, polite appeal from your facts only, ready about a minute after payment.',
  },
  {
    t: 'Download and send it',
    d: 'Get PDF + Word, plus the evidence to attach, then send it to the council or parking company.',
  },
];

function Mascot() {
  const src = (w: number, ext: string) => withBase(`/img/mascot-clamped-${w}.${ext}`);
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
        alt="APTO mascot fuming at his clamped car"
        className="mt-5 h-auto w-full rounded-2xl border border-stone-200 shadow-sm"
        fetchPriority="high"
      />
    </picture>
  );
}

export function ParkingAppealPage() {
  return (
    <ToolLanding
      tool={TOOLS['parking-appeal']}
      h1="Parking ticket appeal letter writer"
      hero={<Mascot />}
      form={<ParkingAppealForm />}
      extra={<HowItWorks steps={STEPS} />}
      faqs={PARKING_FAQS}
    />
  );
}
