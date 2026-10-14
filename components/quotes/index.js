import { t as translate } from '../../core/i18n.js';
import { get, update } from '../../core/storage.js';
import { el, dayKey } from '../../core/utils.js';
import { button, watch, openPanel, act } from '../../core/ui.js';
let root, unsubscribe, quotes = [], index = 0, generation = 0,tick,filtered=[],lastPool='',lastSlot='';
function category(quote){return quote.category||(/grateful|gratitude|thank/i.test(quote.text)?'gratitude':/creat|idea|imagina|wonder/i.test(quote.text)?'creativity':/focus|begin|step|work|minute|breath/i.test(quote.text)?'focus':'life');}
function choose(){const prefs=get().settings.customization?.widgets?.preferences?.quotes||{categories:['focus','life','creativity','gratitude'],custom:[],rotation:'daily',author:true},pool=[...quotes,...prefs.custom].filter(q=>prefs.categories.includes(category(q))),key=JSON.stringify(pool.map(q=>[q.id,q.text,q.author])),slot=prefs.rotation==='newtab'?'newtab':dayKey()+(prefs.rotation==='hourly'?':'+new Date().getHours():'');if(key!==lastPool||slot!==lastSlot){filtered=pool;lastPool=key;lastSlot=slot;index=pool.length?(prefs.rotation==='newtab'?Math.floor(Math.random()*pool.length):[...slot].reduce((sum,c)=>sum+c.charCodeAt(0),0)%pool.length):0;}return prefs;}
export function render() {
  if (!quotes.length) return;
  const prefs=choose();if(!filtered.length){root.replaceChildren(el('p',{class:'empty-state'},'Enable a category or add your own quote.'));return;}const quote = filtered[index%filtered.length], favorite = get().favorites.includes(quote.id);
  const expanded = root.querySelector('.quote-details')?.open || false;
  root.replaceChildren(el('div', { class: 'quote-line' }, el('blockquote', {}, `“${quote.text}”`)),
    el('details', { class: 'quote-details', ...(expanded ? { open: '' } : {}) }, el('summary', {}, 'About this quote'),
      el('div', { class: 'quote-detail-content' }, el('p', { class: 'quote-author',hidden:!prefs.author }, quote.author),
        el('div', { class: 'quote-actions' }, button(favorite ? translate('m0315') : translate('m0316'), favorite ? 'heart-filled' : 'heart', act(() => toggle(quote.id))), button(translate('m0317'), 'refresh-cw', () => { index = (index + 1) % filtered.length; render(); }), button(translate('m0318'), 'bookmark', favorites)))));
}
async function toggle(id) { await update(d => { d.favorites = d.favorites.includes(id) ? d.favorites.filter(x => x !== id) : [...d.favorites, id]; }); }
function favorites() {
  const content = el('div', { class: 'stack' });
  const draw = () => { const saved = [...quotes,...(get().settings.customization?.widgets?.preferences?.quotes?.custom||[])].filter(q => get().favorites.includes(q.id)); content.replaceChildren(...(saved.length ? saved.map(q => el('div', { class: 'row' }, el('p', { class: 'grow' }, q.text), button(translate('m0319'), 'heart-filled', act(async () => { await toggle(q.id); draw(); })))) : [el('p', { class: 'empty-state' }, translate('m0320'))])); };
  draw(); openPanel(translate('m0321'), 'quotes', content);
}
export async function init(node) { root = node; const version = ++generation; const response = await fetch('../data/quotes.json'); if (!response.ok) throw new Error(translate('m0322')); const data = await response.json(); if (version !== generation) return; quotes = data; index = [...dayKey()].reduce((sum, c) => sum + c.charCodeAt(0), 0) % quotes.length; render(); unsubscribe = watch(d => [d.favorites,d.settings.customization?.widgets?.preferences?.quotes,d.settings.customization?.behavior?.spaceId], render);tick=setInterval(()=>{if(!document.hidden)render();},60000); }
export function destroy() { generation++;clearInterval(tick);unsubscribe?.(); root?.replaceChildren();lastPool=lastSlot=''; }
