export const MEDIA_LIMIT = 8 * 1024 * 1024;
export const MEDIA_TYPES = /^(image\/(png|jpeg|webp)|audio\/(webm|ogg|mp4)(;codecs=[\w,-]+)?)$/;
/** Accept only ordinary web links; never executable or extension URLs. */
export function noteURL(value) {
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : ''; } catch { return ''; }
}
/** Validate persisted/imported records before they reach storage or rendering. */
export function validateNote(n) {
  const str = (v, max) => typeof v === 'string' && v.length <= max;
  if(n?.notebook!==undefined&&!str(n.notebook,60)||n?.mood!==undefined&&!str(n.mood,40))throw new Error('Invalid note notebook or mood.');
  if (!n || n.schemaVersion !== 1 || !str(n.id, 100) || !n.id || !str(n.title, 120) || !str(n.text, 50000)
    || !['note', 'checklist', 'task'].includes(n.kind) || !['active', 'archive', 'trash'].includes(n.state)
    || typeof n.pinned !== 'boolean' || !Number.isInteger(n.revision) || n.revision < 1
    || ![n.createdAt, n.updatedAt].every(v => Number.isFinite(v) && v >= 0)
    || !(n.reminderAt === null || Number.isFinite(n.reminderAt) && n.reminderAt > 0)
    || !str(n.url, 4096) || (n.url && noteURL(n.url) !== n.url)
    || !Array.isArray(n.labels) || n.labels.length > 20 || n.labels.some(v => !str(v, 40))
    || !Array.isArray(n.items) || n.items.length > 500 || n.items.some(v => !v || !str(v.text, 2000) || typeof v.checked !== 'boolean')
    || !Array.isArray(n.media) || n.media.length > 20 || n.media.some(v => !str(v, 100))) throw new Error('Invalid note or note limit exceeded.');
  return n;
}
/** Validate media metadata and its local binary payload. */
export function validateNoteMedia(m) {
  if (!m || typeof m.id !== 'string' || m.id.length > 100 || typeof m.noteId !== 'string' || m.noteId.length > 100
    || !(m.blob instanceof Blob) || !MEDIA_TYPES.test(m.blob.type) || m.blob.size > MEDIA_LIMIT || !m.blob.size) throw new Error('Use PNG, JPEG, WebP or recorded audio up to 8 MB.');
  return m;
}
