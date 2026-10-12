

import { el } from '../../core/utils.js';
import { resumePanel, openPanel, closePanel } from '../../core/ui.js';

let root;
/** Render markdown-lite as text-safe nodes. Raw HTML and executable links never run. */
export function markdown(text) {
  const container = el('div', { class: 'markdown-preview' });
  for (const line of text.split('\n')) {
    const heading = line.match(/^(#{1,3})\s+(.*)/), bullet = line.startsWith('- ');
    const node = el(heading ? `h${heading[1].length + 1}` : 'p');
    const content = heading ? heading[2] : bullet ? `• ${line.slice(2)}` : line;
    for (const part of content.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g)) {
      if (part.startsWith('**') && part.endsWith('**')) node.append(el('strong', {}, part.slice(2,-2)));
      else if (part.startsWith('`') && part.endsWith('`')) node.append(el('code', {}, part.slice(1,-1)));
      else if (part.startsWith('*') && part.endsWith('*')) node.append(el('em', {}, part.slice(1,-1)));
      else node.append(part);
    }
    container.append(node);
  }
  return container;
}
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
