// Browser side of the line chart: tooltip with every series for the year under the pointer.
import { mountCharts } from './client';
import { fmt, layoutLineChart, renderLineChart, type LineChartSpec } from './line';
import { esc } from './svg';
import { missingText } from '../i18n';

function tooltipHtml(spec: LineChartSpec, i: number): string {
  const rows = spec.series
    .map((s) => {
      const v = s.values[i];
      const value = v === null ? `<span class="tt-missing">${esc(missingText(spec.lang))}</span>` : esc(fmt(v, s.format, spec.lang));
      const swatch = s.dashed
        ? `<span class="tt-swatch tt-dash" style="border-color:${s.color}"></span>`
        : `<span class="tt-swatch" style="background:${s.color}"></span>`;
      return `<div class="tt-row">${swatch}<span class="tt-name">${esc(s.label)}</span><span class="tt-val">${value}</span></div>`;
    })
    .join('');
  return `<div class="tt-head">${spec.years[i]}</div>${rows}`;
}

mountCharts<LineChartSpec>({
  attr: 'data-line-chart',
  offset: 12,
  render: renderLineChart,
  count: (spec) => spec.years.length,
  hit(spec, width, px) {
    const L = layoutLineChart(spec, width);
    if (px < L.left - 20 || px > L.width - L.right + 20) return -1;
    let best = 0;
    spec.years.forEach((yr, i) => {
      if (Math.abs(L.x(yr) - px) < Math.abs(L.x(spec.years[best]) - px)) best = i;
    });
    return best;
  },
  tooltip: tooltipHtml,
  anchor(spec, width, i) {
    const L = layoutLineChart(spec, width);
    return { x: L.x(spec.years[i]), top: L.top };
  },
  // Guide line for the hovered year, drawn into the fresh SVG.
  afterDraw(canvas) {
    const svg = canvas.querySelector('svg');
    if (!svg) return;
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    g.setAttribute('stroke', '#121212');
    g.setAttribute('stroke-width', '1');
    g.setAttribute('visibility', 'hidden');
    g.setAttribute('data-guide', '');
    svg.insertBefore(g, svg.firstChild);
  },
  onShow(canvas, spec, width, i) {
    const L = layoutLineChart(spec, width);
    const guide = canvas.querySelector('[data-guide]');
    if (!guide) return;
    const gx = String(L.x(spec.years[i]));
    guide.setAttribute('x1', gx);
    guide.setAttribute('x2', gx);
    guide.setAttribute('y1', String(L.top));
    guide.setAttribute('y2', String(L.height - L.bottom));
    guide.setAttribute('visibility', 'visible');
  },
  onHide(canvas) {
    canvas.querySelector('[data-guide]')?.setAttribute('visibility', 'hidden');
  },
});
