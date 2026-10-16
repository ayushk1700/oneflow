import { t as translate, setLanguage } from '../core/i18n.js';
import { syncBlocker, recoverFlow, startFlow, stopFlow, blockedRequest, scheduleReminders, notifyReminder } from './focus-service.js';
import * as storage from '../core/storage.js';
import { runTimer } from '../core/timer-engine.js';
import { remaining } from '../core/timer-logic.js';
import { dayKey } from '../core/utils.js';
import { searchPexels } from './pexels.js';
import { processStudio, scheduleStudio } from './studio.js';
import { record as recordNotice } from '../core/notifications.js';
import { initNotesService } from './notes-service.js';
import { countInterruption } from '../core/work-context.js';
import { workerMessageAllowed } from '../core/message-policy.js';
import { notify } from '../core/system-notifications.js';
import * as database from '../core/database-store.js';
import { useDatabaseDriver } from '../core/db.js';
import * as workSchema from '../core/work-schema.js';
import * as notesPreferences from '../core/notes-preferences.js';
import {registerModule} from '../core/module-registry.js';
import * as recovery from '../core/storage-recovery.js';
import {processRules} from '../core/automation-worker.js';
registerModule('database',database);
registerModule('work',workSchema);
registerModule('notes-preferences',notesPreferences);
registerModule('recovery',recovery);
storage.useStorageSchemas({ work: workSchema, notes: notesPreferences });
useDatabaseDriver(database);
initNotesService();
let creatingAudio, serial = Promise.resolve();
const enqueue = job => { const work = serial.then(job); serial = work.catch(error => console.error(translate('m0604'), error)); return work; };
async function audioMessage(message) {
  const contexts = await chrome.runtime.getContexts({ contextTypes: ['OFFSCREEN_DOCUMENT'] });
  if (!contexts.length) {
    if (!creatingAudio) creatingAudio = chrome.offscreen.createDocument({ url: 'background/audio/index.html', reasons: ['AUDIO_PLAYBACK'], justification: translate('m0605') }).finally(() => { creatingAudio = null; });
    await creatingAudio;
  }
  const result = await chrome.runtime.sendMessage({ target: 'audio', ...message });
  if (!result?.ok) throw new Error(result?.error || translate('m0606'));
  return result;
}
async function syncAudio() {
  const a = storage.get().audio;
  if (a.playing && Object.values(a.volumes).some(v => v > 0)) await audioMessage({ type: 'mix', config: { ...a, fade: storage.get().settings.studio.phaseSounds.fade } });
  else if ((await chrome.runtime.getContexts({ contextTypes: ['OFFSCREEN_DOCUMENT'] })).length) await chrome.runtime.sendMessage({ target: 'audio', type: 'stop' });
  if (a.playing && a.sleepAt) await chrome.alarms.create('oneflow-audio-sleep', { when: Math.max(Date.now() + 1, a.sleepAt) });
  else await chrome.alarms.clear('oneflow-audio-sleep');
}
async function schedule() {
  const d = storage.get(), t = d.timer;
  if(d.settings.customization?.behavior?.automation?.enabled)await chrome.alarms.create('oneflow-power-rules',{periodInMinutes:1});else await chrome.alarms.clear('oneflow-power-rules');
  if (t.status === 'running') {
    await chrome.alarms.create('oneflow-timer-end', { when: Math.max(Date.now() + 1, t.endsAt) });
    if (!await chrome.alarms.get('oneflow-timer-pulse')) await chrome.alarms.create('oneflow-timer-pulse', { periodInMinutes: 1 });
  } else { await chrome.alarms.clear('oneflow-timer-end'); await chrome.alarms.clear('oneflow-timer-pulse'); }
  await chrome.action.setBadgeBackgroundColor({ color: '#385b48' });
  await chrome.action.setBadgeText({ text: t.status === 'running' ? String(Math.ceil(remaining(t, Date.now()) / 60000)) : t.status === 'paused' ? 'Ⅱ' : '' });
  await chrome.action.setTitle({ title: `ONEFLOW notes · ${t.phase === 'focus' ? translate('m0504') : translate('m0607')} · ${t.status}` });
  const reminder=d.settings.customization?.widgets.preferences.journal.reminder;
  if(reminder){const date=new Date(),[hour,minute]=reminder.split(':').map(Number);date.setHours(hour,minute,0,0);if(date.getTime()<=Date.now())date.setDate(date.getDate()+1);await chrome.alarms.create('oneflow-journal-reminder',{when:date.getTime()});}else await chrome.alarms.clear('oneflow-journal-reminder');
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
  return navigator.locks.request('oneflow-backup', async () => {
  const { timerNotice: notice, timerConfig: c, timer } = storage.get();
  if (!notice) return;
  const next = timer.phase === 'focus' ? translate('m0608') : translate('m0609');
  if (c.notifications) await recordNotice(next, 'success', `oneflow-phase-${notice.id}`);
  if (c.notifications) await notify(`oneflow-phase-${notice.id}`, { type: 'basic', iconUrl: chrome.runtime.getURL('assets/icons/icon-128.png'), title: notice.finishedPhase === 'focus' ? translate('m0676') : translate('m0610'), message: next });
  if (c.chime) await audioMessage({ type: 'chime', options: storage.get().settings.studio.interaction });
  await storage.update(d => { if (d.timerNotice?.id === notice.id) d.timerNotice = null; });
  });
}
async function reconcile(action = 'tick', payload = {}) {
  setLanguage(storage.get().settings.language);
  await syncBlocker();
  await runTimer(action, payload); await processRules();await schedule(); await syncBlocker(); await scheduleReminders();
  if (await processStudio()) await syncAudio(); await scheduleStudio();
  await notifyPhase().catch(error => console.warn(translate('m0611'), error.message));
}
const ready = storage.init().then(recoverFlow).catch(async error => {
  const rules = await chrome.declarativeNetRequest.getSessionRules();
  await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: rules.map(rule => rule.id) });
  throw error;
});
chrome.runtime.onMessage.addListener((message, sender, respond) => {
  if (message?.target !== 'worker' || sender.id !== chrome.runtime.id) return false;
  if (!workerMessageAllowed(message, sender, chrome.runtime.getURL('/'))) { respond({ ok: false, error: 'This page cannot perform that action.' }); return false; }
  if (message.type === 'pexels-search') {
    if (sender.url !== chrome.runtime.getURL('newtab/index.html')) return false;
    // Network requests must not hold the timer/alarm serialization queue.
    ready.then(() => searchPexels(message))
      .then(data => respond({ ok: true, data }), error => respond({ ok: false, error: error.message }));
    return true;
  }
  enqueue(async () => {
    await ready;
    if (message.type === 'flow-start') { await startFlow(message.sceneId, Boolean(message.block), Boolean(message.preserveScene)); await reconcile(); await syncAudio(); }
    else if (message.type === 'flow-stop') { const summary = await stopFlow(); await reconcile(); await syncAudio(); return { ok: true, summary }; }
    else if (['blocked', 'override'].includes(message.type)) {
      return { ok: true, ...await blockedRequest(message.url, message.type === 'override') };
    }
    else if (message.type === 'timer') {
      if (!['tick','start','pause','skip','reset','task','continue','phase','restore'].includes(message.action)) throw new Error(translate('m0612'));
      await reconcile(message.action, message.payload || {});
      return { ok: true, timer: storage.get().timer };
    } else if (message.type === 'rules') {await processRules({tabOpened:Boolean(message.tabOpened),tabId:sender.tab?.id||''});await schedule();}
    else if (message.type === 'sync') { await reconcile(); await syncAudio(); }
    else if (message.type === 'test-alert') { await audioMessage({ type: 'chime', options: storage.get().settings.studio.interaction }); }
    else if (message.type === 'audio-slept') { await storage.update(d => { d.audio.playing = false; d.audio.sleepAt = null; }); await syncAudio(); }
    else throw new Error(translate('m0613'));
    return { ok: true };
  }).then(respond, error => respond({ ok: false, error: error.message })); return true;
});
chrome.alarms.onAlarm.addListener(alarm => enqueue(async () => {
  await ready;
  if (alarm.name.startsWith('oneflow-ritual-') || alarm.name === 'oneflow-backup-reminder') await notifyReminder(alarm.name);
  if (alarm.name === 'oneflow-audio-sleep') { await storage.update(d => { d.audio.playing = false; d.audio.sleepAt = null; }); await syncAudio(); }
  else if(alarm.name==='oneflow-journal-reminder') {if(storage.get().settings.customization?.widgets.preferences.journal.reminder){await recordNotice('A moment for your journal','info',alarm.name+'-'+dayKey());await notify(alarm.name,{type:'basic',iconUrl:chrome.runtime.getURL('assets/icons/icon-128.png'),title:'ONEFLOW Journal',message:'Take a moment to reflect on your day.'});}}
  else if (alarm.name.startsWith('oneflow-habit-')) {
    await navigator.locks.request('oneflow-backup', async () => {
    const habit = storage.get().habits.find(h => `oneflow-habit-${h.id}` === alarm.name);
    if (habit && !habit.dates.includes(dayKey())) await recordNotice(`${translate('m0677')}: ${habit.name}`, 'info', `${alarm.name}-${dayKey()}`);
    if (habit && !habit.dates.includes(dayKey())) await notify(alarm.name, { type: 'basic', iconUrl: chrome.runtime.getURL('assets/icons/icon-128.png'), title: translate('m0677'), message: habit.name });
    });
  }
  await reconcile();
  await syncAudio();
}));
chrome.runtime.onStartup.addListener(() => enqueue(async () => { await ready; await recoverFlow(); await storage.update(d => { d.audio.playing = false; d.audio.sleepAt = null; }); await reconcile(); }));
chrome.runtime.onInstalled.addListener(() => enqueue(async () => { await ready; await reconcile(); }));
// Alarms can disappear across browser upgrades: rebuild on every worker activation.
enqueue(async () => { await ready; await reconcile(); });

chrome.permissions.onRemoved.addListener(() => enqueue(async () => { await ready; await reconcile(); }));
// Only counts activation events when explicitly enabled; never reads visited URLs.
chrome.tabs.onActivated.addListener(() => enqueue(async () => {
  await ready;
  if (storage.get().timer.status === 'running' && storage.get().timer.phase === 'focus') await countInterruption();
}));
