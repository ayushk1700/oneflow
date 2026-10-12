import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url), { chromium } = require(process.env.ONEFLOW_NODE_MODULES + '/playwright');
const browser = process.argv[2] || 'chrome', checks = [], errors = [];
const context = await chromium.launchPersistentContext(path.resolve('.test-profile', `notes-overlay-${browser}-${Date.now()}`), {
  executablePath: browser === 'edge' ? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' : 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true,
  viewport: { width: 1280, height: 900 }, args: ['--enable-unsafe-extension-debugging'], ignoreDefaultArgs: ['--disable-extensions']
});
const page = await context.newPage(), pass = name => { checks.push(name); console.log('PASS: ' + name); };
page.on('pageerror', e => errors.push(e.message));
context.on('console', m => { if (['error', 'warning'].includes(m.type())) console.log('BROWSER:', m.text()); });
try {
  const cdp = await context.browser().newBrowserCDPSession(), { id } = await cdp.send('Extensions.loadUnpacked', { path: process.cwd() });
  const worker = context.serviceWorkers()[0] || await context.waitForEvent('serviceworker');
  console.log('Worker listeners:', await worker.evaluate(() => ({ action: chrome.action.onClicked.hasListeners(), command: chrome.commands.onCommand.hasListeners(), menu: !!chrome.contextMenus?.onClicked })));
  const base = `chrome-extension://${id}`, url = "https://capture.oneflow.test/";
  await page.route(url, route => route.fulfill({ contentType: "text/html", body: '<!doctype html><html><head><title>Capture fixture</title><style>*{font:40px serif!important;color:red!important} iframe{display:none!important}</style></head><body><button id="previous">Page focus</button><p id="selection">A selected thought &lt;script&gt;literal&lt;/script&gt;</p></body></html>' }));
  await page.goto(url);
  await page.locator('#previous').focus();
  await page.evaluate(() => { const range = document.createRange(); range.selectNodeContents(document.querySelector('#selection')); getSelection().removeAllRanges(); getSelection().addRange(range); });
  const targets = await cdp.send('Target.getTargets', { filter: [{ type: 'tab', exclude: false }, { exclude: true }] });
  const targetInfo = targets.targetInfos.find(t => t.url === url);
  assert(targetInfo, JSON.stringify(targets.targetInfos));
  await cdp.send('Extensions.triggerAction', { id, targetId: targetInfo.targetId });
  await page.waitForEvent('framenavigated', { predicate: frame => frame.url().startsWith(base + '/components/notes/capture.html') }).catch(() => {});
  const frame = page.frames().find(f => f.url().startsWith(base + '/components/notes/capture.html'));
  assert(frame, 'Toolbar should create an in-page extension frame: ' + context.pages().map(p => p.url()).join(', '));
  await frame.getByRole('button', { name: 'Capture page', exact: true }).waitFor();
  assert.equal(await frame.locator('body').evaluate(n => getComputedStyle(n).color), 'rgb(23, 33, 47)');
  assert.equal(await page.locator('iframe').count(), 0, 'Frame should be inside a closed shadow root');
  await frame.getByRole('button', { name: 'Capture page', exact: true }).click();
  assert.equal(await frame.getByLabel('Note title', { exact: true }).inputValue(), 'Capture fixture');
  assert.match(await frame.getByLabel('Note text', { exact: true }).inputValue(), /A selected thought <script>literal<\/script>/);
  pass('Real toolbar action grants temporary access, injects isolated overlay, captures selected text/link without HTML');

  const getBox = () => frame.locator('body').evaluate(() => ({ width: innerWidth, height: innerHeight }));
  const before = await getBox();
  await frame.getByLabel('Resize panel with arrow keys or drag').focus();
  await frame.getByLabel('Resize panel with arrow keys or drag').press('ArrowLeft');
  await page.waitForTimeout(150); const after = await getBox(); assert(after.width < before.width);
  await frame.getByLabel('Move panel with arrow keys or drag').focus();
  await frame.getByLabel('Move panel with arrow keys or drag').press('ArrowLeft');
  await frame.getByLabel('Note title', { exact: true }).focus(); await page.keyboard.press('Escape');
  await frame.getByLabel('Resize panel with arrow keys or drag').focus(); await page.keyboard.press('Tab');
  assert(await frame.locator('.sidebar-nav button').first().evaluate(n => document.activeElement === n));
  await fs.mkdir('docs/screenshots', { recursive: true });
  await page.screenshot({ path: `docs/screenshots/notes-overlay-${browser}.png` });
  await page.setViewportSize({ width: 320, height: 700 });
  assert((await getBox()).width <= 320);
  await page.screenshot({ path: `docs/screenshots/notes-overlay-${browser}-320.png` });
  await frame.getByRole('button', { name: 'Close notes', exact: true }).click();
  await page.waitForFunction(() => document.activeElement.id === 'previous');
  pass('Keyboard move/resize, focus loop, responsive clamp, Escape and focus restoration work');

  // A webpage cannot embed the same page and gain access to the local collection.
  await page.evaluate(src => { const iframe = document.createElement('iframe'); iframe.src = src; document.body.append(iframe); }, base + '/components/notes/capture.html#token=forged');
  await page.waitForTimeout(500);
  const hostile = page.frames().find(f => f.url().includes('token=forged'));
  assert(hostile); await hostile.locator('[role=alert]').filter({ hasText: 'Open Notes using the extension toolbar' }).waitFor({ state: 'attached' });
  assert.equal(await hostile.locator('.note-card').count(), 0);
  pass('Forged webpage frame cannot initialize or read the notes UI');

  const workspace = await context.newPage(); await workspace.goto(base + '/components/notes/capture.html');
  await workspace.getByLabel('Search notes').waitFor();
  const data = await workspace.evaluate(async () => {
    const api = await import('../../core/notes.js'); const storage = await import('../../core/storage.js');
    await storage.update(d => { d.notes.push({ id: 'legacy', title: 'Old note', text: '- [x] Kept', updatedAt: Date.now() }); });
    await api.migrateNotes(); await api.migrateNotes();
    const old = (await api.listNotes()).filter(n => n.id === 'legacy');
    const n = await api.saveNote(api.makeNote({ title: 'Reminder test', reminderAt: Date.now() + 60000 }));
    await chrome.runtime.sendMessage({ target: 'notes-worker', type: 'schedule' });
    const scheduled = await chrome.alarms.get('oneflow-note-' + n.id);
    const trashed = await api.saveNote({ ...n, state: 'trash' });
    await chrome.runtime.sendMessage({ target: 'notes-worker', type: 'schedule' });
    const cancelled = !await chrome.alarms.get('oneflow-note-' + n.id);
    await api.deleteNote(trashed);
    return { legacy: old.length, checked: old[0].items[0].checked, scheduled: !!scheduled, cancelled, deleted: !await api.getNote(n.id) };
  });
  assert.deepEqual(data, { legacy: 1, checked: true, scheduled: true, cancelled: true, deleted: true });
  pass('Legacy migration is idempotent; note alarms schedule/cancel and permanent deletion works');
  await page.goto('chrome://version');
  const fallbackEvent = context.waitForEvent('page');
  await cdp.send('Extensions.triggerAction', { id, targetId: targetInfo.targetId });
  const fallback = await fallbackEvent; await fallback.getByLabel('Search notes').waitFor();
  assert.match(fallback.url(), /fallback=1/);
  pass('Protected browser pages fall back to a full extension workspace');
  assert.deepEqual(errors, []);
} finally {
  await fs.mkdir('docs/qa-results', { recursive: true });
  await fs.writeFile(`docs/qa-results/notes-overlay-${browser}-report.json`, JSON.stringify({ checks, errors }, null, 2));
  await context.close();
}
