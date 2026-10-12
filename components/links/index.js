import { t as translate } from '../../core/i18n.js';
import { get, update } from '../../core/storage.js';
import { el, uid } from '../../core/utils.js';
import { safeURL } from '../../core/schema.js';
import { openPanel, field, button, watch, act, confirmAction } from '../../core/ui.js';
import { emit } from '../../core/events.js';
let root, unsubscribe;
export function render() {
  root.replaceChildren(...get().links.slice(0, 8).map(link => el('a', { class: 'quick-link', href: link.url, title: link.title }, el('span', { class: 'link-monogram', 'aria-hidden': 'true' }, link.title.charAt(0).toUpperCase()), el('span', {}, link.title))), button(translate('m0250'), 'plus', () => manage(), 'icon-button link-add'));
}
export function manage() {
  const content = el('div', { class: 'stack' });
  const list = el('div', { class: 'stack' });
  const form = el('form', { class: 'stack' });
  const title = el('input', { required: true, maxlength: 80, placeholder: translate('m0251'), 'aria-label': translate('m0252') });
  const url = el('input', { required: true, type: 'url', placeholder: 'https://', maxlength: 2048, 'aria-label': translate('m0253') });
  let editing;
  const submit = el('button', { type: 'submit', class: 'primary' }, translate('m0254'));
  const draw = () => list.replaceChildren(...get().links.map(link => el('div', { class: 'row link-editor-row' }, el('a', { class: 'grow', href: link.url }, link.title), button(translate('m0255', {p0: link.title}), 'pencil', () => { editing = link.id; title.value = link.title; url.value = link.url; submit.textContent = translate('m0256'); title.focus(); }), button(translate('m0257', {p0: link.title}), 'trash-2', () => confirmAction(content, translate('m0258', {p0: link.title}), async () => { await update(d => { d.links = d.links.filter(x => x.id !== link.id); }); draw(); })))));
  form.append(field(translate('m0259'), title), field(translate('m0260'), url), submit);
  form.addEventListener('submit', act(async event => {
    event.preventDefault(); const href = safeURL(url.value);
    if (!href || !title.value.trim()) throw new Error(translate('m0261'));
    await update(d => { const link = { id: editing || uid(), title: title.value.trim(), url: href }; const index = d.links.findIndex(x => x.id === editing); if (index >= 0) d.links[index] = link; else d.links.push(link); });
    editing = null; form.reset(); submit.textContent = translate('m0254'); draw(); emit('toast', translate('m0262'));
  }));
  draw(); content.append(el('p', { class: 'muted' }, translate('m0263')), list, el('hr', { class: 'divider' }), form);
  openPanel(translate('m0264'), 'links', content);
}
export function init(node) { root = node; render(); unsubscribe = watch(d => d.links, render); }
export function destroy() { unsubscribe?.(); root?.replaceChildren(); }
