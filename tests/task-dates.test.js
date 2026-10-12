import test from 'node:test';
import assert from 'node:assert/strict';
import { defaults, migrate, validate, SCHEMA_VERSION } from '../core/schema.js';
test('task date migration retains legacy records and validates actual optional calendar dates',()=>{
 const old=defaults();old.schemaVersion=9;old.tasks.push({id:'legacy',text:'Read a chapter',listId:'inbox',completed:false});const upgraded=migrate(old);assert.equal(upgraded.schemaVersion,SCHEMA_VERSION);assert.deepEqual(upgraded.tasks,old.tasks);validate(upgraded);
 for(const date of ['','2028-02-29','2026-12-01']){upgraded.tasks[0].dueDate=date;validate(upgraded);}
 for(const date of ['2026-02-29','2026-99-99','tomorrow',['2026-12-01']]){upgraded.tasks[0].dueDate=date;assert.throws(()=>validate(upgraded));}
});
