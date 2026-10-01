import { get, update } from '../../core/storage.js';
import { el, uid, loadScript } from '../../core/utils.js';
import { openPanel, button, select, watch, act, confirmAction } from '../../core/ui.js';
import { on, emit } from '../../core/events.js';
import { getAll } from '../../core/db.js';
import { timerCommand } from '../../core/timer-client.js';
let unsubscribe, offNew, currentList = 'inbox', sorter, host, taskInput, mounted = false, sessions = [];
export function render() {
  if (!host) return;
  const draft = taskInput?.value || '', restoreFocus = taskInput === document.activeElement;
  sorter?.destroy(); sorter = null;
  const data = get();
  if (!data.lists.some(x => x.id === currentList)) currentList = data.lists[0].id;
  const list = data.tasks.filter(x => x.listId === currentList);
  const selector = select(data.lists.map(x => [x.id, x.name]), currentList, event => { currentList = event.target.value; render(); });
  selector.setAttribute('aria-label', 'Task list'); selector.className = 'grow';
  const tools = el('div', { class: 'row' }, selector, button('Add a list', 'folder-plus', () => editList()), button('Rename list', 'pencil', () => editList(currentList)), button('Delete list', 'trash-2', () => {
    if (get().lists.length === 1) return emit('toast', 'Keep at least one list.');
    confirmAction(host, 'Delete this list and all its tasks?', async () => { await update(d => { d.lists = d.lists.filter(x => x.id !== currentList); d.tasks = d.tasks.filter(x => x.listId !== currentList); }); });
  }));
  taskInput = el('input', { class: 'grow', value: draft, placeholder: 'One small next step…', 'aria-label': 'New task', maxlength: 240, required: true, autocomplete: 'off' });
  const form = el('form', { class: 'row', onsubmit: act(async event => {
    event.preventDefault(); const text = taskInput.value.trim(), listId = currentList; if (!text) return;
    taskInput.value = '';
    try { await update(d => { d.tasks.push({ id: uid(), text, listId, completed: false }); }); taskInput?.focus(); }
    catch (error) { if (taskInput) taskInput.value = text; throw error; }
  }) }, taskInput, el('button', { class: 'primary icon-button', type: 'submit', 'aria-label': 'Add task' }, '+'));
  const items = el('ul', { class: 'task-list', 'aria-label': 'Tasks' });
  for (const [index, task] of list.entries()) {
    const check = el('input', { type: 'checkbox', checked: task.completed, 'aria-label': `Complete ${task.text}`, onchange: act(async event => { const done = event.target.checked; await update(d => { const item = d.tasks.find(x => x.id === task.id); if (item) { item.completed = done; item.completedAt = done ? Date.now() : null; } }); host?.querySelector(`[data-id="${CSS.escape(task.id)}"] input`)?.focus(); }) });
    const row = el('li', { class: `task-row${task.completed ? ' completed' : ''}`, 'data-id': task.id }, el('span', { class: 'drag-handle', 'aria-hidden': 'true' }, '⠿'), check, el('span', { class: 'task-text grow' }, task.text));
    row.append(button(`Move ${task.text} up`, 'chevron-up', act(() => move(task.id, -1))), button(`Move ${task.text} down`, 'chevron-down', act(() => move(task.id, 1))), button(`Edit ${task.text}`, 'pencil', () => {
      const input = el('input', { class: 'grow', value: task.text, maxlength: 240, 'aria-label': 'Edit task', required: true });
      row.replaceChildren(el('form', { class: 'row grow', onsubmit: act(async event => { event.preventDefault(); const text = input.value.trim(); if (!text) return; await update(d => { const item = d.tasks.find(x => x.id === task.id); if (item) item.text = text; }); taskInput.focus(); }) }, input, el('button', { type: 'submit' }, 'Save'), el('button', { type: 'button', onclick: render }, 'Cancel'))); input.focus();
    }), button(`Delete ${task.text}`, 'trash-2', () => confirmAction(host, `Delete “${task.text}”?`, async () => { await update(d => { d.tasks = d.tasks.filter(x => x.id !== task.id); }); })));
    row.querySelectorAll('button')[0].disabled = index === 0;
    row.querySelectorAll('button')[1].disabled = index === list.length - 1;
    const spent = sessions.filter(s => s.taskId === task.id);
    row.querySelector('.task-text').append(el('small', { class: 'task-session-count' }, `${spent.length} sessions · ${Math.round(spent.reduce((n,s) => n+s.duration,0) / 60000)} min`));
    if (get().settings.widgets.timer) row.append(button(`Focus on ${task.text}`, 'play', () => {
      const start = async () => { await timerCommand('task', { taskId: task.id }); emit('toast', 'Focus started. One thing at a time.'); };
      if (get().timer.sessionId) confirmAction(host, 'Save the current partial session and focus on this task?', start); else act(start)();
    }));
    items.append(row);
  }
  host.replaceChildren(tools, el('p', { class: 'muted task-summary' }, `${list.filter(x => x.completed).length} of ${list.length} complete. Small steps count.`), form, list.length ? items : el('div', { class: 'empty-state' }, 'A little breathing room.', el('p', {}, 'Add something you’d like to move forward today.')));
  if (globalThis.Sortable) sorter = new globalThis.Sortable(items, { handle: '.drag-handle', animation: matchMedia('(prefers-reduced-motion: reduce)').matches || get().settings.reducedMotion ? 0 : 180, onEnd: act(async () => {
    const order = Array.from(items.children).map(x => x.dataset.id);
    await update(d => { const ordered = order.map(id => d.tasks.find(x => x.id === id)).filter(Boolean); const ids = new Set(order); d.tasks = [...d.tasks.filter(x => !ids.has(x.id)), ...ordered]; });
  }) });
  if (restoreFocus) taskInput.focus();
}
async function move(id, delta) {
  await update(d => {
    const indices = d.tasks.map((x, i) => x.listId === currentList ? i : -1).filter(i => i >= 0);
    const position = indices.findIndex(i => d.tasks[i].id === id), target = position + delta;
    if (target >= 0 && target < indices.length) [d.tasks[indices[position]], d.tasks[indices[target]]] = [d.tasks[indices[target]], d.tasks[indices[position]]];
  });
  host?.querySelector(`[data-id="${CSS.escape(id)}"] button:not(:disabled)`)?.focus();
}
function editList(id) {
  const input = el('input', { class: 'grow', value: get().lists.find(x => x.id === id)?.name || '', maxlength: 80, placeholder: 'List name', required: true, 'aria-label': 'List name' });
  const form = el('form', { class: 'row', onsubmit: act(async event => { event.preventDefault(); const name = input.value.trim(); if (!name) return; await update(d => { if (id) { const list = d.lists.find(x => x.id === id); if (list) list.name = name; } else { currentList = uid(); d.lists.push({ id: currentList, name }); } }); }) }, input, el('button', { type: 'submit' }, 'Save'), el('button', { type: 'button', onclick: () => form.remove() }, 'Cancel'));
  host.prepend(form); input.focus();
}
export async function open() {
  if (!mounted) return;
  await loadScript('../vendor/sortablejs/1.15.6/Sortable.min.js');
  sessions = await getAll('sessions');
  if (!mounted) return;
  host = el('div', { class: 'stack' }); render(); openPanel('A few small steps', 'tasks', host, () => { sorter?.destroy(); sorter = null; host = null; taskInput = null; }); taskInput.focus();
}
export function init() { mounted = true; unsubscribe = watch(d => [d.tasks, d.lists], render); offNew = on('task:new', () => open().catch(error => emit('error', error))); }
export function destroy() { mounted = false; unsubscribe?.(); offNew?.(); sorter?.destroy(); host = null; taskInput = null; }
