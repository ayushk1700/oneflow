/** Normalize a single English word for a bounded dictionary request. */
export function normalizeWord(value) {
  const word = String(value).trim().toLowerCase();
  if (!/^[a-z]+(?:['-][a-z]+)*$/.test(word) || word.length > 64) throw new Error('Enter one English word, such as focus or well-being.');
  return word;
}
const text = (value, limit = 1200) => typeof value === 'string' ? value.slice(0, limit) : '';
/** Validate and bound provider data; keep API content as plain text. */
export function parseEntries(data) {
  if (!Array.isArray(data)) throw new Error('The dictionary returned an unreadable response. Try again.');
  const entries = data.slice(0, 3).map(entry => ({
    word: text(entry?.word, 64), phonetic: text(entry?.phonetic, 120),
    meanings: (Array.isArray(entry?.meanings) ? entry.meanings : []).slice(0, 6).map(meaning => ({
      part: text(meaning?.partOfSpeech, 50),
      definitions: (Array.isArray(meaning?.definitions) ? meaning.definitions : []).slice(0, 5).map(definition => ({ definition: text(definition?.definition), example: text(definition?.example), synonyms: (Array.isArray(definition?.synonyms) ? definition.synonyms : []).filter(value => typeof value === 'string').slice(0, 8).map(value => text(value, 80)) })).filter(item => item.definition)
    })).filter(meaning => meaning.definitions.length)
  })).filter(entry => entry.word && entry.meanings.length);
  if (!entries.length) throw new Error('No definition was found. Check the spelling or try another word.');
  return entries;
}
/** Fetch definitions only after an explicit lookup and permission grant. */
export async function lookupWord(word, signal) {
  if (!navigator.onLine) throw new Error('You are offline. Reopen a word looked up in this dashboard session, or try again when connected.');
  let response;
  try { response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(normalizeWord(word))}`, { signal, credentials: 'omit', referrerPolicy: 'no-referrer' }); }
  catch (error) { if (error.name === 'AbortError') throw error; throw new Error('Could not reach the dictionary. Check your connection and try again.'); }
  if (response.status === 404) throw new Error('No definition was found. Check the spelling or try another word.');
  if (!response.ok) throw new Error('The dictionary is temporarily unavailable. Please try again later.');
  let data;
  try { data = await response.json(); } catch { throw new Error('The dictionary returned an unreadable response. Try again.'); }
  return parseEntries(data);
}
