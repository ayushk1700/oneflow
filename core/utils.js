/** Create a DOM node with text-safe children and attributes. */
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'class') node.className = value;
    else if (key.startsWith('on')) node.addEventListener(key.slice(2).toLowerCase(), value);
    else if (key === 'checked' || key === 'disabled' || key === 'hidden') node[key] = value;
    else if (value !== undefined && value !== null) node.setAttribute(key, value);
  }
  node.append(...children.filter(x => x !== null && x !== undefined));
  return node;
}
/** Local calendar date, unaffected by UTC boundaries. */
export function dayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export const uid = () => crypto.randomUUID();
export const inputActive = target => target.closest('input:not([type=checkbox]):not([type=radio]), textarea, select, [contenteditable=true]');
/** Load trusted bundled UMD libraries only when a feature needs them. */
const loaded = new Map();
export function loadScript(path) {
  if (!loaded.has(path)) loaded.set(path, new Promise((resolve, reject) => {
    const script = el('script', { src: new URL(path, import.meta.url).href });
    script.onload = resolve;
    script.onerror = () => { loaded.delete(path); script.remove(); reject(new Error('A bundled library could not be loaded.')); };
    document.head.append(script);
  }));
  return loaded.get(path);
}
/** Download a local export without transmitting data. */
export function download(blob, name) {
  const url = URL.createObjectURL(blob), link = el('a', { href: url, download: name });
  link.click(); setTimeout(() => URL.revokeObjectURL(url), 10000);
}
