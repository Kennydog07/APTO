import type { Eligibility } from '../../../shared/rules/flight-compensation';

const money = (c: string, n: number) =>
  `${c}${n.toLocaleString('en-GB', { maximumFractionDigits: 2 })}`;

/** The free, pre-payment result. Amounts come from static rules in code, never from the AI. */
export function EligibilityBox({
  e,
  passengers,
  hasExpenses,
}: {
  e: Eligibility | null;
  passengers: number;
  hasExpenses: boolean;
}) {
  if (!e)
    return (
      <p className="rounded-md bg-stone-50 p-3 text-sm text-stone-700 ring-1 ring-stone-200">
        Fill in the questions above to see, for free, what you may be entitled to.
      </p>
    );
  const ok = e.status !== 'not_eligible';
  return (
    <div
      role="status"
      aria-live="polite"
      className={`rounded-lg p-4 ring-1 ${ok ? 'bg-emerald-50 ring-emerald-300' : 'bg-amber-50 ring-amber-300'}`}
    >
      {ok ? (
        <p className="text-lg font-bold text-emerald-900">
          You may be entitled to about {money(e.currency, e.perPassenger)} per passenger
          {passengers > 1 &&
            ` (${money(e.currency, e.perPassenger * passengers)} for ${passengers})`}
          .
        </p>
      ) : (
        <p className="text-lg font-bold text-amber-900">
          This flight doesn’t appear to qualify for fixed compensation.
        </p>
      )}
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-stone-800">
        {e.reasons.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
      <p className="mt-2 text-xs font-semibold text-stone-700">
        Not guaranteed: this is an estimate from the published rules. The airline decides first.
      </p>
      {!ok && hasExpenses && (
        <p className="mt-2 text-sm text-stone-800">
          You can still use the letter to claim back the expenses you’ve listed.
        </p>
      )}
      {!ok && !hasExpenses && (
        <p className="mt-2 text-sm text-stone-800">
          If the airline didn’t look after you while you waited, add those expenses below to claim
          them back.
        </p>
      )}
    </div>
  );
}
