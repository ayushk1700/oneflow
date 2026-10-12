# Panel redesign — Stage 1 report

Implemented 2026-10-11. This stage covers the shared launcher/navigation and five workspaces; it does not implement all 48 concepts in the demo boards.

## Built

- Standard panel navigation now has All tools and a compact Switch tool menu.
- Tools supports search, favorites and recent tools, stored locally and included in work backups.
- Focus Capsules leads with searchable scenic saved-context cards and a visible Resume action. Capture and management controls use disclosure.
- Recall Rooms separates Due today, Concepts and Materials. Review shows one question and reveals the answer only on request.
- Idea Garden has a searchable, stage-filtered gallery with one selected fragment and local Notes image previews.
- Career Sprint separates Overview, Evidence and Next steps for the selected opportunity.
- Skill Loops separates Practice, Recall, Evidence and Progress.
- Collection selection and contextual tabs survive saves. Unsaved editors survive switching tools within the tab. This is not automatic draft persistence across browser reloads.
- Management/removal controls are quieter disclosures; existing confirmation and storage behavior remain.

## Files

```text
core/
  ui.js                         shared panel integration
  panel-navigation.js           lazy compact switcher
  tool-preferences.js            local favorites/recent tools
  work-schema.js                 compatible toolbox defaults/validation
components/
  panel-design/index.js          searchable collections and keyboard tabs
  panel-design/style.css         token-based responsive layouts
  tools/index.js                 launcher
  capsules/index.js              saved-work cards
  recall/index.js, review.js     subject review views
  garden/index.js                idea gallery and local previews
  career/index.js, view.js       opportunity views
  skills/index.js                practice/evidence views
  journeys/shared.js             management disclosure
scripts/widget-styles.json      source style registration
newtab/widgets.css, app.css     regenerated styles
tests/
  panel-redesign-browser.js      end-to-end redesign acceptance
  journeys.test.js               preference validation/migration
  journeys-browser.js            adapted workspace acceptance
  journeys-media-browser.js      image/sketch attachment acceptance
  work-context-browser.js        adapted capsule acceptance
docs/
  DESIGN_CONSTITUTION.md         shared redesign contract
  PRIVACY_POLICY.md              local launcher preferences
  PANEL_REDESIGN_STAGE_1_PLAN.md
  PANEL_REDESIGN_STAGE_1_REPORT.md
```

## Load and try

1. Open Chrome's or Edge's extensions page and enable Developer mode.
2. Load unpacked from `D:\BOOKS\ONEFLOW`, or press Reload on the existing ONEFLOW extension.
3. Open a new tab, choose More, search a tool and favorite it. Switch between tools using the shared header.
4. Create two subjects, ideas, opportunities or skills; select and search them. Enter evidence, switch contextual tabs, and return to confirm the draft remains.
5. Save a capsule, then Resume it and choose how to re-enter the session.

## Acceptance

| Check | Result |
|---|---|
| Manifest, CSP, syntax, safe DOM and generated styles | PASS — `node scripts/check.js` |
| Unit suite | PASS — 103 tests |
| Initial JavaScript budget | PASS — 149.7 KiB of 150 KiB |
| Launcher, draft retention, filters, evidence saves, keyboard tabs, recall reveal, capsule restoration | PASS — Chrome and Edge redesign browser suites |
| Desktop 1440px and mobile 390/320px, light/dark, reduced motion | PASS — browser assertions and screenshots |
| Offline reload, favorites persistence, Escape, no external requests or page errors | PASS — Chrome and Edge |
| Workspace integration | PASS — Chrome journeys suite, 11 groups |
| Capsule/work-context integration | PASS — Chrome work-context suite, 7 groups |
| Local screenshot/sketch attachments and backup parsing | PASS — Chrome media suite |
| Shared navigation regression: Stats/Notifications | PASS — Chrome and Edge, 6 groups each |
| Calm Home regression | PASS — Chrome, 8 groups |
| Native optional-permission prompt, Firefox, measured <300ms cache startup | NOT VERIFIED in this stage; manual release checks remain |

Evidence: [Chrome results](qa-results/panel-redesign-chrome.json), [Edge results](qa-results/panel-redesign-edge.json), [Capsules desktop](screenshots/panel-redesign-chrome-capsules-dark-1440.png), [Garden mobile](screenshots/panel-redesign-chrome-garden-dark-320.png), [Recall desktop](screenshots/panel-redesign-chrome-recall-light-1440.png).

## Limits and decisions

No new dependencies, permissions, analytics or remote services were added. Existing Notes, Journal, Settings and live customization remain their dedicated surfaces. The other redesigned panel concepts are not part of this completed stage. The eager JavaScript budget has little remaining headroom, so future tools should stay lazy-loaded.

The workspace already contained substantial unrelated changes; no combined commit was created. No user decision is needed for this stage. Stop here before starting the next redesign stage.
