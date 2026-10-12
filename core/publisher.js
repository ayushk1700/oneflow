/** Public publisher details. Empty values hide contact links until configured by the owner. */
export const PUBLISHER = Object.freeze({ supportURL: '', privacyURL: '' });

/** Only explicit HTTPS destinations are allowed in publisher links. @param {string} value */
export function publicURL(value) {
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : null; }
  catch { return null; }
}
