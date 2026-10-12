import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url), { chromium } = require(process.env.ONEFLOW_NODE_MODULES + '/playwright');
const context = await chromium.launchPersistentContext(path.resolve('.test-profile', 'launch-captures-' + Date.now()), {
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true,
  viewport: { width: 1280, height: 800 }, timezoneId: 'Asia/Kolkata',
  args: ['--enable-unsafe-extension-debugging'], ignoreDefaultArgs: ['--disable-extensions']
});
try {
  const page = await context.newPage(), cdp = await context.browser().newBrowserCDPSession();
  const { id } = await cdp.send('Extensions.loadUnpacked', { path: process.cwd() });
  await page.goto(`chrome-extension://${id}/newtab/index.html`);
  await page.getByLabel('Your first task').waitFor();
  const capture = async label => {
    await page.waitForSelector('#landscape[data-load=ready]');
    await page.locator('#toast').waitFor({ state: 'hidden' });
    await page.evaluate(() => { document.activeElement?.blur(); scrollTo(0, 0); });
    await page.screenshot({ path: `docs/launch/chrome-${label}.png`, animations: 'disabled' });
  };
  await capture('onboarding');
  await page.getByRole('button', { name: 'Skip for now', exact: true }).click();
  await page.getByLabel('Your main focus today', { exact: true }).fill('Revise one biology chapter');
  await capture('start-easily');
  await page.getByRole('button', { name: 'Start focus', exact: true }).click();
  await page.getByRole('button', { name: 'Pause', exact: true }).waitFor();
  await capture('stay-focused');
  await page.evaluate(async () => {
    const storage = await import('../core/storage.js');
    await storage.update(d => { d.timer.startedAt = Date.now() - d.timer.duration; d.timer.endsAt = Date.now() - 1; d.timer.observedAt = Date.now() - 2; });
    await (await import('../core/timer-client.js')).timerCommand('tick');
  });
  await page.getByRole('button', { name: 'Start break', exact: true }).waitFor();
  await capture('see-progress');
  await page.setViewportSize({ width: 390, height: 844 });
  await capture('mobile');
  console.log('Captured clean store screenshots from the final UI with sample study data.');
} finally { await context.close(); }
