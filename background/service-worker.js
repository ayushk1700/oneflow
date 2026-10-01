import * as storage from '../core/storage.js';
import { runTimer } from '../core/timer-engine.js';
import { remaining } from '../core/timer-logic.js';
import { dayKey } from '../core/utils.js';
let creatingAudio, serial = Promise.resolve();
const enqueue = job => { const work = serial.then(job); serial = work.catch(error => console.error('Background operation failed', error)); return work; };
async function audioMessage(message) {
  const contexts = await chrome.runtime.getContexts({ contextTypes: ['OFFSCREEN_DOCUMENT'] });
  if (!contexts.length) {
    if (!creatingAudio) creatingAudio = chrome.offscreen.createDocument({ url: 'background/audio/index.html', reasons: ['AUDIO_PLAYBACK'], justification: 'Play the requested local sound mix and timer chime while new tabs are closed.' }).finally(() => { creatingAudio = null; });
    await creatingAudio;
  }
  const result = await chrome.runtime.sendMessage({ target: 'audio', ...message });
  if (!result?.ok) throw new Error(result?.error || 'Local audio did not respond.');
  return result;
}
async function syncAudio() {
  const a = storage.get().audio;
  if (a.playing && Object.values(a.volumes).some(v => v > 0)) await audioMessage({ type: 'mix', config: a });
  else if ((await chrome.runtime.getContexts({ contextTypes: ['OFFSCREEN_DOCUMENT'] })).length) await chrome.runtime.sendMessage({ target: 'audio', type: 'stop' });
  if (a.playing && a.sleepAt) await chrome.alarms.create('oneflow-audio-sleep', { when: Math.max(Date.now() + 1, a.sleepAt) });
  else await chrome.alarms.clear('oneflow-audio-sleep');
}
async function schedule() {
  const d = storage.get(), t = d.timer;
  if (t.status === 'running') {
    await chrome.alarms.create('oneflow-timer-end', { when: Math.max(Date.now() + 1, t.endsAt) });
    if (!await chrome.alarms.get('oneflow-timer-pulse')) await chrome.alarms.create('oneflow-timer-pulse', { periodInMinutes: 1 });
  } else { await chrome.alarms.clear('oneflow-timer-end'); await chrome.alarms.clear('oneflow-timer-pulse'); }
  await chrome.action.setBadgeBackgroundColor({ color: '#385b48' });
  await chrome.action.setBadgeText({ text: t.status === 'running' ? String(Math.ceil(remaining(t, Date.now()) / 60000)) : t.status === 'paused' ? 'Ⅱ' : '' });
  await chrome.action.setTitle({ title: `ONEFLOW · ${t.phase === 'focus' ? 'Focus' : 'Break'} · ${t.status}` });
  const expected = new Set();
  for (const habit of d.habits) if (habit.reminder) {
    const name = `oneflow-habit-${habit.id}`, date = new Date(), [hour, minute] = habit.reminder.split(':').map(Number);
    date.setHours(hour, minute, 0, 0); if (date.getTime() <= Date.now()) date.setDate(date.getDate() + 1);
    const existing = await chrome.alarms.get(name);
    if (!existing || Math.abs(existing.scheduledTime - date.getTime()) > 1000) await chrome.alarms.create(name, { when: date.getTime() });
    expected.add(name);
  }
  for (const alarm of await chrome.alarms.getAll()) if (alarm.name.startsWith('oneflow-habit-') && !expected.has(alarm.name)) await chrome.alarms.clear(alarm.name);
}
async function notifyPhase() {
  const { timerNotice: notice, timerConfig: c, timer } = storage.get();
  if (!notice) return;
  const next = timer.phase === 'focus' ? 'Time for a fresh focus session.' : 'Your break is ready. Stretch, breathe, or look into the distance.';
  if (c.notifications) await chrome.notifications.create(`oneflow-phase-${notice.id}`, { type: 'basic', iconUrl: chrome.runtime.getURL('assets/icons/icon-128.png'), title: notice.finishedPhase === 'focus' ? 'A little progress, made.' : 'Welcome back.', message: next });
  if (c.chime) await audioMessage({ type: 'chime' });
  await storage.update(d => { if (d.timerNotice?.id === notice.id) d.timerNotice = null; });
}
async function reconcile(action = 'tick', payload = {}) {
  await runTimer(action, payload); await schedule();
  await notifyPhase().catch(error => console.warn('Phase notification unavailable:', error.message));
}
const ready = storage.init();
chrome.runtime.onMessage.addListener((message, sender, respond) => {
  if (message?.target !== 'worker' || sender.id !== chrome.runtime.id) return false;
  enqueue(async () => {
    await ready;
    if (message.type === 'timer') {
      if (!['tick','start','pause','skip','reset','task'].includes(message.action)) throw new Error('Invalid timer command.');
      await reconcile(message.action, message.payload || {});
    } else if (message.type === 'sync') { await reconcile(); await syncAudio(); }
    else if (message.type === 'audio-slept') { await storage.update(d => { d.audio.playing = false; d.audio.sleepAt = null; }); await syncAudio(); }
    else throw new Error('Unknown background request.');
    return { ok: true };
  }).then(respond, error => respond({ ok: false, error: error.message })); return true;
});
chrome.alarms.onAlarm.addListener(alarm => enqueue(async () => {
  await ready;
  if (alarm.name === 'oneflow-audio-sleep') { await storage.update(d => { d.audio.playing = false; d.audio.sleepAt = null; }); await syncAudio(); }
  else if (alarm.name.startsWith('oneflow-habit-')) {
    const habit = storage.get().habits.find(h => `oneflow-habit-${h.id}` === alarm.name);
    if (habit && !habit.dates.includes(dayKey())) await chrome.notifications.create(alarm.name, { type: 'basic', iconUrl: chrome.runtime.getURL('assets/icons/icon-128.png'), title: 'A small promise to yourself', message: habit.name });
  }
  await reconcile();
}));
chrome.runtime.onStartup.addListener(() => enqueue(async () => { await ready; await storage.update(d => { d.audio.playing = false; d.audio.sleepAt = null; }); await reconcile(); }));
chrome.runtime.onInstalled.addListener(() => enqueue(async () => { await ready; await reconcile(); }));
chrome.action.onClicked.addListener(() => chrome.tabs.create({ url: 'newtab/index.html' }));
// Alarms can disappear across browser upgrades: rebuild on every worker activation.
enqueue(async () => { await ready; await reconcile(); });
