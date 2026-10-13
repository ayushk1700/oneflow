import { t as translate } from '../../core/i18n.js';
import { get } from '../../core/storage.js';
import { el } from '../../core/utils.js';
import { openPanel, act, closePanel, panelRequest } from '../../core/ui.js';
import { tools, toolEnabled, matchesTool, launchTool, openSettings } from '../../core/tool-catalog.js';
import { emit } from '../../core/events.js';
import { timerCommand } from '../../core/timer-client.js';
import { catalog, applyScene } from '../../core/scenes.js';
/** Search local tasks, tools, scenes and dashboard actions. */
export async function open() {
  const isCurrent = panelRequest();
  const scenes = await catalog(), data = get();
  const items = [
    ...tools.filter(([id]) => id !== 'commands' && toolEnabled(id)).map(tool => ({ label: tool[1], aliases: [...tool, `Open ${tool[0]}`, `Open ${tool[1]}`], run: () => launchTool(tool[0]) })),
    { label: translate('m0047'), aliases: ['Flow Mode','Fullscreen focus'], run: () => { closePanel(); emit('flow:enter'); } },
    { label: translate('m0048'), aliases: ['Settings','Preferences'], run: () => openSettings() },
    { label: 'Website blocking', aliases: ['Blocker','Rules','Blocking'], run: () => openSettings('blocking') },
    ...(data.settings.widgets.timer ? [{ label: 'Session settings', aliases: ['Timer','Rhythm','Open timer'], run: () => emit('timer:open') }] : []),
    ...data.tasks.filter(t => !t.completed).map(task => ({ label: translate('m0154', {p0: task.text}), run: async () => { if (get().timer.sessionId) throw new Error(translate('m0155')); await timerCommand('task', { taskId: task.id }); closePanel(); } })),
    ...scenes.map(scene => ({ label: translate('m0156', {p0: scene.name}), run: async () => { await applyScene(scene.id); await (await import('../../core/timer-client.js')).backgroundSync(); closePanel(); } }))
  ];
  const search = el('input', { type: 'search', placeholder: translate('m0157'), 'aria-label': translate('m0158'), autocomplete: 'off' }), results = el('div', { class: 'stack', 'aria-label': translate('m0159') });
  const count=el('p',{role:'status',class:'muted'});const draw = () => { const matches = items.filter(item => matchesTool([item.label, ...(item.aliases || [])],search.value)); count.textContent=`${matches.length} matching actions`;results.replaceChildren(...matches.map(item => el('button', { class: 'text-button', onclick: act(item.run) }, item.label))); if (!matches.length) results.append(el('p', {}, translate('m0160'))); };
  search.oninput = draw;
  search.onkeydown = e => { if (e.key === translate('m0161')) { e.preventDefault(); results.querySelector('button')?.focus(); } if (e.key === translate('m0162')) { e.preventDefault(); results.querySelector('button')?.click(); } };
  results.onkeydown = e => { const buttons = [...results.querySelectorAll('button')], i = buttons.indexOf(document.activeElement); if ([translate('m0161'),translate('m0163')].includes(e.key)) { e.preventDefault(); buttons[(i + (e.key === translate('m0161') ? 1 : -1) + buttons.length) % buttons.length]?.focus(); } };
  if (!isCurrent()) return;
  draw(); openPanel(translate('m0164'), 'commands', el('div', { class: 'stack command-workspace' },el('p',{class:'muted'},'Search your tools, unfinished tasks and Scenes. Use arrow keys to browse and Enter to choose.'),search,count,results)); search.focus();
}
export const render = open;
export function init() {}
export function destroy() {}
