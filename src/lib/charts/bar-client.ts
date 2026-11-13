// Browser side of the bar chart: redraws at the container's width and shows a
// tooltip with every bar in the group under the pointer.
import { barFmt, layoutBarChart, renderBarChart, type BarChartSpec } from './bar';

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function tooltipHtml(spec: BarChartSpec, gi: number): string {
  const g = spec.groups[gi];
  const rows = g.bars
    .map((b) => {
      const swatch =
        b.kind === 'focus'
          ? '<span class="tt-swatch" style="background:#1D4E89;border-radius:0"></span>'
          : '<span class="tt-swatch" style="border:1.5px solid #5C5C5C;border-radius:0"></span>';
      const name = b.label || g.label;
      return `<div class="tt-row">${swatch}<span class="tt-name">${esc(name)}</span><span class="tt-val">${esc(barFmt(b.value))}</span></div>`;
    })
    .join('');
  const head = g.bars.length > 1 || g.bars[0].label ? `<div class="tt-head">${esc(g.label)}</div>` : '';
  return head + rows;
}

function setup(figure: HTMLElement): void {
  const dataEl = figure.querySelector<HTMLScriptElement>('script[type="application/json"]');
  const canvas = figure.querySelector<HTMLElement>('[data-canvas]');
  const tip = figure.querySelector<HTMLElement>('[data-tooltip]');
  if (!dataEl || !canvas || !tip) return;
  const spec = JSON.parse(dataEl.textContent ?? '{}') as BarChartSpec;
  let width = 0;

  const hide = () => {
    tip.hidden = true;
  };
  const draw = () => {
    const w = Math.round(canvas.clientWidth);
    if (!w || w === width) return;
    width = w;
    canvas.innerHTML = renderBarChart(spec, width);
  };
  draw();
  new ResizeObserver(draw).observe(canvas);

  const show = (ev: PointerEvent) => {
    const L = layoutBarChart(spec, width);
    const rect = canvas.getBoundingClientRect();
    const scale = rect.width / L.width;
    const py = (ev.clientY - rect.top) / scale;
    const gi = L.groupSpans.findIndex((s) => py >= s.top && py < s.bottom);
    if (gi < 0) return hide();
    tip.innerHTML = tooltipHtml(spec, gi);
    tip.hidden = false;
    const tw = tip.offsetWidth;
    const th = tip.offsetHeight;
    const px = ev.clientX - rect.left;
    let left = px + 16;
    if (left + tw > rect.width) left = px - 16 - tw;
    left = Math.max(0, Math.min(left, rect.width - tw));
    let top = L.groupSpans[gi].bottom * scale;
    if (top + th > rect.height) top = L.groupSpans[gi].top * scale - th;
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

document.querySelectorAll<HTMLElement>('[data-bar-chart]').forEach(setup);
