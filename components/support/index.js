import { el, download, dayKey } from '../../core/utils.js';
import { act, field, openPanel, select } from '../../core/ui.js';
import { emit } from '../../core/events.js';
import { PUBLISHER, publicURL } from '../../core/publisher.js';
import { tabs } from '../panel-design/index.js';
let root;

/** Render help and an explicitly user-authored, local-only feedback export. */
export function render() {
  const topic = select([['idea', 'Suggestion'], ['problem', 'Something went wrong'], ['beta', 'Beta feedback']], 'idea');
  const message = el('textarea', { rows: 6, maxlength: 5000, required: true, placeholder: 'What were you trying to do? What happened, and what would help?', 'aria-label': 'Your feedback' });
  const status = el('p', { role: 'status', class: 'muted' });
  const form = el('form', { class: 'stack', onsubmit: act(event => {
    event.preventDefault();
    const text = message.value.trim();
    if (!text) { message.setCustomValidity('Write your feedback before downloading.'); message.reportValidity(); return; }
    const version = globalThis.chrome?.runtime?.getManifest?.().version || 'preview';
    const content = `ONEFLOW feedback\nVersion: ${version}\nTopic: ${topic.value}\n\n${text}\n`;
    download(new Blob([content], { type: 'text/plain;charset=utf-8' }), `oneflow-feedback-${dayKey()}.txt`);
    status.textContent = 'Saved to your downloads. Nothing was sent. Share the file with the person who invited you or through the store support link.';
  }) }, field('Feedback type', topic), field('Your feedback', message),
  el('p', { class: 'muted' }, 'The download contains only your message, feedback type, and extension version. Your tasks, journal, keys and browsing activity are never attached.'),
  el('button', { type: 'submit', class: 'primary' }, 'Download feedback'), status);
  message.oninput = () => message.setCustomValidity('');
  root = el('div', { class: 'stack' },
    el('p', { class: 'welcome-copy' }, 'A little help to keep going.'),
    el('p', {}, 'Choose one task, set your minutes, and select Start focus. Notes and Sounds open from Home; Journal is at the top right. More contains tools such as Music and Stats. Tasks and Habits live in Notes.'),
    el('details', {}, el('summary', {}, 'Timer, breaks and progress'), el('p', {}, 'Your session stays in sync across tabs. Pause when you need to; End session saves the time you spent. When a session finishes, take a break, mark the task complete, or continue focusing. See progress opens your local focus history. A closed browser cannot deliver an alarm; reopening reconciles the deadline.')),
    el('details', {}, el('summary', {}, 'Keep your data safe'), el('p', {}, 'Your tasks, journal and focus history live in this browser profile. They do not automatically move to another device. Export a backup before changing profiles, uninstalling, or updating an unpacked copy. Encryption protects a backup with a passphrase that only you know.'), el('button', { onclick: () => emit('settings:open', 'data') }, 'Open backups & restore')),
    el('details', {}, el('summary', {}, 'Keyboard shortcuts'), el('p', {}, 'N: new task · Space: pause or resume · F: fullscreen focus · /: search · Esc: close · Ctrl/Cmd+K: find an action. Shortcuts pause while you type.')),
    el('p', {}, 'ONEFLOW works offline without an account or analytics. Optional weather, photos and music contact their providers only when connected. Search uses your browser’s chosen provider.'),
    el('a', { href: '../../docs/launch/privacy.html', target: '_blank', rel: 'noopener' }, 'Read the privacy policy'),
    el('h3', {}, 'Help improve ONEFLOW'));const help=el('div',{class:'stack'},...root.childNodes);root.replaceChildren();tabs(root,[{label:'Help',content:help},{label:'Feedback',content:form}],'support');
  for (const [label, value] of [['Contact support', PUBLISHER.supportURL], ['Public privacy policy', PUBLISHER.privacyURL]]) {
    const href = publicURL(value);
    if (href) help.append(el('a', { href, target: '_blank', rel: 'noopener noreferrer' }, label));
  }
  openPanel('Help & feedback', 'support', root, destroy);
}
export const open = render;
export function init() {}
export function destroy() { root = null; }
