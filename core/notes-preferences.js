/** Normalize the small preferences document independently of note content. */
export function normalize(value = {}) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) value = {};
  return { schemaVersion: 2, view: value.view === 'list' ? 'list' : 'grid', theme: value.theme === 'dark' ? 'dark' : 'light',
    labels: [...new Set((Array.isArray(value.labels) ? value.labels : []).filter(label => typeof label === 'string').map(label => label.trim().slice(0, 40)).filter(Boolean))].slice(0, 100) };
}
