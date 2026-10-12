import { domain } from './stage3-schema.js';
/** Only an explicitly active, unexpired focus session may block navigation. */
export const shouldBlock = (d, now = Date.now()) => d.flow.active && d.flow.block && d.blocker.enabled && d.timer.phase === 'focus' && d.timer.status === 'running' && d.timer.endsAt > now;
export function matchesHost(host, domains) {
  return domains.some(x => host === x || host.endsWith(`.${x}`));
}
export function blockedHost(d, host, now = Date.now()) {
  domain(host);
  return shouldBlock(d, now) && !d.blocker.overrides.some(x => x.until > now && matchesHost(host, [x.host])) && (d.blocker.mode === 'block' ? matchesHost(host, d.blocker.domains) : !matchesHost(host, d.blocker.domains));
}
/** Session rules disappear on browser restart; no persistent blocking rules are used. */
export function rulesFor(d, extensionURL, now = Date.now()) {
  if (!shouldBlock(d, now) || d.blocker.mode === 'block' && !d.blocker.domains.length) return [];
  const condition = {
    regexFilter: '^https?://.*',
    resourceTypes: ['main_frame'],
    requestMethods: ['get']
  };
  const excluded = d.blocker.overrides.filter(x => x.until > now).map(x => x.host);
  if (d.blocker.mode === 'block') condition.requestDomains = d.blocker.domains;else excluded.push(...d.blocker.domains);
  if (excluded.length) condition.excludedRequestDomains = [...new Set(excluded)];
  return [{
    id: 1,
    priority: 1,
    action: {
      type: 'redirect',
      redirect: {
        regexSubstitution: `${extensionURL}#\\0`
      }
    },
    condition
  }];
}
export function blockerOrigins(b) {
  return b.mode === 'allow' ? ['http://*/*', 'https://*/*'] : b.domains.flatMap(x => [`http://*.${x}/*`, `https://*.${x}/*`]);
}
