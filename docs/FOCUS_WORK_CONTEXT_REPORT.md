# Stage Report — Focus work context

Implemented all five requested features as an offline first release, in the recommended dependency order. No account, AI connection, calendar service, remote code, new runtime dependency or required browser permission was added.

## Built

| Feature | Delivered behavior |
| --- | --- |
| Focus Capsules | Named capture of active tasks, selected note text/checklists/links, current daily focus, timer time remaining, wallpaper, soundscape and Scene ID. Optional current-window HTTP/HTTPS tab capture. Rename/delete; restore missing tasks and separate note copies; reopen only absent tabs, including pending-navigation duplicate protection. Active timers and Flow Mode block restore. A re-entry screen offers the saved interval, a gentle ten minutes, requested sound, and an optional journal line. |
| Focus Recovery | One editable resume note and optional reason. Timer pause/early stop and dashboard departure retain a recovery point. Returning can offer the recovery panel. Resume preserves the same session; fresh ten-minute recovery is available after ending a session. Recovery can be disabled. Leaving the dashboard does not automatically pause the timer. |
| Next-Step Compiler | Deterministic offline rules for presentations, study, research, websites and generic briefs. Three to five editable actions, rough minutes, energy requirements and focus-block count. Add tasks once or start the first action; preserve outcome and current Scene metadata; save the brief to Notes or outline to today’s Journal. |
| Local Focus DNA | Learning and tab-switch counting off by default. Records future opted-in starting conditions, planned duration and break, hour, task energy, wallpaper, soundscape, switches and completion/early stop. Up to 500 local observations. Requires six records, three on each side and a 15-point completion-rate advantage to show a descriptive recipe. Explanations include denominators and an association warning. Apply next-session duration, sound or planned break; open wallpaper settings for wallpaper recommendations. Delete clears observations and disables learning/counting. |
| Energy-Based Day Planner | Manual deep/normal/light/recovery blocks with overlap validation. Editable task effort and energy. Fits whole tasks into compatible capacity, reserves recovery, and explicitly leaves overflow unplaced. Start a planned task with the shared timer. Repeated morning/late-day deep-work observations can suggest moving demanding work earlier. |

Capsules are limited to 50, 100 tabs/tasks/selected notes per capture and 3 MB of UTF-8 capsule data. Energy patterns support 24 blocks; a daily plan handles up to 100 unfinished tasks.

## Files

```text
core/
  work-schema.js                 local versioning, validation and bounds
  work-logic.js                  deterministic compiler, recipes, energy fitting
  work-context.js                capture/restore, recovery, observations, deletion
  work-monitor.js                dashboard departures and return offers
  storage.js                     serialized local-only work document
  db.js                          IndexedDB v5 / focusSamples store
  timer-engine.js, timer-logic.js shared transitions and recovery integration
  timer-client.js, features.js    commands and lazy tool registration
  backup.js                      export/import/reset and rollback integration
components/
  capsules/index.js
  recovery/index.js
  compiler/index.js
  dna/index.js
  energy/index.js
  workbench/shared.js, style.css  shared panel content and tokens
  tools/index.js, commands/index.js, session-view/index.js
background/service-worker.js     real worker observations and optional counts
manifest.json                    optional tabs permission
newtab/newtab.js, widgets.css, app.css
scripts/widget-styles.json
tests/work-context.test.js
tests/work-context-browser.js
tests/work-tabs-browser.js        isolated granted-permission test fixture
docs/FOCUS_WORK_CONTEXT_PLAN.md
docs/PERMISSIONS.md, PRIVACY_POLICY.md, DESIGN_CONSTITUTION.md
```

## Load and try

1. Reload the unpacked extension in Chrome or Edge. Open a new tab, then **More → All tools**.
2. Open **Focus Capsules**, name your work, optionally include web tabs and choose notes, then save. Finish/reset the current timer before restoring. Read the re-entry note and choose an interval.
3. In **Focus Recovery**, leave a next action and optional reason. Resume the existing paused session or start ten minutes when the prior session has ended.
4. In **Next-Step Compiler**, paste a brief, review/edit its actions and estimates, and add them to Tasks or start the first one.
5. In **Local Focus DNA**, opt into future observations and optionally switch counting. Comparisons appear only after sufficient varied observations.
6. In **Energy Planner**, define your daily energy blocks, edit task estimates, and select Plan today. Recovery remains unassigned.

These tools also appear in command search. Active Focus session options include capsule capture and resume-note entry. Export/import/full deletion remain in Settings.

## Acceptance checks

| Check | Result |
| --- | --- |
| Static manifest, CSP, references, syntax, safe DOM and generated CSS | PASS; initial JavaScript 149.9 KiB / 150 KiB |
| Unit suite | PASS; 94 tests, including 10 new substantive work-context tests |
| Capsule capture and active-session refusal | PASS, Chrome and Edge |
| Restore paused, no autoplay, preserved newer tasks, same-session recovery | PASS, Chrome and Edge |
| Edited compiler actions, no duplicate task submission, Journal and Scene metadata | PASS, Chrome and Edge |
| Real worker early-stop observations and opt-in switch counts | PASS, Chrome and Edge |
| Energy fitting and protected recovery blocks | PASS, Chrome and Edge |
| Validated backup parse, full reset, import round-trip and DNA deletion | PASS, Chrome and Edge |
| Permission denial, no-grant capture refusal, context-only fallback | PASS; native denial result simulated in browser harness |
| Actual granted tab APIs, safe URLs, absent-tab reopen and duplicate protection | PASS, Chrome and Edge; isolated test-only install-grant fixture |
| 1440/390/320px, both themes, keyboard focus/Escape, offline reload, reduced motion | PASS, Chrome and Edge |
| Browser errors / remote calls from the five tools | None in the acceptance walkthrough |
| Required Home baseline regression | PASS, Chrome; layout, shortcuts, shared timer, scenes, contrast and offline behavior |
| Required Stats/Notifications shared-panel regressions | PASS, Chrome and Edge; history, CSV, themes, keyboard, inbox retention and reduced motion |

Evidence: [Chrome results](qa-results/work-context-chrome.json), [Edge results](qa-results/work-context-edge.json), [Chrome tab fixture](qa-results/work-tabs-chrome.json), [Edge tab fixture](qa-results/work-tabs-edge.json). Screenshots: [Capsules desktop](screenshots/work-edge-capsules-dark-1440.png), [Planner mobile](screenshots/work-edge-energy-light-320.png). The automated tab fixture changes permissions only in its isolated manifest; the production manifest retains optional `tabs`.

## Limits and decisions

- The browser-native optional-permission consent dialog could not be operated in headless automation. Its production request and declined-result path are exercised; granted tab behavior uses an isolated fixture. A human native-consent click remains a manual release check. No production grant was bypassed.
- Capsules copy note text, links and checklist state. Image/audio attachments stay in the original Notes; they are not duplicated into capsules. This is stated beside the note selector. Restore never overwrites newer task text or newer capsule note copies. Missing uploaded wallpaper causes a recoverable error rather than silently switching scenery.
- Restored timer intervals are fresh recovery intervals using saved remaining time. Previously elapsed work is not credited twice. Saved Scene ID is restored alongside the captured wallpaper/audio/timer settings; the capsule does not replace the user's current typography/layout or grant permissions.
- DNA compares observed associations, not causal effects. Conditions are captured at session start; later sound/wallpaper changes are not attributed retroactively. Break length is the planned preference, not a measured recovery quality. Tab switches include legitimate research and returning to ONEFLOW. Partial-counting sessions are excluded from switch-condition comparisons. Observations collected while learning is disabled are not added to DNA.
- The planner does not connect a calendar, move browser events, split one task across blocks or enforce a schedule. Oversized/incompatible tasks remain explicitly unplaced. AI and calendar integration were optional in the request and are excluded from this stage.
- The previously documented sub-300 ms startup target is still unresolved; this stage preserves the initial-JavaScript budget and lazy-loads the five tool screens. Firefox has not been tested.
- Existing unrelated workspace changes were preserved. No combined commit was made. No product decision requires user approval to use this release.

Stage complete. No subsequent stage started.
