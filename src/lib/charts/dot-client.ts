// Browser side of the dot plot: tooltip for the row under the pointer.
import { mountCharts } from './client';
import { dotFmt, layoutDotChart, renderDotChart, type DotChartSpec } from './dot';
import { esc } from './svg';
import { missingText } from '../i18n';

function tooltipHtml(spec: DotChartSpec, i: number): string {
  const r = spec.rows[i];
  const row = (color: string, name: string, value: string) =>
    `<div class="tt-row"><span class="tt-swatch" style="background:${color}"></span><span class="tt-name">${esc(name)}</span><span class="tt-val">${value}</span></div>`;
  let html = `<div class="tt-head">${esc(r.label)}</div>`;
  if (r.detail) html += `<div class="tt-detail">${esc(r.detail)}</div>`;
  html += row('#1D4E89', spec.primaryLabel, esc(dotFmt(r.primary, spec.format, spec.lang)));
  if (spec.secondaryLabel) {
    html += row(
      spec.secondaryStyle === 'population' ? '#FFFFFF;border:2px solid #8A8A8A' : '#C2410C',
      spec.secondaryLabel,
      r.secondary === null
        ? `<span class="tt-missing">${esc(missingText(spec.lang))}</span>`
        : esc(dotFmt(r.secondary, spec.format, spec.lang)),
    );
  }
  if (spec.ref) {
    html += `<div class="tt-row"><span class="tt-swatch tt-dash" style="border-color:#121212"></span><span class="tt-name">${esc(spec.ref.label)}</span><span class="tt-val">${esc(dotFmt(spec.ref.value, spec.format, spec.lang))}</span></div>`;
  }
  return html;
}

mountCharts<DotChartSpec>({
  attr: 'data-dot-chart',
  offset: 16,
  render: renderDotChart,
  count: (spec) => spec.rows.length,
  hit(spec, width, _px, py) {
    const L = layoutDotChart(spec, width);
    const i = Math.floor((py - L.top) / L.rowHeight);
    return i < 0 || i >= spec.rows.length ? -1 : i;
  },
  tooltip: tooltipHtml,
  // Below the row, or above it near the bottom of the chart.
  anchor(spec, width, i) {
    const L = layoutDotChart(spec, width);
    return { top: L.rowY(i) + 14, flipTop: L.rowY(i) - 14 };
  },
});
