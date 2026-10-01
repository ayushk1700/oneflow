import { el } from './utils.js';
import { emit, on } from './events.js';
import { subscribe, get } from './storage.js';
const NS = 'http://www.w3.org/2000/svg';
/** Render a locally vendored Lucide icon. */
export function icon(name, size = 20) {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('width', size); svg.setAttribute('height', size); svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS(NS, 'use');
  use.setAttribute('href', `../assets/icons/lucide.svg#${name}`); svg.append(use); return svg;
}
export const button = (label, name, action, className = 'icon-button') => el('button', { type: 'button', class: className, 'aria-label': label, title: label, onclick: action }, name ? icon(name) : null, className.includes('text-button') ? label : null);
export function field(label, control, hint) {
  if (!control.hasAttribute('aria-label')) control.setAttribute('aria-label', label);
  const description = hint ? el('small', { id: `hint-${crypto.randomUUID()}` }, hint) : null;
  if (description) control.setAttribute('aria-describedby', description.id);
  return el('label', { class: 'field' }, el('span', {}, label), control, description);
}
export function select(options, value, change) {
  const node = el('select', { onchange: change });
  for (const [id, label] of options) node.append(el('option', { value: id }, label));
  node.value = value; return node;
}
export function toggle(label, checked, change) {
  return el('label', { class: 'toggle-row' }, el('span', {}, label), el('input', { type: 'checkbox', role: 'switch', checked, onchange: change }));
}
/** Subscribe only to relevant data, preserving focus in unrelated forms. */
export function watch(selector, render) {
  let previous = JSON.stringify(selector(get()));
  return subscribe(data => { const next = JSON.stringify(selector(data)); if (next !== previous) { previous = next; render(data); } });
}
/** Route rejected UI actions to a visible, screen-reader accessible message. */
export function act(fn) { return (...args) => { try { Promise.resolve(fn(...args)).catch(error => emit('error', error)); } catch (error) { emit('error', error); } }; }
let dialog, body, heading, afterClose, returnFocus;
/** Install the shared accessible dialog and toast surfaces. */
export function initUI() {
  dialog = document.querySelector('#panel'); body = document.querySelector('#panel-body'); heading = document.querySelector('#panel-title');
  document.querySelector('#close-panel').onclick = () => closePanel();
  dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) closePanel(); } });
  dialog.addEventListener('close', () => { afterClose?.(); afterClose = null; emit('panel:closed'); returnFocus?.focus(); });
  on('error', error => { console.error(error); emit('toast', error.message || 'Something went wrong. Please try again.'); });
  let timer;
  on('toast', message => { const node = document.querySelector('#toast'); node.textContent = message; node.hidden = false; clearTimeout(timer); timer = setTimeout(() => { node.hidden = true; }, 5000); });
}
/** Open a modal panel with native keyboard focus trapping. */
export function openPanel(title, name, content, cleanup) {
  if (dialog.open) afterClose?.(); else returnFocus = document.activeElement;
  heading.textContent = title; body.replaceChildren(content); afterClose = cleanup;
  dialog.dataset.panel = name; if (!dialog.open) dialog.showModal(); emit('panel:open', name);
}
export function closePanel() { dialog.close(); }
/** Destructive operations require a clearly labeled in-app confirmation. */
export function confirmAction(container, message, action) {
  const box = el('div', { class: 'confirm-box', role: 'alert' }, el('p', {}, message));
  box.append(el('button', { class: 'danger', onclick: act(async () => { await action(); box.remove(); }) }, 'Yes, continue'), el('button', { onclick: () => box.remove() }, 'Cancel'));
  container.append(box); box.querySelector('button').focus();
}
