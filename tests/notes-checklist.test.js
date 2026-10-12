import test from 'node:test';
import assert from 'node:assert/strict';
import { checklistItems, checklistText } from '../components/notes/checklist.js';
test('checklists preserve completion and plain text through existing notes storage',() => {
  const items=[{checked:false,text:'Read <script>literally</script>'},{checked:true,text:'Write a thought'}];
  assert.deepEqual(checklistItems(checklistText(items)),items);
  assert.deepEqual(checklistItems('- [X] Complete\n- [ ] '),[{checked:true,text:'Complete'},{checked:false,text:''}]);
});
test('legacy prose and mixed Markdown remain ordinary notes',() => {
  for (const text of ['', '# Notes\nA quiet idea', '- a bullet', '- [ ] List\nPlain paragraph']) assert.equal(checklistItems(text),null);
  assert.equal(checklistText([{checked:false,text:'One\ntwo\rthree'}]),'- [ ] One two three');
});
