import { t as translate } from './i18n.js';
import { el } from './utils.js';
import { emit, on } from './events.js';
import { subscribe, get } from './storage.js';
const NS = 'http://www.w3.org/2000/svg';
/** Render a locally vendored Lucide icon. */
export function icon(name, size = 20) {
  if(get().settings.customization?.theme?.iconPack==='symbols')return el('span',{class:'power-symbol','aria-hidden':'true','data-power-icon':name},({'arrow-left':'←',maximize:'⛶',minimize:'⛶',clock:'◷',search:'⌕',pencil:'✎',bookmark:'▣',sun:'☀',cloud:'☁',play:'▶',pause:'Ⅱ',x:'×',bell:'♧','audio-lines':'♫','sliders-horizontal':'☷','layout-grid':'▦','list-todo':'☑',heart:'♡',image:'▧',download:'↓',ellipsis:'…'})[name]||'◇');
  const svg = document.createElementNS(NS, 'svg');
  svg.dataset.powerIcon=name;
  svg.dataset.size=size<=16?'sm':size>=24?'lg':'md'; size=size<=16?16:size>=24?24:20; svg.setAttribute('width', size); svg.setAttribute('height', size); svg.setAttribute("viewBox", '0 0 24 24'); svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS(NS, 'use');
  use.setAttribute('href', `../assets/icons/lucide.svg#${name}`); svg.append(use); return svg;
}
export const button = (label, name, action, className = 'icon-button') => el('button', { type: 'button', class: className, 'aria-label': translate(label), title: translate(label), onclick: action }, name ? icon(name) : null, className.includes('text-button') ? translate(label) : null);
export function field(label, control, hint) {
  if (!control.hasAttribute('aria-label')) control.setAttribute('aria-label', translate(label));
  const description = hint ? el('small', { id: `hint-${crypto.randomUUID()}` }, hint) : null;
  if (description) control.setAttribute('aria-describedby', description.id);
  return el('label', { class: 'field' }, el('span', {}, translate(label)), control, description);
}
export function select(options, value, change) {
  const node = el('select', { onchange: change });
  for (const [id, label] of options) node.append(el('option', { value: id }, translate(label)));
  node.value = value; return node;
}
export function toggle(label, checked, change) {
  return el('label', { class: 'toggle-row' }, el('span', {}, translate(label)), el('input', { type: 'checkbox', role: 'switch', checked, onchange: change }));
}
/** Subscribe only to relevant data, preserving focus in unrelated forms. */
export function watch(selector, render) {
  let previous = JSON.stringify(selector(get()));
  return subscribe(data => { const next = JSON.stringify(selector(data)); if (next !== previous) { previous = next; render(data); } });
}
/** Route rejected UI actions to a visible, screen-reader accessible message. */
export function act(fn) { return (...args) => { try { Promise.resolve(fn(...args)).catch(error => emit('error', error)); } catch (error) { emit('error', error); } }; }
let dialog, body, heading, returnFocus, current, navigation = [], requestVersion = 0;
const suspended = new Map();
const retained = new Set(['stats','support','energy','energyweather','proof','afterglow','firststep','compiler','recovery','capsules','recall','garden','career','skills','websearch', 'dictionary', 'tasks', 'timer', 'sounds', 'journal', 'notes', 'habits', 'countdowns', 'settings', 'mood', 'music', 'rituals']);
const dayTools = new Set(['websearch', 'dictionary', 'countdowns', 'mood', 'support']);
  const toolFor = view => ['tasks','notes','habits'].includes(view?.name) ? 'workspace' : view?.key === 'settings-focus' ? 'timer' : dayTools.has(view?.name) ? 'day' : view?.name;

/** Invalidate late async opens when another tool opens or the dialog closes. @returns {() => boolean} */
export function panelRequest() { const version = ++requestVersion; return () => version === requestVersion; }

/** Configure the shared tool switcher. @param {{id: string, label: string, glyph: string, open: Function}[]} items */
export function setPanelNavigation(items) { navigation = items; drawNavigation(); if (current) emit('panel:open', toolFor(current)); }
function drawNavigation() {
  const nav = document.querySelector('#panel-nav');
  if (!nav) return;
  nav.hidden = !current || ['onboarding','shortcuts','notes','journal','settings'].includes(current.name);
  if(nav.hidden)return;
  const view=current;
  import('./panel-navigation.js').then(m=>{if(current===view)m.draw(nav,navigation,current?.name);});
}
function suspendCurrent() {
  if (!current) return;
  current.scroll = body.scrollTop;
  current.suspend?.();
  if (retained.has(current.name)) suspended.set(current.key, current);
  else current.cleanup?.();
}
/** Reuse a live view so values and event closures stay together. @param {string} key @returns {boolean} */
export function resumePanel(key) {
  if (dialog.open && current?.key === key) { requestVersion++; return true; }
  const view = suspended.get(key);
  if (!view) return false;
  suspended.delete(key);
  openPanel(view.title, view.name, view.content, view.cleanup, view.key, view.suspend);
  body.scrollTop = view.scroll;
  emit('panel:resume', view.name);
  return true;
}
/** Release a disabled widget's retained and current views. @param {string} name */
export function discardPanel(name) {
  for (const [key, view] of suspended) if (view.name === name) { view.cleanup?.(); suspended.delete(key); }
  if (current?.name === name) closePanel();
}
function releasePanels() {
  current?.cleanup?.(); current = null;
  for (const view of suspended.values()) view.cleanup?.();
  suspended.clear(); body.replaceChildren();
  drawNavigation(); emit('panel:closed');
  // A disclosure may have closed while its panel was open; restore its trigger.
  const target = returnFocus?.closest('details:not([open])')?.querySelector('summary') || returnFocus;
  if (target?.isConnected && target.checkVisibility({visibilityProperty:true})) target.focus();
  else document.querySelector('#dock button')?.focus();
}
/** Install the shared accessible dialog and toast surfaces. */
export function initUI() {
  dialog = document.querySelector('#panel'); body = document.querySelector('#panel-body'); heading = document.querySelector('#panel-title');
  document.querySelector('#close-panel').onclick = () => closePanel();
  document.querySelector('#close-panel').replaceChildren(icon('x'));
  document.querySelector('#toast-close').replaceChildren(icon('x'));
  dialog.addEventListener('keydown', event => {
    if(event.key==='Escape'){event.preventDefault();event.stopPropagation();closePanel();return;}
    if (event.key !== 'Tab') return;
    const controls = [...dialog.querySelectorAll('button, input, select, textarea, a[href], summary, [tabindex]')]
      .filter(node => !node.disabled && node.tabIndex >= 0 && node.getClientRects().length && getComputedStyle(node).visibility !== 'hidden');
    const first = controls[0], last = controls.at(-1);
    if (!first) { event.preventDefault(); heading.focus(); return; }
    if (event.shiftKey && (document.activeElement === first || document.activeElement === heading)) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }, { capture:true });
  dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) closePanel(); } });
  dialog.addEventListener('cancel', event => { event.preventDefault(); closePanel(); });
  dialog.addEventListener('close', () => {
    // A queued native close event must never tear down a newly opened panel.
    if (!dialog.open && current) { requestVersion++; releasePanels(); }
  });
  on('error', error => { console.error(error); emit('toast', { message: error.message || translate('m0126'), kind: 'error' }); });
  on('toast', message => { import('./toaster.js').then(module => module.show(message)).catch(error => console.warn('Toast unavailable', error.message)); });
}
/** Open a modal panel with native keyboard focus trapping. */
export function openPanel(title, name, content, cleanup, key = name, suspend) {
  requestVersion++;
  const stale = suspended.get(key);
  if (stale && stale.content !== content) stale.cleanup?.();
  suspended.delete(key);
  if (dialog.open) {
    if (current?.key !== key) suspendCurrent();
    else if (current.content !== content) current.cleanup?.();
  } else returnFocus = document.activeElement;
  current = { title, name, content, cleanup, key, suspend, scroll: 0 };
  heading.textContent = title; body.dataset.widget=name;body.replaceChildren(content); body.scrollTop = 0;
  dialog.dataset.panel = name;
  drawNavigation();
  if (!dialog.open) dialog.showModal();
  (content.querySelector('[data-page-heading]') || heading).focus({ preventScroll: true });
  emit('panel:open', toolFor(current));
}
export function closePanel() { requestVersion++; dialog.close(); releasePanels(); }
/** Check whether an asynchronous action still owns the visible panel. */
export function isPanel(name) { return Boolean(dialog?.open && current?.name === name); }
/** Destructive operations require a clearly labeled in-app confirmation. */
export function confirmAction(container, message, action) {
  const previous = document.activeElement;
  const box = el('div', { class: 'confirm-box', role: 'alert' }, el('p', {}, message));
  const finish = () => { box.remove(); if (previous?.isConnected && !previous.disabled) previous.focus(); else heading?.focus(); };
  box.append(el('button', { type: 'button', class: 'danger', onclick: act(async () => { await action(); finish(); }) }, translate('m0127')), el('button', { type: 'button', onclick: finish }, translate('m0128')));
  container.append(box); box.querySelector('button').focus();
}
