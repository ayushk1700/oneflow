# Bundled dependencies

All executable libraries are pinned and local. Nothing is loaded from a CDN at runtime.

| Name | Version | License | Download source | Use |
| --- | --- | --- | --- | --- |
| Chart.js | 4.4.8 + ONEFLOW patch 1 | MIT | https://cdn.jsdelivr.net/npm/chart.js@4.4.8/dist/chart.umd.js | Local UMD with Defaults-path/property guards; lazy-loaded only for statistics |
| Lucide | 0.468.0 | ISC (Lucide), MIT (Feather-derived icons) | https://cdn.jsdelivr.net/npm/lucide@0.468.0/dist/umd/lucide.min.js | Build-time source for the local SVG subset; full bundle excluded from release |
| Tailwind CSS | 3.4.17 | MIT | https://github.com/tailwindlabs/tailwindcss/releases/tag/v3.4.17 | Locally generated responsive utilities in vendor/tailwindcss/3.4.17/tailwind.min.css; no preflight or runtime JavaScript |

Each dependency's original LICENSE is beside its downloaded file. `scripts/assets.js` extracts only used Lucide symbols to `assets/icons/lucide.svg`.

`vendor/integrity.json` records expected SHA-256 hashes and source URLs. `node scripts/check-vendor.js` checks them before packaging. These are reviewed vendored-byte baselines, not a claim that a live upstream registry attestation was completed. Changes require explicit source/license review and a new recorded hash; never regenerate hashes automatically during a build.

The Chart.js local patch rejects `__proto__`, `prototype`, and `constructor` in dotted Defaults paths and route property names before traversal/property creation. It addresses the [upstream Defaults-path report](https://github.com/chartjs/Chart.js/issues/12265). It does not change chart data/rendering APIs or assert that CVE-2020-7746 affects this version. The pre-patch hash and patch reference are retained in the integrity inventory. Regression coverage is in `tests/security.test.js`.

Optional maintainer tooling: Sharp (Apache-2.0) generates checked-in images; Playwright (Apache-2.0) runs browser tests. Neither is bundled or needed to load ONEFLOW. Test scripts use a supplied runtime path, not a remote import. Actual runtime versions are recorded in the Stage 1 report after verification.


Tailwind generation: use the pinned standalone CLI with `-c scripts/tailwind.config.cjs -i scripts/tailwind.input.css -o vendor/tailwindcss/3.4.17/tailwind.min.css --minify`. Only the stylesheet and MIT license ship. The compiler stays in the ignored development tooling directory. Generation follows https://v3.tailwindcss.com/docs/installation; the checked-in stylesheet is ready to use without compilation.

Stage 1 accessibility fonts are local assets, with their SIL OFL licenses, source URLs and pinned SHA-256 bytes in `assets/fonts/README.md`. Optional Lighthouse 12.8.2 QA tooling is isolated in the ignored `.qa-tools/` directory and is excluded from the extension release inventory. It is not a runtime dependency.
