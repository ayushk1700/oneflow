/** Public publisher details. Empty values hide contact links until configured by the owner. */
export const PUBLISHER = Object.freeze({ supportEmail: 'aayush31500@gmail.com', supportURL: '', privacyURL: '' });

/** Only explicit HTTPS destinations are allowed in publisher links. @param {string} value */
export function publicURL(value) {
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : null; }
  catch { return null; }
}
/** A support email is an explicit contact action, never an automatic transmission. */
export function supportLink(publisher = PUBLISHER) {
  const website = publicURL(publisher.supportURL);
  if (website) return website;
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(publisher.supportEmail || '') ? `mailto:${publisher.supportEmail}` : null;
}
