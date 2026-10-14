import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('worker storage helpers and database use preloaded modules', async () => {
  const previousChrome=globalThis.chrome;
  const values={notesPreferences:{view:'list'},focusWork:{marker:'saved'}};
  globalThis.chrome={storage:{local:{get:async key=>({[key]:values[key]}),set:async value=>Object.assign(values,value)}}};
  try {
    const storage=await import('../core/storage.js');
    let normalized=0,validated=0;
    const work={migrateWork:value=>({...value}),validateWork:()=>validated++};
    const notes={normalize:value=>{normalized++;return {...value,preloaded:true};}};
    storage.useStorageSchemas({work,notes});
    assert.equal((await storage.getNotesPreferences()).preloaded,true);
    await storage.setNotesPreferences({view:'grid'});
    assert.equal(normalized,2);
    assert.equal((await storage.readWork()).marker,'saved');
    await storage.updateWork(value=>{value.marker='changed';});
    assert.equal(validated,1);
    assert.equal(values.focusWork.marker,'changed');
    const db=await import('../core/db.js');
    db.useDatabaseDriver({getAll:async(store,options)=>({store,space:options.space})});
    assert.deepEqual(await db.getAll('notes'),{store:'notes',space:'default'});
  } finally {globalThis.chrome=previousChrome;}
});

test('MV3 entry statically imports and registers drivers before starting Notes',async()=>{
  const source=await fs.readFile(new URL('../background/service-worker.js',import.meta.url),'utf8');
  assert.match(source,/import \* as database from '\.\.\/core\/database-store\.js'/);
  assert.match(source,/import \* as workSchema from '\.\.\/core\/work-schema\.js'/);
  assert.match(source,/import \* as notesPreferences from '\.\.\/core\/notes-preferences\.js'/);
  for(const marker of ['storage.useStorageSchemas(','useDatabaseDriver(database)'])assert(source.indexOf(marker)<source.indexOf('initNotesService();'));
  assert(!/\bimport\s*\(/.test(source));
  assert(!/\bimport\s*\(/.test(await fs.readFile(new URL('../background/focus-service.js',import.meta.url),'utf8')));
});
