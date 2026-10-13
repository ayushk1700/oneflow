import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { readJSON, deadline } from '../core/network.js';
import { workerMessageAllowed } from '../core/message-policy.js';
import { MAX_BACKUP_BYTES, MAX_ENCRYPTED_BYTES } from '../core/backup-limits.js';
import { rasterDimensions } from '../core/media-validation.js';
import { normalize } from '../core/notes-preferences.js';
import { supportLink } from '../core/publisher.js';
import { releaseFiles } from '../scripts/release-files.js';
import { read, recoveryRecords, clearRecovery } from '../core/storage-recovery.js';
import { notify } from '../core/system-notifications.js';

test('blocker capability rejects cross-origin frames, lookalike documents and mismatched targets', () => {
  const previous = globalThis.chrome;
  globalThis.chrome = { runtime: { id: 'owner' } };
  try {
    const target = 'https://example.test/private', origin = 'chrome-extension://owner/';
    const sender = { id: 'owner', frameId: 0, url: `${origin}blocked/index.html#${target}` };
    const message = { type: 'override', url: target };
    assert(workerMessageAllowed(message, sender, origin));
    for (const variant of [{ ...sender, frameId: 1 }, { ...sender, id: 'other' }, { ...sender, url: sender.url.replace('index.html', 'index.html.fake') }, { ...sender, url: sender.url.replace('owner/', 'other/') }]) assert.equal(workerMessageAllowed(message, variant, origin), false);
    assert.equal(workerMessageAllowed({ ...message, url: 'https://other.test/' }, sender, origin), false);
    assert.equal(workerMessageAllowed({ type: 'timer' }, sender, origin), false);
    assert(workerMessageAllowed({ type: 'timer' }, { ...sender, url: origin + 'newtab/index.html' }, origin));
  } finally { globalThis.chrome = previous; }
});

test('provider JSON enforces announced and actual streamed byte limits', async () => {
  assert.deepEqual(await readJSON(new Response('{"text":"<img onerror=x>"}')), { text: '<img onerror=x>' });
  await assert.rejects(readJSON(new Response('{}', { headers: { 'content-length': '1000' } }), 100), /too large/);
  let cancelled = false;
  const stream = new ReadableStream({ start(c) { c.enqueue(new Uint8Array(60)); c.enqueue(new Uint8Array(60)); }, cancel() { cancelled = true; } });
  await assert.rejects(readJSON(new Response(stream), 100), /too large/);
  assert(cancelled);
  await assert.rejects(readJSON(new Response('not JSON')));
});

test('provider deadline and user cancellation propagate without leaking timers', async () => {
  const parent = new AbortController(), request = deadline(parent.signal, 1000);
  parent.abort(); assert(request.signal.aborted); request.dispose();
  const timed = deadline(undefined, 10);
  await new Promise(resolve => timed.signal.addEventListener('abort', resolve, { once: true }));
  assert.equal(timed.signal.reason.name, 'TimeoutError'); timed.dispose();
});

test('backup envelope budget covers base64 expansion of the whole allowed plaintext', () => {
  assert(MAX_ENCRYPTED_BYTES >= Math.ceil((MAX_BACKUP_BYTES + 16) / 3) * 4 + 512);
});

test('raster headers expose dimensions before native decoding and reject active formats', () => {
  const png = new Uint8Array(24), view = new DataView(png.buffer);
  png.set([137,80,78,71,13,10,26,10]); png.set([73,72,68,82], 12);
  view.setUint32(16, 100000); view.setUint32(20, 100000);
  assert.deepEqual(rasterDimensions(png, 'image/png'), [100000, 100000]);
  assert.throws(() => rasterDimensions(new TextEncoder().encode('<svg onload=alert(1)>'), 'image/png'));
  assert.throws(() => rasterDimensions(png, 'image/svg+xml'));
});

test('bundled Chart rejects prototype paths and unsafe route names while ordinary defaults work', async () => {
  const context = vm.createContext({});
  vm.runInContext(await fs.readFile('vendor/chart.js/4.4.8/chart.umd.js', 'utf8'), context);
  for (const method of ['set', 'get', 'describe', 'override']) for (const path of ['__proto__', 'constructor.prototype', 'plugins.__proto__.x']) assert.throws(() => vm.runInContext(`Chart.defaults.${method}('${path}', {auditPolluted:true})`, context), /Unsafe/);
  assert.throws(() => vm.runInContext(`Chart.defaults.route('', '__proto__', '', 'color')`, context), /Unsafe/);
  vm.runInContext(`Chart.defaults.set('plugins.oneflow', {enabled:true})`, context);
  assert.equal(vm.runInContext(`Chart.defaults.get('plugins.oneflow').enabled`, context), true);
  assert.equal(vm.runInContext(`Object.prototype.auditPolluted`, context), undefined);
  assert.equal(vm.runInContext(`Chart.defaults.constructor.prototype.auditPolluted`, context), undefined);
});

test('corrupt preview JSON is preserved and quota failure never discards its original', () => {
  const previous = globalThis.localStorage;
  const values = new Map([['oneflow', '{broken']]);
  globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
  try {
    assert.equal(read('oneflow'), undefined);
    assert.equal(values.get('oneflow-recovery:oneflow'), '{broken');
    values.set('oneflow', '{still-broken');
    localStorage.setItem = () => { throw new Error('quota'); };
    assert.throws(() => read('oneflow'), /quota/);
    assert.equal(values.get('oneflow'), '{still-broken');
  } finally { globalThis.localStorage = previous; }
});

test('Notes preferences reject invalid containers and bound labels consistently with notes', () => {
  assert.equal(normalize(null).theme, 'light');
  assert.deepEqual(normalize({ theme: 'bad', labels: ['x'.repeat(100), null, ' ok ', 'ok'] }).labels, ['x'.repeat(40), 'ok']);
});

test('support contact cannot inject mail parameters or executable schemes', () => {
  assert.equal(supportLink({ supportEmail: 'owner@example.test' }), 'mailto:owner@example.test');
  for (const supportEmail of ['x@example.test?body=secret', 'x@example.test\nBcc:other@example.test', 'javascript:alert(1)']) assert.equal(supportLink({ supportEmail }), null);
});

test('system notification denial is safe and does not call the privileged API', async () => {
  const previous = globalThis.chrome;
  let calls = 0;
  globalThis.chrome = { permissions: { contains: async () => false }, notifications: { create: async () => { calls++; } } };
  try { assert.equal(await notify('test', { title: 'Test' }), false); assert.equal(calls, 0); }
  finally { globalThis.chrome = previous; }
});

test('release inventory excludes unused libraries and internal reports and matches the source tree', async () => {
  const files = await releaseFiles(process.cwd());
  assert(files.includes('components/notes/capture.html'));
  assert(files.includes('vendor/chart.js/4.4.8/chart.umd.js'));
  assert(!files.some(file => /vendor\/(lucide|sortablejs|canvas-confetti)\/|components\/unsplash\/|docs\/security-audit\//.test(file)));
});
