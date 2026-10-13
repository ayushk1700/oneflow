import { getAll, put } from './db.js';
import { uid } from './utils.js';

/** Update a dated entry without assuming its saved ID is the date.
 * @param {string} date @param {(entry: object|undefined) => object} change
 * @returns {Promise<object>} */
export async function updateJournal(date, change) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Choose a valid journal date.');
  return navigator.locks.request('oneflow-journal-' + date, () => navigator.locks.request('oneflow-backup', async () => {
    const existing = (await getAll('journal')).find(entry => entry.date === date);
    const values = change(existing);
    if (typeof values.text !== 'string' || values.text.length > 20000) throw new Error('This journal entry is full. Save your words as a note instead.');
    const record = { id:existing?.id || uid(), date, prompt:existing?.prompt || '', ...values, updatedAt:Date.now() };
    await put('journal', record);
    return record;
  }));
}
