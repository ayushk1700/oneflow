import test from 'node:test';
import assert from 'node:assert/strict';
import { embedURL } from '../components/music/index.js';
test('music permits only known HTTPS playlist embeds',()=>{
 assert.equal(embedURL('https://open.spotify.com/playlist/1234567890abc').url,'https://open.spotify.com/embed/playlist/1234567890abc');
 assert.match(embedURL('https://www.youtube.com/playlist?list=PL1234567890abc').url,/^https:\/\/www.youtube-nocookie.com\/embed\/videoseries/);
 for(const bad of ['javascript:alert(1)','https://evil.example/playlist/1234567890','https://open.spotify.com.evil.example/playlist/1234567890','http://open.spotify.com/playlist/1234567890','https://u:p@open.spotify.com/playlist/1234567890','https://www.youtube.com/watch?v=123'])assert.equal(embedURL(bad),null);
});
