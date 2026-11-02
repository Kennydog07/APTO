/**
 * Server-side text extraction from an uploaded CV (PDF or DOCX, max 2MB).
 * Nothing is stored: the file is read in memory and only the text is returned.
 */
import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';

export const CV_MAX_BYTES = 2 * 1024 * 1024;

export type CvFileType = 'pdf' | 'docx';

export class CvExtractError extends Error {}

/** Identify the file from its magic bytes (never trust the file name or browser MIME type). */
export function detectCvType(bytes: Uint8Array): CvFileType | null {
  const head = Buffer.from(bytes.subarray(0, 5)).toString('latin1');
  if (head === '%PDF-') return 'pdf';
  if (head.startsWith('PK\u0003\u0004')) return 'docx'; // zip container; mammoth validates further
  return null;
}

/** Tidy extracted text: normalise whitespace, drop empty runs, keep line structure. */
export function cleanCvText(text: string): string {
  return text
    .replace(/\r\n?/g, '\n')
    .replace(/[\u00A0\t]+/g, ' ')
    .replace(/[ ]{2,}/g, ' ')
    .split('\n')
    .map((l) => l.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^-- \d+ of \d+ --$/gm, '') // pdf-parse page separators
    .trim();
}

export async function extractCvText(
  bytes: Uint8Array,
): Promise<{ text: string; type: CvFileType }> {
  if (bytes.byteLength > CV_MAX_BYTES) throw new CvExtractError('Your CV must be 2MB or smaller.');
  const type = detectCvType(bytes);
  if (!type) throw new CvExtractError('Please upload your CV as a PDF or Word (.docx) file.');

  let raw: string;
  try {
    if (type === 'pdf') {
      const parser = new PDFParse({ data: new Uint8Array(bytes) });
      try {
        raw = (await parser.getText()).text;
      } finally {
        await parser.destroy();
      }
    } else {
      raw = (await mammoth.extractRawText({ buffer: Buffer.from(bytes) })).value;
    }
  } catch (e) {
    console.warn('cv extraction failed', e);
    throw new CvExtractError(
      type === 'pdf'
        ? 'We couldn’t read that PDF. Try saving it again, or upload a Word (.docx) version.'
        : 'We couldn’t read that Word file. Make sure it’s a .docx (not .doc), or upload a PDF.',
    );
  }

  const text = cleanCvText(raw);
  if (text.replace(/\s/g, '').length < 200) {
    throw new CvExtractError(
      'We could only find a little text in your CV. If it’s a scanned image, please upload a Word (.docx) or text-based PDF version.',
    );
  }
  return { text, type };
}
