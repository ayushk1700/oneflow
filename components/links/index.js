import { get, update } from '../../core/storage.js';
import { el, uid } from '../../core/utils.js';
import { safeURL } from '../../core/schema.js';
import { openPanel, field, button, watch, act, confirmAction } from '../../core/ui.js';
import { emit } from '../../core/events.js';
let root, unsubscribe;
export function render() {
  root.replaceChildren(...get().links.slice(0, 8).map(link => el('a', { class: 'quick-link', href: link.url, title: link.title }, el('span', { class: 'link-monogram', 'aria-hidden': 'true' }, link.title.charAt(0).toUpperCase()), el('span', {}, link.title))), button('Manage quick links', 'plus', () => manage(), 'icon-button link-add'));
}
export function manage() {
  const content = el('div', { class: 'stack' });
  const list = el('div', { class: 'stack' });
  const form = el('form', { class: 'stack' });
  const title = el('input', { required: true, maxlength: 80, placeholder: 'e.g. Reading list', 'aria-label': 'Link name' });
  const url = el('input', { required: true, type: 'url', placeholder: 'https://', maxlength: 2048, 'aria-label': 'Link URL' });
  let editing;
  const submit = el('button', { type: 'submit', class: 'primary' }, 'Add link');
  const draw = () => list.replaceChildren(...get().links.map(link => el('div', { class: 'row link-editor-row' }, el('a', { class: 'grow', href: link.url }, link.title), button(`Edit ${link.title}`, 'pencil', () => { editing = link.id; title.value = link.title; url.value = link.url; submit.textContent = 'Save link'; title.focus(); }), button(`Remove ${link.title}`, 'trash-2', () => confirmAction(content, `Remove ${link.title}?`, async () => { await update(d => { d.links = d.links.filter(x => x.id !== link.id); }); draw(); })))));
  form.append(field('Name', title), field('Website', url), submit);
  form.addEventListener('submit', act(async event => {
    event.preventDefault(); const href = safeURL(url.value);
    if (!href || !title.value.trim()) throw new Error('Enter a name and a valid http or https URL.');
    await update(d => { const link = { id: editing || uid(), title: title.value.trim(), url: href }; const index = d.links.findIndex(x => x.id === editing); if (index >= 0) d.links[index] = link; else d.links.push(link); });
    editing = null; form.reset(); submit.textContent = 'Add link'; draw(); emit('toast', 'Quick link saved.');
  }));
  draw(); content.append(el('p', { class: 'muted' }, 'Keep your favorite corners of the internet close. The first eight appear on your dashboard.'), list, el('hr', { class: 'divider' }), form);
  openPanel('Your shortcuts', 'links', content);
}
export function init(node) { root = node; render(); unsubscribe = watch(d => d.links, render); }
export function destroy() { unsubscribe?.(); root?.replaceChildren(); }
