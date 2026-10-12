import { defaults, SCHEMA_VERSION, validate } from './schema.js';
import { get, update } from './storage.js';
import { getAll, put, remove, STORES } from './db.js';
import { parseBackup } from './backup.js';
import { uid } from './utils.js';
import { studioDefaults } from './studio-schema.js';
const keys=['theme','accent','font','contrast','background','widgets','appearance','journal','studio','reducedMotion'];
const encoded=blob=>new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.readAsDataURL(blob);});
/** Export only design settings, scene presets and local media; never private records or keys. */
export async function exportPreset(settings=get().settings){
 const local=defaults();for(const key of keys)local.settings[key]=structuredClone(settings[key]);local.settings.studio.automation=studioDefaults().automation;
 local.scenes=structuredClone(get().scenes).map(scene=>{if(scene.snapshot.settings.studio)delete scene.snapshot.settings.studio.automation;return scene;});
 const database=Object.fromEntries(STORES.map(key=>[key,[]]));const references=new Set();
 const add=b=>{if(b&&['upload','video'].includes(b.kind))references.add(`${b.kind}:${b.id}`);};add(local.settings.background);local.settings.studio.wallpaper.playlist.forEach(add);for(const scene of local.scenes){add(scene.snapshot.settings.background);scene.snapshot.settings.studio?.wallpaper.playlist.forEach(add);}
 for(const [store,kind] of [['images','upload'],['wallpapers','video']])for(const {blob,...record} of await getAll(store))if(references.has(`${kind}:${record.id}`))database[store].push({...record,data:await encoded(blob)});
 validate(local);return {app:'ONEFLOW Design',version:1,settings:local.settings,scenes:local.scenes,media:{images:database.images,wallpapers:database.wallpapers},schemaVersion:SCHEMA_VERSION};
}
/** Reuse strict media/schema validation, never accept preset personal fields. */
export async function parsePreset(text){
 if(new Blob([text]).size>128*1024*1024)throw new Error('Design preset is larger than 128 MB.');
 const value=JSON.parse(text,(key,v)=>{if(['__proto__','constructor','prototype'].includes(key))throw new Error('Unsafe preset.');return v;});
 if(value.app!=='ONEFLOW Design'||value.version!==1||!value.settings||!Array.isArray(value.scenes)||!value.media)throw new Error('Choose a ONEFLOW design preset.');
 const local=defaults();for(const key of keys)if(key in value.settings)local.settings[key]=structuredClone(value.settings[key]);local.settings.studio.automation=studioDefaults().automation;local.scenes=value.scenes;
 const database=Object.fromEntries(STORES.map(key=>[key,[]]));database.images=value.media.images;database.wallpapers=value.media.wallpapers;
 const result=await parseBackup(JSON.stringify({app:'ONEFLOW',schemaVersion:SCHEMA_VERSION,local,database}));
 const map=new Map();for(const store of ['images','wallpapers'])for(const record of result.records[store]){const old=record.id;record.id=uid();map.set(old,record.id);}
 const rewrite=b=>{if(b&&['upload','video'].includes(b.kind)){if(!map.has(b.id))throw new Error('A wallpaper is missing from this preset.');b.id=map.get(b.id);}};
 rewrite(result.local.settings.background);result.local.settings.studio.wallpaper.playlist.forEach(rewrite);for(const scene of result.local.scenes){rewrite(scene.snapshot.settings.background);scene.snapshot.settings.studio?.wallpaper.playlist.forEach(rewrite);scene.id=uid();}
 return {settings:result.local.settings,scenes:result.local.scenes,records:result.records};
}
/** Import media only on Save, preserving all records and integration credentials. */
export async function saveDesign(settings,imported){
 await navigator.locks.request('oneflow-backup',async()=>{
  if(imported){if((await getAll('images')).length+imported.records.images.length>8||(await getAll('wallpapers')).length+imported.records.wallpapers.length>2)throw new Error('Not enough wallpaper library space. Remove some local media before importing.');}
  const installed=[];
  try {
    if(imported)for(const store of ['images','wallpapers'])for(const record of imported.records[store]){await put(store,record);installed.push([store,record.id]);}
    await update(d=>{for(const key of keys)d.settings[key]=structuredClone(settings[key]);d.settings.studio.enabled=true;d.layout={};if(imported){if(d.scenes.length+imported.scenes.length>50)throw new Error('The scene library is full.');d.scenes.push(...imported.scenes);} });
  } catch(error) { for(const [store,id] of installed)await remove(store,id); throw error; }
 });
}
