import { CopyButton } from '../../components/ui';

/** Matches ListingDisplay in netlify/lib/generators/listing-writer.ts */
export interface ListingDisplay {
  platform: string;
  title: string;
  description: string;
  category: string;
  itemSpecifics: { name: string; value: string }[];
  condition: string;
  keywords: string[];
  checks: string[];
}

function Field({
  label,
  copy,
  sample,
  children,
}: {
  label: string;
  copy: string;
  sample?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-stone-200 py-3 first:border-t-0">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-600">{label}</h3>
        {!sample && <CopyButton text={copy} label="Copy" />}
      </div>
      <div className="mt-1">{children}</div>
    </div>
  );
}

export function ListingResult({ r, sample }: { r: ListingDisplay; sample?: boolean }) {
  const specifics = r.itemSpecifics.map((s) => `${s.name}: ${s.value}`).join('\n');
  return (
    <div className="rounded-lg border border-stone-200 bg-white px-4 py-2 shadow-sm sm:px-6">
      <Field label={`Title (${r.title.length} chars)`} copy={r.title} sample={sample}>
        <p className="font-semibold">{r.title}</p>
      </Field>
      <Field label="Description" copy={r.description} sample={sample}>
        <p className="whitespace-pre-line">{r.description}</p>
      </Field>
      <Field label="Category" copy={r.category} sample={sample}>
        <p>{r.category}</p>
      </Field>
      {r.itemSpecifics.length > 0 && (
        <Field label="Item specifics" copy={specifics} sample={sample}>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            {r.itemSpecifics.map((s) => (
              <div key={s.name} className="contents">
                <dt className="font-medium text-stone-700">{s.name}</dt>
                <dd>{s.value}</dd>
              </div>
            ))}
          </dl>
        </Field>
      )}
      <Field label="Condition" copy={r.condition} sample={sample}>
        <p>{r.condition}</p>
      </Field>
      <Field label="Search keywords" copy={r.keywords.join(', ')} sample={sample}>
        <ul className="flex flex-wrap gap-2">
          {r.keywords.map((k) => (
            <li key={k} className="rounded-full bg-stone-100 px-3 py-1 text-sm">
              {k}
            </li>
          ))}
        </ul>
      </Field>
      {r.checks.length > 0 && (
        <div className="my-3 rounded-md bg-amber-50 p-3 text-sm ring-1 ring-amber-200">
          <p className="font-semibold">Please check before listing</p>
          <ul className="mt-1 list-disc pl-5">
            {r.checks.map((c) => (
              <li key={c}>{c.replace(/^check:\s*/i, '')}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
