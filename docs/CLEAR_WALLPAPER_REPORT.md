# Stage Report — Clear wallpapers

The dark area was a radial readability overlay behind the central clock and focus content. That overlay remained visible after those widgets were hidden in Ambient.

Removed wallpaper shading across Home, Focus, Ambient and Flow, including the older desktop/mobile overlay rules. Removed the wallpaper-shade sliders so they no longer offer an inactive setting. Saved preference fields remain compatible with older backups and Scenes.

## Files

- `newtab/newtab.css`, `newtab/foundation.css`, `newtab/dashboard.css`: transparent readability layers.
- `components/flow/style.css`: transparent Flow canvas.
- `components/settings/customization.js`, `components/customizer/index.js`: removed shade controls.
- `newtab/widgets.css`, `newtab/app.css`: regenerated local styles.
- `tests/ambient-clock-browser.js`: captures the coast wallpaper from the user's report in the existing walkthrough.

## Load and verify

Reload ONEFLOW on the browser's extensions page and open a fresh tab. Check Home, Focus, Ambient and Flow: the wallpaper has no central dark patch or automatic dimming. The analog clock's surrounding card stays transparent.

Acceptance: manifest/CSP/syntax checks pass; initial JavaScript stays at 149.0 KiB. The existing Chrome clock walkthrough verifies navigation, responsive placement, expansion and offline operation. Screenshots are stored under `docs/screenshots/clear-home.png`, `clear-focus.png` and `ambient-analog-desktop.png`.

The wallpaper now supplies its own brightness; shade preferences from old backups no longer darken it. No permission, dependency or data migration was added. No user decision is required.
