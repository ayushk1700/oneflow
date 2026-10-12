import { el } from '../../core/utils.js';
import * as notes from '../../core/notes.js';
import * as storage from '../../core/storage.js';
import { noteURL, MEDIA_LIMIT } from '../../core/notes-schema.js';
import { prepareImage } from '../../core/backup.js';
import { createPlanner } from './planner.js';

const app = document.querySelector('#app'), params = new URLSearchParams(location.hash.slice(1));
const embedded = top !== self, token = params.get('token');
let board, pinnedBoard, pinnedSection, collectionTitle, sidebarLabels, nav, editor, content, status, search, stateFilter, kindFilter, labelFilter, prefs, current, channel, planner, storageOff;
let chain = Promise.resolve(), pending = 0, failed = false, mediaURLs = [], recorder, stream, recordingTimer, source, recordingBusy = false;
let cardURLs = [], section = 'notes', sortOrder = 'recent';
const unsavedMedia = new Map();
const button = (text, run, attrs = {}) => el('button', { type: 'button', ...attrs, onclick: () => action(run) }, text);
const icon = name => {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('class', 'icon');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', `../../assets/icons/lucide.svg#${name}`); svg.append(use); return svg;
};
const iconButton = (name, label, run, attrs = {}) => {
  const control = button('', run, { ...attrs, 'aria-label': label, title: label });
  control.append(icon(name)); return control;
};
const tone = note => ['yellow', 'blue', 'pink', 'green'][[...note.id].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 4];
const dateLabel = value => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
const message = (text, error = false) => { status.textContent = text; status.dataset.error = String(error); };
const action = async run => { try { await run(); } catch (error) { message(error.message, true); } };
const worker = async payload => {
  const result = await chrome.runtime.sendMessage({ target: 'notes-worker', ...payload });
  if (!result?.ok) throw new Error(result?.error || 'Could not reach ONEFLOW. Reload the extension and try again.');
  return result;
};
function parentMessage(type, values = {}) { parent.postMessage({ token, type, ...values }, '*'); }
function releaseMedia() {
  editor?.querySelectorAll('audio').forEach(audio => { audio.pause(); audio.removeAttribute('src'); audio.load(); });
  mediaURLs.forEach(URL.revokeObjectURL); mediaURLs = [];
}
function stopTracks() { stream?.getTracks().forEach(track => track.stop()); stream = null; clearTimeout(recordingTimer); }
async function leaveEditor() {
  if (recordingBusy) throw new Error('Stop and save your recording before leaving.');
  await chain;
  await planner?.flush(); planner?.clear();
  if (failed) throw new Error('Your edit has not saved. Retry saving or copy the text before leaving.');
  current = null; releaseMedia(); editor.hidden = true; board.hidden = false; app.classList.remove('editing');
  await render();
}
async function close() {
  await leaveEditor();
  if (embedded) parentMessage('close'); else location.href = chrome.runtime.getURL('newtab/index.html');
}

/** Save each input immediately in order; report success only after the IDB commit. */
function save(attachments = []) {
  for (const media of attachments) unsavedMedia.set(media.id, media);
  const draft = structuredClone(current), owner = current;
  pending++; message('Saving…');
  chain = chain.catch(() => {}).then(async () => {
    draft.revision = owner.revision;
    const media = draft.media.map(id => unsavedMedia.get(id)).filter(Boolean);
    const saved = await notes.saveNote(draft, media);
    media.forEach(m => unsavedMedia.delete(m.id));
    owner.revision = saved.revision; owner.updatedAt = saved.updatedAt;
    failed = false;
  }).catch(error => { failed = true; message(error.message + ' Your edit is still in this editor.', true); })
    .finally(() => { pending--; if (!pending && !failed) message('Saved on this device'); });
  return chain;
}

/** Render the local collection without touching the open editor. */
export async function render() {
  const all = await notes.listNotes();
  const previous = labelFilter.value;
  const knownLabels = [...new Set([...(prefs.labels || []), ...all.flatMap(n => n.labels)])].sort((a, b) => a.localeCompare(b));
  labelFilter.replaceChildren(el('option', { value: '' }, 'All labels'), ...knownLabels.map(v => el('option', { value: v }, v)));
  labelFilter.value = previous;
  if (!labelFilter.value && previous) section = 'notes';
  const active = all.filter(n => n.state === 'active');
  sidebarLabels.replaceChildren(...knownLabels.map((label, index) => {
    const item = button('', async () => { section = 'labels'; labelFilter.value = label; await leaveEditor(); }, { class: 'label-link', 'aria-label': `Show ${label} notes`, 'aria-current': section === 'labels' && labelFilter.value === label ? 'page' : 'false' });
    item.append(el('i', { class: `label-dot tone-${['pink', 'green', 'blue', 'yellow'][index % 4]}` }), el('span', {}, label), el('small', {}, String(active.filter(n => n.labels.includes(label)).length)));
    return item;
  }));
  nav.querySelectorAll('[data-section]').forEach(item => {
    item.setAttribute('aria-current', item.dataset.section === section ? 'page' : 'false');
    const count = item.querySelector('.nav-count');
    if (count) count.textContent = String(item.dataset.section==='tasks'?storage.get().tasks.length:item.dataset.section==='habits'?storage.get().habits.length:item.dataset.section === 'reminders' ? active.filter(n => n.reminderAt).length
      : item.dataset.section === 'labels' ? knownLabels.length : item.dataset.section === 'notes' ? active.length : all.filter(n => n.state === item.dataset.section).length);
  });
  const query = search.value.toLowerCase().trim();
  const focused=board.contains(document.activeElement)?document.activeElement.getAttribute('aria-label'):null;
  const filtered = all.filter(n => n.state === stateFilter.value && (section !== 'reminders' || n.reminderAt) && (!kindFilter.value || n.kind === kindFilter.value)
    && (!labelFilter.value || n.labels.includes(labelFilter.value))
    && `${n.title} ${n.text} ${n.url} ${n.labels.join(' ')} ${n.items.map(i => i.text).join(' ')}`.toLowerCase().includes(query));
  filtered.sort((a, b) => sortOrder === 'oldest' ? a.updatedAt - b.updatedAt
    : sortOrder === 'title' ? (a.title || '').localeCompare(b.title || '')
      : b.updatedAt - a.updatedAt);
  cardURLs.forEach(URL.revokeObjectURL); cardURLs = [];
  const makeCard = n => {
    const card = button('', () => edit(n.id), { class: 'note-card', 'data-tone': tone(n), 'aria-label': `Open ${n.title || 'untitled ' + n.kind}` });
    if (n.media.length) action(async () => {
      for (const id of n.media) {
        const media = await notes.getMedia(id);
        if (!media?.blob?.type.startsWith('image/') || !card.isConnected) continue;
        const url = URL.createObjectURL(media.blob); cardURLs.push(url);
        card.prepend(el('img', { class: 'card-image', src: url, alt: media.name || 'Note attachment', loading: 'lazy' }));
        break;
      }
    });
    const body = el('div', { class: 'card-body' }, el('div', { class: 'card-title' }, el('strong', {}, n.title || 'Untitled ' + n.kind), n.pinned ? icon('bookmark') : '' ));
    if (n.kind === 'checklist') body.append(el('div', { class: 'card-checklist' }, ...n.items.slice(0, 5).map(item => el('span', { class: item.checked ? 'checked' : '' }, el('i', { class: 'card-check' }, item.checked ? '✓' : ''), el('span', {}, item.text || 'New item')))));
    else if (n.text || n.url) body.append(el('p', {}, n.text || n.url));
    if (n.labels.length) body.append(el('div', { class: 'card-labels' }, ...n.labels.slice(0, 3).map(label => el('span', {}, label))));
    body.append(el('small', { class: 'card-date' }, `${dateLabel(n.updatedAt)}${n.reminderAt ? ' · Reminder' : ''}`));
    card.append(body); return card;
  };
  const pinned = stateFilter.value === 'active' ? filtered.filter(n => n.pinned) : [];
  const remaining = filtered.filter(n => !pinned.includes(n));
  pinnedSection.hidden = !!current || !pinned.length;
  pinnedBoard.dataset.view = board.dataset.view = prefs.view;
  pinnedBoard.replaceChildren(...pinned.map(makeCard));
  board.replaceChildren(...remaining.map(makeCard));
  if (stateFilter.value === 'active' && ['notes','tasks','habits'].includes(section) && !labelFilter.value) board.append(...planner.cards(query, kindFilter.value));
  if(focused)[...board.querySelectorAll('[aria-label]')].find(n=>n.getAttribute('aria-label')===focused)?.focus({preventScroll:true});
  collectionTitle.textContent = section === 'tasks'?'Tasks':section==='habits'?'Weekly habits':section === 'reminders' ? 'Reminders' : stateFilter.value === 'archive' ? 'Archive' : stateFilter.value === 'trash' ? 'Trash' : labelFilter.value ? labelFilter.value : 'All notes';
  if (!board.children.length && !pinned.length) board.append(el('div', { class: 'empty' }, icon('notebook-pen'), el('h2', {}, query ? 'No matching notes' : 'A little room for your thoughts'), el('p', { class: 'muted' }, query ? 'Try a different search.' : 'Capture a thought to get started.')));
}

async function create(kind) {
  await leaveEditor();
  section = 'notes'; stateFilter.value = 'active'; kindFilter.value = ''; labelFilter.value = '';
  if (kind === 'task' || kind === 'habit') return planner.create(kind);
  const n = await notes.saveNote(notes.makeNote({ kind, items: kind === 'note' ? [] : [{ text: '', checked: false }] }));
  await edit(n.id);
}

async function drawMedia(container, owner) {
  releaseMedia(); container.replaceChildren();
  for (const id of owner.media) {
    const media = unsavedMedia.get(id) || await notes.getMedia(id); if (current !== owner) return;
    if (!media) { container.append(el('p', {}, 'An attachment is missing. Restore it from a backup.')); continue; }
    const url = URL.createObjectURL(media.blob); mediaURLs.push(url);
    const preview = media.blob.type.startsWith('image/') ? el('img', { src: url, alt: media.name || 'Note image', loading: 'lazy' }) : el('audio', { src: url, controls: '', 'aria-label': 'Voice note' });
    container.append(el('div', { class: 'media-item' }, preview, button('Remove attachment', async () => {
      owner.media = owner.media.filter(x => x !== id); await save(); if (!failed) await drawMedia(container, owner);
    })));
  }
}

async function edit(id) {
  await leaveEditor();
  current = await notes.getNote(id); if (!current) return;
  const owner = current; board.hidden = true; pinnedSection.hidden = true; editor.hidden = false; app.classList.add('editing'); editor.replaceChildren();
  const title = el('input', { value: owner.title, maxlength: 120, placeholder: 'Title', 'aria-label': 'Note title', oninput: e => { owner.title = e.target.value; save(); } });
  const back = button('← All notes', leaveEditor);
  editor.append(el('div', { class: 'row' }, back, button('Retry save', () => save()), button('Save a copy', async () => {
    if (recordingBusy) throw new Error('Stop and save your recording before copying this note.');
    await chain;
    const copy = notes.makeNote({ ...structuredClone(owner), id: crypto.randomUUID(), revision: 1, createdAt: Date.now(), media: [] });
    const media = [];
    for (const id of owner.media) {
      const old = unsavedMedia.get(id) || await notes.getMedia(id); if (!old) continue;
      const attachment = { ...old, id: crypto.randomUUID(), noteId: copy.id }; media.push(attachment); copy.media.push(attachment.id);
    }
    const saved = await notes.saveNote(copy, media); failed = false; unsavedMedia.clear(); current = null; await edit(saved.id);
  })), title);
  if (owner.kind === 'note') {
    const text = el('textarea', { maxlength: 50000, placeholder: 'Take a note…', 'aria-label': 'Note text', oninput: e => { owner.text = e.target.value; save(); } }); text.value = owner.text; editor.append(text);
  } else {
    const list = el('div', { 'aria-label': 'Checklist items' });
    const drawItems = () => {
      list.replaceChildren(...owner.items.map((item, index) => el('div', { class: 'check-row' },
        el('input', { type: 'checkbox', checked: item.checked, 'aria-label': `Complete item ${index + 1}`, onchange: e => { item.checked = e.target.checked; save(); } }),
        el('input', { type: 'text', value: item.text, maxlength: 2000, 'aria-label': `Item ${index + 1}`, oninput: e => { item.text = e.target.value; save(); } }),
        button('↑', () => reorder(index, -1), { 'aria-label': `Move item ${index + 1} up`, disabled: index === 0 }),
        button('↓', () => reorder(index, 1), { 'aria-label': `Move item ${index + 1} down`, disabled: index === owner.items.length - 1 }),
        button('×', () => { owner.items.splice(index, 1); save(); drawItems(); list.querySelector('input[type=text]')?.focus(); }, { 'aria-label': `Remove item ${index + 1}` }))));
    };
    const reorder = (index, delta) => { [owner.items[index], owner.items[index + delta]] = [owner.items[index + delta], owner.items[index]]; save(); drawItems(); list.querySelectorAll('input[type=text]')[index + delta]?.focus(); };
    drawItems(); editor.append(list, button('Add item', () => { if (owner.items.length >= 500) throw new Error('Maximum 500 items per list.'); owner.items.push({ text: '', checked: false }); save(); drawItems(); list.querySelector('.check-row:last-child input[type=text]')?.focus(); }));
  }
  const url = el('input', { type: 'url', value: owner.url, maxlength: 4096, placeholder: 'https://…', 'aria-label': 'Source link', onchange: () => {
    if (url.value && !noteURL(url.value)) { message('Enter an http or https link.', true); return; }
    owner.url = noteURL(url.value); save(); link.href = owner.url; link.hidden = !owner.url;
  } });
  const link = el('a', { href: owner.url || '#', target: '_blank', rel: 'noopener noreferrer', hidden: !owner.url }, 'Open source ↗');
  const labels = el('input', { value: owner.labels.join(', '), maxlength: 820, placeholder: 'work, ideas', 'aria-label': 'Labels separated by commas', onchange: () => { owner.labels = [...new Set(labels.value.split(',').map(v => v.trim()).filter(Boolean))]; save(); } });
  const date = el('input', { type: 'datetime-local', 'aria-label': 'Reminder date and time', onchange: () => {
    const when = date.value ? new Date(date.value).getTime() : null;
    if (when && when <= Date.now()) { message('Choose a future reminder time.', true); return; }
    owner.reminderAt = when; save();
  } });
  if (owner.reminderAt) { const d = new Date(owner.reminderAt); date.value = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16); }
  const details = el('details', {}, el('summary', {}, 'Labels, link & reminder'), el('div', {}, el('label', {}, 'Labels', labels), el('label', {}, 'Source link', url), link, el('label', {}, 'Remind me (local time)', date), el('small', {}, 'Reminders appear while this browser is running. Missed reminders return when it opens.')));
  editor.append(details);
  const media = el('div', { class: 'media-list' }); editor.append(media); await drawMedia(media, owner);
  const attach = async (blob, name) => {
    if (current !== owner) return;
    if (owner.media.length >= 20) throw new Error('Maximum 20 attachments per note.');
    if (!blob || !blob.size || blob.size > MEDIA_LIMIT) throw new Error('Attachment must contain data and be no larger than 8 MB.');
    const attachment = { id: crypto.randomUUID(), noteId: owner.id, blob, name };
    owner.media.push(attachment.id); await save([attachment]);
    if (failed) { await drawMedia(media, owner); message('Attachment is still in memory. Keep this editor open and use Retry save.', true); return; }
    await drawMedia(media, owner);
  };
  const file = el('input', { type: 'file', accept: 'image/png,image/jpeg,image/webp', 'aria-label': 'Attach an image', onchange: () => action(async () => { if (file.files[0]) await attach(await prepareImage(file.files[0]), file.files[0].name.slice(0, 120)); file.value = ''; }) });
  const canvas = el('canvas', { width: 1200, height: 440, 'aria-label': 'Drawing canvas. Use a pointer to draw, or attach an image instead.' });
  const ctx = canvas.getContext('2d'); ctx.fillStyle = 'white'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.lineWidth = 4; ctx.lineCap = 'round';
  let drawing = false;
  const point = e => { const r = canvas.getBoundingClientRect(); return [(e.clientX - r.left) * canvas.width / r.width, (e.clientY - r.top) * canvas.height / r.height]; };
  canvas.onpointerdown = e => { canvas.setPointerCapture(e.pointerId); drawing = true; ctx.beginPath(); ctx.moveTo(...point(e)); };
  canvas.onpointermove = e => { if (drawing) { ctx.lineTo(...point(e)); ctx.stroke(); } };
  canvas.onpointerup = canvas.onpointercancel = () => { drawing = false; };
  const drawBox = el('details', {}, el('summary', {}, 'Draw a quick sketch'), el('div', {}, canvas, el('small', {}, 'Save the drawing to attach it to this note.'), el('div', { class: 'row' }, button('Save drawing', async () => { const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png')); if (blob) await attach(blob, 'Drawing'); }), button('Clear drawing', () => { ctx.fillRect(0, 0, canvas.width, canvas.height); }))));
  const record = button('Record voice note', async () => {
    if (recorder?.state === 'recording') { recorder.stop(); record.disabled = true; return; }
    if (!navigator.mediaDevices?.getUserMedia || !globalThis.MediaRecorder) throw new Error('Voice recording is unavailable in this browser.');
    if (owner.media.length >= 20) throw new Error('Remove an attachment before recording another.');
    recordingBusy = true;
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); }
    catch { recordingBusy = false; throw new Error('Microphone access was denied or blocked here. Open the full Notes tab and allow microphone access.'); }
    if (current !== owner) { stopTracks(); recordingBusy = false; return; }
    const chunks = []; let size = 0;
    try { recorder = new MediaRecorder(stream); } catch (error) { stopTracks(); recordingBusy = false; throw error; }
    recorder.ondataavailable = e => { if (e.data.size) { chunks.push(e.data); size += e.data.size; if (size > MEDIA_LIMIT && recorder.state === 'recording') recorder.stop(); } };
    recorder.onerror = () => { stopTracks(); recordingBusy = false; record.disabled = false; record.textContent = 'Record voice note'; message('Recording failed. Try again in the full Notes tab.', true); };
    recorder.onstop = () => action(async () => {
      stopTracks();
      try { await attach(new Blob(chunks, { type: recorder.mimeType }), 'Voice note'); }
      finally { recordingBusy = false; record.disabled = false; record.textContent = 'Record voice note'; }
    });
    try { recorder.start(1000); } catch (error) { stopTracks(); recordingBusy = false; throw error; }
    record.textContent = 'Stop & save recording'; message('Recording locally · maximum 2 minutes');
    recordingTimer = setTimeout(() => { if (recorder.state === 'recording') recorder.stop(); }, 120000);
  });
  const attachments = el('details', {}, el('summary', {}, 'Images, drawing & voice'), el('div', {}, file, drawBox, record,
    button('Open full Notes tab', () => chrome.tabs.create({ url: chrome.runtime.getURL('components/notes/capture.html') + '#note=' + encodeURIComponent(owner.id) })), el('small', {}, 'Audio stays on this device. No transcription or upload.')));
  editor.append(attachments);
  const pin = button(owner.pinned ? 'Unpin' : 'Pin', () => { owner.pinned = !owner.pinned; pin.textContent = owner.pinned ? 'Unpin' : 'Pin'; save(); });
  const setState = async value => { if (recordingBusy) throw new Error('Stop and save your recording first.'); owner.state = value; if (value === 'trash') owner.reminderAt = null; await save(); if (!failed) await leaveEditor(); };
  editor.append(el('div', { class: 'editor-actions' }, pin, button('Add to Tasks', async () => { await notes.sendToTasks(owner); message('Added to your ONEFLOW task inbox'); }),
    button(owner.state === 'archive' ? 'Unarchive' : 'Archive', () => setState(owner.state === 'archive' ? 'active' : 'archive'))));
  if (owner.state === 'trash') {
    const confirm = el('div', { hidden: true }, el('p', {}, 'Permanently delete this note and its attachments?'), button('Delete permanently', async () => { if (recordingBusy) throw new Error('Stop and save your recording first.'); await chain; await notes.deleteNote(owner); failed = false; await leaveEditor(); }), button('Cancel deletion', () => { confirm.hidden = true; }));
    editor.append(el('div', { class: 'danger-zone' }, button('Restore note', () => setState('active')), button('Delete forever…', () => { confirm.hidden = false; confirm.querySelector('button').focus(); }), confirm));
  } else editor.append(el('div', { class: 'danger-zone' }, button('Move to trash', () => setState('trash'))));
  title.focus(); content.scrollTop = 0;
}

function gesture(control, type) {
  let last;
  control.onpointerdown = e => { control.setPointerCapture(e.pointerId); last = { x: e.screenX, y: e.screenY }; };
  control.onpointermove = e => { if (!last) return; parentMessage(type, { x: e.screenX - last.x, y: e.screenY - last.y }); last = { x: e.screenX, y: e.screenY }; };
  control.onpointerup = control.onpointercancel = () => { last = null; };
  control.onkeydown = e => { const delta = { ArrowLeft: [-20, 0], ArrowRight: [20, 0], ArrowUp: [0, -20], ArrowDown: [0, 20] }[e.key]; if (delta) { e.preventDefault(); parentMessage(type, { x: delta[0], y: delta[1] }); } };
}

/** Initialize after validating an injected-frame capability, never from webpage input. */
export async function init() {
  if (embedded && token) source = (await worker({ type: 'authorize', token })).capture;
  else if (embedded) {
    // The only token-free parent allowed is our own dashboard.
    try { if (parent.location.origin !== location.origin) throw new Error(); } catch { throw new Error('Use the ONEFLOW toolbar to open Notes on a webpage.'); }
  }
  await notes.migrateNotes(); prefs = await storage.getNotesPreferences(); document.documentElement.dataset.notesTheme = prefs.theme;
  status = el('div', { role: 'status', 'aria-live': 'polite', class: 'status' }, params.has('fallback') ? 'This page blocks overlays. Your full notes workspace is available here.' : 'Local notes · no account, no cloud sync');
  search = el('input', { type: 'search', placeholder: 'Search notes, labels, or anything…', 'aria-label': 'Search notes', oninput: () => action(render) });
  stateFilter = el('select', { 'aria-label': 'Note location', onchange: () => action(async () => { await leaveEditor(); }) }, ...['active', 'archive', 'trash'].map(v => el('option', { value: v }, v === 'active' ? 'All notes' : v === 'archive' ? 'Archive' : 'Trash')));
  kindFilter = el('select', { 'aria-label': 'Note type', onchange: () => action(async () => { await leaveEditor(); }) }, el('option', { value: '' }, 'All types'), ...['note', 'checklist', 'task', 'habit'].map(v => el('option', { value: v }, v)));
  labelFilter = el('select', { 'aria-label': 'Filter by label', onchange: () => { section = labelFilter.value ? 'labels' : 'notes'; stateFilter.value = 'active'; action(render); } });
  pinnedBoard = el('div', { class: 'note-grid', 'aria-label': 'Pinned notes' });
  pinnedSection = el('section', { class: 'collection pinned-section', hidden: true }, el('h2', {}, icon('bookmark'), 'Pinned'), pinnedBoard);
  board = el('div', { class: 'note-grid', 'aria-label': 'Your notes' });
  collectionTitle = el('h2', {}, 'All notes');
  editor = el('section', { class: 'editor', hidden: true, 'aria-label': 'Note editor' });
  content = el('div', { class: 'content' }, pinnedSection, el('section', { class: 'collection all-section' }, el('div', { class: 'collection-heading' }, collectionTitle), board), editor);
  planner = createPlanner({ editor, button, message, leave: leaveEditor, show: () => { board.hidden = true; pinnedSection.hidden = true; editor.hidden = false; app.classList.add('editing'); content.scrollTop = 0; } });
  const drag = button('⠿', () => {}, { class: 'drag', 'aria-label': 'Move panel with arrow keys or drag', hidden: !token }); gesture(drag, 'move');
  const layout = iconButton('layout-grid', prefs.view === 'grid' ? 'List view' : 'Grid view', async () => { prefs.view = prefs.view === 'grid' ? 'list' : 'grid'; await storage.setNotesPreferences(prefs); layout.setAttribute('aria-label', prefs.view === 'grid' ? 'List view' : 'Grid view'); layout.title = layout.getAttribute('aria-label'); await render(); }, { class: 'icon-button view-button' });
  const menu = el('details', { class: 'preferences' }, el('summary', { 'aria-label': 'Options & privacy', title: 'Options & privacy' }, icon('sliders-horizontal')), el('div', {},
    button('Switch light / dark', async () => { prefs.theme = prefs.theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.notesTheme = prefs.theme; await storage.setNotesPreferences(prefs); }),
    button('Enable capture context menu', async () => { if (!await chrome.permissions.request({ permissions: ['contextMenus'] })) throw new Error('Context menu permission was not granted.'); await worker({ type: 'context-menu', enabled: true }); message('Right-click a webpage, selection, or link to capture it.'); }),
    button('Disable capture context menu', async () => { if (await chrome.permissions.contains({ permissions: ['contextMenus'] })) { await worker({ type: 'context-menu', enabled: false }); await chrome.permissions.remove({ permissions: ['contextMenus'] }); } message('Capture context menu disabled'); }),
    el('p', {}, 'Notes, images, sketches and audio stay on this device. Export them through ONEFLOW Settings → Data. Collaboration and cross-device note sync are not connected.'),
    el('p', {}, 'Suggested shortcut: Alt+Shift+N. Assign or change it in your browser’s Extension shortcuts settings if unavailable. Ctrl/Cmd+Enter creates a note; Esc returns to the collection, then closes. Move and resize controls also work with arrow keys.')));
  const capture = button('Capture page', async () => { await leaveEditor(); const n = await notes.captureNote(source); await edit(n.id); }, { hidden: !source });
  const resize = button('↘', () => {}, { class: 'resize', 'aria-label': 'Resize panel with arrow keys or drag', hidden: !token }); gesture(resize, 'resize');
  const createMenu = el('details', { class:'create-menu' }, el('summary', { 'aria-label':'Create new', title:'Create new' }, icon('plus')));
  const choices = ['Note', 'Checklist', 'Task', 'Habit'].map(label => [label, () => create(label.toLowerCase())]);
  createMenu.append(el('div', { class:'create-options' }, ...choices.map(([label,run]) => button(label, async () => { createMenu.open=false; await run(); }))));
  sidebarLabels = el('div', { class: 'sidebar-labels' });
  const navItem = (name, label, symbol) => {
    const item = button('', async () => {
      section = name; stateFilter.value = name === 'archive' || name === 'trash' ? name : 'active';
      labelFilter.value = '';kindFilter.value=name==='tasks'?'task':name==='habits'?'habit':'';await leaveEditor();
    }, { class: 'nav-link', 'data-section': name });
    item.append(icon(symbol), el('span', {}, label), el('small', { class: 'nav-count' }, '0')); return item;
  };
  nav = el('nav', { class: 'sidebar-nav', 'aria-label': 'Notes navigation' },
    navItem('notes', 'Notes', 'notebook-pen'),navItem('tasks','Tasks','list-todo'),navItem('habits','Habits','check-check'), navItem('reminders', 'Reminders', 'clock'), navItem('labels', 'Labels', 'bookmark'),
    navItem('archive', 'Archive', 'folder-plus'), navItem('trash', 'Trash', 'trash-2'));
  const newLabel = el('input', { type: 'text', maxlength: 60, placeholder: 'Label name', 'aria-label': 'New label name' });
  const labelForm = el('form', { class: 'label-form', hidden: true, onsubmit: event => action(async () => {
    event.preventDefault();
    const name = newLabel.value.trim();
    if (!name) return;
    prefs.labels = [...new Set([...(prefs.labels || []), name])];
    await storage.setNotesPreferences(prefs);
    labelForm.hidden = true; newLabel.value = '';
    section = 'labels'; stateFilter.value = 'active'; labelFilter.value = name;
    await leaveEditor();
  }) }, newLabel, button('Add', () => labelForm.requestSubmit()));
  const sidebar = el('aside', { class: 'sidebar' },
    el('div', { class: 'brand' }, el('span', { class: 'brand-mark' }, icon('notebook-pen')), el('strong', {}, 'ONEFLOW Notes')),
    nav, el('div', { class: 'labels-block' }, el('div', { class: 'labels-heading' }, el('h2', {}, 'Labels'), iconButton('plus', 'Create label', () => { labelForm.hidden = !labelForm.hidden; if (!labelForm.hidden) newLabel.focus(); }, { class: 'icon-button' })), labelForm, sidebarLabels));
  const searchBox = el('label', { class: 'search-box' }, icon('search'), search);
  const topbar = el('header', { class: 'capture-head' }, drag, searchBox, menu, button('Close', close, { class: 'close-button', 'aria-label': 'Close notes', title: 'Close notes' }));
  topbar.querySelector('.close-button').replaceChildren(icon('x'));
  const captureBar = el('div', { class: 'quick-capture' }, button('Take a note…', () => create('note'), { class: 'quick-prompt' }),
    iconButton('list-todo', 'New checklist', () => create('checklist'), { class: 'icon-button' }),
    iconButton('image', 'New note with image', async () => { await create('note'); editor.querySelector('details:has([aria-label="Attach an image"])').open = true; editor.querySelector('[aria-label="Attach an image"]')?.focus(); }, { class: 'icon-button' }),
    iconButton('ellipsis', 'More note types', () => { createMenu.open = !createMenu.open; }, { class: 'icon-button more-button' }));
  const sort = el('select', { 'aria-label': 'Sort notes', onchange: () => { sortOrder = sort.value; action(render); } },
    el('option', { value: 'recent' }, 'Most recent'), el('option', { value: 'oldest' }, 'Oldest first'), el('option', { value: 'title' }, 'Title A–Z'));
  const controls = el('div', { class: 'collection-controls' }, sort, kindFilter, labelFilter, layout);
  content.querySelector('.collection-heading').append(controls);
  const workspace = el('div', { class: 'workspace' }, sidebar, el('div', { class: 'main-column' }, topbar,
    el('div', { class: 'workspace-body' }, captureBar, capture, stateFilter, content), status, createMenu, resize));
  app.replaceChildren(workspace);
  if (token) { app.setAttribute('role', 'dialog'); app.setAttribute('aria-label', 'Notes and quick capture'); }
  storageOff = storage.subscribe(() => action(render));
  channel = new BroadcastChannel('oneflow-notes'); channel.onmessage = () => action(async () => { await render(); if (current && !pending && (await notes.getNote(current.id))?.revision !== current.revision) message('This note changed in another window. Finish or copy your draft, then reopen it.', true); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && createMenu.open) { event.preventDefault(); createMenu.open=false; createMenu.querySelector('summary').focus(); return; }
    if (event.key === 'Escape') { event.preventDefault(); action(current || planner.active ? leaveEditor : close); }
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); action(() => create('note')); }
    if (event.key === 'Tab' && embedded) {
      const controls = [...app.querySelectorAll('button,input,textarea,select,summary,a[href],audio[controls]')].filter(n => !n.disabled && n.checkVisibility());
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  addEventListener('beforeunload', event => { if (pending || failed || recordingBusy || planner.dirty) { event.preventDefault(); event.returnValue = ''; } });
  addEventListener('pagehide', destroy);
  await render(); if (params.get('note')) await edit(params.get('note')); else search.focus();
  if (token) parentMessage('ready');
}
/** Release transient resources; committed notes remain in IndexedDB. */
export function destroy() { stopTracks(); releaseMedia(); cardURLs.forEach(URL.revokeObjectURL); cardURLs = []; channel?.close(); storageOff?.(); }
init().catch(error => app.replaceChildren(el('p', { role: 'alert' }, error.message)));
