# Design Stages 7 and 8 — Reflect, Learn/Career, Environment and System

Implemented on 13 October 2026 following the user's instruction to start Stages 7 and 8. Existing implementations were inspected and preserved where they met the constitution. Chrome functional acceptance passes; Edge remains unverified because its installed browser crashes before loading the extension. This is source-checkout verification, not release approval. Stop before Stage 9.

## Stage 7

- Energy Weather keeps voluntary Check in, History and Recovery contexts and its saved shutdown history. Afterglow keeps a searchable meeting collection with one selected meeting and separate Overview, Actions and Follow-up. Suggestions leads with one deterministic local idea and discloses alternatives.
- Stats now keeps its selected range and contextual view during live tool switching. On return it reads fresh session history using the same selected range. Detached or superseded renders cannot create a chart in a hidden old view. The shared tab helper emits a context-change event for both pointer and keyboard navigation; returning to Overview resizes the chart after layout. Existing accessible daily data, partial/completed totals, day/week/month windows, local CSV and retry states remain.
- Recall Rooms, Idea Garden, Skill Loops and Career Sprint retain searchable collections, one selected detail, contextual pages, disclosed capture and live drafts. Existing collection/detail selections and tab choices survive saves through the shared selection map. No reload persistence is promised for every field.
- Recall's concept constellation now has an explicit semantic group role. Skill progress is a named semantic group; recorded evidence shows its actual recall confidence as text. Both due and future skill reviews display a date. Existing concept confidence/review dates, review controls and responsive collections remain readable without relying on color.
- Proof of Work retains separate Work history, Deliverables and Review report contexts. Preparing a report re-reads current project evidence and session references. Every exported line requires its own checkbox approval; unapproved evidence is excluded. Fresh-evidence and actual CSV-content checks passed.
- Dictionary retains disclosed optional access/privacy, bounded text-safe provider responses, an explicit lookup action and dashboard-session caching available offline. Browser web searches remain explicit. No service or privacy opt-in was added.

## Stage 8

- Sounds retains Mixer, Saved mixes and Sleep with shared background-owned audio. On live resume it now refreshes current master volume and saved mixes even when a previous focused control intentionally skipped a storage update. Scheduled stop/cancellation status remains tied to saved owner state.
- Scenes retains searchable Built-in/Saved collections and one selected atmosphere. Capture, duplicate, rename and deletion remain disclosed. Existing async ownership guards prevent a pending Scenes open or refresh from replacing another tool. Apply/undo preserve the active session identity and deadline.
- Music keeps Listen/Search, disclosed API credentials and explicit load/search actions. Loading a result returns to Listen. Playback/bridge/iframe and search requests are disposed on exit while input drafts survive live switching. Added a load generation guard: a persisted player load that finishes after leaving Music cannot reconnect when the user returns. Cancelled searches show a paused status rather than an indefinite searching message. Controlled-provider handshake, controls, safe search results and foreign-window rejection pass.
- Toasts remain dismissible inside the modal top layer, pause automatic dismissal on hover/focus, and keep errors until dismissed. These existing behaviors were exercised using real timeouts and keyboard dismissal.
- Notifications retains local 40-record history, search, All/Unread/Attention filters, read state and confirmed clearing. Command search retains keyboard guidance, result counts and the shared alias catalog. Help/Feedback retains separate contexts, live drafts and user-authored local downloads.
- Customize keeps nonmodal preview and searchable categories. Layout changes the existing editor category without discarding preview edits. Concurrent opening requests now serialize to one editor with the latest requested category; a pending open cannot replace another tool. Cancel/save restores a visible trigger rather than the hidden Settings shortcut. Pending component destruction also invalidates its opening generation.

No tools were merged or renamed, no permanent Home controls added, and no dependencies, permissions, services or tracking introduced. Saved settings, data, privacy choices and active timer ownership remain. The pre-existing working tree was preserved; no combined commit was made.

## Changed file tree

```text
core/
  ui.js                            retain the live Stats view
components/
  panel-design/index.js            keyboard/pointer context-change notification
  stats/index.js                   retained range, fresh resume, chart lifecycle
  recall/review.js                 semantic concept group
  skills/index.js                  semantic progress, confidence and review dates
  sounds/index.js                  fresh values on live resume
  music/index.js                   cancel pending loads and truthful search status
  customizer/index.js              concurrent/late opening and focus restoration
newtab/
  widgets.css, app.css             regenerated/verified styles
tests/
  design-stage-7-8-browser.js       targeted unpacked-extension regression checks
  music-api-browser.js             wait for onboarding dismissal before opening
docs/
  DESIGN_CONSTITUTION.md           append-only decision log
  RELEASE_CHECKLIST.md             named Stage 7/8 checks
  DESIGN_STAGE_7_8_REPORT.md        this report
  qa-results/design-stage-7-8-{chrome,edge}.json
  qa-results/panel-{redesign,environment,remaining}-chrome.json
  screenshots/design-7-8-chrome-stats-320.png
  screenshots/{panel-redesign,environment,remaining}-chrome-*.png
test-results/                      existing ignored diagnostic artifacts
  music-api-chrome-report.json
  stage56-chrome-report.json       existing Stats/notification runner filename
  design78-downloads/              actual approved CSV export checked by runner
```

The Music API test now waits for onboarding's asynchronous dismissal before opening its panel. This repairs a test race; the onboarding implementation was not changed. Provider fixtures use a dummy key and intercepted responses, not a real account or production key.

## Load and test

Open `chrome://extensions`, enable Developer mode and Load unpacked → `D:\BOOKS\ONEFLOW`, or reload the existing checkout. Open a fresh new tab. No compilation is needed to run the extension.

Manual acceptance walk:

1. In More → All tools, open the Reflect and Learn/Career collections. Search/select records, switch contextual tabs with arrows/Home/End, edit a draft and switch tools and back. Check actual confidence, dates and saved selections.
2. In Stats, change the range, select Patterns, use Home to return to Overview, then switch tools and return. Verify chart sizing and latest recorded history. Inspect daily data and export CSV.
3. In Proof of Work, prepare a report after changing evidence/session references. Attempt export with no approval, then approve only one line and inspect the downloaded CSV.
4. In Sounds, test saved mixes, master volume and sleep cancellation. Apply and undo a Scene during a running session and compare the same timer deadline.
5. In Music, use an explicitly chosen provider connection; switch tools during playback/search and return. The inputs remain while playback stops. Review credential/privacy disclosure and test denial/error states.
6. Open Customize and Layout rapidly. Confirm one editor and preserved preview changes. Cancel back to a visible control. Exercise modal notices, hover/focus pauses, persistent errors, inbox filters and confirmed clearing. Feedback exports stay local.

Reproduce from the repository root:

```powershell
node scripts/styles.js
node scripts/check.js
node --test tests/*.test.js
$env:ONEFLOW_NODE_MODULES = 'C:/Users/ayush/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules'
node tests/design-stage-7-8-browser.js chrome
node tests/design-stage-7-8-browser.js edge
node tests/panel-redesign-browser.js chrome
node tests/panel-environment-browser.js chrome
node tests/panel-remaining-browser.js chrome
node tests/stats-notifications-browser.js chrome
node tests/music-api-browser.js chrome
```

The runtime path is machine-specific and test-only. Browser tests use disposable profiles and load the real unpacked extension. The new pending-player regression holds the actual storage lock, switches out and back, then releases the write and verifies no iframe reconnects. Proof modifies saved evidence after opening the view and reads the actual approved CSV download. Toast timing checks wait beyond the six-second dismissal period.

## Acceptance checklist

| Criterion | Result | Evidence |
|---|---|---|
| Manifest references, CSP, syntax, safe rendering and 500 local quotes | PASS | `scripts/check.js` |
| Existing schemas, timer logic, privacy, parsing and local suggestions | PASS | 104 unit tests |
| Stats keyboard resizing, live range/context and fresh history on resume | PASS | Stage 7/8 regression runner |
| Fresh report evidence/session references and per-line approved CSV contents | PASS | Stage 7/8 regression runner |
| Semantic skill progress, recorded confidence and explicit dated reviews | PASS | Stage 7/8 regression runner |
| One Customize editor, latest category, late-result rejection and visible return focus | PASS | Stage 7/8 regression runner |
| Pending Music load cancellation, live input draft and no reconnect | PASS | Stage 7/8 regression runner |
| Sounds fresh resume; stale Scenes open rejection; apply/undo deadline continuity | PASS | Stage 7/8 regression runner |
| Modal toast hover/focus pauses, persistent error and 40-record inbox/confirmed clear | PASS | Stage 7/8 regression runner |
| Searchable collections, contextual drafts, saved selections, recall editing, theme/mobile/offline behavior | PASS | Panel redesign: 8 check groups |
| Sounds/Scenes/Music, explicit connection, denied permission and environment mobile/themes/offline | PASS | Panel environment: 6 check groups |
| Energy/meeting/project views and explicit report approvals | PASS | Stage 5/6 panel-planning evidence: 9 groups; freshly changed report additionally tested here |
| Suggestions, Stats, Notifications, commands, feedback draft/export, Dictionary privacy/cache and Customize/Layout | PASS | Panel remaining: 9 check groups |
| Stats zero/error/retry, daily totals/data/CSV, shared/dedicated frames, modal notices and notification history | PASS | Stats/notifications: 6 check groups |
| Provider handshake/control messages, safe API fixture results, foreign-window rejection and player cleanup | PASS | Music API: 5 check groups |
| Reduced motion and compact/light/dark layouts | PASS | Applicable browser suites and saved screenshots |
| New targeted suite page errors/unwanted external calls | PASS | Empty error and request arrays |
| Initial static JS below 153,600 bytes | PASS | 152,833 bytes, 149.25 KiB; checker displays 149.3 KiB |
| Edge | UNVERIFIED | Startup crash, exit 3221225477, before extension loading |
| Cached startup below 300ms | OPEN / previously FAIL | Stage 5/6 baseline: median 331.3ms, maximum 425.7ms; not reclassified as passed |

## Limits, decisions and stopping point

Edge remains unavailable for extension verification. Real provider availability, native permission prompts, audible playback, screen-reader speech, Firefox, exhaustive scene contrast, startup performance and extracted-release validation remain release work. Controlled provider fixtures verify integration and cleanup, not current service availability. No full Stage 9 audit, package, store submission or publish action was performed.

The initial graph increased by eight bytes for Stats retention and remains within its established hard cap. Most changes are lazy tool code. The prior failed cached-startup measurements are preserved; no thresholds were changed. Functional implementation of Stages 7 and 8 is complete. No further user decision is required. Stop before Stage 9.
