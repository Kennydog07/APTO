import { CopyButton } from '../../components/ui';

/** Matches BedtimeStoryDisplay in netlify/lib/generators/bedtime-story.ts */
export interface BedtimeStoryDisplay {
  childName: string;
  title: string;
  pages: string[];
}

export function BedtimeStoryResult({ r, sample }: { r: BedtimeStoryDisplay; sample?: boolean }) {
  return (
    <div className="rounded-lg border-4 border-double border-indigo-200 bg-white p-5 shadow-sm sm:p-8">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm italic text-stone-600">A story for {r.childName}</p>
          <h3 className="text-2xl font-bold text-indigo-950">{r.title}</h3>
        </div>
        {!sample && (
          <CopyButton text={`${r.title}\n\n${r.pages.join('\n\n')}`} label="Copy story" />
        )}
      </div>
      <div className="space-y-4 font-serif text-lg leading-relaxed text-stone-900">
        {(sample ? r.pages.slice(0, 4) : r.pages).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        {sample && (
          <p className="text-base italic text-stone-600">… and so on, to a cosy, sleepy ending.</p>
        )}
      </div>
      {!sample && <p className="mt-6 text-center text-xl font-bold text-indigo-950">The End</p>}
    </div>
  );
}
