import { get } from './storage.js';
import { openFeature } from './features.js';
import { emit } from './events.js';
import { remember } from './tool-preferences.js';

// Lazy consumers share discovery metadata; stable IDs preserve favorites and backups.
export const hubs = [
  ['Focus', [
    ['capsules','Focus Capsules','bookmark','Save and return to your work.','Capsules saved context'],
    ['recovery','Focus Recovery','clock','Leave a next action; return gently.','Resume work'],
    ['compiler','Next-Step Compiler','list-todo','Turn a brief into editable actions.','Next steps'],
    ['firststep','First Step Mode','play','Begin with one tiny action.','First step'],
    ['dna','Local Focus DNA','sun','Find patterns privately, with explanations.','Focus patterns Focus DNA'],
    ['quietweb','Quiet Web','layout-grid','Organize tabs with a return path.','Tabs']
  ]],
  ['Plan', [
    ['energy','Energy Planner','layout-grid','Fit tasks to your energy pattern.','Day planner'],
    ['queue','Priorities','list-todo','Plan three important next steps.','Tasks'],
    ['countdowns','Countdowns','clock','Upcoming milestones.','Milestones']
  ]],
  ['Reflect', [
    ['rituals','Daily check-in','sun','Set an intention.','Daily ritual'],
    ['energyweather','Energy Weather','sun','Check energy and recovery.','Energy check-in'],
    ['afterglow','Afterglow','list-todo','Turn meetings into next actions.','Meeting follow-up'],
    ['stats','Stats','clock','Your recorded focus progress.','Statistics'],
    ['suggestions','Suggestions','sun','Ideas for your next step.','Recommendations']
  ]],
  ['Learn and Career', [
    ['recall','Recall Rooms','bookmark','Learn and revisit concepts.','Recall study'],
    ['garden','Idea Garden','sun','Capture, connect and grow ideas.','Ideas'],
    ['skills','Skill Loops','bookmark','Practice with evidence and reviews.','Skills'],
    ['career','Career Sprint','list-todo','Prepare and follow up consistently.','Career'],
    ['proof','Proof of Work','clock','Approve a private project report.','Progress report'],
    ['dictionary','Dictionary','bookmark','Words and definitions.','Definitions']
  ]],
  ['Environment', [
    ['sounds','Sounds','audio-lines','Layer a soundscape.','Sound mixer ambient'],
    ['breathing','Breathing','heart','Follow a quiet breathing pattern.','Box breathing 4-7-8'],
    ['scenes','Scenes','image','Save a complete atmosphere.','Atmosphere'],
    ['music','Music','play','Your music services.','Spotify YouTube']
  ]]
];
export const utilities = ['System utilities', [
  ['notifications','Notifications','bell','Review confirmations and reminders.','Reminders'],
  ['customizer','Customize','sliders-horizontal','Design your whole workspace.','Layout'],
  ['support','Help & feedback','bookmark','Local help and diagnostics.','Help and Feedback'],
  ['websearch','Web search','search','Use your default search provider.','Search web'],
  ['commands','Find an action','search','Search tools and tasks.','Command search'],
  // Retain the existing layout route and saved favorites; it opens the same editor.
  ['layout','Layout','layout-grid','Open responsive layout controls in Customize.','Responsive arrangements']
]];
export const shortcuts = [
  ['Workspaces', [
    ['notes','Notes','pencil','Notes, tasks and habits in one place.','Tasks habits workspace Open tasks Open habits'],
    ['journal','Journal','bookmark','Write and revisit reflections.','Gratitude']
  ]],
  ['Reflection shortcuts', [
    ['mood','Mood','heart','Check in with yourself.','Mood check-in'],
    ['reflection','Session reflection','bookmark','Reflect on a session.','Reflect session']
  ]]
];
export const groups = [...hubs, utilities, ...shortcuts];
export const tools = groups.flatMap(([, items]) => items);

/** Honor the same saved widget gates in every discovery surface. @param {string} id */
export function toolEnabled(id) {
  const widgets = get().settings.widgets;
  return id === 'notes' ? ['notes','tasks','habits'].some(k => widgets[k]) : !Object.hasOwn(widgets, id) || widgets[id];
}
/** Match current names, historic names, and proposed plain-language aliases. */
export function matchesTool(tool, query) { return tool.join(' ').toLowerCase().includes(query.trim().toLowerCase()); }
/** Record only an explicit launch; keep saved preferences attached to stable IDs. */
export async function launchTool(id) {
  if (!toolEnabled(id)) return;
  await remember(id);
  await openFeature(id);
}
/** Settings keeps its dedicated workspace and permission controls. */
export function openSettings(section = 'appearance') { emit('settings:open', section); }
