

import { el } from '../../core/utils.js';
import { resumePanel, openPanel, closePanel } from '../../core/ui.js';

let root;
export { markdown } from '../../core/markdown.js';
export function render() {}
/** Open the same local capture workspace from the existing Notes entry. */
export function open() {
  if (resumePanel('notes')) return;
  root = el('iframe', { src: new URL('./capture.html', import.meta.url).href, title: 'ONEFLOW notes', class: 'notes-workspace-frame', allow: 'microphone' });
  const receive = event => { if (event.source === root?.contentWindow && event.origin === location.origin && event.data?.type === 'close') closePanel(); };
  addEventListener('message', receive);
  openPanel('Notes', 'notes', root, () => { removeEventListener('message', receive); root = null; });
  root.addEventListener('load', () => root?.contentWindow?.focus(), { once: true });
}
export function init() {}
export function destroy() { root=null; }
