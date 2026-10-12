import { on, emit } from './events.js';

/** Native disclosure keeps secondary controls reachable without a persistent toolbar. */
export function init() {
  const menu = document.querySelector('#home-menu'), trigger = menu.querySelector('summary');
  const close = () => { menu.open = false; };
  menu.addEventListener('toggle', () => { trigger.setAttribute('aria-expanded', String(menu.open)); if (menu.open) emit('home:extras'); });
  document.addEventListener('pointerdown', event => { if (!menu.contains(event.target)) close(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.open && !document.querySelector('dialog[open]')) {
      event.preventDefault(); close(); trigger.focus();
    }
  });
  document.addEventListener('focusin', event => { if (!menu.contains(event.target)) close(); });
  menu.addEventListener('click', event => {
    if (event.target.closest('#view-switcher button')) {
      close();
      (document.documentElement.dataset.view === 'focus' ? document.querySelector('#focus-exit') : trigger).focus();
    }
  });
  on('panel:open', close);
  on('panel:closed', () => queueMicrotask(() => {
    // Panel launchers inside a collapsed menu cannot receive restored focus.
    if (!menu.open && (menu.contains(document.activeElement) || document.activeElement === document.body)) trigger.focus();
  }));
}
