/**
 * The listing writer. Without ?token= it shows the "buy" box; with a valid token it shows
 * the upload form, credits left and generated listings. The token lives only in the URL
 * (no cookies or storage), so it's read after hydration.
 */
import { useEffect, useState, useSyncExternalStore } from 'react';
import {
  LISTING_LIMITS,
  PLATFORMS,
  TOKEN_RE,
  listingRequestSchema,
  type Platform,
} from '../../../shared/schemas/listing-writer';
import { TOOLS } from '../../../shared/tools';
import { api, ApiError } from '../../lib/api';
import { ImageError, prepareImage, type PreparedImage } from '../../lib/images';
import {
  BackShortly,
  Button,
  Notice,
  RadioGroup,
  TextArea,
  useAcceptingOrders,
} from '../../components/ui';
import { issuesToFieldErrors } from '../../components/ToolLanding';
import { BuyButton, PackSmallPrint } from './BuyButton';
import { ListingResult, type ListingDisplay } from './Result';

const tool = TOOLS['listing-writer'];

/** Token from the URL. The server snapshot is null, so hydration matches the pre-rendered page. */
function readToken(): string | null {
  const t = new URLSearchParams(window.location.search).get('token');
  return t && TOKEN_RE.test(t) ? t : null;
}
const noSubscribe = () => () => {};

export function ListingWriterApp() {
  const token = useSyncExternalStore(noSubscribe, readToken, () => null);
  return token ? <Writer token={token} /> : <BuyBox />;
}

function BuyBox() {
  const accepting = useAcceptingOrders();
  return (
    <div className="space-y-4 rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
      <ol className="list-decimal space-y-1 pl-5 text-stone-800">
        <li>Buy a pack of {tool.credits} listings.</li>
        <li>We email you a private link. No account needed.</li>
        <li>Snap up to 3 photos per item, choose eBay or Vinted, and copy the listing.</li>
      </ol>
      {accepting === false ? <BackShortly /> : <BuyButton />}
      <PackSmallPrint />
      <p className="text-sm text-stone-600">Already bought? Open the link in your email.</p>
    </div>
  );
}

interface Done {
  id: string;
  result: ListingDisplay;
}

function Writer({ token }: { token: string }) {
  const [remaining, setRemaining] = useState<number | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [platform, setPlatform] = useState<Platform | ''>('');
  const [notes, setNotes] = useState('');
  const [images, setImages] = useState<PreparedImage[]>([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [results, setResults] = useState<Done[]>([]);

  useEffect(() => {
    api<{ remaining: number }>(`/api/credits?token=${token}`)
      .then((r) => setRemaining(r.remaining))
      .catch((e) => setLinkError(e instanceof Error ? e.message : 'This link is not valid'));
  }, [token]);

  async function addFiles(files: FileList | null) {
    if (!files) return;
    setError(null);
    const room = LISTING_LIMITS.maxImages - images.length;
    const picked = Array.from(files).slice(0, room);
    if (files.length > room) setError(`You can add up to ${LISTING_LIMITS.maxImages} photos.`);
    for (const f of picked) {
      try {
        const img = await prepareImage(f);
        setImages((arr) => [...arr, img].slice(0, LISTING_LIMITS.maxImages));
      } catch (e) {
        setError(e instanceof ImageError ? e.message : 'Could not use that photo.');
      }
    }
  }

  /** Poll a job that fell back to the background function. */
  async function waitForJob(jobId: string): Promise<ListingDisplay | null> {
    for (let i = 0; i < 100; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      try {
        const s = await api<{ status: string; result?: ListingDisplay }>(
          `/api/job-status?job=${jobId}`,
        );
        if (s.status === 'done' && s.result) return s.result;
        if (s.status === 'failed') return null;
      } catch (e) {
        if (e instanceof ApiError && e.status === 404) return null;
      }
    }
    return null;
  }

  async function generate() {
    const parsed = listingRequestSchema.safeParse({
      platform,
      notes,
      images: images.map(({ mediaType, data }) => ({ mediaType, data })),
    });
    if (!parsed.success) return setFieldErrors(issuesToFieldErrors(parsed.error.issues));
    setFieldErrors({});
    setError(null);
    setBusy(true);
    setStatus('Writing your listing…');
    const jobId = crypto.randomUUID();
    let result: ListingDisplay | null = null;
    try {
      const res = await api<{ status: string; result?: ListingDisplay; remaining: number }>(
        '/api/listing-generate',
        {
          body: { jobId, token, ...parsed.data },
        },
      );
      setRemaining(res.remaining);
      if (res.status === 'done' && res.result) result = res.result;
      else {
        setStatus('Still working – this one is taking a little longer…');
        result = await waitForJob(jobId);
      }
    } catch (e) {
      if (e instanceof ApiError && e.status < 500) {
        setError(e.message);
        if (typeof e.body.remaining === 'number') setRemaining(e.body.remaining);
        if (e.body.fields) setFieldErrors(e.body.fields as Record<string, string[]>);
      } else {
        // Connection dropped or timed out: the job may still be running.
        setStatus('Still working – this one is taking a little longer…');
        result = await waitForJob(jobId);
      }
    }
    if (result) {
      setResults((r) => [{ id: jobId, result: result! }, ...r]);
      setImages([]);
      setNotes('');
    } else if (!error) {
      setError(
        'Sorry, that listing didn’t work. Your credit has been returned – please try again.',
      );
    }
    api<{ remaining: number }>(`/api/credits?token=${token}`)
      .then((r) => setRemaining(r.remaining))
      .catch(() => {});
    setBusy(false);
    setStatus(null);
  }

  if (linkError) return <Notice tone="error">{linkError}</Notice>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-blue-50 p-4 ring-1 ring-blue-200">
        <p className="text-lg" aria-live="polite">
          <strong>{remaining ?? '…'}</strong> listing{remaining === 1 ? '' : 's'} left
        </p>
        <BuyButton
          topUpToken={token}
          label={`Buy ${tool.credits} more – £${(tool.pricePence / 100).toFixed(2)}`}
        />
      </div>
      <p className="text-sm text-stone-600">
        This private link is your key – bookmark it and don’t share it.
      </p>

      <form
        noValidate
        className="space-y-5 rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:p-6"
        onSubmit={(e) => {
          e.preventDefault();
          void generate();
        }}
      >
        <RadioGroup
          legend="Where are you listing it?"
          value={platform}
          onChange={setPlatform}
          error={fieldErrors.platform?.[0]}
          options={(Object.keys(PLATFORMS) as Platform[]).map((k) => ({
            value: k,
            label: PLATFORMS[k],
          }))}
        />
        <div>
          <label htmlFor="photos" className="block font-medium text-stone-800">
            Photos (1 to 3)
          </label>
          <p id="photos-hint" className="text-sm text-stone-600">
            Clear, well-lit photos work best. Include any labels or flaws. Max 5MB each.
          </p>
          <input
            id="photos"
            type="file"
            accept="image/*"
            multiple
            aria-describedby="photos-hint"
            disabled={images.length >= LISTING_LIMITS.maxImages || busy}
            onChange={(e) => {
              void addFiles(e.target.files);
              e.target.value = '';
            }}
            className="mt-2 block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-blue-700 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-blue-800"
          />
          {images.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-3">
              {images.map((img, i) => (
                <li key={img.previewUrl} className="relative">
                  <img
                    src={img.previewUrl}
                    alt={`Photo ${i + 1}`}
                    className="h-24 w-24 rounded-md object-cover ring-1 ring-stone-300"
                  />
                  <button
                    type="button"
                    aria-label={`Remove photo ${i + 1}`}
                    onClick={() => setImages((arr) => arr.filter((_, j) => j !== i))}
                    className="absolute -right-2 -top-2 h-7 w-7 rounded-full bg-white text-stone-800 shadow ring-1 ring-stone-300 hover:bg-stone-100"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
          {fieldErrors.images && (
            <p className="mt-1 text-sm font-medium text-red-700">{fieldErrors.images[0]}</p>
          )}
        </div>
        <TextArea
          label="Notes (optional)"
          hint="Brand, size, flaws – anything the photos don’t show."
          required={false}
          rows={3}
          value={notes}
          onChange={setNotes}
          maxLength={LISTING_LIMITS.notes}
        />
        {error && <Notice tone="error">{error}</Notice>}
        {status && <Notice>{status}</Notice>}
        <Button type="submit" busy={busy} disabled={remaining === 0}>
          {busy ? 'Writing…' : 'Write listing (uses 1 credit)'}
        </Button>
        {remaining === 0 && (
          <p className="text-sm text-stone-700">
            You’ve used all your listings. Buy 10 more above.
          </p>
        )}
      </form>

      {results.map((r, i) => (
        <section key={r.id} aria-label={`Listing ${results.length - i}`}>
          <h2 className="mb-2 text-xl font-bold">
            Your listing{results.length > 1 ? ` #${results.length - i}` : ''}
          </h2>
          <ListingResult r={r.result} />
        </section>
      ))}
    </div>
  );
}
