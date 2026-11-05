import { CopyButton } from './ui';
import type { LetterDisplay } from '../../shared/letter-display';

export type { LetterDisplay };

/** Done-page view shared by the letter tools (deposit return, refund letter). */
export function LetterResult({
  r,
  evidenceTitle = 'Evidence to gather',
}: {
  r: LetterDisplay;
  evidenceTitle?: string;
}) {
  return (
    <div className="space-y-5">
      <p className="rounded-lg bg-emerald-50 p-3 font-semibold ring-1 ring-emerald-200">
        {r.headline}
      </p>
      {r.figures.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          {r.figures.map((f) => (
            <div key={f.label} className="rounded-lg bg-stone-50 p-3 ring-1 ring-stone-200">
              <p className="text-sm text-stone-700">{f.label}</p>
              <p className="text-xl font-bold">{f.value}</p>
            </div>
          ))}
        </div>
      )}
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
          <h3 className="font-semibold">{evidenceTitle}</h3>
          {r.checklist && (
            <ul className="mt-2 space-y-1 text-sm">
              {r.checklist.map((c) => (
                <li key={c.item}>
                  <span aria-hidden="true">{c.have ? '☑' : '☐'}</span> {c.item}
                  <span className="sr-only">
                    {c.have ? ' (you have this)' : ' (still to find)'}
                  </span>
                </li>
              ))}
            </ul>
          )}
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
