import * as storage from './storage.js';
import {validate} from './schema.js';
import {remaining} from './timer-logic.js';
import {workDefaults} from './work-schema.js';
/** One persistence transaction shared by manual and worker-driven space switches. */
export async function switchStoredSpace(id,{pause,prepare=value=>value,validateState=()=>{}}={}){
 return navigator.locks.request('oneflow-spaces',async()=>{
  const current=storage.activeSpaceId();if(id===current)return false;
  const state=structuredClone(storage.get().spaces),target=state?.profiles.find(profile=>profile.id===id),previous=state?.profiles.find(profile=>profile.id===current);
  if(!target?.snapshot||!previous)throw new Error('Space no longer exists.');
  if(storage.get().timer.status==='running'){if(!pause)throw new Error('An active session prevents an automatic space switch.');await pause();}
  previous.snapshot=await storage.readLatest();delete previous.snapshot.spaces;previous.work=await storage.readWork();previous.notesPreferences=await storage.getNotesPreferences();
  const incoming=prepare(structuredClone(target.snapshot));state.activeId=id;incoming.spaces=state;
  const source=storage.get().settings.customization?.behavior,destination=incoming.settings.customization?.behavior;
  if(source&&destination)for(const key of ['spaceSchedule','spaceHotkey','automation','hotkeys','privacy','backupReminderDays'])if(Object.hasOwn(source,key))destination[key]=structuredClone(source[key]);
  incoming.audio.playing=false;incoming.flow={active:false,block:false,startedAt:0,snapshot:null};if(incoming.timer.status==='running'){incoming.timer.remaining=remaining(incoming.timer,Date.now());incoming.timer.status='paused';incoming.timer.endsAt=null;}
  validate(incoming);validateState(state);
  const old=storage.get(),oldWork=await storage.readWork(),oldPreferences=await storage.getNotesPreferences(),generation=await storage.sessionGet('data-generation');
  await navigator.locks.request('oneflow-backup',async()=>{try{await storage.sessionSet('data-generation',crypto.randomUUID());await storage.updateWork(work=>{for(const key of Object.keys(work))delete work[key];Object.assign(work,target.work||workDefaults());});await storage.setNotesPreferences(target.notesPreferences||{});await storage.replace(incoming);}catch(error){await storage.replace(old);await storage.updateWork(work=>{for(const key of Object.keys(work))delete work[key];Object.assign(work,oldWork);});await storage.setNotesPreferences(oldPreferences);await storage.sessionSet('data-generation',generation||null);throw error;}});
  return true;
 });
}
