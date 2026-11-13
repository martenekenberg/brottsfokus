// Reusable dot plot: one row per group, sorted by the caller.
// Pure function: data + width in, SVG markup out. Runs at build time and in the browser.
import { scaleLinear } from 'd3';
import { formatNumber, formatTimes } from '../format';

export type DotFormat = 'x1' | 'x2' | 'num1';

export interface DotRow {
  id: string;
  label: string;
  /** Extra line in the tooltip, e.g. the region a country belongs to. */
  detail?: string;
  /** The group's own value: filled blue dot. */
  primary: number;
  /** Optional second value, e.g. adjusted risk: orange dot. null = not available. */
  secondary: number | null;
}

export interface DotChartSpec {
  rows: DotRow[];
  primaryLabel: string;
  /** Omit when no row has a second value. */
  secondaryLabel?: string;
  format: DotFormat;
  /** The comparison group, drawn as a dashed black line. */
  ref: { value: number; label: string };
  ariaLabel: string;
}

export const DOT_NARROW = 560;
const C = { focus: '#1D4E89', second: '#C2410C', ink: '#121212', muted: '#5C5C5C', rule: '#E3E3E3' };
const FONT = 'font-family="Inter Variable, Inter, Arial, sans-serif"';

export function dotFmt(v: number, f: DotFormat): string {
  if (f === 'x1') return formatTimes(v, 1);
  if (f === 'x2') return formatTimes(v, 2);
  return formatNumber(v, 1);
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export interface DotLayout {
  width: number;
  height: number;
  narrow: boolean;
  /** Left edge of the dot track. */
  x0: number;
  /** Right edge of the dot track. */
  x1: number;
  top: number;
  rowHeight: number;
  /** Vertical centre of the dots in row i. */
  rowY: (i: number) => number;
  x: (v: number) => number;
  ticks: number[];
}

export function layoutDotChart(spec: DotChartSpec, width: number): DotLayout {
  const narrow = width < DOT_NARROW;
  const hasSecondary = spec.rows.some((r) => r.secondary !== null);
  const valueCol = hasSecondary ? (narrow ? 84 : 104) : narrow ? 44 : 56;
  const labelCol = narrow ? 0 : Math.min(300, Math.round(width * 0.32));
  const rowHeight = narrow ? 44 : 30;
  const top = 34;
  const x0 = labelCol + (narrow ? 12 : 12);
  const x1 = width - valueCol - 12;

  let max = spec.ref.value;
  for (const r of spec.rows) {
    max = Math.max(max, r.primary, r.secondary ?? 0);
  }
  const scale = scaleLinear().domain([0, max]).nice(narrow ? 4 : 6).range([x0, x1]);
  const ticks = scale.ticks(narrow ? 4 : 6);
  const height = top + spec.rows.length * rowHeight + 8;
  const rowY = (i: number) => top + i * rowHeight + (narrow ? 30 : rowHeight / 2);
  return { width, height, narrow, x0, x1, top, rowHeight, rowY, x: scale, ticks };
}

export function renderDotChart(spec: DotChartSpec, width: number): string {
  const L = layoutDotChart(spec, width);
  const { x, rowY, narrow } = L;
  const step = L.ticks.length > 1 ? L.ticks[1] - L.ticks[0] : 1;
  const tickDecimals = Math.max(0, Math.ceil(-Math.log10(step) - 1e-9));
  const tickLabel = (v: number) =>
    spec.format === 'num1' ? formatNumber(v, tickDecimals) : formatTimes(v, tickDecimals);
  const p: string[] = [];

  p.push(
    `<svg viewBox="0 0 ${width} ${L.height}" width="100%" role="img" aria-label="${esc(spec.ariaLabel)}" style="display:block" font-variant-numeric="tabular-nums">`,
  );

  // Light band behind every other row helps the eye follow long rows (wide screens).
  if (!narrow) {
    spec.rows.forEach((_, i) => {
      if (i % 2 === 0) {
        p.push(`<rect x="0" y="${(rowY(i) - L.rowHeight / 2).toFixed(1)}" width="${width}" height="${L.rowHeight}" fill="#F7F7F8"/>`);
      }
    });
  }

  // Vertical lines: full height on wide screens; on narrow screens only beside the
  // dots, so they never run through the row labels.
  const gridBottom = L.height - 8;
  const vline = (xx: string, attrs: string) => {
    if (!narrow) {
      p.push(`<line x1="${xx}" x2="${xx}" y1="${L.top - 6}" y2="${gridBottom}" ${attrs}/>`);
      return;
    }
    spec.rows.forEach((_, i) => {
      const cy = rowY(i);
      p.push(`<line x1="${xx}" x2="${xx}" y1="${(cy - 9).toFixed(1)}" y2="${(cy + 9).toFixed(1)}" ${attrs}/>`);
    });
  };

  for (const t of L.ticks) {
    const xx = x(t).toFixed(1);
    vline(xx, `stroke="${C.rule}"`);
    p.push(`<text x="${xx}" y="${L.top - 14}" text-anchor="middle" ${FONT} font-size="12" fill="${C.muted}">${esc(tickLabel(t))}</text>`);
  }

  // Comparison group: dashed black line.
  vline(x(spec.ref.value).toFixed(1), `stroke="${C.ink}" stroke-width="1.5" stroke-dasharray="4 3"`);

  spec.rows.forEach((r, i) => {
    const cy = rowY(i);
    if (narrow) {
      p.push(`<text x="0" y="${(cy - 14).toFixed(1)}" ${FONT} font-size="13" fill="${C.ink}">${esc(r.label)}</text>`);
    } else {
      p.push(`<text x="${L.x0 - 12}" y="${(cy + 4).toFixed(1)}" text-anchor="end" ${FONT} font-size="13" fill="${C.ink}">${esc(r.label)}</text>`);
    }
    const a = x(r.primary);
    const b = r.secondary === null ? null : x(r.secondary);
    if (b !== null) {
      p.push(`<line x1="${Math.min(a, b).toFixed(1)}" x2="${Math.max(a, b).toFixed(1)}" y1="${cy.toFixed(1)}" y2="${cy.toFixed(1)}" stroke="#B8B8B8" stroke-width="1.5"/>`);
      p.push(`<circle cx="${b.toFixed(1)}" cy="${cy.toFixed(1)}" r="5" fill="${C.second}"/>`);
    }
    p.push(`<circle cx="${a.toFixed(1)}" cy="${cy.toFixed(1)}" r="6" fill="${C.focus}"/>`);

    // Printed values on the right.
    const vx = L.x1 + 14;
    p.push(`<text x="${vx}" y="${(cy + 4).toFixed(1)}" ${FONT} font-size="13" font-weight="700" fill="${C.focus}">${esc(dotFmt(r.primary, spec.format))}</text>`);
    if (r.secondary !== null) {
      p.push(`<text x="${vx + (narrow ? 42 : 52)}" y="${(cy + 4).toFixed(1)}" ${FONT} font-size="13" font-weight="600" fill="${C.second}">${esc(dotFmt(r.secondary, spec.format))}</text>`);
    }
  });

  p.push('</svg>');
  return p.join('');
}
