import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeWord, parseEntries, lookupWord } from '../components/dictionary/api.js';
test('dictionary bounds and validates word input', () => {
  assert.equal(normalizeWord(' Well-being '), 'well-being');
  for (const word of ['two words', '<script>', '../focus', 'a'.repeat(65), '']) assert.throws(() => normalizeWord(word));
});
test('dictionary treats hostile provider content as bounded plain text', () => {
  const entries = parseEntries([{ word: 'focus', meanings: [{ partOfSpeech: 'noun', definitions: [{ definition: '<script>plain text</script>', example: 'x'.repeat(2000), synonyms: [null, 'attention'] }] }] }]);
  assert.equal(entries[0].meanings[0].definitions[0].definition, '<script>plain text</script>');
  assert.equal(entries[0].meanings[0].definitions[0].example.length, 1200);
  assert.deepEqual(entries[0].meanings[0].definitions[0].synonyms, ['attention']);
  for (const data of [null, {}, [null], [{ word: 'x', meanings: {} }]]) assert.throws(() => parseEntries(data));
});
test('dictionary reports missing words and malformed responses without exposing provider HTML', async () => {
  const previous = globalThis.fetch, online = Object.getOwnPropertyDescriptor(navigator, 'onLine');
  Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
  try {
    globalThis.fetch = async () => new Response('not found', { status: 404 });
    await assert.rejects(lookupWord('unknown'), /No definition/);
    globalThis.fetch = async () => new Response('<html>bad</html>');
    await assert.rejects(lookupWord('focus'), /unreadable/);
  } finally { globalThis.fetch = previous; if (online) Object.defineProperty(navigator, 'onLine', online); else delete navigator.onLine; }
});
