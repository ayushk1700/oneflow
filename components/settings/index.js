import { get, update } from '../../core/storage.js';
import { el, download, dayKey, uid } from '../../core/utils.js';
import { openPanel, field, select, toggle, act, confirmAction } from '../../core/ui.js';
import { exportData, parseBackup, importData, resetData, prepareImage } from '../../core/backup.js';
import { put, getAll, remove } from '../../core/db.js';
import { emit, on } from '../../core/events.js';
import { WIDGETS } from '../../core/schema.js';
let offOpen, catalog;
const labels = { clock: 'Clock & greeting', focus: 'Daily main focus', search: 'Web search', links: 'Quick links', quotes: 'Words of encouragement', weather: 'Weather', tasks: 'To-do lists' };
const preference = (key, value) => update(d => { d.settings[key] = value; });
const background = (key, value) => update(d => { d.settings.background[key] = value; });
export function render(tab = 'appearance') {
  const content = el('div', { class: 'stack' }), body = el('div', { class: 'stack' });
  const tabs = el('nav', { class: 'settings-tabs', 'aria-label': 'Settings categories' });
  for (const [key, label] of [['appearance', 'You'], ['widgets', 'Widgets'], ['backgrounds', 'Scenery'], ['data', 'Your data']]) tabs.append(el('button', { type: 'button', 'aria-current': key === tab ? 'page' : 'false', onclick: () => render(key) }, label));
  content.append(tabs, body);
  if (tab === 'appearance') appearance(body);
  if (tab === 'widgets') widgets(body);
  if (tab === 'backgrounds') scenery(body).catch(error => emit('error', error));
  if (tab === 'data') dataTools(body);
  openPanel('Make yourself at home', 'settings', content);
}
function appearance(body) {
  const s = get().settings;
  body.append(field('What should we call you?', el('input', { value: s.name, maxlength: 80, placeholder: 'Your first name', onchange: act(event => preference('name', event.target.value.trim())) })),
    field('Theme', select([['dark', 'After hours · Dark'], ['light', 'Daylight · Light'], ['auto', 'Follow my device']], s.theme, act(e => preference('theme', e.target.value)))),
    field('Accent color', el('input', { type: 'color', value: s.accent, onchange: act(e => preference('accent', e.target.value)) })),
    field('Typography', select([['sans', 'Clean & simple'], ['serif', 'A little literary'], ['mono', 'Thoughtfully technical']], s.font, act(e => preference('font', e.target.value)))),
    field('Search engine', select([['google', 'Google'], ['duckduckgo', 'DuckDuckGo'], ['bing', 'Bing']], s.engine, act(e => preference('engine', e.target.value)))),
    field('Temperature', select([['celsius', 'Celsius · °C'], ['fahrenheit', 'Fahrenheit · °F']], s.units, act(e => preference('units', e.target.value)))),
    toggle('24-hour clock', s.clock24, act(e => preference('clock24', e.target.checked))),
    toggle('Reduce motion', s.reducedMotion, act(e => preference('reducedMotion', e.target.checked))),
    el('small', { class: 'muted' }, 'Your device’s reduced-motion preference is always respected.'));
}
function widgets(body) {
  body.append(el('p', { class: 'muted' }, 'Keep what serves you. Let the rest fade away.'));
  for (const key of WIDGETS) body.append(toggle(labels[key], get().settings.widgets[key], act(e => update(d => { d.settings.widgets[key] = e.target.checked; }))));
}
async function scenery(body) {
  const b = get().settings.background;
  body.append(field('Background style', select([['bundled', 'ONEFLOW landscapes'], ['solid', 'A single color'], ['gradient', 'Soft gradient'], ['upload', 'Your own photograph']], b.kind, act(async e => {
    if (e.target.value === 'upload') { const images = await getAll('images'); if (!images.length) { emit('toast', 'Upload a photograph below first.'); e.target.value = get().settings.background.kind; return; } await update(d => { d.settings.background.kind = 'upload'; d.settings.background.id = images[0].id; }); }
    else await background('kind', e.target.value);
    render('backgrounds');
  }))));
  if (!catalog) { const response = await fetch('../data/backgrounds.json'); if (!response.ok) throw new Error('Bundled backgrounds are unavailable.'); catalog = await response.json(); }
  const grid = el('div', { class: 'background-grid' });
  for (const item of catalog) grid.append(el('button', { class: 'background-card', 'aria-pressed': b.kind === 'bundled' && b.id === item.id, onclick: act(async () => { await update(d => { Object.assign(d.settings.background, { kind: 'bundled', id: item.id, rotate: false }); }); render('backgrounds'); }) }, el('img', { src: `../assets/backgrounds/${item.id}-thumb.webp`, alt: '', loading: 'lazy', width: 192, height: 108 }), el('span', {}, item.name), el('small', {}, item.category)));
  body.append(grid, toggle('A new landscape every day', b.rotate, act(e => update(d => { d.settings.background.rotate = e.target.checked; if (e.target.checked) d.settings.background.kind = 'bundled'; }))),
    field('Solid / gradient color', el('input', { type: 'color', value: b.color, onchange: act(e => background('color', e.target.value)) })),
    field('A softer view', el('input', { type: 'range', min: 0, max: 20, step: 1, value: b.blur, 'aria-label': 'Background blur', onchange: act(e => background('blur', Number(e.target.value))) }), 'A readability veil stays on every background, including uploads.'),
    el('hr', { class: 'divider' }));
  const upload = el('input', { type: 'file', accept: 'image/png,image/jpeg,image/webp', onchange: act(async event => {
    const file = event.target.files[0]; if (!file) return; upload.disabled = true;
    try { const images = await getAll('images'); if (images.length >= 8) throw new Error('Keep up to eight photos. Remove one before adding another.');
      const blob = await prepareImage(file), id = uid();
      await navigator.locks.request('oneflow-backup', async () => { await put('images', { id, name: file.name.slice(0, 100), blob, createdAt: Date.now() }); await update(d => { Object.assign(d.settings.background, { kind: 'upload', id, rotate: false }); }); });
      render('backgrounds'); emit('toast', 'Your own little world, saved on this device.');
    } finally { upload.disabled = false; }
  }) });
  body.append(field('Upload a photograph', upload, 'PNG, JPEG, or WebP · up to 8 MB. Photos stay on this device.'));
  for (const image of await getAll('images')) body.append(el('div', { class: 'row' }, el('button', { class: 'grow photo-name', onclick: act(async () => { await update(d => { Object.assign(d.settings.background, { kind: 'upload', id: image.id, rotate: false }); }); render('backgrounds'); }) }, image.name || 'Your photograph'), el('button', { onclick: () => confirmAction(body, 'Remove this saved photograph?', async () => {
    await navigator.locks.request('oneflow-backup', async () => { await update(d => { if (d.settings.background.id === image.id) Object.assign(d.settings.background, { kind: 'bundled', id: 'alpine' }); }); await remove('images', image.id); }); render('backgrounds');
  }) }, 'Remove')));
}
function dataTools(body) {
  body.append(el('p', { class: 'muted' }, 'Your days belong to you. Everything is stored locally. Export a backup to take it with you, including your uploaded photos.'),
    el('button', { class: 'primary', onclick: act(async () => { const result = await exportData(); download(new Blob([JSON.stringify(result)], { type: 'application/json' }), `oneflow-${dayKey()}.json`); emit('toast', 'Your backup is ready. Keep it somewhere safe.'); }) }, 'Export all data'),
    field('Restore from a backup', el('input', { type: 'file', accept: '.json,application/json', onchange: act(async e => { const file = e.target.files[0]; if (!file) return; if (file.size > 40 * 1024 * 1024) throw new Error('Backup is too large (40 MB maximum).'); const prepared = await parseBackup(await file.text()); confirmAction(body, `Replace this device’s data with this backup? It contains ${prepared.local.tasks.length} tasks and ${prepared.records.images.length} photos. Export your current data first if you want to keep it.`, async () => { await importData(prepared); location.reload(); }); e.target.value = ''; }) }), 'A restore replaces current data after the complete file is validated.'),
    el('hr', { class: 'divider' }), el('p', { class: 'muted' }, 'Browser sync holds only your name, theme, accent, and widget toggles. Tasks and photographs stay on this device.'),
    el('button', { class: 'danger', onclick: () => confirmAction(body, 'Permanently delete all ONEFLOW data, including tasks, favorites, photos, and synced preferences?', async () => { await resetData(); if (globalThis.chrome?.permissions) await chrome.permissions.remove({ origins: ['https://api.open-meteo.com/*', 'https://geocoding-api.open-meteo.com/*'], permissions: ['geolocation'] }); location.reload(); }) }, 'Delete all data'));
}
export function init() { offOpen = on('settings:open', tab => render(tab)); }
export function destroy() { offOpen?.(); }
