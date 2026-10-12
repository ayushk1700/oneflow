import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url), { chromium } = require(process.env.ONEFLOW_NODE_MODULES + '/playwright');
const context = await chromium.launchPersistentContext(path.resolve('.test-profile', 'launch-demo-' + Date.now()), {
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true,
  viewport: { width: 1280, height: 800 }, args: ['--enable-unsafe-extension-debugging'], ignoreDefaultArgs: ['--disable-extensions']
});
const frames = [], page = await context.newPage();
async function capture(seconds) {
  const bytes = await page.screenshot({ animations: 'disabled' });
  frames.push({ image: 'data:image/png;base64,' + bytes.toString('base64'), seconds });
}
try {
  const cdp = await context.browser().newBrowserCDPSession(), { id } = await cdp.send('Extensions.loadUnpacked', { path: process.cwd() });
  await page.goto(`chrome-extension://${id}/newtab/index.html`); await page.getByLabel('Your first task').waitFor();
  await capture(3);
  await page.getByLabel('Your first task').fill('Revise one biology chapter'); await capture(3);
  await page.getByRole('button', { name: 'Start my first session', exact: true }).click();
  await page.getByRole('button', { name: 'Pause', exact: true }).waitFor(); await capture(4);
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await page.getByRole('button', { name: 'Resume', exact: true }).waitFor(); await capture(3);
  await page.locator('#dock [data-tool=tasks]').click(); await page.getByLabel('New task', { exact: true }).waitFor(); await capture(3);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Resume', exact: true }).click(); await page.getByRole('button', { name: 'Pause', exact: true }).waitFor(); await capture(4);
  // Encode an accurately labeled, silent 20-second walkthrough from actual UI captures.
  // Native browser recording avoids adding a video encoder dependency to the extension.
  const encoder = await context.newPage(); await encoder.goto('about:blank');
  const video = await encoder.evaluate(async frames => {
    const canvas = document.createElement('canvas'); canvas.width = 1280; canvas.height = 800; document.body.append(canvas);
    const ctx = canvas.getContext('2d'), stream = canvas.captureStream(10), parts = [];
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8', videoBitsPerSecond: 1600000 });
    const done = new Promise(resolve => { recorder.ondataavailable = e => parts.push(e.data); recorder.onstop = async () => {
      const reader = new FileReader(); reader.onload = () => resolve(reader.result.split(',')[1]); reader.readAsDataURL(new Blob(parts, { type: 'video/webm' }));
    }; });
    recorder.start();
    for (const frame of frames) {
      const image = new Image(); image.src = frame.image; await image.decode();
      for (let step = 0; step < frame.seconds * 10; step++) { ctx.drawImage(image, 0, 0); await new Promise(resolve => setTimeout(resolve, 100)); }
    }
    recorder.stop(); stream.getTracks().forEach(track => track.stop()); return done;
  }, frames);
  await fs.writeFile('docs/launch/oneflow-demo.webm', Buffer.from(video, 'base64'));
  const background = (await fs.readFile('assets/backgrounds/alpine.webp')).toString('base64');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="440" height="280" viewBox="0 0 440 280"><image href="data:image/webp;base64,${background}" width="440" height="280" preserveAspectRatio="xMidYMid slice"/><path fill="#122922" opacity=".55" d="M0 0h440v280H0z"/><g transform="translate(174 64) scale(3)" fill="none" stroke="#f7f5e9" stroke-width="1.5" stroke-linecap="round"><path d="M2 18C7 5 12 5 16 13S25 23 30 8M2 24C7 11 12 11 16 19S25 29 30 14"/></g><text x="220" y="180" text-anchor="middle" fill="#fff" font-family="sans-serif" font-size="24" letter-spacing="5">ONEFLOW</text><circle cx="220" cy="222" r="16" fill="#f7f5e9"/><path d="m216 215 11 7-11 7z" fill="#214336"/></svg>`;
  await fs.writeFile('docs/launch/promo.svg', svg);
  await encoder.setViewportSize({ width: 440, height: 280 });
  await encoder.setContent('<html><body style="margin:0">' + svg + '</body></html>');
  await encoder.locator('svg image').evaluate(async node => { const image = new Image(); image.src = node.getAttribute('href'); await image.decode(); });
  await encoder.screenshot({ path: 'docs/launch/promo-440x280.png' });
  console.log('Created a 20-second captured walkthrough and 440×280 store promotional image.');
} finally { await context.close(); }
