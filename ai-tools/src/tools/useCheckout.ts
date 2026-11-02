import { useState } from 'react';
import { api, ApiError } from '../lib/api';
import type { ToolId } from '../../shared/tools';

/** Shared submit logic: create the job, then redirect to Stripe Checkout. */
export function useCheckout(tool: ToolId) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function submit(inputs: unknown) {
    setBusy(true);
    setError(null);
    setFieldErrors({});
    try {
      const { url } = await api<{ url: string }>('/api/create-job', { body: { tool, inputs } });
      window.location.assign(url);
    } catch (e) {
      if (e instanceof ApiError && e.body.fields)
        setFieldErrors(e.body.fields as Record<string, string[]>);
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setBusy(false);
    }
  }
  return { submit, busy, error, fieldErrors, setFieldErrors };
}
