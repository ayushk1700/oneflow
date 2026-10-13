import { get, readLatest, update, readWork as storageReadWork, updateWork as storageUpdateWork } from './storage.js';
import { getAll, getRecord, put, transaction } from './db.js';
import { remaining, freshTimer } from './timer-logic.js';
import { backgroundSync, timerCommand } from './timer-client.js';
import { safeURL } from './schema.js';
import { makeNote, saveNote } from './notes.js';
import { dayKey } from './utils.js';
import { updateJournal } from './journal.js';
import * as workSchema from './work-schema.js';
const {validateCapsule}=workSchema;
const readWork=()=>storageReadWork(workSchema), updateWork=change=>storageUpdateWork(change,workSchema);
const isExtension = () => Boolean(globalThis.chrome?.runtime?.id);
// Chrome can briefly omit both URL fields while a newly created tab commits.
// Keep only our returned tab IDs until a subsequent explicit restore observes them.
const openingTabs = new Map();
const syncAudio = async () => { if (isExtension()) await backgroundSync(); else await (await import('../components/sounds/index.js')).syncAudio(); };
/** Read only ordinary web tabs in the current non-private window on capture. */
export async function capsuleTabs() {
  if (!isExtension()) return [];
  if (!await chrome.permissions.contains({ permissions:['tabs'] })) throw new Error('Tab access is disabled. Save without tabs or enable tab capture.');
  const tabs = await chrome.tabs.query({ currentWindow:true });
  return tabs.filter(t=>!t.incognito && safeURL(t.pendingUrl || t.url)).slice(0,100).map(t=>({ title:(t.pendingUrl || t.title || t.url).slice(0,240), url:safeURL(t.pendingUrl || t.url) }));
}
/** Capture context without pausing the current timer or starting any media. */
export async function captureCapsule(name, resumeNote, includeTabs, noteIds) {
  const d = await readLatest(), allNotes = await getAll('notes');
  const selected = allNotes.filter(n=>n.state === 'active' && noteIds.includes(n.id));
  if (selected.length > 100 || d.tasks.filter(t=>!t.completed || t.id===d.timer.taskId).length > 100) throw new Error('Choose up to 100 notes and keep at most 100 active tasks for one capsule.');
  const tasks = d.tasks.filter(t=>!t.completed || t.id===d.timer.taskId);
  const capsule = validateCapsule({ id:crypto.randomUUID(), name:name.trim(), at:Date.now(), resumeNote:resumeNote.trim(),
    tabs:includeTabs ? await capsuleTabs() : [], notes:selected.map(n=>({ ...n, media:[] })),
    tasks, lists:d.lists, focus:d.focus, sceneId:d.sceneId, background:d.settings.background, timerConfig:d.timerConfig,
    audio:{ ...d.audio, playing:false, sleepAt:null },
    timer:{ phase:d.timer.phase, remaining:remaining(d.timer,Date.now()), taskId:d.timer.taskId, taskTitle:d.timer.taskTitle } });
  await updateWork(w=> { w.capsules.unshift(capsule); });
  return capsule;
}
/** Restore missing notes as capsule copies; never overwrite newer personal notes. */
async function restoreNotes(c) {
  for (const n of c.notes) {
    const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(n.id));
    const key=[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('').slice(0,32);
    const id = `capsule-${c.id.slice(0,55)}-${key}`;
    if (!await getRecord('notes',id)) await saveNote(makeNote({ ...n, id, revision:1, state:'active', reminderAt:null, createdAt:Date.now(), updatedAt:Date.now() }));
  }
}
/** Add absent tabs only. Never closes, navigates or duplicates existing work tabs. */
export async function reopenTabs(tabs) {
  return navigator.locks.request('oneflow-capsule-tabs',()=>reopenTabsLocked(tabs));
}
async function reopenTabsLocked(tabs) {
  if (!isExtension() || !tabs.length) return { opened:0, failed:0 };
  const canRead = await chrome.permissions.contains({ permissions:['tabs'] });
  if (!canRead) throw new Error('Enable tab access to restore saved tabs without duplicates, or restore context only.');
  const currentTabs = await chrome.tabs.query({ currentWindow:true }), present = new Set(currentTabs.map(t=>t.id));
  for (const id of openingTabs.keys()) if (!present.has(id)) openingTabs.delete(id);
  const open = new Set(currentTabs.map(tab => {
    const url = tab.pendingUrl || tab.url;
    if (url && url !== openingTabs.get(tab.id)) openingTabs.delete(tab.id);
    return url || openingTabs.get(tab.id);
  })), unique = new Set();
  let opened = 0, failed = 0;
  for (const tab of tabs) {
    const url = safeURL(tab.url);
    if (!url || open.has(url) || unique.has(url)) continue;
    unique.add(url);
    try { const created = await chrome.tabs.create({ url, active:false }); openingTabs.set(created.id,url); opened++; } catch { failed++; }
  }
  return { opened, failed };
}
/** Restore under the timer owner lock; an active interval is never replaced. */
export async function restoreCapsule(id, withTabs = false) {
  const c = (await readWork()).capsules.find(c=>c.id===id);
  if (!c) throw new Error('This capsule was deleted. Refresh your capsules.');
  validateCapsule(c);
  for (const [kind,store] of [['upload','images'],['video','wallpapers']]) if (c.background.kind === kind && !await getRecord(store,c.background.id)) throw new Error('The capsule wallpaper is missing. Restore it from a backup first.');
  await navigator.locks.request('oneflow-timer', async () => {
    const d = await readLatest();
    if (d.flow.active || d.timer.status !== 'idle' || d.timer.sessionId) throw new Error('Finish or reset your current session and leave Flow Mode before restoring this capsule.');
    await restoreNotes(c);
    await update(doc => {
      if (doc.flow.active || doc.timer.status !== 'idle' || doc.timer.sessionId) throw new Error('Your focus session changed. Finish it before restoring.');
      for (const l of c.lists) if (!doc.lists.some(x=>x.id===l.id)) doc.lists.push(l);
      for (const t of c.tasks) if (!doc.tasks.some(x=>x.id===t.id)) doc.tasks.push(t);
      doc.focus = structuredClone(c.focus); doc.focus.date = dayKey();
      doc.settings.background = structuredClone(c.background); doc.sceneId=c.sceneId;
      doc.timerConfig = structuredClone(c.timerConfig); doc.audio=structuredClone(c.audio);
      const duration = Math.max(60000,c.timer.remaining);
      doc.timer = { ...freshTimer(doc.timerConfig), phase:c.timer.phase, status:'paused', duration, remaining:duration,
        taskId:c.timer.taskId, taskTitle:c.timer.taskTitle || c.focus.text, revision:doc.timer.revision+1 };
      doc.settings.studio.automation.pausedUntil = Date.now()+2*3600000;
    });
    await updateWork(w=> { w.recovery={ id:`capsule-${c.id}`, taskId:c.timer.taskId, taskTitle:c.timer.taskTitle || c.focus.text || c.name, next:c.resumeNote, reason:'intentional pause', at:Date.now(), interruptions:0 }; });
  });
  await syncAudio();
  const tabs = withTabs ? await reopenTabs(c.tabs) : { opened:0, failed:0 };
  return { capsule:c, ...tabs };
}
function environment(d, timer, switchCounting) {
  return { id:timer.sessionId, at:timer.startedAt, hour:new Date(timer.startedAt).getHours(), minutes:timer.duration/60000,
    sound:d.audio.playing && d.audio.master > 0 ? Object.entries(d.audio.volumes).filter(([,v])=>v>0).map(([k])=>k).join(' + ') || 'quiet' : 'quiet',
    wallpaper:d.settings.background.id, energy:d.tasks.find(t=>t.id===timer.taskId)?.energy || 'normal', switchCounting, breakMinutes:d.timerConfig.short, interruptions:0, taskTitle:timer.taskTitle };
}
/** Timer transitions create idempotent local observations and recovery points. */
export async function observeTimer(before, after, records) {
  if(!records.length && before.sessionId===after.sessionId && before.status===after.status)return;
  const d = get(), work = await readWork();
  const completed = [];
  await updateWork(async w=> {
    for (const r of records) {
      const entry=w.journeys.firstSteps.find(x=>x.sessionId===r.id);if(entry)entry.state=r.completed?'finished':'rescued';
      if (w.learning && w.active?.id === r.id && w.active.minutes!==undefined) {const sample={ ...w.active, completed:r.completed, duration:r.duration };await put('focusSamples',sample);completed.push(sample);}
      if (w.recoveryEnabled && !r.completed) w.recovery={ id:r.id, taskId:r.taskId, taskTitle:r.taskTitle, next:w.recovery?.taskTitle===r.taskTitle ? w.recovery.next : '', reason:'', at:Date.now(), interruptions:w.active?.interruptions || 0 };
      if (w.active?.id===r.id) w.active=null;
      if (r.completed && w.recovery?.taskTitle===r.taskTitle) w.recovery=null;
    }
    if ((w.learning || w.recoveryEnabled) && after.sessionId && after.phase==='focus' && w.active?.id!==after.sessionId) w.active=w.learning && before.sessionId!==after.sessionId ? environment(d,after,w.countSwitches) : {id:after.sessionId,at:after.startedAt,taskTitle:after.taskTitle,interruptions:0};
    if (w.recoveryEnabled && before.status==='running' && after.status==='paused' && after.phase==='focus') w.recovery={ id:after.sessionId, taskId:after.taskId, taskTitle:after.taskTitle, next:w.recovery?.taskTitle===after.taskTitle ? w.recovery.next : '', reason:'', at:Date.now(), interruptions:w.active?.interruptions || 0 };
    if (!w.learning && !w.recoveryEnabled) w.active=null;
    if(after.sessionId && after.phase==='focus' && before.sessionId!==after.sessionId){
      const link=d.tasks.find(t=>t.id===after.taskId)?.journey;
      const entry=link?.kind==='firststep'?w.journeys.firstSteps.find(x=>x.id===link.id):null;
      if(entry){entry.state='started';entry.sessionId=after.sessionId;}
      const energy=w.journeys.energy.find(x=>x.sessionId===null&&x.after===null&&Date.now()-x.at<3600000);if(energy)energy.sessionId=after.sessionId;
    }
  });
  if (completed.length) {
    const rows = (await getAll('focusSamples')).sort((a,b)=>b.at-a.at);
    if (rows.length > 500) await transaction(['focusSamples'],store=>rows.slice(500).forEach(s=>store('focusSamples').delete(s.id)));
  }
  return work;
}
/** Opt-in counts describe switching, not the intent or content of a visit. */
export async function countInterruption() {
  const work=await readWork();
  if (!work.countSwitches || !work.active || (!work.learning && !work.recoveryEnabled)) return;
  await updateWork(w=> {
    if (!w.active || !w.countSwitches) return;
    w.active.interruptions=Math.min(100000,w.active.interruptions+1);
    if (w.recoveryEnabled && w.active.interruptions>=3 && (!w.recovery || w.recovery.taskTitle!==w.active.taskTitle)) w.recovery={ id:w.active.id, taskId:get().timer.taskId, taskTitle:w.active.taskTitle, next:'', reason:'', at:Date.now(), interruptions:w.active.interruptions };
  });
}
/** Save a lightweight checkpoint while keeping the timer's deadline intact. */
export async function recoveryPoint(next, reason = '', pause = false) {
  if (pause && get().timer.status==='running') await timerCommand('pause');
  const t = get().timer;
  await updateWork(w=> { w.recovery={ id:t.sessionId || crypto.randomUUID(), taskId:t.taskId, taskTitle:t.taskTitle || get().focus.text, next:next.trim().slice(0,2000), reason, at:Date.now(), interruptions:w.active?.interruptions || 0 }; });
}
/** Re-entry records an optional journal line and starts only on an explicit click. */
export async function reenter(minutes = null, withAudio = false, journal = false) {
  const work = await readWork(), t = get().timer;
  if (t.status==='running') throw new Error('A focus session is already running. Return to its timer.');
  if (minutes !== null) {
    if (!Number.isInteger(minutes) || minutes<1 || minutes>180) throw new Error('Choose a focus interval between 1 and 180 minutes.');
    if (t.sessionId) throw new Error('Resume your paused session to retain its history, or finish it before starting a short interval.');
    if (t.status==='paused') await timerCommand('reset');
    if (get().timer.phase!=='focus') await timerCommand('phase',{ phase:'focus' });
    const taskId=get().tasks.some(x=>x.id===work.recovery?.taskId) ? work.recovery.taskId : undefined;
    await timerCommand('start',{ focusMinutes:minutes, taskId, taskTitle:work.recovery?.taskTitle || t.taskTitle });
  } else await timerCommand('start');
  if (journal && work.recovery) {
    const line=`Returning to ${work.recovery.taskTitle || 'my focus'}. Next: ${work.recovery.next || 'choose one small action'}.`;
    try { await updateJournal(dayKey(),old=>({text:[old?.text,line].filter(Boolean).join('\n\n')})); }
    catch(error) { throw new Error(`${error.message} The timer started; your resume note is still saved.`); }
  }
  if (withAudio) { await update(d=> { d.audio.playing=true; }); try { await syncAudio(); } catch(error) { await update(d=> { d.audio.playing=false; }); throw error; } }
  await updateWork(w=> { w.recovery=null; });
}
/** Forget learning samples and in-flight conditions without deleting focus history. */
export async function clearLearning() {
  await navigator.locks.request('oneflow-timer', async () => {
    await updateWork(w=> { w.learning=false; w.countSwitches=false; w.active=null; });
    await transaction(['focusSamples'],store=>store('focusSamples').clear());
  });
}
