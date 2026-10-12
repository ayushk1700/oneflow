import test from 'node:test';
import assert from 'node:assert/strict';
import { makeNote } from '../core/notes.js';
import { noteURL, validateNote, validateNoteMedia, MEDIA_LIMIT } from '../core/notes-schema.js';
test('capture links cannot execute scripts, expose credentials, or open privileged pages', () => {
  for (const value of ['javascript:alert(1)', 'data:text/html,hi', 'chrome://settings', 'https://u:p@example.com', '//example.com']) assert.equal(noteURL(value), '');
  assert.equal(noteURL('https://example.com/path?q=a'), 'https://example.com/path?q=a');
});
test('versioned notes validate boundaries and preserve literal markup', () => {
  const note = makeNote({ title: '<script>literal</script>', text: '<img onerror=alert(1)>' });
  assert.equal(validateNote(note), note);
  for (const change of [{ title: 'a'.repeat(121) }, { state: 'deleted' }, { labels: ['a'.repeat(41)] }, { items: [{ checked: 'yes', text: '' }] }, { revision: NaN }, { url: 'javascript:alert(1)' }, { reminderAt: -1 }]) assert.throws(() => validateNote({ ...note, ...change }));
});
test('attachments reject active formats and enforce bounded local payloads', () => {
  const media = { id: 'm', noteId: 'n', blob: new Blob(['audio'], { type: 'audio/webm;codecs=opus' }) };
  assert.equal(validateNoteMedia(media), media);
  for (const blob of [new Blob(['<svg/>'], { type: 'image/svg+xml' }), new Blob(['x'], { type: 'text/html' }), new Blob([new Uint8Array(MEDIA_LIMIT + 1)], { type: 'image/png' }), new Blob([], { type: 'image/png' })]) assert.throws(() => validateNoteMedia({ ...media, blob }));
});
