import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url), { chromium } = require(process.env.ONEFLOW_NODE_MODULES + '/playwright');
const browser = process.argv[2] || 'chrome', source = path.resolve(process.argv[3] || '.');
const report = { browser, source, date: new Date().toISOString(), checks: [], errors: [] };
const context = await chromium.launchPersistentContext(path.resolve('.test-profile', `security-fixes-${browser}-${Date.now()}`), {
  executablePath: browser === 'edge' ? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' : 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true, viewport: { width: 1280, height: 850 }, args: ['--enable-unsafe-extension-debugging'], ignoreDefaultArgs: ['--disable-extensions']
});
const pass = text => { report.checks.push(text); console.log('PASS: ' + text); };
try {
  const cdp = await context.browser().newBrowserCDPSession(), { id } = await cdp.send('Extensions.loadUnpacked', { path: source });
  const base = `chrome-extension://${id}`, page = await context.newPage();
  page.on('pageerror', error => report.errors.push(error.message));
  await page.goto(base + '/newtab/index.html'); await page.locator('html[data-ready=true]').waitFor();
  const startupGrants = await page.evaluate(() => chrome.permissions.getAll());
  assert(!startupGrants.permissions.includes('notifications')); assert(!startupGrants.permissions.includes('geolocation'));
  pass('Extension loads without required notifications, device location or website grants');

  const audio = await page.evaluate(async () => {
    const storage = await import('../core/storage.js');
    await storage.update(d => { d.settings.onboarding = true; d.audio.volumes.rain = .1; d.audio.playing = true; });
    const started = await chrome.runtime.sendMessage({ target: 'worker', type: 'sync' });
    await storage.update(d => { d.audio.playing = false; });
    const stopped = await chrome.runtime.sendMessage({ target: 'worker', type: 'sync' });
    return { started, stopped };
  });
  assert(audio.started.ok, JSON.stringify(audio)); assert(audio.stopped.ok, JSON.stringify(audio));
  pass('Worker and offscreen owner allow legitimate audio messages and stop playback');

  const target = 'https://audit-blocked.test/private';
  await context.route('https://audit-blocked.test/**', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Allowed synthetic destination</title>' }));
  await page.evaluate(async () => {
    const storage = await import('../core/storage.js'); await (await import('../core/timer-engine.js')).runTimer('start');
    await storage.update(d => { d.blocker.enabled = true; d.blocker.mode = 'block'; d.blocker.domains = ['audit-blocked.test']; d.flow = { active: true, block: true, startedAt: Date.now(), snapshot: null }; });
    await storage.sessionSet('flowLease', storage.get().flow.startedAt);
  });
  const hostile = await context.newPage(), fixture = 'https://audit-parent.test/';
  await hostile.route(fixture, route => route.fulfill({ contentType: 'text/html', body: `<!doctype html><iframe width="900" height="700" src="${base}/blocked/index.html#${target}"></iframe>` }));
  await hostile.goto(fixture);
  const frame = hostile.frames().find(frame => frame.url().includes('/blocked/index.html'));
  await frame.locator('#error').filter({ hasText: 'Open the blocked page directly' }).waitFor();
  assert(await frame.locator('#override').isDisabled());
  const rejection = await frame.evaluate(url => chrome.runtime.sendMessage({ target: 'worker', type: 'override', url }), target);
  assert.equal(rejection.ok, false);
  const untouched = await page.evaluate(async () => { const d = await (await import('../core/storage.js')).readLatest(); return { overrides: d.blocker.overrides.length, log: d.blocker.log.length }; });
  assert.deepEqual(untouched, { overrides: 0, log: 0 });
  const direct = await context.newPage(); await direct.goto(base + '/blocked/index.html#' + target);
  await direct.locator('#host').filter({ hasText: 'audit-blocked.test' }).waitFor();
  await direct.locator('#override').click(); await direct.waitForURL(target);
  assert.equal(await page.evaluate(async () => (await (await import('../core/storage.js')).readLatest()).blocker.overrides.length), 1);
  await direct.close();
  pass('Hostile blocker frame cannot log or override; exact top-level page still permits an explicit override (seeded Flow state)');

  await hostile.evaluate(src => { const iframe = document.createElement('iframe'); iframe.src = src; document.body.append(iframe); }, base + '/components/notes/capture.html#token=forged');
  await hostile.waitForTimeout(150);
  const forged = hostile.frames().find(frame => frame.url().includes('token=forged'));
  await forged.getByRole('alert').filter({ hasText: 'Open Notes using the extension toolbar.' }).waitFor();
  assert.equal(await forged.locator('.note-card').count(), 0);
  await hostile.close(); pass('Forged Notes capability cannot render private records');

  const capturePage = await context.newPage(), captureURL = 'https://audit-capture.test/';
  await capturePage.route(captureURL, route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Safe capture fixture</title><p id="selection">&lt;img src=x onerror=alert(1)&gt;</p>' }));
  await capturePage.goto(captureURL);
  await capturePage.evaluate(() => { const range = document.createRange(); range.selectNodeContents(document.querySelector('#selection')); getSelection().removeAllRanges(); getSelection().addRange(range); });
  const targets = await cdp.send('Target.getTargets', { filter: [{ type: 'tab', exclude: false }, { exclude: true }] });
  await cdp.send('Extensions.triggerAction', { id, targetId: targets.targetInfos.find(target => target.url === captureURL).targetId });
  await capturePage.waitForEvent('framenavigated', { predicate: frame => frame.url().startsWith(base + '/components/notes/capture.html') }).catch(() => {});
  const captureFrame = capturePage.frames().find(frame => frame.url().startsWith(base + '/components/notes/capture.html'));
  await captureFrame.getByRole('button', { name: 'Capture page', exact: true }).click();
  assert.equal(await captureFrame.getByLabel('Note text', { exact: true }).inputValue(), '<img src=x onerror=alert(1)>');
  assert.equal(await captureFrame.locator('img[src=x]').count(), 0);
  await capturePage.close(); pass('Real toolbar gesture still authorizes the isolated capture shell and preserves selected markup as text');

  const backup = await page.evaluate(async () => {
    const s = await import('../core/storage.js'), b = await import('../core/backup.js'), c = await import('../core/crypto-backup.js');
    await s.update(d => { d.integrations.pexelsKey = 'synthetic-provider-key'; d.music.youtubeKey = 'synthetic-video-key'; });
    const ordinary = await b.exportData(), explicit = await b.exportData({ includeKeys: true });
    const encrypted = await c.encryptBackup(JSON.stringify(ordinary), 'Synthetic-only-passphrase-2026');
    const parsed = await b.parseBackup(await c.decryptBackup(encrypted, 'Synthetic-only-passphrase-2026'));
    const invalid = structuredClone(ordinary); invalid.database.wallpapers.push({ id: 'fake-video', data: 'data:video/mp4;base64,QUJD' });
    let rejected = false; try { await b.parseBackup(JSON.stringify(invalid)); } catch { rejected = true; }
    const generation = await s.sessionGet('data-generation') || '';
    const api = await import('../core/notes.js'), stale = api.makeNote({ title: 'Old editor' });
    await api.saveNote(stale, [], generation);
    await s.sessionSet('notes-launch-audit', { token: 'synthetic', source: { text: 'synthetic private text' } });
    await s.sessionSet('pexels-key', 'synthetic-session-key');
    await b.resetData();
    let staleRejected = false; try { await api.saveNote(stale, [], generation); } catch { staleRejected = true; }
    return { excluded: !ordinary.local.integrations.pexelsKey && !ordinary.local.music.youtubeKey, included: explicit.local.integrations.pexelsKey, parsed: !!parsed.local, rejected, sessionGone: !await s.sessionGet('notes-launch-audit') && !await s.sessionGet('pexels-key'), notesGone: !(await api.listNotes()).length, staleRejected, grants: await chrome.permissions.getAll() };
  });
  assert(backup.excluded && backup.included && backup.parsed && backup.rejected && backup.sessionGone && backup.notesGone && backup.staleRejected, JSON.stringify(backup));
  assert(!backup.grants.permissions.includes('geolocation'));
  pass('Default backup omits keys, explicit export includes them, malformed video is rejected, and reset clears private session data and blocks stale editors');

  if (browser === 'chrome') {
    const large = await page.evaluate(async () => {
      const c = await import('../core/crypto-backup.js'), text = 'x'.repeat(46 * 1024 * 1024);
      const encrypted = await c.encryptBackup(text, 'Synthetic-only-passphrase-2026');
      return { bytes: new Blob([encrypted]).size, restored: (await c.decryptBackup(encrypted, 'Synthetic-only-passphrase-2026')).length === text.length };
    });
    assert(large.bytes > 60 * 1024 * 1024 && large.restored);
    pass('Previously failing >60-MiB encrypted envelope now round-trips');
  }

  const raster = await page.evaluate(async () => {
    const b = await import('../core/backup.js'), data = await b.exportData();
    const canvas = document.createElement('canvas'); canvas.width = 20; canvas.height = 20;
    const image = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    const encoded = await new Promise(resolve => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.readAsDataURL(image); });
    data.database.images.push({ id: 'valid-image', data: encoded });
    const valid = await b.parseBackup(JSON.stringify(data));
    const blob = new Uint8Array(24), view = new DataView(blob.buffer); blob.set([137,80,78,71,13,10,26,10]); blob.set([73,72,68,82],12); view.setUint32(16,100000); view.setUint32(20,100000);
    data.database.images[0].data = 'data:image/png;base64,' + btoa(String.fromCharCode(...blob));
    let calls = 0, rejected = false; const original = globalThis.createImageBitmap;
    globalThis.createImageBitmap = (...args) => { calls++; return original(...args); };
    try { await b.parseBackup(JSON.stringify(data)); } catch { rejected = true; } finally { globalThis.createImageBitmap = original; }
    return { valid: valid.records.images.length, rejected, decoderCalls: calls };
  });
  assert.deepEqual(raster, { valid: 1, rejected: true, decoderCalls: 0 });
  pass('Valid raster import survives; an oversized-dimension image is rejected before native decoding');

  const recorded = await page.evaluate(async () => {
    const { validateVideo, validateAudio } = await import('../core/media-validation.js');
    const canvas = document.createElement('canvas'); canvas.width = 160; canvas.height = 90; canvas.getContext('2d').fillRect(0, 0, 160, 90);
    const stream = canvas.captureStream(10), recorder = new MediaRecorder(stream), chunks = [];
    recorder.ondataavailable = event => chunks.push(event.data);
    const stopped = new Promise(resolve => { recorder.onstop = resolve; });
    recorder.start(100);
    let position = 0;
    const repaint = setInterval(() => { const ctx = canvas.getContext('2d'); ctx.clearRect(0, 0, 160, 90); ctx.fillRect(position++ % 100, 10, 20, 20); }, 25);
    await new Promise(resolve => setTimeout(resolve, 600)); clearInterval(repaint); recorder.stop(); await stopped; stream.getTracks().forEach(track => track.stop());
    const video = new Blob(chunks, { type: recorder.mimeType.split(';')[0] }); await validateVideo(video);
    const audio = new AudioContext(), oscillator = audio.createOscillator(), destination = audio.createMediaStreamDestination(); oscillator.connect(destination); oscillator.start(); await audio.resume();
    const voice = new MediaRecorder(destination.stream), voiceChunks = [], voiceStopped = new Promise(resolve => { voice.onstop = resolve; });
    voice.ondataavailable = event => voiceChunks.push(event.data); voice.start(); await new Promise(resolve => setTimeout(resolve, 250)); voice.stop(); await voiceStopped;
    oscillator.stop(); destination.stream.getTracks().forEach(track => track.stop()); await audio.close();
    await validateAudio(new Blob(voiceChunks, { type: voice.mimeType }));
    let corruptRejected = false; try { await validateAudio(new Blob(['ABC'], { type: 'audio/webm' })); } catch { corruptRejected = true; }
    return { videoBytes: video.size, audioBytes: voiceChunks.reduce((sum, chunk) => sum + chunk.size, 0), corruptRejected };
  });
  assert(recorded.videoBytes > 0 && recorded.audioBytes > 0 && recorded.corruptRejected, JSON.stringify(recorded));
  pass('Native recorded WebM video and voice audio validate; forged voice bytes are rejected');

  await page.reload(); await page.locator('html[data-ready=true]').waitFor();
  const weather = await page.evaluate(async () => { (await import('../components/weather/index.js')).open(); return !document.querySelector('#panel-body').textContent.includes('Use my location'); });
  assert(weather); pass('City-only weather UI has no unsupported device-location action');
  assert.deepEqual(report.errors, []);
} catch (error) { report.failure = error.stack; process.exitCode = 1; console.error(error.stack); }
finally { await fs.mkdir('docs/qa-results', { recursive: true }); await fs.writeFile(`docs/qa-results/security-fixes-${browser}.json`, JSON.stringify(report, null, 2)); await context.close(); }
