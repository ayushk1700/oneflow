import { get, update } from '../../core/storage.js';
import { el } from '../../core/utils.js';
import { openPanel, closePanel, field, select, toggle, act } from '../../core/ui.js';
let active = false;
export function render() {
  const s = get().settings, selected = { ...s.widgets };
  const name = el('input', { maxlength: 80, placeholder: 'Your first name', value: s.name, autocomplete: 'given-name' });
  const theme = select([['dark', 'After hours · Dark'], ['light', 'Daylight · Light'], ['auto', 'Follow my device']], s.theme);
  const content = el('form', { class: 'stack onboarding', onsubmit: act(async event => { event.preventDefault(); await update(d => { Object.assign(d.settings, { name: name.value.trim(), theme: theme.value, widgets: selected, onboarding: true }); }); active = false; closePanel(); }) },
    el('div', { class: 'welcome-symbol', 'aria-hidden': 'true' }, '⌁'), el('p', { class: 'welcome-copy' }, 'A quieter tab.\nA clearer mind.'), el('p', { class: 'muted' }, 'A little space for what matters. Make it yours in a few seconds. You can change everything later.'), field('What should we call you?', name), field('Choose your vibe', theme));
  const disclosure = el('details', {}, el('summary', {}, 'Choose what’s in your space'));
  for (const [key, label] of Object.entries({ clock: 'Clock & greeting', focus: 'Daily focus', search: 'Search', links: 'Quick links', quotes: 'Quotes', weather: 'Weather', tasks: 'To-do lists' })) disclosure.append(toggle(label, selected[key], e => { selected[key] = e.target.checked; }));
  content.append(disclosure, el('button', { class: 'primary', type: 'submit' }, 'Make a little room →'), el('button', { type: 'button', onclick: act(async () => { await update(d => { d.settings.onboarding = true; }); active = false; closePanel(); }) }, 'Skip for now'), el('small', { class: 'muted' }, 'No account. No tracking. Just you, at your own pace.'));
  active = true; openPanel('Welcome to ONEFLOW', 'onboarding', content, () => { if (active) { active = false; update(d => { d.settings.onboarding = true; }).catch(() => {}); } });
}
export function init() { if (!get().settings.onboarding) render(); }
export function destroy() { active = false; }
