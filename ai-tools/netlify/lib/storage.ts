import { db, OUTPUT_BUCKET } from './db.ts';

export interface OutputFile {
  /** File name shown to the user, e.g. "appeal-letter.pdf". */
  filename: string;
  /** Button label, e.g. "Download PDF". */
  label: string;
  contentType: string;
  bytes: Uint8Array;
}

export const SIGNED_URL_SECONDS = 7 * 24 * 60 * 60; // 7 days

/** Upload all files for a job into outputs/<jobId>/ and return their storage paths. */
export async function uploadOutputs(jobId: string, files: OutputFile[]): Promise<string[]> {
  const paths: string[] = [];
  for (const f of files) {
    const path = `${jobId}/${f.filename}`;
    const { error } = await db()
      .storage.from(OUTPUT_BUCKET)
      .upload(path, f.bytes, { contentType: f.contentType, upsert: true });
    if (error) throw error;
    paths.push(path);
  }
  return paths;
}

/** Fresh 7-day signed download URLs. The `download` option makes browsers save, not open. */
export async function signedDownloads(paths: string[]) {
  const out: { filename: string; url: string }[] = [];
  for (const path of paths) {
    const filename = path.split('/').pop() || path;
    const { data, error } = await db()
      .storage.from(OUTPUT_BUCKET)
      .createSignedUrl(path, SIGNED_URL_SECONDS, { download: filename });
    if (error || !data) {
      console.error('signed url failed', path, error);
      continue;
    }
    out.push({ filename, url: data.signedUrl });
  }
  return out;
}

export async function deleteOutputs(paths: string[]) {
  if (paths.length === 0) return;
  const { error } = await db().storage.from(OUTPUT_BUCKET).remove(paths);
  if (error) throw error;
}
