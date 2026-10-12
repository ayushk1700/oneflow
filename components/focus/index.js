import { t } from '../../core/i18n.js';
import { get, set } from '../../core/storage.js';
import { dayKey, el } from '../../core/utils.js';
import { watch, act } from '../../core/ui.js';
import { emit, on } from '../../core/events.js';
import { createSessionView } from '../session-view/index.js';
let root, session, unsubscribe, interval, offReflection, reflecting = false;
/** Render the single dashboard session and independent daily completion control. */
export function render() {
  if (!root) return;
  session.render();
  const data = get(), timer = data.timer;
  document.documentElement.dataset.activity = reflecting ? 'reflection' : timer.phase !== 'focus' ? 'break' : timer.sessionId ? 'focus' : 'home';
  let label = root.querySelector('.daily-focus-complete');
  if (data.focus.date !== dayKey() || !data.focus.text) { label?.remove(); return; }
  if (!label) {
    const complete = el('input', { type: 'checkbox', onchange: act(async event => {
      await set('focus', { ...get().focus, completed: event.target.checked });
      if (event.target.checked) emit('celebrate');
    }) });
    label = el('label', { class: 'daily-focus-complete row' }, complete, t('Mark daily focus complete'));
    root.append(label);
  }
  label.querySelector('input').checked = data.focus.completed;
}
/** Mount the shared session view without a separate timer instance. @param {HTMLElement} node */
export function init(node) {
  root = node; session = createSessionView(); root.replaceChildren(session.root);
  offReflection = on('reflection:active', value => { reflecting = value; render(); });
  unsubscribe = watch(data => [data.focus, data.timer, data.timerConfig, data.tasks, data.settings.widgets.timer], render);
  interval = setInterval(render, 1000); render();
}
export function destroy() {
  unsubscribe?.(); offReflection?.(); clearInterval(interval); session?.destroy(); root?.replaceChildren(); root = null;
  delete document.documentElement.dataset.activity;
}
