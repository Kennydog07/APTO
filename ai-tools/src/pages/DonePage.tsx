/**
 * /t/:tool/done?job=<id> – shown after Stripe Checkout. Polls /api/job-status every 3s.
 * Works for every tool: each tool registers its result component in RESULT_VIEWS.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { TOOLS, isToolId, type ToolId } from '../../shared/tools';
import { api } from '../lib/api';
import { Link, useLocation } from '../lib/router';
import { Seo } from '../lib/seo';
import { Button, Notice } from '../components/ui';
import { ParkingAppealResult, type ParkingAppealDisplay } from '../tools/parking-appeal/Result';

const RESULT_VIEWS: Partial<Record<ToolId, (r: unknown) => ReactNode>> = {
  'parking-appeal': (r) => <ParkingAppealResult r={r as ParkingAppealDisplay} />,
};

interface Status {
  tool: ToolId;
  status: 'awaiting_payment' | 'paid' | 'generating' | 'done' | 'failed' | 'abandoned' | 'expired';
  refunded?: boolean;
  result?: unknown;
  downloads?: { label: string; url: string; filename: string }[];
  canRegenerate?: boolean;
  regenFailed?: boolean;
}

const POLL_MS = 3000;
const GIVE_UP_MS = 20 * 60_000;

export function DonePage({ toolId }: { toolId: string }) {
  const { search } = useLocation();
  const jobId = new URLSearchParams(search).get('job') ?? '';
  const [s, setS] = useState<Status | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pollKey, setPollKey] = useState(0);
  const started = useRef(0);

  useEffect(() => {
    if (!jobId) return;
    if (started.current === 0) started.current = Date.now();
    let timer: ReturnType<typeof setTimeout>;
    let stopped = false;
    const tick = async () => {
      try {
        const next = await api<Status>(`/api/job-status?job=${encodeURIComponent(jobId)}`);
        if (stopped) return;
        setS(next);
        setErr(null);
        const finished = ['done', 'failed', 'abandoned', 'expired'].includes(next.status);
        if (!finished && Date.now() - started.current < GIVE_UP_MS)
          timer = setTimeout(tick, POLL_MS);
      } catch (e) {
        if (stopped) return;
        setErr(e instanceof Error ? e.message : 'Could not load your order');
        timer = setTimeout(tick, POLL_MS * 2);
      }
    };
    void tick();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [jobId, pollKey]);

  const tool = isToolId(toolId) ? TOOLS[toolId] : null;
  if (!tool || !jobId)
    return (
      <Wrap>
        <Notice tone="error">This link looks incomplete. Check the email we sent you.</Notice>
      </Wrap>
    );

  return (
    <Wrap title={`Your ${tool.name.toLowerCase()}`}>
      {err && !s && <Notice tone="error">{err}</Notice>}
      {!s && !err && <Working text="Loading your order…" />}
      {s && s.status === 'awaiting_payment' && <Working text="Confirming your payment…" />}
      {s && (s.status === 'paid' || s.status === 'generating') && (
        <Working text="Writing it now – this usually takes under a minute. You can leave this page; we’ll email you a link too." />
      )}
      {s?.status === 'failed' && (
        <Notice tone="error">
          Sorry – we couldn’t create this one.{' '}
          {s.refunded ? 'We’ve refunded you in full' : 'We’re refunding you in full automatically'}{' '}
          and sent you an email.{' '}
          <Link href={tool.route} className="underline">
            Try again
          </Link>
        </Notice>
      )}
      {s?.status === 'abandoned' && (
        <Notice tone="warn">
          This checkout was not completed, so nothing was charged.{' '}
          <Link href={tool.route} className="underline">
            Start again
          </Link>
        </Notice>
      )}
      {s?.status === 'expired' && (
        <Notice tone="warn">
          Files are deleted after 30 days, so this order is no longer available.
        </Notice>
      )}
      {s?.status === 'done' && s.result != null && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-3">
            {s.downloads?.map((d) => (
              <a
                key={d.url}
                href={d.url}
                className="rounded-md bg-blue-700 px-4 py-2.5 font-semibold text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-700/30"
              >
                {d.label}
              </a>
            ))}
          </div>
          <p className="text-sm text-stone-600">
            Download links last 7 days. We’ve also emailed them to you.
          </p>
          {s.regenFailed && (
            <Notice tone="warn">
              Sorry, the regeneration didn’t work, so we’ve kept your original version.
            </Notice>
          )}
          {RESULT_VIEWS[s.tool]?.(s.result)}
          {s.canRegenerate && (
            <Regenerate
              jobId={jobId}
              onQueued={() => {
                started.current = Date.now();
                setS({ ...s, status: 'paid' });
                setPollKey((k) => k + 1);
              }}
            />
          )}
        </div>
      )}
    </Wrap>
  );
}

function Wrap({ title = 'Your order', children }: { title?: string; children: ReactNode }) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-8">
      <Seo title={`${title}`} description="Your order" path="/t/done" noindex />
      <h1 className="mb-4 text-2xl font-bold">{title}</h1>
      {children}
    </section>
  );
}

function Working({ text }: { text: string }) {
  return (
    <div
      role="status"
      className="flex items-center gap-3 rounded-lg bg-white p-4 ring-1 ring-stone-200"
    >
      <span
        className="h-5 w-5 animate-spin rounded-full border-2 border-blue-700 border-t-transparent"
        aria-hidden
      />
      <span>{text}</span>
    </div>
  );
}

function Regenerate({ jobId, onQueued }: { jobId: string; onQueued: () => void }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="font-semibold text-blue-800 underline"
      >
        Not quite right? Regenerate once free
      </button>
    );
  }
  return (
    <form
      className="space-y-3 rounded-lg bg-white p-4 ring-1 ring-stone-200"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
          await api('/api/regenerate', { body: { job: jobId, note } });
          onQueued();
        } catch (e2) {
          setErr(e2 instanceof Error ? e2.message : 'Could not regenerate');
          setBusy(false);
        }
      }}
    >
      <label htmlFor="regen-note" className="block font-medium">
        What should change? (optional)
      </label>
      <textarea
        id="regen-note"
        value={note}
        maxLength={500}
        rows={3}
        onChange={(e) => setNote(e.target.value)}
        className="w-full rounded-md border border-stone-400 px-3 py-2 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/30"
        placeholder="e.g. make it shorter, or put more emphasis on the broken machine"
      />
      <p className="text-sm text-stone-600">
        You can regenerate once. The new version replaces this one.
      </p>
      {err && <Notice tone="error">{err}</Notice>}
      <Button type="submit" busy={busy}>
        Regenerate
      </Button>
    </form>
  );
}
