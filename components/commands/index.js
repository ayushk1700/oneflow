import {get} from '../../core/storage.js';
import '../../core/power-i18n.js';
import {t} from '../../core/i18n.js';
import * as settings from '../../core/customization.js';
import {el} from '../../core/utils.js';
import {openPanel,act,closePanel,panelRequest} from '../../core/ui.js';
import {tools,launchTool,openSettings} from '../../core/tool-catalog.js';
import {emit} from '../../core/events.js';
import {timerCommand,backgroundSync} from '../../core/timer-client.js';
import {catalog,applyScene} from '../../core/scenes.js';
import {searchCommands} from '../../core/command-search.js';
import * as spaces from '../../core/spaces.js';
import {startingLayout,applyPreset} from '../../core/personal-layout.js';
/** One local index exposes tools, settings, profiles, links and bounded actions. */
export async function open(){
 const current=panelRequest();await settings.init();const scenes=await catalog(),data=get(),value=settings.get(),items=[];
 const add=(label,run,aliases=[])=>items.push({label,run,aliases});
 for(const tool of tools.filter(([id])=>id!=='commands'))add('Open '+tool[1],async()=>{if(Object.hasOwn(settings.get().widgets,tool[0])){settings.set('widgets.'+tool[0],true);await settings.flush();}if(tool[0]==='notes'&&!get().settings.widgets.notes){settings.set('widgets.notes',true);await settings.flush();}await launchTool(tool[0]);},tool);
 add('Open personalization settings',async()=>{await(await import('../customization/index.js')).open();},['Appearance','Preferences','customize']);add('Open extension settings',()=>openSettings('focus'),['Reminders','Data','Privacy']);add('Ambient clock settings',async()=>{await(await import('../customization/index.js')).open('ambient');});add('Website blocking',()=>openSettings('blocking'));
 function index(object,prefix=''){for(const[key,item]of Object.entries(object)){const path=prefix?prefix+'.'+key:key;if(['theme.palette','theme.paletteEnabled','theme.preset','theme.customThemes','theme.schedule'].includes(path))continue;if(item&&typeof item==='object'&&!Array.isArray(item)){index(item,path);}else if(path!=='schemaVersion'){const label=path.replace(/([a-z])([A-Z])/g,'$1 $2').split('.').map(part=>part[0].toUpperCase()+part.slice(1)).join(' / ');add('Settings: '+label,async()=>{await(await import('../customization/index.js')).open(path.split('.')[0]);},[path]);}}}
 index(value);
 for(const[id,enabled]of Object.entries(value.widgets))if(typeof enabled==='boolean')add((enabled?'Hide ':'Show ')+id,()=>settings.set('widgets.'+id,!enabled),['visibility',id]);
 for(const profile of spaces.list())add('Switch space: '+profile.name,()=>spaces.switchSpace(profile.id),['profile']);
 for(const theme of ['dark','light'])add('Theme: '+theme,()=>settings.set('theme.mode',theme));
 for(const scene of scenes)add('Scene: '+scene.name,async()=>{await applyScene(scene.id);await backgroundSync();});
 for(const name of ['Minimal','Focus','Dashboard','Zen','Study','Work'])add('Layout: '+name,()=>applyPreset(startingLayout(name)));
 for(const preset of value.layout.presets)add('Saved layout: '+preset.name,()=>applyPreset(preset));
 for(const link of data.links)add('Link: '+link.title,()=>{window.open(link.url,'_blank','noopener,noreferrer');},[link.folder||'']);
 for(const task of data.tasks.filter(task=>!task.completed))add('Focus task: '+task.text,async()=>{if(get().timer.sessionId)throw new Error('Finish the current session first.');await timerCommand('start',{taskId:task.id,focusMinutes:get().timerConfig.focus});});
 add('Pause focus timer',()=>timerCommand('pause'));add('Reset focus timer',()=>timerCommand('reset'));add('Start focus 25',()=>startFocus(25));add('Enter Flow Mode',()=>emit('flow:enter'));add('Rerun setup wizard',async()=>{(await import('../onboarding/index.js')).render();});add('Disable custom CSS',()=>settings.set('theme.customCSS.enabled',false));add('Session settings',()=>emit('timer:open'));
 async function startFocus(minutes){if(get().timer.sessionId||get().timer.status!=='idle')throw new Error('Finish the current session first.');if(get().timer.phase!=='focus')await timerCommand('phase',{phase:'focus'});await timerCommand('start',{focusMinutes:minutes});}
 const search=el('input',{type:'search',role:'combobox','aria-label':'Search commands','aria-autocomplete':'list','aria-expanded':'true','aria-controls':'power-command-results',autocomplete:'off',placeholder:'Search, or type “start focus 25”…'}),results=el('div',{id:'power-command-results',role:'listbox','aria-label':'Commands',class:'stack'}),count=el('p',{role:'status'});let matches=[],selected=0;
 function highlight(){const options=[...results.querySelectorAll('[role=option]')];options.forEach((option,index)=>option.setAttribute('aria-selected',String(index===selected)));if(options[selected]){search.setAttribute('aria-activedescendant',options[selected].id);options[selected].scrollIntoView({block:'nearest'});}else search.removeAttribute('aria-activedescendant');}
 async function run(item){closePanel();await item.run();}
 function draw(){matches=searchCommands(items,search.value);const interval=search.value.trim().match(/^start\s+focus\s+(\d{1,3})$/i);if(interval&&Number(interval[1])>=1&&Number(interval[1])<=180)matches.unshift({label:'Start focus '+Number(interval[1]),run:()=>startFocus(Number(interval[1]))});selected=0;count.textContent=matches.length+' matching actions';results.replaceChildren(...matches.map((item,index)=>el('button',{type:'button',role:'option',id:'power-command-'+index,'aria-selected':String(index===0),tabindex:-1,class:'text-button',onclick:act(()=>run(item))},item.label)));if(!matches.length)results.append(el('p',{},'No matching commands. Try a tool, setting, space or action.'));highlight();}
 search.oninput=draw;search.onkeydown=event=>{if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){event.preventDefault();selected=event.key==='Home'?0:event.key==='End'?matches.length-1:(selected+(event.key==='ArrowDown'?1:-1)+matches.length)%Math.max(1,matches.length);highlight();}if(event.key==='Enter'&&matches[selected]){event.preventDefault();act(()=>run(matches[selected]))();}};
 if(!current())return;draw();openPanel('Command palette','commands',el('div',{class:'stack command-workspace'},el('p',{class:'muted'},'Use arrow keys to choose; Enter runs an action. Everything is indexed locally.'),search,count,results));search.focus();
}
export const render=open;
export function init(){}
export function destroy(){}
