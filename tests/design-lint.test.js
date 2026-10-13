import test from 'node:test';
import assert from 'node:assert/strict';
import {inspect} from '../scripts/design-lint.js';
test('design lint rejects decorative literals and malformed token references',()=>{
  const issues=inspect('.a { color:#fff; gap:7px; border-radius:1.2rem; transition:opacity 99ms; z-index:99; font-size:1.1rem; animation:fade var(--var(--ease)); }','example.css');
  for(const rule of ['raw-color','raw-length','raw-radius','raw-motion','raw-layer','raw-type','invalid-token'])assert(issues.some(x=>x.rule===rule),rule);
});
test('design lint permits token consumers and responsive media conditions',()=>{
  assert.deepEqual(inspect('@media(max-width:700px) { .a { margin:0 var(--space-md); width:calc(var(--space-xs) * 40); border:var(--stroke) solid var(--border); } }','example.css'),[]);
});
test('stored color exception cannot hide a new decorative color',()=>{
  assert.equal(inspect("const a='#c9d9b5', b='#123456';",'core/schema.js').length,1);
  assert(inspect("node.style.padding='13px'",'example.js').length);
  assert(inspect('<p style="color:red">Oops</p>','example.html').length);
});
