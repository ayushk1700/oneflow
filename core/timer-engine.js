import { t as translate } from './i18n.js';
import * as storage from './storage.js';
import { put } from './db.js';
import { command, advance } from './timer-logic.js';
import { observeTimer } from './work-context.js';
/** Persist state plus an outbox, then idempotently materialize focus records. */
export async function runTimer(action = 'tick', payload = {}) {
  return navigator.locks.request('oneflow-timer', async () => {
    await storage.init();
    let before;
    const now = Date.now(), id = crypto.randomUUID();
    await storage.update(d => {
      before=structuredClone(d.timer);
      if (action === 'task' || (action === 'start' && payload.taskId && d.timer.status === 'idle')) { const task = d.tasks.find(t => t.id === payload.taskId); if (!task) throw new Error(translate('m0122')); payload = { ...payload, taskTitle: task.text }; }
      const next = action === 'tick' ? advance(d.timer, d.timerConfig, now, id) : command(d.timer, d.timerConfig, action, now, id, payload);
      if (action === 'start' && payload.focusMinutes !== undefined && d.timer.status === 'idle' && d.timer.phase === 'focus' && next.timer.status === 'running' && (payload.expectedRevision === undefined || payload.expectedRevision === d.timer.revision)) d.timerConfig.focus = payload.focusMinutes;
      d.timer = next.timer; d.sessionOutbox.push(...next.records); if (next.notice) d.timerNotice = next.notice;
      if (next.records.length) d.lastFocusSession = next.records.at(-1);
    });
    const pending = storage.get().sessionOutbox;
    for (const session of pending) await put('sessions', session);
    let contextSaved=true;
    try { await observeTimer(before, storage.get().timer, pending); }
    catch (error) { contextSaved=false; console.warn('Focus context save failed; timer remains available.', error.message); }
    if (pending.length && contextSaved) await storage.update(d => { const ids = new Set(pending.map(s => s.id)); d.sessionOutbox = d.sessionOutbox.filter(s => !ids.has(s.id)); });
    return storage.get();
  });
}
