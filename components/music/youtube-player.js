/** Local adapter for the YouTube embedded player's message transport.
 * Keeps remote executable code out of extension pages. Native player controls remain a fallback.
 * @param {HTMLIFrameElement} frame @param {(state: object) => void} changed
 */
export function connectYouTube(frame, changed) {
  const origin = new URL(frame.src).origin, id = crypto.randomUUID();
  let ready = false, disposed = false;
  const send = (event, extra = {}) => { if (!disposed) frame.contentWindow?.postMessage(JSON.stringify({ event, id, channel: 'widget', ...extra }), origin); };
  const command = (func, args = []) => { if (ready) send('command', { func, args }); };
  function listen(event) {
    if (event.source !== frame.contentWindow || event.origin !== origin || disposed) return;
    if (typeof event.data === 'string' && event.data.length > 65536) return;
    let data; try { data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data; } catch { return; }
    if (!data || typeof data !== 'object') return;
    if (data.event === 'onReady' || data.event === 'initialDelivery') {
      ready = true; clearInterval(handshake); clearTimeout(timeout);
      for (const name of ['onStateChange','onError','onAutoplayBlocked']) command('addEventListener', [name]);
      changed({ ...(data.info && typeof data.info === 'object' ? data.info : {}), ready: true });
    } else if (data.event === 'infoDelivery' && data.info && typeof data.info === 'object') changed(data.info);
    else if (data.event === 'onStateChange' && Number.isInteger(data.info)) changed({ playerState: data.info });
    else if (data.event === 'onError') { clearInterval(handshake); clearTimeout(timeout); changed({ error: Number(data.info) || 0 }); }
    else if (data.event === 'onAutoplayBlocked') changed({ blocked: true });
  }
  window.addEventListener('message', listen);
  const hello = () => send('listening');
  frame.addEventListener('load', hello);
  const handshake = setInterval(hello, 500);
  const timeout = setTimeout(() => { clearInterval(handshake); if (!ready) changed({ unavailable: true }); }, 15000);
  hello();
  return { command, destroy() { disposed = true; clearInterval(handshake); clearTimeout(timeout); window.removeEventListener('message', listen); frame.removeEventListener('load', hello); } };
}
