import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.ONEFLOW_NODE_MODULES + '/playwright');
const browser = process.argv[2] || 'chrome', checks = [], errors = [], network = [], timings = [], startupStages = [];
const executablePath = browser === 'edge' ? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' : 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const context = await chromium.launchPersistentContext(path.resolve('.test-profile', `market-${browser}-${Date.now()}`), {
  executablePath, headless: true, viewport: { width: 1280, height: 800 },
  args: ['--enable-unsafe-extension-debugging'], ignoreDefaultArgs: ['--disable-extensions']
});
const page = await context.newPage();
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
page.on('request', request => { if (/^https?:/.test(request.url())) network.push(request.url()); });
const pass = value => { checks.push(value); console.log('PASS: ' + value); };
const read = () => page.evaluate(async () => (await import('../core/storage.js')).get());
const shot = async label => { await page.evaluate(() => { document.activeElement?.blur(); scrollTo(0, 0); }); await page.screenshot({ path: `docs/launch/${browser}-${label}.png`, animations: 'disabled' }); };
let url;
try {
  await fs.mkdir('docs/launch', { recursive: true });
  const cdp = await context.browser().newBrowserCDPSession();
  const { id } = await cdp.send('Extensions.loadUnpacked', { path: process.cwd() });
  url = `chrome-extension://${id}/newtab/index.html`;
  await page.goto(url); await page.waitForSelector('html[data-ready=true]');
  await page.getByLabel('Your first task').waitFor();
  await shot('onboarding');
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 800 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.getByRole('button', { name: 'Start my first session', exact: true }).scrollIntoViewIfNeeded();
    assert(await page.getByRole('button', { name: 'Start my first session', exact: true }).isVisible());
  }
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.getByLabel('Your first task').fill('Revise one biology chapter');
  await page.getByRole('button', { name: 'Start my first session', exact: true }).click();
  await page.getByRole('button', { name: 'Pause', exact: true }).waitFor();
  await page.locator('#panel').waitFor({ state: 'hidden' });
  const first = await read();
  assert.equal(first.timer.taskId, first.tasks[0].id); assert.equal(first.timer.taskTitle, first.tasks[0].text);
  assert.equal(first.settings.onboarding, true); assert.equal(first.audio.playing, false);
  assert.deepEqual((await page.evaluate(() => chrome.permissions.getAll())).origins, []); assert.deepEqual(network, []);
  assert.deepEqual(await page.locator('#dock button span').allTextContents(), ['Journal', 'Tasks', 'Sounds', 'Notes', 'Music', 'Habits', 'Stats']);
  await shot('stay-focused'); pass('First-run scene → task → running session; silent, offline and no website grants');

  const other = await context.newPage(); await other.goto(url); await other.waitForSelector('html[data-ready=true]');
  await other.getByRole('button', { name: 'Pause', exact: true }).click();
  await page.getByRole('button', { name: 'Resume', exact: true }).waitFor();
  assert.equal((await read()).timer.sessionId, first.timer.sessionId);
  await context.setOffline(true); await page.reload(); await page.waitForSelector('html[data-ready=true]');
  await page.getByRole('button', { name: 'Resume', exact: true }).click();
  await other.getByRole('button', { name: 'Pause', exact: true }).waitFor();
  await other.close(); pass('Pause/resume synchronizes across tabs and offline reload preserves session identity');

  // Fast-forward the deadline in this disposable fixture; exercise the real worker completion.
  await page.evaluate(async () => {
    const s = await import('../core/storage.js');
    await s.update(d => { d.timer.startedAt = Date.now() - d.timer.duration; d.timer.endsAt = Date.now() - 1; d.timer.observedAt = Date.now() - 2; });
    await (await import('../core/timer-client.js')).timerCommand('tick');
  });
  await page.getByRole('button', { name: 'Start break', exact: true }).waitFor();
  await page.getByText('25 minutes on Revise one biology chapter. Session complete.', { exact: true }).waitFor();
  await shot('see-progress');
  await page.reload(); await page.waitForSelector('html[data-ready=true]');
  assert.equal((await read()).lastFocusSession.taskTitle, 'Revise one biology chapter');
  await page.getByRole('button', { name: 'Continue focusing', exact: true }).click();
  await page.getByRole('button', { name: 'Pause', exact: true }).waitFor();
  assert.equal((await read()).timer.taskId, first.timer.taskId);
  assert.notEqual((await read()).timer.sessionId, first.timer.sessionId);
  pass('Completion summary survives reload; continue starts a new session on the same task');

  await page.evaluate(async () => {
    const s = await import('../core/storage.js'); await s.update(d => { d.timer.endsAt = Date.now() - 1; d.timer.observedAt = Date.now() - 2; });
    await (await import('../core/timer-client.js')).timerCommand('tick');
  });
  await page.getByRole('button', { name: 'Mark task complete', exact: true }).click();
  await page.getByRole('button', { name: 'Skip break', exact: true }).click();
  await page.getByRole('button', { name: 'Start focus', exact: true }).waitFor();
  assert.equal(await page.getByLabel('Choose a task', { exact: true }).locator('option').count(), 1);
  assert.equal((await read()).tasks[0].completed, true);
  await page.getByLabel('Your main focus today', { exact: true }).fill('One small step is enough');
  await shot('start-easily'); pass('Complete a task and return to a clean next-session choice');

  await page.locator('#workspace-tools').click();
  assert.equal(await page.locator('.tool-directory details[open]').count(), 0);
  await page.getByRole('button', { name: 'Help & feedback', exact: true }).click();
  const policyTab = await context.newPage(); await policyTab.goto(`chrome-extension://${id}/docs/launch/privacy.html`);
  await policyTab.getByRole('heading', { name: 'ONEFLOW privacy policy', exact: true }).waitFor(); await policyTab.close();
  await page.getByLabel('Your feedback', { exact: true }).fill('The first study session was easy to start.');
  const downloaded = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download feedback', exact: true }).click();
  const download = await downloaded, feedback = await fs.readFile(await download.path(), 'utf8');
  assert(feedback.includes('The first study session was easy to start.')); assert(!feedback.includes('biology'));
  assert.deepEqual(network, []); await page.keyboard.press('Escape');
  pass('Advanced tools are disclosed on demand; feedback downloads only user-authored text without requests');

  // Roundtrip encrypted data, including the new session summary, in the isolated profile.
  await page.evaluate(async () => {
    const backup = await import('../core/backup.js'), crypto = await import('../core/crypto-backup.js');
    const exported = await backup.exportData();
    const encrypted = await crypto.encryptBackup(JSON.stringify(exported), 'a sufficiently long test passphrase');
    const prepared = await backup.parseBackup(await crypto.decryptBackup(encrypted, 'a sufficiently long test passphrase'));
    await backup.importData(prepared);
  });
  await page.reload(); await page.waitForSelector('html[data-ready=true]');
  assert.equal((await read()).lastFocusSession.taskTitle, 'Revise one biology chapter');
  pass('Encrypted backup and restore retain tasks and the last-session summary');

  for (const [width, height] of [[1280, 720], [390, 844], [320, 640]]) {
    await page.setViewportSize({ width, height });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Page overflow at ' + width);
    const controls = await page.locator('#dock button, #workspace-tools, #settings-button').evaluateAll(nodes => nodes.map(n => { const b = n.getBoundingClientRect(); return { left: b.left, right: b.right, bottom: b.bottom }; }));
    assert(controls.every(box => box.left >= 0 && box.right <= width && box.bottom <= height));
    if (width === 390) await shot('mobile');
  }
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload(); await page.waitForSelector('html[data-ready=true]');
  assert.equal(await page.locator('html').getAttribute('data-motion'), 'reduce');
  await page.keyboard.press('/'); assert.equal(await page.evaluate(() => document.activeElement.id), 'web-search');
  await page.keyboard.press('Tab'); await page.keyboard.press('n'); await page.getByLabel('New task', { exact: true }).waitFor();
  await page.keyboard.press('Escape');
  pass('Desktop and narrow screens, accessible dock labels, reduced motion and keyboard shortcuts');

  for (let i = 0; i < 8; i++) {
    await page.reload(); await page.waitForSelector('html[data-ready=true]');
    timings.push(await page.evaluate(() => performance.getEntriesByName('oneflow-ready')[0].startTime));
    startupStages.push(await page.evaluate(() => Object.fromEntries(performance.getEntriesByType('mark').filter(mark => mark.name.startsWith('oneflow-')).map(mark => [mark.name, mark.startTime]))));
  }
  const sorted = [...timings].sort((a, b) => a - b);
  console.log('Cached startup ms: ' + JSON.stringify({ samples: timings, median: (sorted[3] + sorted[4]) / 2, p95: sorted[7] }));
  if (sorted[7] < 300) pass('Eight cached opens meet the 300 ms startup target on this machine');
  else { checks.push('FAIL: Cached startup target exceeded'); process.exitCode = 1; }
  assert.deepEqual(errors, []); assert.deepEqual(network, []);

  await context.setOffline(false);
  await context.route(/^https?:/, route => route.fulfill({ status: 200, contentType: 'text/html', body: '<title>Search request received</title>' }));
  await page.getByLabel('Search with your default search engine').fill('oneflow default provider check');
  await page.getByLabel('Search with your default search engine').press('Enter');
  await page.waitForURL(/^https?:/);
  assert(new URL(page.url()).searchParams.get('q')?.includes('oneflow default provider check'));
  const searchURL = page.url(); await page.goto(url); await page.waitForSelector('html[data-ready=true]');
  pass('Real browser search API uses the isolated browser’s default provider: ' + new URL(searchURL).hostname);
} catch (error) {
  checks.push('FAIL: ' + error.message); console.error(error); process.exitCode = 1;
  await shot('failure').catch(() => {});
} finally {
  await fs.mkdir('test-results', { recursive: true });
  await fs.writeFile(`test-results/market-${browser}-report.json`, JSON.stringify({ browser, checks, errors, network, timings, startupStages, date: new Date().toISOString() }, null, 2));
  await context.close();
}
