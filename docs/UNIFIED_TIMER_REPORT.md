# Unified Timer Update Report

Date: 2026-10-03. This update implements the approved single timer design on top of Stage 3. There is one background-owned session and one reusable timer view; no new permissions, providers or schema changes.

## Built

- Idle: choose an unfinished task or type a daily/custom focus, set 1–180 minutes and select Start focus. The chosen duration is remembered for the next task session.
- Running: title, one countdown, progress, Pause and End session.
- Paused: same title/progress, Resume and End session; elapsed time is recorded once when ended.
- Break: the same view, labeled Break, with Start/Pause/Resume and Skip break. Reflection remains available.
- Fullscreen Flow: the same view expands. Entering preserves a running or paused session, its task, identity and deadline; leaving restores appearance and clears blocking while the timer continues on the dashboard. End session is the explicit action that ends it.
- Task-row Start closes Tasks and updates the shared dashboard view. Other new tabs reflect the same session.
- Focus dock: durations, rhythm and notification preferences only; the duplicate countdown and timer controls are removed.
- Daily-focus completion, local draft restore/discard, shared keyboard controls and scene restoration are retained. Mobile controls wrap and the desktop dock remains visible.

## Files

~~~text
components/session-view/index.js  shared timer rendering/actions
components/focus/index.js         dashboard host and daily completion
components/focus/style.css        shared layout and compact sizing
components/flow/index.js          fullscreen host, same view/state
components/timer/index.js         settings-only dock panel and deadline reconciliation
components/tasks/index.js         task start returns to dashboard
background/focus-service.js       Flow entry/exit preserves current timer
core/timer-logic.js               validated custom duration at idle start
core/timer-engine.js              atomic duration preference and task-title resolution
core/i18n.js                      central labels/errors
 tests/unified-timer.test.js       duration/state invariants
 tests/unified-timer-browser.js    Chrome/Edge interactions
 docs/qa-results/unified-*.json    verification results
 docs/screenshots/unified-*.png    final running/mobile captures
~~~

## Acceptance

| Check | Result |
|---|---|
| Custom task/daily focus starts the chosen duration | PASS |
| Running/Pause/Resume/End share a single view | PASS |
| End logs partial task time exactly once | PASS |
| Break start and Skip break use the same view | PASS |
| Fullscreen preserves paused state and running deadline | PASS |
| Task Start returns to dashboard | PASS |
| Focus settings has no duplicate countdown | PASS |
| Two tabs share the same session identity | PASS |
| Mobile width, desktop dock bounds and page errors | PASS |
| Unit tests | 41/41 PASS |
| Chrome/Edge focused browser checks | 9/9 each PASS |
| Chrome Stage 3 regression including actual DNR lifecycle | 20/20 PASS |

Run node scripts/check.js and node --test tests/*.test.js. With ONEFLOW_NODE_MODULES pointing to the optional Playwright runtime, run node tests/unified-timer-browser.js chrome and edge. The expanded regression is node tests/stage3-browser.js chrome. Extracted release validation uses tests/package-browser.js for Chrome and Edge.

## Load and limits

Reload ONEFLOW in chrome://extensions or edge://extensions and open a fresh new tab; refresh the localhost preview for a browser preview. Load unpacked from D:\BOOKS\ONEFLOW, or extract release/oneflow-1.0.0.zip and select its manifest folder. No compilation is needed. The release archive/checksum are rebuilt with this update.

The clock and calendar countdown widgets remain distinct; task rows only show recorded minutes. Fullscreen is a presentation mode, so Leave Flow does not end a session. Blocker rules still release when leaving Flow, pausing or entering a break. Existing Stage 3 manual checks for permission prompts, physical crashes, perceived audio and assistive technology remain applicable; this update does not claim new verification of those items.

No design decision is awaiting input. Git identity is still unconfigured, so the changes are saved without a new commit.
