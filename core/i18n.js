// Stage 1 establishes the translation boundary; complete localization is Stage 3.
const en = { appName: 'ONEFLOW', tagline: 'A little space to focus.' };
/** Resolve a core translation key. */
export const t = key => en[key] ?? key;
