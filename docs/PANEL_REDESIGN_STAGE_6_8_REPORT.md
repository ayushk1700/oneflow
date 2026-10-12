# Panel redesign Stages 6–8 report

Date: 2026-10-12. Stages 6 and 7's scoped UI refinements are implemented. Stage 8's audit ran, but it is **not fully passed**: cached startup outliers exceed the target and Firefox/native permission/provider verification remains outstanding. The attached recommendation is separately audited: **49 entries, 15 main-layout matches, 34 partial matches**. See `PANEL_REDESIGN_RECOMMENDATION_STATUS.md`; stage completion does not claim every suggested extra feature exists.

## Built

Stage 6 separates Daily check-in Today/History, discloses optional priorities/draft management, restores saved Session reflection text, labels Mood history, leads Suggestions with one idea, separates Stats Overview/Patterns and adds notification text/All/Unread/Attention filters. Existing chart calculations, CSV, bounded history and clear confirmation remain.

Stage 7 adds searched/date-ordered Countdown milestones, clearer keyboard command guidance/result counts, focused web search, disclosed Dictionary connection/privacy controls, Help/Feedback contexts with live draft retention, and searchable Customize categories. Layout switches the existing live editor context without discarding preview edits. Help text now describes the actual Home navigation. Local feedback export and explicit provider consent remain.

Stage 8 checks packaged ZIP integrity, optional grants/CSP, offline tool loading, privacy documentation, startup requests/errors and eight cached ready measurements in Chrome and Edge. No Firefox executable was located in checked standard/runtime paths. Native permission dialogs and real external provider availability remain manual checks. No publishing occurred.

No new dependency, permission, schema or remote service was introduced. Eager JS remains 149.9 KiB of 150 KiB. Substantial pre-existing workspace changes are preserved; no combined commit was made.

## File tree

```text
components/
  rituals/index.js, reflection/index.js, mood/index.js
  suggestions/index.js, stats/index.js, notifications/index.js
  countdowns/index.js, commands/index.js
  dictionary/index.js, websearch/index.js, support/index.js
  customizer/index.js            shared editor; Layout retains its existing entry
core/ui.js                       retained Feedback view
newtab/system.css, widgets.css, app.css
scripts/package.js               includes redesign docs/status
tests/panel-remaining-browser.js
tests/release-audit-browser.js
tests/studio-browser.js           current catalog/entry-point acceptance
docs/DESIGN_CONSTITUTION.md
docs/PANEL_REDESIGN_STAGE_6_8_PLAN.md
docs/PANEL_REDESIGN_STAGE_6_8_REPORT.md
docs/PANEL_REDESIGN_RECOMMENDATION_STATUS.md
release/oneflow-1.0.0.zip, .zip.sha256
```

## Load and try

Reload the unpacked extension in Chrome or Edge and open a new tab → More. Try Today/History in Daily check-in, Overview/Patterns in Stats, notice filters, milestone search, Help/Feedback and Find a category in Customize. Feedback drafts remain during live tool switching; ritual/reflection fields use their existing local autosave. Layout uses the same preview editor, with Save/Cancel retaining existing semantics.

The local ZIP is prepared for testing. Extract it into a directory and Load unpacked there. It is not a claim of final release readiness.

## Acceptance

| Check | Result |
|---|---|
| Manifest, CSP, syntax, safe DOM and style consistency | PASS |
| Unit suite | PASS — 103 tests |
| Initial JavaScript | PASS — 149.9 KiB / 150 KiB |
| Remaining panel workflows, saved records, filters, keyboard navigation, local feedback download, explicit web search | PASS — Chrome and Edge, nine groups each |
| Dictionary denied permission, safe provider text, offline session cache | PASS — controlled response |
| Customize category search and Layout retaining preview | PASS — Chrome and Edge |
| Stats/Notifications calculations, CSV, errors/retry, history/clear behavior | PASS — Chrome and Edge, six groups each |
| Calm Home regression | PASS — Chrome, eight groups |
| Desktop 1440/mobile 390/320px, both themes, reduced motion | PASS — assertions and screenshot inspection |
| Offline reload and unexpected external requests/page errors | PASS — remaining panel suites |
| Release ZIP SHA-256, CRC, safe contents, strict CSP, optional hosts, offline tool loading | PASS — extracted package in Chrome and Edge |
| Every cached open below 300 ms | FAIL — Chrome median 261.2/max 434.5 ms; Edge median 208.6/max 656.1 ms |
| Firefox runtime | NOT VERIFIED — no executable located in checked paths |
| Native consent and real-provider availability | NOT VERIFIED — manual gates remain |

The startup check uses eight reloads after a warm-up and records the existing `oneflow-ready` mark. Several opens meet the target, but occasional outliers mean the all-opens requirement has not passed; this report does not substitute the median for the requirement.

Evidence: [Chrome panels](qa-results/panel-remaining-chrome.json), [Edge panels](qa-results/panel-remaining-edge.json), [Chrome release audit](qa-results/release-audit-chrome.json), [Edge release audit](qa-results/release-audit-edge.json), [Notifications](screenshots/remaining-chrome-notifications-light-1440.png), [Daily check-in mobile](screenshots/remaining-chrome-rituals-light-320.png), [Layout mobile](screenshots/remaining-chrome-layout-light-390.png).

## Remaining work

The 34 partial recommendation entries retain specific design/feature details listed in the recommendation status file. Completing them requires further scoped work; they are not claimed complete here. Stage 8 additionally needs startup outlier investigation, Firefox runtime validation, native optional-consent checks and real-provider acceptance before release. The package is local and unpublished. Stop after this report.
