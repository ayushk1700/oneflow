# Stage Report — Ambient analog clock

Built a small right-side clock card matching the supplied reference: a silver rim, pale dial, thin dark hour/minute hands, subtle center pin and an expand control. It uses local computer time and appears only in Ambient when the Clock widget is enabled. Expand/collapse and Escape resize the card without changing the focus timer. The surrounding card and expand button are transparent, leaving the circular clock face over the wallpaper. The original digital clock and its Ambient toggle have been removed from Ambient; Home retains its digital clock. Older saved Ambient digital-clock preferences are ignored.

## Files

- `components/ambient-clock/index.js` — isolated lazy-loaded widget with init/render/destroy.
- `components/ambient-clock/style.css` — reference-inspired face, card and responsive positioning.
- `core/dashboard-view.js` — Ambient visibility and existing shared clock tick.
- `components/settings/customization.js`, `components/customizer/index.js` — clarified optional digital-clock label.
- `scripts/widget-styles.json`, `newtab/widgets.css`, `newtab/app.css` — local styles.
- `tests/ambient-clock-browser.js` — browser acceptance checks.

## Load and acceptance

Reload ONEFLOW in `chrome://extensions` or `edge://extensions`, open a fresh new tab, and select Ambient. The card appears at the right. Click its diagonal arrows to enlarge it; click again or press Escape to shrink it.

- PASS: correct local hour/minute hand angles and accessible time label.
- PASS: compact right-side placement, expansion, collapse and Escape.
- PASS: hidden on Home/Focus; follows the Clock widget visibility setting.
- PASS: fits 390 px and 320 px screens.
- PASS: offline reload with no external requests, page errors or CSP errors in Chrome.
- PASS: manifest, syntax and local-style checks; initial JavaScript 149.0 KiB, below 150 KiB.
- PASS: rendered card and desktop placement visually inspected against the reference.

The face is drawn locally in CSS, so it stays sharp when enlarged. It is a close visual recreation rather than a photographic copy. No new permission, network service, dependency or storage migration is required. No input is needed for this stage.
