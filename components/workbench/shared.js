import { el } from '../../core/utils.js';
import { act, openPanel, isPanel, field, confirmAction } from '../../core/ui.js';
export { el, act, field, confirmAction };
/** One shared shell keeps these tools inside the dashboard's quiet panel system. */
export function shell(name, title, description) {
  const root=el('div',{class:'workbench stack'},el('p',{class:'muted'},description));
  openPanel(title,name,root);
  return { root, current:()=>isPanel(name) };
}
export const action = (label, fn, primary=false) => el('button',{type:'button',class:primary?'primary':'',onclick:act(fn)},label);
export const section = (title,...nodes) => el('section',{class:'work-section stack'},el('h3',{},title),...nodes);
export const message = text => el('p',{class:'muted',role:'status'},text);
export const time = minutes => `${String(Math.floor(minutes/60)).padStart(2,'0')}:${String(minutes%60).padStart(2,'0')}`;
/** Disable a saving action until its operation settles, including failure paths. */
export function saving(control, fn) {
  control.onclick=null;
  control.addEventListener('click',act(async()=> { if(control.disabled)return; control.disabled=true; try { await fn(); } finally { control.disabled=false; } }));
  return control;
}
