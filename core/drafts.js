import { t as translate } from './i18n.js';
import { get, update } from './storage.js';
/** Read only explicitly supported draft fields. @param {string} key @returns {string} */
export const readDraft = key => get().drafts[key] || '';
/** Save an unfinished field through the versioned storage boundary. @param {string} key @param {string} value */
export async function saveDraft(key, value) { await update(d => { if (value) d.drafts[key] = value; else delete d.drafts[key]; }); }
/** Bind an input to an autosaved draft without persisting unrelated fields. */
export function bindDraft(input, key, status) {
  const restored = readDraft(key);
  if (restored) { input.value = restored; if (status) status.textContent = translate('m0217'); }
  input.addEventListener('input', () => {
    if (status) status.textContent = translate('m0631');
    saveDraft(key, input.value).then(() => { if (status) status.textContent = input.value ? translate('m0218') : ''; }).catch(error => { if (status) status.textContent = error.message; });
  });
}
