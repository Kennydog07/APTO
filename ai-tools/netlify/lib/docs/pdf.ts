import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import type { Letter } from './letter.ts';

/**
 * pdf-lib's built-in fonts only support the WinAnsi character set. Map common
 * "smart" characters to safe equivalents and drop anything else unsupported,
 * so unusual input (emoji etc.) can never crash PDF generation.
 */
export function toWinAnsi(text: string, font: PDFFont): string {
  const replaced = text
    .replace(/[\u2018\u2019\u201B\u2032]/g, "'")
    .replace(/[\u201C\u201D\u201F\u2033]/g, '"')
    .replace(/[\u2013\u2014\u2212]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/[\u00A0\u2007\u202F]/g, ' ')
    .replace(/\t/g, '    ');
  let out = '';
  for (const ch of replaced) {
    try {
      font.encodeText(ch);
      out += ch;
    } catch {
      out += '';
    }
  }
  return out;
}

/** Greedy word wrap using real font metrics. */
export function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const para of text.split('\n')) {
    const words = para.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push('');
      continue;
    }
    let line = '';
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
        line = candidate;
        continue;
      }
      if (line) lines.push(line);
      // Hard-break a single word longer than the line (e.g. a long URL).
      let rest = word;
      while (font.widthOfTextAtSize(rest, size) > maxWidth && rest.length > 1) {
        let i = rest.length;
        while (i > 1 && font.widthOfTextAtSize(rest.slice(0, i), size) > maxWidth) i--;
        lines.push(rest.slice(0, i));
        rest = rest.slice(i);
      }
      line = rest;
    }
    lines.push(line);
  }
  return lines;
}

const A4: [number, number] = [595.28, 841.89];

/** Simple flowing-text writer that adds pages as needed and stamps a footer on each. */
export class FlowWriter {
  page!: PDFPage;
  y = 0;
  private doc: PDFDocument;
  private fonts: { regular: PDFFont; bold: PDFFont };
  private opts: { margin: number; footer: string; pageSize?: [number, number] };

  constructor(
    doc: PDFDocument,
    fonts: { regular: PDFFont; bold: PDFFont },
    opts: { margin: number; footer: string; pageSize?: [number, number] },
  ) {
    this.doc = doc;
    this.fonts = fonts;
    this.opts = opts;
    this.newPage();
  }

  get width() {
    return (this.opts.pageSize ?? A4)[0] - this.opts.margin * 2;
  }

  newPage() {
    this.page = this.doc.addPage(this.opts.pageSize ?? A4);
    this.y = this.page.getHeight() - this.opts.margin;
    this.drawFooter();
  }

  private drawFooter() {
    if (!this.opts.footer) return;
    const size = 8;
    const text = toWinAnsi(this.opts.footer, this.fonts.regular);
    const lines = wrapText(text, this.fonts.regular, size, this.width);
    lines.forEach((line, i) => {
      this.page.drawText(line, {
        x: this.opts.margin,
        y: 28 + (lines.length - 1 - i) * 10,
        size,
        font: this.fonts.regular,
        color: rgb(0.4, 0.4, 0.4),
      });
    });
  }

  /** Bottom limit for body text (keeps clear of the footer). */
  private get floor() {
    return this.opts.margin + 10;
  }

  text(
    text: string,
    o: { size?: number; bold?: boolean; align?: 'left' | 'right'; lineGap?: number } = {},
  ) {
    const size = o.size ?? 11;
    const font = o.bold ? this.fonts.bold : this.fonts.regular;
    const lineHeight = size * (o.lineGap ?? 1.4);
    for (const line of wrapText(toWinAnsi(text, font), font, size, this.width)) {
      if (this.y - lineHeight < this.floor) this.newPage();
      this.y -= lineHeight;
      const x =
        o.align === 'right'
          ? this.opts.margin + this.width - font.widthOfTextAtSize(line, size)
          : this.opts.margin;
      this.page.drawText(line, { x, y: this.y, size, font, color: rgb(0.08, 0.08, 0.08) });
    }
  }

  space(h: number) {
    this.y -= h;
    if (this.y < this.floor) this.newPage();
  }
}

export async function letterToPdf(letter: Letter, title: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(title);
  doc.setCreator('APTO');
  const fonts = {
    regular: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
  };
  const w = new FlowWriter(doc, fonts, { margin: 64, footer: letter.footer });

  for (const line of letter.senderLines) w.text(line, { align: 'right' });
  w.space(12);
  w.text(letter.dateLine, { align: 'right' });
  w.space(16);
  for (const line of letter.recipientLines) w.text(line);
  w.space(16);
  for (const line of letter.subjectLines) w.text(line, { bold: true });
  w.space(12);
  w.text(letter.salutation);
  for (const p of letter.paragraphs) {
    w.space(8);
    w.text(p);
  }
  w.space(14);
  w.text(letter.signOff);
  w.space(28);
  w.text(letter.signature);

  return doc.save();
}
