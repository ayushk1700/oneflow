# Stage Report: market-readiness implementation

Date: 5 October 2026. Target: Chrome and Edge. Runtime remains plain HTML/CSS/ES modules, Manifest V3, without a build requirement or new vendor dependencies.

## What was built
1. Clear positioning: a private workspace in every new tab, with students as the initial audience hypothesis. Updated extension description, README and benefit-led store listing.
2. First-session onboarding: choose one of three local scenes, enter a task, start a linked session. Skip remains available. Personalization lives in Settings. No onboarding permission requests, audio autoplay or network connections.
3. Simplified navigation: labeled Tasks, Sounds and Scenery dock. Tools shows focus essentials first, with planning, reflection and occasional tools in expandable groups. Advanced features remain available.
4. Complete focus cycle: last-session duration/title survives reload; complete the linked task, take a break, continue in one revision-checked transition, or open local progress. Completed tasks are excluded from the next-task chooser. Secondary controls live under Session options.
5. Browser-default search: both surfaces use chrome.search.query. The search permission is documented. Preview mode explains that installed-browser search is unavailable; it never silently selects a different provider.
6. Trust and recovery: schema 5 migration, compatible encrypted backup/restore, clearer backup guidance, locally generated privacy and support pages, local-only feedback download. Actual HTTPS publisher links are configurable and hidden until supplied.
7. Launch kit: 1280×800 screenshots, a 440×280 promo image, a silent 20-second walkthrough assembled from six real UI captures, store copy, submission checklist and two-week beta protocol. No invitations, uploads, accounts or publication were performed.
8. Performance and legibility: lazy onboarding code, preloaded critical local modules, background metadata no longer gates controls, and corrected light-theme date contrast.

## File map
```
manifest.json
newtab/{index.html,newtab.js,sketch.css,widgets.css,app.css}
components/
  onboarding/{index.js,style.css}
  session-view/index.js
  search/index.js
  websearch/index.js
  settings/{index.js,data-tools.js}
  support/index.js
core/
  search.js, publisher.js, schema.js, stage2-schema.js
  timer-client.js, timer-engine.js, timer-logic.js, backup.js, features.js, ui.js
background/service-worker.js
scripts/{launch-pages.js,launch-demo.js,launch-captures.js,package.js,check.js}
tests/{market-ready.test.js,market-browser.js,...updated regression navigation}
docs/
  MARKET_RELEASE_REPORT.md, LAUNCH_CHECKLIST.md, BETA_GUIDE.md
  STORE_LISTING.md, PRIVACY_POLICY.md, PERMISSIONS.md, QA.md, CHANGELOG.md
  launch/{privacy.html,support.html,launch.css,*.png,promo.svg,oneflow-demo.webm}
release/{oneflow-1.0.0.zip,oneflow-1.0.0.zip.sha256,SCREENSHOTS.json}
```

## Load and test
Export a backup from your existing installation first. On chrome://extensions or edge://extensions, enable Developer mode and load D:\BOOKS\ONEFLOW, or extract the release zip and load that directory. Reload an existing unpacked installation and reopen its tabs. Review the added search permission if prompted. No compilation is needed to run the extension.

For a first-run check, use a disposable browser profile. Choose Study café, enter a task, and start. Pause in another tab, reload offline, then resume. Complete a session, mark the task complete, and start the next one. Open all three dock tools and the expandable Tools groups. Use Help & feedback to download a message and open the local privacy page. Export an encrypted backup and restore only in a disposable profile.

Automated commands (browser tests use the provided Playwright runtime through ONEFLOW_NODE_MODULES):
```
node --test tests/*.test.js
node scripts/check.js
node tests/market-browser.js chrome
node tests/market-browser.js edge
node tests/unified-timer-browser.js chrome
node tests/stage3-browser.js chrome
node tests/stage3-browser.js edge
node tests/lookup-browser.js
node scripts/package.js
node tests/package-browser.js chrome
node tests/package-browser.js edge
```

## Acceptance evidence
Test reports are retained under docs/qa-results/market-*; screenshots use sample data in isolated profiles. Completion screenshots use an advanced deadline, not an observed study session. Startup figures describe this Windows test machine, not a guarantee for every laptop. Automated keyboard/layout checks do not certify WCAG conformance.

| Acceptance | Result |
| --- | --- |
| Unit/schema/timer/search/security checks | PASS — 58 tests |
| Manifest, strict CSP, local assets, source syntax and safe DOM checks | PASS |
| Initial JavaScript below 150 KiB | PASS — 142.5 KiB |
| First-run scene/task/session, no external requests or host grants | PASS — Chrome and Edge |
| Cross-tab pause/resume, offline reload and completion persistence | PASS — Chrome and Edge |
| Complete task, continue focusing and encrypted recovery | PASS — Chrome and Edge |
| Browser-default search | PASS — real Chrome/Google and Edge/Bing APIs, requests intercepted by test fixtures |
| Local feedback export, privacy page and disclosed advanced tools | PASS — Chrome and Edge |
| 1280, 390 and 320 px layouts, reduced motion and shortcuts | PASS — automated checks and visual review |
| Eight cached opens after startup optimization | PASS — Chrome 100.5–168.4 ms (median 122.9); Edge 160.9–241.7 ms (median 173.7) |
| Unified session/fullscreen/task regression | PASS — Chrome |
| Real website redirects, overrides, worker suspension and normal browser restart | PASS — Chrome and Edge, isolated host-granted fixtures |
| Optional dictionary and new-tab search regression | PASS — Chrome, with permission denial and safe/offline provider fixtures |
| Full panel/settings regression, drafts and saved timer preferences | PASS — Chrome |
| Extracted release archive, offline privacy and no startup host grants | PASS — Chrome and Edge; 178 files, approximately 2.94 MiB |

An intermediate performance run exceeded 300 ms (Chrome up to 480.5 ms, Edge up to 588.9 ms). Background metadata was removed from the critical control path and key local modules preloaded before the final measurements above. This is a measured improvement, not a claim about physical low-end devices.

## Remaining human and publisher work
- NOT COMPLETE: actual support/contact destination and publicly hosted privacy URL. Supply these in core/publisher.js and run `node scripts/launch-pages.js --release`. Normal beta packaging works without invented URLs; release-page validation deliberately fails until both are set.
- NOT COMPLETE: assistive-technology reading order with NVDA/Narrator, perceived audio loop/chime quality, visible OS notifications, physical sleep/wake and forced process-crash recovery, live optional-provider playback/keys, and touch-device usability. Automated worker suspension and normal browser restart checks are distinct from these.
- NOT COMPLETE: the two-week, 15–20-person pilot. BETA_GUIDE.md contains the ready-to-run protocol; no participants have been recruited or observed. Market fit and retention are unproven.
- NOT COMPLETE: store account submission/review and public hosting. No external messages or publications were sent.
- Firefox remains unverified. Core use is offline; connected services and web search need the internet. Personal records do not automatically sync across devices.

## Repository handling
The repository already contained extensive staged and unstaged work. Changes were applied in place without resetting, overwriting the index or committing unrelated work. No new dependency or analytics service was added. This stage stops with its report and does not begin another stage.
