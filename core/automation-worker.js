import * as storage from './storage.js';
import {planRules,ruleStamp,actionTarget} from './power-rules.js';
import {switchStoredSpace} from './spaces-store.js';
import {migrateSettings,resolveTheme} from './customization-schema.js';
import {runTimer} from './timer-engine.js';
let defaults;
async function localDefaults(){if(!defaults){const response=await fetch(new URL('../data/customization-defaults.json',import.meta.url));if(!response.ok)throw new Error('Automation defaults unavailable.');defaults=await response.json();}return defaults;}
async function editing(){if(!globalThis.chrome?.storage?.session)return false;const values=await chrome.storage.session.get(null);for(const[key,value]of Object.entries(values)){if(!key.startsWith('power-editor-')||!value?.busy)continue;try{if(await chrome.tabs.get(Number(key.slice('power-editor-'.length))))return true;}catch{await storage.sessionSet(key,null);}}return false;}
/** Alarm-owned, idempotent rules work even when the dashboard is closed. */
export async function processRules({now=new Date(),tabOpened=false,tabId=''}={}){
 return navigator.locks.request('oneflow-automation',async()=>{
  await localDefaults();
  const data=storage.get(),auto=data.settings.customization?.behavior?.automation;if(!auto?.enabled){await storage.sessionSet('power-rules',null);await storage.sessionSet('power-rule-winners',null);return [];}
  const context={now,tabOpened,tabId,spaceId:storage.activeSpaceId(),focusActive:data.timer.status==='running'&&data.timer.phase==='focus',sessionId:data.timer.sessionId};
  const actions=planRules(auto.rules,context),marks=await storage.sessionGet('power-rules')||{},winners=await storage.sessionGet('power-rule-winners')||{},applied=[];if(!actions.length){await storage.sessionSet('power-rule-winners',{});return applied;}
  const pending=actions.filter(({rule,action})=>marks[rule.id+':'+actionTarget(action)]!==ruleStamp(rule,context)||action.type!=='timer'&&winners[actionTarget(action)]!==rule.id).sort((a,b)=>(a.action.type==='space'?-1:a.action.type==='timer'?1:0)-(b.action.type==='space'?-1:b.action.type==='timer'?1:0));
  for(const{rule,action}of pending){const mark=rule.id+':'+actionTarget(action),stamp=ruleStamp(rule,context);
   if(action.type==='space'){if(storage.get().timer.status!=='idle'||storage.get().timer.sessionId||await editing())continue;await switchStoredSpace(action.value,{prepare:document=>{document.settings.customization=migrateSettings(document.settings.customization,defaults);return document;}});}
   else if(action.type==='timer'){const timer=storage.get().timer;if(timer.status!=='idle'||timer.sessionId||await editing())continue;if(timer.phase!=='focus')await runTimer('phase',{phase:'focus'});await runTimer('start',{focusMinutes:action.minutes});}
   else await storage.update(document=>{const prefs=document.settings.customization;if(action.type==='theme'){prefs.theme.mode=action.value;document.settings.theme=resolveTheme(prefs.theme,false,now);}else if(action.type==='widget'){prefs.widgets[action.widget]=action.enabled;document.settings.widgets[action.widget]=prefs.behavior.zen?action.widget==='clock':action.enabled;}else{Object.assign(prefs.background,{kind:'bundled',id:action.value,rotate:false});document.settings.background={kind:'bundled',id:action.value,color:prefs.background.color,blur:prefs.background.blur,rotate:false};}},{sync:false});
   marks[mark]=stamp;winners[actionTarget(action)]=rule.id;applied.push({ruleId:rule.id,type:action.type});
  }
  const allowed=new Set(auto.rules.map(rule=>rule.id));for(const key of Object.keys(marks))if(!allowed.has(key.split(':')[0]))delete marks[key];const targets=new Set(actions.map(({action})=>actionTarget(action)));for(const key of Object.keys(winners))if(!targets.has(key))delete winners[key];await storage.sessionSet('power-rules',marks);await storage.sessionSet('power-rule-winners',winners);return applied;
 });
}
export async function initializeRules(){await localDefaults();}
