# Ambient redesign stage report

Completed 11 October 2026 from the user-approved demo image.

## Built

- Matte ivory analog clock, subtle hour marks, readable local-time caption, expansion and Escape collapse.
- Direct Back to Home action and compact wallpaper selector with an offline thumbnail picker, selection state, loading/error/retry handling and access to uploaded-wallpaper settings.
- Sound capsule showing the actual configured mix and state, mixer access, play/pause, master volume and mute with volume restoration. It uses the existing background audio owner and starts only on an explicit user action.
- Existing active-session indicator returns to Focus without altering identity or deadline.
- Immersive toggle fades controls after four seconds of inactivity. Pointer movement, touch and keyboard activity restore them; keyboard focus and open dialogs/menus prevent fading. Escape leaves immersion. Invisible controls cannot receive pointer clicks.
- Responsive composition at desktop and narrow widths; disabled Clock/Sounds preferences retain authority. Notes and Settings leave the permanent Ambient view while remaining reachable through More and tool navigation.
- Added five icons from the already pinned local Lucide library. No dependency, permission, remote service or storage schema was added. Immersive is temporary and resets when leaving Ambient.

## Files

```text
components/ambient/index.js          lazy control lifecycle, scenery, audio, immersion
components/ambient/style.css         responsive controls and disclosure
components/ambient-clock/index.js    hour marks and local-time caption
components/ambient-clock/style.css   matte clock styling and placement
core/dashboard-view.js              lazy Ambient integration
newtab/tokens.css                    shared matte-clock palette
scripts/widget-styles.json           register new component styles
scripts/icons.js                    local icon subset additions
assets/icons/lucide.svg              regenerated pinned icon subset
data/backgrounds.json               readable default scene name: Quiet island
newtab/widgets.css, newtab/app.css   regenerated styles
tests/ambient-redesign-browser.js    Chrome/Edge interaction and layout checks
docs/DESIGN_CONSTITUTION.md          accepted Ambient contract
```

## Load and test

Reload ONEFLOW in `chrome://extensions` or `edge://extensions`. Open a new tab, choose More → Ambient. Inspect the clock, choose a scene, start/pause sounds and adjust volume. Try Immersive, move the pointer to reveal controls, then use Tab and Escape. With a running focus session, choose Ambient and click the session indicator to return.

Checks: `node scripts/styles.js`, `node scripts/check.js`, `node --test tests/*.test.js`. Run `tests/ambient-redesign-browser.js chrome` or `edge` with `ONEFLOW_NODE_MODULES` pointing to the bundled package directory.

## Acceptance

| Check | Result |
| --- | --- |
| Manifest/CSP/syntax/safe DOM and generated styles | PASS |
| Unit suite | PASS — 84 tests |
| Initial JavaScript budget | PASS — 148.3 KiB / 150 KiB |
| Chrome and Edge extension load | PASS |
| 1440/1280/390/320px, both themes and visible controls within viewport | PASS |
| Lazy mounting and no audio autoplay | PASS |
| Scene selection, clock expansion and Escape | PASS |
| Shared play/pause, volume and mute restoration | PASS |
| Idle fade, pointer wake, keyboard-focus protection and Escape | PASS |
| Session indicator preserves identity/deadline | PASS |
| Home navigation, offline reload and reduced motion | PASS |
| Runtime errors and remote calls in acceptance walkthrough | PASS — none |

Evidence: [desktop](screenshots/ambient-redesign-edge-dark-1440.png), [320px](screenshots/ambient-redesign-edge-dark-320.png), [before](screenshots/calm-chrome-ambient.png). Results: `docs/qa-results/ambient-redesign-chrome.json` and `ambient-redesign-edge.json`.

## Limits and decisions

The actual wallpaper and local time are used; the generated concept's sample names, audio combination and countdown are not fake live data. The clock remains a functional analog clock; this stage implements the approved image, not additional digital-clock styles. Uploaded and live wallpaper management remains in existing Settings, accessible from the scene picker. The 300 ms startup target remains an unresolved measurement from the previous stage; this stage verifies the initial-byte budget but makes no new startup-speed claim. Firefox has not been tested. Audio failure and catalog retry paths are implemented, but the successful browser walkthrough does not inject every possible operating-system audio failure.

No decision is required from the user. Existing workspace changes were retained; no combined commit was created. This stage stops here.
