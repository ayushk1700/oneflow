import path from 'node:path';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { chromium } = require(`${process.env.ONEFLOW_NODE_MODULES}/playwright`);
const browser = process.argv[2] || 'chrome';
const context = await chromium.launchPersistentContext(path.resolve('.test-profile', `stage34-${browser}-${Date.now()}`), {
  executablePath: browser === 'edge' ? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' : 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true, viewport: { width: 1440, height: 900 },
  args: ['--enable-unsafe-extension-debugging'], ignoreDefaultArgs: ['--disable-extensions']
});
const page = await context.newPage(), errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
const cdp = await context.browser().newBrowserCDPSession();
const { id } = await cdp.send('Extensions.loadUnpacked', { path: process.cwd() });
try {
  await page.goto(`chrome-extension://${id}/newtab/index.html`);
  await page.locator('html[data-ready=true]').waitFor();
  await page.getByRole('button', { name: 'Skip for now', exact: true }).click({ timeout: 5000 }).catch(() => {});

  await page.getByLabel('Your main focus today', { exact: true }).fill('Write one calm page');
  await page.getByLabel('Focus duration in minutes', { exact: true }).fill('1');
  await page.getByRole('button', { name: 'Start focus', exact: true }).click();
  await page.getByRole('button', { name: 'Pause', exact: true }).waitFor();
  assert.equal(await page.locator('html').getAttribute('data-view'), 'focus');
  for (const selector of ['#clock', '#search', '#quotes', '#weather', '#links', '#countdowns', '#photo-attribution', '.dashboard-extras']) {
    assert.equal(await page.locator(selector).isVisible(), false, `${selector} should be hidden in Focus Mode`);
  }
  const sessionTitle = page.locator('.session-title');
  assert(await sessionTitle.isVisible());
  assert((await sessionTitle.textContent()).trim().length > 0);
  assert(await page.getByRole('button', { name: 'Pause', exact: true }).isVisible());
  assert(await page.getByRole('button', { name: 'Stop or finish focus session', exact: true }).isVisible());
  assert(await page.locator('#focus').getByRole('button', { name: 'Sounds', exact: true }).isVisible());
  assert(await page.getByRole('button', { name: 'Exit Focus Mode', exact: true }).isVisible());
  await page.waitForTimeout(300);
  const dockState = await page.locator('.tool-cluster').evaluate(node => ({ view: document.documentElement.dataset.view, visibility: getComputedStyle(node).visibility, opacity: getComputedStyle(node).opacity }));
  assert.equal(dockState.visibility, 'hidden');

  await page.locator('.session-title').focus();
  await page.keyboard.press('Space');
  await page.getByRole('button', { name: 'Resume', exact: true }).waitFor();
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => document.documentElement.dataset.view === 'home');
  assert.equal(await page.locator('#focus-exit').isVisible(), false);
  await page.getByRole('button', { name: 'Stop or finish focus session', exact: true }).click();
  await page.waitForFunction(async () => (await import('../core/storage.js')).get().timer.sessionId === null);

  assert.equal(await page.locator('#dock button').count(), 3);
  assert.deepEqual(await page.locator('#dock button').evaluateAll(nodes => nodes.map(node => node.textContent.trim())), ['Tasks', 'Sounds', 'Journal']);
  assert.equal(await page.locator('#home-menu > summary').textContent(), 'More');
  await page.locator('#home-menu > summary').click();
  assert(await page.getByRole('button', { name: 'Open all tools', exact: true }).isVisible());
  await page.getByRole('button', { name: 'Open all tools', exact: true }).click();
  await page.locator('#panel[data-panel=day]').waitFor();
  assert(await page.getByRole('button', { name: 'Scenes', exact: true }).isVisible());
  assert.deepEqual(errors, []);
  console.log(`PASS: Stage 3 quiet Focus Mode and Stage 4 progressive dock acceptance (${browser})`);
} finally {
  await context.close();
}
