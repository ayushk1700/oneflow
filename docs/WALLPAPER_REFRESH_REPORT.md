# Stage Report: refreshed wallpapers

Replaced all six bundled still scenes with original, brighter illustrations: Emerald lake, Sunlit coast, Cherry blossom morning, Wildflower meadow, Northern lights and Coral desert sunrise. Optimized WebP files and thumbnails remain offline. Stable scene identifiers preserve existing selections. Contrast shading stays enabled.

Removed the Unsplash key/search interface and its API/image permissions. Existing cached photos retain their local image and attribution. Legacy backup fields remain readable. No Pexels key is collected and no Pexels network requests are made.

Pexels integration is incomplete because the official API guidelines prohibit wallpaper-app use: https://www.pexels.com/api/documentation/. Provider approval for ONEFLOW is required before enabling that integration. Local photo and MP4/WebM imports and bundled animated atmospheres continue to work.

Files: data/backgrounds.json; assets/backgrounds/{alpine,cozy,lofi,minimal,dark,summit}.{svg,webp}; corresponding thumbnails; scripts/refresh-wallpapers.js; components/settings/index.js; core/theme.js; manifest.json.

Load: reload ONEFLOW in the browser Extensions page, reopen the dashboard, then Settings → Appearance → Wallpapers. Select a fresh scene or import your own photo/video.

Acceptance: manifest/CSP/syntax and offline assets checked. Pexels online photo/video search is blocked by provider terms; no claim of live integration. Screen-reader/device reviews remain manual. No store publication in this stage.
