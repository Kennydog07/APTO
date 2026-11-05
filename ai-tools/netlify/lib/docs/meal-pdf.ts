/**
 * Meal planner PDF (A4): a pastel 7-day grid, a tick-box shopping list by aisle, then recipe cards.
 */
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage, type RGB } from 'pdf-lib';
import { toWinAnsi, wrapText } from './pdf.ts';
import { drawRoundedRect, PALETTE } from './decor.ts';

export interface MealDoc {
  title: string;
  subtitle: string;
  columns: ('breakfast' | 'lunch' | 'dinner')[];
  days: { day: string; breakfast?: string; lunch?: string; dinner: string }[];
  shopping: { aisle: string; items: { item: string; quantity: string; cost: number }[] }[];
  total: number;
  budget: number;
  recipes: {
    name: string;
    serves: number;
    minutes: number;
    ingredients: string[];
    steps: string[];
  }[];
  tips: string[];
  notice: string;
}

const A4: [number, number] = [595.28, 841.89];
const M = 40;
const W = A4[0] - 2 * M;
const INK = rgb(0.1, 0.1, 0.12);
const PASTELS: RGB[] = [
  rgb(0.99, 0.89, 0.89),
  rgb(1, 0.94, 0.84),
  rgb(1, 0.98, 0.82),
  rgb(0.88, 0.97, 0.88),
  rgb(0.86, 0.94, 0.99),
  rgb(0.91, 0.89, 0.99),
  rgb(0.98, 0.89, 0.96),
];
const gbp = (n: number) => `£${n.toFixed(2)}`;

type Fonts = { regular: PDFFont; bold: PDFFont };

class Pager {
  page!: PDFPage;
  y = 0;
  constructor(
    private doc: PDFDocument,
    private f: Fonts,
    private notice: string,
  ) {
    this.add();
  }
  add() {
    this.page = this.doc.addPage(A4);
    this.y = A4[1] - M;
    const t = toWinAnsi(this.notice, this.f.regular);
    this.page.drawText(t, { x: M, y: 24, size: 8, font: this.f.regular, color: PALETTE.grey });
  }
  need(h: number) {
    if (this.y - h < M + 10) this.add();
  }
  text(
    s: string,
    o: { x?: number; size?: number; bold?: boolean; color?: RGB; width?: number } = {},
  ) {
    const size = o.size ?? 10;
    const font = o.bold ? this.f.bold : this.f.regular;
    for (const line of wrapText(toWinAnsi(s, font), font, size, o.width ?? W - (o.x ?? 0))) {
      this.need(size * 1.35);
      this.y -= size * 1.35;
      this.page.drawText(line, { x: M + (o.x ?? 0), y: this.y, size, font, color: o.color ?? INK });
    }
  }
}

function drawGrid(p: Pager, f: Fonts, d: MealDoc) {
  const dayW = 78;
  const colW = (W - dayW) / d.columns.length;
  const size = 9;
  const pad = 6;
  // Header
  p.y -= 18;
  d.columns.forEach((c, i) =>
    p.page.drawText(c[0]!.toUpperCase() + c.slice(1), {
      x: M + dayW + i * colW + pad,
      y: p.y + 4,
      size: 9,
      font: f.bold,
      color: PALETTE.navy,
    }),
  );
  d.days.forEach((day, r) => {
    const cells = d.columns.map((c) =>
      wrapText(toWinAnsi(day[c] ?? '', f.regular), f.regular, size, colW - 2 * pad),
    );
    const h = Math.max(34, Math.max(...cells.map((c) => c.length)) * size * 1.3 + 2 * pad);
    p.need(h + 4);
    const top = p.y - 4;
    drawRoundedRect(p.page, {
      x: M,
      y: top - h,
      w: W,
      h,
      r: 8,
      color: PASTELS[r % 7]!,
      width: 0.5,
      fill: PASTELS[r % 7],
    });
    p.page.drawText(day.day, {
      x: M + pad + 2,
      y: top - pad - size,
      size: 10,
      font: f.bold,
      color: INK,
    });
    cells.forEach((lines, i) =>
      lines.forEach((line, j) =>
        p.page.drawText(line, {
          x: M + dayW + i * colW + pad,
          y: top - pad - size - j * size * 1.3,
          size,
          font: f.regular,
          color: INK,
        }),
      ),
    );
    p.y = top - h;
  });
}

function drawShopping(p: Pager, f: Fonts, d: MealDoc) {
  p.add();
  p.text('Shopping list', { size: 20, bold: true, color: PALETTE.navy });
  p.text(`Estimated total ${gbp(d.total)} (budget ${gbp(d.budget)}) – estimate, prices vary`, {
    size: 10,
    color: PALETTE.grey,
  });
  p.y -= 6;
  const colGap = 20;
  const colW = (W - colGap) / 2;
  // Two columns: fill the left column, then the right, then a new page.
  let col = 0;
  const top0 = p.y;
  let top = top0;
  const x0 = () => M + col * (colW + colGap);
  const size = 9.5;
  const lh = size * 1.45;
  const nextCol = () => {
    if (col === 0) {
      col = 1;
      p.y = top;
    } else {
      col = 0;
      p.add();
      top = p.y;
    }
  };
  for (const group of d.shopping) {
    if (p.y - (lh * 2 + 8) < M + 10) nextCol();
    p.y -= lh + 6;
    p.page.drawText(toWinAnsi(group.aisle, f.bold), {
      x: x0(),
      y: p.y,
      size: 11,
      font: f.bold,
      color: PALETTE.navy,
    });
    for (const it of group.items) {
      const cost = gbp(it.cost);
      const cw = f.regular.widthOfTextAtSize(cost, size);
      const lines = wrapText(
        toWinAnsi(`${it.item} – ${it.quantity}`, f.regular),
        f.regular,
        size,
        colW - 16 - cw - 8,
      );
      if (p.y - lh * lines.length < M + 10) nextCol();
      p.y -= lh;
      p.page.drawRectangle({
        x: x0(),
        y: p.y - 1,
        width: 8,
        height: 8,
        borderColor: PALETTE.grey,
        borderWidth: 0.8,
      });
      lines.forEach((l, i) =>
        p.page.drawText(l, { x: x0() + 14, y: p.y - i * lh, size, font: f.regular, color: INK }),
      );
      p.page.drawText(cost, {
        x: x0() + colW - cw,
        y: p.y,
        size,
        font: f.regular,
        color: PALETTE.grey,
      });
      p.y -= (lines.length - 1) * lh;
    }
  }
}

function drawRecipes(p: Pager, f: Fonts, d: MealDoc) {
  p.add();
  p.text('Recipe cards', { size: 20, bold: true, color: PALETTE.navy });
  p.y -= 8;
  const pad = 14;
  const inner = W - 2 * pad;
  d.recipes.forEach((r, n) => {
    const size = 9.5;
    const lh = size * 1.4;
    const ing = r.ingredients.map((i) =>
      wrapText(toWinAnsi(i, f.regular), f.regular, size, inner / 2 - 20),
    );
    const steps = r.steps.map((s, i) =>
      wrapText(toWinAnsi(`${i + 1}. ${s}`, f.regular), f.regular, size, inner / 2 - 10),
    );
    const ingH = ing.reduce((a, l) => a + l.length * lh, 0);
    const stepH = steps.reduce((a, l) => a + l.length * lh + 3, 0);
    const h = pad * 2 + 16 + 14 + 16 + Math.max(ingH, stepH);
    p.need(h + 12);
    const top = p.y - 4;
    const fill = PASTELS[n % 7]!;
    drawRoundedRect(p.page, {
      x: M,
      y: top - h,
      w: W,
      h,
      r: 10,
      color: PALETTE.grey,
      width: 0.8,
      fill,
    });
    let y = top - pad - 13;
    p.page.drawText(toWinAnsi(r.name, f.bold), {
      x: M + pad,
      y,
      size: 13,
      font: f.bold,
      color: INK,
    });
    y -= 15;
    p.page.drawText(`Serves ${r.serves} · about ${r.minutes} minutes`.replace('·', '-'), {
      x: M + pad,
      y,
      size: 9,
      font: f.regular,
      color: PALETTE.grey,
    });
    y -= 18;
    const xl = M + pad;
    const xr = M + pad + inner / 2 + 10;
    p.page.drawText('Ingredients', { x: xl, y, size: 10, font: f.bold, color: PALETTE.navy });
    p.page.drawText('Method', { x: xr, y, size: 10, font: f.bold, color: PALETTE.navy });
    let yl = y - 4;
    for (const lines of ing)
      lines.forEach((l, i) => {
        yl -= lh;
        if (i === 0) p.page.drawCircle({ x: xl + 3, y: yl + 3, size: 1.6, color: INK });
        p.page.drawText(l, { x: xl + 10, y: yl, size, font: f.regular, color: INK });
      });
    let yr = y - 4;
    for (const lines of steps) {
      for (const l of lines) {
        yr -= lh;
        p.page.drawText(l, { x: xr, y: yr, size, font: f.regular, color: INK });
      }
      yr -= 3;
    }
    p.y = top - h - 8;
  });
}

export async function mealPlanToPdf(d: MealDoc): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(d.title);
  doc.setCreator('APTO');
  const f: Fonts = {
    regular: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
  };
  const p = new Pager(doc, f, d.notice);
  p.text(d.title, { size: 22, bold: true, color: PALETTE.navy });
  p.text(d.subtitle, { size: 10, color: PALETTE.grey });
  p.y -= 4;
  drawRoundedRect(p.page, {
    x: M,
    y: p.y - 26,
    w: W,
    h: 24,
    r: 6,
    color: PALETTE.gold,
    width: 1,
    fill: PALETTE.softGold,
  });
  p.page.drawText(toWinAnsi(d.notice, f.bold), {
    x: M + 10,
    y: p.y - 17,
    size: 9,
    font: f.bold,
    color: INK,
  });
  p.y -= 30;
  drawGrid(p, f, d);
  p.y -= 14;
  p.text(
    `Estimated shop: ${gbp(d.total)} for the week (budget ${gbp(d.budget)}) – estimate, prices vary.`,
    {
      size: 10,
      bold: true,
    },
  );
  if (d.tips.length) {
    p.y -= 6;
    p.text('Tips for the week', { size: 11, bold: true, color: PALETTE.navy });
    for (const t of d.tips) p.text(`- ${t}`, { size: 9.5 });
  }
  drawShopping(p, f, d);
  drawRecipes(p, f, d);
  return doc.save();
}
