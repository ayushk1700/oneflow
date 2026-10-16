import { t } from '../../core/i18n.js';
import { get, update, subscribe } from '../../core/storage.js';
import { getRecord } from '../../core/db.js';
import { el, inputActive } from '../../core/utils.js';
import { closePanel, openPanel, act, button } from '../../core/ui.js';
import { emit } from '../../core/events.js';
import { createSessionView } from '../session-view/index.js';
import { timerCommand, backgroundSync } from '../../core/timer-client.js';
import { snapshot, sceneById, applySnapshot } from '../../core/scenes.js';
import { hotkeyMatches } from '../../core/power-hotkeys.js';

let session, root, interval, unsubscribe, returnFocus;
let leaving = false, opening = false, saving = false, pendingFinish = null;

/** Open the shared timer in Flow; browser fullscreen remains an explicit choice.
 * @param {{preserveScene?: boolean}} options
 */
export async function enter({ preserveScene = true } = {}) {
  if (opening || root?.open) return;
  opening = true;
  returnFocus = document.activeElement;
  try {
    closePanel();
    if (!get().flow.active) {
      if (globalThis.chrome?.runtime?.id) {
        const response = await chrome.runtime.sendMessage({
          target: 'worker', type: 'flow-start', sceneId: get().sceneId,
          block: get().blocker.enabled, preserveScene
        });
        if (!response?.ok) throw new Error(response?.error || t('m0177'));
      } else {
        if (get().blocker.enabled) throw new Error(t('m0178'));
        const value = preserveScene ? null : await sceneById(get().sceneId);
        const previous = get().timer;
        const continuing = Boolean(previous.sessionId) || previous.status !== 'idle' || previous.phase !== 'focus';
        await update(data => {
          const before = preserveScene ? null : snapshot(data);
          if (value) applySnapshot(data, value);
          if (continuing) data.timer = previous;
          data.flow = { active: true, block: false, startedAt: Date.now(), snapshot: before };
        });
        if (!continuing) await timerCommand('start', { taskTitle: get().focus.text });
        await (await import('../sounds/index.js')).syncAudio();
      }
    }
    render();
    root.showModal();
    root.querySelector('.session-title')?.focus();
  } finally {
    opening = false;
  }
}

/** Return to Home without interrupting the current deadline. */
export async function leave() {
  if (leaving || saving) return;
  leaving = true;
  try {
    if (globalThis.chrome?.runtime?.id) {
      const response = await chrome.runtime.sendMessage({ target: 'worker', type: 'flow-stop' });
      if (!response?.ok) throw new Error(response?.error || t('m0179'));
    } else {
      await update(data => {
        const timer = structuredClone(data.timer);
        if (data.flow.snapshot) applySnapshot(data, data.flow.snapshot);
        data.timer = timer;
        data.flow = { active: false, block: false, startedAt: 0, snapshot: null };
      });
      await (await import('../sounds/index.js')).syncAudio();
    }
    root.close();
    if (document.fullscreenElement) await document.exitFullscreen();
    emit('dashboard:view', 'home');
    if (returnFocus?.isConnected && returnFocus.checkVisibility()) returnFocus.focus();
    else document.querySelector('#focus .focus-start')?.focus();
  } finally {
    leaving = false;
  }
}

/** Record through the shared outbox before showing a saved confirmation. */
async function finish() {
  if (saving) return;
  saving = true;
  pendingFinish ??= structuredClone(get().timer);
  render();
  let record;
  try {
    if (pendingFinish.sessionId && get().timer.sessionId && pendingFinish.sessionId !== get().timer.sessionId) throw new Error('Another session is running. Return home to manage it before retrying.');
    const result = await timerCommand(pendingFinish.phase === 'focus' ? 'reset' : 'skip');
    if (result.timer?.sessionId || result.timer?.phase !== 'focus') throw new Error('The timer changed in another tab. Please try again.');
    record = pendingFinish.phase === 'focus' && pendingFinish.sessionId ? await getRecord('sessions', pendingFinish.sessionId) : null;
    pendingFinish = null;
  } finally {
    saving = false;
    render();
  }
  await leave();
  if (record) showSaved(record);
}

/** A short receipt keeps reflection and task management out of the stop action. */
function showSaved(record) {
  const duration = record.duration < 60000 ? 'Less than a minute' : `${Math.floor(record.duration / 60000)} min ${Math.floor(record.duration / 1000) % 60} sec`;
  const content = el('div', { class: 'flow-receipt stack' },
    el('p', { class: 'flow-saved-time' }, duration),
    el('p', { class: 'muted' }, record.taskTitle || 'Time for yourself'),
    el('p', { role: 'status' }, 'Added to your focus stats.'),
    el('div', { class: 'row wrap' },
      el('button', { class: 'primary', onclick: closePanel }, 'Done'),
      el('button', { class: 'text-button', onclick: act(async () => {
        await (await import('../../core/features.js')).openFeature('stats');
      }) }, 'View stats')));
  openPanel('Focus saved', 'flow-summary', content);
}

/** Refresh the shared countdown and conditional controls without recreating the shell. */
export function render() {
  if (!root) return;
  if (!pendingFinish) session.render();
  const data = get();
  root.querySelector('[data-sound]').textContent = data.audio.playing ? 'Pause sounds' : 'Play sounds';
  const volume = root.querySelector('input[type=range]');
  if (volume !== document.activeElement) volume.value = data.audio.master * 100;
  const blocker = root.querySelector('.flow-block-status');
  blocker.hidden = !data.flow.block;
  blocker.textContent = data.timer.status === 'running' && data.timer.phase === 'focus' ? t('m0186') : 'Website blocking paused';
  root.querySelector('[data-fullscreen]').textContent = document.fullscreenElement ? 'Exit fullscreen' : 'Fullscreen';
  for (const control of root.querySelectorAll('.session-actions button, .flow-back')) control.disabled = saving;
  const stop = root.querySelector('.focus-finish');
  if (stop && pendingFinish) stop.textContent = saving ? 'Saving…' : 'Retry save';
  if (!data.flow.active && root.open && !leaving && !saving && !pendingFinish) root.close();
}

function fullscreenChanged() { render(); }
function keydown(event) {
  if (event.defaultPrevented || event.repeat || event.isComposing || inputActive(event.target) || event.target.closest('button,a,summary,input,[role=button]')) return;
  const binding = get().settings.customization?.behavior?.hotkeys?.timer || 'Space';
  if (!hotkeyMatches(event, binding) || saving || pendingFinish) return;
  event.preventDefault();
  act(() => timerCommand(get().timer.status === 'running' ? 'pause' : 'start'))();
}

/** Mount the calm Flow shell around the shared session. */
export function init() {
  if (root) return;
  session = createSessionView({ fullscreen: true, onFinish: finish });
  root = el('dialog', { id: 'flow-view', 'aria-label': 'Flow focus session' },
    el('header', { class: 'flow-header' },
      button('Back to home', 'arrow-left', act(leave), 'text-button flow-back'),
      el('span', { class: 'eyebrow' }, 'ONEFLOW / FLOW'),
      el('button', { class: 'text-button', 'data-fullscreen': '', hidden: !document.fullscreenEnabled,
        onclick: act(() => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()) }, 'Fullscreen')),
    el('div', { class: 'flow-content stack' }, session.root),
    el('footer', { class: 'flow-footer' },
      el('details', { class: 'flow-sound-controls' }, el('summary', {}, 'Sounds'),
        el('div', { class: 'stack flow-sound-body' },
          el('button', { 'data-sound': '', onclick: act(async () => {
            await update(data => { data.audio.playing = !data.audio.playing; });
            await syncAudio();
          }) }, 'Play sounds'),
          el('label', { class: 'field' }, 'Volume', el('input', {
            type: 'range', min: 0, max: 100, value: get().audio.master * 100, 'aria-label': 'Sound volume',
            onchange: act(async event => {
              await update(data => { data.audio.master = Number(event.target.value) / 100; });
              await syncAudio();
            })
          })))),
      el('p', { class: 'flow-block-status', role: 'status' })));
  root.addEventListener('keydown', keydown);
  root.addEventListener('cancel', event => { event.preventDefault(); act(leave)(); });
  document.addEventListener('fullscreenchange', fullscreenChanged);
  document.body.append(root);
  unsubscribe = subscribe(render);
  interval = setInterval(render, 1000);
  render();
}

async function syncAudio() {
  if (globalThis.chrome?.runtime?.id) await backgroundSync();
  else await (await import('../sounds/index.js')).syncAudio();
}

/** Release the view and its listeners; timer ownership stays in the background. */
export function destroy() {
  clearInterval(interval);
  unsubscribe?.();
  document.removeEventListener('fullscreenchange', fullscreenChanged);
  session?.destroy();
  root?.remove();
  root = session = null;
}
