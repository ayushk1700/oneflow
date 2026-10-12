import { readWork, updateWork, get } from '../../core/storage.js';
import { getAll } from '../../core/db.js';
import { captureCapsule, restoreCapsule, reenter } from '../../core/work-context.js';
import { emit } from '../../core/events.js';
import { closePanel } from '../../core/ui.js';
import { backgroundCatalog, backgroundSource } from '../../core/background-presentation.js';
import { shell, el, field, action, section, message, confirmAction, saving } from '../workbench/shared.js';
/** Capsules capture the user's current work, not browser history. */
export async function open() {
  const {root,current}=shell('capsules','Focus Capsules','Save a work context. Return with one clear next action.');
  root.append(message('Loading your capsules…'));
  const [work,notes,sessions,art]=await Promise.all([readWork(),getAll('notes'),getAll('sessions'),backgroundCatalog()]); if(!current())return;
  root.lastChild.remove();
  const name=el('input',{maxlength:100,value:get().timer.taskTitle || get().focus.text,placeholder:'Biology exam research'});
  const next=el('textarea',{maxlength:2000,rows:3,placeholder:'What should you do when you return?'},work.recovery?.next || '');
  const tabs=el('input',{type:'checkbox',checked:false});
  const options=el('details',{},el('summary',{},'Notes to include (text and checklists)'));
  options.append(message('Attachments stay in your original Notes. Capsule copies retain text, links and checklist items.'));
  const activeNotes=notes.filter(n=>n.state==='active');
  const selected=new Set((activeNotes.length<=100?activeNotes:activeNotes.filter(n=>n.pinned)).map(n=>n.id));
  for(const n of notes.filter(n=>n.state==='active'))options.append(el('label',{class:'toggle-row'},el('span',{},n.title || n.text.slice(0,80) || 'Untitled note'),el('input',{type:'checkbox',checked:selected.has(n.id),onchange:e=>e.target.checked?selected.add(n.id):selected.delete(n.id)})));
  if(!options.querySelector('input'))options.append(message('No active notes yet. Notes you create appear here.'));
  const save=action('Save capsule',()=>{},true);
  saving(save,async()=> {
    // Browser permission requests must begin inside the direct click gesture.
    const grant=tabs.checked && globalThis.chrome?.runtime?.id ? chrome.permissions.request({permissions:['tabs']}) : Promise.resolve(true);
    if(!name.value.trim())throw new Error('Give this capsule a name.');
    if(!await grant)throw new Error('Tab access was declined. Uncheck Include current-window tabs to save the rest.');
    await captureCapsule(name.value,next.value,tabs.checked,[...selected]); await open(); emit('toast','Focus capsule saved.');
  });
  const capture=el('details',{class:'capture-form',open:work.capsules.length?undefined:''},el('summary',{},'Save current work'),section('Capture this work',field('Capsule name',name),field('Resume note',next),el('label',{class:'toggle-row'},el('span',{},'Include current-window tabs (optional browser access)'),tabs),options,save));
  const search=el('input',{type:'search','aria-label':'Search capsules',placeholder:'Find a saved work context…'}),list=el('div',{class:'capsule-grid'}),cards=[];
  search.oninput=()=>{const term=search.value.trim().toLowerCase();for(const {c,row} of cards)row.hidden=!`${c.name} ${c.resumeNote}`.toLowerCase().includes(term);};
  const captureButton=action('Save current work',()=>{capture.open=!capture.open;if(capture.open)name.focus();});captureButton.classList.add('capsule-capture-header');captureButton.setAttribute('aria-expanded',String(capture.open));capture.addEventListener('toggle',()=>captureButton.setAttribute('aria-expanded',String(capture.open)));
  root.prepend(el('header',{class:'workspace-context-header'},el('h3',{},'Your saved work'),captureButton));
  root.append(el('div',{class:'panel-toolbar'},search),capture,el('h3',{},'Saved capsules'),list);
  if(!work.capsules.length)list.append(message('Your saved work will appear here. Name your current context to create the first capsule.'));
  for(const c of work.capsules){
    const row=section(c.name,message(`${new Date(c.at).toLocaleDateString()} · ${c.tabs.length} tabs · ${c.notes.length} notes`),el('p',{class:'capsule-next'},c.resumeNote.slice(0,140) || 'No resume note saved.'));
    const image=c.background.kind==='bundled'?art.find(x=>x.id===c.background.id):null;
    if(image)row.prepend(el('img',{class:'capsule-scenery',src:backgroundSource(image,true),alt:image.name,loading:'lazy',width:400,height:100}));
    const ids=new Set(c.tasks.map(t=>t.id)),history=sessions.filter(s=>ids.has(s.taskId));
    const include=el('input',{type:'checkbox',checked:false});
    const restore=action('Resume',()=>{},true);restore.setAttribute('aria-label','Restore capsule');
    saving(restore,async()=> {
      const grant=include.checked && globalThis.chrome?.runtime?.id ? chrome.permissions.request({permissions:['tabs']}) : Promise.resolve(true);
      if(!await grant)throw new Error('Tab access declined. Restore the context without tabs.');
      const result=await restoreCapsule(c.id,include.checked);
      if(!current())return;
      showRitual(result);
    });
    const manage=el('details',{},el('summary',{},'Options & context'),el('label',{class:'toggle-row'},el('span',{},'Reopen missing saved tabs'),include),message(`${Math.ceil(c.timer.remaining/60000)} minutes remaining · Scene: ${c.sceneId}`),el('p',{},c.resumeNote || 'No resume note saved.'),message(`${history.length} linked sessions · ${Math.round(history.reduce((n,s)=>n+s.duration,0)/60000)} recorded minutes. Shared tasks can appear in multiple capsules.`),el('div',{class:'work-actions'},action('Rename',()=>rename(row,c)),action('Delete capsule',()=>confirmAction(row,`Delete “${c.name}”? Your current tasks and notes remain.`,async()=>{await updateWork(w=>{w.capsules=w.capsules.filter(x=>x.id!==c.id);});await open();}))));
    row.append(restore,manage);list.append(row);cards.push({c,row});
  }
  root.append(action('Disable tab capture access',async()=> { if(globalThis.chrome?.permissions)await chrome.permissions.remove({permissions:['tabs']}); emit('toast','Tab capture access disabled. Saved capsules remain local.'); }));
}
function rename(row,c){
  if(row.querySelector('.capsule-rename'))return;
  const input=el('input',{maxlength:100,value:c.name,'aria-label':'New capsule name'}), box=el('div',{class:'capsule-rename work-actions'},input);
  box.append(action('Save name',async()=> { if(!input.value.trim())throw new Error('Enter a name.');await updateWork(w=>{const item=w.capsules.find(x=>x.id===c.id);if(!item)throw new Error('Capsule deleted in another window.');item.name=input.value.trim();});await open();}),action('Cancel',()=>box.remove())); row.append(box);input.focus();
}
function showRitual({capsule:c,opened,failed}) {
  const {root}=shell('capsules','Welcome back','Take one breath. Read your recovery note. Choose one small action before starting.');
  const audio=el('input',{type:'checkbox'}),journal=el('input',{type:'checkbox'});
  root.append(section(c.name,el('p',{},c.resumeNote || 'Choose the smallest next action for this work.'),message(`Context restored with sound paused. ${opened} tabs opened${failed?`; ${failed} tabs could not open. Try restoring tabs again`:''}. Saved notes are separate copies.`)),
    el('label',{class:'toggle-row'},'Play saved soundscape',audio),el('label',{class:'toggle-row'},'Add a re-entry line to today’s journal',journal));
  const start=async minutes=>{await reenter(minutes,audio.checked,journal.checked);closePanel();emit('dashboard:view','focus');};
  root.append(saving(action('Continue saved interval',()=>{},true),()=>start(null)),saving(action('Start a gentle 10 minutes',()=>{}),()=>start(10)),action('Keep it paused',()=>closePanel()));
}
export function init(){}
export const render=open;
export function destroy(){}
