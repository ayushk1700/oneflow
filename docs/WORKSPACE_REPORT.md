# Stage Report: Workspace, Tools page and consistent Journal

## Built

Tasks, Notes and Habits now share a Workspace dock button and panel. Three accessible tabs switch editors without combining their data or responsibilities. Existing retained panels preserve task drafts and notes. Arrow keys, Home and End switch tabs; hidden tools are omitted from keyboard navigation. N still opens Tasks. If Tasks is disabled, Workspace opens Notes or Habits when enabled.

Tools now opens a dedicated, large page inside the extension with every category expanded and enabled tools visible. Choosing a tool opens its own editor; Escape closes the page. No extra browser permissions or external page navigation were introduced.

Journal retains its calendar, autosave, search, metrics, export, print and writing focus. It now uses the shared panel frame, title, tool navigation, border radii, purple accent, button sizes and spacing. Light/dark paper preferences remain independent from the surrounding dashboard. Mobile keeps a collapsible sidebar and contained writing surface.

## Files

- components/workspace/index.js: shared accessible tabs around isolated editors.
- components/tasks/index.js, notes/index.js, habits/index.js: Workspace integration.
- newtab/newtab.js: one Workspace button replaces three dock buttons.
- core/ui.js: active navigation groups those editors as Workspace.
- core/features.js: dedicated expanded Tools page.
- newtab/dashboard.css and generated app.css: shared Workspace size, Tools layout and Journal presentation.
- tests/workspace-browser.js: draft preservation, tab keyboard navigation, Tools and Journal responsive checks.
- tests/panels-browser.js and dashboard-browser.js: updated Workspace navigation selectors.

## Load and test

Reload ONEFLOW in chrome://extensions or edge://extensions and reopen the dashboard. Choose Workspace, switch Tasks/Notes/Habits and try arrow/Home/End keys on the tabs. Open Tools for all categories. Open Journal, use its sidebar, then Settings → Journal to adjust paper and type.

## Acceptance

- PASS: Chrome Workspace tab/draft checks, five dock buttons, Tools page at 1280/390/320 widths, Journal shared frame/navigation.
- PASS: Chrome journal saving/date/search/export/print-content/metrics and wallpaper regression checks.
- PASS: manifest references, CSP, syntax and safe DOM checks; initial JS under 150 KiB.
- Physical printing and human screen-reader/device checks remain manual.

Separate tool storage and component lifecycles remain intact. The Tools page is a dedicated full-size view within ONEFLOW's existing dialog, not a separate browser tab. No input is required. No store publication was performed.

Final verification: Edge panel walkthrough passes all core tools and Settings at desktop, 390px and 320px, preserves the active timer and reloads offline without errors. Initial JavaScript is 149.5 KiB / 150 KiB.

