// Optional audit tooling; never loaded by the extension. Uses disposable profiles.
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';

const root = process.cwd();
const args = process.argv.slice(2);
const output = args.find(arg => arg.startsWith('--output='))?.slice(9) || 'design-stage-0-baseline.json';
if (!/^[a-z0-9-]+\.json$/.test(output)) throw new Error('Output must be a simple JSON filename.');
const browsers = args.filter(arg => !arg.startsWith('--output='));
const seen = new Set();
const modules = [];
/** Measure the same uncompressed static import graph as scripts/check.js. */
async function visit(file) {
  file = path.normalize(file);
  if (seen.has(file)) return;
  seen.add(file);
  const source = await fs.readFile(file, 'utf8');
  modules.push({ file: path.relative(root, file).replaceAll('\\', '/'), bytes: Buffer.byteLength(source), sha256: createHash('sha256').update(source).digest('hex') });
  for (const match of source.matchAll(/(?:import|export)\s+(?:[^;'"\n]*?from\s*)?['"](\.[^'"]+)['"]/g)) await visit(path.resolve(path.dirname(file), match[1]));
}
await visit(path.join(root, 'newtab/newtab.js'));
const jsBytes = modules.reduce((sum, entry) => sum + entry.bytes, 0);
const report = {
  measuredAt: new Date().toISOString(), node: process.version,
  host: { platform: process.platform, release: os.release(), cpu: os.cpus()[0]?.model },
  method: 'Source checkout, headless installed browser, disposable profile, 1440x900, default settings, onboarding skipped, offline; one warm-up reload then eight sequential reloads. oneflow-ready is application initialization, not a paint or every deferred widget completion.',
  javascript: { bytes: jsBytes, kib: jsBytes / 1024, limitBytes: 150 * 1024, pass: jsBytes < 150 * 1024, modules },
  browsers: []
};
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.ONEFLOW_NODE_MODULES ? path.join(process.env.ONEFLOW_NODE_MODULES, 'playwright') : 'playwright');
for (const browser of browsers.length ? browsers : ['chrome', 'edge']) {
  if (!['chrome', 'edge'].includes(browser)) throw new Error('Use chrome or edge.');
  const executablePath = browser === 'edge' ? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' : 'C:/Program Files/Google/Chrome/Application/chrome.exe';
  const result = { browser, executablePath, timingsMs: [], stages: [], errors: [], externalRequests: [] };
  report.browsers.push(result);
  let context;
  try {
    await fs.access(executablePath);
    context = await chromium.launchPersistentContext(path.join(root, '.test-profile', `design-baseline-${browser}-${Date.now()}`), {
      executablePath, headless: true, viewport: { width: 1440, height: 900 }, timezoneId: 'Asia/Kolkata',
      args: ['--enable-unsafe-extension-debugging'], ignoreDefaultArgs: ['--disable-extensions']
    });
    result.version = context.browser().version();
    const cdp = await context.browser().newBrowserCDPSession();
    const { id } = await cdp.send('Extensions.loadUnpacked', { path: root });
    const page = await context.newPage();
    page.on('pageerror', error => result.errors.push(error.message));
    page.on('request', request => { if (/^https?:/.test(request.url())) result.externalRequests.push(request.url()); });
    await page.goto(`chrome-extension://${id}/newtab/index.html`);
    await page.getByRole('button', { name: 'Skip for now', exact: true }).click();
    await page.locator('#panel').waitFor({ state: 'hidden' });
    await page.locator('#landscape[data-load=ready]').waitFor();
    result.home = await page.evaluate(() => {
      const visible = selector => Boolean(document.querySelector(selector)?.checkVisibility({ visibilityProperty: true }));
      const selectors = { greeting: '.greeting', clock: '.clock-time', date: '.date-label', focus: '#focus', search: '#search', quote: '#quotes blockquote', journal: '#journal-button', bottomLeft: '#dock', more: '#home-menu > summary', settings: '#settings-button', brand: '.brand' };
      const style = getComputedStyle(document.documentElement);
      return { visible: Object.fromEntries(Object.entries(selectors).map(([key, selector]) => [key, visible(selector)])), homeShade: style.getPropertyValue('--home-shade').trim(), sceneTextShade: style.getPropertyValue('--scene-text-shade').trim(), headingWeight: style.getPropertyValue('--weight-heading').trim(), font: style.getPropertyValue('--font').trim(), readability: getComputedStyle(document.querySelector('.readability')).backgroundImage };
    });
    await context.setOffline(true);
    await page.reload();
    await page.locator('html[data-ready=true]').waitFor();
    for (let sample = 0; sample < 8; sample++) {
      await page.reload();
      await page.locator('html[data-ready=true]').waitFor();
      result.timingsMs.push(await page.evaluate(() => performance.getEntriesByName('oneflow-ready')[0].startTime));
      result.stages.push(await page.evaluate(() => ({ marks: Object.fromEntries(performance.getEntriesByType('mark').filter(m => m.name.startsWith('oneflow-')).map(m => [m.name, m.startTime])), navigation: performance.getEntriesByType('navigation')[0].toJSON() })));
    }
    const sorted = [...result.timingsMs].sort((a, b) => a - b);
    result.medianMs = (sorted[3] + sorted[4]) / 2;
    result.maxMs = sorted.at(-1);
    result.startupPass = result.maxMs < 300;
    result.loadPass = result.errors.length === 0 && result.externalRequests.length === 0;
    console.log(`${browser} ${result.version}: median ${result.medianMs.toFixed(1)} ms, max ${result.maxMs.toFixed(1)} ms; below 300 ms: ${result.startupPass}`);
  } catch (error) {
    result.failure = error.message;
    process.exitCode = 1;
  } finally {
    await context?.close();
  }
}
await fs.mkdir(path.join(root, 'docs/qa-results'), { recursive: true });
await fs.writeFile(path.join(root, 'docs/qa-results', output), JSON.stringify(report, null, 2) + '\n');
console.log(`Initial static JavaScript: ${jsBytes} bytes (${(jsBytes / 1024).toFixed(2)} KiB).`);
if (!report.javascript.pass || report.browsers.some(item => !item.startupPass || !item.loadPass)) process.exitCode = 1;
