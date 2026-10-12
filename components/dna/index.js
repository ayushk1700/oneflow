import { readWork, updateWork, update } from '../../core/storage.js';
import { getAll } from '../../core/db.js';
import { clearLearning } from '../../core/work-context.js';
import { focusRecipe } from '../../core/work-logic.js';
import { shell, el, action, section, message, confirmAction } from '../workbench/shared.js';
/** Explain associations from bounded local observations; no model or remote AI. */
export async function open(privacy=false){
  const {root,current}=shell('dna','Local Focus DNA','Learn from your own sessions. This is optional, stays on this device, and does not predict your ability or judge your day.');
  const [w,rows]=await Promise.all([readWork(),getAll('focusSamples')]);if(!current())return;
  const preferences=el('details',{open:privacy?'':undefined},el('summary',{},'Learning & privacy'));
  preferences.append(el('label',{class:'toggle-row'},'Learn from future focus sessions',el('input',{type:'checkbox',checked:w.learning,onchange:async e=>{try{await updateWork(w=>{w.learning=e.target.checked;w.active=null;});if(current())await open(true);}catch(error){emitError(error);}}})),
    el('label',{class:'toggle-row'},'Count tab switches during focus (no URLs)',el('input',{type:'checkbox',checked:w.countSwitches,onchange:async e=>{try{await updateWork(w=>{w.countSwitches=e.target.checked;if(w.active)w.active.switchCounting=false;});}catch(error){emitError(error);}}})),message('Saved conditions: planned duration, start hour, starting soundscape and wallpaper, planned break length, counted switches, and completion or early stop. Up to 500 sessions. Disabling learning stops new observations and retains existing ones until deleted.'));
  const recipe=focusRecipe(rows);
  root.append(section('Your focus recipe',message(!w.learning?'Learning is disabled. Enable it to collect future sessions.':`${rows.length} locally recorded sessions.`),el('p',{},recipe.explanation)));
  if(recipe.ready){
    const card=root.lastChild;
    if(['minutes','sound','wallpaper','breakMinutes'].includes(recipe.key))card.append(action(recipe.key==='wallpaper'?'Choose a wallpaper':'Use this condition next time',async()=>{
      await update(d=>{
        if(recipe.key==='minutes')d.timerConfig.focus=Math.round(recipe.value);
        if(recipe.key==='breakMinutes')d.timerConfig.short=recipe.value;
        if(recipe.key==='sound'){for(const k of Object.keys(d.audio.volumes))d.audio.volumes[k]=String(recipe.value).split(' + ').includes(k)?.5:0;d.audio.playing=false;}
      });
      if(recipe.key==='wallpaper') { (await import('../../core/events.js')).emit('settings:open','backgrounds'); return; }
      (await import('../../core/timer-client.js')).backgroundSync().catch(emitError);
      (await import('../../core/events.js')).emit('toast','Next-session condition saved. Current timer duration is unchanged.');
    }));
  }
  root.append(preferences);preferences.append(action('Delete learning data and disable learning',()=>confirmAction(root,'Delete all Focus DNA observations and disable learning? Your original focus history stays.',async()=>{await clearLearning();if(current())await open(true);})));
}
function emitError(error){import('../../core/events.js').then(m=>m.emit('error',error));}
export function init(){}
export const render=open;
export function destroy(){}
