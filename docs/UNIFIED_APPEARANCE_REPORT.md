# Stage Report: unified Appearance

Appearance now contains Theme & accessibility, Dashboard style and Wallpapers. Keyboard-accessible category buttons move focus to each heading. Existing Scenery entry points open the wallpaper group in Appearance. Journal and other tool settings retain their own sections.

Shared settings controls use 44px minimum heights, consistent typography, spacing, rounded cards and selection borders. The wider desktop dialog offers three-column still wallpaper galleries; mobile uses two columns and stacked category controls. Motion, contrast, fonts, themes, clock sizing, opacity, shading and local live wallpaper options remain available. High-contrast system colors retain visible wallpaper selections.

## Changed files

- components/settings/index.js: merged sections, category navigation and compatible Scenery routing.
- components/settings/customization.js: removes duplicated style heading.
- newtab/dashboard.css and generated app.css: shared sizing and responsive presentation.
- tests/panels-browser.js: Scenery compatibility routes to Appearance.

## Verification

Manifest/CSP/syntax checks pass; initial JavaScript remains 149.7 KiB. Chrome journal/customization/video checks pass. Edge panel checks cover desktop, 390px and 320px widths. Screen-reader and physical device checks remain manual.

## Load and acceptance

Reload ONEFLOW in chrome://extensions or edge://extensions and reopen the dashboard. Open Settings → Appearance, use the three category buttons, change a theme or clock size, select a wallpaper and check keyboard navigation. Existing saved preferences and active timer sessions are retained.

- PASS: combined Appearance and wallpapers, compatible existing Scenery shortcuts.
- PASS: offline customization, animated/video playback and saved preferences.
- PASS: consistent control heights and responsive galleries.
- Manual: human screen-reader and OS high-contrast review.

No additional input is required. This stage does not publish the extension.
