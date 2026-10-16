import { get, subscribe } from './storage.js';
import { on, emit } from './events.js';
import { remaining } from './timer-logic.js';
import { timeText } from '../components/session-view/index.js';

let lastSession, mode = 'home';
let analogClock, loadingClock;
let ambient, loadingAmbient;
/** Change only the presentation; the background timer is never restarted. */
export function setView(value) {
  if (!['home', 'focus', 'ambient'].includes(value)) return;
  mode = value;
  document.documentElement.dataset.view = mode;
  for (const button of document.querySelectorAll('#view-switcher button')) button.setAttribute('aria-pressed', String(button.dataset.view === mode));
  render();
  // View switches must not strand keyboard focus in a now-hidden dock or editor.
  const focused = document.activeElement;
  if (focused !== document.body && !focused.checkVisibility({ visibilityProperty: true })) {
    (mode === 'focus' ? document.querySelector('#focus-exit') : document.querySelector('#home-menu > summary')).focus();
  }
}
function render() {
  const data = get(), timer = data.timer, active = timer.status !== 'idle' || Boolean(timer.sessionId) || timer.phase !== 'focus';
  const showClock = mode === 'ambient' && (data.settings.customization?.widgets.preferences.ambient.clock ?? true);
  if (mode === 'ambient' && !ambient && !loadingAmbient) loadingAmbient = import('../components/ambient/index.js').then(module => {
    ambient = module; module.init(); render();
  }).catch(error => emit('error', error)).finally(() => { loadingAmbient = null; });
  ambient?.render(mode === 'ambient');
  if (showClock && !analogClock && !loadingClock) {
    loadingClock = import('../components/ambient-clock/index.js').then(module => {
      analogClock = module; module.init(); render();
    }).catch(error => emit('error', error)).finally(() => { loadingClock = null; });
  }
  analogClock?.render(showClock);
  const compact = document.querySelector('#ambient-session');
  compact.hidden = mode !== 'ambient' || !active || !data.settings.widgets.timer;
  if (!compact.hidden) compact.textContent = `${timer.phase === 'focus' ? 'Focus' : 'Break'} · ${timeText(remaining(timer, Date.now()))}${timer.status === 'paused' ? ' · Paused' : ''}`;
  document.querySelector('#view-switcher [data-view=focus]').hidden = !data.settings.widgets.timer && !data.settings.widgets.focus;
  if (mode === 'focus' && !data.settings.widgets.timer && !data.settings.widgets.focus) setView('home');
}
/** Install the three local views and react only to a newly started session. */
export function init() {
  const data = get();
  lastSession = data.timer.sessionId;
  setView(lastSession || data.timer.phase !== 'focus' ? 'focus' : data.settings.appearance.defaultView);
  for (const button of document.querySelectorAll('#view-switcher button')) button.onclick = () => setView(button.dataset.view);
  document.querySelector('#ambient-session').onclick = () => setView('focus');
  on('dashboard:view', setView);
  subscribe(data => {
    if (data.timer.sessionId && data.timer.sessionId !== lastSession && mode !== 'ambient') setView('focus');
    lastSession = data.timer.sessionId;
    render();
  });
  setInterval(render, 1000);
}
