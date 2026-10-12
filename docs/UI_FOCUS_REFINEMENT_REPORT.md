# ONEFLOW UI focus refinement

Completed 11 October 2026.

## Built

Home now gives the clock and editable daily focus more room. The duration selector offers 25 minutes, 50 minutes, and a validated custom duration. Choosing an unfinished task displays its title in the focus entry while retaining the custom draft for switching back. The existing service-worker session remains the sole timer.

The quote sits above the footer on tall desktops and stays in flow on compact screens. Attribution, favorites and refresh actions open through a native keyboard/touch disclosure. Search and corner shortcuts use quieter surfaces. Focus has a lighter task heading and comfortable secondary targets. Session results offer continuation and a break alongside existing completion/progress actions.

Appearance shows common controls before Advanced customization and includes a typography preview that updates with saved clock size/weight. The timer settings form loads only when opened to keep initial JavaScript below the existing limit. Notes and Journal retain their intentional full-screen designs.

The default bundled wallpaper has separate refined desktop/mobile focal points. Localized linear shading preserves scenic detail, while uploaded bright images retain stronger backing. A discovered layering issue is fixed: More stays above the Ambient clock.

## Changed files

```text
components/session-view/index.js     focus setup and session follow-up actions
components/quotes/index.js           native attribution/action disclosure
components/settings/index.js         progressive Appearance and preview
components/timer/index.js            eager timer lifecycle only
components/timer/preferences.js      deferred existing preferences form
newtab/tokens.css                    quiet shared canvas surface
newtab/dashboard.css                 composition, controls, readability, layering
newtab/system.css                    Appearance preview and Studio treatment
newtab/app.css                       regenerated application styles
newtab/widgets.css                   regenerated widget styles
data/backgrounds.json               default scene desktop/mobile focal points
docs/DESIGN_CONSTITUTION.md           refinement contract
tests/ui-refinement-browser.js       new interaction/layout acceptance checks
tests/calm-home-browser.js           current navigation and Notes workspace
tests/unified-timer-browser.js        duration selector/current navigation
tests/stats-notifications-browser.js  full-screen Settings exception
```

## Load and test

Reload the unpacked extension at `chrome://extensions` or `edge://extensions`, then open a new tab. A fresh load uses Home; existing custom preferences continue to apply.

1. Enter a daily focus, select 25/50/custom minutes, and start. Pause/resume and switch between Home, Focus and fullscreen.
2. Add/select an unfinished task; switching back to custom focus retains its draft.
3. End a session and use Continue focus or Take a break.
4. Open About this quote with Enter or tap; check attribution and actions.
5. Open Settings, choose Dashboard style and adjust Clock size/weight to inspect the preview.
6. Inspect narrow layouts, light/dark themes and the Ambient More menu; reload offline.

Developer checks: `node scripts/styles.js`, `node scripts/check.js`, `node --test tests/*.test.js`. Browser scripts require `ONEFLOW_NODE_MODULES` pointing to the bundled Node packages.

## Acceptance

| Check | Result |
| --- | --- |
| Manifest references, strict CSP, JavaScript syntax, safe DOM and generated styles | PASS |
| Unit suite | PASS — 84 tests |
| Initial JavaScript | PASS — approximately 148 KiB, under 150 KiB |
| Chrome Home baseline walkthrough | PASS |
| Chrome/Edge refinement: 1440/1280/390/320px, both themes | PASS |
| Quote keyboard/tap disclosure and footer clearance | PASS |
| Invalid custom duration and 25/50/custom sessions | PASS |
| Chrome/Edge task-linked timer, cross-tab identity, pause/resume, fullscreen and breaks | PASS |
| Appearance preview, saved typography, offline and reduced motion | PASS |
| Chrome Settings: full-screen sections, draft preservation, reminders and mobile | PASS |
| Chrome/Edge Stats, notifications, shared surfaces and Notes exception | PASS |
| Bright uploaded wallpaper text backing | PASS — sampled contrast minimum 5.10:1 |
| Studio typography and explicit floating widget preservation | PASS — baseline walkthrough |
| External requests and runtime errors in offline/refinement checks | PASS — none |
| Cached readiness under 300 ms | NOT MET in measured run — 428/623/479 ms |

## Visual evidence

- [Before desktop](screenshots/settings-corner-1440.png)
- [After desktop](screenshots/refined-edge-dark-1440.png)
- [After narrow screen](screenshots/refined-edge-dark-320.png)
- [Paused focus](screenshots/refined-edge-focus-paused-320.png)
- [Appearance preview](screenshots/refined-edge-appearance-preview.png)

Machine-readable evidence: `docs/qa-results/ui-refinement-{chrome,edge}.json`, `docs/qa-results/settings-page-chrome.json`, `test-results/calm-chrome-report.json`, `test-results/unified-{chrome,edge}-report.json`, and `test-results/stage56-{chrome,edge}-report.json`.

## Limits and decisions

The startup byte budget passes, but the automated cached readiness samples exceed the 300 ms target. These samples were collected while other browser checks were running; they do not establish that the target is met on this machine. Startup timing needs a separate performance investigation before claiming that budget passes.

The first sandboxed Edge launch crashed before loading the extension. The authorized local retry outside the sandbox completed successfully. Chrome and Edge were tested; Firefox was not tested. Quote attribution is disclosed explicitly rather than depending on hover, making the same operation available to keyboard and touch users. Existing wallpapers and custom Studio placements are retained. No new dependency, permission, account or remote service was added.

No user decision is required for this completed UI stage. The workspace already contained extensive changes; no combined Git commit was created.
