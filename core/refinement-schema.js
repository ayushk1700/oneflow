import { t as translate } from './i18n.js';
/** Data introduced by the focused-work refinement. */
export const refinementDefaults = () => ({ drafts: {}, planning: { date: '', ids: [], estimates: {} }, sessionReflections: [], reflectionSeen: '', ritualSnoozes: {} });
export function validateRefinement(d) {
  if (!d.drafts || Array.isArray(d.drafts) || Object.keys(d.drafts).length > 200 || Object.entries(d.drafts).some(([key, value]) => !/^(tasks|task|journal|ritual):[\w-]{1,100}$/.test(key) || typeof value !== 'string' || value.length > 20000)) throw new Error(translate('m0637'));
  const p = d.planning;
  if (!p || typeof p.date !== 'string' || p.date.length > 10 || !Array.isArray(p.ids) || p.ids.length > 3 || new Set(p.ids).size !== p.ids.length || p.ids.some(id => typeof id !== 'string' || !d.tasks.some(t => t.id === id)) || !p.estimates || Object.entries(p.estimates).some(([id, value]) => id.length > 100 || !Number.isInteger(value) || value < 1 || value > 360)) throw new Error(translate('m0638'));
  if (!['normal', 'strong'].includes(d.settings.contrast) || typeof d.reflectionSeen !== 'string' || d.reflectionSeen.length > 100 || !Array.isArray(d.sessionReflections) || d.sessionReflections.length > 10000 || d.sessionReflections.some(r => !r || typeof r.id !== 'string' || r.id.length > 100 || typeof r.text !== 'string' || r.text.length > 5000 || !Number.isFinite(r.at))) throw new Error(translate('m0639'));
  if (!d.ritualSnoozes || Object.entries(d.ritualSnoozes).some(([kind, at]) => !['morning', 'midday', 'evening'].includes(kind) || !Number.isFinite(at) || at < 0)) throw new Error(translate('m0640'));
}
