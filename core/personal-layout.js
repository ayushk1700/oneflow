import * as settings from './customization.js';
import { get,subscribe } from './storage.js';
import { greeting } from '../components/clock/personalization.js';
import { el } from './utils.js';
import { openFeature } from './features.js';
import { DASHBOARD_ELEMENTS } from './personalization-schema.js';
import { createSessionView } from '../components/session-view/index.js';
export const labels={clock:'Clock',greeting:'Greeting',focus:'Focus',search:'Search',quotes:'Quotes',weather:'Weather',links:'Quick links',countdowns:'Countdowns',tasks:'Tasks',notes:'Notes',habits:'Habits',timer:'Timer',sounds:'Sounds',journal:'Journal',stats:'Focus stats',mood:'Mood',music:'Music'};
const entries=new Map();let canvas,off,dataOff,frame,timer,editing=false,selected='clock';
const media=matchMedia('(max-width:700px)');
export const device=()=>media.matches?'mobile':'desktop';
export function defaultCells(ids,mobile=false){return Object.fromEntries(ids.map((id,index)=>[id,mobile?{x:2,y:index*100/Math.max(1,ids.length),w:96,h:Math.max(4,100/Math.max(1,ids.length)-1)}:{x:2+index%3*32,y:2+Math.floor(index/3)*16,w:30,h:14}]));}
export function startingLayout(name){const visible=Object.fromEntries(DASHBOARD_ELEMENTS.map(id=>[id,false]));const ids={Minimal:['clock','greeting','search'],Focus:['focus','clock'],Dashboard:['clock','greeting','focus','search','quotes','weather','tasks','links','stats'],Zen:['clock'],Study:['clock','greeting','focus','tasks','notes','quotes'],Work:['clock','greeting','search','focus','tasks','links','weather']}[name]||['clock'];ids.forEach(id=>visible[id]=true);return {id:name.toLowerCase(),name,visible,desktop:defaultCells(ids),mobile:defaultCells(ids,true),sidebar:'right'};}
export function applyPreset(preset){const next=settings.get();Object.assign(next.layout,{enabled:true,desktop:structuredClone(preset.desktop),mobile:structuredClone(preset.mobile),sidebar:preset.sidebar,...(preset.widgetStyle?{widgetStyle:structuredClone(preset.widgetStyle),density:preset.density,snap:preset.snap}:{})});for(const[id,value]of Object.entries(preset.visible))next.widgets[id]=value;next.behavior.zen=false;settings.replace(next);}
export function savePreset(name){const label=String(name).trim();if(!label||label.length>60)throw new Error('Name the layout with 1–60 characters.');const next=settings.get(),visible=Object.fromEntries(DASHBOARD_ELEMENTS.map(id=>[id,next.widgets[id]]));next.layout.presets=next.layout.presets.filter(p=>p.name!==label).concat({id:crypto.randomUUID(),name:label,visible,desktop:next.layout.desktop,mobile:next.layout.mobile,sidebar:next.layout.sidebar,widgetStyle:next.layout.widgetStyle,density:next.layout.density,snap:next.layout.snap});settings.replace(next);}
export function setEditing(value){editing=value;document.documentElement.dataset.layoutEdit=String(value);render();}
function bindHandle(handle,id,resize){
  handle.onkeydown=event=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
    event.preventDefault();const next=settings.get(),target=device();
    if(next.layout.locked||next.layout.widgetStyle[id].pinned)return;
    const cell=next.layout[target][id]||defaultCells(DASHBOARD_ELEMENTS.filter(k=>next.widgets[k]),media.matches)[id];
    if(!cell)return;
    const horizontal=['ArrowLeft','ArrowRight'].includes(event.key),key=resize?(horizontal?'w':'h'):(horizontal?'x':'y');
    cell[key]+=(['ArrowLeft','ArrowUp'].includes(event.key)?-1:1)*(event.altKey?1:next.layout.snap);
    constrain(cell,resize);next.layout[target][id]=cell;settings.replace(next);
  };
  handle.onpointerdown=event=>{
    if(event.button!==0)return;
    const value=settings.get(),target=device();if(value.layout.locked||value.layout.widgetStyle[id].pinned)return;
    event.preventDefault();selected=id;
    const start={x:event.clientX,y:event.clientY,cell:structuredClone(value.layout[target][id]||defaultCells(DASHBOARD_ELEMENTS.filter(k=>value.widgets[k]),media.matches)[id])};
    const box=canvas.getBoundingClientRect();handle.setPointerCapture(event.pointerId);let point;
    const applyPoint=()=>{
      frame=null;if(!point)return;const next=settings.get();
      if(next.layout.locked||next.layout.widgetStyle[id].pinned)return;
      const cell=structuredClone(start.cell),snap=next.layout.snap;
      cell[resize?'w':'x']=Math.round((start.cell[resize?'w':'x']+(point.clientX-start.x)/box.width*100)/snap)*snap;
      cell[resize?'h':'y']=Math.round((start.cell[resize?'h':'y']+(point.clientY-start.y)/box.height*100)/snap)*snap;
      constrain(cell,resize);next.layout[target][id]=cell;settings.set('layout.'+target,next.layout[target]);
    };
    const move=e=>{point=e;if(!frame)frame=requestAnimationFrame(applyPoint);};
    const finish=()=>{
      if(frame){cancelAnimationFrame(frame);applyPoint();}
      handle.removeEventListener('pointermove',move);handle.removeEventListener('pointerup',finish);handle.removeEventListener('pointercancel',finish);
      settings.flush().catch(()=>{});
    };
    handle.addEventListener('pointermove',move);handle.addEventListener('pointerup',finish);handle.addEventListener('pointercancel',finish);
  };
}
function constrain(cell,resize=false){
  cell.w=Math.max(8,Math.min(resize?100-cell.x:100,cell.w));cell.h=Math.max(4,Math.min(resize?100-cell.y:100,cell.h));
  cell.x=Math.max(0,Math.min(100-cell.w,cell.x));cell.y=Math.max(0,Math.min(100-cell.h,cell.y));
}
function content(id){if(id==='timer'){const session=createSessionView();return {node:session.root,session};}if(['clock','focus','search','quotes','weather','links','countdowns'].includes(id)){const node=document.getElementById(id);if(node){const marker=document.createComment('layout '+id);node.before(marker);return {node,marker};}}
 const node=el('div',{class:'layout-widget-content'});if(id==='greeting')node.append(el('h1',{class:'personal-greeting'}));else node.append(el('p',{class:'layout-summary'}),el('button',{type:'button',onclick:async()=>{if(id==='timer')(await import('./dashboard-view.js')).setView('focus');else await openFeature(id);}},'Open '+labels[id]));return {node};}
function ensure(id){if(entries.has(id))return entries.get(id);const {node,marker,session}=content(id),title=el('h2',{class:'layout-widget-title'},labels[id]),move=el('button',{type:'button',class:'layout-move','aria-label':`Move ${labels[id]} with arrow keys`,title:'Drag or use arrow keys'},'Move'),resize=el('button',{type:'button',class:'layout-resize','aria-label':`Resize ${labels[id]} with arrow keys`,title:'Drag or use arrow keys'},'Resize'),controls=el('div',{class:'layout-handles'},move,resize),wrapper=el('section',{class:'layout-node','aria-label':labels[id],'data-layout-widget':id},title,controls,node);bindHandle(move,id,false);bindHandle(resize,id,true);canvas.append(wrapper);const entry={wrapper,node,marker,session,title,move,resize};entries.set(id,entry);return entry;}
function refreshContent(id,node){const d=get(),p=settings.get().widgets.preferences;if(id==='greeting')node.querySelector('h1').textContent=greeting(p.greeting);const summary=node.querySelector('.layout-summary');if(!summary)return;summary.textContent=id==='tasks'?`${d.tasks.filter(t=>!t.completed).length} unfinished tasks`:id==='notes'? 'Your private notebooks':id==='habits'?`${d.habits.length} habits`:id==='timer'?`${d.timerConfig.focus} min focus · ${d.timerConfig.short} min break`:id==='sounds'?d.audio.playing?'Ambient mix playing':'Ambient mix paused':id==='mood'?'How are you feeling?':id==='stats'?'Your focus history':id==='journal'?'Write a reflection':'Your music';}
export function render(){if(!settings.get())return;const value=settings.get(),enabled=value.layout.enabled;document.documentElement.dataset.personalLayout=String(enabled);document.documentElement.dataset.layoutSidebar=value.layout.sidebar;if(!enabled){restore();return;}if(!canvas){canvas=el('div',{class:'personal-layout-canvas','aria-label':'Personal dashboard layout'});document.querySelector('#main').append(canvas);}const ids=DASHBOARD_ELEMENTS.filter(id=>value.widgets[id]&&(!value.behavior.zen||id==='clock'));document.documentElement.style.setProperty('--layout-visible-count',Math.max(1,ids.length));const defaults=defaultCells(ids,media.matches);
 for(const id of DASHBOARD_ELEMENTS){const entry=entries.get(id);if(!ids.includes(id)){if(entry)entry.wrapper.hidden=true;continue;}const cell=value.layout[device()][id]||defaults[id],item=ensure(id),style=value.layout.widgetStyle[id];item.wrapper.hidden=false;item.wrapper.dataset.collapsed=String(style.collapsed);item.wrapper.dataset.selected=String(selected===id);item.title.hidden=!style.title;item.node.hidden=style.collapsed;item.move.hidden=item.resize.hidden=!editing;item.move.disabled=item.resize.disabled=value.layout.locked||style.pinned;for(const[key,n]of Object.entries(cell))item.wrapper.style.setProperty('--layout-'+key,n+'%');item.wrapper.style.setProperty('--widget-opacity',style.opacity/100);item.session?.render();refreshContent(id,item.node);}
}
function restore(){for(const {wrapper,node,marker,session}of entries.values()){if(marker?.isConnected)marker.replaceWith(node);session?.destroy();wrapper.remove();}entries.clear();canvas?.remove();canvas=null;}
export async function init(){if(off)return;off=settings.subscribe(render);dataOff=subscribe(render);media.addEventListener('change',render);timer=setInterval(()=>{if(!document.hidden)for(const entry of entries.values())entry.session?.render();},1000);render();}
export function destroy(){off?.();dataOff?.();off=null;dataOff=null;media.removeEventListener('change',render);clearInterval(timer);cancelAnimationFrame(frame);restore();}
