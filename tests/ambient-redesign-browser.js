import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(`${process.env.ONEFLOW_NODE_MODULES}/playwright`);
const browser = process.argv[2] || 'chrome', checks = [], errors = [], requests = [];
const context = await chromium.launchPersistentContext(path.resolve('.test-profile', `ambient-redesign-${browser}-${Date.now()}`), {
  executablePath: browser === 'edge' ? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' : 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true, viewport: { width: 1440, height: 900 }, timezoneId: 'Asia/Kolkata', args: ['--enable-unsafe-extension-debugging'], ignoreDefaultArgs: ['--disable-extensions']
});
const page = await context.newPage();
page.on('pageerror', error => errors.push(error.message));
page.on('request', request => { if (/^https?:/.test(request.url())) requests.push(request.url()); });
const pass = label => { checks.push(label); console.log('PASS: ' + label); };
const data = () => page.evaluate(async () => (await import('../core/storage.js')).get());
const ambient = async () => {
  await page.locator('#home-menu > summary').click();
  await page.getByRole('button', { name: 'Ambient view', exact: true }).click();
  await page.locator('.ambient-interface:not([hidden])').waitFor();
};
try {
  await fs.mkdir('docs/screenshots', { recursive: true });
  const cdp = await context.browser().newBrowserCDPSession();
  const { id } = await cdp.send('Extensions.loadUnpacked', { path: process.cwd() });
  await page.goto(`chrome-extension://${id}/newtab/index.html`);
  await page.getByRole('button', { name: 'Skip for now', exact: true }).click();
  assert.equal(await page.locator('.ambient-interface').count(), 0);
  await ambient();
  await page.locator('#ambient-clock').waitFor();
  await page.locator('#landscape[data-load=ready]').waitFor();
  assert(!await page.locator('#dock').isVisible());
  assert(!await page.locator('#settings-button').isVisible());
  assert.equal((await data()).audio.playing, false);
  for (const theme of ['dark', 'light']) {
    await page.evaluate(async theme => (await import('../core/storage.js')).update(d => { d.settings.theme = theme; }), theme);
    for (const width of [1440, 1280, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      const boxes = await page.locator('.ambient-interface button,.ambient-audio input,#ambient-clock,#home-menu > summary').evaluateAll(nodes => nodes.filter(n => n.checkVisibility()).map(n => {
        const r = n.getBoundingClientRect(); return { x: r.x, y: r.y, right: r.right, bottom: r.bottom };
      }));
      assert(boxes.every(r => r.x >= 0 && r.y >= 0 && r.right <= width && r.bottom <= 900));
      await page.screenshot({ path: `docs/screenshots/ambient-redesign-${browser}-${theme}-${width}.png`, animations: 'disabled' });
    }
  }
  pass('Ambient loads lazily; clock and controls fit desktop/mobile and both themes without autoplay');
  await page.getByRole('button', { name: 'Choose Ambient scene', exact: true }).click();
  await page.locator('.ambient-scene-choice').first().waitFor();
  await page.locator('.ambient-scene-choice').first().click();
  await page.locator('#panel').waitFor({ state: 'hidden' });
  assert.equal((await data()).audio.playing, false);
  await page.getByRole('button', { name: 'Expand ambient clock', exact: true }).click();
  assert.equal(await page.locator('#ambient-clock').getAttribute('data-expanded'), 'true');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#ambient-clock').getAttribute('data-expanded'), 'false');
  pass('Scene picker selects offline wallpaper without starting audio; clock expansion and Escape work');
  await page.getByRole('button', { name: 'Play ambient sounds', exact: true }).click();
  await page.getByRole('button', { name: 'Pause ambient sounds', exact: true }).waitFor();
  assert.equal((await data()).audio.playing, true);
  await page.getByLabel('Ambient volume', { exact: true }).fill('35');
  await page.getByLabel('Ambient volume', { exact: true }).dispatchEvent('change');
  await page.waitForFunction(async () => (await import('../core/storage.js')).get().audio.master === .35);
  await page.getByRole('button', { name: 'Mute ambient sounds', exact: true }).click();
  await page.getByRole('button', { name: 'Unmute ambient sounds', exact: true }).click();
  await page.waitForFunction(async () => (await import('../core/storage.js')).get().audio.master === .35);
  await page.getByRole('button', { name: 'Pause ambient sounds', exact: true }).click();
  await page.getByRole('button', { name: 'Play ambient sounds', exact: true }).waitFor();
  pass('Shared audio playback, volume, mute restoration and pause work');
  await page.getByRole('button', { name: 'Immersive', exact: true }).click();
  await page.waitForSelector('html[data-ambient-quiet=true]');
  await page.mouse.move(180, 180);
  await page.waitForFunction(() => !document.documentElement.dataset.ambientQuiet);
  await page.getByRole('button', { name: 'Back to Home', exact: true }).focus();
  await page.waitForTimeout(4200);
  assert.equal(await page.locator('html').getAttribute('data-ambient-quiet'), null);
  await page.keyboard.press('Escape');
  assert.equal(await page.getByRole('button', { name: 'Immersive', exact: true }).getAttribute('aria-pressed'), 'false');
  pass('Immersive fades when idle, wakes on movement, protects keyboard focus and exits with Escape');
  await page.evaluate(async () => (await import('../core/timer-client.js')).timerCommand('start', { taskTitle: 'Read quietly', focusMinutes: 25 }));
  const before = (await data()).timer;
  await page.locator('#ambient-session').waitFor();
  await page.locator('#ambient-session').click();
  const after = (await data()).timer;
  assert.equal(after.sessionId, before.sessionId); assert.equal(after.endsAt, before.endsAt);
  await page.locator('#focus-exit').click(); await ambient();
  await page.getByRole('button', { name: 'Back to Home', exact: true }).click();
  await ambient();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await context.setOffline(true); await page.reload();
  await page.locator('html[data-ready=true]').waitFor();
  if (await page.locator('#focus-exit').isVisible()) await page.locator('#focus-exit').click();
  await ambient();
  assert.equal((await data()).timer.sessionId, before.sessionId);
  assert.deepEqual(errors, []); assert.deepEqual(requests, []);
  pass('Session return preserves deadline; Home return, offline reload and reduced motion have no errors/remote calls');
} catch (error) { checks.push('FAIL: ' + error.message); console.error(error); process.exitCode = 1; }
finally {
  await fs.mkdir('docs/qa-results', { recursive: true });
  await fs.writeFile(`docs/qa-results/ambient-redesign-${browser}.json`, JSON.stringify({ checks, errors, requests }, null, 2));
  await context.close();
}
