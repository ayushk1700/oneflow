import test from 'node:test';
import assert from 'node:assert/strict';

test('concurrent first-run initialization cannot overwrite a new focus', async () => {
  let saved, queue = Promise.resolve(), firstSync = true, releaseSync, signalSync;
  const syncStarted = new Promise(resolve => { signalSync = resolve; });
  const delayedSync = new Promise(resolve => { releaseSync = resolve; });
  const navigatorDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  const chromeDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'chrome');
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { locks: {
    request(_name, action) { const next = queue.then(action); queue = next.catch(() => {}); return next; },
  } } });
  Object.defineProperty(globalThis, 'chrome', { configurable: true, value: { storage: {
    local: { get: async () => ({ oneflow: structuredClone(saved) }), set: async data => { saved = structuredClone(data.oneflow); } },
    sync: {
      async get() { if (firstSync) { firstSync = false; signalSync(); await delayedSync; } return {}; },
      async set() {}, remove: async () => {},
    },
    onChanged: { addListener() {} },
  } } });
  try {
    const worker = await import('../core/storage.js?startup-worker');
    const tab = await import('../core/storage.js?startup-tab');
    const openingWorker = worker.init();
    await syncStarted;
    const editingTab = tab.init().then(() => tab.set('focus', { date: '2026-10-02', text: 'Keep my first edit', completed: false }));
    // Before the fix, the second context can save while the first awaits sync.
    await Promise.race([editingTab, new Promise(resolve => setTimeout(resolve, 15))]);
    releaseSync();
    await Promise.all([openingWorker, editingTab]);
    assert.equal((await tab.readLatest()).focus.text, 'Keep my first edit');
    await tab.clearSync();
  } finally {
    if (navigatorDescriptor) Object.defineProperty(globalThis, 'navigator', navigatorDescriptor); else delete globalThis.navigator;
    if (chromeDescriptor) Object.defineProperty(globalThis, 'chrome', chromeDescriptor); else delete globalThis.chrome;
  }
});
