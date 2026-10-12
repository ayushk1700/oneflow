import { t as translate } from '../../core/i18n.js';
import { bindDraft, saveDraft } from '../../core/drafts.js';
import { get, update } from '../../core/storage.js';
import { getAll, put } from '../../core/db.js';
import { el, dayKey, uid } from '../../core/utils.js';
import { streak, shiftDay } from '../../core/stats-logic.js';
import { openPanel, field, select, act, isPanel } from '../../core/ui.js';
import { backgroundSync } from '../../core/timer-client.js';
import { emit } from '../../core/events.js';
import { tabs } from '../panel-design/index.js';
export function open(kind = new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'midday' : 'evening') {
  const today = dayKey(),
    d = get(),
    saved = d.rituals.find(r => r.kind === kind && r.date === today),
    previous = d.rituals.find(r => r.kind === 'evening' && r.date === shiftDay(today, -1));
  const text = el('textarea', {
    rows: 5,
    maxlength: 5000,
    'aria-label': translate('m0323')
  });
  text.value = saved?.text || '';
  const draftStatus = el('small', {
    class: 'muted',
    role: 'status'
  });
  bindDraft(text, `ritual:${today}-${kind}`, draftStatus);
  const focus = el('input', {
    maxlength: 240,
    value: saved?.focus || (kind === 'morning' ? d.focus.text : ''),
    'aria-label': translate('m0324')
  });
  const top = [0, 1, 2].map(i => el('input', {
    maxlength: 240,
    value: saved?.top[i] || (kind === 'morning' ? previous?.top[i] : '') || '',
    'aria-label': translate('m0325', {
      p0: i + 1
    })
  }));
  const draftKeys = [`ritual:${today}-${kind}`, `ritual:${today}-${kind}-focus`, ...top.map((_,i) => `ritual:${today}-${kind}-priority-${i}`)];
  bindDraft(focus, draftKeys[1], draftStatus); top.forEach((input,i) => bindDraft(input, draftKeys[i+2], draftStatus));
  const discardDrafts = el('button', { type: 'button', onclick: act(async () => { for (const key of draftKeys) await saveDraft(key, ''); text.value = saved?.text || ''; focus.value = saved?.focus || ''; top.forEach((input,i) => { input.value = saved?.top[i] || ''; }); draftStatus.textContent = 'Draft discarded. Saved ritual retained.'; }) }, 'Discard ritual draft');
  const form = el('form', {
    class: 'stack',
    onsubmit: act(async e => {
      e.preventDefault();
      if (!text.value.trim()) throw new Error(translate('m0326'));
      if (kind === 'evening') {
        const existing = (await getAll('journal')).find(x => x.date === today);
        const previousBlock = saved?.text ? `\n\n${saved.text}` : '';
        const base = existing && previousBlock && existing.text.endsWith(previousBlock) ? existing.text.slice(0, -previousBlock.length) : existing?.text === saved?.text ? '' : existing?.text || '';
        const value = base ? `${base}\n\n${text.value.trim()}` : text.value.trim();
        if (value.length > 20000) throw new Error(translate('m0682'));
        await put('journal', {
          id: existing?.id || uid(),
          date: today,
          prompt: existing?.prompt || translate('m0327'),
          text: value,
          updatedAt: Date.now()
        });
      }
      await update(next => {
        const record = {
          id: saved?.id || `${today}-${kind}`,
          kind,
          date: today,
          text: text.value.trim(),
          focus: focus.value.trim(),
          top: top.map(x => x.value.trim()).filter(Boolean),
          at: Date.now()
        };
        next.rituals = next.rituals.filter(r => r.id !== record.id);
        next.rituals.push(record);
        if (kind === 'morning') {
          if (record.focus) next.focus = {
            date: today,
            text: record.focus,
            completed: false
          };
          if (!saved) for (const value of record.top) next.tasks.push({
            id: uid(),
            text: value,
            listId: next.lists[0].id,
            completed: false
          });
        }
      });
      for (const key of draftKeys) await saveDraft(key, '');
      emit('toast', translate('m0658'));
      if (isPanel('rituals')) open(kind);
    })
  }, el('p', {
    class: 'muted'
  }, translate('m0690', {
    p0: streak(d.rituals.map(r => r.date))
  })), field(translate('m0328'), select([['morning', translate('m0329')], ['midday', translate('m0330')], ['evening', translate('m0331')]], kind, e => open(e.target.value))), field({
    morning: translate('m0332'),
    midday: translate('m0333'),
    evening: translate('m0334')
  }[kind], text));
  if (kind === 'morning') form.append(field(translate('m0335'), focus));
  const priorities=el('details',{},el('summary',{},kind==='evening'?'Tomorrow’s priorities':'Optional priorities'));form.append(priorities);
  if (kind !== 'midday') top.forEach((input, i) => priorities.append(field(`${kind === 'evening' ? translate('m0336') : translate('m0337')} priority ${i + 1}`, input)));
  form.append(draftStatus, el('details',{},el('summary',{},'Manage draft'),discardDrafts), el('button', {
    type: 'submit',
    class: 'primary'
  }, saved ? translate('m0338') : translate('m0339')));
  form.append(el('button', {
    type: 'button',
    onclick: () => {
      import('../../core/ui.js').then(m => m.closePanel());
    }
  }, translate('m0305')));
  form.append(el('button', {
    type: 'button',
    onclick: act(async () => {
      await update(next => {
        next.ritualSnoozes[kind] = Date.now() + 1800000;
      });
      await backgroundSync();
      emit('toast', translate('m0659'));
    })
  }, translate('m0660')));
  const root = el('div', {
    class: 'stack'
  });const todayView=el('div',{class:'stack'},form);todayView.append(el('button', { type: 'button', class: 'settings-link', onclick: () => emit('settings:open', 'reminders') }, translate('Manage reminders in Settings')));
  const history = el('div',{class:'stack'},el('h3',{},'Previous check-ins'));if(!d.rituals.length)history.append(el('p',{class:'empty-state'},'Your saved check-ins will appear here.'));
  for (const row of d.rituals.slice(-30).reverse()) history.append(el('article', {
    class: 'entry-card'
  }, el('strong', {}, `${row.date} · ${row.kind}`), el('p', {}, row.text), el('p', {}, row.top.join(' · '))));
  tabs(root,[{label:'Today',content:todayView},{label:'History',content:history}],'rituals');
  openPanel(translate('m0634'), 'rituals', root);
}
export const render = open;
export function init() {}
export function destroy() {}
