# Design Stages 1 and 2 — foundation and Home

Completed implementation on 12 October 2026, following the user's instruction to start Stages 1 and 2 after the Stage 0 audit. Chrome verification passes; Edge verification is blocked by a browser launch crash. This is not a full release approval. Stage 3 was not started.

## Built

### Stage 1: shared foundation

- Added the cross-platform UI font stack and regular/medium/heading weight tokens (400/500/600). Existing saved serif/mono, appearance and Studio font choices remain authoritative; no settings migration was introduced.
- Kept all shared visual values in `newtab/tokens.css`. Paper, writing and workspace base roles feed the stable `--notes-*`, `--journal-*` and `--settings-*` aliases. Calm uses the shared surface/ink/action roles. Light/dark variants retain their established palettes.
- Consolidated loaded source styles onto shared colors, typography, spacing, radii, shadow/selection treatments and motion values. A source audit of the 35 application/Notes style inputs found no raw hex/RGB colors, numeric font-weight declarations, or directly self-referencing aliases outside the token source. The unused historical `newtab/sketch.css` is not an app.css input and was not activated or rewritten.
- Standardized the shared 44px control target, 12px control radius, 8px small radius, 20px panel radius, 20px local icons and 24px/16px panel padding. Enlarged Notes action targets and retained its responsive workspace. Shared body/secondary/heading sizes and canonical spacing values now flow through tokens.
- Moved procedural scenery palettes and veil strengths into tokens. Preserved the current opacity formulas: central layer multiplier 0.32, overall multiplier 0.40, upload minimum 0.66, existing scene metadata/strong-contrast behavior. The default combined center opacity remains 0.38592 when home shade is 0.60.
- Preserved custom accents, light/dark/auto themes, forced-color focus behavior, and reduced motion. Regenerated both application and widget CSS from source.

### Stage 2: Home and navigation

- Default Home has nine visible semantic groups: greeting, clock, date, editable focus, search, quote, Journal, Notes/Sounds, and More. Settings and the optional brand link now live inside More. Saved Show brand remains supported there.
- Named the overflow menu More consistently and the searchable launcher All tools. Did not rename individual tools, reorganize hubs, or merge workflows.
- Kept Journal top-right, Notes/Sounds bottom-left and More bottom-right. Default corner tools wrap within the space available on narrow screens; explicit Studio placement remains authoritative.
- Preserved and verified 25/50/custom duration selection, existing-task selection, custom title/duration drafts, start/pause, and current Continue follow-up behavior.
- Preserved the daily quote, keyboard/touch disclosure, tall-screen placement and compact document flow. Disabled widgets leave no empty shortcut; extra Home widgets return to More when Studio is disabled.
- Kept Settings reachable from More in Ambient by removing its obsolete hide rule. Mode changes and opening Settings preserve active session identity and deadline.
- Fixed focus restoration for a panel launched from a disclosure that closes: closing Settings now returns focus to the visible More trigger, not its hidden inner button. This small shared lifecycle fix was necessary for the new navigation location.

Conditional current-audio status and provider-required image attribution remain available; they are not present as additional default navigation groups. No permissions, remote services, runtime dependencies, schemas, task records, or user preferences were added or reset.

## Token and geometry decisions

Base colors are reusable semantic roles (`--surface-paper`, `--ink-dark`, `--paper-surface`, `--workspace-page`, etc.). Family aliases retain existing component APIs. Their state/theme overrides live with the base tokens, including strong contrast and non-blur fallbacks. User-controlled runtime variables such as accent, clock size, Studio geometry, wallpaper focal point, and timer progress remain dynamic.

Remaining component geometry is intentional: responsive widths/breakpoints, clock/timer scale, fixed calendar grid tracks and documented 28px Journal date cells, charts/canvas dimensions, circular meter/ring shapes, checkbox glyphs inside labeled rows, 1–3px borders/indicators and optical positioning. These do not establish competing shared spacing/palette systems. Preserved Studio size/radius/weight values are explicit user customization.

## Changed file tree

```text
newtab/
  tokens.css                     canonical base roles, family aliases, typography and states
  newtab.css, foundation.css      shared controls and base styling
  panels.css, dashboard.css       source styles and Home composition
  system.css                     final shared shell/controls
  index.html                     menu-only Settings/branding, More naming
  widgets.css, app.css            regenerated outputs
core/
  ui.js                          restore focus to closed disclosure trigger
components/
  tools/index.js                 All tools heading
  ambient/style.css              Settings remains available inside More
  notes/capture.css              Paper controls, aliases, responsive targets
  */style.css                    registered widget styles consuming shared tokens
tests/
  design-foundation-browser.js   new Stage 1/2 contract and preservation checks
  calm-home-browser.js           visible-group coverage and current contrast sample set
  ui-refinement-browser.js       More entry and current Continue follow-up
  settings-page-browser.js       More entry and reliable first-run onboarding wait
scripts/
  measure-design-baseline.js     named output option preserves earlier measurements
docs/
  DESIGN_CONSTITUTION.md         current implementation rules and decision log
  RELEASE_CHECKLIST.md           canonical procedures, named gates and limitations
  DESIGN_STAGE_1_2_REPORT.md      this report
  qa-results/                    browser workflow and fresh baseline evidence
  screenshots/design-1-2-*       desktop/compact and family/theme captures
```

Stage 0 documentation and its original measured baseline remain separate. Existing unrelated staged/unstaged changes were preserved; no combined commit or release package was created.

## Load and test

1. Open Chrome or Edge's extensions page, enable Developer mode, and Load unpacked from `D:\BOOKS\ONEFLOW`, or reload the existing extension. Open a fresh new tab. No compilation is required to use the extension.
2. Open More → Settings. Close with Escape and verify keyboard focus returns to More. Try Notes, Sounds, and Journal through their corner controls.
3. Type a custom focus, choose an existing task, then return to custom focus. Check the title is retained. Try 25/50/custom duration, start, pause, and view switching.
4. Check light/dark/auto themes, Notes themes, custom accent, existing Studio placements and saved typography. Return to default layout and confirm secondary widgets move back into More.

Reproduce with the existing optional Playwright runtime:

```powershell
node --test tests/*.test.js
node scripts/check.js
$env:ONEFLOW_NODE_MODULES = 'C:/Users/ayush/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules'
node tests/design-foundation-browser.js chrome
node tests/calm-home-browser.js chrome
node tests/ui-refinement-browser.js chrome
node tests/settings-page-browser.js chrome
node tests/panel-redesign-browser.js chrome
node scripts/measure-design-baseline.js chrome --output=design-stage-1-2-baseline.json
```

Use `edge` for the corresponding Edge checks when its runtime launches successfully. Test profiles are disposable and do not access personal browser data. Edit source CSS and run `node scripts/styles.js` only when changing styles.

## Acceptance checklist

| Check | Result and evidence |
|---|---|
| Unit tests | PASS — 104/104 in the current workspace |
| Manifest references, MV3 CSP, source syntax, safe DOM, local quotes and generated styles | PASS — node scripts/check.js |
| Shared font/weight/radius tokens and unchanged default shading | PASS — design-foundation Chrome suite |
| Nine visible core Home groups and hidden secondary controls | PASS — desktop/390/320px, dark/light; browser assertions |
| Corner positions, 44px primary targets, menu bounds, Escape | PASS — foundation and calm-home suites |
| Closed-menu Settings focus restoration | PASS — foundation suite |
| Notes/Journal/Settings/Sounds surface families | PASS — browser checks and visual inspection of desktop and compact screenshots |
| Existing task/custom draft and duration selection | PASS — foundation, calm-home and refinement suites |
| Invalid custom duration, start/pause and Continue follow-up | PASS — current refinement suite |
| Active session across Home/Focus/Ambient/Settings | PASS — unchanged identity/deadline in foundation and calm-home suites |
| Quote keyboard/touch disclosure and placement | PASS — refinement suite, 1440/1280/390/320px |
| Studio placement/typography, custom accent, disabled shortcuts, auto theme, reduced motion | PASS — foundation/calm-home/refinement suites |
| Settings sections, retained Focus draft, reminders, compact pages | PASS — settings-page suite |
| Shared launcher favorites/recents, saved collections, live drafts, keyboard tabs | PASS — eight panel-redesign acceptance groups |
| Offline reload, no page errors or unexpected page requests | PASS — applicable Chrome suites |
| Bright uploaded image text contrast | PASS — sampled minimum 5.108:1; strong contrast and overlay controls also checked |
| Current eager application JS | PASS — 152,724 bytes (149.14 KiB), below 153,600-byte cap |
| Current Chrome cached startup | PASS in this local run — eight samples, median 207.3ms, maximum 264.6ms, all below 300ms |
| Edge runtime | UNVERIFIED — installed Edge crashes at launch before the extension loads; repeated launch failure recorded |
| Firefox, full-release/native consent/provider checks | NOT RUN — outside Stages 1–2; Firefox remains unverified |

The settings test now explicitly waits for onboarding instead of racing its deferred load. The historical refinement test was aligned with the current `Continue` label; its removed `Take a break` shortcut no longer exists in the current session summary. No session workflow was changed to satisfy an obsolete selector, and no break-workflow pass is claimed by that refinement test.

## Evidence and limits

- [Foundation and Home](qa-results/design-foundation-chrome.json), [Edge launch failure](qa-results/design-foundation-edge.json), [refinement](qa-results/ui-refinement-chrome.json), [Settings](qa-results/settings-page-chrome.json), [panel redesign](qa-results/panel-redesign-chrome.json).
- [Fresh performance baseline](qa-results/design-stage-1-2-baseline.json) includes source module hashes, exact raw samples, Windows/CPU details and Chrome 154.0.8037.98. The Stage 0 baseline is preserved. This local pass does not erase earlier outliers or guarantee every machine/open is under 300ms.
- [Compact Home](screenshots/design-1-2-chrome-home-dark-320.png), [Settings](screenshots/design-1-2-chrome-settings-dark.png), [Notes](screenshots/design-1-2-chrome-notes-light-320.png), [Sounds](screenshots/design-1-2-chrome-sounds-light.png).
- Full per-scene clock contrast and screen-reader/native-device verification remain release gates. The white-upload measurement is not universal contrast certification.
- Initial JS has only 876 bytes to the strict cap; future work should remain lazy-loaded. This is the current shared workspace measurement, not attribution of all changes to this stage.

No further product decision is required to use these changes. Proposed hub labels, tool merges, extra tool placements and Firefox support remain for later scoped decisions. Stop here before Stage 3.
