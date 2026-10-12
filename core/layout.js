import { get, subscribe } from './storage.js';
import { LAYOUT_WIDGETS } from './stage3-schema.js';
let off;
export const defaultLayout = () => Object.fromEntries(LAYOUT_WIDGETS.map((id, i) => [id, {
  x: 0,
  y: i * 4,
  w: 12,
  h: 4
}]));
/** Apply the user's grid only to dashboard widgets; mobile keeps a readable stack. */
export function renderLayout() {
  const layout = get().layout,
    custom = Object.keys(layout).length > 0;
  document.querySelector('.centerpiece')?.classList.toggle('custom-layout', custom);
  for (const id of LAYOUT_WIDGETS) {
    const node = document.getElementById(id);
    if (!node) continue;
    const p = layout[id];
    node.style.gridColumn = p ? `${p.x + 1} / span ${p.w}` : '';
    node.style.gridRow = p ? `${p.y + 1} / span ${p.h}` : '';
    node.style.order = p ? String(p.y * 12 + p.x) : '';
  }
}
export function init() {
  renderLayout();
  off = subscribe(renderLayout);
}
export function destroy() {
  off?.();
}
