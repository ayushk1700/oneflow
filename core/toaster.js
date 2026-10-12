let host, timer, current, paused = false;
const queue = [];

function place() {
  const destination = [...document.querySelectorAll('dialog[open]')].at(-1) || document.body;
  if (host.parentElement !== destination) destination.append(host);
}
function schedule() {
  clearTimeout(timer);
  if (current && current.kind !== 'error' && !paused && !host.contains(document.activeElement)) timer = setTimeout(dismiss, 6000);
}
function dismiss() {
  clearTimeout(timer);
  if (host.contains(document.activeElement)) {
    const dialog = host.closest('dialog');
    const target = dialog && [...dialog.querySelectorAll('h2,[tabindex="-1"],button')].find(node => !host.contains(node) && !node.disabled && node.getClientRects().length);
    (target || document.querySelector('#main')).focus();
  }
  current = null; paused = false; host.hidden = true;
  if (queue.length) display(queue.shift());
}
function display(notice) {
  current = notice; place();
  host.dataset.kind = notice.kind;
  const message = host.querySelector('#toast-message');
  message.setAttribute('role', notice.kind === 'error' ? 'alert' : 'status');
  message.setAttribute('aria-atomic', 'true');
  message.textContent = '';
  host.hidden = false;
  // Expose the live region before updating its text, including the first notice.
  requestAnimationFrame(() => { if (current === notice) message.textContent = notice.message; });
  schedule();
}
/** Queue notices without replacing one the user is reading. Errors await dismissal. */
export function show(value) {
  const notice = { message: typeof value === 'string' ? value : String(value?.message || ''), kind: value?.kind || 'info' };
  if (!notice.message.trim()) return;
  if (!host) {
    host = document.querySelector('#toast');
    host.removeAttribute('role'); host.removeAttribute('aria-live');
    host.querySelector('#toast-close').onclick = dismiss;
    host.onpointerenter = () => { paused = true; clearTimeout(timer); };
    host.onpointerleave = () => { paused = false; schedule(); };
    host.onfocusin = () => clearTimeout(timer);
    host.onfocusout = () => queueMicrotask(schedule);
    // Keep notices operable inside the modal top layer, including fullscreen Flow.
    new MutationObserver(place).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['open'] });
  }
  if (current?.message === notice.message || queue.some(item => item.message === notice.message)) return;
  if (current) { if (queue.length === 5) queue.shift(); queue.push(notice); }
  else display(notice);
}
