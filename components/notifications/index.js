import * as manager from '../../core/notifications.js';
import { el } from '../../core/utils.js';
import { resumePanel, openPanel, button, act, icon, confirmAction } from '../../core/ui.js';
import { emit } from '../../core/events.js';

let root, unsubscribe,filter='All';
const formatTime = timestamp => new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(timestamp);

export function render() {
  if (!root) return;
  const records = manager.list(), list = root.querySelector('.notification-list');
  root.querySelector('.notification-count').textContent = records.length ? `${records.length} recent` : 'All clear';
  const term=root.querySelector('[type=search]').value.trim().toLowerCase(),visible=records.filter(r=>(filter==='All'||filter==='Unread'&&!r.read||filter==='Attention'&&r.kind==='error')&&r.message.toLowerCase().includes(term));
  const rows = visible.length ? visible.map(record => el('article', { class: `notification-item${record.read ? '' : ' is-unread'}`, 'aria-label': record.read ? 'Read notification' : 'Unread notification' },
    el('span', { class: 'notification-dot', 'aria-hidden': 'true' }),
    el('div', {}, el('div', { class: 'notification-item-top' }, el('strong', {}, record.kind === 'error' ? 'Needs attention' : 'ONEFLOW'), el('time', { datetime: new Date(record.createdAt).toISOString() }, formatTime(record.createdAt))), el('p', {}, record.message)))) : [
    el('div', { class: 'notification-empty' }, el('span', { class: 'notification-empty-mark', 'aria-hidden': 'true' }, icon('check')), el('strong', {}, records.length?'No matching notices':'You’re up to date'), el('p', { class: 'muted' }, records.length?'Try another search or filter.':'Helpful confirmations and reminders will appear here.'))
  ];
  list.replaceChildren(...rows);
  root.querySelector('[aria-label="Mark all as read"]').disabled = !records.some(record => !record.read);
  root.querySelector('[aria-label="Clear notifications"]').disabled = !records.length;
}

export function open() {
  if (resumePanel('notifications')) return;
  const danger = el('footer', { class: 'danger-zone' });
  danger.append(button('Clear notifications', 'trash-2', () => {
    if (!danger.querySelector('.confirm-box')) confirmAction(danger, 'Clear the notification history on this device? This cannot be undone.', () => manager.clear());
  }, 'text-button danger'));
  root = el('div', { class: 'notifications-panel stack' }, el('header', { class: 'notifications-panel-heading' }, el('div', {}, el('p', { class: 'eyebrow' }, 'YOUR INBOX'), el('h3', {}, 'A little less to keep in mind.')), el('span', { class: 'notification-count' })), el('div', { class: 'notifications-actions' }, button('Mark all as read', 'check-check', act(() => manager.markAllRead()), 'text-button')), el('div', { class: 'notification-list', 'aria-live': 'polite' }), danger);
  unsubscribe = manager.subscribe(render);
  openPanel('Notifications', 'notifications', root, destroy);
  root.querySelector('.notifications-actions').append(button('Reminder settings', 'sliders-horizontal', () => emit('settings:open', 'reminders'), 'text-button'));
  root.prepend(el('p', { class: 'muted' }, 'Recent confirmations and reminders, saved on this device. Up to 40 notices are kept.'));
  const search=el('input',{type:'search','aria-label':'Search notifications',placeholder:'Find a notice…',oninput:render}),filters=el('div',{class:'library-filters','aria-label':'Notification filters'});filter='All';for(const label of ['All','Unread','Attention'])filters.append(el('button',{type:'button','aria-pressed':String(label===filter),onclick:()=>{filter=label;for(const b of filters.children)b.setAttribute('aria-pressed',String(b.textContent===filter));render();}},label));root.querySelector('.notification-list').before(search,filters);
  render();
}

export function init() { manager.init(); }
export function destroy() { unsubscribe?.(); unsubscribe = null; root = null; }
