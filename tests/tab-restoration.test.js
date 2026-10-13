import test from 'node:test';
import assert from 'node:assert/strict';

test('restoring again during a URL-less tab commit does not duplicate work; navigation and closure release the entry',async()=>{
  const chromeDescriptor=Object.getOwnPropertyDescriptor(globalThis,'chrome'),navigatorDescriptor=Object.getOwnPropertyDescriptor(globalThis,'navigator');
  let tabs=[],nextId=10,queue=Promise.resolve();const created=[];
  Object.defineProperty(globalThis,'chrome',{configurable:true,value:{runtime:{id:'fixture'},permissions:{contains:async()=>true},tabs:{query:async()=>structuredClone(tabs),create:async value=>{created.push(value);const tab={id:++nextId,url:'',status:'loading'};tabs.push(tab);return structuredClone(tab);}}}});
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{locks:{request(_name,action){const next=queue.then(action);queue=next.catch(()=>{});return next;}}}});
  try{
    const {reopenTabs}=await import('../core/work-context.js?tab-commit-regression'),saved=[{title:'Research',url:'https://example.test/research'}];
    const results=await Promise.all([reopenTabs(saved),reopenTabs(saved)]);
    assert.deepEqual(results,[{opened:1,failed:0},{opened:0,failed:0}]);assert.equal(created.length,1);assert.equal(created[0].active,false);
    tabs[0].url='https://example.test/another-page';
    assert.equal((await reopenTabs(saved)).opened,1);assert.equal(created.length,2);
    tabs=[];assert.equal((await reopenTabs(saved)).opened,1);assert.equal(created.length,3);
  }finally{if(chromeDescriptor)Object.defineProperty(globalThis,'chrome',chromeDescriptor);else delete globalThis.chrome;if(navigatorDescriptor)Object.defineProperty(globalThis,'navigator',navigatorDescriptor);else delete globalThis.navigator;}
});
