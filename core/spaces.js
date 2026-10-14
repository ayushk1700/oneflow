import * as storage from './storage.js';
import * as settings from './customization.js';
import * as db from './db.js';
import { defaults as documentDefaults, validate } from './schema.js';
import { migrateSettings } from './customization-schema.js';
import { freshTimer, remaining } from './timer-logic.js';
import { timerCommand, backgroundSync } from './timer-client.js';
import { emit } from './events.js';
import { workDefaults,validateWork } from './work-schema.js';
const lock=job=>navigator.locks.request('oneflow-spaces',job);
const snapshot=document=>{const next=structuredClone(document);delete next.spaces;return next;};
export function registry(document=storage.get()){return structuredClone(document.spaces?{...document.spaces,activeId:document.spaces.activeId||document.settings.customization?.behavior?.spaceId||'default'}:{schemaVersion:1,activeId:document.settings.customization?.behavior?.spaceId||'default',profiles:[{id:document.settings.customization?.behavior?.spaceId||'default',name:'Personal',snapshot:null,work:null,notesPreferences:null}]});}
export function validateRegistry(value){
 if(!value||value.schemaVersion!==1||Object.keys(value).some(key=>!['schemaVersion','activeId','profiles'].includes(key))||!Array.isArray(value.profiles)||!value.profiles.length||value.profiles.length>10)throw new Error('Invalid spaces registry.');
 if(!value.profiles.some(profile=>profile.id===value.activeId))throw new Error('Active space is missing.');
 const ids=new Set(),names=new Set();for(const profile of value.profiles){if(!profile||['id','name','snapshot','work','notesPreferences'].some(key=>!Object.hasOwn(profile,key))||Object.keys(profile).some(key=>!['id','name','snapshot','work','notesPreferences'].includes(key))||!/^(default|[a-z0-9-]{1,40})$/i.test(profile.id)||ids.has(profile.id)||typeof profile.name!=='string'||!profile.name.trim()||profile.name.length>60||names.has(profile.name.toLowerCase()))throw new Error('Invalid or duplicate space.');ids.add(profile.id);names.add(profile.name.toLowerCase());if(profile.work!==null)validateWork(profile.work);if(profile.notesPreferences!==null&&(!profile.notesPreferences||typeof profile.notesPreferences!=='object'||Array.isArray(profile.notesPreferences)||Object.keys(profile.notesPreferences).some(k=>!['schemaVersion','view','theme','labels'].includes(k))))throw new Error('Invalid notes preferences.');if(profile.snapshot){if(profile.snapshot.spaces)throw new Error('Nested spaces are not allowed.');validate(profile.snapshot);migrateSettings(profile.snapshot.settings.customization,settings.defaults());if(profile.snapshot.settings.customization.behavior.spaceId!==profile.id)throw new Error('Space settings identity does not match.');}}
 if(new Blob([JSON.stringify(value)]).size>4*1024*1024)throw new Error('Space snapshots exceed 4 MB. Export or reduce your collections.');
 return value;
}
export const list=()=>registry().profiles.map(({id,name})=>({id,name}));
function nameFor(value,state=registry(),except){const name=String(value).trim();if(!name||name.length>60||state.profiles.some(p=>p.id!==except&&p.name.toLowerCase()===name.toLowerCase()))throw new Error('Use a unique space name with 1–60 characters.');return name;}
/** Validate persisted profiles independently; preserve bad bytes for recovery. */
export async function init(){await settings.init();try{validateRegistry(registry());}catch{await storage.update(d=>{d.spacesRecovery=d.spaces;delete d.spaces;},{sync:false});emit('toast','Invalid space metadata was preserved for recovery. The current space is still available.');}}
/** Create an empty profile or duplicate both its data and scoped media. */
export async function create(name,{duplicate=false}={}){await settings.flush();return lock(()=>navigator.locks.request('oneflow-backup',async()=>{
 const state=registry();if(state.profiles.length>=10)throw new Error('Keep up to 10 spaces.');const label=nameFor(name,state),id=crypto.randomUUID(),source=settings.get().behavior.spaceId;
 let document=duplicate?snapshot(storage.get()):documentDefaults();const preferences=duplicate?settings.get():settings.defaults();preferences.behavior.spaceId=id;
 document.settings=settings.legacySettings(document.settings,preferences);document.settings.onboarding=storage.get().settings.onboarding;document.timer=freshTimer(document.timerConfig);document.audio.playing=false;document.flow={active:false,block:false,startedAt:0,snapshot:null};
 const work=duplicate?await storage.readWork():null,notesPreferences=duplicate?await storage.getNotesPreferences():null;if(work)work.active=null;
 state.profiles.push({id,name:label,snapshot:document,work,notesPreferences});validateRegistry(state);
 if(duplicate)await db.changeSpaceRecords(source,id);
 try{await storage.update(d=>{d.spaces=state;},{sync:false});}catch(error){if(duplicate)await db.changeSpaceRecords(id,null);throw error;}
 emit('spaces:changed');return id;
 }));}
export async function rename(id,name){await lock(async()=>{const state=registry(),profile=state.profiles.find(p=>p.id===id);if(!profile)throw new Error('Space no longer exists.');profile.name=nameFor(name,state,id);await storage.update(d=>{d.spaces=validateRegistry(state);},{sync:false});});emit('spaces:changed');}
/** Pause an active session before changing records; open editors must close first. */
export async function switchSpace(id){await settings.flush();return lock(async()=>{
 const current=settings.get().behavior.spaceId;if(id===current)return;
 if(document.querySelector('dialog[open]:not(.customization-drawer)'))throw new Error('Close the current editor before switching spaces.');
 const state=registry(),target=state.profiles.find(p=>p.id===id),previous=state.profiles.find(p=>p.id===current);if(!target?.snapshot||!previous)throw new Error('Space no longer exists.');
 if(storage.get().timer.status==='running')await timerCommand('pause');await settings.flush();
 previous.snapshot=snapshot(await storage.readLatest());previous.work=await storage.readWork();previous.notesPreferences=await storage.getNotesPreferences();
 const incoming=structuredClone(target.snapshot);state.activeId=id;incoming.spaces=state;
 incoming.settings.customization.behavior.spaceSchedule=settings.get().behavior.spaceSchedule;incoming.settings.customization.behavior.spaceHotkey=settings.get().behavior.spaceHotkey;
 incoming.audio.playing=false;incoming.flow={active:false,block:false,startedAt:0,snapshot:null};if(incoming.timer.status==='running'){incoming.timer.remaining=remaining(incoming.timer,Date.now());incoming.timer.status='paused';incoming.timer.endsAt=null;}
 validate(incoming);validateRegistry(state);
 const old=storage.get(),oldWork=await storage.readWork(),oldPreferences=await storage.getNotesPreferences(),oldGeneration=await storage.sessionGet('data-generation');
 await navigator.locks.request('oneflow-backup',async()=>{try{
  await storage.sessionSet('data-generation',crypto.randomUUID());
  await storage.updateWork(w=>{for(const key of Object.keys(w))delete w[key];Object.assign(w,target.work||workDefaults());});
  await storage.setNotesPreferences(target.notesPreferences||{});
  await storage.replace(incoming);
 }catch(error){await storage.replace(old);await storage.updateWork(w=>{for(const key of Object.keys(w))delete w[key];Object.assign(w,oldWork);});await storage.setNotesPreferences(oldPreferences);await storage.sessionSet('data-generation',oldGeneration||null);throw error;}});
 emit('space:switched',id);emit('spaces:changed');await backgroundSync();
 });}
export async function remove(id){const state=registry();if(state.profiles.length===1)throw new Error('Keep at least one space.');if(id===settings.get().behavior.spaceId)await switchSpace(state.profiles.find(p=>p.id!==id).id);await lock(async()=>{const previous=registry(),next=registry();next.profiles=next.profiles.filter(p=>p.id!==id);for(const profile of next.profiles)if(profile.snapshot)profile.snapshot.settings.customization.behavior.spaceSchedule=profile.snapshot.settings.customization.behavior.spaceSchedule.filter(r=>r.spaceId!==id);await storage.update(d=>{d.spaces=validateRegistry(next);if(d.settings.customization)d.settings.customization.behavior.spaceSchedule=d.settings.customization.behavior.spaceSchedule.filter(r=>r.spaceId!==id);},{sync:false});try{await db.changeSpaceRecords(id,null);}catch(error){await storage.update(d=>{d.spaces=previous;},{sync:false});throw error;}});emit('spaces:changed');}
