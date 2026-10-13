import { captureNote, listNotes, remindNote } from '../core/notes.js';
import { sessionGet, sessionSet } from '../core/storage.js';
import { notify } from '../core/system-notifications.js';
import { record } from '../core/notifications.js';
const PAGE = 'components/notes/capture.html';
const PREFIX = 'oneflow-note-';
let scheduling = Promise.resolve();
const captureFromMenu = (info, tab) => {
  if (info.menuItemId === 'oneflow-capture') openCapture(tab, { title: tab?.title || '', text: info.selectionText || '', url: info.linkUrl || info.pageUrl || '' }).catch(console.error);
};
function bindContextMenu() {
  const clicked = chrome.contextMenus?.onClicked;
  if (clicked && !clicked.hasListener(captureFromMenu)) clicked.addListener(captureFromMenu);
}

/** Runs only in Chrome's isolated content-script world after an explicit gesture. */
export async function mountCapture(frameURL, token) {
  if (globalThis.__oneflowCapture?.isConnected) {
    globalThis.__oneflowCaptureFrame?.focus(); return true;
  }
  const previous = document.activeElement;
  const host = document.createElement('div');
  globalThis.__oneflowCapture = host;
  host.tabIndex = -1;
  host.style.cssText = 'all:initial!important;position:fixed!important;inset:16px 16px auto auto!important;width:min(760px,calc(100vw - 32px))!important;height:min(760px,calc(100dvh - 32px))!important;max-width:calc(100vw - 16px)!important;max-height:calc(100dvh - 16px)!important;z-index:2147483647!important;display:block!important;';
  const shadow = host.attachShadow({ mode: 'closed' });
  const frame = document.createElement('iframe');
  globalThis.__oneflowCaptureFrame = frame;
  frame.title = 'ONEFLOW notes and quick capture'; frame.src = frameURL;
  frame.allow = 'microphone';
  frame.style.cssText = 'width:100%;height:100%;border:0;display:block;color-scheme:normal;';
  shadow.append(frame); document.documentElement.append(host);
  let x = Math.max(0, innerWidth - host.offsetWidth - 16), y = 16;
  let ready;
  const loaded = new Promise(resolve => { ready = resolve; });
  const timeout = setTimeout(() => { cleanup(); ready(false); }, 8000);
  const cleanup = () => { clearTimeout(timeout); host.remove(); removeEventListener('message', receive); removeEventListener('resize', place); previous?.focus(); };
  const place = () => {
    x = Math.max(0, Math.min(x, innerWidth - host.offsetWidth)); y = Math.max(0, Math.min(y, innerHeight - host.offsetHeight));
    host.style.setProperty('inset', `${y}px auto auto ${x}px`, 'important');
  };
  const receive = event => {
    if (event.source !== frame.contentWindow || event.origin !== new URL(frameURL).origin || event.data?.token !== token) return;
    if (event.data.type === 'ready') { clearTimeout(timeout); ready(true); }
    if (event.data.type === 'close') cleanup();
    if (event.data.type === 'move') { x += Math.max(-100, Math.min(100, Number(event.data.x) || 0)); y += Math.max(-100, Math.min(100, Number(event.data.y) || 0)); place(); }
    if (event.data.type === 'resize') {
      host.style.setProperty('width', `${Math.max(280, Math.min(innerWidth - 16, host.offsetWidth + (Number(event.data.x) || 0)))}px`, 'important');
      host.style.setProperty('height', `${Math.max(300, Math.min(innerHeight - 16, host.offsetHeight + (Number(event.data.y) || 0)))}px`, 'important'); place();
    }
  };
  addEventListener('message', receive); addEventListener('resize', place);
  frame.focus();
  return loaded;
}

/** Open an in-page workspace where injection is allowed, otherwise a full extension tab. */
export async function openCapture(tab, capture) {
  const generation = await sessionGet('data-generation') || '';
  const note = capture ? await captureNote(capture, generation) : null;
  const token = crypto.randomUUID();
  const url = chrome.runtime.getURL(PAGE);
  let source;
  if (tab?.id && /^https?:/.test(tab.url || '')) {
    try {
      const result = await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: () => ({ title: document.title.slice(0, 120), text: String(getSelection()).slice(0, 50000), url: location.href }) });
      source = result[0]?.result;
    } catch { /* Protected pages use the full workspace without page capture. */ }
  }
  const launchKey = `notes-launch-${tab?.id}`;
  await navigator.locks.request('oneflow-backup', async () => {
    if ((await sessionGet('data-generation') || '') !== generation) throw new Error('Data was replaced. Invoke capture again.');
    await sessionSet(launchKey, { token, tabId: tab?.id, expires: Date.now() + 60000, source });
  });
  await chrome.alarms.create(`oneflow-capture-expiry-${tab?.id}`, { when: Date.now() + 60000 });
  const suffix = `#token=${token}${note ? `&note=${encodeURIComponent(note.id)}` : ''}`;
  try {
    if (!tab?.id || !/^https?:/.test(tab.url || '')) throw new Error('Protected browser page');
    const result = await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: mountCapture, args: [url + suffix, token] });
    if (!result[0]?.result) throw new Error('Page policy blocked the overlay');
  } catch (error) {
    await sessionSet(launchKey, null);
    console.warn('Notes overlay unavailable:', error.message);
    await chrome.tabs.create({ url: url + (note ? `#note=${encodeURIComponent(note.id)}&fallback=1` : '#fallback=1') });
  }
}

/** Rebuild one-shot alarms from durable notes, including reminders missed while closed. */
export function scheduleNoteReminders() {
  scheduling = scheduling.catch(() => {}).then(async () => {
    const notes = await listNotes(), expected = new Set();
    for (const n of notes) if (n.state !== 'trash' && n.reminderAt) {
      const name = PREFIX + n.id; expected.add(name);
      const old = await chrome.alarms.get(name);
      if (!old || old.scheduledTime !== n.reminderAt) await chrome.alarms.create(name, { when: Math.max(Date.now() + 1000, n.reminderAt) });
    }
    for (const a of await chrome.alarms.getAll()) if (a.name.startsWith(PREFIX) && !expected.has(a.name)) await chrome.alarms.clear(a.name);
  });
  return scheduling;
}

/** Register capability-checked messages. Web pages receive no notes data API. */
export function initNotesService() {
  chrome.action.onClicked.addListener(tab => openCapture(tab).catch(console.error));
  chrome.commands.onCommand.addListener(async (command, tab) => {
    if (command === 'open-notes') await openCapture(tab || (await chrome.tabs.query({ active: true, currentWindow: true }))[0]).catch(console.error);
  });
  chrome.runtime.onMessage.addListener((message, sender, respond) => {
    if (sender.id !== chrome.runtime.id || message?.target !== 'notes-worker') return false;
    const source = sender.url?.split(/[?#]/)[0];
    if (![chrome.runtime.getURL(PAGE), chrome.runtime.getURL('newtab/index.html')].includes(source)) return false;
    (async () => {
      if (message.type === 'authorize') {
        return navigator.locks.request('oneflow-backup', async () => {
        const key = `notes-launch-${sender.tab?.id}`;
        const grant = await sessionGet(key);
        if (grant?.expires < Date.now()) await sessionSet(key, null);
        if (!grant || grant.token !== message.token || grant.tabId !== sender.tab?.id || grant.expires < Date.now()) throw new Error('Open Notes using the extension toolbar.');
        await sessionSet(key, null);
        return { ok: true, capture: grant.source };
        });
      } else if (message.type === 'schedule') await scheduleNoteReminders();
      else if (message.type === 'context-menu') {
        if (!await chrome.permissions.contains({ permissions: ['contextMenus'] })) throw new Error('Context menu permission is required.');
        bindContextMenu();
        await chrome.contextMenus.removeAll();
        if (message.enabled) await new Promise((resolve, reject) => chrome.contextMenus.create({ id: 'oneflow-capture', title: 'Save to ONEFLOW notes', contexts: ['page', 'selection', 'link'], documentUrlPatterns: ['http://*/*', 'https://*/*'] }, () => {
          if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message)); else resolve();
        }));
      } else throw new Error('Unknown notes action.');
      return { ok: true };
    })().then(respond, error => respond({ ok: false, error: error.message })); return true;
  });
  bindContextMenu();
  chrome.permissions.onAdded.addListener(bindContextMenu);
  chrome.alarms.onAlarm.addListener(async alarm => {
    if (alarm.name.startsWith('oneflow-capture-expiry-')) {
      const key = `notes-launch-${alarm.name.slice('oneflow-capture-expiry-'.length)}`, grant = await sessionGet(key);
      if (grant && grant.expires <= Date.now()) await sessionSet(key, null);
      return;
    }
    if (!alarm.name.startsWith(PREFIX)) return;
    try {
      await remindNote(alarm.name.slice(PREFIX.length), async note => {
        await record(`Note reminder: ${note.title || 'A saved note is ready to revisit.'}`, 'info', `${alarm.name}-${note.reminderAt}`);
        await notify(alarm.name, { type: 'basic', iconUrl: chrome.runtime.getURL('assets/icons/icon-128.png'), title: 'ONEFLOW note reminder', message: note.title || 'A saved note is ready to revisit.' });
      });
    } catch (error) { console.warn('Note reminder:', error.message); await scheduleNoteReminders(); }
  });
  const openReminder = id => { if (id.startsWith(PREFIX)) chrome.tabs.create({ url: chrome.runtime.getURL(PAGE) + '#note=' + encodeURIComponent(id.slice(PREFIX.length)) }); };
  const bindNotifications = () => { const clicked = chrome.notifications?.onClicked; if (clicked && !clicked.hasListener(openReminder)) clicked.addListener(openReminder); };
  bindNotifications(); chrome.permissions.onAdded.addListener(bindNotifications);
  chrome.tabs.onRemoved.addListener(tabId => sessionSet(`notes-launch-${tabId}`, null).catch(() => {}));
  scheduleNoteReminders().catch(error => console.warn('Note alarms:', error.message));
}
