/** Match the actual extension document, never a filename prefix. */
export function documentPath(sender, origin) {
  if (!sender?.url || sender.id !== globalThis.chrome?.runtime?.id) return null;
  try {
    const url = new URL(sender.url);
    const owner = new URL(origin);
    return url.protocol === owner.protocol && url.host === owner.host ? url.pathname : null;
  } catch { return null; }
}
/** Privileged worker actions accept only their specific application owners. */
export function workerMessageAllowed(message, sender, origin) {
  const path = documentPath(sender, origin);
  if (['blocked', 'override'].includes(message?.type)) {
    if (path !== '/blocked/index.html' || sender.frameId !== 0) return false;
    try { return new URL(sender.url).hash.slice(1) === message.url; } catch { return false; }
  }
  if (message?.type === 'audio-slept') return path === '/background/audio/index.html';
  return path === '/newtab/index.html' && sender.frameId === 0 && ['flow-start', 'flow-stop', 'timer', 'sync', 'test-alert', 'pexels-search'].includes(message?.type)
    || message?.type === 'sync' && path === '/components/notes/capture.html';
}
