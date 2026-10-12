import { get, readWork } from './storage.js';
import { openFeature } from './features.js';
import { emit, on } from './events.js';
let leaving=false;
/** Observe dashboard departures only; work in another tab is not abandonment. */
export function init(){
  const checkpoint=async()=>{
    const t=get().timer,w=await readWork();
    if(!w.recoveryEnabled||t.phase!=='focus'||t.status!=='running')return;
    leaving=true;
    if(!w.recovery || w.recovery.taskTitle!==t.taskTitle)await (await import('./work-context.js')).recoveryPoint(t.taskTitle?`Return to ${t.taskTitle} and choose one small next action.`:'Choose one small next action when you return.');
  };
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden)checkpoint().catch(error=>emit('error',error));
    else if(leaving){leaving=false;readWork().then(w=>{if(w.recoveryEnabled&&w.recovery&&!w.recovery.reason&&!document.querySelector('dialog[open]'))return openFeature('recovery');}).catch(error=>emit('error',error));}
  });
  on('focus:exit',()=>checkpoint().catch(error=>emit('error',error)));
  // After restarting the browser, the saved checkpoint remains discoverable.
  readWork().then(w=>{if(w.recovery)emit('toast','A recovery point is saved. Open Focus Recovery in More tools when ready.');}).catch(error=>emit('error',error));
}
