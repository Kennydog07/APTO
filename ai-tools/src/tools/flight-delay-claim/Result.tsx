import { CopyButton } from '../../components/ui';

/** Matches FlightClaimDisplay in netlify/lib/generators/flight-delay-claim.ts */
export interface FlightClaimDisplay {
  letterText: string;
  claim: { perPassenger: string; total: string; passengers: number; expenses: string };
  evidence: string[];
  nextSteps: string[];
  disclaimer: string;
}

export function FlightClaimResult({ r }: { r: FlightClaimDisplay }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-emerald-50 p-3 ring-1 ring-emerald-200">
          <p className="text-sm text-stone-700">Per passenger</p>
          <p className="text-xl font-bold">{r.claim.perPassenger}</p>
        </div>
        <div className="rounded-lg bg-emerald-50 p-3 ring-1 ring-emerald-200">
          <p className="text-sm text-stone-700">Total ({r.claim.passengers} passengers)</p>
          <p className="text-xl font-bold">{r.claim.total}</p>
        </div>
        <div className="rounded-lg bg-stone-50 p-3 ring-1 ring-stone-200">
          <p className="text-sm text-stone-700">Expenses claimed</p>
          <p className="text-xl font-bold">{r.claim.expenses}</p>
        </div>
      </div>
      <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="font-semibold">Your letter</h3>
          <CopyButton text={r.letterText} />
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
