import {
  AlignmentType,
  Document,
  Footer,
  Packer,
  PageBreak,
  Paragraph,
  Tab,
  TabStopType,
  TextRun,
} from 'docx';
import type { Letter, LetterBlock } from './letter.ts';

const FONT = 'Arial';

function para(
  text: string,
  o: { bold?: boolean; right?: boolean; after?: number; tab?: boolean } = {},
) {
  return new Paragraph({
    tabStops: o.tab ? [{ type: TabStopType.RIGHT, position: 9000 }] : undefined,
    alignment: o.right ? AlignmentType.RIGHT : AlignmentType.LEFT,
    spacing: { after: o.after ?? 0 },
    children: o.tab
      ? [
          new TextRun({ text: text.split('\t')[0], font: FONT, size: 22 }),
          new TextRun({ children: [new Tab(), text.split('\t')[1] ?? ''], font: FONT, size: 22 }),
        ]
      : [new TextRun({ text, bold: o.bold, font: FONT, size: 22 })],
  });
}

function blockParas(b: LetterBlock) {
  return [
    para(b.heading, { bold: true, after: 80 }),
    ...(b.lines ?? []).map((t) => para(t, { after: 60 })),
    ...(b.rows ?? []).map(([k, v]) => para(`${k}\t${v}`, { after: 40, tab: true })),
    para('', { after: 120 }),
  ];
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
          ...(letter.blocks ?? []).flatMap(blockParas),
          para(letter.signOff, { after: 480 }),
          para(letter.signature),
          ...(letter.appendix?.length
            ? [
                new Paragraph({ children: [new PageBreak()] }),
                ...letter.appendix.flatMap(blockParas),
              ]
            : []),
        ],
      },
    ],
  });
  return new Uint8Array(await Packer.toBuffer(doc));
}
