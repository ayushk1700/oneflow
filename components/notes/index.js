

import { el } from '../../core/utils.js';
import { resumePanel, openPanel, closePanel } from '../../core/ui.js';
import {emit} from '../../core/events.js';

let root;
export { markdown } from '../../core/markdown.js';
export function render() {}
/** Open the same local capture workspace from the existing Notes entry. */
export function open() {
  if (resumePanel('notes')) return;
  root = el('iframe', { src: new URL('./capture.html', import.meta.url).href, title: 'ONEFLOW notes', class: 'notes-workspace-frame', allow: 'microphone' });
  const receive = event => { if(event.source!==root?.contentWindow||event.origin!==location.origin)return;if(event.data?.type==='close')closePanel();else if(event.data?.type==='commands')emit('commands:open'); };
  addEventListener('message', receive);
  openPanel('Notes', 'notes', root, () => { removeEventListener('message', receive); root = null; });
  root.addEventListener('load', () => root?.contentWindow?.focus(), { once: true });
}
export function init() {}
export function destroy() { root=null; }
