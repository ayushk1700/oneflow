/** Display an OS notice only when the optional permission has already been granted. */
export async function notify(id, options) {
  if (!globalThis.chrome?.notifications || !await chrome.permissions.contains({ permissions: ['notifications'] })) return false;
  try { await chrome.notifications.create(id, options); return true; }
  catch { return false; } // OS denial must not block the timer or local reminder acknowledgement.
}
