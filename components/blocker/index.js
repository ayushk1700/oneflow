import { t as translate } from '../../core/i18n.js';
import { get, update } from '../../core/storage.js';
import { el } from '../../core/utils.js';
import { field, select, toggle, act } from '../../core/ui.js';
import { emit } from '../../core/events.js';
import { domain } from '../../core/stage3-schema.js';
import { blockerOrigins } from '../../core/blocker-logic.js';
import { backgroundSync } from '../../core/timer-client.js';
import { tabs } from '../panel-design/index.js';
import { shouldBlock } from '../../core/blocker-logic.js';
export function open() {
  emit('settings:open', 'blocking');
}
/** Render blocking controls in Settings, preserving the permission click gesture. */
export function renderSettings(body, refresh) {
  const b = get().blocker,
    root = el('div', {
      class: 'stack'
    }),
    mode = select([['block', translate('m0129')], ['allow', translate('m0130')]], b.mode),
    domains = el('textarea', {
      rows: 6,
      'aria-label': translate('m0131'),
      placeholder: 'example.com\nsocial.example.com'
    });
  domains.value = b.domains.join('\n');
  let enabled = b.enabled;
  const rules=el('div',{class:'stack'}),activity=el('div',{class:'stack'});root.append(el('p',{class:'boundary-status',role:'status'},shouldBlock(get())?'Blocking is active for this Flow session.':b.enabled?'Configured. Blocking starts only during a running Flow focus session.':'Blocking is off. Configure optional boundaries for Flow Mode.'));tabs(root,[{label:'Rules',content:rules},{label:'Activity',content:activity}],'blocking');
  rules.append(el('p', {
    class: 'muted'
  }, translate('m0132')), field(translate('m0133'), mode), field(translate('m0134'), domains), toggle(translate('m0135'), enabled, e => {
    enabled = e.target.checked;
  }), el('button', {
    class: 'primary',
    onclick: act(async () => {
      const next = {
        mode: mode.value,
        domains: [...new Set(domains.value.split(/\s+/).filter(Boolean).map(domain))],
        enabled
      };
      if (next.enabled) {
        if (!globalThis.chrome?.permissions) throw new Error(translate('m0136'));
        if (!next.domains.length) throw new Error(translate('m0137'));
        if (!(await chrome.permissions.request({
          origins: blockerOrigins(next)
        }))) throw new Error(translate('m0138'));
      }
      await update(d => {
        Object.assign(d.blocker, next);
        d.blocker.overrides = [];
        if (!enabled) d.flow.block = false;
      });
      await backgroundSync();
      refresh();
    })
  }, translate('m0139')), el('button', {
    onclick: act(async () => {
      await update(d => {
        d.blocker.enabled = false;
        d.flow.block = false;
      });
      await backgroundSync();
      if (globalThis.chrome?.permissions) await chrome.permissions.remove({
        origins: ['http://*/*', 'https://*/*']
      });
      refresh();
    })
  }, translate('m0140')));activity.append(el('h3', {}, translate('m0141')), el('p', {
    class: 'muted'
  }, translate('m0142')));
  for (const item of b.log) activity.append(el('p', {}, `${new Date(item.at).toLocaleString()} · ${item.host}`));
  if (!b.log.length) activity.append(el('p', {
    class: 'empty-state'
  }, translate('m0143')));
  activity.append(el('button', {
    onclick: act(async () => {
      await update(d => {
        d.blocker.log = [];
      });
      refresh();
    })
  }, translate('m0144')));
  body.append(root);
}
export const render = open;
export function init() {}
export function destroy() {}
