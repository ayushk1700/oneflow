import { t as translate } from '../../core/i18n.js';
import { get } from '../../core/storage.js';
import { getAll } from '../../core/db.js';
import { suggestions } from '../../core/suggestions.js';
import { el } from '../../core/utils.js';
import { openPanel, panelRequest } from '../../core/ui.js';
export async function open() {
  const isCurrent = panelRequest();
  const rows = suggestions(get(), await getAll('sessions'));
  if (!isCurrent()) return;
  openPanel(translate('m0043'), 'suggestions', el('div', {
    class: 'stack'
  }, el('p', {
    class: 'muted'
  }, translate('m0476')), el('section',{class:'work-section stack'},el('h3',{},'One thing to try'),el('p',{class:'review-question'},rows[0]||'Choose one small action to begin.')),rows.length>1?el('details',{},el('summary',{},'More local suggestions'),...rows.slice(1).map(text=>el('p',{class:'entry-card'},text))):null));
}
export const render = open;
export function init() {}
export function destroy() {}
