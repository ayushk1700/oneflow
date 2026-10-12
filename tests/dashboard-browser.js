import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.ONEFLOW_NODE_MODULES + '/playwright');
const browser = process.argv[2] || 'chrome', checks = [], errors = [], network = [];
const context = await chromium.launchPersistentContext(path.resolve('.test-profile', `dashboard-${browser}-${Date.now()}`), {
  executablePath: browser === 'edge' ? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' : 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true, viewport: { width: 1440, height: 900 },
  args: ['--enable-unsafe-extension-debugging'], ignoreDefaultArgs: ['--disable-extensions']
});
const page = await context.newPage();
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
page.on('request', request => { if (/^https?:/.test(request.url())) network.push(request.url()); });
const pass = text => { checks.push(text); console.log('PASS: ' + text); };
const state = () => page.evaluate(async () => (await import('../core/storage.js')).get());
const view = mode => page.getByRole('button', { name: mode + ' view', exact: true }).click();
const shot = async name => { await page.screenshot({ path: `docs/screenshots/dashboard-${browser}-${name}.png`, animations: 'disabled' }); };
async function fits() {
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Horizontal overflow');
  assert(await page.locator('#dock button,#workspace-tools,#view-switcher button,#settings-button').evaluateAll(nodes => nodes.every(node => {
    const rect = node.getBoundingClientRect(); return rect.left >= 0 && rect.right <= innerWidth && rect.top >= 0 && rect.bottom <= innerHeight;
  })), 'Floating controls outside viewport');
}
try {
  await fs.mkdir('docs/screenshots', { recursive: true });
  const cdp = await context.browser().newBrowserCDPSession();
  const { id } = await cdp.send('Extensions.loadUnpacked', { path: process.cwd() });
  const url = `chrome-extension://${id}/newtab/index.html`;
  await page.goto(url); await page.waitForSelector('html[data-ready=true]');
  await page.getByRole('button', { name: 'Skip for now', exact: true }).click();
  await page.evaluate(async () => { await (await import('../core/storage.js')).update(d => { d.settings.name = 'Alex'; }); });
  await page.locator('#landscape[data-load=ready]').waitFor();
  assert.equal(await page.locator('html').getAttribute('data-view'), 'home');
  assert(await page.locator('#clock').isVisible());
  assert.equal(await page.locator('#focus').evaluate(node => getComputedStyle(node).backgroundColor), 'rgba(0, 0, 0, 0)');
  await fits(); await shot('home');
  await view('Focus');
  assert(!await page.locator('#clock').isVisible());
  await page.getByLabel('Your main focus today').fill('Finish the first chapter');
  await page.getByLabel('Focus duration in minutes').fill('32');
  assert.equal(await page.locator('.session-preview').textContent(), '32:00');
  await shot('focus-ready');
  await view('Ambient');
  assert(!await page.locator('#clock').isVisible());
  assert(!await page.locator('#ambient-session').isVisible());
  await shot('ambient');
  await view('Home');
  assert.equal(await page.getByLabel('Your main focus today').inputValue(), 'Finish the first chapter');
  assert.equal(await page.getByLabel('Focus duration in minutes').inputValue(), '32');
  pass('Home, Focus and Ambient change presentation and preserve the unsaved focus form');

  await page.getByRole('button', { name: 'Start focus', exact: true }).click();
  await page.getByRole('button', { name: 'Pause', exact: true }).waitFor();
  assert.equal(await page.locator('html').getAttribute('data-view'), 'focus');
  const started = (await state()).timer;
  assert.equal(started.duration, 32 * 60000);
  assert(await page.getByRole('button', { name: 'Short break', exact: true }).isDisabled());
  await shot('focus-running');
  await view('Home'); await view('Ambient');
  await page.getByRole('button', { name: 'Return to focus session', exact: true }).waitFor();
  await shot('ambient-session');
  const ambient = (await state()).timer;
  assert.equal(ambient.sessionId, started.sessionId); assert.equal(ambient.endsAt, started.endsAt);
  await page.getByRole('button', { name: 'Return to focus session', exact: true }).click();
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await page.getByRole('button', { name: 'Resume', exact: true }).waitFor();
  const paused = (await state()).timer;
  await view('Home'); await view('Focus');
  assert.equal((await state()).timer.remaining, paused.remaining);
  pass('View changes retain session identity and deadline; Ambient provides a live return control');

  await page.getByRole('button', { name: 'End session', exact: true }).click();
  await page.getByRole('button', { name: 'Short break', exact: true }).click();
  await page.waitForFunction(() => document.querySelector('.session-countdown')?.textContent === '05:00');
  assert.equal((await state()).timer.phase, 'short');
  assert.equal(await page.locator('.session-countdown').textContent(), '05:00');
  await page.getByRole('button', { name: 'Long break', exact: true }).click();
  await page.waitForFunction(() => document.querySelector('.session-countdown')?.textContent === '15:00');
  assert.equal(await page.locator('.session-countdown').textContent(), '15:00');
  await page.getByRole('button', { name: 'Start break', exact: true }).click();
  await page.getByRole('button', { name: 'Pause', exact: true }).waitFor();
  assert.equal((await state()).timer.phase, 'long');
  await page.getByRole('button', { name: 'Skip break', exact: true }).click();
  pass('Phase controls select actual 5/15-minute breaks through the worker; active intervals cannot be overwritten');

  await page.locator('#dock [data-tool=workspace]').click();
  await page.getByLabel('New task', { exact: true }).fill('Keep my draft');
  await page.locator('#panel-nav [data-tool=notes]').click();
  await page.locator('#panel[data-panel=notes]').waitFor();
  await page.locator('#panel-nav [data-tool=workspace]').click();
  assert.equal(await page.getByLabel('New task', { exact: true }).inputValue(), 'Keep my draft');
  await shot('tasks');
  await page.locator('#panel-nav [data-tool=sounds]').click();
  await page.locator('#panel[data-panel=sounds]').waitFor();
  await shot('sounds');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#panel').getAttribute('open'), null);
  await page.locator('#settings-button').click();
  await page.locator('#panel[data-panel=settings]').waitFor();
  await shot('settings'); await page.keyboard.press('Escape');
  pass('Floating panels switch tools without losing task drafts; Settings and Escape work');

  for (const [width, height] of [[1280,720], [390,844], [320,640]]) {
    await page.setViewportSize({ width, height });
    for (const mode of ['Home', 'Focus', 'Ambient']) { await view(mode); await fits(); await shot(`${mode.toLowerCase()}-${width}`); }
    await view('Home');
    if (width <= 600) {
      assert(await page.evaluate(() => document.querySelector('#main').getBoundingClientRect().bottom <= document.querySelector('.bottom-row').getBoundingClientRect().top), 'Mobile content intersects the dock');
      await page.getByRole('button', { name: 'Start focus', exact: true }).scrollIntoViewIfNeeded();
      assert(await page.getByRole('button', { name: 'Start focus', exact: true }).isVisible());
    }
    await page.locator('#dock [data-tool=sounds]').click();
    assert(await page.locator('#panel-body').evaluate(node => node.scrollWidth <= node.clientWidth + 1));
    await shot('sounds-' + width); await page.keyboard.press('Escape');
  }
  await view('Ambient');
  await page.locator('#view-switcher [data-view=ambient]').press('Tab');
  await page.keyboard.press('/');
  assert.equal(await page.locator('html').getAttribute('data-view'), 'home');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'web-search');
  await page.keyboard.press('Escape'); await page.keyboard.press('Tab'); await page.keyboard.press('n');
  await page.getByLabel('New task', { exact: true }).waitFor(); await page.keyboard.press('Escape');
  pass('All views and sheets fit desktop, 390px and 320px; search shortcut exits Ambient and N opens tasks');

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.evaluate(async () => { await (await import('../core/storage.js')).update(d => { d.settings.background = { kind: 'solid', color: '#ffffff', blur: 0, rotate: false, id: 'alpine' }; }); });
  await page.waitForSelector('html[data-canvas=white]'); await shot('white');
  const white = await page.locator('#focus').evaluate(n => getComputedStyle(n).color);
  assert.notEqual(white, 'rgb(255, 255, 255)');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await context.setOffline(true); await page.reload(); await page.waitForSelector('html[data-ready=true]');
  assert.equal(await page.locator('html').getAttribute('data-motion'), 'reduce');
  assert.equal((await state()).settings.name, 'Alex');
  assert.deepEqual(network, []); assert.deepEqual(errors, []);
  pass('White canvas, reduced motion and offline reload work without console/CSP errors or outside requests');
} catch (error) {
  checks.push('FAIL: ' + error.message); console.error(error); process.exitCode = 1;
  await shot('failure').catch(() => {});
} finally {
  await fs.mkdir('test-results', { recursive: true });
  await fs.writeFile(`test-results/dashboard-${browser}-report.json`, JSON.stringify({ browser, checks, errors, network, date: new Date().toISOString() }, null, 2));
  await context.close();
}

