// Reusable line chart. Pure function: data + width in, SVG markup out.
// Runs at build time (static fallback) and in the browser (resize + tooltip).
import { line, scaleLinear } from 'd3';
import { formatNumber, formatPct, formatTimes } from '../format';

/** pct = 22 %, pct1 = 7,8 %, num1 = 14,3, num2 = 0,14, x1 = 2,5× */
export type ValueFormat = 'pct' | 'pct1' | 'num1' | 'num2' | 'x1';

export interface LineSeries {
  id: string;
  /** Full name, used in the tooltip. */
  label: string;
  /** Text after the value at the line's end on wide screens. Empty = value only. */
  endLabel: string;
  /** Same, for narrow screens. */
  endLabelShort: string;
  color: string;
  /** Colour for printed text. Must pass 4.5:1 on white. */
  textColor: string;
  strokeWidth: number;
  dashed?: boolean;
  dotRadius: number;
  /** One value per year in `years`. null = no value, drawn as a gap. */
  values: (number | null)[];
  /** Years where the value is also printed next to the point. */
  annotate?: number[];
  format: ValueFormat;
}

export interface LineChartSpec {
  years: number[];
  series: LineSeries[];
  /** Fixed top of the y axis. Omit to fit the data. */
  yMax?: number;
  /** Fixed gap between y gridlines. Omit to choose automatically. */
  yTickStep?: number;
  yFormat: ValueFormat;
  ariaLabel: string;
}

export const NARROW = 560;

export function fmt(value: number, format: ValueFormat): string {
  if (format === 'pct') return formatPct(value, 0);
  if (format === 'pct1') return formatPct(value, 1);
  if (format === 'num2') return formatNumber(value, 2);
  if (format === 'x1') return formatTimes(value, 1);
  return formatNumber(value, 1);
}

/** Axis label: same unit as the data, but only as many decimals as the tick step needs. */
function axisLabel(value: number, format: ValueFormat, step: number): string {
  const decimals = Math.max(0, Math.ceil(-Math.log10(step) - 1e-9));
  if (format === 'pct' || format === 'pct1') return formatPct(value, decimals);
  if (format === 'x1') return formatTimes(value, decimals);
  return formatNumber(value, decimals);
}

/** Y axis top and tick values: fixed if the spec says so, else fitted to the data. */
export function yTicks(spec: LineChartSpec): { max: number; step: number; ticks: number[] } {
  if (spec.yMax !== undefined && spec.yTickStep !== undefined) {
    const ticks: number[] = [];
    for (let v = 0; v <= spec.yMax + 1e-9; v += spec.yTickStep) ticks.push(v);
    return { max: spec.yMax, step: spec.yTickStep, ticks };
  }
  let dataMax = 0;
  for (const s of spec.series) for (const v of s.values) if (v !== null && v > dataMax) dataMax = v;
  const scale = scaleLinear().domain([0, dataMax || 1]).nice(5);
  const ticks = scale.ticks(5);
  const step = ticks.length > 1 ? ticks[1] - ticks[0] : 1;
  return { max: scale.domain()[1], step, ticks };
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Rough text width for Inter at 12–13px. Good enough for layout margins. */
function textWidth(s: string, size: number): number {
  return s.length * size * 0.58;
}

export interface LineLayout {
  width: number;
  height: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
  x: (year: number) => number;
  y: (value: number) => number;
}

function endText(s: LineSeries, v: number, narrow: boolean): string {
  const name = narrow ? s.endLabelShort : s.endLabel;
  return name ? `${fmt(v, s.format)} ${name}` : fmt(v, s.format);
}

function lastDefined(s: LineSeries, years: number[]): { year: number; value: number } | null {
  for (let i = s.values.length - 1; i >= 0; i--) {
    const v = s.values[i];
    if (v !== null) return { year: years[i], value: v };
  }
  return null;
}

/** Spread labels apart vertically so none overlap, keeping order. */
export function dodge(ys: number[], gap: number, min: number, max: number): number[] {
  const order = ys.map((y, i) => ({ y, i })).sort((a, b) => a.y - b.y);
  const out = order.map((o) => o.y);
  for (let k = 1; k < out.length; k++) out[k] = Math.max(out[k], out[k - 1] + gap);
  const overflow = out[out.length - 1] - max;
  if (overflow > 0) {
    out[out.length - 1] = max;
    for (let k = out.length - 2; k >= 0; k--) out[k] = Math.min(out[k], out[k + 1] - gap);
  }
  for (let k = 0; k < out.length; k++) out[k] = Math.max(out[k], min + k * gap);
  const result = new Array<number>(ys.length);
  order.forEach((o, k) => (result[o.i] = out[k]));
  return result;
}

export function layoutLineChart(spec: LineChartSpec, width: number): LineLayout {
  const narrow = width < NARROW;
  const height = narrow ? 320 : 400;
  const longest = Math.max(
    ...spec.series.map((s) => {
      const last = lastDefined(s, spec.years);
      return last ? textWidth(endText(s, last.value, narrow), 13) : 0;
    }),
  );
  const left = narrow ? 44 : 48;
  const right = Math.ceil(longest) + 14;
  const top = 16;
  const bottom = 32;
  const x0 = spec.years[0];
  const x1 = spec.years[spec.years.length - 1];
  const x = scaleLinear().domain([x0, x1]).range([left, width - right]);
  const y = scaleLinear().domain([0, yTicks(spec).max]).range([height - bottom, top]);
  return { width, height, left, right, top, bottom, x, y };
}

function xTickYears(years: number[], innerWidth: number): number[] {
  const perLabel = 44;
  const step = Math.max(1, Math.ceil((years.length * perLabel) / innerWidth));
  const ticks = years.filter((_, i) => i % step === 0);
  const last = years[years.length - 1];
  if (ticks[ticks.length - 1] !== last) {
    // Drop the previous tick if it would collide with the final year.
    if (ticks.length > 1 && last - ticks[ticks.length - 1] < step) ticks.pop();
    ticks.push(last);
  }
  return ticks;
}

export function renderLineChart(spec: LineChartSpec, width: number): string {
  const narrow = width < NARROW;
  const L = layoutLineChart(spec, width);
  const { height, left, top, bottom, x, y } = L;
  const plotRight = width - L.right;
  const font = 'font-family="Inter Variable, Inter, Arial, sans-serif"';
  const parts: string[] = [];

  parts.push(
    `<svg viewBox="0 0 ${width} ${height}" width="100%" role="img" aria-label="${esc(spec.ariaLabel)}" style="display:block;overflow:visible" font-variant-numeric="tabular-nums">`,
  );

  // Grid and y axis.
  const yt = yTicks(spec);
  for (const v of yt.ticks) {
    const yy = y(v).toFixed(1);
    parts.push(`<line x1="${left}" x2="${plotRight}" y1="${yy}" y2="${yy}" stroke="#E3E3E3"/>`);
    parts.push(
      `<text x="${left - 8}" y="${(y(v) + 4).toFixed(1)}" text-anchor="end" ${font} font-size="12" fill="#5C5C5C">${esc(axisLabel(v, spec.yFormat, yt.step))}</text>`,
    );
  }

  // X axis labels.
  for (const yr of xTickYears(spec.years, plotRight - left)) {
    parts.push(
      `<text x="${x(yr).toFixed(1)}" y="${height - bottom + 22}" text-anchor="middle" ${font} font-size="12" fill="#5C5C5C">${yr}</text>`,
    );
  }

  // Series: population first so it sits underneath.
  const ordered = [...spec.series].sort((a, b) => Number(!!b.dashed) - Number(!!a.dashed));
  for (const s of ordered) {
    const pts = spec.years.map((yr, i) => ({ yr, v: s.values[i] }));
    const path = line<{ yr: number; v: number | null }>()
      .defined((d) => d.v !== null)
      .x((d) => x(d.yr))
      .y((d) => y(d.v as number))(pts);
    if (path) {
      parts.push(
        `<path d="${path}" fill="none" stroke="${s.color}" stroke-width="${s.strokeWidth}" stroke-linejoin="round" stroke-linecap="round"${s.dashed ? ' stroke-dasharray="5 4"' : ''}/>`,
      );
    }
    for (const p of pts) {
      if (p.v === null || s.dotRadius === 0) continue;
      parts.push(`<circle cx="${x(p.yr).toFixed(1)}" cy="${y(p.v).toFixed(1)}" r="${s.dotRadius}" fill="${s.color}"/>`);
    }
    for (const yr of s.annotate ?? []) {
      const i = spec.years.indexOf(yr);
      const v = i >= 0 ? s.values[i] : null;
      if (v === null) continue;
      parts.push(
        `<text x="${x(yr).toFixed(1)}" y="${(y(v) - 10).toFixed(1)}" text-anchor="middle" ${font} font-size="13" font-weight="700" fill="${s.textColor}">${esc(fmt(v, s.format))}</text>`,
      );
    }
  }

  // End labels, spread apart so they never overlap.
  const ends = spec.series
    .map((s) => ({ s, last: lastDefined(s, spec.years) }))
    .filter((e): e is { s: LineSeries; last: { year: number; value: number } } => e.last !== null);
  const ys = dodge(
    ends.map((e) => y(e.last.value) + 4),
    15,
    top + 4,
    height - bottom,
  );
  ends.forEach((e, k) => {
    parts.push(
      `<text x="${(x(e.last.year) + 8).toFixed(1)}" y="${ys[k].toFixed(1)}" ${font} font-size="13" font-weight="700" fill="${e.s.textColor}">${esc(endText(e.s, e.last.value, narrow))}</text>`,
    );
  });

  parts.push('</svg>');
  return parts.join('');
}
