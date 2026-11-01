/**
 * Background function (Netlify runs it for up to 15 minutes and replies 202 at once).
 * Called only by our own functions with an HMAC-signed job id.
 */
import { isUuid } from '../lib/db.ts';
import { readJson } from '../lib/http.ts';
import { runGeneration, verifyJobSig } from '../lib/pipeline.ts';

export default async (req: Request) => {
  const body = (await readJson(req)) as { jobId?: unknown; sig?: unknown } | null;
  if (!body || !isUuid(body.jobId) || !verifyJobSig(body.jobId, body.sig)) {
    console.warn('generate-background: rejected unsigned/invalid call');
    return;
  }
  await runGeneration(body.jobId);
};
