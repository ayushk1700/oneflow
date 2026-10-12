import { el, uid, dayKey } from '../../core/utils.js';
import { get, update } from '../../core/storage.js';
import { getAll } from '../../core/db.js';
import { streak, shiftDay } from '../../core/stats-logic.js';
import { timerCommand, backgroundSync } from '../../core/timer-client.js';

/** Live task/habit editors share Notes without copying IDs or completion history. */
export function createPlanner({ editor, button, message, leave, show }) {
  let active = false, work = Promise.resolve(), error, busy = 0, taskView='Today';
  const changes = [];
  const commit = change => {
    if (change) changes.push(change);
    busy++; message('Saving…');
    work = work.catch(() => {}).then(async () => {
      const batch = changes.slice();
      if (batch.length) await update(data => batch.forEach(edit => edit(data)), { sync: false });
      changes.splice(0, batch.length);
    })
      .then(() => { error = null; message('Saved on this device'); })
      .catch(reason => { error = reason; message(reason.message + ' Keep this editor open and retry.', true); })
      .finally(() => { busy--; });
    return work;
  };
  const flush = async () => { await work; if (error) throw error; };
  const field = (label, input) => el('label', {}, label, input);
  const record = (data, kind, id) => {
    const value = data[kind === 'task' ? 'tasks' : 'habits'].find(item => item.id === id);
    if (!value) throw new Error('This item was removed elsewhere. Copy your text before closing.');
    return value;
  };
  const patch = (kind, id, values) => commit(data => Object.assign(record(data, kind, id), values));

  async function open(kind, id) {
    await leave(); active = true; show(); editor.replaceChildren();
    const data = get(), item = record(data, kind, id);
    const title = el('input', { value: kind === 'task' ? item.text : item.name, maxlength: kind === 'task' ? 240 : 120,
      'aria-label': kind === 'task' ? 'Task text' : 'Habit name', oninput: event => { patch(kind, id, { [kind === 'task' ? 'text' : 'name']: event.target.value }); } });
    editor.append(el('div', { class: 'row' }, button('← All notes', leave), button('Retry save', () => commit())),
      el('small', {}, kind === 'task' ? 'TASK' : 'DAILY HABIT'), title);
    if (kind === 'task') await taskEditor(item);
    else habitEditor(item);
    const confirm = el('div', { hidden: true }, el('p', {}, `Delete this ${kind}? ${kind === 'habit' ? 'Its check-in history will also be removed.' : 'Recorded focus sessions will remain.'}`),
      button(`Delete ${kind}`, async () => {
        await flush();
        await commit(next => { const key = kind === 'task' ? 'tasks' : 'habits'; next[key] = next[key].filter(x => x.id !== id); if (kind === 'task') next.planning.ids = next.planning.ids.filter(x => x !== id); });
        await flush(); if (kind === 'habit') await backgroundSync(); await leave();
      }), button('Cancel deletion', () => { confirm.hidden = true; }));
    editor.append(el('div', { class: 'danger-zone' }, button(`Delete ${kind}…`, () => { confirm.hidden = false; confirm.querySelector('button').focus(); }), confirm));
    title.focus();
  }

  async function taskEditor(item) {
    const check = el('input', { type: 'checkbox', checked: item.completed, 'aria-label': 'Task complete', onchange: event => { const completed = event.target.checked; patch('task', item.id, { completed, completedAt: completed ? Date.now() : null }); } });
    const list = el('select', { 'aria-label': 'Task list', onchange: event => patch('task', item.id, { listId: event.target.value }) });
    const drawLists = () => { list.replaceChildren(...get().lists.map(x => el('option', { value: x.id }, x.name))); list.value = get().tasks.find(x => x.id === item.id)?.listId || get().lists[0].id; };
    const due=el('input',{type:'date',value:item.dueDate||'','aria-label':'Task due date',onchange:event=>patch('task',item.id,{dueDate:event.target.value})}),effort=el('input',{type:'number',min:1,max:180,value:item.effort||25,'aria-label':'Estimated task minutes',onchange:event=>{const minutes=Number(event.target.value);if(!Number.isInteger(minutes)||minutes<1||minutes>180){message('Use 1–180 whole minutes.',true);return;}patch('task',item.id,{effort:minutes});}});
    drawLists(); editor.append(field('Completed', check), field('List', list),field('Due date (optional)',due),field('Estimated minutes',effort));
    const name = el('input', { maxlength: 80, 'aria-label': 'List name', placeholder: 'List name' });
    editor.append(el('details', {}, el('summary', {}, 'Manage lists'), el('div', {}, name, el('div', { class: 'row' },
      button('Create list', async () => { if (!name.value.trim()) throw new Error('Enter a list name.'); const value = name.value.trim(), id = uid(); await commit(d => { d.lists.push({ id, name: value }); record(d, 'task', item.id).listId = id; }); drawLists(); }),
      button('Rename list', async () => { if (!name.value.trim()) throw new Error('Enter a list name.'); const value = name.value.trim(), id = list.value; await commit(d => { const target = d.lists.find(l => l.id === id); if (target) target.name = value; }); drawLists(); })))));
    const move = delta => commit(d => {
      const task = record(d, 'task', item.id), indices = d.tasks.map((t, i) => t.listId === task.listId ? i : -1).filter(i => i >= 0);
      const pos = indices.findIndex(i => d.tasks[i].id === item.id), other = pos + delta;
      if (other >= 0 && other < indices.length) [d.tasks[indices[pos]], d.tasks[indices[other]]] = [d.tasks[indices[other]], d.tasks[indices[pos]]];
    });
    editor.append(el('div', { class: 'row' }, button('Move earlier', () => move(-1)), button('Move later', () => move(1))));
    const history = (await getAll('sessions')).filter(s => s.taskId === item.id);
    editor.append(el('small', {}, `${history.length} focus sessions · ${Math.round(history.reduce((sum, s) => sum + s.duration, 0) / 60000)} minutes`));
    if (get().settings.widgets.timer) editor.append(button('Focus on this task', async () => {
      await flush();
      if (get().timer.sessionId) throw new Error('Finish or reset your current session before switching tasks.');
      await timerCommand('task', { taskId: item.id }); message('Task selected for your focus timer');
    }));
  }

  function habitEditor(item) {
    const week = el('div', { class: 'planner-week', 'aria-label': 'Habit check-ins' }), count = el('small');
    const draw = () => {
      const habit = get().habits.find(h => h.id === item.id); if (!habit) return;
      count.textContent = `${streak(habit.dates)} day streak · ${habit.dates.length} total check-ins`;
      week.replaceChildren(...Array.from({ length: 7 }, (_, i) => shiftDay(dayKey(), i - 6)).map(date => button(`${new Date(date + 'T12:00:00').toLocaleDateString('en', { weekday: 'short' })} ${habit.dates.includes(date) ? '✓' : '·'}`, async () => {
        await commit(d => { const h = record(d, 'habit', item.id); h.dates = h.dates.includes(date) ? h.dates.filter(x => x !== date) : [...h.dates, date]; }); draw(); week.querySelector(`[data-day="${date}"]`)?.focus();
      }, { 'data-day': date, 'aria-current':date===dayKey()?'date':'false', 'aria-label': `Check in ${date}`, 'aria-pressed': String(habit.dates.includes(date)) })));
    };
    const reminder = el('input', { type: 'time', value: item.reminder, 'aria-label': 'Daily habit reminder', onchange: async event => {
      await patch('habit', item.id, { reminder: event.target.value });
      try { await flush(); await backgroundSync(); } catch (e) { message(e.message, true); }
    } });
    draw(); editor.append(count, week, field('Daily reminder (local time)', reminder), el('small', {}, 'Leave the reminder blank to turn it off. Your full check-in history is retained.'));
  }

  async function startTask(id){await flush();const task=get().tasks.find(t=>t.id===id&&!t.completed);if(!task)throw Error('This task is no longer available.');if(get().timer.status!=='idle'||get().timer.sessionId)throw Error('Finish your current interval before starting another task.');if(get().timer.phase!=='focus')await timerCommand('phase',{phase:'focus'});await timerCommand('start',{taskId:id,focusMinutes:task.effort||25});message('Focus session started. Return to your dashboard when ready.');}

  function cards(query, kind) {
    const data = get(), result = [];
    if(kind==='task'){
      const nav=el('div',{class:'planner-views',role:'tablist','aria-label':'Task views'}),rows=el('div',{class:'planner-task-rows',role:'tabpanel','aria-label':'Selected task view'}),container=el('section',{class:'planner-task-board'},nav,rows);
      const draw=()=>{for(const b of nav.children){b.setAttribute('aria-selected',String(b.textContent===taskView));b.tabIndex=b.textContent===taskView?0:-1;}rows.replaceChildren();const tasks=get().tasks.filter(t=>`${t.text} ${get().lists.find(x=>x.id===t.listId)?.name||''}`.toLowerCase().includes(query)&&(taskView==='Completed'?t.completed:!t.completed&&(taskView==='Upcoming'?t.dueDate&&t.dueDate>dayKey():!t.dueDate||t.dueDate<=dayKey())));for(const task of tasks){const check=el('input',{type:'checkbox',checked:task.completed,'aria-label':`Complete ${task.text}`,onchange:async e=>{await patch('task',task.id,{completed:e.target.checked,completedAt:e.target.checked?Date.now():null});draw();}});rows.append(el('article',{class:'planner-task-row'},check,button(task.text||'Untitled task',()=>open('task',task.id),{'aria-label':`Open task ${task.text||'Untitled task'}`}),el('small',{},`${task.effort||25} min${task.dueDate?' · '+task.dueDate:''}`),task.completed?null:button('Start',()=>startTask(task.id),{'aria-label':`Start ${task.text}`})));}if(!tasks.length)rows.append(el('p',{class:'empty'},`No ${taskView.toLowerCase()} tasks match this view.`));};
      for(const name of ['Today','Upcoming','Completed'])nav.append(button(name,()=>{taskView=name;draw();},{role:'tab','aria-selected':String(taskView===name)}));nav.onkeydown=e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const buttons=[...nav.children],from=buttons.indexOf(document.activeElement),i=e.key==='Home'?0:e.key==='End'?2:(Math.max(0,from)+(e.key==='ArrowRight'?1:-1)+3)%3;buttons[i].click();buttons[i].focus();};draw();return [container];
    }
    if (!kind) for (const task of data.tasks) {
      const list = data.lists.find(x => x.id === task.listId)?.name || '';
      if (!`${task.text} ${list}`.toLowerCase().includes(query)) continue;
      const card = button('', () => open('task', task.id), { class: 'note-card', 'data-kind': 'task', 'aria-label': `Open task ${task.text || 'Untitled task'}` });
      card.append(el('small', {}, `TASK · ${task.completed ? 'DONE' : 'TO DO'}`), el('strong', {}, task.text || 'Untitled task'), el('small', {}, list)); result.push(card);
    }
    if(kind==='habit'){
      const dates=Array.from({length:7},(_,i)=>shiftDay(dayKey(),i-6)),grid=el('table',{class:'planner-habit-grid'},el('caption',{},'Your weekly habit check-ins')),head=el('tr',{},el('th',{scope:'col'},'Habit'));for(const date of dates)head.append(el('th',{scope:'col','aria-current':date===dayKey()?'date':'false'},new Date(date+'T12:00:00').toLocaleDateString(undefined,{weekday:'short'})));grid.append(el('thead',{},head));const body=el('tbody');for(const habit of data.habits.filter(h=>h.name.toLowerCase().includes(query))){const row=el('tr',{},el('th',{scope:'row'},button(habit.name||'Untitled habit',()=>open('habit',habit.id))));for(const date of dates)row.append(el('td',{'data-today':String(date===dayKey())},button(habit.dates.includes(date)?'✓':'·',async()=>{await commit(d=>{const h=record(d,'habit',habit.id);h.dates=h.dates.includes(date)?h.dates.filter(x=>x!==date):[...h.dates,date];});},{'aria-label':`${habit.name}: check in ${date}`,'aria-pressed':String(habit.dates.includes(date))})));body.append(row);}grid.append(body);return [el('div',{class:'planner-habit-scroll'},grid,body.children.length?null:el('p',{class:'empty'},'No habits yet. Create a habit separately to start your week.'))];
    }
    if (!kind) for (const habit of data.habits) {
      if (!habit.name.toLowerCase().includes(query)) continue;
      const card = button('', () => open('habit', habit.id), { class: 'note-card', 'data-kind': 'habit', 'aria-label': `Open habit ${habit.name || 'Untitled habit'}` });
      card.append(el('small', {}, `HABIT · ${habit.dates.includes(dayKey()) ? 'DONE TODAY' : 'TODAY'}`), el('strong', {}, habit.name || 'Untitled habit'), el('small', {}, `${streak(habit.dates)} day streak${habit.reminder ? ' · ' + habit.reminder : ''}`)); result.push(card);
    }
    return result;
  }

  return {
    cards, open, flush, get active() { return active; }, get dirty() { return busy > 0 || !!error; }, clear() { active = false; },
    async create(kind) {
      await leave(); const id = uid();
      await commit(d => { if (kind === 'task') d.tasks.push({ id, text: '', listId: d.lists[0].id, completed: false }); else d.habits.push({ id, name: '', dates: [], reminder: '' }); });
      await flush(); await open(kind, id);
    }
  };
}
