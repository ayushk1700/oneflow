import { getAll, put } from './db.js';
import { uid } from './utils.js';
import { activeSpaceId } from './storage.js';

/** Update a dated entry without assuming its saved ID is the date.
 * @param {string} date @param {(entry: object|undefined) => object} change
 * @returns {Promise<object>} */
export async function updateJournal(date, change, notebook='Journal') {
  const owner=activeSpaceId();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Choose a valid journal date.');
  return navigator.locks.request('oneflow-journal-' + date, () => navigator.locks.request('oneflow-backup', async () => {
    if(owner!==activeSpaceId())throw new Error('Space changed. Reopen the journal to save.');
    const existing = (await getAll('journal',{space:owner})).find(entry => entry.date === date && (entry.notebook||'Journal')===notebook);
    const values = change(existing);
    if (typeof values.text !== 'string' || values.text.length > 20000) throw new Error('This journal entry is full. Save your words as a note instead.');
    const record = { id:existing?.id || uid(), date, notebook, prompt:existing?.prompt || '', ...values, updatedAt:Date.now() };
    await put('journal', record,owner);
    return record;
  }));
}
