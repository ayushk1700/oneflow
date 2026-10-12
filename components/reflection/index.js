import { get, update } from '../../core/storage.js';
import { getAll } from '../../core/db.js';
import { bindDraft } from '../../core/drafts.js';
import { el } from '../../core/utils.js';
import { openPanel, closePanel, act, panelRequest, isPanel } from '../../core/ui.js';
import { emit } from '../../core/events.js';
/** Offer a local, optional reflection on the most recently recorded session. */
export async function open() {
  const current = panelRequest(), records = await getAll('sessions');
  if (!current()) return;
  const session = records.sort((a,b) => b.end - a.end)[0];
  if (!session) { openPanel('A moment to reflect', 'reflection', el('p', {}, 'Complete a focus session to see your summary here.')); return; }
  const saved = get().sessionReflections.find(record => record.id === session.id);
  const text = el('textarea', { maxlength:5000, rows:4, 'aria-label':'Session reflection', placeholder:'What moved forward? What would help next time?' });
  const status = el('small', { role:'status', class:'muted' }), key = `journal:session-${session.id}`;
  text.value=saved?.text||'';bindDraft(text, key, status);
  const form = el('form', { class:'stack', onsubmit:act(async event => {
    event.preventDefault(); if (!text.value.trim()) throw new Error('Write a few words, or skip this reflection.');
    await update(d => { d.sessionReflections = d.sessionReflections.filter(record => record.id !== session.id); d.sessionReflections.push({ id:session.id, text:text.value.trim(), at:Date.now() }); d.reflectionSeen = session.id; delete d.drafts[key]; }); if (isPanel('reflection')) closePanel(); emit('toast','Reflection saved on this device.');
  }) }, el('h3', {}, session.taskTitle || 'Your focus session'), el('p', {}, `${Math.round(session.duration / 60000)} focused minutes · ${session.completed ? 'Completed' : 'Partial session'}`), text, status, el('div', { class:'row' }, el('button', { type:'submit', class:'primary' }, 'Save reflection'), el('button', { type:'button', onclick:closePanel }, 'Skip for now'), el('details',{},el('summary',{},'Manage draft'),el('button', { type:'button', onclick:act(async () => { await update(d => { delete d.drafts[key]; }); text.value = saved?.text || ''; status.textContent = 'Draft discarded.'; }) }, 'Discard draft'))));
  openPanel('A moment to reflect', 'reflection', form, () => emit('reflection:active',false)); emit('reflection:active',true); text.focus();
}
export const render = open;
export function init() {}
export function destroy() { emit('reflection:active',false); }
