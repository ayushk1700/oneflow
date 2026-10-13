# Design Stage 0 — specification audit

12 October 2026. Scope: audit the current constitution against the source checkout, establish a canonical checklist, clarify terminology/counting, and measure the baseline. No extension runtime, styles, permissions, dependencies, or user data were changed during Stage 0. The workspace already contained substantial staged and unstaged work; it was preserved and no combined commit was made.

## Delivered

- Created [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md), the canonical engineering checklist. [LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md) remains the publisher/submission companion and links to it.
- Corrected the nine-item Home counting proposal and removed the unsupported claim that the existing calm-home test numerically enforces it. This is still a proposal, not approved removal of visible elements.
- Recorded actual source performance and readability values while retaining the hard budgets.
- Clarified Studio and the distinction between a normal focus session, the dashboard Focus view, and explicit Flow Mode.
- Added an optional, repeatable source-checkout measurement script and machine-readable results.

## Audit method and status meanings

Implemented means the relevant mechanism is present in inspected source, supported where stated by dated historical tests; it does not mean every behavior was re-tested in Stage 0. Partial means existing functionality has a concrete mismatch or incomplete verification. Missing means the specified mechanism/assertion was not found. Decision means a product proposal or unresolved definition requires agreement. Current runtime evidence is limited to the unit/static checks and baseline run below. Historical reports are not fresh release sign-off, and some predate newer source changes.

## Constitution coverage

| Requirement / section | Status | Evidence and next action |
|---|---|---|
| Shared visual source and build, 1.4 | Partial | tokens.css and scripts/styles.js exist; check.js verifies generated CSS. Raw family colors, legacy decorative values and typography remain. Stage 1. |
| Calm/Paper/Workspace aliases, 3 | Partial | Notes, Journal and Settings have central token families, but raw values rather than shared base aliases. Stage 1. |
| Typography, control scale and spacing, 5.5 | Partial | 44px/12px/8px/20px tokens and spacing scale exist; heading is 550 and font is Segoe UI/Arial, not v2 stack/weights. Stage 1. |
| Home focal content, 1.2/5.1 | Implemented | clock, focus, search, quote modules; default clock 128/400. Session-view includes editable draft, existing task, 25/50/custom durations. Custom title survives switching back from task selection. |
| Corner navigation and More, 2 | Partial | Journal top-right, Notes/Sounds bottom-left exist. Settings is a separate button outside More; menu heading/accessibility labels say More tools and launcher heading says Tools. newtab/index.html, components/tools/index.js. Stage 2/4. |
| Tasks entry, 2.4 | Decision | Home session-view selects existing tasks; N emits task:new; Notes uses planner.js for tasks/habits. Recommend keeping those routes with no permanent Tasks button. |
| First-view disclosure/count, 1.6/6.2 | Partial / Decision | Nine named groups plus visible brand and separate Settings measured in Chrome. Existing tests count dock buttons, not all semantic groups. Proposed counting rule below. |
| Saved customization, 1.13 | Implemented | Studio placement/runtime and appearance migration exist; stock-only migration and custom-choice preservation unit tests pass. |
| Focus session hierarchy/continuity, 5.2 | Implemented | Shared session-view, dashboard-view, timer-client and work-context guards. Timer tests pass; full visual/runtime walkthrough remains a release gate. |
| Ambient/Immersive, 5.3 | Implemented | ambient/index.js has 4000ms idle fade, input reveal, menu/focus protection; dashboard-view returns to current session without restart. Ambient removes central shade. Historical ambient suite exists. |
| Shared panels, 5.4 | Implemented | core/ui.js owns modal lifecycle, focus, Escape and retained views; system.css sets 20px shared frame and padding. |
| Context tabs/mobile collections, 5.4 | Implemented | panel-design implements arrow/Home/End tabs, retained hidden details and horizontal compact collection strip. |
| Search/favorites/recents, 2.3/5.4 | Implemented | tools/index.js and tool-preferences.js store explicit favorites and local recents. |
| Hubs and maximum six, 4 | Missing / Decision | Existing groups are Workspaces (9), Work context (5), Focus (3), Plan (5), Recharge (7), Personalize (5), not the proposed map. Existing Notes/Journal/Mood/Session reflection/Layout entries also need explicit placement. Stage 4. |
| Plain labels and command aliases, 4/6.4 | Missing / Decision | commands/index.js searches display labels directly with substring matching, no explicit alias map; several tools are omitted. Do not rename before preserving old-name discovery. |
| New-tool admission/merge review, 4.3–4.4 | Decision | Define test owner per future addition; review overlap before adding tools. No merge is authorized by this audit. |
| Scene readability, 5.6 | Partial | Catalog normalization, unknown-image protection, strong contrast and solid-canvas exceptions exist. Opacity calculations still include non-token literals. Full per-scene clock contrast assertion missing. |
| Local wallpaper/live sources, 5.6 | Implemented | background-presentation validates paths and metadata; catalog/index script and still-fallback runtime exist. 21 static catalog entries measured. |
| Notes, 5.7 | Implemented | Full-screen local iframe, capture workspace and planner with task/habit data; tokens include light/dark variants. |
| Journal/daily check-in, 5.8 | Implemented | journal/workspace.js handles writing, saved preferences and calendar; rituals Today/History, reflection saved text, mood labels exist. Historical panel-remaining suite. |
| Settings, 5.9 | Implemented | Eight named sections, compact picker, appearance preview/advanced controls and blocking section in settings/index.js. Shared aliases still Stage 1 work. |
| Capsules/Recovery, 5.10 | Implemented | Saved-context workflow exists. Recovery reads current timer state in return handler; running session is protected. Capsule/timer unit tests pass. |
| Compiler/First Step/DNA, 5.10 | Implemented | Existing entry/privacy workflows and deterministic compiler/opt-in rules; entry/work-context suites provide dated evidence. |
| Quiet Web, 5.10 | Implemented | Now/Later/Reference collections and explicit tab-review/parking workflow; historical isolated-tab tests. Actual consent remains manual. |
| Energy Planner/Priorities/Countdowns, 5.11 | Implemented | Task effort and energy contexts, protected recovery, visible unplaced tasks; selected priorities/search; date-ordered searchable countdowns. |
| Energy Weather/Afterglow/Suggestions, 5.12 | Implemented | Check-in/history/recovery, searchable meeting contexts and local suggestions exist. Current source includes additions beyond older reports. |
| Stats, 5.12 | Partial | Overview/Patterns and chart retained. Resize is attached to a click listener; keyboard-selected return needs explicit validation/repair. Stage 7. |
| Recall/Ideas/Skills/Career, 5.13 | Implemented | Shared searchable collections and contextual views; current stage reports and source support base contract. Full current visual verification remains outstanding. |
| Proof of Work, 5.13 | Implemented | Current source has Work history/Deliverables/Review report, fresh evidence fetch, per-line unchecked approvals and guarded CSV export; report approval unit test passes. |
| Dictionary, 5.13 | Implemented | Privacy/connection disclosure and session caching; hostile/malformed provider unit tests pass. Actual provider availability is separate. |
| Sounds/Scenes/Music, 5.14 | Implemented | Contexts, scene view-ownership guards, Music cancellation/player cleanup and draft retention are present; historical environment tests. |
| Toasts, 5.15 | Implemented | toaster.js pauses on hover/focus, places notices in the modal top layer, and keeps errors until dismissed. |
| Notifications/empty-state language, 5.4/5.15 | Partial | 40-record cap, filters and clear confirmation exist. Empty state still says “You’re up to date,” conflicting with the neutral-empty-state rule. Stage 8. |
| Command guidance/Help/Customize, 5.15 | Implemented / Partial | Guidance, result counts, separate support contexts and preview editor exist; complete command-tool coverage/aliases missing. |
| Contrast and interaction targets, 6.1–6.2 | Partial | Existing calm-home samples white-upload backing and checks scene shading. No exhaustive scene-clock contrast or numeric nine-group gate. Two-interaction start target needs an explicit counting definition. |
| Performance, 6.3 | Partial | Static graph under enforced cap; Chrome cached outliers fail 300ms; Edge failed launch. Measurements below. |
| Browser support, 7 | Decision / Unverified | Current policy supports Chrome/Edge, not Firefox. Do not upgrade support from historical compatibility claims. Current Edge runtime needs investigation before release. |

## Home counting and navigation recommendation

Count visible semantic groups after onboarding, in default Home with menus closed and Studio disabled: greeting (1), clock (2), date (3), focus entry including task/duration/start controls (4), search (5), quote (6), Journal (7), Notes/Sounds cluster (8), More (9). Do not count individual nested controls again. Disabled groups reduce the count; hidden menus do not count. Explicit Studio layouts are reported separately.

The original proposed “8” was an arithmetic error. Recommend **at most nine core groups**, retaining all specified content. A separate brand, Settings shortcut, attribution, or persistent media indicator must be reported as an additional visible group or explicitly approved exception, not silently folded into unrelated content. Chrome currently shows the nine core groups plus brand and Settings. Whether to keep a branding/required-attribution exception remains a product decision. Moving Settings inside More is already the current constitution's rule.

Recommend Tasks remain reachable through the focus selector, Notes, and N. There is no need for a separate permanent Tasks button; the source already supports these routes. Studio is confirmed as the advanced editor reached from Appearance. Flow is an explicit fullscreen mode: core/blocker-logic.js requires flow.active, flow.block, blocker.enabled, a running focus phase, and a future deadline. An ordinary focus session alone does not enable blocking.

## Measured baseline and shading

Evidence: [design-stage-0-baseline.json](qa-results/design-stage-0-baseline.json). Measured 12 October 2026 on Windows 10.0.26300, Intel i3-1115G4, Node v24.19.0. Exact eager module hashes are recorded. No performance optimization was attempted.

| Measurement | Result |
|---|---|
| Eager static JS graph | 152,249 bytes / 148.6807 KiB; PASS below 153,600 bytes; 1,351 bytes to threshold (strictly below required) |
| Chrome | 154.0.8037.98; eight cached reloads after warm-up; median 207.45ms, maximum 330.20ms; FAIL hard 300ms target |
| Chrome samples (ms) | 192.6, 268.4, 189.2, 330.2, 300.6, 164.4, 207.3, 207.6 |
| Chrome runtime/default network | No page errors or external page requests in measured flow |
| Edge | Installed executable crashed during launch (exit 3221225477 / crashpad errors); no current timing or load pass claimed |
| Startup meaning | Existing oneflow-ready initialization mark; not first paint, full wallpaper decode, or completion of all lazy widgets |

Fresh profile, headless 1440x900, onboarding skipped, offline cache warmed once, then eight sequential reloads. The measurement is source-checkout evidence, not the previously packaged ZIP. Earlier release-audit numbers are historical. Additional +5% JS / +10% startup allowances remain proposals and must never waive hard budgets; a failing baseline cannot establish release readiness. The repository checker interprets “150 KB” as 150 KiB; a decimal-150,000-byte interpretation would currently fail and requires an explicit budget clarification.

Current shading values from tokens.css, theme.js, background-presentation.js, schema.js and dashboard.css:

- Catalog has 21 entries with shade metadata 0.54 or 0.60. Normalization accepts 0.54–0.72 (fallback 0.60); unknown presentation fallback is 0.64.
- Saved overlay range is 50–85, default 60. Normal homeShade = max(scene shade, (overlay - 20)/100); strong contrast sets 0.85.
- Default Chrome homeShade measured 0.60. Overall alpha = 0.40 × homeShade (0.24); central gradient plateau alpha = 0.32 × homeShade (0.192). Combined central alpha is 1 - (1 - 0.24)(1 - 0.192) = 0.38592, not 0.60.
- Normal validated homeShade spans 0.54–0.72 across metadata/preferences, overall alpha 0.216–0.288, center layer 0.1728–0.2304. These are observed formulas, not contrast certification or approved new min/max tokens.
- Upload protection uses max(0.66, homeShade); strong contrast overrides with 0.85. Flow uses max(sceneTextShade 0.70, homeShade). Pure white/black and Ambient remove the image veil.
- Contrast across all 21 backgrounds is not certified by these alpha values. Stage 1 should tokenise existing behavior without weakening it; later release verification must measure pixels.

## Decisions still open

1. Approve nine core Home groups and decide how branding and required image attribution count. Recommendation: no extra permanent action; make any branding/attribution exception explicit.
2. Confirm Tasks remains in the focus entry/Notes/N route.
3. Approve proposed display labels with old-name aliases first. No UI rename in Stage 0.
4. Decide placement of existing tools omitted from the hub map (Notes, Journal, Mood, Session reflection, Layout), and ownership of new-tool acceptance tests. Preserve access while resolving the map.
5. Review merge candidates: Capsules/Recovery; Planner/Energy Weather; Compiler/First Step; Compiler/Priorities; Proof/Career/Afterglow. Recommendation: no merge during foundation/Home stages.
6. Approve comparative performance metrics after stable measurements; keep absolute budgets. Clarify KiB versus decimal KB if changing the established checker contract.
7. Retain Chrome/Edge support with Firefox unverified unless explicitly expanding the target. Edge launch failure is a verification limitation, not a support-policy change.

## Changed file tree

```text
docs/DESIGN_CONSTITUTION.md                 clarified criteria, baselines and glossary
docs/RELEASE_CHECKLIST.md                   new canonical engineering gates
docs/LAUNCH_CHECKLIST.md                    link to canonical gates
docs/DESIGN_STAGE_0_REPORT.md               audit and decisions
docs/qa-results/design-stage-0-baseline.json measured source/browser evidence
scripts/measure-design-baseline.js          optional measurement support
```

## Load and reproduce

Load unpacked from D:\BOOKS\ONEFLOW through chrome://extensions or edge://extensions with Developer mode enabled. No build is required for these documentation changes. Follow the commands in RELEASE_CHECKLIST.md to reproduce the source measurement with the installed optional Playwright runtime. The script exits nonzero for a failed performance gate or browser failure and still writes its evidence. npm was unavailable in this shell; equivalent direct Node commands were used successfully.

## Stage 0 acceptance

| Check | Result |
|---|---|
| Constitution/code audit and explicit status classifications | PASS — source review and evidence matrix above |
| Canonical checklist, references and scope boundary | PASS — engineering vs publisher responsibilities separated |
| Counting contradiction and task/Flow terminology investigated | PASS — recommendations distinguished from approval |
| Shading, eager JS and reproducible cache measurements | PASS for collection; Edge timing UNVERIFIED due launch crash |
| Unit tests | PASS — 103/103 |
| Manifest/CSP/syntax/safe DOM/generated styles | PASS — node scripts/check.js |
| Actual Chrome unpacked load/offline reload | PASS — measurement run |
| Cached startup below 300ms for every sample | FAIL — two Chrome samples exceed threshold |
| Full feature suites/visual acceptance/native permissions/providers/Firefox | UNVERIFIED in Stage 0; no UI change made or release pass claimed |

Stage 0 completed. Subsequent work requires the user's stage instruction; the later instruction in this chat authorizes Stages 1 and 2 only.
