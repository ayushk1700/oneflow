/** Preserve corrupt preview data before seeding a usable replacement. @param {string} key */
export function read(key) {
  const raw = localStorage.getItem(key);
  if (!raw) return undefined;
  try { return JSON.parse(raw); }
  catch {
    // Refuse recovery if preserving the original would exceed the browser quota.
    localStorage.setItem(`oneflow-recovery:${key}`, raw);
    localStorage.removeItem(key);
    return undefined;
  }
}
/** Download preserved bytes locally; never log their contents. */
export function recoveryRecords() {
  return Object.fromEntries(Object.keys(localStorage).filter(key => key.startsWith('oneflow-recovery:')).map(key => [key, localStorage.getItem(key)]));
}
/** Explicit full deletion also removes preview recovery copies. */
export function clearRecovery() {
  for (const key of Object.keys(localStorage)) if (key.startsWith('oneflow-recovery:')) localStorage.removeItem(key);
}
