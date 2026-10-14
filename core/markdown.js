import { el } from './utils.js';
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
