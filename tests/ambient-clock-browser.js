import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.ONEFLOW_NODE_MODULES + '/playwright');
const context = await chromium.launchPersistentContext(path.resolve('.test-profile', 'ambient-clock-' + Date.now()), {
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true, timeout: 30000, timezoneId: 'Asia/Kolkata', viewport: { width: 1440, height: 960 },
  args: ['--enable-unsafe-extension-debugging'], ignoreDefaultArgs: ['--disable-extensions']
});
const page = await context.newPage(), errors = [], network = [], checks = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('request', r => { if (/^https?:/.test(r.url())) network.push(r.url()); });
const pass = label => { checks.push(label); console.log('PASS: ' + label); };
async function view(name) {
  if(await page.locator('#focus-exit').isVisible())await page.locator('#focus-exit').click();
  if(await page.locator('#home-menu').getAttribute('open')===null)await page.locator('#home-menu > summary').click();
  await page.getByRole('button',{name,exact:true}).click();
}
try {
  await page.clock.setFixedTime(new Date('2026-10-09T10:09:00+05:30'));
  const cdp = await context.browser().newBrowserCDPSession();
  const { id } = await cdp.send('Extensions.loadUnpacked', { path: process.cwd() });
  await page.goto(`chrome-extension://${id}/newtab/index.html`);
  await page.getByRole('button', { name: 'Skip for now', exact: true }).click();
  await page.locator('#panel').waitFor({state:'hidden'});
  assert.equal(await page.locator('#ambient-clock').count(), 0);
  await page.evaluate(async () => (await import('../core/storage.js')).update(d => { d.settings.background.id = 'cozy'; }));
  await view('Ambient view');
  const card = page.locator('#ambient-clock');
  await card.waitFor();
  assert((await page.locator('.ambient-clock-hour').getAttribute('style')).includes('304.5deg'));
  assert((await page.locator('.ambient-clock-minute').getAttribute('style')).includes('54deg'));
  assert((await page.locator('.ambient-clock-face').getAttribute('aria-label')).includes('10:09'));
  const compact = await card.boundingBox();
  assert(compact.width <= 210 && compact.x >= 0 && compact.x < 100);
  await page.screenshot({ path: 'docs/screenshots/ambient-analog-desktop.png' });
  await card.screenshot({ path: 'docs/screenshots/ambient-analog-card.png' });
  pass('Ambient lazily shows the lower-left clock with correct local-time hands and accessible time');
  await page.getByRole('button', { name: 'Expand ambient clock', exact: true }).click();
  assert((await card.boundingBox()).width > compact.width);
  await page.keyboard.press('Escape');
  assert.equal(await card.getAttribute('data-expanded'), 'false');
  pass('Expand, collapse and Escape work');
  for (const view of ['Home view', 'Focus view']) {
    await page.locator('#home-menu > summary').click();
    await page.getByRole('button', { name: view, exact: true }).click();
    assert.equal(await card.isVisible(), false);
    await page.screenshot({ path: 'docs/screenshots/clear-' + view.split(' ')[0].toLowerCase() + '.png' });
  }
  await view('Ambient view');
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    const box = await card.boundingBox();
    assert(box.x >= 0 && box.x + box.width <= width && box.width <= 155);
    await page.getByRole('button', { name: 'Expand ambient clock', exact: true }).click();
    const expanded = await card.boundingBox();
    assert(expanded.x >= 0 && expanded.x + expanded.width <= width);
    await page.getByRole('button', { name: 'Collapse ambient clock', exact: true }).click();
    await page.screenshot({ path: `docs/screenshots/ambient-analog-${width}.png` });
  }
  await page.evaluate(async () => (await import('../core/storage.js')).update(d => { d.settings.widgets.clock = false; }));
  await card.waitFor({ state: 'hidden' });
  await page.evaluate(async () => (await import('../core/storage.js')).update(d => { d.settings.widgets.clock = true; }));
  await card.waitFor();
  pass('Home/Focus hide the card; Clock visibility and 390/320 px layouts work');
  await context.setOffline(true);
  await page.reload();
  await page.locator('html[data-ready=true]').waitFor();
  await view('Ambient view');
  await card.waitFor();
  assert.deepEqual(errors, []);
  assert.deepEqual(network, []);
  pass('Offline reload works without page, console or CSP errors or external requests');
} finally {
  await fs.mkdir('test-results', { recursive: true });
  await fs.writeFile('test-results/ambient-clock-report.json', JSON.stringify({ checks, errors, network }, null, 2));
  await context.close();
}
