import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.ONEFLOW_NODE_MODULES + '/playwright');
const browser = process.argv[2] || 'chrome';
const context = await chromium.launchPersistentContext(path.resolve('.test-profile', `settings-page-${browser}-${Date.now()}`), {
  executablePath: browser === 'edge' ? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' : 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true, viewport: { width: 1440, height: 900 },
  args: ['--enable-unsafe-extension-debugging'], ignoreDefaultArgs: ['--disable-extensions']
});
const page = await context.newPage();
const errors = [], checks = [];
page.on('pageerror', error => errors.push(error.message));
const pass = name => { checks.push(name); console.log('PASS: ' + name); };
const section = name => page.locator('.settings-tabs button').filter({ hasText: name });
try {
  const cdp = await context.browser().newBrowserCDPSession();
  const { id } = await cdp.send('Extensions.loadUnpacked', { path: process.cwd() });
  await page.goto(`chrome-extension://${id}/newtab/index.html`);
  await page.waitForSelector('html[data-ready=true]');
  const skip = page.getByRole('button', { name: 'Skip for now', exact: true });
  await skip.click();
  await page.locator('#panel').waitFor({ state: 'hidden' });
  await page.locator('#home-menu > summary').click();
  await page.locator('#settings-button').click();
  await page.locator('#panel[data-panel=settings]').waitFor();
  assert.deepEqual(await page.locator('#panel').evaluate(node => {
    const box = node.getBoundingClientRect();
    return { x: box.x, y: box.y, width: box.width, height: box.height };
  }), { x: 0, y: 0, width: 1440, height: 900 });
  await page.getByRole('heading', { name: 'Appearance', exact: true }).waitFor();
  await page.getByRole('heading', { name: 'Personal details', exact: true }).waitFor();
  await page.getByRole('heading', { name: 'Comfort & clarity', exact: true }).waitFor();
  await fs.mkdir('docs/screenshots', { recursive: true });
  await page.screenshot({ path: 'docs/screenshots/settings-page-desktop.png' });
  await page.getByLabel('Theme', { exact: true }).selectOption('light');
  await page.waitForSelector('html[data-theme=light]');
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'docs/screenshots/settings-page-light.png' });
  pass('Appearance opens as a full-screen page with grouped controls');

  await section('Focus').click();
  await page.screenshot({ path: 'docs/screenshots/settings-page-focus.png' });
  await page.getByLabel('Focus minutes', { exact: true }).fill('31');
  await section('Appearance').click();
  await section('Focus').click();
  assert.equal(await page.getByLabel('Focus minutes', { exact: true }).inputValue(), '31');
  await page.getByRole('button', { name: 'Save rhythm', exact: true }).click();
  await page.waitForFunction(async () => (await import('../core/storage.js')).get().timerConfig.focus === 31);
  await section('Reminders').click();
  await page.locator('#toast').waitFor({ state: 'hidden' });
  await page.screenshot({ path: 'docs/screenshots/settings-page-reminders.png' });
  await page.getByLabel('Morning reminder', { exact: true }).fill('09:30');
  await page.getByLabel('Morning reminder', { exact: true }).dispatchEvent('change');
  await page.waitForFunction(async () => (await chrome.alarms.getAll()).some(alarm => alarm.name === 'oneflow-ritual-morning'));
  pass('Section changes preserve a Focus draft and reminders still save');

  for (const name of ['Home', 'Journal', 'Website blocking', 'Data & privacy', 'Help & feedback']) {
    await section(name).click();
    await page.locator('.settings-content h3').filter({ hasText: name }).waitFor();
  }
  pass('Every Settings section remains reachable from the desktop rail');
  await page.locator('#toast').waitFor({ state: 'hidden' });
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 800 });
    await page.getByLabel('Settings section').selectOption('appearance');
    await page.getByRole('heading', { name: 'Appearance', exact: true }).waitFor();
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    assert(await page.locator('#panel-body').evaluate(node => node.scrollWidth <= node.clientWidth + 2));
    await page.screenshot({ path: `docs/screenshots/settings-page-${width}.png` });
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByLabel('Settings section').selectOption('data');
  await page.getByRole('button', { name: 'Export all data', exact: true }).waitFor();
  await page.keyboard.press('Escape');
  await page.locator('#panel').waitFor({ state: 'hidden' });
  pass('390px and 320px pages fit; Data tools and Escape remain accessible');
  assert.deepEqual(errors, []);
} finally {
  await fs.mkdir('docs/qa-results', { recursive: true });
  await fs.writeFile(`docs/qa-results/settings-page-${browser}.json`, JSON.stringify({ checks, errors }, null, 2));
  await context.close();
}
