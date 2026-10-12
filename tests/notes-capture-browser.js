import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.ONEFLOW_NODE_MODULES + '/playwright');
const browser = process.argv[2] || 'chrome';
const context = await chromium.launchPersistentContext(path.resolve('.test-profile', `notes-${browser}-${Date.now()}`), {
  executablePath: browser === 'edge' ? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' : 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true, viewport: { width: 1100, height: 900 },
  args: ['--enable-unsafe-extension-debugging', '--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'], ignoreDefaultArgs: ['--disable-extensions']
});
const page = await context.newPage(), checks = [], errors = [];
page.on('pageerror', e => errors.push(e.message));
const pass = label => { checks.push(label); console.log('PASS: ' + label); };
const saved = () => page.getByRole('status').filter({ hasText: 'Saved on this device' }).waitFor();
try {
  const cdp = await context.browser().newBrowserCDPSession();
  const { id } = await cdp.send('Extensions.loadUnpacked', { path: process.cwd() });
  const base = `chrome-extension://${id}`;
  await page.goto(base + '/components/notes/capture.html');
  await page.getByLabel('Create new', { exact: true }).click();
  await page.locator('.create-options').getByRole('button', { name: 'Note', exact: true }).click();
  await page.getByLabel('Note title', { exact: true }).fill('A captured thought');
  await page.getByLabel('Note text', { exact: true }).fill('<script>literal only</script>\nA useful idea'); await saved();
  await page.reload(); await page.getByRole('button', { name: 'Open A captured thought' }).click();
  assert.match(await page.getByLabel('Note text', { exact: true }).inputValue(), /<script>literal only/);
  await page.evaluate(() => {
    window.notesTestTransaction = IDBDatabase.prototype.transaction;
    IDBDatabase.prototype.transaction = function(stores, mode, ...rest) {
      if (mode === 'readwrite' && Array.from(stores).includes('notes')) throw new DOMException('Test storage is full. Retry saving.', 'QuotaExceededError');
      return window.notesTestTransaction.call(this, stores, mode, ...rest);
    };
  });
  await page.getByLabel('Note text', { exact: true }).fill('<script>literal only</script>\nA useful idea, retained after a failed save');
  await page.getByRole('status').filter({ hasText: 'Test storage is full' }).waitFor();
  await page.evaluate(() => { IDBDatabase.prototype.transaction = window.notesTestTransaction; delete window.notesTestTransaction; });
  await page.getByRole('button', { name: 'Retry save', exact: true }).click(); await saved();
  await page.getByText('Labels, link & reminder', { exact: true }).click();
  await page.getByLabel('Labels separated by commas').fill('ideas, work'); await page.getByLabel('Labels separated by commas').press('Tab'); await saved();
  await page.getByLabel('Source link').fill('https://example.com/'); await page.getByLabel('Source link').press('Tab'); await saved();
  await page.getByRole('button', { name: 'Pin', exact: true }).click(); await saved();
  await page.getByRole('button', { name: 'Add to Tasks', exact: true }).click();
  await page.getByRole('button', { name: 'Add to Tasks', exact: true }).click();
  assert.equal(await page.evaluate(async () => (await (await import('../../core/storage.js')).readLatest()).tasks.length), 1);
  pass('Autosave survives reload, markup stays literal, labels/links/pin and idempotent task conversion work');

  await page.getByText('Images, drawing & voice', { exact: true }).click();
  await page.getByLabel('Attach an image', { exact: true }).setInputFiles('assets/icons/icon-128.png');
  await page.locator('.media-item img').waitFor();
  await page.getByText('Draw a quick sketch', { exact: true }).click();
  await page.getByRole('button', { name: 'Save drawing', exact: true }).click();
  await page.waitForFunction(() => document.querySelectorAll('.media-item img').length === 2);
  await page.getByRole('button', { name: 'Record voice note', exact: true }).click();
  await page.getByRole('button', { name: 'Stop & save recording', exact: true }).waitFor();
  await page.waitForTimeout(1200);
  await page.getByRole('button', { name: 'Stop & save recording', exact: true }).click();
  await page.locator('.media-item audio').waitFor();
  pass('Raster attachment, saved drawing and local voice recording commit with media');

  const result = await page.evaluate(async () => {
    const api = await import('../../core/notes.js'); const backup = await import('../../core/backup.js');
    const all = await api.listNotes(); const old = all[0];
    await api.saveNote({ ...old, title: old.title });
    let conflict = false; try { await api.saveNote({ ...old, title: 'stale overwrite' }); } catch { conflict = true; }
    const exported = await backup.exportData(), parsed = await backup.parseBackup(JSON.stringify(exported));
    await backup.importData(parsed);
    return { conflict, notes: parsed.records.notes.length, media: parsed.records.noteMedia.length };
  });
  assert.deepEqual(result, { conflict: true, notes: 1, media: 3 });
  await page.reload(); await page.getByRole('button', { name: 'Open A captured thought' }).click();
  await page.getByRole('button', { name: 'Archive', exact: true }).click();
  await page.locator('.sidebar-nav [data-section="archive"]').click();
  await page.getByRole('button', { name: 'Open A captured thought' }).click();
  await page.getByRole('button', { name: 'Move to trash', exact: true }).click();
  await page.locator('.sidebar-nav [data-section="trash"]').click();
  await page.getByRole('button', { name: 'Open A captured thought' }).click();
  await page.getByRole('button', { name: 'Restore note', exact: true }).click();
  await page.locator('.sidebar-nav [data-section="notes"]').click();
  await page.getByRole('button', { name: 'Open A captured thought' }).waitFor();
  pass('Conflict detection, media backup round-trip, archive, trash and recovery work');

  await page.getByLabel('Create new', { exact: true }).click();
  await page.locator('.create-options').getByRole('button', { name: 'Checklist', exact: true }).click();
  await page.getByLabel('Note title', { exact: true }).fill('Reading list');
  await page.getByLabel('Item 1', { exact: true }).fill('Read a chapter');
  await page.getByRole('button', { name: 'Add item', exact: true }).click();
  await page.getByLabel('Item 2', { exact: true }).fill('Take notes');
  await page.getByLabel('Complete item 1', { exact: true }).check(); await saved();
  await page.getByRole('button', { name: 'Move item 2 up' }).click(); await saved();
  assert.equal(await page.getByLabel('Item 1', { exact: true }).inputValue(), 'Take notes');
  await page.keyboard.press('Escape');
  await page.getByLabel('Search notes').fill('Reading');
  await page.waitForFunction(() => document.querySelectorAll('.note-card').length === 1);
  assert.equal(await page.locator('.note-card').count(), 1);
  await page.getByLabel('Search notes').fill('');
  await page.getByLabel('Filter by label').selectOption('work');
  await page.waitForFunction(() => document.querySelectorAll('.note-card').length === 1);
  assert.equal(await page.locator('.note-card').count(), 1);
  await page.getByLabel('Filter by label').selectOption('');
  await page.getByLabel('Create label').click();
  await page.getByLabel('New label name').fill('Projects');
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.getByLabel('Filter by label').locator('option[value="Projects"]').waitFor({ state: 'attached' });
  await page.getByLabel('Filter by label').selectOption('');
  assert.equal(await page.getByLabel('Filter by label').locator('option[value="Projects"]').count(), 1);
  await page.getByLabel('Sort notes').selectOption('title');
  assert.equal(await page.locator('.all-section .note-card').first().getAttribute('aria-label'), 'Open Reading list');
  await page.getByRole('button', { name: 'List view', exact: true }).click();
  await page.waitForFunction(() => document.querySelector('.note-grid').dataset.view === 'list');
  assert.equal(await page.locator('.all-section .note-grid').getAttribute('data-view'), 'list');
  pass('Checklist completion/reorder, search, label filter, list view and Escape work');
  await page.getByRole('button', { name: 'Grid view', exact: true }).click();

  await fs.mkdir('docs/screenshots', { recursive: true });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [1100, 390, 320]) {
    await page.setViewportSize({ width, height: 800 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({ path: `docs/screenshots/notes-${browser}-${width}-light.png` });
  }
  await page.getByLabel('Options & privacy', { exact: true }).click();
  await page.getByRole('button', { name: 'Enable capture context menu', exact: true }).click();
  await page.getByRole('status').filter({ hasText: 'Right-click a webpage' }).waitFor();
  assert(await page.evaluate(() => chrome.permissions.contains({ permissions: ['contextMenus'] })));
  const worker = context.serviceWorkers()[0];
  assert(await worker.evaluate(() => chrome.contextMenus.onClicked.hasListeners()));
  await page.getByRole('button', { name: 'Disable capture context menu', exact: true }).click();
  await page.getByRole('status').filter({ hasText: 'Capture context menu disabled' }).waitFor();
  assert(!await page.evaluate(() => chrome.permissions.contains({ permissions: ['contextMenus'] })));
  const commands = await page.evaluate(() => chrome.commands.getAll());
  assert(commands.some(c => c.name === 'open-notes'));
  if (!commands.find(c => c.name === 'open-notes').shortcut) console.log('NOTE: Browser left the suggested shortcut unassigned; configure it in extension shortcuts.');
  pass('Optional context menu grant/handler/revocation and keyboard command registration work');
  await page.getByRole('button', { name: 'Switch light / dark', exact: true }).click();
  await page.getByLabel('Options & privacy', { exact: true }).click();
  await page.screenshot({ path: `docs/screenshots/notes-${browser}-320-dark.png` });
  pass('Desktop/390/320 widths, dark/light and reduced motion render without overflow');

  // Exercise an extension-owned frame in the existing dashboard shell.
  await page.setViewportSize({ width: 1100, height: 900 });
  await page.goto(base + '/newtab/index.html');
  await page.waitForSelector('html[data-ready=true]');
  const skip = page.getByRole('button', { name: 'Skip for now', exact: true }); if (await skip.isVisible()) await skip.click();
  await page.locator('#panel').waitFor({ state: 'hidden' });
  await page.evaluate(async () => (await import('../components/notes/index.js')).open());
  await page.frameLocator('.notes-workspace-frame').getByLabel('Search notes').waitFor();
  assert.deepEqual(await page.locator('#panel').evaluate(node => {
    const rect = node.getBoundingClientRect();
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
  }), { x: 0, y: 0, width: 1100, height: 900 });
  await page.frameLocator('.notes-workspace-frame').getByRole('button', { name: 'Close notes', exact: true }).click();
  await page.locator('#panel').waitFor({ state: 'hidden' });
  pass('Existing Notes entry opens shared workspace and closes its panel');
  assert.deepEqual(errors, []);
} catch (error) {
  await page.screenshot({ path: `test-results/notes-${browser}-failure.png` }).catch(() => {}); throw error;
} finally {
  await fs.mkdir('docs/qa-results', { recursive: true });
  await fs.writeFile(`docs/qa-results/notes-${browser}-report.json`, JSON.stringify({ checks, errors }, null, 2));
  await context.close();
}

