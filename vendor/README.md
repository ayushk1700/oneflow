# Bundled dependencies

All executable libraries are pinned and local. Nothing is loaded from a CDN at runtime.

| Name | Version | License | Download source | Use |
| --- | --- | --- | --- | --- |
| SortableJS | 1.15.6 | MIT | https://cdn.jsdelivr.net/npm/sortablejs@1.15.6/Sortable.min.js | Loaded only when the tasks panel opens |
| canvas-confetti | 1.9.3 | ISC | https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js | Loaded only after completing main focus, unless motion is reduced |
| Chart.js | 4.4.8 | MIT | https://cdn.jsdelivr.net/npm/chart.js@4.4.8/dist/chart.umd.js | Minified UMD distribution, loaded only when the statistics panel opens; license is LICENSE.md beside it |
| Lucide | 0.468.0 | ISC (Lucide), MIT (Feather-derived icons) | https://cdn.jsdelivr.net/npm/lucide@0.468.0/dist/umd/lucide.min.js | Build-time source for the 19-symbol local SVG subset; full bundle never executes in the extension |
| Tailwind CSS | 3.4.17 | MIT | https://github.com/tailwindlabs/tailwindcss/releases/tag/v3.4.17 | Locally generated responsive utilities in vendor/tailwindcss/3.4.17/tailwind.min.css; no preflight or runtime JavaScript |

Each dependency's original LICENSE is beside its downloaded file. `scripts/assets.js` extracts only used Lucide symbols to `assets/icons/lucide.svg`.

Optional maintainer tooling: Sharp (Apache-2.0) generates checked-in images; Playwright (Apache-2.0) runs browser tests. Neither is bundled or needed to load ONEFLOW. Test scripts use a supplied runtime path, not a remote import. Actual runtime versions are recorded in the Stage 1 report after verification.


Tailwind generation: use the pinned standalone CLI with `-c scripts/tailwind.config.cjs -i scripts/tailwind.input.css -o vendor/tailwindcss/3.4.17/tailwind.min.css --minify`. Only the stylesheet and MIT license ship. The compiler stays in the ignored development tooling directory. Generation follows https://v3.tailwindcss.com/docs/installation; the checked-in stylesheet is ready to use without compilation.
