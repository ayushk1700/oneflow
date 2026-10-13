import { get, subscribe } from '../../core/storage.js';
import { readDraft, saveDraft } from '../../core/drafts.js';
import { getAll } from '../../core/db.js';
import { updateJournal } from '../../core/journal.js';
import { el, dayKey, download } from '../../core/utils.js';
import { resumePanel, panelRequest, openPanel, closePanel, icon, act } from '../../core/ui.js';
import { journalSettings } from './settings.js';
let root, refresh;
const dateText = date => new Date(date + 'T12:00:00').toLocaleDateString(undefined, { weekday:'short', year:'numeric', month:'short', day:'2-digit' });
export function render() { refresh?.(); }
/** Open the journal's full-page writing space and its private settings rail. */
export async function open() {
  if (resumePanel('journal')) { refresh?.(); return; }
  const isCurrent = panelRequest(), today = dayKey();
  let entries = await getAll('journal'), selected = today, month = new Date(today + 'T12:00:00'), saveTimer, generation = 0, editVersion = 0;
  if (!isCurrent()) return;
  const prefs = () => get().settings.journal;
  const editor = el('textarea', { class:'journal-writing', 'aria-label':'Your reflection', maxlength:20000, placeholder:'Begin anywhere. This space is yours.', spellcheck:'true' });
  const status = el('span', { role:'status', class:'journal-status' }), heading = el('h3', { class:'journal-date-heading', tabindex:'-1', 'data-page-heading':'' });
  let promptValue = '';
  const calendar = el('div', { class:'journal-calendar' }), results = el('div', { class:'journal-results' });
  const search = el('input', { type:'search', 'aria-label':'Search reflections', placeholder:'Search your journal…' });
  const searchArea = el('section', { class:'journal-search stack', hidden:true }, search, results);
  const sidebar = el('aside', { class:'journal-sidebar', 'aria-label':'Journal navigation' });
  const compact = matchMedia('(max-width:700px)').matches;
  const collapse = el('button', { class:'journal-collapse', type:'button', 'aria-label':compact ? 'Show journal sidebar' : 'Hide journal sidebar', 'aria-expanded':String(!compact), onclick:() => {
    const hidden = root.dataset.sidebar !== 'hidden';
    root.dataset.sidebar = hidden ? 'hidden' : 'visible';
    collapse.setAttribute('aria-expanded',String(!hidden)); collapse.setAttribute('aria-label',hidden ? 'Show journal sidebar' : 'Hide journal sidebar');
  } },icon('layout-grid'));
  async function persist(date,text,promptValue,token) {
    if (!text.trim()) { if (token === generation) status.textContent = 'Empty draft retained. Saved entry kept.'; return; }
    await updateJournal(date,() => ({text:text.trim(),prompt:promptValue}));
    if (readDraft('journal:' + date) === text) await saveDraft('journal:' + date,'');
    entries = await getAll('journal'); if (token === generation) status.textContent = 'Saved locally'; drawCalendar(); drawResults();
  }
  async function flush() { if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; await persist(selected,editor.value,promptValue,generation); } }
  async function choose(date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date > today) return;
    await flush(); selected = date; generation++;
    const entry = entries.find(item => item.date === selected), draft = readDraft('journal:' + selected);
    editor.value = draft || entry?.text || ''; promptValue = entry?.prompt || '';
    heading.textContent = new Date(selected + 'T12:00:00').toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric',year:'numeric'});
    status.textContent = draft ? 'Draft restored' : entry ? 'Saved locally' : 'A fresh page';
    month = new Date(selected + 'T12:00:00'); drawCalendar();
    if (draft && prefs().autosave) { const token = generation, savedPrompt = promptValue; saveTimer = setTimeout(act(async () => { saveTimer = null; await persist(date,draft,savedPrompt,token); }),650); }
  }
  editor.addEventListener('input',act(async () => {
    clearTimeout(saveTimer); saveTimer = null;
    const date = selected,text = editor.value,token = generation,savedPrompt = promptValue,edit = ++editVersion;
    await saveDraft('journal:' + date,text); if (token !== generation || edit !== editVersion || !root) return;
    status.textContent = prefs().autosave ? 'Saving…' : 'Draft saved · select Save reflection to finish';
    if (prefs().autosave) saveTimer = setTimeout(act(async () => { saveTimer = null; await persist(date,text,savedPrompt,token); }),650);
  }));
  function drawCalendar() {
    const year = month.getFullYear(),index = month.getMonth();
    const picker = el('select',{ 'aria-label':'Journal month',onchange:event => { month = new Date(year,Number(event.target.value),1); drawCalendar(); } },...Array.from({ length:12 },(_,n) => el('option',{ value:n },new Date(2026,n,1).toLocaleDateString(undefined,{ month:'short' })))); picker.value = String(index);
    const yearInput = el('input',{ type:'number','aria-label':'Journal year',min:1900,max:Number(today.slice(0,4)),value:year,onchange:event => { if (event.target.validity.valid) { month = new Date(Number(event.target.value),index,1); drawCalendar(); } } });
    const move = amount => { month = new Date(year,index + amount,1); drawCalendar(); };
    const controls = el('div',{ class:'journal-calendar-controls' },el('button',{ type:'button','aria-label':'Previous month',title:'Previous month',onclick:() => move(-1) },icon('chevron-left')),picker,yearInput,el('button',{ type:'button','aria-label':'Next month',title:'Next month',onclick:() => move(1) },icon('chevron-right')));
    const days = el('div',{ class:'journal-calendar-days' });
    for (const label of ['Su','Mo','Tu','We','Th','Fr','Sa']) days.append(el('span',{ class:'journal-weekday' },label));
    const first = new Date(year,index,1).getDay();
    for (let n = 0; n < 42; n++) { const date = new Date(year,index,n - first + 1),key = dayKey(date),hasEntry = entries.some(item => item.date === key); days.append(el('button',{ type:'button',class:date.getMonth() !== index ? 'other-month' : '',disabled:key > today,'aria-label':dateText(key) + (hasEntry ? ', has entry' : ''),'aria-pressed':String(selected === key),'data-entry':String(hasEntry),onclick:act(() => choose(key)) },String(date.getDate()))); }
    calendar.replaceChildren(controls,days);
  }
  function drawResults() {
    const query = search.value.trim().toLowerCase(),rows = entries.filter(entry => !query || entry.text.toLowerCase().includes(query) || entry.date.includes(query)).sort((a,b) => b.date.localeCompare(a.date));
    results.replaceChildren(...(rows.length ? rows.map(entry => el('button',{ type:'button',class:'journal-result',onclick:act(() => choose(entry.date)) },el('strong',{},dateText(entry.date)),el('small',{},entry.text.slice(0,90)))) : [el('p',{ class:'muted' },'No matching entries yet.')]));
  }
  const action = (label,glyph,callback) => el('button',{type:'button',class:'journal-menu-action',onclick:act(callback)},icon(glyph),label);
  const save = el('button',{type:'button',class:'primary',onclick:act(async () => { clearTimeout(saveTimer); saveTimer = null; await persist(selected,editor.value,promptValue,generation); })},'Save reflection');
  const navigation = el('div',{class:'journal-navigation'},
    el('strong',{class:'journal-wordmark'},'Journal'),
    el('nav',{class:'journal-menu','aria-label':'Journal tools'},
      action('Search','search',() => { searchArea.hidden = !searchArea.hidden; if (!searchArea.hidden) { drawResults(); search.focus(); } }),
      action('Settings','sliders-horizontal',() => showSettings())),searchArea,calendar);
  const settingsArea = el('div',{hidden:true});
  function showSettings() {
    navigation.hidden = true; settingsArea.hidden = false;
    settingsArea.replaceChildren(journalSettings(() => {
      settingsArea.hidden = true; navigation.hidden = false;
      navigation.querySelector('button:last-child')?.focus();
    },async () => {
      await flush();
      download(new Blob([JSON.stringify({app:'ONEFLOW Journal',entries},null,2)],{type:'application/json'}),'oneflow-journal.json');
    },flush));
    settingsArea.querySelector('button').focus();
  }
  sidebar.append(action('Back to home','arrow-right',closePanel),navigation,settingsArea,el('div',{class:'journal-save-state'},status,save));
  root = el('div',{class:'journal-workspace','data-sidebar':compact ? 'hidden' : 'visible'},sidebar,collapse,
    el('section',{class:'journal-page','aria-label':'Journal writing'},heading,editor));
  refresh = () => {
    if (!root) return;
    const s = prefs();
    root.dataset.journalTheme = s.theme === 'auto' ? document.documentElement.dataset.theme : s.theme;
    root.dataset.journalFont = s.font;
    root.style.setProperty('--journal-size',s.fontSize + 'px');
    root.style.setProperty('--journal-width',s.width + 'px');
    save.hidden = s.autosave;
  };
  search.oninput = drawResults;
  const unsubscribe = subscribe(refresh);
  const themeObserver = new MutationObserver(() => refresh?.());
  themeObserver.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  openPanel('Journal','journal',root,() => { act(flush)(); unsubscribe(); themeObserver.disconnect(); root = null; refresh = null; },'journal',act(flush));
  refresh(); await choose(today);
}
export function init() {}
export function destroy() { root = null; refresh = null; }
