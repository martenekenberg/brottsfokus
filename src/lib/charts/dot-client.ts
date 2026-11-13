// Browser side of the dot plot: redraws at the container's width, swaps data on
// 'chart:update', and shows a tooltip for the row under the pointer.
import { dotFmt, layoutDotChart, renderDotChart, type DotChartSpec } from './dot';

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function tooltipHtml(spec: DotChartSpec, i: number): string {
  const r = spec.rows[i];
  const row = (color: string, name: string, value: string) =>
    `<div class="tt-row"><span class="tt-swatch" style="background:${color}"></span><span class="tt-name">${esc(name)}</span><span class="tt-val">${value}</span></div>`;
  let html = `<div class="tt-head">${esc(r.label)}</div>`;
  if (r.detail) html += `<div class="tt-detail">${esc(r.detail)}</div>`;
  html += row('#1D4E89', spec.primaryLabel, esc(dotFmt(r.primary, spec.format)));
  if (spec.secondaryLabel) {
    html += row(
      spec.secondaryStyle === 'population' ? '#FFFFFF;border:2px solid #8A8A8A' : '#C2410C',
      spec.secondaryLabel,
      r.secondary === null ? '<span class="tt-missing">uppgift saknas</span>' : esc(dotFmt(r.secondary, spec.format)),
    );
  }
  if (spec.ref) {
    html += `<div class="tt-row"><span class="tt-swatch tt-dash" style="border-color:#121212"></span><span class="tt-name">${esc(spec.ref.label)}</span><span class="tt-val">${esc(dotFmt(spec.ref.value, spec.format))}</span></div>`;
  }
  return html;
}

function setup(figure: HTMLElement): void {
  const dataEl = figure.querySelector<HTMLScriptElement>('script[type="application/json"]');
  const canvas = figure.querySelector<HTMLElement>('[data-canvas]');
  const tip = figure.querySelector<HTMLElement>('[data-tooltip]');
  if (!dataEl || !canvas || !tip) return;
  let spec = JSON.parse(dataEl.textContent ?? '{}') as DotChartSpec;
  let width = 0;

  const hide = () => {
    tip.hidden = true;
  };
  const draw = () => {
    const w = Math.round(canvas.clientWidth);
    if (!w || w === width) return;
    width = w;
    canvas.innerHTML = renderDotChart(spec, width);
  };
  draw();
  new ResizeObserver(draw).observe(canvas);

  figure.addEventListener('chart:update', (ev) => {
    spec = (ev as CustomEvent<DotChartSpec>).detail;
    width = 0;
    hide();
    draw();
  });

  const show = (ev: PointerEvent) => {
    const L = layoutDotChart(spec, width);
    const rect = canvas.getBoundingClientRect();
    const scale = rect.width / L.width;
    const py = (ev.clientY - rect.top) / scale;
    const i = Math.floor((py - L.top) / L.rowHeight);
    if (i < 0 || i >= spec.rows.length) return hide();
    tip.innerHTML = tooltipHtml(spec, i);
    tip.hidden = false;
    const tw = tip.offsetWidth;
    const th = tip.offsetHeight;
    const px = ev.clientX - rect.left;
    let left = px + 16;
    if (left + tw > rect.width) left = px - 16 - tw;
    left = Math.max(0, Math.min(left, rect.width - tw));
    // Below the row, or above it near the bottom of the chart.
    let top = (L.rowY(i) + 14) * scale;
    if (top + th > rect.height) top = (L.rowY(i) - 14) * scale - th;
    tip.style.left = `${left}px`;
    tip.style.top = `${Math.max(0, top)}px`;
  };
  canvas.addEventListener('pointermove', show);
  canvas.addEventListener('pointerdown', show);
  canvas.addEventListener('pointerleave', (ev) => {
    if (ev.pointerType !== 'touch') hide();
  });
  document.addEventListener('pointerdown', (ev) => {
    if (!figure.contains(ev.target as Node)) hide();
  });
}

document.querySelectorAll<HTMLElement>('[data-dot-chart]').forEach(setup);
