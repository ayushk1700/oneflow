# Stage Report — Focused Settings page

11 October 2026

## Built

Settings now opens as a full-screen workspace with a simple header, an eight-section desktop rail, and one section selector on small screens. Content has a narrower reading width and uses the dashboard's light or dark appearance. Appearance separates personal details, comfort, dashboard style, and wallpapers; Focus and Reminders have clearer groups. The visual customization Studio remains one deliberate primary action. Existing settings behavior, local saves, explicit Focus save, section navigation, and Escape close are preserved.

## File tree

```text
components/settings/index.js        Section rail, grouped Appearance/Home/Reminders
newtab/tokens.css                  Settings light/dark visual tokens
newtab/system.css                  Full-screen responsive Settings layout
newtab/app.css                     Regenerated stylesheet
tests/settings-page-browser.js     Chrome/Edge Settings page checks
docs/DESIGN_CONSTITUTION.md        Settings workspace contract
docs/screenshots/settings-page-*   Desktop, light, Focus, Reminders, 390px, 320px
```

## Load and test

Load `D:\BOOKS\ONEFLOW` unpacked in Chrome and open a new tab. Use the bottom-right Settings icon. Select a section in the left rail or, on a small window, the selector under the header. Run `node scripts/styles.js`, `node scripts/check.js`, `node --test tests/*.test.js`, and `node tests/settings-page-browser.js chrome` with `ONEFLOW_NODE_MODULES` pointing to the available Playwright runtime.

## Acceptance

| Check | Result |
| --- | --- |
| Full-screen page and focused section hierarchy | Pass — Chrome viewport bounds and screenshots |
| Light and dark theme, desktop and 390px/320px widths | Pass — no horizontal overflow |
| All eight sections reachable | Pass — Chrome interactions |
| Focus draft retained across section changes; explicit save works | Pass |
| Reminder change schedules its alarm | Pass |
| Data controls accessible and Escape closes the page | Pass |
| Manifest/CSP/style checks and unit suite | Pass — 84 tests |
| Edge browser check | Unverified — installed Edge crashes during automated startup before extension code runs |

## Known issues and decisions

The older `tests/panels-browser.js` flow stops on a removed dashboard control (`Session settings`) before entering Settings; the dedicated Settings test covers this page. Edge still needs a manual check because its local headless browser fails at startup. No product decision needs input. The change was not committed because the shared checkout already contains unrelated uncommitted work.
