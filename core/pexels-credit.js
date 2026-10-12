import { el } from './utils.js';
/** Keep persisted attribution text-safe, including imported backups. */
export function credit(record) {
  const host = document.querySelector('#photo-attribution'); if (!host) return; host.replaceChildren();
  const info = record?.pexels; if (!info || typeof info.author !== 'string') return;
  try { const page = new URL(info.page); if (page.protocol !== 'https:' || !['www.pexels.com','pexels.com'].includes(page.hostname) || page.username || page.password) return;
    host.append(el('a',{href:page.href,target:'_blank',rel:'noreferrer'},`${info.author.slice(0,120)} · Pexels`));
  } catch { /* Invalid imported metadata never becomes a link. */ }
}
