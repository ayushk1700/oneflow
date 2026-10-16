import { t } from '../../core/i18n.js';
import { get, update } from '../../core/storage.js';
import { dayKey, el } from '../../core/utils.js';
import { act, field, button } from '../../core/ui.js';
import { bindDraft } from '../../core/drafts.js';
import { emit } from '../../core/events.js';
import { timerCommand } from '../../core/timer-client.js';
import { remaining } from '../../core/timer-logic.js';

/** Format the shared deadline without a second ticking counter. @param {number} ms */
export function timeText(ms) {
  const seconds = Math.ceil(ms / 1000);
  return String(Math.floor(seconds / 60)).padStart(2, '0') + ':' + String(seconds % 60).padStart(2, '0');
}

/** View the shared session.
 * @param {{fullscreen?: boolean, onFinish?: Function}} options
 * @returns {{root: HTMLElement, render: Function, destroy: Function}}
 */
export function createSessionView({ fullscreen = false, onFinish } = {}) {
  const root = el('section', { class: 'unified-session', 'aria-label': t('Focus session') });
  let previous = '';
  function render() {
    const data = get(), timer = data.timer;
    root.dataset.state = timer.phase !== 'focus' ? 'break' : timer.status;
    if (fullscreen && !data.flow.active) { previous = ''; root.replaceChildren(); return; }
    const active = Boolean(timer.sessionId) || timer.status !== 'idle' || timer.phase !== 'focus';
    const key = JSON.stringify([dayKey(), active, timer.phase, timer.status, timer.taskId, timer.taskTitle, timer.duration, data.focus, data.lastFocusSession, data.timerConfig.focus, data.settings.widgets.timer, data.settings.customization?.widgets?.preferences?.greeting?.focusPrompt, data.tasks.map(task => [task.id, task.text, task.completed])]);
    if (key !== previous) {
      const restoreFocus = root.contains(document.activeElement);
      previous = key;
      root.replaceChildren(el('p', { class: 'focus-label session-phase', role: 'status' }, t(active ? timer.phase !== 'focus' ? 'Break' : timer.status === 'paused' ? 'Focus paused' : 'Focus session' : 'Ready to focus')));
      if (!fullscreen && data.settings.widgets.timer) {
        const phases = el('div', { class: 'session-phases', role: 'group', 'aria-label': 'Session type' });
        for (const [phase, label] of [['focus', 'Focus'], ['short', 'Short break'], ['long', 'Long break']]) phases.append(el('button', {
          type: 'button', 'aria-pressed': String(timer.phase === phase), disabled: timer.phase !== phase && (timer.status !== 'idle' || Boolean(timer.sessionId)),
          title: timer.status !== 'idle' ? 'End the current session to change its type' : label,
          onclick: act(() => timerCommand('phase', { phase }))
        }, t(label)));
        root.append(phases);
      }
      const last = data.lastFocusSession;
      if (last && (!active || timer.phase !== 'focus') && dayKey(new Date(last.end)) === dayKey()) {
        const result=el('section',{class:'session-result','aria-label':'Your last session'});root.append(result);
        if (fullscreen) result.textContent = `Focus saved · ${Math.round(last.duration / 60000)} min`;
        else import('../session-enhancements/index.js').then(m=>{if(result.isConnected)m.summary(result,last);}).catch(error=>emit('error',error));
      }
      if (active) {
        root.append(el(fullscreen ? 'h1' : 'h2', { class: 'session-title', tabindex: -1 }, timer.phase !== 'focus' ? t('Take a breather') : timer.taskTitle || t('One thing at a time')),
          el('strong', { class: 'session-countdown' + (fullscreen ? ' flow-time' : ''), role: 'timer', 'aria-live': 'off', 'aria-label': t('Time remaining') }),
          el('progress', { max: 1, value: 0, 'aria-label': t('Session progress') }));
        const primaryLabel = timer.status === 'running' ? 'Pause' : timer.status === 'paused' ? 'Resume' : 'Start break';
        const actions = el('div', { class: 'row wrap session-actions' },
          el('button', { class: 'primary focus-start', 'aria-keyshortcuts': 'Space', onclick: act(() => timerCommand(get().timer.status === 'running' ? 'pause' : 'start')) }, t(primaryLabel)),
          el('button', { class: 'text-button focus-finish', onclick: act(() => onFinish ? onFinish() : timerCommand(timer.phase === 'focus' ? 'reset' : 'skip')) }, t(timer.phase === 'focus' ? 'Stop & save' : 'Skip break')),
          !fullscreen ? button('Sounds', 'audio-lines', () => emit('focus:sounds'), 'text-button focus-sound') : null);
        if (!fullscreen) {
          const more = el('details', { class: 'session-options' }, el('summary', {}, 'Session options'),
            el('div', { class: 'row wrap' }, button(t('Session settings'), 'sliders-horizontal', () => emit('timer:open')), el('button', { class: 'text-button', onclick: () => emit('flow:enter', { preserveScene: true }) }, t('Open Flow'))));
          for(const [id,label] of [['capsules','Save a capsule'],['recovery','Leave a resume note']]) more.append(el('button',{class:'text-button',onclick:act(async()=>{await(await import('../../core/features.js')).openFeature(id);})},label));
          if (timer.phase !== 'focus') more.append(el('button', { class: 'text-button', onclick: act(async () => { await (await import('../../core/features.js')).openFeature('reflection'); }) }, t('Reflect on your session')));
          actions.append(more);
        }
        if (!fullscreen) import('../session-enhancements/index.js').then(m=>{if(actions.isConnected)m.decorate(root,timer,false);}).catch(error=>emit('error',error));
        root.append(actions, el('small', { class: 'session-hint' }, t(timer.phase !== 'focus' ? 'Your focus time is saved.' : fullscreen ? 'Space to pause · Stop to save your time' : 'One thing at a time. Space to pause whenever you need.')));
      } else {
        const focus = data.focus.date === dayKey() && !data.focus.completed ? data.focus.text : '';
        const input = el('input', { maxlength: 240, value: focus, placeholder: data.settings.customization?.widgets?.preferences?.greeting?.focusPrompt || t('What matters today?'), 'aria-label': t('Your main focus today') });
        const status = el('small', { class: 'muted focus-draft-status', role: 'status' });
        const draftKey = 'task:daily-' + dayKey();
        bindDraft(input, draftKey, status);
        let customTitle = input.value;
        input.addEventListener('input', () => { customTitle = input.value; });
        const task = el('select', { 'aria-label': t('Choose a task') }, el('option', { value: '' }, t('Daily focus / custom focus')));
        for (const item of data.tasks.filter(item => !item.completed)) task.append(el('option', { value: item.id }, item.text));
        task.onchange = () => {
          input.disabled = Boolean(task.value);
          input.value = task.value ? data.tasks.find(item => item.id === task.value)?.text || '' : customTitle;
        };
        if (data.tasks.some(item => item.id === timer.taskId && !item.completed)) { task.value = timer.taskId; task.dispatchEvent(new Event('change')); }
        const duration = el('input', { type: 'number', min: 1, max: 180, step: 1, required: true, value: data.timerConfig.focus, 'aria-label': t('Focus duration in minutes') });
        const custom = field(t('Custom minutes'), duration);
        const preset = el('select', { 'aria-label': t('Focus duration') },
          ...[25, 50].map(minutes => el('option', { value: String(minutes) }, `${minutes} min`)),
          el('option', { value: 'custom' }, t('Custom duration')));
        preset.value = [25, 50].includes(data.timerConfig.focus) ? String(data.timerConfig.focus) : 'custom';
        custom.hidden = preset.value !== 'custom';
        preset.onchange = () => {
          custom.hidden = preset.value !== 'custom';
          if (custom.hidden) { duration.value = preset.value; duration.dispatchEvent(new Event('input')); }
          else duration.focus();
        };
        if (!fullscreen && data.settings.widgets.timer) {
          const preview = el('strong', { class: 'session-preview', 'aria-label': 'Planned focus duration' }, timeText(data.timerConfig.focus * 60000));
          duration.addEventListener('input', () => { preview.textContent = duration.validity.valid && duration.value ? timeText(Number(duration.value) * 60000) : '—'; });
          root.append(preview);
        }
        const start = act(async event => {
          event.preventDefault();
          const minutes = Number(duration.value), chosen = get().tasks.find(item => item.id === task.value && !item.completed);
          if (!Number.isInteger(minutes) || minutes < 1 || minutes > 180) throw new Error(t('Choose a duration between 1 and 180 minutes.'));
          if (task.value && !chosen) throw new Error(t('That task is no longer available.'));
          const title = chosen ? chosen.text : input.value.trim();
          if (get().settings.widgets.timer) await timerCommand('start', { taskId: chosen?.id || null, taskTitle: title, focusMinutes: minutes });
          if (!chosen) await update(next => { next.focus = { date: dayKey(), text: title, completed: false }; delete next.drafts[draftKey]; });
        });
        const taskField = field(t('Choose a task'), task);
        taskField.hidden = !data.tasks.some(item => !item.completed);
        root.append(el('form', { class: 'session-setup stack', onsubmit: start }, taskField, input,
          el('div', { class: 'row session-duration' }, preset, el('button', { type: 'submit', class: 'primary focus-start' }, t(data.settings.widgets.timer ? 'Start focus' : 'Save focus'))), custom), status);
        if (!fullscreen) root.append(el('div', { class: 'row wrap session-secondary' }, button(t('Session settings'), 'sliders-horizontal', () => emit('timer:open')), el('button', { class: 'text-button focus-discard', type: 'button', onclick: act(async () => { await update(next => { delete next.drafts[draftKey]; }); input.value = focus; status.textContent = ''; root.querySelector('.focus-discard').hidden = true; }) }, t('Discard focus draft'))));
        const discard = root.querySelector('.focus-discard');
        if (discard) { discard.hidden = !data.drafts[draftKey]; input.addEventListener('input', () => { discard.hidden = !input.value; }); }
      }
      if (restoreFocus) root.querySelector('.focus-start')?.focus({ preventScroll: true });
    }
    const countdown = root.querySelector('.session-countdown');
    if (countdown) {
      const left = remaining(timer, Date.now());
      countdown.textContent = timeText(left);
      root.querySelector('progress').value = Math.max(0, Math.min(1, 1 - left / timer.duration));
    }
  }
  render();
  return { root, render, destroy() { root.remove(); } };
}
