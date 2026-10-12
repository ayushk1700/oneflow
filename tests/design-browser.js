// Interaction regression checks for the shared glass dialog. Uses an isolated profile.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(`${process.env.ONEFLOW_NODE_MODULES || '../node_modules'}/playwright`);
const browser = process.argv[2] || 'chrome';
const context = await chromium.launchPersistentContext(path.resolve('.test-profile', `design-${browser}-${Date.now()}`), {
  executablePath: browser === 'edge' ? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' : 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true, viewport: { width: 1440, height: 960 }, args: ['--enable-unsafe-extension-debugging'], ignoreDefaultArgs: ['--disable-extensions'],
});
const page = await context.newPage();
page.setDefaultTimeout(12000);
const report = { browser, date: new Date().toISOString(), checks: [], errors: [], timings: [] };
page.on('pageerror', e => report.errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') report.errors.push(m.text()); });
const pass = message => { report.checks.push(message); console.log(`PASS: ${message}`); };
const tool = label => page.getByRole('button', { name: `Open ${label}`, exact: true }).click();
const close = () => page.getByRole('button', { name: 'Close panel', exact: true }).click();
const day = async label => { await tool('Your day'); await page.getByRole('button', { name: new RegExp(label) }).click(); };
const snapshot = name => page.screenshot({ path: `test-results/design-${browser}-${name}.png`, fullPage: true });
await fs.mkdir('test-results', { recursive: true });
try {
  const cdp = await context.browser().newBrowserCDPSession();
  const { id } = await cdp.send('Extensions.loadUnpacked', { path: process.cwd() });
  await page.goto(`chrome-extension://${id}/newtab/index.html`);
  await page.waitForSelector('html[data-ready=true]');
  await page.getByRole('button', { name: 'Skip for now', exact: true }).click();
  await page.getByLabel('Your main focus today', { exact: true }).fill('Make room for deep work');
  await page.getByLabel('Your main focus today', { exact: true }).press('Enter');
  await page.locator('.focus-start').click();
  await page.waitForFunction(async () => (await import('../core/storage.js')).get().timer.status === 'running');
  assert.equal(await page.evaluate(async () => (await import('../core/storage.js')).get().timer.taskTitle), 'Make room for deep work');
  await page.getByRole('button', { name: 'Pause focus timer', exact: true }).click();
  await page.getByRole('button', { name: 'Resume focus timer', exact: true }).waitFor();
  assert(await page.locator('.timer-live').isVisible());
  pass('Daily focus starts a titled session; persistent dashboard control pauses it');
  await snapshot('dashboard');

  await page.getByRole('button', { name: 'My tasks', exact: true }).click();
  await page.getByLabel('New task', { exact: true }).fill('Plan the week');
  await page.getByLabel('New task', { exact: true }).press('Enter');
  await page.getByLabel('Complete Plan the week', { exact: true }).waitFor();
  await page.getByLabel('New task', { exact: true }).fill('Keep this unfinished task');
  await tool('Settings');
  await page.getByRole('button', { name: 'Widgets', exact: true }).click();
  await tool('Tasks');
  assert.equal(await page.getByLabel('New task', { exact: true }).inputValue(), 'Keep this unfinished task');
  await page.getByLabel('Edit Plan the week', { exact: true }).click();
  await page.getByLabel('Edit task', { exact: true }).fill('An unfinished edit');
  await tool('Focus');
  await page.getByText('Make the rhythm yours', { exact: true }).click();
  await page.getByLabel('Focus minutes', { exact: true }).fill('42');
  await tool('Tasks');
  assert.equal(await page.getByLabel('Edit task', { exact: true }).inputValue(), 'An unfinished edit');
  await page.getByLabel('Edit task', { exact: true }).press('Enter');
  await page.getByLabel('Complete An unfinished edit', { exact: true }).waitFor();
  await tool('Focus');
  assert.equal(await page.getByLabel('Focus minutes', { exact: true }).inputValue(), '42');
  assert(await page.locator('details').evaluate(x => x.open));
  pass('Task creation/edit and timer configuration drafts survive dynamic tool switching');

  await day('The good in today');
  await page.getByLabel('Journal entry', { exact: true }).fill('An unsaved reflection');
  await tool('Tasks');
  await day('The good in today');
  assert.equal(await page.getByLabel('Journal entry', { exact: true }).inputValue(), 'An unsaved reflection');
  await day('Small promises');
  await page.getByRole('button', { name: 'Add habit', exact: true }).click();
  await page.getByLabel('Habit name', { exact: true }).fill('Read a page');
  await tool('Tasks');
  await day('Small promises');
  assert.equal(await page.getByLabel('Habit name', { exact: true }).inputValue(), 'Read a page');
  await page.getByRole('button', { name: 'Save habit', exact: true }).click();
  await page.locator('.habit-week').waitFor();
  pass('Journal and habit forms preserve their live state and submit after switching');

  await tool('Tasks');
  const box = await page.locator('#panel').boundingBox();
  assert(Math.abs(box.x + box.width / 2 - 720) < 2);
  assert(Math.abs(box.y + box.height / 2 - 480) < 2);
  assert.equal(await page.locator('#panel-nav [aria-current=page]').getAttribute('data-tool'), 'tasks');
  await page.getByLabel('New task', { exact: true }).fill('');
  await snapshot('tasks');
  await page.locator('#close-panel').focus();
  for (let i = 0; i < 24; i++) { await page.keyboard.press('Tab'); assert(await page.evaluate(() => document.querySelector('#panel').contains(document.activeElement))); }
  await page.keyboard.press('Escape');
  await page.waitForSelector('#panel', { state: 'hidden' });
  assert.equal(await page.evaluate(() => document.activeElement.getAttribute('aria-label')), 'My tasks');
  pass('Popup is centered, navigation highlights the tool, Tab stays inside, Escape restores focus');

  await page.getByRole('button', { name: 'Sounds', exact: true }).click();
  await page.getByRole('button', { name: 'Play soundscape', exact: true }).click();
  await page.getByRole('button', { name: 'Toggle Forest morning', exact: true }).click();
  await page.waitForFunction(async () => (await import('../core/storage.js')).get().audio.volumes.forest > 0);
  await tool('Settings');
  await tool('Sounds');
  assert.equal(await page.getByRole('button', { name: 'Toggle Forest morning', exact: true }).getAttribute('aria-pressed'), 'true');
  await close();
  await page.locator('#audio-status').waitFor();
  const audioLabel = await page.locator('#audio-status').innerText();
  assert(audioLabel.includes('Rain') && audioLabel.includes('Forest'));
  await page.waitForFunction(async () => (await chrome.runtime.sendMessage({ target: 'audio', type: 'inspect' }))?.layers === 2);
  await page.getByRole('button', { name: 'Pause ambient sounds', exact: true }).click();
  await page.waitForSelector('#audio-status', { state: 'hidden' });
  await page.waitForFunction(async () => (await chrome.runtime.sendMessage({ target: 'audio', type: 'inspect' }))?.layers === 0);
  pass('Audio survives panel switching/closure and dashboard pause stops the shared player');

  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByLabel('Theme', { exact: true }).selectOption('light');
  await page.waitForSelector('html[data-theme=light]');
  await snapshot('light-settings');
  await page.getByRole('switch', { name: 'Reduce motion', exact: true }).check();
  await tool('Tasks');
  assert.equal(await page.locator('#panel').evaluate(x => getComputedStyle(x).animationName), 'none');
  await tool('Settings');
  await page.getByLabel('Theme', { exact: true }).selectOption('dark');
  await page.getByRole('button', { name: 'Widgets', exact: true }).click();
  await page.getByRole('switch', { name: 'To-do lists', exact: true }).uncheck();
  await page.waitForFunction(() => !document.querySelector('#panel-nav [data-tool=tasks]'));
  await page.getByRole('switch', { name: 'To-do lists', exact: true }).check();
  await page.waitForSelector('#panel-nav [data-tool=tasks]');
  await tool('Tasks');
  await page.getByLabel('New task', { exact: true }).waitFor();
  pass('Light theme and reduced motion apply; disabling/re-enabling a cached widget is safe');

  for (const viewport of [{ width: 390, height: 844 }, { width: 320, height: 568 }, { width: 844, height: 390 }]) {
    await page.setViewportSize(viewport);
    for (const name of ['Tasks', 'Settings', 'Sounds', 'Your day']) {
      await tool(name);
      const rect = await page.locator('#panel').boundingBox();
      assert(rect.x >= 0 && rect.y >= 0 && rect.x + rect.width <= viewport.width + 1 && rect.y + rect.height <= viewport.height + 1);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth && document.querySelector('#panel-body').scrollWidth <= document.querySelector('#panel-body').clientWidth + 1));
    }
    await tool('Tasks');
    if (viewport.width <= 390) assert((await page.locator('.task-text').first().boundingBox()).width > viewport.width * .45, 'Task text must keep a readable width');
    await snapshot(`mobile-${viewport.width}`);
  }
  await close(); await snapshot('mobile-dashboard');
  pass('Centered tools fit narrow mobile and short landscape viewports without horizontal overflow');

  await page.setViewportSize({ width: 1440, height: 960 });
  await page.getByRole('button', { name: 'My tasks', exact: true }).click();
  await page.evaluate(async () => {
    const ui = await import('../core/ui.js'); const tasks = await import('../components/tasks/index.js');
    ui.closePanel(); const pending = tasks.open(); ui.closePanel(); await pending;
  });
  assert.equal(await page.locator('#panel').evaluate(x => x.open), false);
  pass('Closing during an asynchronous open does not reopen the modal');
  for (let i = 0; i < 3; i++) { await page.reload(); await page.waitForSelector('html[data-ready=true]'); report.timings.push(await page.evaluate(() => performance.getEntriesByName('oneflow-ready')[0].startTime)); }
  assert.deepEqual(report.errors, []);
  pass('No page or console errors across the redesign walkthrough');
} catch (error) {
  report.failure = error.stack;
  report.focusState = await page.evaluate(async () => { const s = await import('../core/storage.js'); return { cached: s.get().focus, persisted: (await s.readLatest()).focus }; }).catch(() => null);
  process.exitCode = 1; console.error(error); await snapshot('failure').catch(() => {});
} finally {
  await fs.writeFile(`test-results/design-${browser}-report.json`, JSON.stringify(report, null, 2));
  await context.close();
}
