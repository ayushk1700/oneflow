import { el } from '../../core/utils.js';
import { emit } from '../../core/events.js';
import { act, icon } from '../../core/ui.js';

let root, immersiveButton, abort, idle;
let visible = false, immersive = false;
function wake() {
  clearTimeout(idle);
  delete document.documentElement.dataset.ambientQuiet;
  if (!visible || !immersive || document.hidden) return;
  idle = setTimeout(() => {
    // Keyboard users always keep their focused control in view.
    if (!document.querySelector('dialog[open]') && !root.contains(document.activeElement)) document.documentElement.dataset.ambientQuiet = 'true';
  }, 3500);
}
function reflectFullscreen() {
  immersive = Boolean(document.fullscreenElement);
  const label = immersive ? 'Exit immersive mode' : 'Enter immersive mode';
  immersiveButton.setAttribute('aria-pressed', String(immersive));
  immersiveButton.setAttribute('aria-label', label); immersiveButton.title = label;
  immersiveButton.replaceChildren(icon(immersive ? 'minimize' : 'maximize')); wake();
}
/** Request fullscreen directly from a click or keyboard activation. */
async function toggleImmersive(event) {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
    else throw new Error('Fullscreen is unavailable in this browser.');
    reflectFullscreen();
    if (event.detail > 0) { immersiveButton.blur(); wake(); }
  } catch (error) {
    reflectFullscreen(); emit('toast', {message:'Could not enter immersive mode. '+error.message,kind:'error'});
  }
}
/** Mount the two quiet controls only when Ambient is first opened. */
export function init() {
  if (root) return;
  abort = new AbortController();
  const home = el('button', {type:'button',class:'ambient-home','aria-label':'Back to Home',title:'Back to Home',onclick:act(async () => {
    if (document.fullscreenElement) await document.exitFullscreen();
    emit('dashboard:view','home');
  })}, icon('arrow-left'), el('span',{},'Home'));
  immersiveButton = el('button', {type:'button',class:'ambient-immersive','aria-label':'Enter immersive mode',title:'Enter immersive mode','aria-pressed':'false',onclick:toggleImmersive},icon('maximize'));
  root = el('section', {class:'ambient-interface','aria-label':'Ambient controls',hidden:true},home,immersiveButton);
  document.body.append(root);
  for (const event of ['pointermove','pointerdown','keydown','focusin','focusout','visibilitychange']) document.addEventListener(event,wake,{signal:abort.signal,passive:true,capture:true});
  document.addEventListener('fullscreenchange',reflectFullscreen,{signal:abort.signal});
}
/** Change presentation without disturbing wallpaper playback or the timer. */
export function render(active) {
  if (!root) return;
  const entering = active && !visible; visible = active; root.hidden = !active;
  if (!active) { clearTimeout(idle); delete document.documentElement.dataset.ambientQuiet; }
  else if (entering) { reflectFullscreen(); root.querySelector('.ambient-home').focus({preventScroll:true}); }
}
/** Release the controls, timeout and listeners. */
export function destroy() { clearTimeout(idle);abort?.abort();root?.remove();root=null;visible=immersive=false;delete document.documentElement.dataset.ambientQuiet; }
