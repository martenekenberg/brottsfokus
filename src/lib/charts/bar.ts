// Reusable horizontal bar chart: groups of one or more bars.
// Filled blue bar = the group. Outlined grey bar = comparison (population or control group).
// Pure function: data + width in, SVG markup out. Runs at build time and in the browser.
import { scaleLinear } from 'd3';
import { formatPct } from '../format';

export interface Bar {
  /** Shown beside the bar. Empty when the group has a single bar. */
  label: string;
  value: number;
  kind: 'focus' | 'comparison';
}

export interface BarGroup {
  label: string;
  bars: Bar[];
}

export interface BarChartSpec {
  groups: BarGroup[];
  ariaLabel: string;
}

export const BAR_NARROW = 560;
const C = { focus: '#1D4E89', ink: '#121212', muted: '#5C5C5C', rule: '#E3E3E3' };
const FONT = 'font-family="Inter Variable, Inter, Arial, sans-serif"';

export function barFmt(v: number): string {
  return formatPct(v, 1);
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

interface Placed {
  group: number;
  bar: number;
  /** Top of the bar. */
  y: number;
  /** Baseline for a label above the bar (narrow, or group headers). */
  labelY: number;
}

export interface BarLayout {
  width: number;
  height: number;
  narrow: boolean;
  x0: number;
  x: (v: number) => number;
  barHeight: number;
  headers: { group: number; y: number }[];
  bars: Placed[];
  /** Vertical extent of each group, for the tooltip. */
  groupSpans: { top: number; bottom: number }[];
}

function isSimple(g: BarGroup): boolean {
  return g.bars.length === 1 && g.bars[0].label === '';
}

export function layoutBarChart(spec: BarChartSpec, width: number): BarLayout {
  const narrow = width < BAR_NARROW;
  const barHeight = 18;
  const gap = narrow ? 10 : 8;
  const labelCol = narrow ? 0 : Math.min(300, Math.round(width * 0.3));
  const x0 = narrow ? 0 : labelCol + 12;
  const valueSpace = 64;
  let max = 0;
  for (const g of spec.groups) for (const b of g.bars) max = Math.max(max, b.value);
  const x = scaleLinear().domain([0, max || 1]).range([x0, width - valueSpace]);

  const headers: BarLayout['headers'] = [];
  const bars: Placed[] = [];
  const groupSpans: BarLayout['groupSpans'] = [];
  let y = 0;
  spec.groups.forEach((g, gi) => {
    const top = y;
    const simple = isSimple(g);
    if (!simple) {
      y += 20;
      headers.push({ group: gi, y });
      y += 10;
    }
    g.bars.forEach((_, bi) => {
      // On narrow screens (and for single bars) the label sits above the bar.
      const labelAbove = narrow;
      if (labelAbove) y += 16;
      bars.push({ group: gi, bar: bi, y, labelY: labelAbove ? y - 5 : y + 13 });
      y += barHeight + gap;
    });
    y += simple ? 2 : 14;
    groupSpans.push({ top, bottom: y });
    if (!simple && gi < spec.groups.length - 1) y += 4;
  });
  return { width, height: y, narrow, x0, x, barHeight, headers, bars, groupSpans };
}

export function renderBarChart(spec: BarChartSpec, width: number): string {
  const L = layoutBarChart(spec, width);
  const p: string[] = [];
  p.push(
    `<svg viewBox="0 0 ${width} ${L.height}" width="100%" role="img" aria-label="${esc(spec.ariaLabel)}" style="display:block" font-variant-numeric="tabular-nums">`,
  );

  // Group headers and a thin divider between groups.
  for (const h of L.headers) {
    if (h.group > 0) {
      const lineY = L.groupSpans[h.group].top - 2;
      p.push(`<line x1="0" x2="${width}" y1="${lineY}" y2="${lineY}" stroke="${C.rule}"/>`);
    }
    p.push(`<text x="0" y="${h.y}" ${FONT} font-size="14" font-weight="600" fill="${C.ink}">${esc(spec.groups[h.group].label)}</text>`);
  }

  for (const b of L.bars) {
    const g = spec.groups[b.group];
    const bar = g.bars[b.bar];
    const label = isSimple(g) ? g.label : bar.label;
    const focus = bar.kind === 'focus';
    if (L.narrow) {
      p.push(`<text x="0" y="${b.labelY}" ${FONT} font-size="13" fill="${focus ? C.ink : C.muted}">${esc(label)}</text>`);
    } else {
      p.push(`<text x="${L.x0 - 12}" y="${b.labelY}" text-anchor="end" ${FONT} font-size="13" fill="${focus ? C.ink : C.muted}">${esc(label)}</text>`);
    }
    const w = Math.max(1, L.x(bar.value) - L.x0);
    if (focus) {
      p.push(`<rect x="${L.x0}" y="${b.y}" width="${w.toFixed(1)}" height="${L.barHeight}" fill="${C.focus}"/>`);
    } else {
      p.push(`<rect x="${L.x0 + 0.75}" y="${b.y + 0.75}" width="${Math.max(0, w - 1.5).toFixed(1)}" height="${L.barHeight - 1.5}" fill="#FFFFFF" stroke="${C.muted}" stroke-width="1.5"/>`);
    }
    p.push(
      `<text x="${(L.x0 + w + 8).toFixed(1)}" y="${b.y + 14}" ${FONT} font-size="13" font-weight="${focus ? 700 : 600}" fill="${focus ? C.focus : C.muted}">${esc(barFmt(bar.value))}</text>`,
    );
  }

  p.push('</svg>');
  return p.join('');
}
