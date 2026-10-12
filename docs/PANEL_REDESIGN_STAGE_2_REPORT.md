# Panel redesign Stage 2 report

Implemented 2026-10-11: First Step Mode, Next-Step Compiler and Focus Recovery. This completes the work-entry/re-entry group, not the remaining demo-board panels.

## What changed

- First Step now presents a searchable collection of saved small beginnings with ready, started, rescued and finished state filters. New work uses disclosure once records exist; the selected record has one editable action and its two-minute start control.
- Compiler separates the brief from the action plan, opens the first action and collapses later actions. The full plan remains editable before adding tasks. Notes and Journal exports are under Keep a copy; duplicate-submit protection remains.
- Recovery prominently shows the saved next action and one return button. Editing, deletion and preferences use disclosure. Clicking Return reads current timer state, preserving paused-session identity and protecting a running interval.
- All three tools preserve unfinished entries when switching tools within the same tab. Closing the entire panel or reloading is not persistent draft autosave.
- Existing tokens, shared panel shell, local storage, timer and offline rules are reused. No new dependencies, permissions, network calls or schema changes.

## Files

```text
components/firststep/index.js       searchable small beginnings
components/compiler/index.js        disclosed brief/action plan/export
components/recovery/index.js        return card and disclosed editor
core/ui.js                          retained tool views
newtab/app.css, widgets.css         regenerated from existing sources
tests/panel-entry-browser.js        new workflow/layout acceptance
tests/work-context-browser.js       adapted disclosure navigation
docs/DESIGN_CONSTITUTION.md         Stage 2 visual contract
docs/PANEL_REDESIGN_STAGE_2_PLAN.md
docs/PANEL_REDESIGN_STAGE_2_REPORT.md
```

## Load and test

Reload ONEFLOW on Chrome's or Edge's extensions page, then open a new tab → More. Search First Step Mode, Next-Step Compiler or Focus Recovery.

Try a tiny action, switch to Sounds and back before starting it. Compile a brief, edit its first action, expand later actions and add the plan to Tasks. Save a recovery note, then resume it; pausing a session and returning preserves its identity.

## Acceptance checklist

| Check | Result |
|---|---|
| Manifest, CSP, syntax, safe DOM and styles | PASS — `node scripts/check.js` |
| Unit tests | PASS — 103 tests |
| Eager JavaScript budget | PASS — 149.7 KiB / 150 KiB |
| Draft retention, search/empty results, two-minute timer, edited compiler tasks and single-submit behavior | PASS — Chrome and Edge entry suite |
| Recovery ten-minute entry and same paused-session resume | PASS — Chrome and Edge entry suite |
| 1440/390/320px, light/dark themes, reduced motion | PASS — Chrome and Edge assertions and screenshot inspection |
| Offline saved work, Escape, no page errors or remote requests | PASS — Chrome and Edge entry suite |
| Existing capsule/compiler/recovery/DNA/planner integration and backup/export | PASS — Chrome work-context suite, seven groups |
| Calm Home regression | PASS — Chrome, eight groups |
| Shared panel Stats/Notifications regression | PASS — Chrome and Edge, six groups each |
| Firefox, native optional-permission dialog and measured cache startup under 300ms | NOT VERIFIED — manual release checks remain |

Evidence: [Chrome entry results](qa-results/panel-entry-chrome.json), [Edge entry results](qa-results/panel-entry-edge.json), [First Step mobile](screenshots/entry-chrome-firststep-light-320.png), [Recovery desktop](screenshots/entry-chrome-recovery-dark-1440.png), [Compiler desktop](screenshots/entry-chrome-compiler-dark-1440.png).

## Limits and decisions

Draft retention is limited to live tool switching; saved records and tasks remain local and persist normally. Compiler estimates remain editable guesses from deterministic rules. Existing permission and browser-support limits are unchanged. The workspace contains substantial pre-existing changes, so no combined commit was made. No decision is needed for this stage. Stop here before the next redesign group.
