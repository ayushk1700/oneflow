import { get, update } from '../../core/storage.js';
import { el, uid } from '../../core/utils.js';
import { field, toggle, select, act, confirmAction } from '../../core/ui.js';
import { put, getAll, remove } from '../../core/db.js';
import { emit } from '../../core/events.js';
import { liveWallpaperCatalog } from '../../core/background-presentation.js';
import { validateVideo } from '../../core/media-validation.js';
export { validateVideo } from '../../core/media-validation.js';
const set = (group,key,value) => update(data => { data.settings[group][key] = value; });
/** Reject corrupt or unsupported files before storing them as a wallpaper. */
function slider(body,group,key,label,min,max,step=1) {
  const value = get().settings[group][key], output = el('output',{},String(value));
  const control = el('input',{ type:'range',min,max,step,value,'aria-label':label,oninput:event => { output.textContent = event.target.value; },onchange:act(event => set(group,key,Number(event.target.value))) });
  body.append(el('div',{ class:'customization-range' },field(label,control),output));
}
/** All dashboard presentation preferences live in the Settings widget. */
export function appearance(body) {
  const a = get().settings.appearance;
  slider(body,'appearance','clockSize','Clock size',80,220);
  slider(body,'appearance','clockWeight','Clock weight',300,800,50);
  slider(body,'appearance','panelOpacity','Panel opacity',80,100);
  slider(body,'appearance','overlay','Text shading',50,85);
  body.append(el('small',{class:'muted'},'A scene-aware minimum keeps text readable. Extra shading applies to Home and Focus; Ambient stays clear.'));
  slider(body,'appearance','motionSpeed','Wallpaper animation duration',10,90);
  body.append(field('Default dashboard view',select([['home','Home'],['focus','Focus'],['ambient','Ambient']],a.defaultView,act(event => set('appearance','defaultView',event.target.value)))));
  for (const [key,label] of [['showBrand','Show ONEFLOW logo'],['showDate','Show date'],['showCaption','Show landscape caption']]) body.append(toggle(label,a[key],act(event => set('appearance',key,event.target.checked))));
}
/** Journal settings are unified here rather than mixed into task management. */
export function journal(body) {
  const j = get().settings.journal;
  body.append(toggle('Autosave journal entries',j.autosave,act(event => set('journal','autosave',event.target.checked))),toggle('Show writing prompts',j.prompts,act(event => set('journal','prompts',event.target.checked))),
    field('Journal appearance',select([['light','Light paper'],['dark','Dark paper'],['auto','Follow dashboard']],j.theme,act(event => set('journal','theme',event.target.value)))),
    field('Journal typeface',select([['sans','Sans serif'],['serif','Serif'],['mono','Monospace']],j.font,act(event => set('journal','font',event.target.value)))));
  slider(body,'journal','fontSize','Journal font size',14,28);
  slider(body,'journal','width','Writing width',480,1000,20);
  body.append(el('small',{ class:'muted' },'Changes save automatically. Your journal entries stay in this browser.'));
}
/** Built-in motion and user-selected video files require no network permissions. */
export async function wallpapers(body, refresh) {
  const b = get().settings.background;
  body.append(el('h4',{},'Live wallpapers'),el('p',{ class:'muted' },'Choose an animated atmosphere or add your own silent looping video. Motion pauses in background tabs and when reduced motion is enabled.'));
  const grid = el('div',{ class:'live-wallpaper-grid' });
  for (const [id,label] of [['aurora','Aurora glow'],['dusk','Rose dusk'],['ocean','Ocean drift'],['ember','Warm embers']]) grid.append(el('button',{ type:'button',class:'live-preset live-' + id,'aria-pressed':String(b.kind === 'animated' && b.id === id),onclick:act(async () => { await update(data => { Object.assign(data.settings.background,{ kind:'animated',id,rotate:false }); }); refresh(); }) },el('span',{},label)));
  body.append(grid);
  const local = await liveWallpaperCatalog().catch(() => null);
  body.append(el('h4',{},'From livewallpaper'));
  if (!local?.length) body.append(el('p',{class:'muted'}, local ? 'No folder videos yet. Add MP4 or WebM files to livewallpaper, run npm run wallpapers, then reload the extension.' : 'The folder video catalog could not be loaded. You can still upload a video below.'));
  for (const item of local || []) body.append(el('button',{type:'button','aria-pressed':String(b.kind === 'local-video' && b.id === item.id),onclick:act(async () => {
    await update(data => { Object.assign(data.settings.background,{kind:'local-video',id:item.id,rotate:false}); }); refresh();
  })},item.name));
  const upload = el('input',{ type:'file',accept:'video/mp4,video/webm','aria-label':'Upload live wallpaper',onchange:act(async event => {
    const file = event.target.files[0]; if (!file) return;
    if (!['video/mp4','video/webm'].includes(file.type) || file.size > 16 * 1024 * 1024) throw new Error('Choose an MP4 or WebM video up to 16 MB.');
    upload.disabled = true;
    try {
      await validateVideo(file);
      const rows = await getAll('wallpapers'); if (rows.length >= 2) throw new Error('Keep up to two live wallpapers. Remove one before adding another.');
      const id = uid();
      await navigator.locks.request('oneflow-backup',async () => { await put('wallpapers',{ id,name:file.name.slice(0,100),blob:file,createdAt:Date.now() }); await update(data => { Object.assign(data.settings.background,{ kind:'video',id,rotate:false }); }); });
      refresh(); emit('toast','Live wallpaper saved locally.');
    } finally { upload.disabled = false; }
  }) });
  body.append(field('Your video wallpaper',upload,'MP4 or WebM · 16 MB maximum each · up to two files · silent playback.'));
  const rows = await getAll('wallpapers'); if (!body.isConnected) return;
  for (const row of rows) body.append(el('div',{ class:'row' },el('button',{ type:'button',class:'grow','aria-pressed':String(b.kind === 'video' && b.id === row.id),onclick:act(async () => { await update(data => { Object.assign(data.settings.background,{ kind:'video',id:row.id,rotate:false }); }); refresh(); }) },row.name),el('button',{ type:'button',onclick:() => confirmAction(body,'Remove this local video wallpaper?',async () => { await navigator.locks.request('oneflow-backup',async () => { await update(data => { if (data.settings.background.id === row.id) Object.assign(data.settings.background,{ kind:'bundled',id:'alpine' }); }); await remove('wallpapers',row.id); }); refresh(); }) },'Remove')));
}
