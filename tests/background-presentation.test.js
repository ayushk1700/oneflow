import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { normalizeBackground, backgroundPresentation, backgroundSource, wallpaperPath } from '../core/background-presentation.js';
test('Background metadata constrains identifiers, focal points and shading', () => {
  assert.throws(() => normalizeBackground({id:'../outside',name:'Unsafe'}));
  assert.throws(() => normalizeBackground({name:'Missing identifier'}));
  const item = normalizeBackground({id:'test',name:'Test',position:[-10,Infinity],mobilePosition:[120,20],shade:.1});
  assert.deepEqual(item.position,[0,50]); assert.deepEqual(item.mobilePosition,[100,20]); assert.equal(item.shade,.54);
});
test('Unknown uploads, strong contrast and movable widgets retain conservative shading', () => {
  assert.equal(backgroundPresentation().left,.64);
  assert.equal(backgroundPresentation({shade:.54}).flow,.54);
  assert.equal(backgroundPresentation({shade:.54}).all,.54);
  assert.equal(backgroundPresentation({},true).left,.82);
});
test('Every bundled scene has optimized artwork and a small offline preview', async () => {
  const items = JSON.parse(await fs.readFile('data/backgrounds.json','utf8'));
  assert.equal(new Set(items.map(item => item.id)).size,items.length);
  for (const raw of items) {
    const item=normalizeBackground(raw);
    assert(item.position && item.mobilePosition);
    const file = item.file || `${item.id}.webp`, thumb = item.thumbnail || `${item.id}-thumb.webp`;
    const folder = item.folder==='assets'?'assets/backgrounds':'wallpaper';
    assert.equal(backgroundSource(item),`../${folder}/${encodeURIComponent(file)}`);
    assert((await fs.stat(`${folder}/${file}`)).size < (folder === 'wallpaper' ? 8*1024*1024 : 160*1024));
    assert((await fs.stat(`${folder}/${thumb}`)).size < (folder === 'wallpaper' ? 8*1024*1024 : 16*1024));
  }
});
test('Local wallpaper paths reject traversal and executable media', () => {
  assert.equal(wallpaperPath('quiet garden.webp'),'../wallpaper/quiet%20garden.webp');
  assert.equal(wallpaperPath('rain loop.webm',true),'../livewallpaper/rain%20loop.webm');
  assert.throws(() => wallpaperPath('../secret.webp'));
  assert.throws(() => wallpaperPath('poster.svg'));
  assert.throws(() => wallpaperPath('movie.mp4'));
});
