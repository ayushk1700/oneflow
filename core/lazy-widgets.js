import { on, emit } from './events.js';
/** Secondary Home widgets load on demand without adding their editors to startup. */
function deferredWidget(load) {
  let module, generation = 0;
  return {
    async init(node) { const ticket = ++generation; const next = await load(); if (ticket === generation) { module = next; await module.init(node); } },
    render() { module?.render(); },
    destroy() { generation++; module?.destroy(); module = undefined; }
  };
}
export const quotes = deferredWidget(() => import('../components/quotes/index.js'));
export const weather = deferredWidget(() => import('../components/weather/index.js'));
export const links = deferredWidget(() => import('../components/links/index.js'));
let tasksOff, settingsOff, settingsModule;
/** Compatibility entry: all former task launchers open the unified Notes panel. */
export const tasks = {
  init() { tasksOff = on('task:new', () => tasks.open().catch(error => emit('error', error))); },
  async open() { return (await import('./features.js')).openFeature('notes'); },
  render() {},
  destroy() { tasksOff?.(); }
};
/** Settings remain available without loading image/import tools on every new tab. */
export const settings = {
  init() {
    settingsOff = on('settings:open', async tab => {
      try {
        if (!settingsModule) {
          settingsModule = await import('../components/settings/index.js');
          settingsOff?.();
          settingsModule.init();
        }
        settingsModule.render(tab);
      } catch (error) {
        emit('error', error);
      }
    });
  }
};
let countdownModule, countdownNode, countdownPending, countdownEpoch = 0;
async function loadCountdowns() {
  const epoch = countdownEpoch;
  if (!countdownPending) countdownPending = import('../components/countdowns/index.js').then(module => {
    if (epoch !== countdownEpoch) return;
    countdownModule = module;
    module.init(countdownNode);
    return module;
  }).catch(error => { if (epoch === countdownEpoch) countdownPending = null; throw error; });
  return countdownPending;
}
/** Optional countdown widget is loaded only when enabled or opened. */
export const countdowns = {
  async init(node) { countdownNode = node; await loadCountdowns(); },
  async open() { (await loadCountdowns())?.open(); },
  render() { countdownModule?.render(); },
  destroy() { countdownEpoch++; countdownModule?.destroy(); countdownModule = null; countdownPending = null; countdownNode = null; }
};
