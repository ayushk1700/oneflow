import { t as translate } from '../../core/i18n.js';
import { el } from '../../core/utils.js';
/** A quiet, local break companion. No autoplay or external assets. */
export function render(cycle = 0) {
  const kind = cycle % 3;
  if (kind === 1) return el('div', { class: 'break-card' }, el('span', { class: 'eyebrow' }, translate('m0643')), el('h3', {}, translate('m0145')), el('p', {}, translate('m0146')));
  if (kind === 2) return el('div', { class: 'break-card' }, el('div', { class: 'breathing-orb', 'aria-hidden': 'true' }), el('h3', {}, translate('m0147')), el('p', {}, translate('m0148')));
  return el('div', { class: 'break-card' }, el('span', { class: 'eyebrow' }, translate('m0644')), el('h3', {}, translate('m0149')), el('p', {}, translate('m0150')));
}
export function init(node) { node.replaceChildren(render()); }
export function destroy() {}
