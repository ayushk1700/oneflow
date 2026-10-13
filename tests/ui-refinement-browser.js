import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(`${process.env.ONEFLOW_NODE_MODULES}/playwright`);
const browser = process.argv[2] || 'edge', checks = [], errors = [], requests = [];
const context = await chromium.launchPersistentContext(path.resolve('.test-profile', `refined-${browser}-${Date.now()}`), {
  executablePath: browser === 'edge' ? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' : 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true, viewport: { width: 1440, height: 900 }, timezoneId: 'Asia/Kolkata',
  args: ['--enable-unsafe-extension-debugging'], ignoreDefaultArgs: ['--disable-extensions']
});
const page = await context.newPage();
page.on('pageerror', error => errors.push(error.message));
page.on('request', request => { if (/^https?:/.test(request.url())) requests.push(request.url()); });
const pass = name => { checks.push(name); console.log('PASS: ' + name); };
const state = () => page.evaluate(async () => (await import('../core/storage.js')).get().timer);
const home = async () => { if (await page.locator('#focus-exit').isVisible()) await page.locator('#focus-exit').click(); };
try {
  await fs.mkdir('docs/screenshots', { recursive: true });
  const cdp = await context.browser().newBrowserCDPSession();
  const { id } = await cdp.send('Extensions.loadUnpacked', { path: process.cwd() });
  await page.goto(`chrome-extension://${id}/newtab/index.html`);
  await page.getByRole('button', { name: 'Skip for now', exact: true }).click();
  await page.locator('#landscape[data-load=ready]').waitFor();
  for (const theme of ['dark', 'light']) {
    await page.evaluate(async theme => (await import('../core/storage.js')).update(d => { d.settings.theme = theme; }), theme);
    await page.waitForSelector(`html[data-theme=${theme}]`);
    for (const width of [1440, 1280, 390, 320]) {
      await page.setViewportSize({ width, height: width <= 390 ? 844 : 900 });
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      const start = await page.getByRole('button', { name: 'Start focus', exact: true }).boundingBox();
      const dock = await page.locator('#dock').boundingBox();
      assert(start.y + start.height < dock.y);
      const quote = await page.locator('#quotes').boundingBox();
      assert(quote.y + quote.height < dock.y);
      await page.screenshot({ path: `docs/screenshots/refined-${browser}-${theme}-${width}.png`, animations: 'disabled' });
    }
  }
  pass('Both themes fit 1440/1280/390/320px; focus and quote clear the corner controls');
  await page.locator('.quote-details summary').focus();
  await page.keyboard.press('Enter');
  assert(await page.locator('.quote-author').isVisible());
  assert(await page.locator('.quote-actions button').first().isVisible());
  await page.locator('.quote-details summary').click();
  assert(!await page.locator('.quote-author').isVisible());
  pass('Quote attribution and actions disclose by keyboard and tap');
  await page.getByLabel('Focus duration', { exact: true }).selectOption('custom');
  await page.getByLabel('Focus duration in minutes').fill('0');
  await page.getByRole('button', { name: 'Start focus', exact: true }).click();
  assert.equal((await state()).sessionId, null);
  await page.getByLabel('Focus duration', { exact: true }).selectOption('25');
  assert(!await page.getByLabel('Focus duration in minutes').isVisible());
  await page.getByLabel('Your main focus today').fill('Read quietly');
  await page.getByRole('button', { name: 'Start focus', exact: true }).click();
  await page.getByRole('button', { name: 'Pause', exact: true }).waitFor();
  assert.equal((await state()).duration, 25 * 60000);
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await page.getByRole('button', { name: 'Resume', exact: true }).waitFor();
  await page.screenshot({ path: `docs/screenshots/refined-${browser}-focus-paused-320.png` });
  await page.getByRole('button', { name: 'End session', exact: true }).click();
  await home();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('heading', { name: 'Read quietly', exact: true }).waitFor();
  await page.getByRole('button', { name: 'End session', exact: true }).click();
  await home();
  pass('Invalid custom duration is rejected; 25-minute preset, pause and current Continue follow-up work');
  await home();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.locator('#home-menu > summary').click();
  await page.locator('#settings-button').click();
  await page.getByRole('button', { name: 'Dashboard style', exact: true }).click();
  await page.getByLabel('Clock size', { exact: true }).fill('160');
  await page.getByLabel('Clock size', { exact: true }).dispatchEvent('change');
  await page.waitForFunction(() => document.querySelector('.appearance-preview').style.getPropertyValue('--preview-clock-size') === '80px');
  await page.screenshot({ path: `docs/screenshots/refined-${browser}-appearance-preview.png` });
  await page.keyboard.press('Escape');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await context.setOffline(true);
  await page.reload();
  await page.locator('html[data-ready=true][data-motion=reduce]').waitFor();
  assert.equal(await page.locator('.clock-time').evaluate(node => getComputedStyle(node).fontSize), '160px');
  assert.deepEqual(errors, []); assert.deepEqual(requests, []);
  pass('Appearance preview updates, saved typography survives, offline/reduced motion has no errors or remote calls');
} catch (error) { checks.push('FAIL: ' + error.message); console.error(error); process.exitCode = 1; }
finally {
  await fs.mkdir('docs/qa-results', { recursive: true });
  await fs.writeFile(`docs/qa-results/ui-refinement-${browser}.json`, JSON.stringify({ checks, errors, requests }, null, 2));
  await context.close();
}
