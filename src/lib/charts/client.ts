// Browser side shared by all chart types: redraw at the container's width, swap data on
// 'chart:update', and show a tooltip for the year or row under the pointer. The same
// tooltip can be stepped through with the arrow keys, and is then also read out to
// screen readers.

export interface ChartKind<S> {
  /** Attribute on the <figure>, e.g. 'data-line-chart'. */
  attr: string;
  render(spec: S, width: number): string;
  /** How many items (years, rows or groups) the tooltip can point at. */
  count(spec: S): number;
  /** Item under a point given in viewBox units, or -1. */
  hit(spec: S, width: number, x: number, y: number): number;
  tooltip(spec: S, index: number): string;
  /**
   * Tooltip position in viewBox units. `x` pins it horizontally (omit to follow the pointer).
   * It is placed at `top`; if it would run past the bottom it goes above `flipTop` instead.
   */
  anchor(spec: S, width: number, index: number): { x?: number; top: number; flipTop?: number };
  /** Distance between the pointer (or `x`) and the tooltip. */
  offset: number;
  afterDraw?(canvas: HTMLElement): void;
  onShow?(canvas: HTMLElement, spec: S, width: number, index: number): void;
  onHide?(canvas: HTMLElement): void;
}

function tooltipText(tip: HTMLElement): string {
  return [...tip.children]
    .map((el) => {
      if (!el.classList.contains('tt-row')) return el.textContent ?? '';
      const name = el.querySelector('.tt-name')?.textContent ?? '';
      const value = el.querySelector('.tt-val')?.textContent ?? '';
      return `${name}: ${value}`;
    })
    .join('. ');
}

function setup<S>(figure: HTMLElement, kind: ChartKind<S>): void {
  const dataEl = figure.querySelector<HTMLScriptElement>('script[type="application/json"]');
  const canvas = figure.querySelector<HTMLElement>('[data-canvas]');
  const tip = figure.querySelector<HTMLElement>('[data-tooltip]');
  const live = figure.querySelector<HTMLElement>('[data-live]');
  if (!dataEl || !canvas || !tip) return;
  let spec = JSON.parse(dataEl.textContent ?? '{}') as S;
  let width = 0;
  /** Item last shown with the keyboard, or -1. */
  let current = -1;

  const hide = () => {
    tip.hidden = true;
    kind.onHide?.(canvas);
  };
  const draw = () => {
    const w = Math.round(canvas.clientWidth);
    if (!w || w === width) return;
    width = w;
    canvas.innerHTML = kind.render(spec, width);
    kind.afterDraw?.(canvas);
  };
  draw();
  new ResizeObserver(() => {
    const before = width;
    draw();
    if (width !== before) hide();
  }).observe(canvas);

  // Other scripts swap the data with: figure.dispatchEvent(new CustomEvent('chart:update', { detail: spec }))
  figure.addEventListener('chart:update', (ev) => {
    spec = (ev as CustomEvent<S>).detail;
    width = 0;
    current = -1;
    hide();
    draw();
  });

  /** Show the tooltip for one item. `pointerX` is in CSS pixels from the canvas's left edge. */
  const show = (index: number, pointerX: number | null) => {
    if (!width) return;
    const rect = canvas.getBoundingClientRect();
    const scale = rect.width / width;
    const a = kind.anchor(spec, width, index);
    kind.onShow?.(canvas, spec, width, index);
    tip.innerHTML = kind.tooltip(spec, index);
    tip.hidden = false;
    const tw = tip.offsetWidth;
    const th = tip.offsetHeight;
    const px = a.x !== undefined ? a.x * scale : (pointerX ?? rect.width / 2);
    let left = px + kind.offset;
    if (left + tw > rect.width) left = px - kind.offset - tw;
    left = Math.max(0, Math.min(left, rect.width - tw));
    let top = a.top * scale;
    if (a.flipTop !== undefined && top + th > rect.height) top = a.flipTop * scale - th;
    tip.style.left = `${left}px`;
    tip.style.top = `${Math.max(0, top)}px`;
  };

  const onPointer = (ev: PointerEvent) => {
    if (!width) return;
    const rect = canvas.getBoundingClientRect();
    const scale = rect.width / width;
    const index = kind.hit(spec, width, (ev.clientX - rect.left) / scale, (ev.clientY - rect.top) / scale);
    if (index < 0) return hide();
    show(index, ev.clientX - rect.left);
  };
  canvas.addEventListener('pointermove', onPointer);
  // On touch screens a tap shows the values; the tooltip stays until the next tap elsewhere.
  canvas.addEventListener('pointerdown', onPointer);
  canvas.addEventListener('pointerleave', (ev) => {
    if (ev.pointerType !== 'touch') hide();
  });
  document.addEventListener('pointerdown', (ev) => {
    if (!figure.contains(ev.target as Node)) hide();
  });

  // Keyboard: arrow keys step through the years or rows.
  canvas.tabIndex = 0;
  canvas.setAttribute('role', 'group');
  canvas.setAttribute('aria-label', 'Diagram. Använd piltangenterna för att läsa värdena ett i taget.');
  canvas.addEventListener('keydown', (ev) => {
    const n = kind.count(spec);
    if (!n) return;
    let next: number;
    if (ev.key === 'ArrowRight' || ev.key === 'ArrowDown') next = current < 0 ? 0 : Math.min(n - 1, current + 1);
    else if (ev.key === 'ArrowLeft' || ev.key === 'ArrowUp') next = current < 0 ? n - 1 : Math.max(0, current - 1);
    else if (ev.key === 'Home') next = 0;
    else if (ev.key === 'End') next = n - 1;
    else if (ev.key === 'Escape') return hide();
    else return;
    ev.preventDefault();
    current = next;
    show(current, null);
    tip.scrollIntoView({ block: 'nearest' });
    if (live) live.textContent = tooltipText(tip);
  });
  canvas.addEventListener('blur', () => {
    current = -1;
    hide();
  });
}

export function mountCharts<S>(kind: ChartKind<S>): void {
  document.querySelectorAll<HTMLElement>(`[${kind.attr}]`).forEach((figure) => setup(figure, kind));
}
