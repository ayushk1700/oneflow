import { t as translate } from '../../core/i18n.js';
import { get, update } from '../../core/storage.js';
import { getAll } from '../../core/db.js';
import { dayKey, el } from '../../core/utils.js';
import { openPanel, closePanel, act, field, panelRequest, isPanel } from '../../core/ui.js';
import { timerCommand } from '../../core/timer-client.js';
/** Keep today's queue small, with estimates alongside recorded focus time. */
export async function open() {
  const isCurrent = panelRequest();
  const d = get(), today = dayKey(), sessions = await getAll('sessions');
  const selected = (d.planning.date === today ? d.planning.ids : []).filter(id=>d.tasks.some(t=>t.id===id&&!t.completed));
  const root = el('div', { class: 'stack' }, el('p', { class: 'muted' }, translate('m0308')));
  const priorities=el('section',{class:'stack'},el('h3',{},`Today’s priorities · ${selected.length}/3`)),available=el('details',{open:selected.length===0?'':undefined},el('summary',{},'Choose from your tasks')),search=el('input',{type:'search','aria-label':'Search available tasks',placeholder:'Find a task…'}),list=el('div',{class:'stack'}),empty=el('p',{class:'muted',role:'status'},'No matching tasks. Try another search.');
  root.append(priorities,available);available.append(search,list,empty);const cards=[];const slots=el('ol',{class:'priority-slots'});priorities.append(slots);for(let i=0;i<3;i++)slots.append(el('li',{'data-slot':i+1},el('strong',{},`Priority ${i+1}`),el('p',{class:'muted'},'Choose a task from the pool below.')));
  search.addEventListener('input',()=>{let count=0;for(const {text,node} of cards){node.hidden=!text.toLowerCase().includes(search.value.trim().toLowerCase());if(!node.hidden)count++;}empty.hidden=count>0;});
  for (const task of d.tasks.filter(t => !t.completed)) {
    const check = el('input', { type: 'checkbox', checked: selected.includes(task.id), onchange: act(async e => {
      try { await update(next => { if (next.planning.date !== today) { next.planning.date = today; next.planning.ids = []; } next.planning.ids=next.planning.ids.filter(id=>next.tasks.some(t=>t.id===id&&!t.completed));if (e.target.checked) { if (next.planning.ids.length === 3) throw new Error(translate('m0309')); next.planning.ids.push(task.id); } else next.planning.ids = next.planning.ids.filter(id => id !== task.id); }); if(isPanel('queue')) await open(); } catch(error) { e.target.checked = !e.target.checked; throw error; }
    }) });
    const estimate = el('input', { type: 'number', min: 1, max: 360, value: d.planning.estimates[task.id] || 25, onchange: act(async e => { const minutes = Number(e.target.value); await update(next => { next.planning.estimates[task.id] = minutes; }); }) });
    const minutes = Math.round(sessions.filter(s => s.taskId === task.id).reduce((sum,s) => sum + s.duration, 0) / 60000);
    const card=el('article', { class: 'entry-card stack' }, el('label', { class: 'row' }, check, task.text), field(translate('m0310'), estimate), el('small', { class: 'muted' }, translate('m0689', {p0: minutes})));
    if(selected.includes(task.id)){const slot=slots.children[selected.indexOf(task.id)];slot.querySelector('p').remove();slot.append(card);}else{list.append(card);cards.push({text:task.text,node:card});}
  }
  if (!d.tasks.some(t => !t.completed)) root.append(el('p', {}, translate('m0311')));
  empty.hidden=cards.length>0;
  const nextTask = selected.map(id => d.tasks.find(t => t.id === id && !t.completed)).find(Boolean);
  if (nextTask) root.prepend(el('button', { class: 'primary', onclick: act(async () => { if (get().timer.sessionId || get().timer.status !== 'idle') throw new Error(translate('m0312')); await timerCommand('task', { taskId: nextTask.id }); closePanel(); }) }, translate('m0313', {p0: nextTask.text})));
  if (isCurrent()) openPanel(translate('m0314'), 'queue', root);
}
export const render = open;
export function init() {}
export function destroy() {}
