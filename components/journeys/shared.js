import { shell, el, field, action, section, message, saving, act } from '../workbench/shared.js';
import { select } from '../../core/ui.js';
import { download as saveFile } from '../../core/utils.js';
import { addJourney, editJourney, removeJourney, beginJourney, journeyData, linkedSessions, journeyTask } from '../../core/journeys.js';
export { el, field, action, section, message, select, act, addJourney, editJourney, beginJourney, linkedSessions, journeyTask };
export const input=(value='',max=120,type='text')=>el('input',{value,maxlength:max,type});
export const area=(value='',max=2000)=>el('textarea',{rows:3,maxlength:max},value);
export const choices=(values,value)=>select(values.map(x=>[String(x),String(x)]),String(value),()=>{});
export const button=(label,fn,primary=false)=>saving(action(label,()=>{},primary),fn);
export const requireText=(control,label)=>{const text=control.value.trim();if(!text)throw new Error(`Enter ${label}.`);return text;};
export const stamp=()=>({id:crypto.randomUUID(),at:Date.now()});
/** Once work exists, keep capture forms behind disclosure so saved work leads. */
export const creation=(count,title,...nodes)=>el('details',{open:count===0?'':undefined},el('summary',{},title),section(title,...nodes));
export const minutes=s=>Math.round((s.duration||0)/60000);
export const remove=(collection,id,reopen)=>el('details',{},el('summary',{},'Manage item'),button('Remove from workspace',async()=>{await removeJourney(collection,id);await reopen();}));
export const stage=(collection,record,values,reopen)=>field('Stage',select(values.map(x=>[x,x]),record.stage,act(async event=>{await editJourney(collection,record.id,r=>{r.stage=event.target.value;});await reopen();})));
/** Ignore stale reads when a user has already moved to another panel. */
export async function workspace(name,title,description){const ui=shell(name,title,description);const data=await journeyData();return ui.current()?{...ui,...data}:null;}
/** Downloads are created only by an explicit action and never leave this device. */
export function download(name,text,type='text/plain'){saveFile(new Blob([text],{type}),name);}
