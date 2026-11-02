import { useState } from 'react';
import { CV_LIMITS, cvPreviewSchema, cvTailorSchema } from '../../../shared/schemas/cv-tailor';
import { TOOLS, formatPrice } from '../../../shared/tools';
import { api } from '../../lib/api';
import { BackShortly, Button, Notice, TextArea, useAcceptingOrders } from '../../components/ui';
import { CheckoutSmallPrint, issuesToFieldErrors } from '../../components/ToolLanding';
import { useCheckout } from '../useCheckout';

const tool = TOOLS['cv-tailor'];

interface Preview {
  fit: 'strong' | 'good' | 'partial' | 'low';
  bullets: string[];
}
const FIT_LABEL: Record<Preview['fit'], string> = {
  strong: 'Strong match',
  good: 'Good match',
  partial: 'Partial match',
  low: 'Weak match',
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const s = String(reader.result);
      resolve(s.slice(s.indexOf(',') + 1));
    };
    reader.onerror = () => reject(new Error('Could not read the file'));
    reader.readAsDataURL(file);
  });
}

export function CvTailorForm() {
  const accepting = useAcceptingOrders();
  const { submit, busy, error, fieldErrors, setFieldErrors } = useCheckout(tool.id);
  const [cvText, setCvText] = useState('');
  const [fileInfo, setFileInfo] = useState<string | null>(null);
  const [reading, setReading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [advert, setAdvert] = useState('');
  const [notes, setNotes] = useState('');
  const [preview, setPreview] = useState<Preview | null>(null);
  const [previewBusy, setPreviewBusy] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const fe = (k: string) => fieldErrors[k]?.[0];

  if (accepting === false) return <BackShortly />;

  async function onFile(file: File | undefined) {
    if (!file) return;
    setUploadError(null);
    setPreview(null);
    if (file.size > CV_LIMITS.maxFileBytes)
      return setUploadError('Your CV must be 2MB or smaller.');
    if (!/\.(pdf|docx)$/i.test(file.name))
      return setUploadError('Please upload a PDF or Word (.docx) file.');
    setReading(true);
    try {
      const res = await api<{ text: string; words: number }>('/api/cv-extract', {
        body: { data: await fileToBase64(file) },
      });
      setCvText(res.text);
      setFileInfo(`We read ${res.words} words from “${file.name}”.`);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Could not read your CV');
      setCvText('');
      setFileInfo(null);
    } finally {
      setReading(false);
    }
  }

  async function getPreview() {
    setPreviewError(null);
    const parsed = cvPreviewSchema.safeParse({ cvText, advert });
    if (!parsed.success) return setFieldErrors(issuesToFieldErrors(parsed.error.issues));
    setFieldErrors({});
    setPreviewBusy(true);
    try {
      setPreview(await api<Preview>('/api/cv-preview', { body: parsed.data }));
    } catch (e) {
      setPreviewError(e instanceof Error ? e.message : 'Preview unavailable');
    } finally {
      setPreviewBusy(false);
    }
  }

  return (
    <form
      noValidate
      className="space-y-5 rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:p-6"
      onSubmit={(e) => {
        e.preventDefault();
        const parsed = cvTailorSchema.safeParse({ cvText, advert, notes });
        if (!parsed.success) return setFieldErrors(issuesToFieldErrors(parsed.error.issues));
        void submit(parsed.data);
      }}
    >
      <div>
        <label htmlFor="cv-file" className="block font-medium text-stone-800">
          Your current CV
        </label>
        <p id="cv-file-hint" className="text-sm text-stone-600">
          PDF or Word (.docx), up to 2MB. We read the text and don’t keep the file.
        </p>
        <input
          id="cv-file"
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          aria-describedby="cv-file-hint"
          disabled={reading}
          onChange={(e) => void onFile(e.target.files?.[0])}
          className="mt-2 block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-blue-700 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-blue-800"
        />
        {reading && (
          <p className="mt-2 text-sm" role="status">
            Reading your CV…
          </p>
        )}
        {uploadError && (
          <div className="mt-2">
            <Notice tone="error">{uploadError}</Notice>
          </div>
        )}
        {fe('cvText') && !cvText && (
          <p className="mt-1 text-sm font-medium text-red-700">{fe('cvText')}</p>
        )}
        {fileInfo && (
          <details className="mt-2 rounded-md bg-stone-50 p-3 ring-1 ring-stone-200">
            <summary className="cursor-pointer text-sm font-medium">
              {fileInfo} Check or edit the text we read
            </summary>
            <div className="mt-2">
              <TextArea
                label="CV text"
                rows={10}
                value={cvText}
                onChange={setCvText}
                maxLength={CV_LIMITS.cvTextMax}
                error={fe('cvText')}
              />
            </div>
          </details>
        )}
      </div>

      <TextArea
        label="The job advert"
        hint="Paste the full advert, including the requirements."
        rows={8}
        value={advert}
        onChange={(v) => {
          setAdvert(v);
          setPreview(null);
        }}
        maxLength={CV_LIMITS.advertMax}
        error={fe('advert')}
      />
      <TextArea
        label="Anything to emphasise? (optional)"
        hint="e.g. career changer, want to highlight leadership."
        required={false}
        rows={2}
        value={notes}
        onChange={setNotes}
        maxLength={CV_LIMITS.notes}
        error={fe('notes')}
      />

      <div className="rounded-md bg-stone-50 p-4 ring-1 ring-stone-200">
        <button
          type="button"
          onClick={() => void getPreview()}
          disabled={previewBusy || !cvText}
          className="rounded-md border border-blue-700 bg-white px-4 py-2 font-semibold text-blue-800 hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-700/30 disabled:opacity-60"
        >
          {previewBusy ? 'Checking your match…' : 'Free match preview'}
        </button>
        <p className="mt-1 text-xs text-stone-600">
          See how well your CV fits before you pay. Free, up to 3 a day.
        </p>
        {previewError && (
          <div className="mt-2">
            <Notice tone="warn">{previewError}</Notice>
          </div>
        )}
        {preview && (
          <div className="mt-3" aria-live="polite">
            <p className="font-semibold">{FIT_LABEL[preview.fit]}</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
              {preview.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {Object.keys(fieldErrors).length > 0 && (
        <Notice tone="error">Please fix the highlighted fields.</Notice>
      )}
      {error && <Notice tone="error">{error}</Notice>}

      <Button type="submit" busy={busy} disabled={reading} className="w-full sm:w-auto">
        {busy
          ? 'Taking you to secure checkout…'
          : `Tailor my CV + cover letter – ${formatPrice(tool.pricePence)}`}
      </Button>
      <CheckoutSmallPrint what="CV and cover letter" />
    </form>
  );
}
