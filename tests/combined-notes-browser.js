import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url), { chromium } = require(process.env.ONEFLOW_NODE_MODULES + '/playwright');
const browser = process.argv[2] || 'chrome', checks = [], errors = [];
const context = await chromium.launchPersistentContext(path.resolve('.test-profile', `combined-notes-${browser}-${Date.now()}`), {
  executablePath: browser === 'edge' ? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' : 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true, viewport: { width: 1440, height: 1000 }, args: ['--enable-unsafe-extension-debugging'], ignoreDefaultArgs: ['--disable-extensions']
});
const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
const pass = label => { checks.push(label); console.log('PASS: ' + label); };
try {
  const cdp = await context.browser().newBrowserCDPSession(), { id } = await cdp.send('Extensions.loadUnpacked', { path: process.cwd() });
  await page.goto(`chrome-extension://${id}/newtab/index.html`);
  await page.waitForSelector('html[data-ready=true]');
  const skip = page.getByRole('button', { name: 'Skip for now', exact: true }); if (await skip.isVisible()) await skip.click();
  await page.locator('#panel').waitFor({ state: 'hidden' });
  await page.evaluate(async () => {
    const storage = await import('../core/storage.js'), notes = await import('../core/notes.js');
    const { dayKey } = await import('../core/utils.js'), { shiftDay } = await import('../core/stats-logic.js');
    await storage.update(d => { d.tasks = [{ id: 'original-task', text: 'Read chapter', listId: 'inbox', completed: false }]; d.habits = [{ id: 'original-habit', name: 'Read daily', dates: [shiftDay(dayKey(), -1)], reminder: '09:00' }]; });
    await notes.saveNote(notes.makeNote({ title: 'A saved idea', text: 'Keep the original thought.' }));
  });
  assert.equal(await page.locator('#dock').getByRole('button', { name: 'Notes', exact: true }).count(), 1);
  assert.equal(await page.locator('#dock').getByRole('button', { name: 'Tasks', exact: true }).count(), 0);
  await page.locator('#dock').getByRole('button', { name: 'Notes', exact: true }).click();
  const frame = page.frameLocator('.notes-workspace-frame'), saved = () => frame.getByRole('status').filter({ hasText: 'Saved on this device' }).waitFor();
  await frame.getByRole('button', { name: 'Open A saved idea', exact: true }).waitFor();
  await frame.getByRole('button', { name: 'Open task Read chapter', exact: true }).waitFor();
  await frame.getByRole('button', { name: 'Open habit Read daily', exact: true }).waitFor();
  assert(!await page.locator('#panel .panel-header').isVisible()); assert(!await page.locator('#panel-nav').isVisible());
  assert.equal(await page.locator('dialog[open]').count(), 1);
  pass('One Notes launcher opens one dedicated panel containing saved notes, tasks and habits');
  await frame.getByRole('button', { name: 'Open task Read chapter', exact: true }).click();
  await frame.getByLabel('Task text', { exact: true }).fill('Read chapter two'); await saved();
  await frame.getByLabel('Task complete', { exact: true }).check(); await saved();
  await frame.getByLabel('Task complete', { exact: true }).uncheck(); await saved();
  await frame.getByRole('button', { name: 'Focus on this task', exact: true }).click();
  await frame.getByRole('status').filter({ hasText: 'Task selected' }).waitFor();
  const task = await page.evaluate(async () => { const d = await (await import('../core/storage.js')).readLatest(); return { id: d.tasks[0].id, text: d.tasks[0].text, timer: d.timer.taskId }; });
  assert.deepEqual(task, { id: 'original-task', text: 'Read chapter two', timer: 'original-task' });
  await frame.getByRole('button', { name: '← All notes', exact: true }).click();
  await frame.getByRole('button', { name: 'Open habit Read daily', exact: true }).click();
  await frame.getByLabel('Habit name', { exact: true }).fill('Read every day'); await saved();
  const today = await page.evaluate(async () => (await import('../core/utils.js')).dayKey());
  await frame.getByLabel(`Check in ${today}`, { exact: true }).click(); await saved();
  await frame.getByLabel('Daily habit reminder', { exact: true }).fill('10:30'); await frame.getByLabel('Daily habit reminder', { exact: true }).press('Tab'); await saved();
  const habit = await page.evaluate(async () => (await (await import('../core/storage.js')).readLatest()).habits[0]);
  assert.equal(habit.id, 'original-habit'); assert.equal(habit.dates.length, 2); assert.equal(habit.reminder, '10:30');
  pass('Task IDs, timer linkage, habit history/check-ins and reminders remain live');
  await frame.getByRole('button', { name: '← All notes', exact: true }).click();
  const create = async kind => { await frame.getByLabel('Create new', { exact: true }).click(); await frame.getByRole('button', { name: kind, exact: true }).click(); };
  await create('Task'); await frame.getByLabel('Task text', { exact: true }).fill('New combined task'); await saved();
  await frame.getByRole('button', { name: '← All notes', exact: true }).click();
  await create('Habit'); await frame.getByLabel('Habit name', { exact: true }).fill('Stretch'); await saved();
  await frame.getByRole('button', { name: '← All notes', exact: true }).click();
  await frame.getByLabel('Note type', { exact:true }).selectOption('habit');
  await frame.getByRole('button', { name: 'Stretch', exact:true }).waitFor();
  assert.equal(await frame.locator('[data-kind=task]').count(), 0);
  await frame.getByLabel('Search notes').fill('Stretch');
  await page.waitForTimeout(200); assert.equal(await frame.locator('.planner-habit-grid tbody tr').count(), 1);
  await frame.getByLabel('Search notes').fill(''); await frame.getByLabel('Note type', { exact:true }).selectOption('');
  pass('Single creation menu adds tasks/habits; shared search and type filter work');
  await fs.mkdir('docs/screenshots', { recursive: true });
  await page.screenshot({ path: `docs/screenshots/combined-notes-${browser}-1440.png` });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 820 });
    assert(await frame.locator('body').evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({ path: `docs/screenshots/combined-notes-${browser}-${width}.png` });
  }
  await frame.getByRole('button', { name: 'Close notes', exact: true }).click(); await page.locator('#panel').waitFor({ state: 'hidden' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const old of ['tasks', 'habits']) {
    await page.evaluate(async name => (await import('../core/features.js')).openFeature(name), old);
    await page.locator('#panel[data-panel=notes]').waitFor();
    await frame.getByLabel('Search notes').waitFor();
    await frame.getByRole('button', { name: 'Close notes', exact: true }).click(); await page.locator('#panel').waitFor({ state: 'hidden' });
  }
  await page.locator('#main').focus(); await page.keyboard.press('n'); await page.locator('#panel[data-panel=notes]').waitFor();
  await frame.getByRole('button', { name: 'Open habit Stretch' }).waitFor();
  pass('Responsive panel, legacy task/habit routes, N shortcut and reopen persistence work');
  assert.deepEqual(errors, []);
} finally {
  await fs.mkdir('docs/qa-results', { recursive: true });
  await fs.writeFile(`docs/qa-results/combined-notes-${browser}.json`, JSON.stringify({ checks, errors }, null, 2));
  await context.close();
}
