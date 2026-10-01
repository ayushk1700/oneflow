import { get, update } from '../../core/storage.js';
import { el, uid } from '../../core/utils.js';
import { openPanel, act, confirmAction } from '../../core/ui.js';
let root;
/** Render markdown-lite as text-safe nodes. Raw HTML and executable links never run. */
export function markdown(text) {
  const container = el('div', { class: 'markdown-preview' });
  for (const line of text.split('\n')) {
    const heading = line.match(/^(#{1,3})\s+(.*)/), bullet = line.startsWith('- ');
    const node = el(heading ? `h${heading[1].length + 1}` : 'p');
    const content = heading ? heading[2] : bullet ? `• ${line.slice(2)}` : line;
    for (const part of content.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g)) {
      if (part.startsWith('**') && part.endsWith('**')) node.append(el('strong', {}, part.slice(2,-2)));
      else if (part.startsWith('`') && part.endsWith('`')) node.append(el('code', {}, part.slice(1,-1)));
      else if (part.startsWith('*') && part.endsWith('*')) node.append(el('em', {}, part.slice(1,-1)));
      else node.append(part);
    }
    container.append(node);
  }
  return container;
}
export function render() { if (root) open(); }
export function open() {
  let selected = get().notes[0]?.id;
  const search = el('input', { type: 'search', placeholder: 'Search notes', 'aria-label': 'Search notes' }), list = el('div', { class: 'note-list' }), editor = el('div', { class: 'stack' });
  const drawList = () => { const notes = get().notes.filter(n => `${n.title} ${n.text}`.toLowerCase().includes(search.value.toLowerCase())); list.replaceChildren(...notes.map(n => el('button', { class: 'note-tab', 'aria-pressed': n.id === selected, onclick: () => { selected = n.id; drawList(); drawEditor(); } }, n.title || 'Untitled note'))); };
  const drawEditor = () => {
    const note = get().notes.find(n => n.id === selected); editor.replaceChildren();
    if (!note) { editor.append(el('p', { class: 'empty-state' }, 'A place for your loose ends and bright ideas. Create a note to begin.')); return; }
    const title = el('input', { value: note.title, maxlength: 120, placeholder: 'Untitled note', 'aria-label': 'Note title' });
    const text = el('textarea', { rows: 12, maxlength: 50000, placeholder: 'A thought, a list, a beginning…', 'aria-label': 'Note text' }); text.value = note.text;
    const status = el('small', { class: 'muted', role: 'status' }, 'Saved locally'), preview = el('div');
    const save = act(async () => { status.textContent = 'Saving…'; const value = { title: title.value, text: text.value }; await update(d => { const n = d.notes.find(x => x.id === note.id); if (n) Object.assign(n, value, { updatedAt: Date.now() }); }); status.textContent = 'Saved locally'; drawList(); if (!preview.hidden) preview.replaceChildren(markdown(text.value)); });
    title.oninput = save; text.oninput = save; preview.hidden = true;
    editor.append(title, text, el('div', { class: 'row' }, status, el('button', { onclick: () => { preview.hidden = !preview.hidden; if (!preview.hidden) preview.replaceChildren(markdown(text.value)); } }, 'Preview formatting'), el('button', { onclick: () => confirmAction(editor, 'Delete this note?', async () => { await update(d => { d.notes = d.notes.filter(n => n.id !== note.id); }); selected = get().notes[0]?.id; drawList(); drawEditor(); }) }, 'Delete')), el('small', { class: 'muted' }, 'Supports # headings, **bold**, *italic*, - lists, and `code`. HTML stays plain text.'), preview);
  };
  search.oninput = drawList;
  root = el('div', { class: 'stack' }, el('div', { class: 'row' }, search, el('button', { class: 'primary', onclick: act(async () => { selected = uid(); await update(d => { d.notes.unshift({ id: selected, title: 'Untitled note', text: '', updatedAt: Date.now() }); }); drawList(); drawEditor(); editor.querySelector('input').focus(); }) }, 'New note')), list, editor);
  drawList(); drawEditor(); openPanel('Room for a thought', 'notes', root, () => { root = null; });
}
export function init() {}
export function destroy() { root = null; }
