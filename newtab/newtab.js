import { t as translate, setLanguage, translateShell } from '../core/i18n.js';
import * as storage from '../core/storage.js';
import * as theme from '../core/theme.js';
import { initUI, button, icon, act, openPanel, setPanelNavigation, discardPanel } from '../core/ui.js';
import { emit, on } from '../core/events.js';
import { el, inputActive } from '../core/utils.js';
import '../core/state.js';
import * as clock from '../components/clock/index.js';
import * as focus from '../components/focus/index.js';
import * as search from '../components/search/index.js';
import { tasks, settings, countdowns, links, quotes, weather } from '../core/lazy-widgets.js';
import * as timer from '../components/timer/index.js';
import { timerCommand, backgroundSync } from '../core/timer-client.js';
import { openFeature, openDay, registerFeature, destroyFeature } from '../core/features.js';
let flowModule;
const loadFlow=()=>flowModule??=(import('../components/flow/index.js').then(module=>{module.init();return module;}));
const flow={init:()=>{},enter:()=>{const fullscreen=document.documentElement.requestFullscreen?.().catch(()=>{});return loadFlow().then(async module=>{await fullscreen;return module.enter();});}};
import * as layout from '../core/layout.js';
import { recordDiagnostic } from '../core/diagnostics.js';
import * as dashboard from '../core/dashboard-view.js';
import { init as initHomeMenu } from '../core/home-menu.js';

const modules = { clock, focus, search, links, quotes, weather, tasks, timer, countdowns }, mounted = new Set();
let previousWidgets = '';
let secondaryReady = false;
let studioRuntime;
async function applyStudio(data) { if (data.settings.studio.enabled && !studioRuntime) { studioRuntime = await import('../core/studio-runtime.js'); studioRuntime.init(); } }
async function applyWidgets(data) {
  const widgets = data.settings.widgets, key = JSON.stringify([widgets, data.settings.studio.enabled, secondaryReady,data.settings.customization?.layout?.enabled,data.settings.customization?.behavior?.spaceId]);
  if (key === previousWidgets) return;
  previousWidgets = key;
  for (const [name, module] of Object.entries(modules)) {
    const node = document.getElementById(name);
    const enabled = (name === 'tasks' ? widgets.tasks || widgets.notes || widgets.habits : name === 'focus' ? widgets.focus || widgets.timer : widgets[name]) &&
      (!['weather','links','countdowns'].includes(name) || secondaryReady || data.settings.studio.enabled || data.settings.customization?.layout?.enabled);
    if (node) node.hidden = name === 'timer' || !enabled;
    if (enabled && !mounted.has(name)) { mounted.add(name); Promise.resolve(module.init(name === 'timer' ? null : node)).catch(error => emit('error', error)); if (name === 'countdowns') registerFeature(name, module); }
    else if (!enabled && mounted.has(name)) { discardPanel(name); module.destroy(); mounted.delete(name); }
  }
  for (const name of ['sounds','journal','stats','mood','music']) if (!widgets[name]) destroyFeature(name);
  if (!widgets.tasks && !widgets.notes && !widgets.habits) destroyFeature('notes');
  const dock = document.querySelector('#dock'); dock.replaceChildren();
  const items = [];
  const add = (id, label, glyph, action) => {
    items.push({ id, label, glyph, open: action });
    const b = button(id === 'tasks' ? translate('m0503') : label, null, act(action), 'dock-button');
    b.dataset.tool = id; b.setAttribute('aria-haspopup', 'dialog'); b.title = label;
    b.append(icon(glyph), el('span', {}, label)); dock.append(b);
  };
  if (widgets.tasks || widgets.notes || widgets.habits) add('workspace', 'Notes', 'pencil', () => openFeature('notes'));
  if (widgets.sounds) add('sounds', 'Sounds', 'audio-lines', () => openFeature('sounds'));
  const journalButton = document.querySelector('#journal-button');
  journalButton.hidden = !widgets.journal;
  if (widgets.journal) {
    journalButton.replaceChildren(icon('bookmark'), el('span', {}, 'Journal'));
    journalButton.onclick = act(() => openFeature('journal'));
    items.push({ id:'journal', label:'Journal', glyph:'bookmark', open:() => openFeature('journal') });
  }
  items.push({ id: 'day', label: 'More', glyph: 'ellipsis', open: openDay });
  setPanelNavigation(items);
}
/** Show audio status without mounting the mixer or starting playback. */
function renderAudioStatus(data) {
  document.documentElement.dataset.contrast = data.settings.contrast;
  const host = document.querySelector('#audio-status'), audio = data.audio;
  host.hidden = !data.settings.widgets.sounds || !audio.playing;
  if (host.hidden) return;
  const names = Object.entries(audio.volumes).filter(([, volume]) => volume > 0).map(([name]) => name[0].toUpperCase() + name.slice(1));
  if (!host.children.length) host.append(button(translate('m0583'), 'audio-lines', act(() => openFeature('sounds'))), el('span', { class: 'audio-label' }), el('button', { class: 'icon-button', type: 'button', 'aria-label': translate('m0584'), onclick: act(async () => {
    await storage.update(d => { d.audio.playing = false; });
    if (globalThis.chrome?.runtime?.id) await backgroundSync();
    else { const sounds = await import('../components/sounds/index.js'); await sounds.syncAudio(); }
  }) }, 'Ⅱ'));
  host.querySelector('.audio-label').textContent = names.join(' + ') || translate('m0585');
}
function shortcuts() {
  const keys = storage.get().settings.studio.interaction.keys;
  openPanel(translate('m0674'), 'shortcuts', el('div', { class: 'stack' }, ...[[keys.task.toUpperCase(), translate('m0586')], [keys.timer, translate('m0588')], [keys.flow.toUpperCase(), translate('m0047')], [keys.search, translate('m0589')], [translate('m0590'), translate('m0591')]].map(([key, label]) => el('div', { class: 'row' }, el('kbd', {}, key), label)), el('p', { class: 'muted' }, translate('m0592'))));
}
async function start() {
  performance.mark('oneflow-script-ready');
  initUI();
  await storage.init();
  import('../core/notifications.js').then(m => m.init()).catch(error => emit('error', error));
  if (storage.get().settings.customization) await (await import('../core/customization-runtime.js')).init();
  performance.mark('oneflow-storage-ready');
  setLanguage(storage.get().settings.language); translateShell();
  flow.init(); layout.init(); on('flow:enter', act(flow.enter));
  settings.init();
  // Color and contrast apply synchronously; artwork lookup must not hold up controls.
  theme.init().catch(error => emit('error', error));
  await applyWidgets(storage.get());
  applyStudio(storage.get()).catch(error => emit('error', error));
  dashboard.init();
  import('../core/work-monitor.js').then(m=>m.init()).catch(error=>emit('error',error));
  on('home:extras', () => { secondaryReady = true; applyWidgets(storage.get()).catch(error => emit('error', error)); });
  initHomeMenu();
  renderAudioStatus(storage.get());
  storage.subscribe(data => { applyWidgets(data).catch(error => emit('error', error)); applyStudio(data).catch(error => emit('error', error)); renderAudioStatus(data); });
  document.querySelector('#more-tools-button').onclick = act(async () => {
    document.querySelector('#home-menu').open = false;
    await openDay();
  });
  on('focus:sounds', () => openFeature('sounds').catch(error => emit('error', error)));
  on('focus:exit', () => dashboard.setView('home'));
  document.querySelector('#focus-exit').onclick = () => emit('focus:exit');
  document.querySelector('#settings-button > span').replaceChildren(icon('sliders-horizontal'));
  document.querySelector('#settings-button').onclick = act(async () => (await import('../components/customization/index.js')).open());
  document.querySelector('#background-button').onclick = () => emit('settings:open', 'backgrounds');
  document.querySelector('#shortcuts-button').onclick = shortcuts;
  const fullscreen = document.querySelector('#fullscreen-button');
  fullscreen.hidden = !document.fullscreenEnabled;
  fullscreen.onclick = act(() => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen());
  document.addEventListener('fullscreenchange', () => { const label = document.fullscreenElement ? 'Exit fullscreen' : 'Enter fullscreen'; fullscreen.setAttribute('aria-label', label); fullscreen.title = label; });
  on('panel:open', name => { for (const b of document.querySelectorAll('#dock button,#journal-button')) { b.classList.toggle('active', b.dataset.tool === name); b.setAttribute('aria-expanded', String(b.dataset.tool === name)); } const more = document.querySelector('#home-menu > summary'); more.classList.toggle('active', name === 'day'); more.setAttribute('aria-expanded', String(name === 'day')); });
  on('panel:closed', () => { document.querySelectorAll('#dock button,#journal-button').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-expanded', 'false'); }); const more = document.querySelector('#home-menu > summary'); more.classList.remove('active'); more.setAttribute('aria-expanded', 'false'); });
  document.addEventListener('keydown', event => {
    if (event.defaultPrevented || event.repeat || event.isComposing) return;
    const modal = document.querySelector('dialog[open]');
    if (!modal && !event.ctrlKey && !event.metaKey && !event.altKey && !inputActive(event.target) && event.key.toLowerCase() === 's') { event.preventDefault(); import('../components/customization/index.js').then(m => m.open()).catch(error => emit('error', error)); return; }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k' && !modal && !inputActive(event.target)) { event.preventDefault(); openFeature('commands').catch(error => emit('error', error)); return; }
    if (event.ctrlKey || event.metaKey || event.altKey || inputActive(event.target) || modal && modal.id !== 'flow-view') return;
    const keys = storage.get().settings.studio.interaction.keys, key = event.code === 'Space' ? 'Space' : event.key.toLowerCase();
    if (modal && key !== keys.timer) return;
    if (event.key === 'Escape' && document.documentElement.dataset.view === 'focus') { event.preventDefault(); emit('focus:exit'); return; }
    if (document.documentElement.dataset.customizing === 'true') return;
    if (key === keys.search && storage.get().settings.widgets.search) { event.preventDefault(); dashboard.setView('home'); document.querySelector('#web-search')?.focus(); }
    if (key === keys.task && ['tasks','notes','habits'].some(k => storage.get().settings.widgets[k])) { event.preventDefault(); emit('task:new'); }
    if (key === keys.flow) { event.preventDefault(); flow.enter().catch(error => emit('error', error)); }
    if (key === keys.timer && !event.target.closest('button,a,summary,input,[role=button],[role=switch],[role=checkbox]') && storage.get().settings.widgets.timer) { event.preventDefault(); timerCommand(storage.get().timer.status === 'running' ? 'pause' : 'start').catch(error => emit('error', error)); }
  });
  performance.mark('oneflow-ready');
  document.documentElement.dataset.ready = 'true';
  if (!storage.get().settings.onboarding) (await import('../components/onboarding/index.js')).init();
}
addEventListener('unhandledrejection', event => { event.preventDefault(); emit('error', event.reason); });
addEventListener('error', () => { recordDiagnostic('uncaught-error'); });
on('error', () => { recordDiagnostic('operation-failed'); });
start().catch(error => {
  console.error('ONEFLOW startup failed', error);
  document.querySelector('#main').replaceChildren(el('div', { class: 'stack' }, el('h1', {}, translate('m0593')), el('p', {}, translate('m0594')), el('p', {}, error.message), el('button', { onclick: () => location.reload() }, translate('m0595'))));
});

