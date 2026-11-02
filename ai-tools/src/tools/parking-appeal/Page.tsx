import { TOOLS } from '../../../shared/tools';
import { withBase } from '../../../shared/paths';
import { ToolLanding } from '../../components/ToolLanding';
import { PARKING_FAQS } from './content';
import { ParkingAppealForm } from './Form';

// No sample letter on this page on purpose: a full sample could simply be copied.
const STEPS = [
  { t: 'Enter your ticket details', d: 'Council PCN or private charge, who issued it, the reference, date, registration and location.' },
  { t: 'Tell us what happened', d: 'Tick your grounds for appeal and explain in your own words.' },
  { t: 'Pay £3.99', d: 'Secure checkout by Stripe.' },
  { t: 'Your letter is written', d: 'A formal, polite appeal from your facts only, ready about a minute after payment.' },
  { t: 'Download and send it', d: 'Get PDF + Word, plus the evidence to attach, then send it to the council or parking company.' },
];

function Mascot() {
  const src = (w: number, ext: string) => withBase(`/img/mascot-clamped-${w}.${ext}`);
  return (
    <picture>
      <source type="image/webp" srcSet={`${src(600, 'webp')} 600w, ${src(1024, 'webp')} 1024w`} sizes="(max-width: 768px) 100vw, 720px" />
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

function HowItWorks() {
  return (
    <section aria-labelledby="how-h" className="mx-auto max-w-5xl px-4 pt-12">
      <h2 id="how-h" className="text-2xl font-bold">How it works</h2>
      <ol className="mt-5 flex flex-col items-stretch gap-2 md:flex-row md:items-stretch">
        {STEPS.map((s, i) => (
          <li key={s.t} className="flex flex-col items-center md:flex-1 md:flex-row">
            <div className="w-full flex-1 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#eb6e14] text-sm font-extrabold text-white">
                {i + 1}
              </span>
              <h3 className="mt-2 font-bold text-[#0d1f35]">{s.t}</h3>
              <p className="mt-1 text-sm text-stone-600">{s.d}</p>
            </div>
            {i < STEPS.length - 1 && (
              <span aria-hidden="true" className="px-1 py-1 text-2xl font-bold text-[#eb6e14] md:py-0">
                <span className="md:hidden">↓</span>
                <span className="hidden md:inline">→</span>
              </span>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

export function ParkingAppealPage() {
  return (
    <ToolLanding
      tool={TOOLS['parking-appeal']}
      h1="Parking ticket appeal letter writer"
      hero={<Mascot />}
      form={<ParkingAppealForm />}
      extra={<HowItWorks />}
      faqs={PARKING_FAQS}
    />
  );
}
