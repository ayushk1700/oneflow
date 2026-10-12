# Static wallpapers

This folder is the source for still backgrounds. Six original ONEFLOW landscapes and their optimized previews are included (MIT, see the repository LICENSE).

Add WebP, JPEG, PNG or AVIF files directly here, then run `npm run wallpapers` and reload the extension. Subfolders and symbolic links are intentionally ignored. Optional previews use `<filename-without-extension>-thumb.webp`; otherwise the original serves as its own preview. Prefer optimized 1920×1080 WebP files below 160 KB and 384×216 previews below 16 KB. The index command never edits originals.

Keep the starter files and their stable names: onboarding, older saved scenes and missing-media fallbacks depend on them. The optional `scripts/refresh-wallpapers.js` regenerates these six original artworks; it is not needed to add your own images.

Only include images you have the right to distribute. Additional images are not covered by ONEFLOW's artwork license.
