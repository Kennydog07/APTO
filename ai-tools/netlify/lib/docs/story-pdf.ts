/**
 * Bedtime story as a printable A5 PDF: cover page, one passage per page with large
 * child-friendly type, decorative vector borders, and a "The End" page.
 */
import { PDFDocument, StandardFonts, type PDFFont, type PDFPage } from 'pdf-lib';
import { toWinAnsi, wrapText } from './pdf.ts';
import { PALETTE, drawMoon, drawStar, drawStoryBorder } from './decor.ts';
import type { AgeBand } from '../../../shared/schemas/bedtime-story.ts';

export const A5: [number, number] = [419.53, 595.28];

/** Bigger type for younger children. */
export const BODY_SIZE: Record<AgeBand, number> = { '2-4': 20, '5-7': 17, '8-10': 14.5 };
const MIN_SIZE = 11;
const LINE_GAP = 1.5;

interface Fonts {
  body: PDFFont;
  bodyItalic: PDFFont;
  heading: PDFFont;
  small: PDFFont;
}

function centred(
  page: PDFPage,
  text: string,
  y: number,
  font: PDFFont,
  size: number,
  color = PALETTE.ink,
) {
  const w = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: (page.getWidth() - w) / 2, y, size, font, color });
}

/** Text area inside the border. */
const BOX = { left: 52, right: 52, top: 64, bottom: 72 };

/**
 * Fit a passage on one page: shrink the font down to MIN_SIZE if needed; anything that
 * still doesn't fit is returned so it can continue on the next page.
 */
export function layoutPassage(
  text: string,
  font: PDFFont,
  startSize: number,
  pageSize: [number, number] = A5,
) {
  const width = pageSize[0] - BOX.left - BOX.right;
  const height = pageSize[1] - BOX.top - BOX.bottom;
  for (let size = startSize; size >= MIN_SIZE; size -= 0.5) {
    const lines = wrapText(text, font, size, width);
    if (lines.length * size * LINE_GAP <= height) return { size, lines, overflow: [] as string[] };
  }
  const lines = wrapText(text, font, MIN_SIZE, width);
  const fit = Math.floor(height / (MIN_SIZE * LINE_GAP));
  return { size: MIN_SIZE, lines: lines.slice(0, fit), overflow: lines.slice(fit) };
}

function storyPage(doc: PDFDocument, fonts: Fonts, lines: string[], size: number, pageNo: number) {
  const page = doc.addPage(A5);
  drawStoryBorder(page);
  // Little trio of stars at the top of every page.
  drawStar(page, A5[0] / 2 - 18, A5[1] - 48, 4, PALETTE.lilac);
  drawStar(page, A5[0] / 2, A5[1] - 44, 6);
  drawStar(page, A5[0] / 2 + 18, A5[1] - 48, 4, PALETTE.lilac);
  const blockHeight = lines.length * size * LINE_GAP;
  const areaTop = A5[1] - BOX.top;
  const areaHeight = A5[1] - BOX.top - BOX.bottom;
  let y = areaTop - (areaHeight - blockHeight) / 2 - size; // vertically centred
  for (const line of lines) {
    centred(page, line, y, fonts.body, size);
    y -= size * LINE_GAP;
  }
  centred(page, String(pageNo), 36, fonts.small, 10, PALETTE.grey);
}

export async function storyToPdf(story: {
  childName: string;
  title: string;
  pages: string[];
  ageBand: AgeBand;
}): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(story.title);
  doc.setCreator('APTO');
  const fonts: Fonts = {
    body: await doc.embedFont(StandardFonts.TimesRoman),
    bodyItalic: await doc.embedFont(StandardFonts.TimesRomanItalic),
    heading: await doc.embedFont(StandardFonts.HelveticaBold),
    small: await doc.embedFont(StandardFonts.Helvetica),
  };
  const name = toWinAnsi(story.childName, fonts.heading);
  const title = toWinAnsi(story.title, fonts.heading);

  // ---- Cover ----
  const cover = doc.addPage(A5);
  drawStoryBorder(cover);
  drawMoon(cover, A5[0] / 2, 430, 46);
  for (const [x, y, s] of [
    [110, 470, 7],
    [300, 492, 9],
    [330, 400, 5],
    [92, 390, 5],
    [250, 520, 4],
    [160, 515, 5],
  ] as const) {
    drawStar(cover, x, y, s);
  }
  centred(cover, 'A story for', 318, fonts.bodyItalic, 20, PALETTE.grey);
  const nameSize = Math.min(
    44,
    (A5[0] - 110) / Math.max(1, fonts.heading.widthOfTextAtSize(name, 1)),
  );
  centred(cover, name, 272, fonts.heading, nameSize, PALETTE.navy);
  const titleLines = wrapText(title, fonts.heading, 18, A5[0] - 110);
  titleLines.forEach((l, i) => centred(cover, l, 210 - i * 26, fonts.heading, 18, PALETTE.ink));

  // ---- Story pages ----
  let pageNo = 1;
  const start = BODY_SIZE[story.ageBand];
  for (const passage of story.pages) {
    let { size, lines, overflow } = layoutPassage(
      toWinAnsi(passage, fonts.body),
      fonts.body,
      start,
    );
    storyPage(doc, fonts, lines, size, pageNo++);
    while (overflow.length > 0) {
      ({ size, lines, overflow } = layoutPassage(overflow.join(' '), fonts.body, MIN_SIZE));
      storyPage(doc, fonts, lines, size, pageNo++);
    }
  }

  // ---- The End ----
  const end = doc.addPage(A5);
  drawStoryBorder(end);
  drawMoon(end, A5[0] / 2, 380, 36);
  for (const [x, y, s] of [
    [130, 420, 6],
    [290, 430, 8],
    [310, 340, 5],
    [105, 330, 4],
  ] as const) {
    drawStar(end, x, y, s);
  }
  centred(end, 'The End', 260, fonts.heading, 34, PALETTE.navy);
  centred(end, `Sweet dreams, ${name}`, 220, fonts.bodyItalic, 18, PALETTE.grey);

  return doc.save();
}
