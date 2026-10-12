# Personal workspaces — Stage Report

Completed 11 October 2026. Nine new offline workspaces and an extension to existing Focus Capsules implement the ten ideas in the attached brief.

## Built

| Workspace | Implemented behavior |
| --- | --- |
| First Step Mode | Existing/custom task entry, editable tiny action, real two-minute timer, early-stop rescue and task-type history. Uses the existing visual Focus timer. |
| Recall Rooms | Subject material and linked Notes, editable offline recall prompts, answer disclosure, confidence-based spaced reviews, concept groups, exam countdown and concept-linked sessions. |
| Idea Garden | Text/link/image fragments and pointer sketches saved in Notes, seed/growing/project/archive stages, incubation dates, neglected-idea cues, transparent title-keyword connections, explicit combining and focus blocks. |
| Proof of Work | Voluntary projects/clients/rates, deliverables and evidence links, project-linked or explicitly selected sessions, editable weekly CSV and invoice estimates. Each export line requires approval; spreadsheet formulas are escaped. |
| Energy Weather | Before/after energy and recovery ratings, voluntary session linkage, daily energy arc, repeated-pattern suggestions, light work, protected breaks and a shutdown resume note. |
| Work Capsules | Existing Focus Capsules capture and restore work context. Added bundled scenery previews and actual linked task-session totals. Shared tasks may appear in multiple capsules; totals state this explicitly. |
| Afterglow | Offline labeled-note parsing, editable decisions/questions/actions/owners, linked Tasks, additional actions, local follow-up Notes with optional reminders, staged completion and 15-minute close-loop blocks. |
| Career Sprint | Local opportunity pipeline, job-description preparation templates, editable Tasks, portfolio/evidence/skill-gap fields, interview/networking/practice blocks, follow-up dates, weekly application goal and exported progress story. |
| Quiet Web | Optional current-window review, now/later/reference categories, transparent user-defined cost estimate, capsule-before-close parking of inactive matching tabs, duplicate-free reopening, blocker/Flow access and daily reset capsule. |
| Skill Loops | Outcomes/examples, user-selected difficulty, varied practice prompts, linked sessions, voluntary evidence and recall confidence, spaced review dates, skill groups and a Scene choice after three recorded reflections. |

New tools live in More → Open all tools → Workspaces and command search. Home remains unchanged. Capture forms collapse after records exist, letting saved work lead. All tools use the shared panel and theme tokens.

## File tree

```text
core/
  journeys-schema.js     Local bounded record validation
  journeys-logic.js      Deterministic suggestions, reviews and safe CSV
  journeys.js            Serialized records and explicit task/timer linking
  work-schema.js         Version 1 → 2 migration
  work-context.js        First-step outcomes and voluntary energy linkage
components/
  journeys/shared.js, style.css
  firststep/index.js
  recall/index.js
  garden/index.js
  proof/index.js
  energyweather/index.js
  afterglow/index.js
  career/index.js
  quietweb/index.js
  skills/index.js
  capsules/index.js      Scenery and actual linked history
tests/
  journeys.test.js
  journeys-browser.js
  journeys-tabs-browser.js
  journeys-media-browser.js
docs/
  WORKSPACES_PLAN.md
  WORKSPACES_STAGE_REPORT.md
  qa-results/journeys-*.json
  screenshots/journeys-*.png
```

Feature/command/tool registries, storage comments, style manifest/generated CSS, privacy policy, permissions and design constitution were also updated. Existing backups automatically include the versioned workspace records; screenshot/sketch blobs use the established Notes media backup path. No library or required permission was added.

## Load and test

1. Open `chrome://extensions` or `edge://extensions`, enable Developer mode, and load unpacked `D:\BOOKS\ONEFLOW`; reload an already loaded extension.
2. Open a fresh new tab. More → Open all tools exposes Workspaces. Start with First Step Mode or add a Recall Room.
3. For Quiet Web, explicitly review tabs and grant optional access. Categorize an inactive web tab as later, park it with confirmation, then reopen it. The return capsule is visible in Focus Capsules.
4. Export a backup in Settings before moving profiles. Workspace data and Notes attachments are included.

Development checks: `node --test tests/*.test.js`, `node scripts/styles.js`, `node scripts/check.js`. Browser scripts require Playwright through `ONEFLOW_NODE_MODULES` and the installed Chrome/Edge executables, consistent with the existing harness.

## Acceptance checklist

| Check | Result |
| --- | --- |
| All ten workspace flows | PASS — Chrome and Edge, 11 workflow groups each |
| Schema migration, review scheduling, meeting parsing, safe exports | PASS — 102 total unit tests, including 8 new tests |
| Manifest references, JavaScript syntax, CSP, local styles and safe DOM | PASS |
| Initial application JavaScript below 150 KB | PASS — 149.9 KiB; tools load on demand |
| Actual timer entry, early-stop rescue and linked sessions | PASS — Chrome/Edge workflows |
| Individual report approval before export | PASS — unapproved export refused; approved CSV downloaded |
| Optional tab denial leaves saved work intact | PASS — simulated denial, production manifest |
| Real tab categorization, capsule-before-close parking and duplicate-free return | PASS — Chrome/Edge isolated granted-permission fixtures |
| Screenshot and sketch attachments, optimized local blobs and backup parsing | PASS — Chrome media workflow |
| 1440/390/320 px, both themes, usable shared close controls | PASS — Chrome/Edge screenshots and layout assertions; desktop/mobile visuals inspected |
| Offline reload, reduced motion, Escape, backup/reset/import | PASS — Chrome/Edge; no new external requests or uncaught page errors |
| Existing capsule/recovery/compiler/DNA/planner behavior after migration | PASS — Chrome regression workflow |
| Shared panels, Stats, Notifications, keyboard and error states | PASS — Chrome and Edge regression workflows |
| Home layout and mode transitions | PASS — Chrome Home regression |
| Native optional-permission dialog approval/revocation click | MANUAL RELEASE CHECK — headless fixtures cannot exercise the native prompt |
| Under-300 ms new-tab startup | NOT VERIFIED — existing baseline limitation; initial JS budget passes |
| Firefox | NOT TESTED |

## Known limits and decisions

These are offline implementations: generated prompts and preparation actions use deterministic rules, and relationships use disclosed title words. Confidence, evidence, rates and energy ratings are supplied by the user. No AI, calendar connector, account, automatic outreach, clinical inference, surveillance or client sharing is implemented. Reminders for meeting follow-up use the existing Notes reminder mechanism; career and learning due dates are surfaced when their tools open.

Sketching supports pointer input; the fragment field is its keyboard alternative. A workspace removal retains original Notes, Tasks and session history. Full reset removes all workspace records; export a backup first. Collections and UTF-8 storage size are bounded and quota failures surface through the shared error UI.

No blocking product decision needs input. The workspace already contained substantial unrelated changes, so this stage did not create a combined Git commit. Stage is complete; no next stage has been started.
