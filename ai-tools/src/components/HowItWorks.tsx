export type HowStep = { t: string; d: string };

/** Shared 'How it works' flowchart: vertical on mobile, horizontal from md. */
export function HowItWorks({ steps }: { steps: HowStep[] }) {
  return (
    <section aria-labelledby="how-h" className="mx-auto max-w-5xl px-4 pt-12">
      <h2 id="how-h" className="text-2xl font-bold">How it works</h2>
      <ol className="mt-5 flex flex-col items-stretch gap-2 md:flex-row md:items-stretch">
        {steps.map((s, i) => (
          <li key={s.t} className="flex flex-col items-center md:flex-1 md:flex-row">
            <div className="w-full flex-1 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#eb6e14] text-sm font-extrabold text-white">
                {i + 1}
              </span>
              <h3 className="mt-2 font-bold text-[#0d1f35]">{s.t}</h3>
              <p className="mt-1 text-sm text-stone-600">{s.d}</p>
            </div>
            {i < steps.length - 1 && (
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
