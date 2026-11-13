// Browser side of the line chart: redraws at the container's width and adds
// a tooltip showing every series for the year under the pointer.
import { fmt, layoutLineChart, renderLineChart, type LineChartSpec } from './line';

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function tooltipHtml(spec: LineChartSpec, i: number): string {
  const rows = spec.series
    .map((s) => {
      const v = s.values[i];
      const value = v === null ? '<span class="tt-missing">uppgift saknas</span>' : esc(fmt(v, s.format));
      const swatch = s.dashed
        ? `<span class="tt-swatch tt-dash" style="border-color:${s.color}"></span>`
        : `<span class="tt-swatch" style="background:${s.color}"></span>`;
      return `<div class="tt-row">${swatch}<span class="tt-name">${esc(s.label)}</span><span class="tt-val">${value}</span></div>`;
    })
    .join('');
  return `<div class="tt-head">${spec.years[i]}</div>${rows}`;
}

function setup(figure: HTMLElement): void {
  const dataEl = figure.querySelector<HTMLScriptElement>('script[type="application/json"]');
  const canvas = figure.querySelector<HTMLElement>('[data-canvas]');
  const tip = figure.querySelector<HTMLElement>('[data-tooltip]');
  if (!dataEl || !canvas || !tip) return;
  const spec = JSON.parse(dataEl.textContent ?? '{}') as LineChartSpec;

  let width = 0;
  const draw = () => {
    const w = Math.round(canvas.clientWidth);
    if (!w || w === width) return;
    width = w;
    canvas.innerHTML = renderLineChart(spec, width);
    // Guide line for the hovered year, drawn into the fresh SVG.
    const svg = canvas.querySelector('svg');
    if (svg) {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      g.setAttribute('stroke', '#121212');
      g.setAttribute('stroke-width', '1');
      g.setAttribute('visibility', 'hidden');
      g.setAttribute('data-guide', '');
      svg.insertBefore(g, svg.firstChild);
    }
  };
  draw();
  new ResizeObserver(draw).observe(canvas);

  const hide = () => {
    tip.hidden = true;
    canvas.querySelector('[data-guide]')?.setAttribute('visibility', 'hidden');
  };

  const show = (ev: PointerEvent) => {
    const L = layoutLineChart(spec, width);
    const rect = canvas.getBoundingClientRect();
    const scale = rect.width / L.width;
    const px = (ev.clientX - rect.left) / scale;
    if (px < L.left - 20 || px > L.width - L.right + 20) return hide();
    let best = 0;
    spec.years.forEach((yr, i) => {
      if (Math.abs(L.x(yr) - px) < Math.abs(L.x(spec.years[best]) - px)) best = i;
    });
    const gx = L.x(spec.years[best]);
    const guide = canvas.querySelector('[data-guide]');
    if (guide) {
      guide.setAttribute('x1', String(gx));
      guide.setAttribute('x2', String(gx));
      guide.setAttribute('y1', String(L.top));
      guide.setAttribute('y2', String(L.height - L.bottom));
      guide.setAttribute('visibility', 'visible');
    }
    tip.innerHTML = tooltipHtml(spec, best);
    tip.hidden = false;
    // Keep the tooltip inside the chart area.
    const tw = tip.offsetWidth;
    const gxPx = gx * scale;
    let left = gxPx + 12;
    if (left + tw > rect.width) left = gxPx - 12 - tw;
    left = Math.max(0, Math.min(left, rect.width - tw));
    tip.style.left = `${left}px`;
    tip.style.top = `${L.top * scale}px`;
  };
  canvas.addEventListener('pointermove', show);
  // On touch screens a tap shows the year; the tooltip stays until the next tap elsewhere.
  canvas.addEventListener('pointerdown', show);
  canvas.addEventListener('pointerleave', (ev) => {
    if (ev.pointerType !== 'touch') hide();
  });
  document.addEventListener('pointerdown', (ev) => {
    if (!figure.contains(ev.target as Node)) hide();
  });
}

document.querySelectorAll<HTMLElement>('[data-line-chart]').forEach(setup);
