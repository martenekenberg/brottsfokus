// Browser side of the bar chart: tooltip with every bar in the group under the pointer.
import { mountCharts } from './client';
import { BAR_COLORS, barFmt, layoutBarChart, renderBarChart, type BarChartSpec } from './bar';
import { esc } from './svg';

function tooltipHtml(spec: BarChartSpec, gi: number): string {
  const g = spec.groups[gi];
  const rows = g.bars
    .map((b) => {
      const swatch =
        b.kind === 'comparison'
          ? '<span class="tt-swatch" style="border:1.5px solid #5C5C5C;border-radius:0"></span>'
          : `<span class="tt-swatch" style="background:${BAR_COLORS[b.kind].fill};border-radius:0"></span>`;
      const name = b.label || g.label;
      return `<div class="tt-row">${swatch}<span class="tt-name">${esc(name)}</span><span class="tt-val">${esc(barFmt(b.value, spec.format))}</span></div>`;
    })
    .join('');
  const head = g.bars.length > 1 || g.bars[0].label ? `<div class="tt-head">${esc(g.label)}</div>` : '';
  return head + rows;
}

mountCharts<BarChartSpec>({
  attr: 'data-bar-chart',
  offset: 16,
  render: renderBarChart,
  count: (spec) => spec.groups.length,
  hit(spec, width, _px, py) {
    return layoutBarChart(spec, width).groupSpans.findIndex((s) => py >= s.top && py < s.bottom);
  },
  tooltip: tooltipHtml,
  anchor(spec, width, gi) {
    const span = layoutBarChart(spec, width).groupSpans[gi];
    return { top: span.bottom, flipTop: span.top };
  },
});
