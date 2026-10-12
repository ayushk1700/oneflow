import { get, readWork, updateWork, update, readLatest } from './storage.js';
import { timerCommand } from './timer-client.js';
import { emit } from './events.js';
import { closePanel } from './ui.js';
import { getAll } from './db.js';
/** Persist one isolated workspace record through the shared local boundary. */
export async function addJourney(collection,value){const record={id:crypto.randomUUID(),at:Date.now(),...value};await updateWork(w=>w.journeys[collection].unshift(record));return record;}
/** Re-read before editing so another window's unrelated work is retained. */
export async function editJourney(collection,id,change){await updateWork(w=>{const record=w.journeys[collection].find(x=>x.id===id);if(!record)throw new Error('This record was deleted in another window. Reopen this tool.');change(record);});}
/** Delete only the named record, leaving its linked personal notes and history. */
export async function removeJourney(collection,id){await updateWork(w=>{w.journeys[collection]=w.journeys[collection].filter(x=>x.id!==id);});}
/** Create a linked task once; repeated clicks reuse the same durable ID. */
export async function journeyTask(kind,id,text,minutes=25,suffix=''){
  const key=`journey-${kind}-${id}-${suffix}`.slice(0,100);
  await update(d=>{const existing=d.tasks.find(t=>t.id===key);if(existing){existing.text=text.slice(0,240);existing.effort=minutes;}else d.tasks.push({id:key,text:text.slice(0,240),listId:'inbox',completed:false,createdAt:Date.now(),effort:minutes,sceneId:d.sceneId,journey:{kind,id}});});return key;
}
/** Start through the shared owner; never resets another active interval. */
export async function beginJourney(kind,id,text,minutes=25,suffix=''){
  const d=await readLatest();if(d.timer.status!=='idle'||d.timer.sessionId||d.flow.active)throw new Error('Finish or reset the current interval before starting this one.');
  const taskId=await journeyTask(kind,id,text,minutes,suffix);
  if(get().timer.phase!=='focus')await timerCommand('phase',{phase:'focus'});
  const before=(await readLatest()).timer;
  await timerCommand('start',{taskId,focusMinutes:minutes,expectedRevision:before.revision});
  const after=(await readLatest()).timer;if(after.status!=='running'||after.taskId!==taskId)throw new Error('The timer changed in another window. Your task is saved; start it when ready.');
  closePanel();emit('dashboard:view','focus');return after.sessionId;
}
/** Read workspace data with the history needed for explicit evidence linking. */
export async function journeyData(){const [work,sessions,notes]=await Promise.all([readWork(),getAll('sessions'),getAll('notes')]);return {j:work.journeys,sessions,notes,tasks:get().tasks};}
/** Work association is explicit task metadata, never inferred browser activity. */
export function linkedSessions(kind,id,sessions,tasks=get().tasks){const ids=new Set(tasks.filter(t=>t.journey?.kind===kind&&t.journey.id===id).map(t=>t.id));return sessions.filter(s=>ids.has(s.taskId));}
