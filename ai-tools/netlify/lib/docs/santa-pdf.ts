/**
 * Letter from Father Christmas as a 3-page A4 PDF:
 *   1. the letter "from the North Pole" with a festive vector border (snowflakes, holly, stars);
 *   2. a "Nice List" certificate with the child's name and date;
 *   3. an envelope front ("To: [Name], c/o the fireplace") to print and fold.
 * All artwork is drawn with pdf-lib vector shapes: no images, no AI art, no trademarked characters.
 */
import {
  PDFDocument,
  StandardFonts,
  degrees,
  rgb,
  type PDFFont,
  type PDFPage,
  type RGB,
} from 'pdf-lib';
import { toWinAnsi, wrapText } from './pdf.ts';
import { PALETTE, drawRoundedRect, drawStar } from './decor.ts';

export const A4: [number, number] = [595.28, 841.89];

export const XMAS = {
  red: rgb(0.72, 0.11, 0.14),
  green: rgb(0.08, 0.42, 0.24),
  darkGreen: rgb(0.05, 0.3, 0.17),
  ice: rgb(0.55, 0.72, 0.9),
  cream: rgb(1, 0.985, 0.95),
  gold: PALETTE.gold,
  ink: PALETTE.ink,
  grey: PALETTE.grey,
};

/** Six-armed snowflake made of lines, with a small V on each arm. */
export function drawSnowflake(
  page: PDFPage,
  x: number,
  y: number,
  r: number,
  color: RGB = XMAS.ice,
) {
  const t = Math.max(0.6, r / 9);
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    const ex = x + r * Math.cos(a);
    const ey = y + r * Math.sin(a);
    page.drawLine({ start: { x, y }, end: { x: ex, y: ey }, thickness: t, color });
    const bx = x + r * 0.6 * Math.cos(a);
    const by = y + r * 0.6 * Math.sin(a);
    for (const s of [-1, 1]) {
      const b = a + (s * Math.PI) / 4;
      page.drawLine({
        start: { x: bx, y: by },
        end: { x: bx + r * 0.3 * Math.cos(b), y: by + r * 0.3 * Math.sin(b) },
        thickness: t,
        color,
      });
    }
  }
}

/** Two holly leaves and three red berries, centred on (x, y). */
export function drawHolly(page: PDFPage, x: number, y: number, s: number) {
  const leaf = (rot: number) =>
    page.drawEllipse({
      x: x + Math.cos(rot) * s * 0.9,
      y: y + Math.sin(rot) * s * 0.9,
      xScale: s,
      yScale: s * 0.42,
      rotate: degrees((rot * 180) / Math.PI),
      color: XMAS.green,
      borderColor: XMAS.darkGreen,
      borderWidth: 0.8,
    });
  leaf(Math.PI * 0.85);
  leaf(Math.PI * 0.15);
  for (const [dx, dy] of [
    [0, 0],
    [s * 0.38, -s * 0.22],
    [-s * 0.38, -s * 0.22],
  ] as const) {
    page.drawCircle({ x: x + dx, y: y + dy, size: s * 0.26, color: XMAS.red });
  }
}

/** Red/green double border with holly in the corners, snowflakes and stars along the edges. */
export function drawFestiveBorder(page: PDFPage) {
  const { width, height } = page.getSize();
  page.drawRectangle({ x: 0, y: 0, width, height, color: XMAS.cream });
  const m = 22;
  drawRoundedRect(page, {
    x: m,
    y: m,
    w: width - 2 * m,
    h: height - 2 * m,
    r: 16,
    color: XMAS.red,
    width: 4,
  });
  drawRoundedRect(page, {
    x: m + 9,
    y: m + 9,
    w: width - 2 * (m + 9),
    h: height - 2 * (m + 9),
    r: 10,
    color: XMAS.green,
    width: 1.4,
    dash: [3, 4],
  });
  // Edge motifs: alternate snowflakes and stars on the outer border line.
  const motif = (px: number, py: number, i: number) => {
    page.drawCircle({ x: px, y: py, size: 9, color: XMAS.cream });
    if (i % 2 === 0) drawSnowflake(page, px, py, 7.5);
    else drawStar(page, px, py, 7, XMAS.gold);
  };
  const nx = 7;
  for (let i = 1; i < nx; i++) {
    const px = m + ((width - 2 * m) * i) / nx;
    motif(px, m, i);
    motif(px, height - m, i + 1);
  }
  const ny = 9;
  for (let i = 1; i < ny; i++) {
    const py = m + ((height - 2 * m) * i) / ny;
    motif(m, py, i);
    motif(width - m, py, i + 1);
  }
  for (const [cx, cy] of [
    [m + 4, m + 4],
    [width - m - 4, m + 4],
    [m + 4, height - m - 4],
    [width - m - 4, height - m - 4],
  ] as const) {
    page.drawCircle({ x: cx, y: cy, size: 20, color: XMAS.cream });
    drawHolly(page, cx, cy, 13);
  }
}

function centred(
  page: PDFPage,
  text: string,
  y: number,
  font: PDFFont,
  size: number,
  color: RGB = XMAS.ink,
) {
  const w = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: (page.getWidth() - w) / 2, y, size, font, color });
}

/** Largest size (down to min) at which `text` fits on one line of `maxWidth`. */
function fitSize(text: string, font: PDFFont, max: number, min: number, maxWidth: number) {
  return Math.max(min, Math.min(max, maxWidth / Math.max(1, font.widthOfTextAtSize(text, 1))));
}

export interface SantaPdfContent {
  childName: string;
  paragraphs: string[];
  postscript: string;
  signature: string;
  dateText: string;
}

const BODY = { left: 78, right: 78, top: 210, bottom: 150 };
const LINE_GAP = 1.45;

/** Fit the letter body in the text area: shrinks from 14pt down to 10pt if needed. */
export function layoutLetter(
  paras: string[],
  font: PDFFont,
  width = A4[0] - BODY.left - BODY.right,
) {
  const height = A4[1] - BODY.top - BODY.bottom;
  for (let size = 14; size >= 10; size -= 0.5) {
    const blocks = paras.map((p) => wrapText(p, font, size, width));
    const lines = blocks.reduce((n, b) => n + b.length, 0) + (blocks.length - 1) * 0.6;
    if (lines * size * LINE_GAP <= height) return { size, blocks, fits: true };
  }
  return { size: 10, blocks: paras.map((p) => wrapText(p, font, 10, width)), fits: false };
}

export async function santaToPdf(c: SantaPdfContent): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle('A letter from Father Christmas');
  doc.setCreator('APTO');
  const f = {
    body: await doc.embedFont(StandardFonts.TimesRoman),
    italic: await doc.embedFont(StandardFonts.TimesRomanItalic),
    boldItalic: await doc.embedFont(StandardFonts.TimesRomanBoldItalic),
    heading: await doc.embedFont(StandardFonts.TimesRomanBold),
    sans: await doc.embedFont(StandardFonts.Helvetica),
  };
  const name = toWinAnsi(c.childName, f.heading);
  const [W, H] = A4;

  // ---- Page 1: the letter ----
  const p1 = doc.addPage(A4);
  drawFestiveBorder(p1);
  for (const [x, y, r] of [
    [150, 760, 9],
    [445, 768, 11],
    [300, 782, 6],
  ] as const)
    drawSnowflake(p1, x, y, r);
  centred(p1, 'From the North Pole', 728, f.boldItalic, 30, XMAS.red);
  centred(p1, 'Father Christmas  *  The Workshop  *  Snowy Lane', 706, f.italic, 11, XMAS.grey);
  const dateText = toWinAnsi(c.dateText, f.body);
  p1.drawText(dateText, {
    x: W - BODY.right - f.body.widthOfTextAtSize(dateText, 12),
    y: 670,
    size: 12,
    font: f.body,
    color: XMAS.ink,
  });
  p1.drawText(`Dear ${name},`, {
    x: BODY.left,
    y: H - BODY.top + 10,
    size: 17,
    font: f.boldItalic,
    color: XMAS.green,
  });

  const paras = [...c.paragraphs, ...(c.postscript ? [`P.S. ${c.postscript}`] : [])].map((p) =>
    toWinAnsi(p, f.body),
  );
  const { size, blocks } = layoutLetter(paras, f.body);
  let y = H - BODY.top - 22;
  blocks.forEach((lines, bi) => {
    const font = c.postscript && bi === blocks.length - 1 ? f.italic : f.body;
    for (const line of lines) {
      p1.drawText(line, { x: BODY.left, y, size, font, color: XMAS.ink });
      y -= size * LINE_GAP;
    }
    y -= size * LINE_GAP * 0.6;
  });
  const sigY = Math.min(y - 6, 150);
  p1.drawText('With love from the North Pole,', {
    x: W - 290,
    y: sigY,
    size: 13,
    font: f.italic,
    color: XMAS.ink,
  });
  p1.drawText(toWinAnsi(c.signature, f.boldItalic), {
    x: W - 270,
    y: sigY - 34,
    size: 28,
    font: f.boldItalic,
    color: XMAS.red,
  });
  drawHolly(p1, W - 300, sigY - 24, 9);

  // ---- Page 2: Nice List certificate ----
  const p2 = doc.addPage(A4);
  drawFestiveBorder(p2);
  for (const [x, y, s] of [
    [200, 700, 10],
    [298, 722, 16],
    [396, 700, 10],
  ] as const)
    drawStar(p2, x, y, s, XMAS.gold);
  centred(p2, 'Official Certificate', 640, f.italic, 20, XMAS.grey);
  centred(p2, 'The Nice List', 585, f.boldItalic, 54, XMAS.red);
  centred(p2, 'This is to certify that', 520, f.italic, 18, XMAS.ink);
  centred(p2, name, 455, f.heading, fitSize(name, f.heading, 56, 24, W - 180), XMAS.green);
  p2.drawLine({
    start: { x: 130, y: 440 },
    end: { x: W - 130, y: 440 },
    thickness: 1,
    color: XMAS.gold,
  });
  for (const [i, l] of [
    'has been kind, helpful and thoroughly wonderful this year,',
    'and is officially on the Nice List at the North Pole.',
  ].entries()) {
    centred(p2, l, 400 - i * 24, f.body, 16, XMAS.ink);
  }
  // Seal: gold rosette with a star.
  p2.drawCircle({ x: W / 2, y: 255, size: 52, color: XMAS.gold });
  p2.drawCircle({
    x: W / 2,
    y: 255,
    size: 44,
    color: XMAS.cream,
    borderColor: XMAS.red,
    borderWidth: 2,
  });
  drawStar(p2, W / 2, 255, 28, XMAS.red);
  p2.drawText(dateText, { x: 110, y: 150, size: 13, font: f.body, color: XMAS.ink });
  p2.drawLine({
    start: { x: 110, y: 142 },
    end: { x: 250, y: 142 },
    thickness: 0.8,
    color: XMAS.grey,
  });
  p2.drawText('Date', { x: 110, y: 128, size: 10, font: f.sans, color: XMAS.grey });
  const sig = toWinAnsi(c.signature, f.boldItalic);
  p2.drawText(sig, {
    x: W - 110 - f.boldItalic.widthOfTextAtSize(sig, 20),
    y: 150,
    size: 20,
    font: f.boldItalic,
    color: XMAS.red,
  });
  p2.drawLine({
    start: { x: W - 260, y: 142 },
    end: { x: W - 110, y: 142 },
    thickness: 0.8,
    color: XMAS.grey,
  });
  p2.drawText('Signed', { x: W - 260, y: 128, size: 10, font: f.sans, color: XMAS.grey });

  // ---- Page 3: envelope front (print, cut along the dashed line, fold) ----
  const p3 = doc.addPage(A4);
  p3.drawRectangle({ x: 0, y: 0, width: W, height: H, color: rgb(1, 1, 1) });
  centred(
    p3,
    'Cut out along the dashed line and fold around the letter.',
    800,
    f.sans,
    10,
    XMAS.grey,
  );
  const env = { x: 50, y: 300, w: W - 100, h: 330 };
  drawRoundedRect(p3, { ...env, r: 6, color: XMAS.grey, width: 1, dash: [5, 4] });
  drawRoundedRect(p3, {
    x: env.x + 10,
    y: env.y + 10,
    w: env.w - 20,
    h: env.h - 20,
    r: 6,
    color: XMAS.red,
    width: 3,
    fill: XMAS.cream,
  });
  // Stamp
  const st = { x: env.x + env.w - 100, y: env.y + env.h - 120, w: 72, h: 88 };
  drawRoundedRect(p3, {
    ...st,
    r: 3,
    color: XMAS.red,
    width: 1.5,
    dash: [2, 2],
    fill: rgb(1, 1, 1),
  });
  drawSnowflake(p3, st.x + st.w / 2, st.y + 50, 20, XMAS.ice);
  centred2(p3, 'NORTH POLE', st.x + st.w / 2, st.y + 14, f.sans, 8, XMAS.red);
  // Postmark
  p3.drawCircle({
    x: st.x - 40,
    y: st.y + 44,
    size: 30,
    borderColor: XMAS.grey,
    borderWidth: 1.2,
    opacity: 0,
    borderOpacity: 0.8,
  });
  centred2(p3, 'SLEIGH', st.x - 40, st.y + 48, f.sans, 8, XMAS.grey);
  centred2(p3, 'MAIL', st.x - 40, st.y + 36, f.sans, 8, XMAS.grey);
  drawHolly(p3, env.x + 50, env.y + env.h - 50, 14);
  p3.drawText('Special Delivery by Reindeer', {
    x: env.x + 80,
    y: env.y + env.h - 56,
    size: 13,
    font: f.italic,
    color: XMAS.green,
  });
  const to = `To: ${name}`;
  p3.drawText(to, {
    x: env.x + 120,
    y: env.y + 150,
    size: fitSize(to, f.boldItalic, 34, 18, env.w - 170),
    font: f.boldItalic,
    color: XMAS.ink,
  });
  p3.drawText('c/o the fireplace', {
    x: env.x + 160,
    y: env.y + 110,
    size: 22,
    font: f.italic,
    color: XMAS.ink,
  });
  for (let i = 0; i < 5; i++) drawStar(p3, env.x + 60 + i * 22, env.y + 40, 5, XMAS.gold);
  drawSnowflake(p3, env.x + env.w - 60, env.y + 50, 14);

  return doc.save();
}

function centred2(
  page: PDFPage,
  text: string,
  cx: number,
  y: number,
  font: PDFFont,
  size: number,
  color: RGB,
) {
  page.drawText(text, { x: cx - font.widthOfTextAtSize(text, size) / 2, y, size, font, color });
}
