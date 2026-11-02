/**
 * Decorative vector shapes for pdf-lib (no images, no AI art).
 * Coordinates are PDF points with the origin at the bottom-left of the page.
 */
import { rgb, type PDFPage, type RGB } from 'pdf-lib';

export const PALETTE = {
  navy: rgb(0.13, 0.17, 0.38),
  gold: rgb(0.96, 0.75, 0.25),
  softGold: rgb(0.99, 0.91, 0.65),
  lilac: rgb(0.72, 0.68, 0.9),
  sky: rgb(0.62, 0.78, 0.95),
  ink: rgb(0.12, 0.12, 0.16),
  grey: rgb(0.45, 0.45, 0.5),
  white: rgb(1, 1, 1),
};

/** SVG path for a 5-point star centred on (0,0). pdf-lib flips SVG y, so it draws upright. */
export function starPath(outer: number, inner = outer * 0.45): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push(`${(r * Math.cos(a)).toFixed(2)} ${(r * Math.sin(a)).toFixed(2)}`);
  }
  return `M ${pts.join(' L ')} Z`;
}

export function drawStar(
  page: PDFPage,
  x: number,
  y: number,
  size: number,
  color: RGB = PALETTE.gold,
) {
  page.drawSvgPath(starPath(size), { x, y, color, borderWidth: 0 });
}

/** Rounded rectangle outline (quadratic corners). */
export function drawRoundedRect(
  page: PDFPage,
  o: {
    x: number;
    y: number;
    w: number;
    h: number;
    r: number;
    color: RGB;
    width: number;
    dash?: number[];
    fill?: RGB;
  },
) {
  const { w, h, r } = o;
  // SVG coords: origin top-left of the box, y down (pdf-lib flips it).
  const d = `M ${r} 0 L ${w - r} 0 Q ${w} 0 ${w} ${r} L ${w} ${h - r} Q ${w} ${h} ${w - r} ${h} L ${r} ${h} Q 0 ${h} 0 ${h - r} L 0 ${r} Q 0 0 ${r} 0 Z`;
  page.drawSvgPath(d, {
    x: o.x,
    y: o.y + h,
    borderColor: o.color,
    borderWidth: o.width,
    borderDashArray: o.dash,
    color: o.fill,
  });
}

/** Crescent moon: a gold circle with an offset circle in the background colour. */
export function drawMoon(page: PDFPage, x: number, y: number, r: number, bg: RGB = PALETTE.white) {
  page.drawCircle({ x, y, size: r, color: PALETTE.gold });
  page.drawCircle({ x: x + r * 0.45, y: y + r * 0.3, size: r * 0.85, color: bg });
}

/** Double rounded border with stars in the corners and a dotted inner line. */
export function drawStoryBorder(page: PDFPage) {
  const { width, height } = page.getSize();
  const m = 18;
  drawRoundedRect(page, {
    x: m,
    y: m,
    w: width - 2 * m,
    h: height - 2 * m,
    r: 18,
    color: PALETTE.lilac,
    width: 3,
  });
  drawRoundedRect(page, {
    x: m + 8,
    y: m + 8,
    w: width - 2 * (m + 8),
    h: height - 2 * (m + 8),
    r: 12,
    color: PALETTE.sky,
    width: 1.2,
    dash: [2, 4],
  });
  for (const [cx, cy] of [
    [m + 4, m + 4],
    [width - m - 4, m + 4],
    [m + 4, height - m - 4],
    [width - m - 4, height - m - 4],
  ] as const) {
    page.drawCircle({ x: cx, y: cy, size: 11, color: PALETTE.white });
    drawStar(page, cx, cy, 9);
  }
}
