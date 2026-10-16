import { get, update } from '../../core/storage.js';
import { el } from '../../core/utils.js';
import { act, field, select, toggle } from '../../core/ui.js';

/** Build journal-only preferences without navigating to dashboard settings. */
export function journalSettings(onBack, onExport, beforeChange) {
  const settings = get().settings.journal;
  const change = key => act(async event => {
    if (!event.target.validity.valid) return;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.type === 'number' ? Number(event.target.value) : event.target.value;
    await beforeChange();
    await update(data => {
      data.settings.journal[key] = value;
      // Keep Studio typography consistent with the journal's own controls.
      if (key === 'font') data.settings.studio.type.journal.font = value;
      if (key === 'fontSize') data.settings.studio.type.journal.size = value;
    });
  });
  const number = (label,key,min,max,step) => field(label,el('input',{type:'number',value:settings[key],min,max,step,onchange:change(key)}));
  return el('section',{class:'journal-settings stack','aria-label':'Journal settings'},
    el('button',{type:'button',class:'journal-menu-action',onclick:onBack},'Back to pages'),
    el('h3',{},'Journal settings'),
    el('p',{},'Appearance follows the global Light / Dark theme.'),
    field('Journal typeface',select([['sans','Sans serif'],['serif','Serif'],['mono','Monospace']],settings.font,change('font'))),
    number('Text size','fontSize',14,28,1),number('Writing width','width',480,1000,20),
    toggle('Autosave journal entries',settings.autosave,change('autosave')),
    el('button',{type:'button',onclick:act(onExport)},'Export journal'),
    el('small',{},'Your writing stays in this browser.'));
}
