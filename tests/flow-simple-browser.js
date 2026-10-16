import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.ONEFLOW_NODE_MODULES + '/playwright');
const browser = process.argv[2] || 'chrome';
const context = await chromium.launchPersistentContext(path.resolve('.test-profile', 'flow-simple-' + browser + '-' + Date.now()), {
  executablePath: browser === 'edge' ? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' : 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true, viewport: { width: 1440, height: 960 },
  args: ['--enable-unsafe-extension-debugging'], ignoreDefaultArgs: ['--disable-extensions']
});
const page = await context.newPage(), errors = [], checks = [];
page.on('pageerror', error => errors.push(error.message));
const pass = text => { checks.push(text); console.log('PASS: ' + text); };
const state = () => page.evaluate(async () => (await import('../core/storage.js')).get());
const rows = () => page.evaluate(async () => (await import('../core/db.js')).getAll('sessions'));
const flow = page.locator('#flow-view');
const start = async title => {
  await page.getByLabel('Your main focus today').fill(title);
  await page.getByRole('button', { name: 'Start focus', exact: true }).click();
  await page.locator('#flow-view[open]').waitFor();
};
try {
  const cdp = await context.browser().newBrowserCDPSession();
  const { id } = await cdp.send('Extensions.loadUnpacked', { path: process.cwd() });
  await page.goto('chrome-extension://' + id + '/newtab/index.html');
  await page.waitForSelector('html[data-ready=true]');
  await page.getByRole('button', { name: 'Skip for now', exact: true }).click();
  await context.setOffline(true);
  const before = await state();
  await start('A little room to focus');
  assert.equal(await page.evaluate(() => Boolean(document.fullscreenElement)), false);
  assert.deepEqual((await state()).settings.background, before.settings.background);
  assert.deepEqual((await state()).audio, before.audio);
  assert.equal(await page.locator('.session-countdown:visible').count(), 1);
  assert.equal(await flow.locator('.session-next').count(), 0);
  assert.equal(await flow.locator('.flow-block-status').isVisible(), false);
  pass('Start focus opens one calm Flow timer offline, without fullscreen or changing scenery/audio');
  const started = (await state()).timer;
  await page.keyboard.press('Space');
  await flow.getByRole('button', { name: 'Resume', exact: true }).waitFor();
  const paused = (await state()).timer;
  assert.equal(paused.sessionId, started.sessionId);
  await flow.getByRole('button', { name: 'Resume', exact: true }).click();
  await flow.getByRole('button', { name: 'Pause', exact: true }).waitFor();
  assert.equal((await state()).timer.sessionId, started.sessionId);
  pass('Space pauses; Resume retains the session identity');
  for (const theme of ['dark', 'light']) {
    await page.evaluate(async theme => { await (await import('../core/storage.js')).update(d => { d.settings.theme = theme; d.settings.customization.theme.mode = theme; }); }, theme);
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: width === 1440 ? 960 : 844 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      assert(await flow.evaluate(node => node.scrollWidth <= node.clientWidth));
      const stop = await flow.getByRole('button', { name: 'Stop & save', exact: true }).boundingBox();
      assert(stop && stop.height >= 44 && stop.x >= 0 && stop.x + stop.width <= width);
      await fs.mkdir('docs/screenshots', { recursive: true });
      await page.screenshot({ path: `docs/screenshots/flow-simple-${browser}-${theme}-${width}.png` });
    }
  }
  pass('Light/dark, reduced motion and 1440/390/320px layouts retain reachable controls without overflow');
  await page.setViewportSize({ width: 1440, height: 960 });
  await flow.getByRole('button', { name: 'Back to home', exact: true }).click();
  await page.waitForSelector('#flow-view', { state: 'hidden' });
  assert.equal((await state()).timer.sessionId, started.sessionId);
  assert.equal((await state()).timer.status, 'running');
  assert.equal(await page.locator('#panel[open]').count(), 0);
  await page.keyboard.press('f');
  await page.locator('#flow-view[open]').waitFor();
  assert.equal((await state()).timer.sessionId, started.sessionId);
  pass('Back to home minimizes without stopping or showing a misleading saved summary; F reopens');
  const second = await context.newPage();
  await second.goto(page.url());
  await second.waitForSelector('html[data-ready=true]');
  assert.equal(await second.evaluate(async () => (await import('../core/storage.js')).get().timer.sessionId), started.sessionId);
  await second.close();
  pass('A second tab shares the same session');
  // Advance actual recorded active time, leaving a paused interval so wall time cannot inflate it.
  await page.evaluate(async () => { await (await import('../core/storage.js')).update(d => {
    d.timer.status = 'paused'; d.timer.remaining = d.timer.duration - 125000; d.timer.elapsed = 125000; d.timer.endsAt = null; d.timer.startedAt = Date.now() - 185000;
  }); });
  await flow.getByRole('button', { name: 'Resume', exact: true }).waitFor();
  await flow.getByRole('button', { name: 'Stop & save', exact: true }).click();
  await page.getByRole('heading', { name: 'Focus saved', exact: true }).waitFor();
  const saved = (await rows()).filter(row => row.id === started.sessionId);
  assert.equal(saved.length, 1); assert.equal(saved[0].duration, 125000); assert.equal(saved[0].completed, false);
  assert.equal((await state()).timer.status, 'idle'); assert.equal((await state()).flow.active, false);
  await page.getByText('2 min 5 sec', { exact: true }).waitFor();
  await page.screenshot({ path: `docs/screenshots/flow-simple-${browser}-saved.png` });
  await page.getByRole('button', { name: 'View stats', exact: true }).click();
  await page.waitForSelector('#panel[data-panel=stats][open]');
  const totals = await page.evaluate(async () => {
    const sessions = await (await import('../core/db.js')).getAll('sessions');
    return (await import('../core/stats-logic.js')).aggregate(sessions, [], [], 'day');
  });
  assert.equal(totals.total, 125000); assert.equal(totals.sessions, 1);
  pass('Stop & save persists exactly 125 active seconds once, excludes paused time, closes Flow and opens Stats');
  await page.keyboard.press('Escape');
  await page.reload(); await page.waitForSelector('html[data-ready=true]');
  assert.equal((await rows()).filter(row => row.id === started.sessionId).length, 1);
  pass('Saved history survives offline reload without duplication');
  await start('<img src=x onerror=alert(1)>');
  assert.equal(await flow.locator('.session-title img').count(), 0);
  assert.equal(await flow.locator('.session-title').textContent(), '<img src=x onerror=alert(1)>');
  const completedId = (await state()).timer.sessionId;
  await page.evaluate(async () => {
    await (await import('../core/storage.js')).update(d => { d.timer.endsAt = Date.now() - 1; d.timer.observedAt = Date.now() - 1000; });
    await (await import('../core/timer-client.js')).timerCommand('tick');
  });
  await flow.getByRole('button', { name: 'Start break', exact: true }).waitFor();
  assert.equal((await rows()).filter(row => row.id === completedId && row.completed).length, 1);
  assert.match(await flow.locator('.session-result').textContent(), /Focus saved/);
  await flow.getByRole('button', { name: 'Start break', exact: true }).click();
  await flow.getByRole('button', { name: 'Pause', exact: true }).waitFor();
  await flow.getByRole('button', { name: 'Skip break', exact: true }).click();
  await page.waitForSelector('#flow-view', { state: 'hidden' });
  assert.equal((await state()).timer.phase, 'focus');
  pass('Natural completion saves once, offers a calm break, and Skip break returns home; titles remain plain text');
  assert.deepEqual(errors, []); pass('No page errors');
} catch (error) {
  console.error(error); checks.push('FAIL: ' + error.message); process.exitCode = 1;
  await fs.mkdir('test-results', { recursive: true });
  await page.screenshot({ path: `test-results/flow-simple-${browser}-failure.png` });
} finally {
  await fs.mkdir('docs/qa-results', { recursive: true });
  await fs.writeFile(`docs/qa-results/flow-simple-${browser}.json`, JSON.stringify({ browser, checks, errors }, null, 2));
  await context.close();
}
