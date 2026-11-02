import { CopyButton } from '../../components/ui';

/** Matches ParkingAppealDisplay in netlify/lib/generators/parking-appeal.ts */
export interface ParkingAppealDisplay {
  letterText: string;
  evidence: string[];
  suggestions: string[];
  nextSteps: string[];
  disclaimer: string;
}

export function ParkingAppealResult({ r, sample }: { r: ParkingAppealDisplay; sample?: boolean }) {
  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="font-semibold">{sample ? 'Sample letter' : 'Your letter'}</h3>
          {!sample && <CopyButton text={r.letterText} />}
        </div>
        <pre className="whitespace-pre-wrap font-serif text-[15px] leading-relaxed text-stone-900">
          {r.letterText}
        </pre>
        <p className="mt-4 border-t border-stone-200 pt-3 text-xs text-stone-600">{r.disclaimer}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-lg bg-white p-4 ring-1 ring-stone-200">
          <h3 className="font-semibold">Evidence to attach</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {r.evidence.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
          {r.suggestions.length > 0 && (
            <>
              <h4 className="mt-4 font-semibold">Could strengthen your letter (only if true)</h4>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                {r.suggestions.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </>
          )}
        </section>
        <section className="rounded-lg bg-amber-50 p-4 ring-1 ring-amber-200">
          <h3 className="font-semibold">Next steps</h3>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
            {r.nextSteps.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
