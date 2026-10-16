import { resumePanel, discardPanel, panelRequest } from './ui.js';
import { get } from './storage.js';
import { AI_ASSIST } from './config.js';
const modules = new Map();
export function registerFeature(name, module) {
  modules.set(name, module);
}
const tools = new Set(['firststep','recall','garden','proof','energyweather','afterglow','career','quietweb','skills','capsules','recovery','compiler','dna','energy','customizer','websearch','support','dictionary','reflection','queue','commands','scenes','blocker','rituals','layout','suggestions','notifications','ai']);
const enabled = name => name === 'notes' ? ['notes','tasks','habits'].some(k => get().settings.widgets[k]) : tools.has(name) ? name !== 'ai' || AI_ASSIST : get().settings.widgets[name];
tools.add('breathing');
/** Load isolated panels on demand. */
export async function openFeature(name) {
  if (name === 'tasks' || name === 'habits') name = 'notes';
  if (!enabled(name) || resumePanel(name)) return;
  const isCurrent = panelRequest();
  if (!modules.has(name)) {
    const module = await import(`../components/${name}/index.js`);
    if (!isCurrent() || !enabled(name)) return;
    if (!modules.has(name)) {
      module.init();
      modules.set(name, module);
    }
  }
  if (isCurrent() && enabled(name)) await modules.get(name).open();
}
export function destroyFeature(name) {
  discardPanel(name);
  modules.get(name)?.destroy();
  modules.delete(name);
}
/** Inactive panel caches must never retain another space's private editor. */
export function clearSpacePanels(){for(const name of [...modules.keys()])if(name!=='countdowns')destroyFeature(name);}
export async function openDay() { const current = panelRequest(), module = await import('../components/tools/index.js'); if (current()) module.open(); }


