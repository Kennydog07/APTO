/**
 * A format-neutral description of a formal letter. One Letter is rendered to
 * plain text, PDF and DOCX so all three outputs always match.
 */
export interface Letter {
  senderLines: string[];
  dateLine: string;
  recipientLines: string[];
  subjectLines: string[];
  salutation: string;
  paragraphs: string[];
  signOff: string;
  signature: string;
  /** Printed at the bottom of every page (e.g. the disclaimer). */
  footer: string;
  /** Optional code-built sections inside the letter, after the paragraphs (e.g. an expenses table). */
  blocks?: LetterBlock[];
  /** Optional notes for the sender, after the signature (PDF and Word only, not the letter text). */
  appendix?: LetterBlock[];
}

/** A heading plus lines; `rows` render as a simple two-column table (label, value). */
export interface LetterBlock {
  heading: string;
  lines?: string[];
  rows?: [string, string][];
}

export function blockToText(b: LetterBlock): string {
  const rows = (b.rows ?? []).map(([k, v]) => `${k}: ${v}`);
  return [b.heading, ...(b.lines ?? []), ...rows].join('\n');
}

export function letterToText(l: Letter): string {
  return [
    l.senderLines.join('\n'),
    '',
    l.dateLine,
    '',
    l.recipientLines.join('\n'),
    '',
    l.subjectLines.join('\n'),
    '',
    l.salutation,
    '',
    l.paragraphs.join('\n\n'),
    ...(l.blocks ?? []).flatMap((b) => ['', blockToText(b)]),
    '',
    l.signOff,
    '',
    l.signature,
  ].join('\n');
}

/** "14 March 2026" in UK format. */
export function ukDate(d: Date = new Date()): string {
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/London',
  });
}
