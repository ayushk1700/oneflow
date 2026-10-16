import test from 'node:test';
import assert from 'node:assert/strict';
import {MAX_VIDEO_BYTES,validateVideo} from '../core/media-validation.js';
test('video validation accepts metadata above 16 MiB and at 64 MiB, rejects larger media',async()=>{
 const previous=globalThis.document;let decoded=0;
 globalThis.document={createElement:()=>{const video={videoWidth:1920,videoHeight:1080,duration:10,removeAttribute(){},load(){}};Object.defineProperty(video,'src',{set(){decoded++;queueMicrotask(()=>video.onloadedmetadata());}});return video;}};
 try{assert.equal(MAX_VIDEO_BYTES,64*1024*1024);for(const size of [20*1024*1024,MAX_VIDEO_BYTES]){const blob=new Blob([new Uint8Array(size)],{type:'video/mp4'});await validateVideo(blob);}assert.equal(decoded,2);await assert.rejects(()=>validateVideo(new Blob([new Uint8Array(MAX_VIDEO_BYTES+1)],{type:'video/mp4'})),/64 MB/);assert.equal(decoded,2);}finally{if(previous)globalThis.document=previous;else delete globalThis.document;}
});
