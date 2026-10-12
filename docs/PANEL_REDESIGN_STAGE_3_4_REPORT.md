# Panel redesign Stages 3 and 4 report

Completed 2026-10-12. The user requested these two stages together. Stage 3 covers energy/planning; Stage 4 covers projects/browser organization. Stages 5–8 are not implemented by this change.

## Built

| Stage | Panel | Result |
|---|---|---|
| 3 | Local Focus DNA | Recipe/explanation first; learning, switch-counting and deletion under Learning & privacy. Controls stay open when toggling learning. |
| 3 | Energy Planner | Today, Task effort and Energy pattern views; searchable task estimates; protected recovery blocks and visible unplaced work. |
| 3 | Energy Weather | Check in, searchable History and Recovery views; energy arc, saved ratings, breaks and shutdown ritual preserved. |
| 3 | Priorities | Selected work first with count out of three; searchable remaining tasks behind disclosure. |
| 4 | Proof of Work | Searchable project collection; separate Deliverables and Report views. Reports read fresh evidence/session selections and require individual line approval. |
| 4 | Afterglow | Searchable meeting collection and stage filters; separate Overview, Actions and Follow-up views with Tasks/Notes integration. |
| 4 | Quiet Web | Now, Later and Reference views with searchable saved links; explicit browser review and disclosed parking/reset controls. Long links wrap on mobile. |

Planner, energy ratings/shutdown, project and meeting editors preserve unfinished input while switching tools within the same tab. Saving in a tool no longer reopens it after the user has switched elsewhere. Closing the entire panel or reloading is not persistent draft autosave. DNA and Quiet Web refresh their data-dependent views rather than retaining browser/learning snapshots.

All layouts reuse existing theme/spacing/control tokens, shared keyboard tabs and the panel shell. No new dependency, permission, schema or remote service was added. Learning remains opt-in. Quiet Web retains confirmation and capsule-before-close behavior.

## File tree

```text
components/
  dna/index.js                  recipe and privacy disclosure
  energy/index.js               schedule/effort/pattern views
  energyweather/index.js        check-in/history/recovery views
  queue/index.js                priorities and available-task search
  proof/index.js                project collection and report views
  afterglow/index.js            meeting collection and contextual views
  quietweb/index.js             browser-context buckets and disclosure
  panel-design/style.css        long-text wrapping and filtered-card hiding
core/ui.js                       retained editor registration
newtab/widgets.css, app.css      regenerated source styles
tests/
  panel-planning-browser.js      seven-panel workflow/layout acceptance
  journeys-browser.js            updated contextual navigation
  journeys-tabs-browser.js       updated real-tab navigation
  work-context-browser.js        updated privacy/planner navigation
docs/
  DESIGN_CONSTITUTION.md         Stage 3/4 contract
  PANEL_REDESIGN_STAGE_3_4_PLAN.md
  PANEL_REDESIGN_STAGE_3_4_REPORT.md
  qa-results/                   browser result evidence
  screenshots/planning-*        Chrome/Edge theme/viewport evidence
```

## Load and test

1. Reload ONEFLOW in Chrome's or Edge's extensions page; open a new tab → More.
2. Open Energy Planner. Set blocks in Energy pattern, edit a task in Task effort, then Plan today. Recovery blocks remain unassigned.
3. Save Energy Weather ratings; use Recovery for breaks or tomorrow's next action. Choose up to three Priorities and search remaining tasks.
4. Create a Proof of Work project, add a deliverable, then prepare its Report. Export requires approval of each included line.
5. Capture an Afterglow meeting, review its outline, assign Actions and save a Follow-up Note.
6. In Quiet Web, explicitly review browser tabs and categorize them. Park later tabs only after reviewing the confirmation. A capsule is saved before matching inactive tabs close.

## Acceptance checklist

| Check | Result |
|---|---|
| Manifest references, CSP, syntax, safe DOM, generated styles | PASS — `node scripts/check.js` |
| Unit suite | PASS — 103 tests |
| Initial JavaScript budget | PASS — 149.8 KiB / 150 KiB |
| Seven-panel workflow suite | PASS — Chrome and Edge, nine groups each |
| Draft retention, searched/empty collections, effort save and recovery protection | PASS |
| Priority selection and searching remaining tasks | PASS |
| Fresh report evidence, rejection without approval and CSV export | PASS |
| Meeting draft/owner preservation, Tasks and Notes saves | PASS |
| Quiet Web denied permission and context-only reset | PASS |
| Real tab categorization, capsule-before-close, active-tab protection, duplicate-free reopening | PASS — Chrome isolated permission fixture |
| Existing workspace journey integration, backup/reset/import | PASS — Chrome, eleven groups |
| Existing work-context/DNA/planning/export integration | PASS — Chrome, seven groups |
| Stats/Notifications shared-panel regression | PASS — Chrome and Edge, six groups each |
| Calm Home regression | PASS — Chrome, eight groups |
| Desktop 1440px/mobile 390px and 320px; light/dark; reduced motion | PASS — Chrome/Edge assertions and screenshot inspection |
| Offline saved work, Escape, no page errors or external requests | PASS — Chrome and Edge |
| Native optional-permission dialog, Firefox, measured startup under 300ms | NOT VERIFIED — manual release checks remain |

Evidence: [Chrome panel results](qa-results/panel-planning-chrome.json), [Edge panel results](qa-results/panel-planning-edge.json), [Planner desktop](screenshots/planning-chrome-energy-light-1440.png), [Afterglow desktop](screenshots/planning-chrome-afterglow-light-1440.png), [Quiet Web mobile](screenshots/planning-chrome-quietweb-light-320.png).

## Limits and decisions

Task estimates and local recipe associations are suggestions, not measured capacity or causal claims. The tab fixture grants optional access for headless API verification; the real native approval prompt remains a manual check. Draft retention ends when the whole panel closes or the page reloads. The initial JavaScript budget has only 0.2 KiB headroom; future tools should stay lazy-loaded.

The workspace contains substantial pre-existing changes, so no combined commit was created. No decision is required for these stages. Stop here before Stage 5.
