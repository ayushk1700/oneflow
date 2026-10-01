# Bundled dependencies

All executable libraries are pinned and local. Nothing is loaded from a CDN at runtime.

| Name | Version | License | Download source | Use |
| --- | --- | --- | --- | --- |
| SortableJS | 1.15.6 | MIT | https://cdn.jsdelivr.net/npm/sortablejs@1.15.6/Sortable.min.js | Loaded only when the tasks panel opens |
| canvas-confetti | 1.9.3 | ISC | https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js | Loaded only after completing main focus, unless motion is reduced |
| Lucide | 0.468.0 | ISC (Lucide), MIT (Feather-derived icons) | https://cdn.jsdelivr.net/npm/lucide@0.468.0/dist/umd/lucide.min.js | Build-time source for the 19-symbol local SVG subset; full bundle never executes in the extension |

Each dependency's original LICENSE is beside its downloaded file. `scripts/assets.js` extracts only used Lucide symbols to `assets/icons/lucide.svg`.

Optional maintainer tooling: Sharp (Apache-2.0) generates checked-in images; Playwright (Apache-2.0) runs browser tests. Neither is bundled or needed to load ONEFLOW. Test scripts use a supplied runtime path, not a remote import. Actual runtime versions are recorded in the Stage 1 report after verification.
