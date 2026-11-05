import { CopyButton } from '../../components/ui';

/** Matches SantaLetterDisplay in netlify/lib/generators/santa-letter.ts */
export interface SantaLetterDisplay {
  childName: string;
  greeting: string;
  paragraphs: string[];
  postscript: string;
  signOff: string;
  signature: string;
}

function asText(d: SantaLetterDisplay) {
  return [
    d.greeting,
    '',
    d.paragraphs.join('\n\n'),
    ...(d.postscript ? ['', `P.S. ${d.postscript}`] : []),
    '',
    d.signOff,
    d.signature,
  ].join('\n');
}

export function SantaLetterResult({ r, sample }: { r: SantaLetterDisplay; sample?: boolean }) {
  const paras = sample ? r.paragraphs.slice(0, 2) : r.paragraphs;
  return (
    <div className="rounded-lg border-4 border-double border-red-700 bg-[#fffbf2] p-5 shadow-sm sm:p-8">
      <div className="mb-4 flex items-start justify-between gap-3">
        <p className="font-serif text-2xl font-bold italic text-red-800">From the North Pole</p>
        {!sample && <CopyButton text={asText(r)} label="Copy letter" />}
      </div>
      <div className="space-y-4 font-serif text-lg leading-relaxed text-stone-900">
        <p className="font-semibold italic text-green-800">{r.greeting}</p>
        {paras.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        {sample ? (
          <p className="text-base italic text-stone-600">
            … the full letter continues, then a Nice List certificate and an envelope to print.
          </p>
        ) : (
          <>
            {r.postscript && <p className="italic">P.S. {r.postscript}</p>}
            <p className="italic">{r.signOff}</p>
            <p className="text-2xl font-bold italic text-red-800">{r.signature}</p>
          </>
        )}
      </div>
    </div>
  );
}
