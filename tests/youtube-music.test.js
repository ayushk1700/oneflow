import test from 'node:test';
import assert from 'node:assert/strict';
import { embedURL } from '../components/music/index.js';
test('YouTube Music songs and short links resolve to visible privacy-enhanced players', () => {
 for (const link of ['https://music.youtube.com/watch?v=jfKfPfyJRdk','https://youtu.be/jfKfPfyJRdk','https://www.youtube.com/watch?v=jfKfPfyJRdk']) {
  const result=embedURL(link); assert.equal(result.kind,'song');const url=new URL(result.url);assert.equal(url.origin,'https://www.youtube-nocookie.com');assert.equal(url.pathname,'/embed/jfKfPfyJRdk');assert.equal(url.searchParams.get('controls'),'1');assert(!url.searchParams.has('autoplay'));
 }
});
test('YouTube Music playlists stay provider-controlled',()=>{const result=embedURL('https://music.youtube.com/playlist?list=PL12345678901');assert.equal(result.kind,'playlist');assert.equal(new URL(result.url).searchParams.get('list'),'PL12345678901');});
test('music links reject hostile origins, credentials and malformed song ids',()=>{for(const link of ['https://music.youtube.com.evil.test/watch?v=jfKfPfyJRdk','https://user:secret@music.youtube.com/watch?v=jfKfPfyJRdk','javascript:alert(1)','http://youtu.be/jfKfPfyJRdk','https://music.youtube.com/watch?v=invalid'])assert.equal(embedURL(link),null);});
