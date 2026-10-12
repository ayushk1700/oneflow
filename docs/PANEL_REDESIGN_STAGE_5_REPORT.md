# Panel redesign Stage 5 report

Completed 2026-10-12: Sounds, Scenes, Music and Website Blocking. This completes Stage 5 only; reflection/progress, utilities/customization and the final release stage remain separate.

## Built

- Sounds now separates Mixer, Saved mixes and Sleep with shared playback controls. Saved mixes refresh when changed elsewhere; applying a mix updates visible master/layer controls. The sleep view shows the scheduled stop time and a truthful unscheduled state.
- Scenes now has a searchable Built-in/Saved gallery, selected scene preview and Apply/Use for Flow controls. Capture and management are disclosed. Scene refresh checks view ownership so completing an action cannot interrupt opening another tool. Existing local image preview, apply/undo and timer-preservation logic remain.
- Music now separates Listen and Search in the shared panel frame, follows theme tokens and discloses API credentials and player management. Search results return to Listen. Player/search resources are disposed when leaving Music; input drafts remain during live switching. Opening/reopening never connects automatically.
- Website Blocking remains on its dedicated Settings page, with Rules and Activity views and an explicit off/configured/active status. Permission gestures and Flow-only session rules are preserved.
- Escape now dismisses the shared panel on the first press even when a search field has text, rather than only clearing native search input.

No new dependencies, permissions, schema changes or remote services were added. Provider connections still require explicit load/search actions. Saved settings remain local and use the existing backups.

## File tree

```text
components/
  sounds/index.js               mixer/saved-mix/sleep contexts and state refresh
  scenes/index.js               searchable gallery and owned refresh
  music/index.js                Listen/Search and disclosed connection controls
  blocker/index.js              Rules/Activity and configuration status
core/ui.js                       first-press Escape dismissal
newtab/system.css                final token-based listening-tool styles
newtab/widgets.css, app.css      regenerated styles
tests/
  panel-environment-browser.js   four-panel acceptance and responsive evidence
  panel-boundaries-browser.js    isolated actual-rule verification
  music-api-browser.js           updated current entry point and Search navigation
docs/
  DESIGN_CONSTITUTION.md
  PANEL_REDESIGN_STAGE_5_PLAN.md
  PANEL_REDESIGN_STAGE_5_REPORT.md
```

## Load and test

Reload ONEFLOW from Chrome's or Edge's extensions page; open a new tab → More.

1. Open Sounds, adjust layers, play/pause, apply a Saved mix and set/cancel a Sleep stop.
2. Open Scenes, search environments, save current preferences, Apply a scene and Undo it. Manage a selected saved scene through its disclosure.
3. Open Music. Paste a supported URL in Listen or search with your own optional YouTube API key in Search. No connection begins just by opening the panel. Leaving Music stops its player.
4. Open Website Blocking. Review Rules and optional access, then Activity. Boundaries apply only to new navigation during a running Flow focus interval; pauses, breaks and leaving Flow release them.

## Acceptance checklist

| Check | Result |
|---|---|
| Manifest references, strict CSP, syntax, safe DOM, generated styles | PASS — `node scripts/check.js` |
| Unit suite | PASS — 103 tests, including scene preservation, blocker boundaries and safe music URLs |
| Eager JavaScript budget | PASS — 149.9 KiB / 150 KiB |
| Sounds playback, saved-mix refresh, master/layer state, sleep schedule/cancel | PASS — Chrome and Edge environment suite |
| Scene search/empty state, save/apply/undo | PASS — Chrome and Edge |
| Music contexts, credential disclosure, draft retention and no automatic connection | PASS — Chrome and Edge |
| YouTube handshake, play/pause, next, volume, seek, safe search results and close cleanup | PASS — Chrome and Edge controlled provider fixtures |
| Blocking Rules/Activity, draft retention and denied permission preserving settings | PASS — Chrome and Edge environment suite |
| Actual Flow session rules, pause/resume identity, exit release and disconnect | PASS — Chrome and Edge isolated host-permission fixtures |
| 1440/390/320px, light/dark, reduced motion | PASS — Chrome and Edge assertions and screenshot inspection |
| Offline saved scenes, first-press Escape, no page errors or unintended external requests | PASS — Chrome and Edge environment suite |
| Calm Home regression | PASS — Chrome, eight groups |
| Stats/Notifications shared-panel regression | PASS — Chrome and Edge, six groups each |
| Native optional-permission prompt, live provider availability, Firefox and measured <300ms cache startup | NOT VERIFIED — manual release checks remain |

Evidence: [Chrome environment results](qa-results/panel-environment-chrome.json), [Edge environment results](qa-results/panel-environment-edge.json), [Chrome rules](qa-results/panel-boundaries-chrome.json), [Edge rules](qa-results/panel-boundaries-edge.json), [Music desktop](screenshots/environment-chrome-music-light-1440.png), [Scenes mobile](screenshots/environment-chrome-scenes-light-320.png), [Blocking mobile](screenshots/environment-chrome-blocker-light-390.png).

## Limits and decisions

Provider verification uses controlled iframe/search responses; availability of a particular real song, playlist or API quota remains provider-dependent. Blocking fixtures pre-grant hosts only in an isolated test manifest; the release manifest retains optional access. Native consent remains a manual check. Music drafts survive live tool switching, not closing the whole panel or reloading. Existing ambient sound ownership remains separate from embedded music playback.

The eager JavaScript budget has less than 0.1 KiB of headroom; future functionality should stay lazy-loaded. The workspace contains substantial pre-existing changes, so no combined commit was made. No user decision is required. Stop here before Stage 6.
