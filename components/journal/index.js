import { getAll, put, remove } from '../../core/db.js';
import { el, uid, dayKey } from '../../core/utils.js';
import { openPanel, field, act, confirmAction } from '../../core/ui.js';
import { streak } from '../../core/stats-logic.js';
import { emit } from '../../core/events.js';
let prompts, root;
export async function render() { if (root) await open(); }
export async function open() {
  if (!prompts) { const response = await fetch('../data/prompts.json'); if (!response.ok) throw new Error('Local prompts could not load.'); prompts = await response.json(); }
  const entries = (await getAll('journal')).sort((a,b) => b.date.localeCompare(a.date)), today = dayKey();
  let current = entries.find(x => x.date === today);
  const prompt = prompts[Math.floor(Date.parse(`${today}T12:00:00`) / 86400000) % prompts.length];
  const date = el('input', { type: 'date', value: today, required: true, max: today });
  const text = el('textarea', { rows: 7, maxlength: 20000, placeholder: 'There is no wrong place to begin…', 'aria-label': 'Journal entry' }); text.value = current?.text || '';
  const promptText = el('p', { class: 'journal-prompt' }, current?.prompt || prompt), status = el('p', { class: 'muted', role: 'status' });
  const streakText = el('p', { class: 'muted' }, `${streak(entries.map(x => x.date))} day gratitude streak · a few lines are enough`);
  const form = el('form', { class: 'stack', onsubmit: act(async event => {
    event.preventDefault(); if (!text.value.trim()) throw new Error('Write a little before saving.');
    const sameDay = (await getAll('journal')).find(x => x.date === date.value);
    const entry = { id: sameDay?.id || current?.id || uid(), date: date.value, text: text.value.trim(), prompt: promptText.textContent, updatedAt: Date.now() };
    await put('journal', entry); current = entry; status.textContent = 'Saved on this device.'; emit('toast', 'A good thing, remembered.'); await drawHistory();
  }) }, streakText, promptText, field('Entry date', date), text, el('button', { class: 'primary', type: 'submit' }, 'Save reflection'), status);
  date.addEventListener('change', act(async () => { current = (await getAll('journal')).find(x => x.date === date.value); text.value = current?.text || ''; promptText.textContent = current?.prompt || prompt; }));
  const search = el('input', { type: 'search', placeholder: 'Find a memory…', 'aria-label': 'Search journal' }), filter = el('input', { type: 'date', 'aria-label': 'Filter journal by date' }), history = el('div', { class: 'stack' });
  async function drawHistory() {
    const all = await getAll('journal');
    streakText.textContent = `${streak(all.map(x => x.date))} day gratitude streak · a few lines are enough`;
    const rows = all.filter(x => (!filter.value || x.date === filter.value) && x.text.toLowerCase().includes(search.value.toLowerCase())).sort((a,b) => b.date.localeCompare(a.date));
    history.replaceChildren(...(rows.length ? rows.map(entry => el('article', { class: 'entry-card' }, el('small', { class: 'muted' }, entry.date), el('p', { class: 'entry-text' }, entry.text), el('div', { class: 'row' }, el('button', { onclick: () => { current = entry; date.value = entry.date; text.value = entry.text; promptText.textContent = entry.prompt; text.focus(); } }, 'Edit'), el('button', { onclick: () => confirmAction(history, 'Delete this reflection?', async () => { await remove('journal', entry.id); if (current?.id === entry.id) { current = null; text.value = ''; } await drawHistory(); }) }, 'Delete')))) : [el('p', { class: 'empty-state' }, 'Your memories will find a home here.') ]));
  }
  search.oninput = act(drawHistory); filter.onchange = act(drawHistory);
  root = el('div', { class: 'stack' }, form, el('hr', { class: 'divider' }), el('h3', {}, 'A little history'), search, field('On this date', filter), history);
  openPanel('The good in today', 'journal', root, () => { root = null; }); await drawHistory();
}
export function init() {}
export function destroy() { root = null; }
