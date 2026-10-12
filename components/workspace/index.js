import { el } from '../../core/utils.js';
import { get } from '../../core/storage.js';
import { on } from '../../core/events.js';
import { tasks } from '../../core/lazy-widgets.js';
import { act } from '../../core/ui.js';
import { openFeature } from '../../core/features.js';
/** Share navigation, while each tool retains its own editor and storage lifecycle. */
export function wrap(content, active) {
  const choices = [['tasks','Tasks'],['notes','Notes'],['habits','Habits']];
  const tabs = el('div',{class:'workspace-tabs',role:'tablist','aria-label':'Workspace tools'});
  const page = el('section',{id:`workspace-${active}`,role:'tabpanel','aria-labelledby':`workspace-tab-${active}`},content);
  for (const [id,label] of choices) tabs.append(el('button',{type:'button',id:`workspace-tab-${id}`,role:'tab','data-widget':id,hidden:!get().settings.widgets[id],'aria-selected':String(id === active),'aria-controls':page.id,tabindex:id === active ? 0 : -1,onclick:act(async () => { if (id === 'tasks') await tasks.open(); else await openFeature(id); document.querySelector('.workspace-tabs [aria-selected=true]')?.focus(); })},label));
  tabs.onkeydown = event => {
    const controls = [...tabs.children].filter(node => !node.hidden), index = controls.indexOf(document.activeElement); let next;
    if (event.key === 'ArrowRight') next = (index+1)%controls.length;
    if (event.key === 'ArrowLeft') next = (index+controls.length-1)%controls.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = controls.length-1;
    if (next === undefined) return; event.preventDefault(); controls[next].click();
  };
  return el('div',{class:'workspace-panel stack'},tabs,page);
}
export function init() {}
export function render() {}
export function destroy() {}


on('panel:open', () => document.querySelectorAll('.workspace-tabs [data-widget]').forEach(node => { node.hidden = !get().settings.widgets[node.dataset.widget]; }));

