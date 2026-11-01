/** Small accessible form + content building blocks shared by every tool. */
import { useEffect, useId, useState, type ReactNode } from 'react';
import { formatPrice } from '../../shared/tools';
import { api } from '../lib/api';

export function PriceBadge({
  pence,
  note = 'one-off · no account',
}: {
  pence: number;
  note?: string;
}) {
  return (
    <p className="inline-flex items-baseline gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-900 ring-1 ring-blue-200">
      <span className="text-base font-bold">{formatPrice(pence)}</span>
      <span>{note}</span>
    </p>
  );
}

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <section aria-labelledby="faq-h" className="mx-auto max-w-3xl px-4 py-10">
      <h2 id="faq-h" className="text-2xl font-bold">
        Questions
      </h2>
      <div className="mt-4 divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white">
        {items.map((f) => (
          <details key={f.q} className="group p-4">
            <summary className="cursor-pointer font-semibold marker:text-blue-700">{f.q}</summary>
            <p className="mt-2 text-stone-700">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function FieldShell({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block font-medium text-stone-800">
        {label}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="text-sm text-stone-600">
          {hint}
        </p>
      )}
      <div className="mt-1">{children}</div>
      {error && (
        <p id={`${id}-err`} className="mt-1 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

const inputCls =
  'w-full rounded-md border border-stone-400 bg-white px-3 py-2 text-stone-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/30 aria-[invalid=true]:border-red-700';

const describedBy = (id: string, hint?: unknown, error?: string) =>
  [hint ? `${id}-hint` : '', error ? `${id}-err` : ''].filter(Boolean).join(' ') || undefined;

export function TextField(p: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  maxLength: number;
  error?: string;
  hint?: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  const id = useId();
  return (
    <FieldShell id={id} label={p.label} hint={p.hint} error={p.error}>
      <input
        id={id}
        type={p.type ?? 'text'}
        value={p.value}
        maxLength={p.maxLength}
        autoComplete={p.autoComplete}
        required={p.required ?? true}
        aria-invalid={Boolean(p.error)}
        aria-describedby={describedBy(id, p.hint, p.error)}
        onChange={(e) => p.onChange(e.target.value)}
        className={inputCls}
      />
    </FieldShell>
  );
}

export function TextArea(p: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  maxLength: number;
  error?: string;
  hint?: string;
  rows?: number;
  required?: boolean;
  autoComplete?: string;
}) {
  const id = useId();
  return (
    <FieldShell
      id={id}
      label={p.label}
      error={p.error}
      hint={
        <>
          {p.hint}{' '}
          <span aria-live="polite">
            ({p.value.length}/{p.maxLength})
          </span>
        </>
      }
    >
      <textarea
        id={id}
        value={p.value}
        maxLength={p.maxLength}
        rows={p.rows ?? 4}
        required={p.required ?? true}
        autoComplete={p.autoComplete}
        aria-invalid={Boolean(p.error)}
        aria-describedby={describedBy(id, true, p.error)}
        onChange={(e) => p.onChange(e.target.value)}
        className={inputCls}
      />
    </FieldShell>
  );
}

export function RadioGroup<T extends string>(p: {
  legend: string;
  value: T | '';
  onChange: (v: T) => void;
  options: { value: T; label: string; hint?: string }[];
  error?: string;
}) {
  const name = useId();
  return (
    <fieldset>
      <legend className="font-medium text-stone-800">{p.legend}</legend>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {p.options.map((o) => (
          <label
            key={o.value}
            className="flex cursor-pointer gap-3 rounded-md border border-stone-300 bg-white p-3 has-[:checked]:border-blue-700 has-[:checked]:ring-2 has-[:checked]:ring-blue-700/30"
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={p.value === o.value}
              onChange={() => p.onChange(o.value)}
              className="mt-1 accent-blue-700"
            />
            <span>
              <span className="font-medium">{o.label}</span>
              {o.hint && <span className="block text-sm text-stone-600">{o.hint}</span>}
            </span>
          </label>
        ))}
      </div>
      {p.error && <p className="mt-1 text-sm font-medium text-red-700">{p.error}</p>}
    </fieldset>
  );
}

export function CheckboxGroup<T extends string>(p: {
  legend: string;
  values: T[];
  onChange: (v: T[]) => void;
  options: { value: T; label: string }[];
  error?: string;
}) {
  return (
    <fieldset>
      <legend className="font-medium text-stone-800">{p.legend}</legend>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {p.options.map((o) => (
          <label
            key={o.value}
            className="flex cursor-pointer items-start gap-3 rounded-md border border-stone-300 bg-white p-3 has-[:checked]:border-blue-700"
          >
            <input
              type="checkbox"
              checked={p.values.includes(o.value)}
              className="mt-1 accent-blue-700"
              onChange={(e) =>
                p.onChange(
                  e.target.checked ? [...p.values, o.value] : p.values.filter((v) => v !== o.value),
                )
              }
            />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
      {p.error && <p className="mt-1 text-sm font-medium text-red-700">{p.error}</p>}
    </fieldset>
  );
}

export function Button({
  children,
  busy,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { busy?: boolean }) {
  return (
    <button
      {...rest}
      disabled={busy || rest.disabled}
      aria-busy={busy}
      className={`inline-flex items-center justify-center rounded-md bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-700/30 disabled:cursor-not-allowed disabled:opacity-60 ${rest.className ?? ''}`}
    >
      {children}
    </button>
  );
}

export function CopyButton({ text, label = 'Copy text' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="rounded-md border border-stone-400 bg-white px-3 py-1.5 text-sm font-medium hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-blue-700/30"
    >
      <span aria-live="polite">{copied ? 'Copied ✓' : label}</span>
    </button>
  );
}

export function Notice({
  tone = 'info',
  children,
}: {
  tone?: 'info' | 'warn' | 'error';
  children: ReactNode;
}) {
  const cls = {
    info: 'bg-blue-50 text-blue-950 ring-blue-200',
    warn: 'bg-amber-50 text-amber-950 ring-amber-300',
    error: 'bg-red-50 text-red-900 ring-red-200',
  }[tone];
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`rounded-md p-3 text-sm ring-1 ${cls}`}
    >
      {children}
    </div>
  );
}

/**
 * Kill-switch status. Returns null while loading (we optimistically show the form;
 * create-job enforces the budget server-side anyway).
 */
export function useAcceptingOrders(): boolean | null {
  const [accepting, setAccepting] = useState<boolean | null>(null);
  useEffect(() => {
    api<{ accepting: boolean }>('/api/site-status')
      .then((r) => setAccepting(r.accepting))
      .catch(() => setAccepting(true));
  }, []);
  return accepting;
}

export function BackShortly() {
  return (
    <Notice tone="warn">
      <strong>Back shortly.</strong> We’ve hit today’s capacity and have paused new orders. Please
      come back tomorrow – nothing has been charged.
    </Notice>
  );
}
