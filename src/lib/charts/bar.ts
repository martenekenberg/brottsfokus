// Reusable horizontal bar chart: groups of one or more bars.
// Filled blue bar = the group. Outlined grey bar = comparison (population or control group).
// Orange = a second group. Lighter shades = an earlier period or a standardised value.
// Pure function: data + width in, SVG markup out. Runs at build time and in the browser.
import { scaleLinear } from 'd3';
import { formatPct, formatTimes } from '../format';

export interface Bar {
  /** Shown beside the bar. Empty when the group has a single bar. */
  label: string;
  value: number;
  kind: BarKind;
}

export type BarKind = 'focus' | 'focusMid' | 'focusLight' | 'second' | 'secondLight' | 'comparison';

/** Fill and text colour per bar kind. Text colours pass 4.5:1 on white. */
export const BAR_COLORS: Record<BarKind, { fill: string; text: string }> = {
  focus: { fill: '#1D4E89', text: '#1D4E89' },
  focusMid: { fill: '#4F78A8', text: '#1D4E89' },
  focusLight: { fill: '#9DB3CF', text: '#1D4E89' },
  second: { fill: '#C2410C', text: '#C2410C' },
  secondLight: { fill: '#E7A98C', text: '#C2410C' },
  comparison: { fill: '#FFFFFF', text: '#5C5C5C' },
};

export type BarFormat = 'pct1' | 'pct2' | 'x1';

export interface BarGroup {
  label: string;
  bars: Bar[];
}

export interface BarChartSpec {
  groups: BarGroup[];
  ariaLabel: string;
  /** Default pct1 (22,5 %). */
  format?: BarFormat;
  /** Fixed end of the scale, so small multiples can share one scale. */
  xMax?: number;
  /** The comparison group in risk charts: a dashed black line, e.g. at 1. */
  ref?: { value: number; label: string };
  /** Compact groups: bar labels are left out of the chart (a legend explains the colours)
   *  but still appear in the tooltip. */
  hideBarLabels?: boolean;
}

export const BAR_NARROW = 560;
const C = { focus: '#1D4E89', ink: '#121212', muted: '#5C5C5C', rule: '#E3E3E3' };
const FONT = 'font-family="Inter Variable, Inter, Arial, sans-serif"';

export function barFmt(v: number, f: BarFormat = 'pct1'): string {
  if (f === 'x1') return formatTimes(v, 1);
  return formatPct(v, f === 'pct2' ? 2 : 1);
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
  headers: { group: number; y: number; x: number; anchor: 'start' | 'end'; size: number }[];
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
  let max = spec.xMax ?? 0;
  if (spec.xMax === undefined) for (const g of spec.groups) for (const b of g.bars) max = Math.max(max, b.value);
  if (spec.ref) max = Math.max(max, spec.ref.value);
  const x = scaleLinear().domain([0, max || 1]).range([x0, width - valueSpace]);

  const headers: BarLayout['headers'] = [];
  const bars: Placed[] = [];
  const groupSpans: BarLayout['groupSpans'] = [];
  let y = 0;
  const compact = !!spec.hideBarLabels;
  spec.groups.forEach((g, gi) => {
    const top = y;
    const simple = isSimple(g);
    if (compact) {
      // Group name in the label column beside the first bar, or above the bars on narrow screens.
      y += 10;
      if (narrow) {
        y += 14;
        headers.push({ group: gi, y, x: 0, anchor: 'start', size: 13 });
        y += 8;
      } else {
        headers.push({ group: gi, y: y + 13, x: x0 - 12, anchor: 'end', size: 13 });
      }
      g.bars.forEach((_, bi) => {
        bars.push({ group: gi, bar: bi, y, labelY: y + 13 });
        y += barHeight + 4;
      });
      y += 8;
      groupSpans.push({ top, bottom: y });
      return;
    }
    if (!simple) {
      y += 20;
      headers.push({ group: gi, y, x: 0, anchor: 'start', size: 14 });
      y += 10;
    }
    g.bars.forEach((_, bi) => {
      // On narrow screens the label sits above the bar.
      const labelAbove = narrow;
      if (labelAbove) y += 16;
      bars.push({ group: gi, bar: bi, y, labelY: labelAbove ? y - 5 : y + 13 });
      y += barHeight + gap;
    });
    y += simple ? 2 : 14;
    groupSpans.push({ top, bottom: y });
    if (!simple && gi < spec.groups.length - 1) y += 4;
  });
  if (spec.ref) y += 18;
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
    p.push(`<text x="${h.x}" y="${h.y}" text-anchor="${h.anchor}" ${FONT} font-size="${h.size}" font-weight="600" fill="${C.ink}">${esc(spec.groups[h.group].label)}</text>`);
  }

  for (const b of L.bars) {
    const g = spec.groups[b.group];
    const bar = g.bars[b.bar];
    const label = isSimple(g) ? g.label : bar.label;
    const comparison = bar.kind === 'comparison';
    const col = BAR_COLORS[bar.kind];
    if (spec.hideBarLabels) {
      // No label: the legend explains the colours.
    } else if (L.narrow) {
      p.push(`<text x="0" y="${b.labelY}" ${FONT} font-size="13" fill="${comparison ? C.muted : C.ink}">${esc(label)}</text>`);
    } else {
      p.push(`<text x="${L.x0 - 12}" y="${b.labelY}" text-anchor="end" ${FONT} font-size="13" fill="${comparison ? C.muted : C.ink}">${esc(label)}</text>`);
    }
    const w = Math.max(1, L.x(bar.value) - L.x0);
    if (comparison) {
      p.push(`<rect x="${L.x0 + 0.75}" y="${b.y + 0.75}" width="${Math.max(0, w - 1.5).toFixed(1)}" height="${L.barHeight - 1.5}" fill="#FFFFFF" stroke="${C.muted}" stroke-width="1.5"/>`);
    } else {
      p.push(`<rect x="${L.x0}" y="${b.y}" width="${w.toFixed(1)}" height="${L.barHeight}" fill="${col.fill}"/>`);
    }
    p.push(
      `<text x="${(L.x0 + w + 8).toFixed(1)}" y="${b.y + 14}" ${FONT} font-size="13" font-weight="${comparison ? 600 : 700}" fill="${col.text}">${esc(barFmt(bar.value, spec.format))}</text>`,
    );
  }

  // Comparison group in risk charts: dashed black line with its label underneath.
  if (spec.ref) {
    const rx = L.x(spec.ref.value).toFixed(1);
    // Drawn only beside each bar so it never crosses a label.
    for (const b of L.bars) {
      p.push(`<line x1="${rx}" x2="${rx}" y1="${b.y - 3}" y2="${b.y + L.barHeight + 3}" stroke="${C.ink}" stroke-width="1.5" stroke-dasharray="4 3"/>`);
    }
    p.push(`<text x="${rx}" y="${L.height - 4}" text-anchor="middle" ${FONT} font-size="12" fill="${C.ink}">${esc(spec.ref.label)}</text>`);
  }

  p.push('</svg>');
  return p.join('');
}
