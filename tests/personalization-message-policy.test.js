import test from 'node:test';
import assert from 'node:assert/strict';
import {workerMessageAllowed} from '../core/message-policy.js';
test('only Notes in the owned dashboard can command its shared timer',()=>{
 const previous=globalThis.chrome;globalThis.chrome={runtime:{id:'oneflow-test'}};
 try{
  const origin='chrome-extension://oneflow-test/',sender={id:'oneflow-test',url:origin+'components/notes/capture.html',frameId:2,tab:{url:origin+'newtab/index.html'}};
  assert.equal(workerMessageAllowed({type:'timer'},sender,origin),true);
  for(const url of ['https://example.com/newtab/index.html',origin+'newtab/index.html.evil',origin+'components/notes/capture.html','chrome-extension://another-extension/newtab/index.html'])assert.equal(workerMessageAllowed({type:'timer'},{...sender,tab:{url}},origin),false);
  assert.equal(workerMessageAllowed({type:'flow-start'},sender,origin),false);
 }finally{globalThis.chrome=previous;}
});
