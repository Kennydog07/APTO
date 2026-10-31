import { AlignmentType, Document, Footer, Packer, Paragraph, TextRun } from 'docx';
import type { Letter } from './letter.ts';

const FONT = 'Arial';

function para(text: string, o: { bold?: boolean; right?: boolean; after?: number } = {}) {
  return new Paragraph({
    alignment: o.right ? AlignmentType.RIGHT : AlignmentType.LEFT,
    spacing: { after: o.after ?? 0 },
    children: [new TextRun({ text, bold: o.bold, font: FONT, size: 22 })],
  });
}

export async function letterToDocx(letter: Letter, title: string): Promise<Uint8Array> {
  const lines = (arr: string[], o: { bold?: boolean; right?: boolean } = {}) =>
    arr.map((t, i) => para(t, { ...o, after: i === arr.length - 1 ? 240 : 0 }));

  const doc = new Document({
    title,
    creator: 'APTO',
    sections: [
      {
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: letter.footer, font: FONT, size: 16, color: '666666' }),
                ],
              }),
            ],
          }),
        },
        children: [
          ...lines(letter.senderLines, { right: true }),
          para(letter.dateLine, { right: true, after: 240 }),
          ...lines(letter.recipientLines),
          ...lines(letter.subjectLines, { bold: true }),
          para(letter.salutation, { after: 160 }),
          ...letter.paragraphs.map((p) => para(p, { after: 160 })),
          para(letter.signOff, { after: 480 }),
          para(letter.signature),
        ],
      },
    ],
  });
  return new Uint8Array(await Packer.toBuffer(doc));
}
