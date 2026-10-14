import { t as translate } from '../../core/i18n.js';
import { get, update } from '../../core/storage.js';
import { el, uid } from '../../core/utils.js';
import { safeURL } from '../../core/schema.js';
import { openPanel, field, button, watch, act, confirmAction } from '../../core/ui.js';
import { emit } from '../../core/events.js';
let root, unsubscribe;
export function render() {
  const data=get(),prefs=data.settings.customization?.widgets?.preferences?.links||{view:'grid',folder:'All'};root.dataset.linkView=prefs.view;root.replaceChildren(...data.links.filter(link=>prefs.folder==='All'||(link.folder||'General')===prefs.folder).slice(0,32).map(link => el('a', { class: 'quick-link', href: link.url, title: link.title }, el('span', { class: 'link-monogram', 'aria-hidden': 'true' }, link.icon||link.title.charAt(0).toUpperCase()), el('span', {}, link.title))), button(translate('m0250'), 'plus', () => manage(), 'icon-button link-add'));
}
export function manage() {
  const content = el('div', { class: 'stack' });
  const list = el('div', { class: 'stack' });
  const form = el('form', { class: 'stack' });
  const title = el('input', { required: true, maxlength: 80, placeholder: translate('m0251'), 'aria-label': translate('m0252') });
  const url = el('input', { required: true, type: 'url', placeholder: 'https://', maxlength: 2048, 'aria-label': translate('m0253') });
  const icon=el('input',{maxlength:40,'aria-label':'Custom icon or emoji',placeholder:'★ or an emoji'}),folder=el('input',{maxlength:60,'aria-label':'Quick link folder',value:'General'});
  let editing;
  const submit = el('button', { type: 'submit', class: 'primary' }, translate('m0254'));
  const move=async(id,before)=>{if(id===before)return;await update(d=>{const index=d.links.findIndex(l=>l.id===id);if(index<0)return;const item=d.links.splice(index,1)[0],target=d.links.findIndex(l=>l.id===before);d.links.splice(target<0?d.links.length:target,0,item);});draw();};
  const draw = () => list.replaceChildren(...get().links.map((link,index,items) => {const row=el('div', { class: 'row link-editor-row',draggable:true }, el('a', { class: 'grow', href: link.url }, link.title), button(translate('m0255', {p0: link.title}), 'pencil', () => { editing = link.id; title.value = link.title; url.value = link.url;icon.value=link.icon||'';folder.value=link.folder||'General'; submit.textContent = translate('m0256'); title.focus(); }),button('Move earlier','arrow-up',()=>move(link.id,items[Math.max(0,index-1)].id)),button('Move later','arrow-down',()=>move(link.id,items[index+2]?.id||null)), button(translate('m0257', {p0: link.title}), 'trash-2', () => confirmAction(content, translate('m0258', {p0: link.title}), async () => { await update(d => { d.links = d.links.filter(x => x.id !== link.id); }); draw(); })));row.ondragstart=e=>e.dataTransfer.setData('text/plain',link.id);row.ondragover=e=>e.preventDefault();row.ondrop=e=>{e.preventDefault();move(e.dataTransfer.getData('text/plain'),link.id).catch(error=>emit('error',error));};return row;}));
  form.append(field(translate('m0259'), title), field(translate('m0260'), url),field('Icon or emoji',icon),field('Folder',folder), submit);
  form.addEventListener('submit', act(async event => {
    event.preventDefault(); const href = safeURL(url.value);
    if (!href || !title.value.trim()) throw new Error(translate('m0261'));
    await update(d => { const link = { id: editing || uid(), title: title.value.trim(), url: href,icon:icon.value.trim(),folder:folder.value.trim()||'General' }; const index = d.links.findIndex(x => x.id === editing); if (index >= 0) d.links[index] = link; else d.links.push(link); });
    editing = null; form.reset(); submit.textContent = translate('m0254'); draw(); emit('toast', translate('m0262'));
  }));
  draw(); content.append(el('p', { class: 'muted' }, translate('m0263')), list, el('hr', { class: 'divider' }), form);
  openPanel(translate('m0264'), 'links', content);
}
export function init(node) { root = node; render(); unsubscribe = watch(d => [d.links,d.settings.customization?.widgets?.preferences?.links,d.settings.customization?.behavior?.spaceId], render); }
export function destroy() { unsubscribe?.(); root?.replaceChildren(); }
