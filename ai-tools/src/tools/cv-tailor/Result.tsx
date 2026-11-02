import { CopyButton } from '../../components/ui';

/** Matches CvDisplay in netlify/lib/generators/cv-tailor.ts */
export interface CvDisplay {
  cvText: string;
  coverLetterText: string;
  changes: string[];
}

export function CvResult({ r, sample }: { r: CvDisplay; sample?: boolean }) {
  return (
    <div className="space-y-5">
      <section className="rounded-lg bg-white p-4 ring-1 ring-stone-200 sm:p-6">
        <h3 className="font-semibold">Changes made</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          {r.changes.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </section>
      {[
        { title: 'Tailored CV', text: r.cvText },
        { title: 'Cover letter', text: r.coverLetterText },
      ].map((d) => (
        <section
          key={d.title}
          className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:p-6"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="font-semibold">{sample ? `${d.title} (extract)` : d.title}</h3>
            {!sample && <CopyButton text={d.text} />}
          </div>
          <pre className="whitespace-pre-wrap font-sans text-[15px] leading-relaxed text-stone-900">
            {d.text}
          </pre>
        </section>
      ))}
    </div>
  );
}
