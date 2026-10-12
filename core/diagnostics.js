import { t as translate } from './i18n.js';
import { get, update, usage } from './storage.js';
import { getAll } from './db.js';
let writing = false;
/** Log a bounded category only; error text may contain private content. */
export async function recordDiagnostic(code = 'operation-failed') {
  if (writing) return;
  writing = true;
  try {
    await update(d => {
      d.diagnostics.push({
        at: Date.now(),
        code: String(code).replace(/[^a-z0-9-]/gi, '').slice(0, 80)
      });
      d.diagnostics = d.diagnostics.slice(-100);
    });
  } catch {/* A storage failure must not recursively log itself. */} finally {
    writing = false;
  }
}
/** Export counts and categories, never private records or API keys. */
export async function diagnostics() {
  const d = get();
  return {
    app: translate('m0630'),
    version: '1.0.0',
    schemaVersion: d.schemaVersion,
    at: new Date().toISOString(),
    localBytes: await usage(),
    counts: {
      tasks: d.tasks.length,
      notes: d.notes.length + (await getAll('notes')).length,
      noteAttachments: (await getAll('noteMedia')).length,
      habits: d.habits.length,
      rituals: d.rituals.length,
      sessions: (await getAll('sessions')).length,
      journal: (await getAll('journal')).length
    },
    errors: d.diagnostics
  };
}
export async function storageUsage() {
  const images = await getAll('images');
  return {
    local: await usage(),
    images: images.reduce((n, x) => n + (x.blob?.size || 0), 0),
    estimate: await navigator.storage?.estimate?.()
  };
}
