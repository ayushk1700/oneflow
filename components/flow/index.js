import { t as translate } from '../../core/i18n.js';
import { get, update, subscribe } from '../../core/storage.js';
import { el } from '../../core/utils.js';
import { closePanel, openPanel, act } from '../../core/ui.js';
import { emit } from '../../core/events.js';
import { createSessionView } from '../session-view/index.js';
import { remaining } from '../../core/timer-logic.js';
import { timerCommand, backgroundSync } from '../../core/timer-client.js';
import { snapshot, sceneById, applySnapshot } from '../../core/scenes.js';
let session, root,
  interval, idleTimer,
  unsubscribe,
  leaving = false,
  opening = false;
/** Start fullscreen within the trusted click, then apply the selected scene. */
export async function enter() {
  if (opening) return;
  opening = true;
  const fullscreen = !document.fullscreenElement && document.documentElement.requestFullscreen?.().catch(() => emit('toast', translate('m0176')));
  try {
    closePanel();
    if (!get().flow.active) {
      if (globalThis.chrome?.runtime?.id) {
        const r = await chrome.runtime.sendMessage({
          target: 'worker',
          type: 'flow-start',
          sceneId: get().sceneId,
          block: get().blocker.enabled
        });
        if (!r?.ok) throw new Error(r?.error || translate('m0177'));
      } else {
        if (get().blocker.enabled) throw new Error(translate('m0178'));
        const value = await sceneById(get().sceneId);
        const previous = get().timer;
        const continuing = Boolean(previous.sessionId) || previous.status !== 'idle' || previous.phase !== 'focus';
        await update(d => {
          const before = snapshot(d);
          applySnapshot(d, value);
          if (continuing) d.timer = previous;
          d.flow = {
            active: true,
            block: false,
            startedAt: Date.now(),
            snapshot: before
          };
        });
        if (!continuing) await timerCommand('start', {
          taskTitle: get().focus.text
        });
        await (await import('../sounds/index.js')).syncAudio();
      }
    }
    await fullscreen;
    render();
    if (!root.open) root.showModal();
    root.querySelector('.session-title')?.focus();wake();
  } catch (error) {
    if (document.fullscreenElement) await document.exitFullscreen();
    throw error;
  } finally {
    opening = false;
  }
}
export async function leave() {
  if (leaving) return;
  leaving = true;
  try {
    let summary = {
      minutes: 0,
      sessions: 0
    };
    if (globalThis.chrome?.runtime?.id) {
      const r = await chrome.runtime.sendMessage({
        target: 'worker',
        type: 'flow-stop'
      });
      if (!r?.ok) throw new Error(r?.error || translate('m0179'));
      summary = r.summary;
    } else {
      summary.minutes = Math.round((get().timer.duration - remaining(get().timer, Date.now())) / 60000);
      await update(d => {
        const timer = structuredClone(d.timer);
        if (d.flow.snapshot) applySnapshot(d, d.flow.snapshot);
        d.timer = timer;
        d.flow = {
          active: false,
          block: false,
          startedAt: 0,
          snapshot: null
        };
      });
      await (await import('../sounds/index.js')).syncAudio();
    }
    root.close();
    if (document.fullscreenElement) await document.exitFullscreen();
    const content=el('div',{class:'stack'});openPanel(translate('m0645'),'flow-summary',content);
    const current=get().timer;const followup=await import('../session-enhancements/index.js');if(content.isConnected)followup.summary(content,{taskId:current.taskId,taskTitle:current.taskTitle,duration:summary.minutes*60000,completed:false},{recorded:false});
  } finally {
    leaving = false;
  }
}
export function render() {
  if (!root) return;
  session.render();
  const data = get();
  root.querySelector('[data-sound]').textContent = data.audio.playing ? translate('m0184') : translate('m0185');
  root.querySelector('.flow-block-status').textContent = data.flow.block && data.timer.status === 'running' && data.timer.phase === 'focus' ? translate('m0186') : translate('m0187');
  if (!data.flow.active && root.open && !leaving) root.close();
}
function wake(){if(!root)return;root.dataset.idle='false';clearTimeout(idleTimer);idleTimer=setTimeout(()=>{if(root.open&&get().timer.status==='running'&&!root.querySelector('details[open]')&&!root.querySelector('button:focus,input:focus,summary:focus,textarea:focus'))root.dataset.idle='true';},4000);}
export function init() {
  session = createSessionView({ fullscreen: true });
  root = el('dialog', { id: 'flow-view', 'aria-label': translate('Fullscreen focus session') },
    el('header', { class: 'flow-header' }, el('span', { class: 'eyebrow' }, 'ONEFLOW / FLOW MODE'), el('button', { onclick: act(leave) }, translate('m0189'))),
    el('div', { class: 'flow-content stack' }, session.root,
      el('details', { class: 'flow-sound-controls' }, el('summary', {}, translate('Sound controls')),
      el('div', { class: 'row flow-actions' },
        el('button', { 'data-sound': '', onclick: act(async () => {
          await update(data => { data.audio.playing = !data.audio.playing; });
          if (globalThis.chrome?.runtime?.id) await backgroundSync();
          else await (await import('../sounds/index.js')).syncAudio();
        }) }, translate('m0185'))),
      el('label', { class: 'field' }, translate('m0190'), el('input', {
        type: 'range', min: 0, max: 100, value: get().audio.master * 100, 'aria-label': translate('m0191'),
        onchange: act(async event => {
          await update(data => { data.audio.master = Number(event.target.value) / 100; });
          if (globalThis.chrome?.runtime?.id) await backgroundSync();
          else await (await import('../sounds/index.js')).syncAudio();
        })
      }))), el('p', { class: 'flow-block-status', role: 'status' })));
  for(const event of ['pointermove','pointerdown','keydown','focusin','focusout'])root.addEventListener(event,wake);
  root.addEventListener('cancel', e => {
    e.preventDefault();
    act(leave)();
  });
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && root.open && !opening && !leaving) act(leave)();
  });
  document.body.append(root);
  unsubscribe = subscribe(render);
  interval = setInterval(render, 1000);
  render();
}
export function destroy() {
  clearInterval(interval);clearTimeout(idleTimer);
  unsubscribe?.();
  session?.destroy();
  root?.remove();
}
