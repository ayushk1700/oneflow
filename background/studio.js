import { get, update } from '../core/storage.js';
import { dueRule, playlistIndex } from '../core/studio-logic.js';
import { sceneById, applySnapshot, snapshot } from '../core/scenes.js';
import { getRecord } from '../core/db.js';
let lastPhase;
async function available(background){return !['upload','video'].includes(background.kind)||Boolean(await getRecord(background.kind==='video'?'wallpapers':'images',background.id));}
/** Minute/phase driven preferences; paused automation and active timers stay protected. */
export async function processStudio(now=new Date()){
 const beforeAudio=JSON.stringify(get().audio);
 let data=get(),s=data.settings.studio;if(!s.enabled)return;
 if(!data.flow.active&&s.automation.pausedUntil<=now.getTime()){
  if(s.automation.enabled)for(const rule of s.automation.rules){const due=dueRule(rule,s.automation,data.timer,now);if(!due||s.automation.lastRuns[rule.id]===due)continue;try{const value=await sceneById(rule.sceneId);await update(d=>{if(d.flow.active||d.settings.studio.automation.pausedUntil>now.getTime())return;d.sceneUndo=snapshot(d);applySnapshot(d,value);d.sceneId=rule.sceneId;d.settings.studio.automation.lastRuns[rule.id]=due;});}catch{ /* Missing imported scenes/media skip safely; the rule remains editable. */ }break;}
  data=get();s=data.settings.studio;const w=s.wallpaper,index=playlistIndex(w.playlist.length,w.minutes,w.shuffle,now.getTime()),selected=w.playlist[index];
  if(selected&&await available(selected)&&JSON.stringify(selected)!==JSON.stringify(data.settings.background))await update(d=>{if(!d.flow.active) d.settings.background={...selected,rotate:false};});
 }
 data=get();s=data.settings.studio;const phase=data.timer.phase==='focus'?'focus':'break';
 if(lastPhase!==data.timer.phase){lastPhase=data.timer.phase;const mix=s.soundscapes.find(m=>m.id===s.phaseSounds[phase]);if(mix&&data.audio.playing)await update(d=>{d.audio.master=mix.master;d.audio.volumes={...mix.volumes};});}
 return JSON.stringify(get().audio)!==beforeAudio;
}
export async function scheduleStudio(){const s=get().settings.studio;if(s.enabled&&(s.automation.enabled||s.wallpaper.playlist.length>1))await chrome.alarms.create('oneflow-customization',{periodInMinutes:1});else await chrome.alarms.clear('oneflow-customization');}
