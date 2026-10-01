import { el } from '../../core/utils.js';
/** A quiet, local break companion. No autoplay or external assets. */
export function render(cycle = 0) {
  const kind = cycle % 3;
  if (kind === 1) return el('div', { class: 'break-card' }, el('span', { class: 'eyebrow' }, 'A FRESH PERSPECTIVE'), el('h3', {}, 'Let your eyes wander.'), el('p', {}, 'Look at something about 20 feet away for 20 seconds. Let the screen wait.'));
  if (kind === 2) return el('div', { class: 'break-card' }, el('div', { class: 'breathing-orb', 'aria-hidden': 'true' }), el('h3', {}, 'Find a softer rhythm.'), el('p', {}, 'Breathe in gently for four counts. Breathe out for four. Stay comfortable; there is no need to hold your breath.'));
  return el('div', { class: 'break-card' }, el('span', { class: 'eyebrow' }, 'A LITTLE ROOM TO MOVE'), el('h3', {}, 'Uncurl from your work.'), el('p', {}, 'Stand if comfortable. Roll your shoulders, reach gently upward, and let your hands relax.'));
}
export function init(node) { node.replaceChildren(render()); }
export function destroy() {}
