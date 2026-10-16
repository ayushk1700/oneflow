import { t as translate } from '../../core/i18n.js';
import { get, update } from '../../core/storage.js';
import { el, uid } from '../../core/utils.js';
import { openPanel, resumePanel, field, select, toggle, act, confirmAction, isPanel, icon, watch } from '../../core/ui.js';
import { prepareImage } from '../../core/backup.js';
import { put, getAll, remove } from '../../core/db.js';
import { emit, on } from '../../core/events.js';
import { WIDGETS } from '../../core/schema.js';
import { backgroundSync } from '../../core/timer-client.js';
import { backgroundCatalog, backgroundSource, liveWallpaperCatalog } from '../../core/background-presentation.js';
import { imagePreview } from '../../core/image-preview.js';
import * as customize from './customization.js';
let offOpen;
const resumePreferences = new Map();
const labels = { clock: translate('m0229'), focus: translate('m0393'), search: translate('m0394'), links: translate('m0232'), quotes: translate('m0395'), weather: translate('m0302'), tasks: translate('m0303'), timer: translate('m0233'), sounds: translate('m0396'), journal: translate('m0397'), notes: translate('m0398'), habits: translate('m0399'), countdowns: translate('m0400'), stats: translate('m0401'), mood: translate('m0030'), music: translate('m0402') };
const preference = (key, value) => update(d => { d.settings[key] = value; });
const background = (key, value) => update(d => { d.settings.background[key] = value; });
const sections = [
  ['appearance', 'Appearance', 'Your theme, dashboard, accessibility and wallpapers in one place.'],
  ['widgets', 'Home', 'Choose what appears on your dashboard.'],
  ['focus', 'Focus', 'One rhythm for daily focus, tasks and breaks.'],
  ['journal', 'Journal', 'Writing, autosave, prompts and your paper appearance.'],
  ['reminders', 'Reminders', 'Make space for a morning, midday or evening check-in.'],
  ['blocking', 'Website blocking', 'Optional boundaries while Flow Mode is running.'],
  ['data', 'Data & privacy', 'Your backups, diagnostics and local data.'],
  ['help', 'Help & feedback', 'Quick help and feedback you choose to share.']
];
const sectionIcons = { appearance: 'sun', widgets: 'layout-grid', focus: 'clock', journal: 'notebook-pen',
  reminders: 'bell', blocking: 'x', data: 'download', help: 'heart' };
export function render(tab = 'appearance', refresh = false) {
  const jumpToWallpaper = tab === 'backgrounds';
  if (jumpToWallpaper) tab = 'appearance';
  if (!sections.some(([key]) => key === tab)) tab = 'appearance';
  if (!refresh && ['focus', 'blocking'].includes(tab) && resumePanel(`settings-${tab}`)) { resumePreferences.get(tab)?.(); return; }
  const content = el('div', { class: 'settings-layout' }), body = el('section', { class: 'settings-content stack', 'aria-label': translate(sections.find(([key]) => key === tab)[1]) });
  const tabs = el('nav', { class: 'settings-tabs', 'aria-label': translate('m0403') });
  for (const [key, label] of sections) tabs.append(el('button', { type: 'button', 'aria-current': key === tab ? 'page' : 'false', onclick: () => render(key) }, icon(sectionIcons[key], 19), el('span', {}, translate(label))));
  const picker = field(translate('Settings section'), select(sections.map(([key, label]) => [key, label]), tab, event => render(event.target.value)));
  picker.classList.add('settings-picker');
  const [, title, description] = sections.find(([key]) => key === tab);
  body.append(el('div', { class: 'settings-intro' }, el('span', { class: 'settings-eyebrow' }, 'YOUR SPACE'), el('h3', {}, translate(title)), el('p', { class: 'muted' }, translate(description))));
  content.append(el('aside', { class: 'settings-rail' }, el('div', { class: 'settings-rail-heading' }, el('strong', {}, 'Preferences'), el('small', {}, 'A calmer space, your way.')), tabs), picker, body);
  if (tab === 'journal') customize.journal(body);
  if (tab === 'widgets') widgets(body);
  const previewURLs = [];
  let stopPreview;
  if (tab === 'appearance') {
    const studio = el('div', { class: 'settings-studio-card' }, el('div', {}, el('strong', {}, 'Advanced customization'), el('p', {}, 'Open Studio to fine-tune layouts, typography and scene preferences.')),
      el('button', { type: 'button', onclick: act(async () => (await import('../../core/features.js')).openFeature('customizer')) }, 'Open Studio', icon('arrow-up-right', 17)));
    const navigation = el('nav', { class: 'appearance-navigation', 'aria-label': 'Appearance categories' });
    const groups = [['theme', 'Theme & accessibility'], ['dashboard', 'Dashboard style'], ['wallpapers', 'Wallpapers']].map(([id, title]) => {
      const heading = el('h4', { id: `appearance-${id}`, tabindex: -1 }, title);
      const group = el('section', { class: 'appearance-group stack', 'aria-labelledby': heading.id }, heading);
      navigation.append(el('button', { type: 'button', onclick: () => { heading.scrollIntoView({ block: 'start', behavior: 'instant' }); heading.focus({ preventScroll: true }); } }, title));
      return group;
    });
    body.append(navigation, ...groups);
    appearance(groups[0]);
    customize.appearance(groups[1]);
    const preview = el('div', { class: 'appearance-preview', role: 'img', 'aria-label': 'Dashboard typography preview' });
    const refreshPreview = () => {
      const s = get().settings;
      preview.replaceChildren(el('small', {}, 'Dashboard preview'), el('strong', {}, s.clock24 ? '14:25' : '2:25'), el('span', {}, s.name ? `Your space, ${s.name}` : 'Your space to focus'));
      preview.style.setProperty('--preview-clock-size', `${Math.min(96, s.appearance.clockSize / 2)}px`);
      preview.style.setProperty('--preview-clock-weight', s.appearance.clockWeight);
    };
    refreshPreview();
    groups[1].insertBefore(preview, groups[1].children[1]);
    stopPreview = watch(d => [d.settings.name, d.settings.clock24, d.settings.appearance], refreshPreview);
    body.append(studio);
    scenery(groups[2], previewURLs).then(() => {
      if (jumpToWallpaper && groups[2].isConnected) groups[2].scrollIntoView({ block: 'start', behavior: 'instant' });
    }).catch(error => emit('error', error));
  }
  if (tab === 'focus') import('../timer/preferences.js').then(module => resumePreferences.set(tab, module.renderSettings(body))).catch(error => emit('error', error));
  if (tab === 'reminders') reminders(body);
  if (tab === 'blocking') import('../blocker/index.js').then(module => module.renderSettings(body, () => {
    // A completed save must not reopen Settings after the user leaves this section.
    if (isPanel('settings') && document.querySelector('#panel .settings-content') === body) render('blocking', true);
  })).catch(error => emit('error', error));
  if (tab === 'data') import('./data-tools.js').then(module => module.render(body)).catch(error => emit('error', error));
  if (tab === 'help') body.append(el('p', {}, 'Get help with focusing, backups and keyboard shortcuts, or write feedback to download and share.'), el('button', { onclick: act(async () => (await import('../../core/features.js')).openFeature('support')) }, 'Open help & feedback'));
  openPanel(translate('Settings'), 'settings', content, () => { stopPreview?.(); previewURLs.forEach(url => URL.revokeObjectURL(url)); }, `settings-${tab}`);
}
function reminders(body) {
  const system = el('section', { class: 'settings-card stack' }, el('h5', {}, 'System notifications'), el('p', {}, 'Reminders are kept in Notifications. Allow system notices to see them outside ONEFLOW.'));
  system.append(el('button', { type: 'button', onclick: act(async () => {
    if (!globalThis.chrome?.permissions) throw new Error('System notifications need the installed extension.');
    const allowed = await chrome.permissions.request({ permissions: ['notifications'] });
    emit('toast', allowed ? 'System notifications are allowed.' : 'System notices were declined. In-app reminders remain available.');
  }) }, 'Allow system notifications'), el('button', { type: 'button', onclick: act(async () => {
    if (globalThis.chrome?.permissions) await chrome.permissions.remove({ permissions: ['notifications'] });
    emit('toast', 'System notifications are off.');
  }) }, 'Turn off system notifications'));
  body.append(system);
  const rituals = el('section', { class: 'settings-card settings-reminder-card' },
    el('div', { class: 'settings-card-heading' }, el('h5', {}, translate('Daily rituals')), el('p', {}, translate('m0344'))));
  for (const [key, label] of [['morning', translate('m0341')], ['midday', translate('m0342')], ['evening', translate('m0343')]]) rituals.append(field(label, el('input', {
    type: 'time', value: get().ritualReminders[key], onchange: act(async event => {
      await update(next => { next.ritualReminders[key] = event.target.value; });
      await backgroundSync();
    })
  })));
  const habits = el('section', { class: 'settings-card settings-reminder-card' },
    el('div', { class: 'settings-card-heading' }, el('h5', {}, translate('Habit reminders'))));
  if (!get().habits.length) habits.append(el('p', { class: 'muted' }, translate('Add a habit in Notes to schedule its reminder here.')));
  for (const habit of get().habits) habits.append(field(habit.name, el('input', {
    type: 'time', value: habit.reminder || '', 'aria-label': translate('Remind me: {p0}', {p0: habit.name}), onchange: act(async event => {
      await update(next => { const current = next.habits.find(item => item.id === habit.id); if (current) current.reminder = event.target.value; });
      await backgroundSync();
    })
  })));
  const backup = el('section', { class: 'settings-card settings-reminder-card' },
    el('div', { class: 'settings-card-heading' }, el('h5', {}, translate('Backups'))),
    field(translate('m0382'), select([[0, translate('m0383')], [7, translate('m0384')], [14, translate('m0385')], [30, translate('m0386')]], get().backup.reminderDays, act(async event => {
    await update(next => { next.backup.reminderDays = Number(event.target.value); }); await backgroundSync();
  }))));
  body.append(rituals, habits, backup, el('small', { class: 'muted' }, translate('Changes save automatically. Clear a time to turn off that reminder.')));
}
function appearance(body) {
  const s = get().settings;
  const identity = el('section', { class: 'settings-card settings-fields' },
    el('div', { class: 'settings-card-heading' }, el('h5', {}, 'Personal details'), el('p', {}, 'The small choices that make this space feel like yours.')),
    field(translate('m0298'), el('input', { value: s.name, maxlength: 80, placeholder: translate('m0293'), onchange: act(event => preference('name', event.target.value.trim())) })),
    field(translate('m0408'), select([['dark', translate('m0294')], ['light', translate('m0295')]], s.theme, act(e => preference('theme', e.target.value)))),
    field(translate('Accent for charts and details'), el('input', { type: 'color', value: s.accent, onchange: act(e => preference('accent', e.target.value)) })),
    field(translate('m0410'), select([['sans', translate('m0411')], ['serif', translate('m0662')], ['mono', translate('m0412')]], s.font, act(e => preference('font', e.target.value)))),
    field(translate('m0413'), select([['en',translate('m0414')],['hi','हिन्दी · sample translation']], s.language, act(async e => { await preference('language',e.target.value); location.reload(); }))));
  const comfort = el('section', { class: 'settings-card settings-fields' },
    el('div', { class: 'settings-card-heading' }, el('h5', {}, 'Comfort & clarity'), el('p', {}, 'Keep information easy to read at your pace.')),
    field(translate('m0416'), select([['celsius', translate('m0417')], ['fahrenheit', translate('m0418')]], s.units, act(e => preference('units', e.target.value)))),
    field(translate('m0419'), select([['normal',translate('m0420')],['strong',translate('m0421')]], s.contrast, act(e => preference('contrast', e.target.value)))),
    toggle('24-hour clock', s.clock24, act(e => preference('clock24', e.target.checked))),
    toggle(translate('m0422'), s.reducedMotion, act(e => preference(translate('m0060'), e.target.checked))),
    el('small', { class: 'muted settings-card-note' }, translate('m0423')));
  body.append(identity, comfort);
}
function widgets(body) {
  const list = el('section', { class: 'settings-card settings-toggle-list' }, el('p', { class: 'muted' }, translate('m0424')));
  for (const key of WIDGETS.filter(k => !['tasks','habits'].includes(k))) list.append(toggle(key === 'notes' ? 'Notes, tasks & habits' : labels[key], key === 'notes' ? ['notes','tasks','habits'].some(k => get().settings.widgets[k]) : get().settings.widgets[key], act(async e => { const enabled = e.target.checked; await update(d => { d.settings.widgets[key] = enabled; if (key === 'notes') { d.settings.widgets.tasks = enabled; d.settings.widgets.habits = enabled; } if (key === 'sounds' && !enabled) d.audio.playing = false; }); if (key === 'sounds') await backgroundSync(); })));
  body.append(list);
}
async function scenery(body, previewURLs) {
  const refresh = () => { if (isPanel('settings') && body.isConnected) render('backgrounds', true); };
  const b = get().settings.background;
  const catalog = await backgroundCatalog();
  if (!body.isConnected) return;
  body.append(el('div', { class: 'row wrap canvas-choices', 'aria-label': translate('Background appearance') }, ...[['photo', 'Photo'], ['black', 'Pure black'], ['white', 'Pure white']].map(([mode, label]) => el('button', { type: 'button', 'aria-pressed': mode === 'photo' ? b.kind !== 'solid' : b.kind === 'solid' && b.color.toLowerCase() === (mode === 'white' ? '#ffffff' : '#000000'), onclick: act(async () => {
    const photos = mode === 'photo' ? await getAll('images') : [];
    await update(d => { if (mode === 'photo') { if (photos.some(item => item.id === d.settings.background.id)) d.settings.background.kind = 'upload'; else Object.assign(d.settings.background,{ kind:'bundled',id:catalog.some(item => item.id === d.settings.background.id) ? d.settings.background.id : 'alpine' }); } else Object.assign(d.settings.background, { kind: 'solid', color: mode === 'white' ? '#ffffff' : '#000000', rotate: false }); }); refresh();
  }) }, translate(label)))));
  body.append(field(translate('m0425'), select([['bundled', 'From wallpaper'], ['solid', translate('m0663')], ['gradient', translate('m0426')], ['upload', translate('m0427')],['animated','Animated atmosphere'],['local-video','From livewallpaper'],['video','Uploaded video wallpaper']], b.kind, act(async e => {
    if (e.target.value === 'local-video') { const videos = await liveWallpaperCatalog(); if (!videos.length) { emit('toast','Add a video to livewallpaper and refresh the local catalog first.'); e.target.value = get().settings.background.kind; return; } await update(d => { Object.assign(d.settings.background,{kind:'local-video',id:videos[0].id,rotate:false}); }); refresh(); return; }
    if (e.target.value === 'video') { const videos = await getAll('wallpapers'); if (!videos.length) { emit('toast','Upload a local video below first.'); e.target.value = get().settings.background.kind; return; } await update(d => { Object.assign(d.settings.background,{ kind:'video',id:videos[0].id,rotate:false }); }); refresh(); return; }
    if (e.target.value === 'animated') { await update(d => { Object.assign(d.settings.background,{ kind:'animated',id:'aurora',rotate:false }); }); refresh(); return; }
    if (e.target.value === 'upload') { const images = await getAll('images'); if (!images.length) { emit('toast', translate('m0428')); e.target.value = get().settings.background.kind; return; } await update(d => { d.settings.background.kind = 'upload'; d.settings.background.id = images[0].id; }); }
    else await background('kind', e.target.value);
    refresh();
  }))));
  await customize.wallpapers(body,refresh);
  if (!body.isConnected) return;
  body.append(el('h4',{},'Still wallpapers'));
  const grid = el('div', { class: 'background-grid' });
  for (const item of catalog) grid.append(el('button', { class: 'background-card', 'aria-pressed': b.kind === 'bundled' && b.id === item.id, onclick: act(async () => { await update(d => { Object.assign(d.settings.background, { kind: 'bundled', id: item.id, rotate: false }); }); refresh(); }) }, el('img', { src: backgroundSource(item,true), alt: '', loading: 'lazy', decoding:'async', width: 192, height: 108 }), el('span', {}, translate(item.name)), el('small', {}, translate(item.category))));
  body.append(grid, toggle(translate('m0664'), b.rotate, act(e => update(d => { d.settings.background.rotate = e.target.checked; if (e.target.checked) d.settings.background.kind = 'bundled'; }))),
    field(translate('m0430'), el('input', { type: 'color', value: b.color, onchange: act(e => background('color', e.target.value)) })),
    field(translate('m0665'), el('input', { type: 'range', min: 0, max: 20, step: 1, value: b.blur, 'aria-label': translate('m0431'), onchange: act(e => background('blur', Number(e.target.value))) }), translate('m0666')),
    el('hr', { class: 'divider' }));
  const upload = el('input', { type: 'file', accept: 'image/png,image/jpeg,image/webp', onchange: act(async event => {
    const file = event.target.files[0]; if (!file) return; upload.disabled = true;
    try { const images = await getAll('images'); if (images.length >= 8) throw new Error(translate('m0432'));
      const blob = await prepareImage(file), id = uid();
      await navigator.locks.request('oneflow-backup', async () => { await put('images', { id, name: file.name.slice(0, 100), blob, createdAt: Date.now() }); await update(d => { Object.assign(d.settings.background, { kind: 'upload', id, rotate: false }); }); });
      refresh(); emit('toast', translate('m0433'));
    } finally { upload.disabled = false; }
  }) });
  body.append(field(translate('m0434'), upload, translate('m0435')));
  const uploads = el('div', {class:'uploaded-backgrounds stack'}); body.append(uploads);
  for (const image of await getAll('images')) {
    const photo = el('img', {alt:'', loading:'lazy', decoding:'async', width:96, height:54});
    uploads.append(el('div', { class: 'row uploaded-background' }, el('button', { class: 'grow photo-name', 'aria-pressed':b.kind === 'upload' && b.id === image.id, onclick: act(async () => { await update(d => { Object.assign(d.settings.background, { kind: 'upload', id: image.id, rotate: false }); }); refresh(); }) }, photo, el('span',{},image.name || translate('m0436'))), el('button', { onclick: () => confirmAction(body, translate('m0437'), async () => {
    await navigator.locks.request('oneflow-backup', async () => { await update(d => { if (d.settings.background.id === image.id) Object.assign(d.settings.background, { kind: 'bundled', id: 'alpine' }); }); await remove('images', image.id); }); refresh();
    }) }, translate('m0438'))));
    imagePreview(image.blob).then(blob => { if (!body.isConnected) return; const url = URL.createObjectURL(blob); previewURLs.push(url); photo.src = url; }).catch(() => photo.remove());
  }
  const pexels = await import('../pexels/index.js'); if (body.isConnected) pexels.render(body);
}
export function init() { offOpen = on('settings:open', tab => render(tab)); }
export function destroy() { offOpen?.(); resumePreferences.clear(); }
