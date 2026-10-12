import test from 'node:test';
import assert from 'node:assert/strict';
import { searchPexels } from '../background/pexels.js';
import { init, update } from '../core/storage.js';
globalThis.localStorage={getItem:()=>null,setItem:()=>{}};
// Storage has a separate fake-browser harness in the integration tests; invalid
// requests are rejected before touching either storage or networking.
test('Pexels worker rejects arbitrary query payloads and media types',async()=>{for(const payload of [{query:'',kind:'photo'},{query:'x'.repeat(101),kind:'photo'},{query:'nature',kind:'https://evil.test'}])await assert.rejects(searchPexels(payload),/100 characters/);});
test('Pexels worker checks real origin grants before reading the saved key',async()=>{globalThis.chrome={permissions:{contains:async()=>false}};await assert.rejects(searchPexels({query:'nature',kind:'photo'}),/website access is missing/);delete globalThis.chrome;});

