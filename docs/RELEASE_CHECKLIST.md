# ONEFLOW release checklist

The Design Constitution v2 delegates verification here. This checklist records checks, not an automatic claim of release readiness.

## Per-change gate

- Read the constitution and affected modules; preserve user records, drafts and active deadlines.
- Regenerate source styles with `node scripts/styles.js`; run `node scripts/check.js` and applicable unit tests.
- Run affected real-extension browser workflows in Chrome and Edge. Use separate, disposable fixtures for native host/tab APIs when headless consent cannot run; leave the release manifest optional.
- Inspect desktop 1440px and mobile 390/320px, light/dark themes, keyboard navigation, visible focus and reduced motion over scenic backgrounds.
- Check first-run, empty, filled, denied-access, offline and error recovery states. Render user/provider text safely.
- Verify persistence, cross-tab timer identity and relevant backup round-trips after data/schema changes.
- Record pass/fail/not verified, screenshots and known issues in the stage report. Do not publish without authorization.

## Release gate

- Build a local package, verify checksum/CRC and runtime assets, and load the extracted extension offline.
- Run the current Chrome and Edge acceptance suites; record startup and initial JS against the constitution and fixed project budgets.
- Check native optional consent and real provider availability manually; fixture success does not prove these.
- Firefox remains unverified until an available runtime passes manifest loading, Home, local tool, storage, timer and permission smoke checks.
- Retain unresolved failures in the report. Existing cached-startup outliers and manual-browser gates are not waived by this checklist.

## Engineering evidence and fixed budgets

This is the canonical engineering checklist; [LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md) covers publisher materials and store submission. Current integrated audit: [design Stage 9](DESIGN_STAGE_9_REPORT.md). Historical results do not establish a current release pass.

Run from the repository root. npm aliases are optional; the direct Node commands work without npm:

```powershell
node --test tests/*.test.js
node scripts/check.js
$env:ONEFLOW_NODE_MODULES = 'C:/Users/ayush/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules'
node tests/design-foundation-browser.js chrome
node tests/design-foundation-browser.js edge
node scripts/measure-design-baseline.js chrome --output=design-stage-1-2-baseline.json
```

The runtime path is machine-specific and test-only. No remote library is loaded by the extension. Measurement uses disposable profiles, the source checkout, one offline warm-up and eight sequential cached reloads, and writes JSON evidence under qa-results. Specify a new output filename to preserve earlier baselines. Nonzero exit includes real budget failures and unavailable browsers; inspect the results instead of changing thresholds.

- Initial static application JavaScript must stay **below 153,600 bytes (150 KiB)**, the existing checker threshold. AGENTS.md calls this 150 KB; do not silently loosen the established cap. Any approved relative +5% allowance must also satisfy this hard cap.
- Every measured cached `oneflow-ready` sample must be **below 300ms**. Record all samples, median, maximum, browser/OS versions and source identity. This initialization mark does not measure paint or completion of deferred widgets. A +10% allowance remains a proposal and cannot waive the hard target.
- Body/secondary text must meet 4.5:1; large text and controls 3:1. Test bright uploads, strong contrast, solid backgrounds and both themes. `design-stage-9-browser.js` measures every backing pixel beneath rendered Home text ranges and icons across all 21 bundled scenes, white uploads, strong contrast, solid canvases, and 1440/320px widths. It also measures panel semantic text/action/focus roles in both themes. This conservative sampled audit does not certify arbitrary Studio placements or a complete human WCAG review.
- The default closed-menu Home contains nine core groups. Settings and optional branding are inside More. Report conditional provider attribution/audio status and explicit Studio placements separately. Verify disabled widgets leave no empty shortcuts.
- Preserve appearance/Studio choices, saved records, independent tracking opt-ins, per-line report approvals, and session deadlines across tool/view changes.

## Named browser coverage

Run applicable scripts with both `chrome` and `edge`; run the full current contract set before release. Review legacy selectors against current source, and explain any test adaptation separately from product fixes.

| Area | Scripts under tests/ |
|---|---|
| Foundation and Home | design-foundation-browser.js; calm-home-browser.js; calm-corners-browser.js; ui-refinement-browser.js |
| Timer and Ambient | unified-timer-browser.js; ambient-redesign-browser.js; ambient-clock-browser.js |
| Panels and collections | panel-redesign-browser.js; panel-entry-browser.js; panel-planning-browser.js; panels-browser.js |
| Design Stages 3 and 4 | design-stage-3-4-browser.js; ambient-redesign-browser.js; unified-timer-browser.js; design-foundation-browser.js |
| Design Stages 5 and 6 | design-stage-5-6-browser.js; journal-fullscreen-browser.js; combined-notes-browser.js; notes-capture-browser.js; notes-overlay-browser.js; settings-page-browser.js; panel-entry-browser.js; panel-planning-browser.js; work-context-browser.js; journeys-tabs-browser.js; panel-boundaries-browser.js |
| Design Stages 7 and 8 | design-stage-7-8-browser.js; panel-redesign-browser.js; panel-environment-browser.js; panel-remaining-browser.js; stats-notifications-browser.js; music-api-browser.js |
| Integrated design Stage 9 | design-stage-9-browser.js; scripts/audit-design-release.js (current suite set); scripts/audit-design-release.js --extra (post-fix Home, analog clock, Studio and refinement checks) |
| Work context and browser boundaries | work-context-browser.js; journeys-tabs-browser.js; panel-boundaries-browser.js |
| Environment | panel-environment-browser.js; music-api-browser.js |
| Reflect and System | panel-remaining-browser.js; stats-notifications-browser.js |
| Dedicated workspaces | combined-notes-browser.js; notes-capture-browser.js; notes-overlay-browser.js; journal-fullscreen-browser.js; settings-page-browser.js; studio-browser.js |
| Extracted release | package-browser.js; release-audit-browser.js |

Build a local release package only when in scope, and verify checksum/CRC, contents and actual unpacked loading of the extracted package. Source-checkout tests are not package tests. Native permission grant/denial/revocation, OS notifications, audible playback, screen-reader operation, actual provider availability and crash/restart recovery require their own recorded evidence.

## Firefox smoke definition

Firefox is unverified and not an advertised supported target. Do not pass `firefox` to Chromium runners: some would silently choose Chrome. An actual Firefox temporary add-on run must check manifest warnings, new-tab override, offline storage/IndexedDB, tool navigation/shortcuts, timer/background lifetime, alarms/notifications, media, optional consent and Flow-blocking compatibility before support is reconsidered.
