/**
 * Speech outputs: a large-print reading copy (PDF + DOCX) followed by cut-out cue cards.
 */
import { PDFDocument, StandardFonts, rgb, type PDFFont } from 'pdf-lib';
import { AlignmentType, Document, Footer, Packer, PageBreak, Paragraph, TextRun } from 'docx';
import { FlowWriter, toWinAnsi, wrapText } from './pdf.ts';
import { drawRoundedRect, PALETTE } from './decor.ts';

export interface SpeechDoc {
  title: string;
  /** e.g. "Best man speech · about 5 minutes" */
  subtitle: string;
  paragraphs: string[];
  cueCards: { heading: string; points: string[] }[];
}

const FOOTER = '[pause] marks a natural pause. Take a breath, look up and smile.';
const A4: [number, number] = [595.28, 841.89];

export async function speechToPdf(s: SpeechDoc): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(s.title);
  doc.setCreator('APTO');
  const fonts = {
    regular: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
  };

  // ---- Large-print reading copy ----
  const w = new FlowWriter(doc, fonts, { margin: 56, footer: FOOTER });
  w.text(s.title, { size: 24, bold: true, lineGap: 1.3 });
  w.text(s.subtitle, { size: 13, lineGap: 1.6 });
  w.space(14);
  for (const p of s.paragraphs) {
    w.text(p, { size: 18, lineGap: 1.6 });
    w.space(14);
  }

  // ---- Cue cards: two per A4 page, dashed so they can be cut out ----
  drawCueCards(doc, fonts, s.cueCards);
  return doc.save();
}

function drawCueCards(
  doc: PDFDocument,
  fonts: { regular: PDFFont; bold: PDFFont },
  cards: SpeechDoc['cueCards'],
) {
  const margin = 40;
  const gap = 24;
  const cardW = A4[0] - 2 * margin;
  const cardH = (A4[1] - 2 * margin - gap - 30) / 2;
  const pad = 22;

  cards.forEach((card, i) => {
    if (i % 2 === 0) {
      const page = doc.addPage(A4);
      page.drawText('Cue cards – cut along the dashed lines', {
        x: margin,
        y: A4[1] - margin + 8,
        size: 10,
        font: fonts.regular,
        color: PALETTE.grey,
      });
    }
    const page = doc.getPages().at(-1)!;
    const top = A4[1] - margin - 20 - (i % 2) * (cardH + gap);
    drawRoundedRect(page, {
      x: margin,
      y: top - cardH,
      w: cardW,
      h: cardH,
      r: 10,
      color: PALETTE.grey,
      width: 1,
      dash: [6, 4],
    });

    // Shrink text until the card's content fits.
    const heading = toWinAnsi(`${i + 1}. ${card.heading}`, fonts.bold);
    const points = card.points.map((p) => toWinAnsi(p, fonts.regular));
    let size = 20;
    let layout: { lines: string[]; bullet: boolean }[] = [];
    for (; size >= 11; size -= 1) {
      layout = points.map((p) => ({
        lines: wrapText(p, fonts.regular, size, cardW - 2 * pad - 18),
        bullet: true,
      }));
      const used =
        size * 1.5 + 12 + layout.reduce((a, l) => a + l.lines.length * size * 1.35 + 6, 0);
      if (used <= cardH - 2 * pad) break;
    }

    let y = top - pad - size;
    page.drawText(heading, {
      x: margin + pad,
      y,
      size: size + 2,
      font: fonts.bold,
      color: PALETTE.navy,
    });
    y -= size * 1.5 + 12;
    for (const item of layout) {
      page.drawCircle({ x: margin + pad + 5, y: y + size * 0.35, size: 3, color: PALETTE.navy });
      for (const line of item.lines) {
        if (y < top - cardH + pad) break;
        page.drawText(line, {
          x: margin + pad + 18,
          y,
          size,
          font: fonts.regular,
          color: rgb(0.1, 0.1, 0.12),
        });
        y -= size * 1.35;
      }
      y -= 6;
    }
  });
}

const FONT = 'Arial';
const run = (text: string, o: { size?: number; bold?: boolean; color?: string } = {}) =>
  new TextRun({ text, font: FONT, size: (o.size ?? 16) * 2, bold: o.bold, color: o.color });

export async function speechToDocx(s: SpeechDoc): Promise<Uint8Array> {
  const doc = new Document({
    title: s.title,
    creator: 'APTO',
    sections: [
      {
        footers: {
          default: new Footer({
            children: [new Paragraph({ children: [run(FOOTER, { size: 9, color: '666666' })] })],
          }),
        },
        children: [
          new Paragraph({
            spacing: { after: 120 },
            children: [run(s.title, { size: 24, bold: true })],
          }),
          new Paragraph({
            spacing: { after: 360 },
            children: [run(s.subtitle, { size: 13, color: '555555' })],
          }),
          ...s.paragraphs.map(
            (p) =>
              new Paragraph({
                spacing: { after: 280, line: 384 },
                alignment: AlignmentType.LEFT,
                children: [run(p, { size: 18 })],
              }),
          ),
          new Paragraph({ children: [new PageBreak()] }),
          new Paragraph({
            spacing: { after: 240 },
            children: [run('Cue cards', { size: 22, bold: true })],
          }),
          ...s.cueCards.flatMap((c, i) => [
            new Paragraph({
              spacing: { before: 240, after: 120 },
              children: [run(`${i + 1}. ${c.heading}`, { size: 18, bold: true })],
            }),
            ...c.points.map(
              (p) =>
                new Paragraph({
                  bullet: { level: 0 },
                  spacing: { after: 80 },
                  children: [run(p, { size: 16 })],
                }),
            ),
          ]),
        ],
      },
    ],
  });
  return new Uint8Array(await Packer.toBuffer(doc));
}
