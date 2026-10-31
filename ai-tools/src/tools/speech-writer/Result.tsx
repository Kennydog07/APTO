import { Fragment } from 'react';
import { CopyButton } from '../../components/ui';

/** Matches SpeechDisplay in netlify/lib/generators/speech-writer.ts */
export interface SpeechDisplay {
  title: string;
  subtitle: string;
  speechText: string;
  cueCards: { heading: string; points: string[] }[];
  wordCount: number;
  estimatedMinutes: number;
}

/** Show "[pause]" as a subtle marker. */
function WithPauses({ text }: { text: string }) {
  const parts = text.split(/(\[pause\])/i);
  return (
    <>
      {parts.map((part, i) =>
        /^\[pause\]$/i.test(part) ? (
          <span
            key={i}
            className="mx-1 rounded bg-indigo-50 px-1.5 py-0.5 text-sm font-medium text-indigo-800"
          >
            pause
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

export function SpeechResult({ r, sample }: { r: SpeechDisplay; sample?: boolean }) {
  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <h3 className="text-xl font-bold">{r.title}</h3>
            <p className="text-sm text-stone-600">
              {r.subtitle} · {r.wordCount} words
            </p>
          </div>
          {!sample && <CopyButton text={r.speechText} label="Copy speech" />}
        </div>
        <div className="space-y-4 text-lg leading-relaxed">
          {r.speechText.split('\n\n').map((p, i) => (
            <p key={i}>
              <WithPauses text={p} />
            </p>
          ))}
        </div>
      </div>
      <section>
        <h3 className="mb-2 font-semibold">Cue cards</h3>
        <ol className="grid gap-3 sm:grid-cols-2">
          {r.cueCards.map((c, i) => (
            <li key={i} className="rounded-lg border-2 border-dashed border-stone-300 bg-white p-4">
              <p className="font-bold text-indigo-950">
                {i + 1}. {c.heading}
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                {c.points.map((pt) => (
                  <li key={pt}>{pt}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
