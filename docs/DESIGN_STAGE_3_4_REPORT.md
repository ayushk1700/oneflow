# Design Stages 3 and 4 — Focus, Ambient and tool discovery

Implemented on 13 October 2026 following the user's instruction to start Stages 3 and 4. Chrome acceptance passes. Edge remains unverified because the installed browser crashes before the extension loads. This report covers the source checkout; it is not a full release approval. Stop before Stage 5.

## Stage 3: built and preserved

- Focus keeps one dominant countdown, lighter task heading, labeled progress and pause/resume, end, sounds and exit controls. Session options now remain available in ordinary Focus: session settings, fullscreen, capsule capture and resume-note entry are disclosed behind one quiet summary. Explicit saved Studio compact preferences remain authoritative.
- Home, Focus, Ambient and fullscreen Flow continue to use the existing background timer owner. No second timer, session restart, schema migration or replacement of a running interval was introduced. Existing capsule restoration reads current state under the timer lock and refuses running/paused active sessions.
- Ambient retains the scenery-first composition, lower-left matte clock/local-time caption, clear center, scene picker, shared sound controls, Back to Home, More and Immersive. Scene selection changes the backdrop without autoplay. Clock/sounds visibility preferences apply.
- Immersive idle handling now observes focus leaving controls and disclosure changes, including non-bubbling toggle events. After a menu closes or focus leaves, controls can fade again after four seconds. Pointer/keyboard activity reveals controls; focused controls/open menus remain visible; Escape exits immersion.
- Running, paused and completed sessions retain their identity, remaining time/deadline or break phase across view changes. Flow remains the existing fullscreen/blocking workflow.

## Stage 4: built

- Added one lazy tool catalog shared by All tools, Switch tool and command search. Five hubs follow the constitution, each with at most six tools. System utilities, dedicated Notes/Journal shortcuts and separate Mood/Session reflection shortcuts follow them. The existing Layout route remains accessible and retains its saved favorite/recent ID.
- Preserved current display labels. Added historic names, existing `Open …` command names and proposed labels such as Resume work, Next steps, Day planner, Meeting follow-up and Energy check-in as search aliases. No tools were merged or renamed without an approved naming decision.
- Favorites remain explicit, stored locally with stable IDs; recent tools are recorded only on explicit launches from the launcher, switcher or commands. Existing saved preferences and backups remain valid. Disabled tools are excluded consistently.
- Expanded Switch tool from a few dock entries to a bounded, searchable, grouped list of enabled tools. All tools is available from ordinary panels; the launcher avoids a redundant back link to itself. Settings and Website blocking retain their dedicated workspace routes.
- Kept lifecycle, headings, close controls, native dialog focus handling and return-focus behavior in `core/ui.js`. Escape is intercepted during capture so the first press closes a panel even if an inner search control handles keys. Late navigation imports cannot repaint a different panel. Discovery modules load only for standard panels, not during initial Home or dedicated workspace opening.
- Removed legacy All tools frame overrides, including its competing blur rule. Standard panels use solid theme surfaces, a 20px radius, and 24px desktop/16px compact padding. Shared text/link wrapping handles long URLs. Existing flat sections, contextual tabs and mobile collection strips remain in use.
- Retained live editor DOM, selection and context during tool switching. Notes, Journal and Settings retain independent fullscreen navigation. Live retention ends when the modal closes; this does not promise reload persistence for every field.

## Changed file tree

```text
core/
  tool-catalog.js                   new shared lazy discovery metadata/actions
  panel-navigation.js              global searchable switcher
  ui.js                            keyboard/async navigation lifecycle
components/
  ambient/index.js                 idle resume after focus/menu changes
  commands/index.js                catalog and historic/proposed aliases
  tools/index.js                   five hubs, utilities and shortcuts
  panel-design/style.css           bounded switcher and full-width search
newtab/
  dashboard.css                    disclosed Focus options; remove competing frame
  system.css                       shared panel radius and long-link wrapping
  widgets.css                      regenerated widget styles
  app.css                          regenerated application styles
tests/
  design-stage-3-4-browser.js       new unpacked-extension acceptance
  ambient-redesign-browser.js      menu/keyboard idle and saved visibility checks
docs/
  DESIGN_CONSTITUTION.md           placement decision and append-only log
  RELEASE_CHECKLIST.md             named Stage 3/4 acceptance coverage
  DESIGN_STAGE_3_4_REPORT.md        this report
  qa-results/design-stage-3-4-*.json
  qa-results/ambient-redesign-chrome.json
  qa-results/design-foundation-chrome.json
  qa-results/panel-redesign-chrome.json
  qa-results/design-stage-3-4-baseline.json
  screenshots/design-3-4-*.png
```

The working tree already contained earlier work. It was preserved; no combined commit was made. No dependencies, permissions, secrets, third-party calls, or saved-data migrations were added.

## Load and test

1. In Chrome, open `chrome://extensions`, enable Developer mode, choose Load unpacked and select `D:\BOOKS\ONEFLOW`. Reload an already installed checkout and open a fresh new tab.
2. Start a linked or custom focus session. Open Session options, save context or leave a resume note, then close the panel. Pause, switch to Ambient, use its session pill to return, and verify the same interval. Check fullscreen Flow separately.
3. In Ambient, choose scenery with audio paused; verify it stays paused. Use shared playback/volume/mute controls. Enable Immersive, leave controls unfocused for four seconds, then reveal them by keyboard/pointer. Test More open, keyboard focus and Escape.
4. Open More → All tools. Search current/proposed names, bookmark a tool, launch it, and switch to another tool and back while an editor has unsaved text selected. Check first-Escape dismissal, light/dark themes, 320px/390px widths, tabs and long links.

Reproduce the automated checks from the repository root:

```powershell
node scripts/styles.js
node scripts/check.js
node --test tests/*.test.js
$env:ONEFLOW_NODE_MODULES = 'C:/Users/ayush/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules'
node tests/design-stage-3-4-browser.js chrome
node tests/ambient-redesign-browser.js chrome
node tests/unified-timer-browser.js chrome
node tests/panel-redesign-browser.js chrome
node tests/design-foundation-browser.js chrome
node scripts/measure-design-baseline.js chrome --output=design-stage-3-4-baseline.json
```

The package path is machine-specific and test-only. Browser runners create disposable profiles and load the real unpacked source. The completed-session test advances a fixture deadline, then asks the actual timer owner to reconcile it and checks one completed history record. It does not wait a full minute or bypass the completion implementation.

## Acceptance checklist

| Criterion | Result | Evidence |
|---|---|---|
| MV3 manifest paths, CSP, syntax, safe rendering, local quotes | PASS | `scripts/check.js` |
| Existing data/timer/schema behavior | PASS | 104 unit tests |
| One countdown; task-linked/custom intervals; fullscreen continuity; one elapsed-time record; shared breaks | PASS | Unified timer: 9 check groups |
| Focus options, progress, resume-note return focus, active capsule protection, paused continuity and completed break phase | PASS | Design Stage 3/4 acceptance |
| Ambient lazy loading, both themes, desktop/compact fit, no autoplay, shared audio, four-second idle, open-menu/focus protection, keyboard reveal, Escape, preferences, offline continuity | PASS | Ambient redesign: 6 check groups |
| Five hubs, independent shortcuts, old/proposed aliases, disabled-tool exclusion, global switching and editor selection | PASS | Design Stage 3/4 acceptance |
| Solid standard frame, 20px radius, 24px/16px padding, Arrow/Home/End tabs, first Escape, mobile switcher, 2,000-character URL wrapping | PASS | Design Stage 3/4 acceptance |
| Favorites/recents, independent collections, contextual drafts, offline saved favorites | PASS | Panel redesign: 8 check groups |
| Dedicated workspace surfaces/navigation, Settings return focus, saved Studio/appearance, reduced motion, nine-group Home | PASS | Design foundation: 6 check groups |
| Chrome page errors and unwanted network requests | PASS | Applicable browser JSON reports contain empty error/request arrays |
| Edge acceptance | UNVERIFIED | Startup crash before extension load; `design-stage-3-4-edge.json` |
| Initial JS | PASS | 152,825 bytes / 153,600-byte cap |
| Stage 3/4 cached startup measurement | FAIL | Median 268.2ms, maximum 664.6ms; preserved baseline JSON |

## Performance and limits

Final source measurements are recorded in `qa-results/design-stage-3-4-baseline.json`. The hard gates remain initial static application JavaScript below 153,600 bytes and every cached initialization sample below 300ms. Lazy discovery metadata is excluded from the eager graph and is not requested at initial Home.

The Stage 3/4 run exceeded the startup target. It is retained as a failure, not waived. The user subsequently authorized Stages 5/6; their report records the final source measurement after functional browser suites have closed. This initialization mark is not a paint measurement.

Known limits: Edge startup crashes with exit code 3221225477/crashpad errors before loading ONEFLOW. Firefox, audible output, native permission prompts, screen-reader speech, exhaustive scene contrast, crash/restart recovery and extracted-release testing remain separate release gates. Chrome automation verifies accessible labels/focus/progress and media state, not human auditory or screen-reader quality. No release/package/publish step was performed.

## Decisions and stopping point

The user asked which placement is best for omitted Mood/Session reflection tools. The chosen arrangement keeps both separate below the hubs, preserving discovery without expanding Reflect beyond six or merging workflows. Current display names remain; proposed plain-language names are searchable. Layout remains an existing shortcut into Customize, preserving favorites rather than silently removing a route. No further input is needed to complete these stages.

Stages 3 and 4 are implemented. Stop before Stage 5.
