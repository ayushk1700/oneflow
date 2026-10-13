# Stage 5 — audit before implementation

All 278 HTML/CSS/JS files in the source, tests, tools, launch pages and pinned vendor directories were read by the source scan. The JSON inventory records byte counts and hashes. Static matches are candidates, not proof of rendered contrast failures. Generated bundles and third-party code are inventoried but not treated as authored components.

## Files reviewed

- newtab/app.css (Generated output)
- newtab/dashboard.css (Source scan)
- newtab/foundation.css (Source scan)
- newtab/index.html (Source scan)
- newtab/newtab.css (Source scan)
- newtab/newtab.js (Source scan)
- newtab/panels.css (Source scan)
- newtab/sketch.css (Source scan)
- newtab/system.css (Source scan)
- newtab/tokens.css (Source scan)
- newtab/widgets.css (Generated output)
- core/audio-engine.js (Source scan)
- core/background-presentation.js (Source scan)
- core/backup.js (Source scan)
- core/blocker-logic.js (Source scan)
- core/config.js (Source scan)
- core/crypto-backup.js (Source scan)
- core/dashboard-view.js (Source scan)
- core/db.js (Source scan)
- core/diagnostics.js (Source scan)
- core/drafts.js (Source scan)
- core/events.js (Source scan)
- core/features.js (Source scan)
- core/home-menu.js (Source scan)
- core/i18n.js (Source scan)
- core/image-preview.js (Source scan)
- core/journal.js (Source scan)
- core/journeys-logic.js (Source scan)
- core/journeys-schema.js (Source scan)
- core/journeys.js (Source scan)
- core/layout.js (Source scan)
- core/lazy-widgets.js (Source scan)
- core/live-wallpaper.js (Source scan)
- core/notes-schema.js (Source scan)
- core/notes.js (Source scan)
- core/notifications.js (Source scan)
- core/panel-navigation.js (Source scan)
- core/pexels-credit.js (Source scan)
- core/publisher.js (Source scan)
- core/refinement-schema.js (Source scan)
- core/scenes.js (Source scan)
- core/schema.js (Source scan)
- core/search.js (Source scan)
- core/stage2-schema.js (Source scan)
- core/stage3-schema.js (Source scan)
- core/state.js (Source scan)
- core/stats-logic.js (Source scan)
- core/storage.js (Source scan)
- core/studio-logic.js (Source scan)
- core/studio-presets.js (Source scan)
- core/studio-runtime.js (Source scan)
- core/studio-schema.js (Source scan)
- core/suggestions.js (Source scan)
- core/theme.js (Source scan)
- core/timer-client.js (Source scan)
- core/timer-engine.js (Source scan)
- core/timer-logic.js (Source scan)
- core/toaster.js (Source scan)
- core/tool-catalog.js (Source scan)
- core/tool-preferences.js (Source scan)
- core/ui.js (Source scan)
- core/utils.js (Source scan)
- core/work-context.js (Source scan)
- core/work-logic.js (Source scan)
- core/work-monitor.js (Source scan)
- core/work-schema.js (Source scan)
- components/workspace/index.js (Source scan)
- components/workbench/shared.js (Source scan)
- components/workbench/style.css (Source scan)
- components/websearch/index.js (Source scan)
- components/weather/index.js (Source scan)
- components/weather/style.css (Source scan)
- components/unsplash/index.js (Source scan)
- components/unsplash/style.css (Source scan)
- components/tools/index.js (Source scan)
- components/timer/index.js (Source scan)
- components/timer/preferences.js (Source scan)
- components/timer/style.css (Source scan)
- components/tasks/index.js (Source scan)
- components/tasks/style.css (Source scan)
- components/support/index.js (Source scan)
- components/suggestions/index.js (Source scan)
- components/stats/index.js (Source scan)
- components/stats/style.css (Source scan)
- components/sounds/index.js (Source scan)
- components/sounds/style.css (Source scan)
- components/skills/index.js (Source scan)
- components/settings/customization.js (Source scan)
- components/settings/data-tools.js (Source scan)
- components/settings/index.js (Source scan)
- components/settings/style.css (Source scan)
- components/session-view/index.js (Source scan)
- components/session-enhancements/index.js (Source scan)
- components/search/index.js (Source scan)
- components/search/style.css (Source scan)
- components/scenes/index.js (Source scan)
- components/rituals/index.js (Source scan)
- components/reflection/index.js (Source scan)
- components/recovery/index.js (Source scan)
- components/recall/index.js (Source scan)
- components/recall/review.js (Source scan)
- components/quotes/index.js (Source scan)
- components/quotes/style.css (Source scan)
- components/quietweb/index.js (Source scan)
- components/queue/index.js (Source scan)
- components/proof/index.js (Source scan)
- components/pexels/index.js (Source scan)
- components/panel-design/index.js (Source scan)
- components/panel-design/style.css (Source scan)
- components/onboarding/index.js (Source scan)
- components/onboarding/style.css (Source scan)
- components/onboarding/wizard.js (Source scan)
- components/notifications/index.js (Source scan)
- components/notifications/style.css (Source scan)
- components/notes/capture.css (Source scan)
- components/notes/capture.html (Source scan)
- components/notes/capture.js (Source scan)
- components/notes/checklist.js (Source scan)
- components/notes/index.js (Source scan)
- components/notes/planner.js (Source scan)
- components/notes/style.css (Source scan)
- components/music/index.js (Source scan)
- components/music/style.css (Source scan)
- components/music/youtube-player.js (Source scan)
- components/music/youtube-search.js (Source scan)
- components/mood/index.js (Source scan)
- components/mood/style.css (Source scan)
- components/links/index.js (Source scan)
- components/links/style.css (Source scan)
- components/layout/index.js (Source scan)
- components/layout/style.css (Source scan)
- components/journeys/shared.js (Source scan)
- components/journeys/style.css (Source scan)
- components/journal/index.js (Source scan)
- components/journal/settings.js (Source scan)
- components/journal/style.css (Source scan)
- components/journal/workspace.js (Source scan)
- components/habits/index.js (Source scan)
- components/habits/style.css (Source scan)
- components/garden/index.js (Source scan)
- components/focus/index.js (Source scan)
- components/focus/style.css (Source scan)
- components/flow/index.js (Source scan)
- components/flow/style.css (Source scan)
- components/firststep/index.js (Source scan)
- components/energyweather/index.js (Source scan)
- components/energy/index.js (Source scan)
- components/dna/index.js (Source scan)
- components/dictionary/api.js (Source scan)
- components/dictionary/index.js (Source scan)
- components/dictionary/style.css (Source scan)
- components/customizer/index.js (Source scan)
- components/countdowns/index.js (Source scan)
- components/countdowns/style.css (Source scan)
- components/compiler/index.js (Source scan)
- components/commands/index.js (Source scan)
- components/clock/index.js (Source scan)
- components/clock/style.css (Source scan)
- components/career/index.js (Source scan)
- components/career/view.js (Source scan)
- components/capsules/index.js (Source scan)
- components/break/index.js (Source scan)
- components/break/style.css (Source scan)
- components/blocker/index.js (Source scan)
- components/ambient-clock/index.js (Source scan)
- components/ambient-clock/style.css (Source scan)
- components/ambient/index.js (Source scan)
- components/ambient/style.css (Source scan)
- components/afterglow/index.js (Source scan)
- background/focus-service.js (Source scan)
- background/notes-service.js (Source scan)
- background/pexels.js (Source scan)
- background/service-worker.js (Source scan)
- background/studio.js (Source scan)
- background/audio/audio.js (Source scan)
- background/audio/index.html (Source scan)
- blocked/index.html (Source scan)
- blocked/index.js (Source scan)
- blocked/style.css (Source scan)
- vendor/tailwindcss/3.4.17/tailwind.min.css (Pinned third-party code)
- vendor/sortablejs/1.15.6/Sortable.min.js (Pinned third-party code)
- vendor/lucide/0.468.0/lucide.min.js (Pinned third-party code)
- vendor/chart.js/4.4.8/chart.umd.js (Pinned third-party code)
- vendor/canvas-confetti/1.9.3/confetti.browser.min.js (Pinned third-party code)
- scripts/assets.js (Source scan)
- scripts/audit-design-release.js (Source scan)
- scripts/check.js (Source scan)
- scripts/data.js (Source scan)
- scripts/design-inventory.js (Source scan)
- scripts/icons.js (Source scan)
- scripts/index-wallpapers.js (Source scan)
- scripts/launch-captures.js (Source scan)
- scripts/launch-demo.js (Source scan)
- scripts/launch-pages.js (Source scan)
- scripts/localize.js (Source scan)
- scripts/measure-design-baseline.js (Source scan)
- scripts/package.js (Source scan)
- scripts/preview.js (Source scan)
- scripts/refresh-wallpapers.js (Source scan)
- scripts/stage2-assets.js (Source scan)
- scripts/styles.js (Source scan)
- scripts/tailwind.input.css (Source scan)
- tests/ambient-clock-browser.js (Source scan)
- tests/ambient-redesign-browser.js (Source scan)
- tests/background-presentation.test.js (Source scan)
- tests/backgrounds-browser.js (Source scan)
- tests/browser.js (Source scan)
- tests/calm-corners-browser.js (Source scan)
- tests/calm-home-browser.js (Source scan)
- tests/calm-migration.test.js (Source scan)
- tests/combined-notes-browser.js (Source scan)
- tests/dashboard-browser.js (Source scan)
- tests/design-browser.js (Source scan)
- tests/design-foundation-browser.js (Source scan)
- tests/design-stage-3-4-browser.js (Source scan)
- tests/design-stage-5-6-browser.js (Source scan)
- tests/design-stage-7-8-browser.js (Source scan)
- tests/design-stage-9-browser.js (Source scan)
- tests/dictionary.test.js (Source scan)
- tests/home-foundation-browser.js (Source scan)
- tests/integrations.test.js (Source scan)
- tests/journal-fullscreen-browser.js (Source scan)
- tests/journal-wallpapers-browser.js (Source scan)
- tests/journeys-browser.js (Source scan)
- tests/journeys-media-browser.js (Source scan)
- tests/journeys-tabs-browser.js (Source scan)
- tests/journeys.test.js (Source scan)
- tests/lookup-browser.js (Source scan)
- tests/market-browser.js (Source scan)
- tests/market-ready.test.js (Source scan)
- tests/music-api-browser.js (Source scan)
- tests/notes-capture-browser.js (Source scan)
- tests/notes-capture.test.js (Source scan)
- tests/notes-checklist.test.js (Source scan)
- tests/notes-overlay-browser.js (Source scan)
- tests/package-browser.js (Source scan)
- tests/panel-boundaries-browser.js (Source scan)
- tests/panel-entry-browser.js (Source scan)
- tests/panel-environment-browser.js (Source scan)
- tests/panel-planning-browser.js (Source scan)
- tests/panel-redesign-browser.js (Source scan)
- tests/panel-remaining-browser.js (Source scan)
- tests/panels-browser.js (Source scan)
- tests/pexels-browser.js (Source scan)
- tests/pexels-worker.test.js (Source scan)
- tests/pexels.test.js (Source scan)
- tests/refinement-browser.js (Source scan)
- tests/release-audit-browser.js (Source scan)
- tests/resilience.js (Source scan)
- tests/schema.test.js (Source scan)
- tests/settings-page-browser.js (Source scan)
- tests/sketch-browser.js (Source scan)
- tests/stage2-browser.js (Source scan)
- tests/stage2-integrations.js (Source scan)
- tests/stage2.test.js (Source scan)
- tests/stage3-browser.js (Source scan)
- tests/stage3.test.js (Source scan)
- tests/stage34-browser.js (Source scan)
- tests/stage7-browser.js (Source scan)
- tests/stats-notifications-browser.js (Source scan)
- tests/storage-startup.test.js (Source scan)
- tests/studio-browser.js (Source scan)
- tests/studio.test.js (Source scan)
- tests/task-dates.test.js (Source scan)
- tests/ui-refinement-browser.js (Source scan)
- tests/unified-timer-browser.js (Source scan)
- tests/unified-timer.test.js (Source scan)
- tests/work-context-browser.js (Source scan)
- tests/work-context.test.js (Source scan)
- tests/work-tabs-browser.js (Source scan)
- tests/workflow-completion-browser.js (Source scan)
- tests/workspace-browser.js (Source scan)
- tests/youtube-live-browser.js (Source scan)
- tests/youtube-music.test.js (Source scan)
- tests/youtube-search.test.js (Source scan)
- docs/launch/launch.css (Source scan)
- docs/launch/privacy.html (Source scan)
- docs/launch/support.html (Source scan)

## Inconsistency report

| ID | Severity | Location | Issue | Fix |
|---|---|---|---|---|
| U1 | Medium | newtab/dashboard.css:29 | spacing: padding:112px var(--space-lg) 176px | Use semantic tokens/shared states; preserve measured geometry |
| U2 | Medium | newtab/dashboard.css:165 | spacing: padding:var(--space-3) 2px | Use semantic tokens/shared states; preserve measured geometry |
| U3 | Medium | newtab/dashboard.css:172 | spacing: padding:80px var(--space-lg) 120px | Use semantic tokens/shared states; preserve measured geometry |
| U4 | Medium | newtab/dashboard.css:179 | spacing: padding:96px var(--space-lg) 140px | Use semantic tokens/shared states; preserve measured geometry |
| U5 | Medium | newtab/dashboard.css:186 | spacing: padding:80px var(--space-lg) 140px | Use semantic tokens/shared states; preserve measured geometry |
| U6 | Medium | newtab/dashboard.css:199 | spacing: padding-bottom:200px | Use semantic tokens/shared states; preserve measured geometry |
| U7 | Medium | newtab/dashboard.css:263 | spacing: padding-top:96px | Use semantic tokens/shared states; preserve measured geometry |
| U8 | Medium | newtab/dashboard.css:263 | spacing: padding-bottom:96px | Use semantic tokens/shared states; preserve measured geometry |
| U9 | Medium | newtab/dashboard.css:287 | spacing: padding-top:80px | Use semantic tokens/shared states; preserve measured geometry |
| U10 | Medium | newtab/dashboard.css:287 | spacing: padding-bottom:80px | Use semantic tokens/shared states; preserve measured geometry |
| U11 | Medium | newtab/dashboard.css:307 | spacing: padding:2px | Use semantic tokens/shared states; preserve measured geometry |
| U12 | Medium | newtab/dashboard.css:404 | spacing: padding-top:104px | Use semantic tokens/shared states; preserve measured geometry |
| U13 | Medium | newtab/dashboard.css:404 | spacing: padding-bottom:112px | Use semantic tokens/shared states; preserve measured geometry |
| U14 | Medium | newtab/dashboard.css:413 | spacing: padding-top:88px | Use semantic tokens/shared states; preserve measured geometry |
| U15 | Medium | newtab/dashboard.css:37 | radius: border-radius:0 | Use semantic tokens/shared states; preserve measured geometry |
| U16 | Medium | newtab/dashboard.css:143 | radius: border-radius:0 | Use semantic tokens/shared states; preserve measured geometry |
| U17 | Medium | newtab/dashboard.css:144 | radius: border-radius:9 | Use semantic tokens/shared states; preserve measured geometry |
| U18 | Medium | newtab/dashboard.css:165 | radius: border-radius:0 | Use semantic tokens/shared states; preserve measured geometry |
| U19 | Medium | newtab/dashboard.css:221 | radius: border-radius:6 | Use semantic tokens/shared states; preserve measured geometry |
| U20 | Medium | newtab/dashboard.css:275 | radius: border-radius:999 | Use semantic tokens/shared states; preserve measured geometry |
| U21 | Medium | newtab/dashboard.css:330 | radius: border-radius:50 | Use semantic tokens/shared states; preserve measured geometry |
| U22 | Medium | newtab/dashboard.css:33 | type: font-size:clamp(20px | Use semantic tokens/shared states; preserve measured geometry |
| U23 | Medium | newtab/dashboard.css:35 | type: font-size:clamp(80px | Use semantic tokens/shared states; preserve measured geometry |
| U24 | Medium | newtab/dashboard.css:57 | type: font-size:clamp(23px | Use semantic tokens/shared states; preserve measured geometry |
| U25 | Medium | newtab/dashboard.css:58 | type: font-size:64px | Use semantic tokens/shared states; preserve measured geometry |
| U26 | Medium | newtab/dashboard.css:74 | type: font-size:clamp(96px | Use semantic tokens/shared states; preserve measured geometry |
| U27 | Medium | newtab/dashboard.css:81 | type: font-size:clamp(96px | Use semantic tokens/shared states; preserve measured geometry |
| U28 | Medium | newtab/dashboard.css:175 | type: font-size:140px | Use semantic tokens/shared states; preserve measured geometry |
| U29 | Medium | newtab/dashboard.css:188 | type: font-size:clamp(64px | Use semantic tokens/shared states; preserve measured geometry |
| U30 | Medium | newtab/dashboard.css:194 | type: font-size:clamp(82px | Use semantic tokens/shared states; preserve measured geometry |
| U31 | Medium | newtab/dashboard.css:271 | type: font-size:clamp(24px | Use semantic tokens/shared states; preserve measured geometry |
| U32 | Medium | newtab/dashboard.css:272 | type: font-size:clamp(112px | Use semantic tokens/shared states; preserve measured geometry |
| U33 | Medium | newtab/dashboard.css:288 | type: font-size:clamp(23px | Use semantic tokens/shared states; preserve measured geometry |
| U34 | Medium | newtab/dashboard.css:289 | type: font-size:clamp(88px | Use semantic tokens/shared states; preserve measured geometry |
| U35 | Medium | newtab/dashboard.css:307 | type: font-size:17px | Use semantic tokens/shared states; preserve measured geometry |
| U36 | Medium | newtab/dashboard.css:330 | type: font-size:clamp(48px | Use semantic tokens/shared states; preserve measured geometry |
| U37 | Medium | newtab/dashboard.css:16 | layer: z-index:1 | Use semantic tokens/shared states; preserve measured geometry |
| U38 | Medium | newtab/dashboard.css:99 | layer: z-index:2 | Use semantic tokens/shared states; preserve measured geometry |
| U39 | Medium | newtab/dashboard.css:100 | layer: z-index:10 | Use semantic tokens/shared states; preserve measured geometry |
| U40 | Medium | newtab/dashboard.css:306 | layer: z-index:20 | Use semantic tokens/shared states; preserve measured geometry |
| U41 | Medium | newtab/dashboard.css:335 | layer: z-index:30 | Use semantic tokens/shared states; preserve measured geometry |
| U42 | Low | newtab/dashboard.css:312 | motion: transition-duration:clamp(150ms,var(--studio-motion),250ms | Use semantic tokens/shared states; preserve measured geometry |
| U43 | Low | newtab/dashboard.css:338 | motion: transition-duration:0ms | Use semantic tokens/shared states; preserve measured geometry |
| U44 | Medium | newtab/foundation.css:21 | spacing: padding:var(--space-5) clamp(var(--space-lg),5vw,80px | Use semantic tokens/shared states; preserve measured geometry |
| U45 | Medium | newtab/foundation.css:39 | spacing: padding:var(--space-lg) clamp(var(--space-lg),7vw,112px | Use semantic tokens/shared states; preserve measured geometry |
| U46 | Medium | newtab/foundation.css:69 | spacing: padding:var(--space-md) clamp(var(--space-lg),5vw,80px | Use semantic tokens/shared states; preserve measured geometry |
| U47 | Medium | newtab/foundation.css:147 | spacing: padding:var(--space-5) clamp(var(--space-lg),4vw,64px | Use semantic tokens/shared states; preserve measured geometry |
| U48 | Medium | newtab/foundation.css:162 | spacing: margin:2px | Use semantic tokens/shared states; preserve measured geometry |
| U49 | Medium | newtab/foundation.css:54 | radius: border-radius:0 | Use semantic tokens/shared states; preserve measured geometry |
| U50 | Medium | newtab/foundation.css:45 | type: font-size:clamp(88px | Use semantic tokens/shared states; preserve measured geometry |
| U51 | Medium | newtab/foundation.css:51 | type: font-size:64px | Use semantic tokens/shared states; preserve measured geometry |
| U52 | Medium | newtab/foundation.css:62 | type: font-size:64px | Use semantic tokens/shared states; preserve measured geometry |
| U53 | Medium | newtab/foundation.css:107 | type: font-size:92px | Use semantic tokens/shared states; preserve measured geometry |
| U54 | Medium | newtab/foundation.css:111 | type: font-size:54px | Use semantic tokens/shared states; preserve measured geometry |
| U55 | Medium | newtab/foundation.css:120 | type: font-size:90px | Use semantic tokens/shared states; preserve measured geometry |
| U56 | Medium | newtab/foundation.css:153 | type: font-size:clamp(26px | Use semantic tokens/shared states; preserve measured geometry |
| U57 | Medium | newtab/foundation.css:155 | type: font-size:clamp(80px | Use semantic tokens/shared states; preserve measured geometry |
| U58 | Medium | newtab/foundation.css:165 | type: font-size:8px | Use semantic tokens/shared states; preserve measured geometry |
| U59 | Medium | newtab/foundation.css:173 | type: font-size:8px | Use semantic tokens/shared states; preserve measured geometry |
| U60 | Medium | newtab/newtab.css:49 | spacing: margin: -1px | Use semantic tokens/shared states; preserve measured geometry |
| U61 | Medium | newtab/newtab.css:62 | spacing: padding: var(--space-lg) 38px | Use semantic tokens/shared states; preserve measured geometry |
| U62 | Medium | newtab/newtab.css:67 | spacing: margin: 0 3px | Use semantic tokens/shared states; preserve measured geometry |
| U63 | Medium | newtab/newtab.css:69 | spacing: margin-top: 3px | Use semantic tokens/shared states; preserve measured geometry |
| U64 | Medium | newtab/newtab.css:72 | spacing: padding: 1px | Use semantic tokens/shared states; preserve measured geometry |
| U65 | Medium | newtab/newtab.css:79 | spacing: margin-top: 3px | Use semantic tokens/shared states; preserve measured geometry |
| U66 | Medium | newtab/newtab.css:81 | spacing: gap: 3px | Use semantic tokens/shared states; preserve measured geometry |
| U67 | Medium | newtab/newtab.css:82 | spacing: padding: var(--space-sm) 3px | Use semantic tokens/shared states; preserve measured geometry |
| U68 | Medium | newtab/newtab.css:111 | spacing: gap: 1px | Use semantic tokens/shared states; preserve measured geometry |
| U69 | Medium | newtab/newtab.css:17 | radius: border-radius: 4 | Use semantic tokens/shared states; preserve measured geometry |
| U70 | Medium | newtab/newtab.css:72 | radius: border-radius: 5 | Use semantic tokens/shared states; preserve measured geometry |
| U71 | Medium | newtab/newtab.css:80 | radius: border-radius: 50 | Use semantic tokens/shared states; preserve measured geometry |
| U72 | Medium | newtab/newtab.css:99 | radius: border-radius: 40 | Use semantic tokens/shared states; preserve measured geometry |
| U73 | Medium | newtab/newtab.css:51 | layer: z-index: -3 | Use semantic tokens/shared states; preserve measured geometry |
| U74 | Medium | newtab/newtab.css:53 | layer: z-index: -2 | Use semantic tokens/shared states; preserve measured geometry |
| U75 | Medium | newtab/newtab.css:88 | layer: z-index: 10 | Use semantic tokens/shared states; preserve measured geometry |
| U76 | Medium | newtab/newtab.css:92 | layer: z-index: 20 | Use semantic tokens/shared states; preserve measured geometry |
| U77 | Medium | newtab/newtab.css:125 | layer: z-index:3 | Use semantic tokens/shared states; preserve measured geometry |
| U78 | Medium | newtab/panels.css:9 | spacing: padding:3px | Use semantic tokens/shared states; preserve measured geometry |
| U79 | Medium | newtab/panels.css:11 | spacing: padding:2px | Use semantic tokens/shared states; preserve measured geometry |
| U80 | Medium | newtab/panels.css:49 | spacing: margin-top:3px | Use semantic tokens/shared states; preserve measured geometry |
| U81 | Medium | newtab/panels.css:117 | spacing: padding-right:2px | Use semantic tokens/shared states; preserve measured geometry |
| U82 | Medium | newtab/panels.css:30 | radius: border-radius:0 | Use semantic tokens/shared states; preserve measured geometry |
| U83 | Medium | newtab/panels.css:31 | radius: border-radius:9 | Use semantic tokens/shared states; preserve measured geometry |
| U84 | Medium | newtab/panels.css:69 | radius: border-radius:0 | Use semantic tokens/shared states; preserve measured geometry |
| U85 | Medium | newtab/panels.css:100 | radius: border-radius:9 | Use semantic tokens/shared states; preserve measured geometry |
| U86 | Medium | newtab/panels.css:138 | radius: border-radius:6 | Use semantic tokens/shared states; preserve measured geometry |
| U87 | Medium | newtab/panels.css:7 | type: font-size:9px | Use semantic tokens/shared states; preserve measured geometry |
| U88 | High | newtab/sketch.css:2 | color: #0003 | Use semantic tokens/shared states; preserve measured geometry |
| U89 | High | newtab/sketch.css:49 | color: #182b26f5 | Use semantic tokens/shared states; preserve measured geometry |
| U90 | High | newtab/sketch.css:49 | color: #142020f5 | Use semantic tokens/shared states; preserve measured geometry |
| U91 | High | newtab/sketch.css:49 | color: #f6f1e7 | Use semantic tokens/shared states; preserve measured geometry |
| U92 | High | newtab/sketch.css:55 | color: #cbd3ca | Use semantic tokens/shared states; preserve measured geometry |
| U93 | High | newtab/sketch.css:57 | color: #ffffff24 | Use semantic tokens/shared states; preserve measured geometry |
| U94 | High | newtab/sketch.css:59 | color: #ffffff50 | Use semantic tokens/shared states; preserve measured geometry |
| U95 | High | newtab/sketch.css:68 | color: #ffffff24 | Use semantic tokens/shared states; preserve measured geometry |
| U96 | High | newtab/sketch.css:75 | color: #0004 | Use semantic tokens/shared states; preserve measured geometry |
| U97 | Medium | newtab/sketch.css:2 | spacing: gap:24px | Use semantic tokens/shared states; preserve measured geometry |
| U98 | Medium | newtab/sketch.css:4 | spacing: padding:28px 36px | Use semantic tokens/shared states; preserve measured geometry |
| U99 | Medium | newtab/sketch.css:6 | spacing: padding:24px 24px 120px | Use semantic tokens/shared states; preserve measured geometry |
| U100 | Medium | newtab/sketch.css:7 | spacing: gap:18px | Use semantic tokens/shared states; preserve measured geometry |
| U101 | Medium | newtab/sketch.css:8 | spacing: padding:24px 32px 30px | Use semantic tokens/shared states; preserve measured geometry |
| U102 | Medium | newtab/sketch.css:9 | spacing: gap:16px | Use semantic tokens/shared states; preserve measured geometry |
| U103 | Medium | newtab/sketch.css:9 | spacing: margin-bottom:28px | Use semantic tokens/shared states; preserve measured geometry |
| U104 | Medium | newtab/sketch.css:11 | spacing: padding:6px | Use semantic tokens/shared states; preserve measured geometry |
| U105 | Medium | newtab/sketch.css:12 | spacing: gap:32px | Use semantic tokens/shared states; preserve measured geometry |
| U106 | Medium | newtab/sketch.css:14 | spacing: margin:0 0 18px | Use semantic tokens/shared states; preserve measured geometry |
| U107 | Medium | newtab/sketch.css:16 | spacing: margin-left:10px | Use semantic tokens/shared states; preserve measured geometry |
| U108 | Medium | newtab/sketch.css:17 | spacing: margin:18px | Use semantic tokens/shared states; preserve measured geometry |
| U109 | Medium | newtab/sketch.css:18 | spacing: padding:0 0 0 30px | Use semantic tokens/shared states; preserve measured geometry |
| U110 | Medium | newtab/sketch.css:20 | spacing: gap:12px | Use semantic tokens/shared states; preserve measured geometry |
| U111 | Medium | newtab/sketch.css:21 | spacing: margin-bottom:18px | Use semantic tokens/shared states; preserve measured geometry |
| U112 | Medium | newtab/sketch.css:23 | spacing: margin:0 0 12px | Use semantic tokens/shared states; preserve measured geometry |
| U113 | Medium | newtab/sketch.css:24 | spacing: margin:8px 0 20px | Use semantic tokens/shared states; preserve measured geometry |
| U114 | Medium | newtab/sketch.css:26 | spacing: gap:8px | Use semantic tokens/shared states; preserve measured geometry |
| U115 | Medium | newtab/sketch.css:27 | spacing: padding:8px | Use semantic tokens/shared states; preserve measured geometry |
| U116 | Medium | newtab/sketch.css:30 | spacing: margin-top:16px | Use semantic tokens/shared states; preserve measured geometry |
| U117 | Medium | newtab/sketch.css:31 | spacing: padding:10px 18px | Use semantic tokens/shared states; preserve measured geometry |
| U118 | Medium | newtab/sketch.css:35 | spacing: padding:6px | Use semantic tokens/shared states; preserve measured geometry |
| U119 | Medium | newtab/sketch.css:39 | spacing: padding:24px 36px | Use semantic tokens/shared states; preserve measured geometry |
| U120 | Medium | newtab/sketch.css:40 | spacing: gap:12px | Use semantic tokens/shared states; preserve measured geometry |
| U121 | Medium | newtab/sketch.css:41 | spacing: padding:12px | Use semantic tokens/shared states; preserve measured geometry |
| U122 | Medium | newtab/sketch.css:42 | spacing: padding:5px 10px | Use semantic tokens/shared states; preserve measured geometry |
| U123 | Medium | newtab/sketch.css:48 | spacing: padding:32px | Use semantic tokens/shared states; preserve measured geometry |
| U124 | Medium | newtab/sketch.css:49 | spacing: padding:32px | Use semantic tokens/shared states; preserve measured geometry |
| U125 | Medium | newtab/sketch.css:52 | spacing: gap:48px | Use semantic tokens/shared states; preserve measured geometry |
| U126 | Medium | newtab/sketch.css:53 | spacing: gap:24px | Use semantic tokens/shared states; preserve measured geometry |
| U127 | Medium | newtab/sketch.css:57 | spacing: padding-left:28px | Use semantic tokens/shared states; preserve measured geometry |
| U128 | Medium | newtab/sketch.css:58 | spacing: gap:14px | Use semantic tokens/shared states; preserve measured geometry |
| U129 | Medium | newtab/sketch.css:58 | spacing: padding:14px | Use semantic tokens/shared states; preserve measured geometry |
| U130 | Medium | newtab/sketch.css:59 | spacing: padding:9px | Use semantic tokens/shared states; preserve measured geometry |
| U131 | Medium | newtab/sketch.css:62 | spacing: padding:20px | Use semantic tokens/shared states; preserve measured geometry |
| U132 | Medium | newtab/sketch.css:62 | spacing: padding:12px 18px 100px | Use semantic tokens/shared states; preserve measured geometry |
| U133 | Medium | newtab/sketch.css:63 | spacing: padding:20px | Use semantic tokens/shared states; preserve measured geometry |
| U134 | Medium | newtab/sketch.css:63 | spacing: margin-bottom:24px | Use semantic tokens/shared states; preserve measured geometry |
| U135 | Medium | newtab/sketch.css:63 | spacing: gap:24px | Use semantic tokens/shared states; preserve measured geometry |
| U136 | Medium | newtab/sketch.css:64 | spacing: margin-top:12px | Use semantic tokens/shared states; preserve measured geometry |
| U137 | Medium | newtab/sketch.css:65 | spacing: padding:22px | Use semantic tokens/shared states; preserve measured geometry |
| U138 | Medium | newtab/sketch.css:66 | spacing: padding:18px 20px | Use semantic tokens/shared states; preserve measured geometry |
| U139 | Medium | newtab/sketch.css:67 | spacing: padding:20px 16px | Use semantic tokens/shared states; preserve measured geometry |
| U140 | Medium | newtab/sketch.css:68 | spacing: gap:24px | Use semantic tokens/shared states; preserve measured geometry |
| U141 | Medium | newtab/sketch.css:68 | spacing: padding:20px | Use semantic tokens/shared states; preserve measured geometry |
| U142 | Medium | newtab/sketch.css:70 | spacing: padding:18px 28px | Use semantic tokens/shared states; preserve measured geometry |
| U143 | Medium | newtab/sketch.css:70 | spacing: margin-bottom:16px | Use semantic tokens/shared states; preserve measured geometry |
| U144 | Medium | newtab/sketch.css:70 | spacing: padding-bottom:90px | Use semantic tokens/shared states; preserve measured geometry |
| U145 | Medium | newtab/sketch.css:74 | spacing: margin-top:16px | Use semantic tokens/shared states; preserve measured geometry |
| U146 | Medium | newtab/sketch.css:78 | spacing: margin-bottom:10px | Use semantic tokens/shared states; preserve measured geometry |
| U147 | Medium | newtab/sketch.css:79 | spacing: margin-top:8px | Use semantic tokens/shared states; preserve measured geometry |
| U148 | Medium | newtab/sketch.css:80 | spacing: gap:18px | Use semantic tokens/shared states; preserve measured geometry |
| U149 | Medium | newtab/sketch.css:80 | spacing: padding-bottom:120px | Use semantic tokens/shared states; preserve measured geometry |
| U150 | Medium | newtab/sketch.css:82 | spacing: margin-right:12px | Use semantic tokens/shared states; preserve measured geometry |
| U151 | Medium | newtab/sketch.css:82 | spacing: padding:12px | Use semantic tokens/shared states; preserve measured geometry |
| U152 | Medium | newtab/sketch.css:85 | spacing: margin-bottom:24px | Use semantic tokens/shared states; preserve measured geometry |
| U153 | Medium | newtab/sketch.css:88 | spacing: gap:12px | Use semantic tokens/shared states; preserve measured geometry |
| U154 | Medium | newtab/sketch.css:91 | spacing: padding:6px | Use semantic tokens/shared states; preserve measured geometry |
| U155 | Medium | newtab/sketch.css:91 | spacing: margin-bottom:8px | Use semantic tokens/shared states; preserve measured geometry |
| U156 | Medium | newtab/sketch.css:92 | spacing: margin-top:8px | Use semantic tokens/shared states; preserve measured geometry |
| U157 | Medium | newtab/sketch.css:94 | spacing: gap:5px | Use semantic tokens/shared states; preserve measured geometry |
| U158 | Medium | newtab/sketch.css:94 | spacing: padding:8px 12px | Use semantic tokens/shared states; preserve measured geometry |
| U159 | Medium | newtab/sketch.css:96 | spacing: padding:12px | Use semantic tokens/shared states; preserve measured geometry |
| U160 | Medium | newtab/sketch.css:97 | spacing: padding:12px | Use semantic tokens/shared states; preserve measured geometry |
| U161 | Medium | newtab/sketch.css:97 | spacing: margin:0 0 8px | Use semantic tokens/shared states; preserve measured geometry |
| U162 | Medium | newtab/sketch.css:98 | spacing: margin:0 0 8px | Use semantic tokens/shared states; preserve measured geometry |
| U163 | Medium | newtab/sketch.css:98 | spacing: gap:8px | Use semantic tokens/shared states; preserve measured geometry |
| U164 | Medium | newtab/sketch.css:99 | spacing: padding:12px | Use semantic tokens/shared states; preserve measured geometry |
| U165 | Medium | newtab/sketch.css:99 | spacing: gap:8px | Use semantic tokens/shared states; preserve measured geometry |
| U166 | Medium | newtab/sketch.css:99 | spacing: gap:6px | Use semantic tokens/shared states; preserve measured geometry |
| U167 | Medium | newtab/sketch.css:99 | spacing: padding:8px | Use semantic tokens/shared states; preserve measured geometry |
| U168 | Medium | newtab/sketch.css:99 | spacing: padding:9px | Use semantic tokens/shared states; preserve measured geometry |
| U169 | Medium | newtab/sketch.css:99 | spacing: padding:18px | Use semantic tokens/shared states; preserve measured geometry |
| U170 | Medium | newtab/sketch.css:18 | radius: border-radius:0 | Use semantic tokens/shared states; preserve measured geometry |
| U171 | Medium | newtab/sketch.css:31 | radius: border-radius:10 | Use semantic tokens/shared states; preserve measured geometry |
| U172 | Medium | newtab/sketch.css:33 | radius: border-radius:12 | Use semantic tokens/shared states; preserve measured geometry |
| U173 | Medium | newtab/sketch.css:40 | radius: border-radius:0 | Use semantic tokens/shared states; preserve measured geometry |
| U174 | Medium | newtab/sketch.css:41 | radius: border-radius:50 | Use semantic tokens/shared states; preserve measured geometry |
| U175 | Medium | newtab/sketch.css:42 | radius: border-radius:8 | Use semantic tokens/shared states; preserve measured geometry |
| U176 | Medium | newtab/sketch.css:59 | radius: border-radius:50 | Use semantic tokens/shared states; preserve measured geometry |
| U177 | Medium | newtab/sketch.css:82 | radius: border-radius:50 | Use semantic tokens/shared states; preserve measured geometry |
| U178 | Medium | newtab/sketch.css:94 | radius: border-radius:14 | Use semantic tokens/shared states; preserve measured geometry |
| U179 | Medium | newtab/sketch.css:5 | type: font-size:12px | Use semantic tokens/shared states; preserve measured geometry |
| U180 | Medium | newtab/sketch.css:10 | type: font-size:11px | Use semantic tokens/shared states; preserve measured geometry |
| U181 | Medium | newtab/sketch.css:11 | type: font-size:12px | Use semantic tokens/shared states; preserve measured geometry |
| U182 | Medium | newtab/sketch.css:14 | type: font-size:11px | Use semantic tokens/shared states; preserve measured geometry |
| U183 | Medium | newtab/sketch.css:15 | type: font-size:clamp(56px | Use semantic tokens/shared states; preserve measured geometry |
| U184 | Medium | newtab/sketch.css:16 | type: font-size:12px | Use semantic tokens/shared states; preserve measured geometry |
| U185 | Medium | newtab/sketch.css:17 | type: font-size:18px | Use semantic tokens/shared states; preserve measured geometry |
| U186 | Medium | newtab/sketch.css:21 | type: font-size:11px | Use semantic tokens/shared states; preserve measured geometry |
| U187 | Medium | newtab/sketch.css:22 | type: font-size:16px | Use semantic tokens/shared states; preserve measured geometry |
| U188 | Medium | newtab/sketch.css:23 | type: font-size:20px | Use semantic tokens/shared states; preserve measured geometry |
| U189 | Medium | newtab/sketch.css:24 | type: font-size:clamp(48px | Use semantic tokens/shared states; preserve measured geometry |
| U190 | Medium | newtab/sketch.css:27 | type: font-size:12px | Use semantic tokens/shared states; preserve measured geometry |
| U191 | Medium | newtab/sketch.css:30 | type: font-size:12px | Use semantic tokens/shared states; preserve measured geometry |
| U192 | Medium | newtab/sketch.css:31 | type: font-size:13px | Use semantic tokens/shared states; preserve measured geometry |
| U193 | Medium | newtab/sketch.css:34 | type: font-size:12px | Use semantic tokens/shared states; preserve measured geometry |
| U194 | Medium | newtab/sketch.css:42 | type: font-size:12px | Use semantic tokens/shared states; preserve measured geometry |
| U195 | Medium | newtab/sketch.css:44 | type: font-size:24px | Use semantic tokens/shared states; preserve measured geometry |
| U196 | Medium | newtab/sketch.css:54 | type: font-size:clamp(32px | Use semantic tokens/shared states; preserve measured geometry |
| U197 | Medium | newtab/sketch.css:64 | type: font-size:64px | Use semantic tokens/shared states; preserve measured geometry |
| U198 | Medium | newtab/sketch.css:64 | type: font-size:16px | Use semantic tokens/shared states; preserve measured geometry |
| U199 | Medium | newtab/sketch.css:66 | type: font-size:60px | Use semantic tokens/shared states; preserve measured geometry |
| U200 | Medium | newtab/sketch.css:74 | type: font-size:12px | Use semantic tokens/shared states; preserve measured geometry |
| U201 | Medium | newtab/sketch.css:77 | type: font-size:44px | Use semantic tokens/shared states; preserve measured geometry |
| U202 | Medium | newtab/sketch.css:79 | type: font-size:14px | Use semantic tokens/shared states; preserve measured geometry |
| U203 | Medium | newtab/sketch.css:86 | type: font-size:13px | Use semantic tokens/shared states; preserve measured geometry |
| U204 | Medium | newtab/sketch.css:91 | type: font-size:12px | Use semantic tokens/shared states; preserve measured geometry |
| U205 | Medium | newtab/sketch.css:92 | type: font-size:16px | Use semantic tokens/shared states; preserve measured geometry |
| U206 | Medium | newtab/sketch.css:95 | type: font-size:11px | Use semantic tokens/shared states; preserve measured geometry |
| U207 | Medium | newtab/sketch.css:97 | type: font-size:13px | Use semantic tokens/shared states; preserve measured geometry |
| U208 | Medium | newtab/sketch.css:98 | type: font-size:12px | Use semantic tokens/shared states; preserve measured geometry |
| U209 | Medium | newtab/sketch.css:36 | layer: z-index:2 | Use semantic tokens/shared states; preserve measured geometry |
| U210 | Medium | newtab/sketch.css:75 | layer: z-index:-1 | Use semantic tokens/shared states; preserve measured geometry |
| U211 | Medium | newtab/system.css:46 | spacing: padding-block:80px 140px | Use semantic tokens/shared states; preserve measured geometry |
| U212 | Medium | newtab/system.css:47 | spacing: margin-block:var(--space-lg) 140px | Use semantic tokens/shared states; preserve measured geometry |
| U213 | Medium | newtab/system.css:59 | spacing: padding-top:80px | Use semantic tokens/shared states; preserve measured geometry |
| U214 | Medium | newtab/system.css:105 | spacing: padding:0 clamp(var(--space-lg),4vw,56px | Use semantic tokens/shared states; preserve measured geometry |
| U215 | Medium | newtab/system.css:118 | spacing: padding:38px | Use semantic tokens/shared states; preserve measured geometry |
| U216 | Medium | newtab/system.css:120 | spacing: gap:2px | Use semantic tokens/shared states; preserve measured geometry |
| U217 | Medium | newtab/system.css:120 | spacing: padding:0 var(--space-md) 25px | Use semantic tokens/shared states; preserve measured geometry |
| U218 | Medium | newtab/system.css:137 | spacing: padding:42px clamp(var(--space-lg),5vw,74px) 88px | Use semantic tokens/shared states; preserve measured geometry |
| U219 | Medium | newtab/system.css:146 | spacing: padding:23px | Use semantic tokens/shared states; preserve measured geometry |
| U220 | Medium | newtab/system.css:170 | spacing: margin:0 0 3px | Use semantic tokens/shared states; preserve measured geometry |
| U221 | Medium | newtab/system.css:179 | spacing: margin:3px | Use semantic tokens/shared states; preserve measured geometry |
| U222 | Medium | newtab/system.css:204 | spacing: padding:var(--space-5) var(--space-lg) 70px | Use semantic tokens/shared states; preserve measured geometry |
| U223 | Medium | newtab/system.css:14 | radius: border-radius:0 | Use semantic tokens/shared states; preserve measured geometry |
| U224 | Medium | newtab/system.css:16 | radius: border-radius:0 | Use semantic tokens/shared states; preserve measured geometry |
| U225 | Medium | newtab/system.css:31 | radius: border-radius:0 | Use semantic tokens/shared states; preserve measured geometry |
| U226 | Medium | newtab/system.css:39 | radius: border-radius:0 | Use semantic tokens/shared states; preserve measured geometry |
| U227 | Medium | newtab/system.css:85 | radius: border-radius:0 | Use semantic tokens/shared states; preserve measured geometry |
| U228 | Medium | newtab/system.css:91 | radius: border-radius:0 | Use semantic tokens/shared states; preserve measured geometry |
| U229 | Medium | newtab/system.css:94 | radius: border-radius:0 | Use semantic tokens/shared states; preserve measured geometry |
| U230 | Medium | newtab/system.css:101 | radius: border-radius:0 | Use semantic tokens/shared states; preserve measured geometry |
| U231 | Medium | newtab/system.css:162 | radius: border-radius:999 | Use semantic tokens/shared states; preserve measured geometry |
| U232 | Medium | newtab/system.css:143 | type: font-size:clamp(29px | Use semantic tokens/shared states; preserve measured geometry |
| U233 | Medium | newtab/system.css:170 | type: font-size:19px | Use semantic tokens/shared states; preserve measured geometry |
| U234 | Medium | core/layout.js:19 | inline: .style.gridColumn = | Use semantic tokens/shared states; preserve measured geometry |
| U235 | Medium | core/layout.js:20 | inline: .style.gridRow = | Use semantic tokens/shared states; preserve measured geometry |
| U236 | Medium | core/layout.js:21 | inline: .style.order = | Use semantic tokens/shared states; preserve measured geometry |
| U237 | Medium | core/live-wallpaper.js:15 | inline: .style.backgroundImage = | Use semantic tokens/shared states; preserve measured geometry |
| U238 | High | core/schema.js:13 | color: #c9d9b5 | Persisted data contract; preserve compatibility |
| U239 | High | core/schema.js:18 | color: #293c36 | Persisted data contract; preserve compatibility |
| U240 | High | core/schema.js:50 | color: #7845df | Persisted data contract; preserve compatibility |
| U241 | Medium | core/studio-runtime.js:23 | inline: .style.cssText= | Use semantic tokens/shared states; preserve measured geometry |
| U242 | High | core/studio-schema.js:7 | color: #1c2522 | Persisted data contract; preserve compatibility |
| U243 | Medium | core/studio-schema.js:11 | inline: style:' | Persisted data contract; preserve compatibility |
| U244 | High | core/theme.js:47 | color: #ffffff | Use semantic tokens/shared states; preserve measured geometry |
| U245 | High | core/theme.js:53 | color: #101815 | Use semantic tokens/shared states; preserve measured geometry |
| U246 | High | core/theme.js:53 | color: #ffffff | Use semantic tokens/shared states; preserve measured geometry |
| U247 | High | core/theme.js:92 | color: #172f31 | Use semantic tokens/shared states; preserve measured geometry |
| U248 | High | core/theme.js:92 | color: #766553 | Use semantic tokens/shared states; preserve measured geometry |
| U249 | Medium | core/theme.js:29 | inline: .style.backgroundImage = | Use semantic tokens/shared states; preserve measured geometry |
| U250 | Medium | core/theme.js:30 | inline: .style.backgroundImage = | Use semantic tokens/shared states; preserve measured geometry |
| U251 | Medium | core/theme.js:36 | inline: .style.backgroundImage = | Use semantic tokens/shared states; preserve measured geometry |
| U252 | Medium | core/theme.js:90 | inline: .style.backgroundColor = | Use semantic tokens/shared states; preserve measured geometry |
| U253 | Medium | core/theme.js:92 | inline: .style.backgroundImage = | Use semantic tokens/shared states; preserve measured geometry |
| U254 | Medium | components/weather/style.css:1 | spacing: margin-top:3px | Use semantic tokens/shared states; preserve measured geometry |
| U255 | Medium | components/timer/style.css:5 | type: font-size: 9px | Use semantic tokens/shared states; preserve measured geometry |
| U256 | Medium | components/timer/style.css:6 | type: font-size: 34px | Use semantic tokens/shared states; preserve measured geometry |
| U257 | Medium | components/timer/style.css:14 | type: font-size: 76px | Use semantic tokens/shared states; preserve measured geometry |
| U258 | High | components/stats/index.js:76 | color: #f5f5f5 | Use semantic tokens/shared states; preserve measured geometry |
| U259 | Medium | components/sounds/style.css:3 | spacing: padding: 3px | Use semantic tokens/shared states; preserve measured geometry |
| U260 | High | components/settings/index.js:138 | color: #ffffff | Use semantic tokens/shared states; preserve measured geometry |
| U261 | High | components/settings/index.js:138 | color: #000000 | Use semantic tokens/shared states; preserve measured geometry |
| U262 | High | components/settings/index.js:140 | color: #ffffff | Use semantic tokens/shared states; preserve measured geometry |
| U263 | High | components/settings/index.js:140 | color: #000000 | Use semantic tokens/shared states; preserve measured geometry |
| U264 | Medium | components/settings/style.css:1 | spacing: gap:3px | Use semantic tokens/shared states; preserve measured geometry |
| U265 | Medium | components/search/style.css:1 | spacing: padding:var(--space-xs) var(--space-sm) var(--space-xs) 17px | Use semantic tokens/shared states; preserve measured geometry |
| U266 | High | components/scenes/index.js:116 | color: #203c36 | Use semantic tokens/shared states; preserve measured geometry |
| U267 | Medium | components/scenes/index.js:114 | inline: .style.objectPosition = | Use semantic tokens/shared states; preserve measured geometry |
| U268 | Medium | components/scenes/index.js:116 | inline: .style.background = | Use semantic tokens/shared states; preserve measured geometry |
| U269 | Medium | components/quotes/style.css:1 | spacing: padding:var(--space-sm) 25px | Use semantic tokens/shared states; preserve measured geometry |
| U270 | Medium | components/quotes/style.css:1 | spacing: gap:3px | Use semantic tokens/shared states; preserve measured geometry |
| U271 | Medium | components/quotes/style.css:1 | type: font-size:9px | Use semantic tokens/shared states; preserve measured geometry |
| U272 | Medium | components/panel-design/style.css:6 | layer: z-index:5 | Use semantic tokens/shared states; preserve measured geometry |
| U273 | Medium | components/panel-design/style.css:8 | layer: z-index:1 | Use semantic tokens/shared states; preserve measured geometry |
| U274 | Medium | components/panel-design/style.css:41 | layer: z-index:1 | Use semantic tokens/shared states; preserve measured geometry |
| U275 | Medium | components/onboarding/style.css:1 | type: font-size:44px | Use semantic tokens/shared states; preserve measured geometry |
| U276 | Medium | components/notifications/style.css:8 | radius: border-radius:50 | Use semantic tokens/shared states; preserve measured geometry |
| U277 | Medium | components/notes/capture.css:14 | spacing: padding:29px | Use semantic tokens/shared states; preserve measured geometry |
| U278 | Medium | components/notes/capture.css:17 | spacing: gap:3px | Use semantic tokens/shared states; preserve measured geometry |
| U279 | Medium | components/notes/capture.css:24 | spacing: gap:1px | Use semantic tokens/shared states; preserve measured geometry |
| U280 | Medium | components/notes/capture.css:40 | spacing: padding:0 var(--space-5) 90px | Use semantic tokens/shared states; preserve measured geometry |
| U281 | Medium | components/notes/capture.css:41 | spacing: margin:17px 0 27px | Use semantic tokens/shared states; preserve measured geometry |
| U282 | Medium | components/notes/capture.css:44 | spacing: padding:var(--space-xs) 25px | Use semantic tokens/shared states; preserve measured geometry |
| U283 | Medium | components/notes/capture.css:50 | spacing: padding:var(--space-md) 17px | Use semantic tokens/shared states; preserve measured geometry |
| U284 | Medium | components/notes/capture.css:53 | spacing: margin-top:2px | Use semantic tokens/shared states; preserve measured geometry |
| U285 | Medium | components/notes/capture.css:54 | spacing: padding:3px | Use semantic tokens/shared states; preserve measured geometry |
| U286 | Medium | components/notes/capture.css:56 | spacing: padding:55px | Use semantic tokens/shared states; preserve measured geometry |
| U287 | Medium | components/notes/capture.css:58 | spacing: gap:3px | Use semantic tokens/shared states; preserve measured geometry |
| U288 | Medium | components/notes/capture.css:59 | spacing: padding:2px | Use semantic tokens/shared states; preserve measured geometry |
| U289 | Medium | components/notes/capture.css:61 | spacing: gap:17px | Use semantic tokens/shared states; preserve measured geometry |
| U290 | Medium | components/notes/capture.css:84 | spacing: padding:0 var(--space-md) 80px | Use semantic tokens/shared states; preserve measured geometry |
| U291 | Medium | components/notes/capture.css:85 | spacing: gap:3px | Use semantic tokens/shared states; preserve measured geometry |
| U292 | Medium | components/notes/capture.css:85 | spacing: padding:0 var(--space-3) 80px | Use semantic tokens/shared states; preserve measured geometry |
| U293 | Medium | components/notes/capture.css:85 | spacing: gap:3px | Use semantic tokens/shared states; preserve measured geometry |
| U294 | Medium | components/notes/capture.css:25 | radius: border-radius:50 | Use semantic tokens/shared states; preserve measured geometry |
| U295 | Medium | components/notes/capture.css:28 | radius: border-radius:25 | Use semantic tokens/shared states; preserve measured geometry |
| U296 | Medium | components/notes/capture.css:37 | radius: border-radius:13 | Use semantic tokens/shared states; preserve measured geometry |
| U297 | Medium | components/notes/capture.css:44 | radius: border-radius:9 | Use semantic tokens/shared states; preserve measured geometry |
| U298 | Medium | components/notes/capture.css:47 | radius: border-radius:13 | Use semantic tokens/shared states; preserve measured geometry |
| U299 | Medium | components/notes/capture.css:53 | radius: border-radius:4 | Use semantic tokens/shared states; preserve measured geometry |
| U300 | Medium | components/notes/capture.css:57 | radius: border-radius:50 | Use semantic tokens/shared states; preserve measured geometry |
| U301 | Medium | components/notes/capture.css:58 | radius: border-radius:13 | Use semantic tokens/shared states; preserve measured geometry |
| U302 | Medium | components/notes/capture.css:62 | radius: border-radius:9 | Use semantic tokens/shared states; preserve measured geometry |
| U303 | Medium | components/notes/capture.css:34 | layer: z-index:12 | Use semantic tokens/shared states; preserve measured geometry |
| U304 | Medium | components/notes/capture.css:57 | layer: z-index:9 | Use semantic tokens/shared states; preserve measured geometry |
| U305 | Medium | components/mood/style.css:1 | type: font-size:30px | Use semantic tokens/shared states; preserve measured geometry |
| U306 | Medium | components/links/style.css:1 | type: font-size:9px | Use semantic tokens/shared states; preserve measured geometry |
| U307 | Medium | components/layout/style.css:1 | spacing: padding:3px | Use semantic tokens/shared states; preserve measured geometry |
| U308 | Medium | components/layout/style.css:1 | spacing: padding:2px | Use semantic tokens/shared states; preserve measured geometry |
| U309 | Medium | components/journal/style.css:38 | spacing: padding:112px | Use semantic tokens/shared states; preserve measured geometry |
| U310 | Medium | components/journal/style.css:62 | spacing: padding-top:80px | Use semantic tokens/shared states; preserve measured geometry |
| U311 | Medium | components/journal/style.css:64 | spacing: padding:96px | Use semantic tokens/shared states; preserve measured geometry |
| U312 | Medium | components/journal/style.css:33 | radius: border-radius:50 | Use semantic tokens/shared states; preserve measured geometry |
| U313 | Medium | components/journal/style.css:40 | radius: border-radius:0 | Use semantic tokens/shared states; preserve measured geometry |
| U314 | Medium | components/journal/style.css:40 | type: font-size:var(--journal-size,18px | Use semantic tokens/shared states; preserve measured geometry |
| U315 | Medium | components/journal/style.css:37 | layer: z-index:4 | Use semantic tokens/shared states; preserve measured geometry |
| U316 | Medium | components/journal/style.css:62 | layer: z-index:3 | Use semantic tokens/shared states; preserve measured geometry |
| U317 | Medium | components/habits/style.css:1 | type: font-size:17px | Use semantic tokens/shared states; preserve measured geometry |
| U318 | High | components/garden/index.js:11 | color: #555 | Use semantic tokens/shared states; preserve measured geometry |
| U319 | Medium | components/focus/style.css:4 | type: font-size: 19px | Use semantic tokens/shared states; preserve measured geometry |
| U320 | Medium | components/focus/style.css:6 | type: font-size: 19px | Use semantic tokens/shared states; preserve measured geometry |
| U321 | Medium | components/focus/style.css:10 | type: font-size: 17px | Use semantic tokens/shared states; preserve measured geometry |
| U322 | Medium | components/focus/style.css:12 | type: font-size:clamp(48px | Use semantic tokens/shared states; preserve measured geometry |
| U323 | Medium | components/focus/style.css:23 | type: font-size:clamp(64px | Use semantic tokens/shared states; preserve measured geometry |
| U324 | Medium | components/focus/style.css:41 | type: font-size:clamp(48px | Use semantic tokens/shared states; preserve measured geometry |
| U325 | Medium | components/focus/style.css:42 | type: font-size:clamp(60px | Use semantic tokens/shared states; preserve measured geometry |
| U326 | Medium | components/flow/style.css:1 | radius: border-radius:0 | Use semantic tokens/shared states; preserve measured geometry |
| U327 | Medium | components/flow/style.css:3 | type: font-size:clamp(24px | Use semantic tokens/shared states; preserve measured geometry |
| U328 | Medium | components/flow/style.css:3 | type: font-size:clamp(70px | Use semantic tokens/shared states; preserve measured geometry |
| U329 | Medium | components/dictionary/style.css:3 | type: font-size:clamp(24px | Use semantic tokens/shared states; preserve measured geometry |
| U330 | High | components/customizer/index.js:58 | color: #267b66 | Use semantic tokens/shared states; preserve measured geometry |
| U331 | High | components/customizer/index.js:58 | color: #b06b43 | Use semantic tokens/shared states; preserve measured geometry |
| U332 | High | components/customizer/index.js:58 | color: #875ee8 | Use semantic tokens/shared states; preserve measured geometry |
| U333 | High | components/customizer/index.js:58 | color: #b34f80 | Use semantic tokens/shared states; preserve measured geometry |
| U334 | High | components/customizer/index.js:58 | color: #293c36 | Use semantic tokens/shared states; preserve measured geometry |
| U335 | Medium | components/clock/style.css:1 | spacing: margin:0 0 2px | Use semantic tokens/shared states; preserve measured geometry |
| U336 | Medium | components/clock/style.css:1 | type: font-size:clamp(82px | Use semantic tokens/shared states; preserve measured geometry |
| U337 | Medium | components/clock/style.css:1 | type: font-size:clamp(24px | Use semantic tokens/shared states; preserve measured geometry |
| U338 | Medium | components/clock/style.css:1 | type: font-size:90px | Use semantic tokens/shared states; preserve measured geometry |
| U339 | Medium | components/break/style.css:1 | radius: border-radius:50 | Use semantic tokens/shared states; preserve measured geometry |
| U340 | Medium | components/ambient-clock/index.js:65 | inline: .style.transform = | Use semantic tokens/shared states; preserve measured geometry |
| U341 | Medium | components/ambient-clock/index.js:66 | inline: .style.transform = | Use semantic tokens/shared states; preserve measured geometry |
| U342 | Medium | components/ambient-clock/style.css:4 | radius: border-radius:50 | Use semantic tokens/shared states; preserve measured geometry |
| U343 | Medium | components/ambient-clock/style.css:5 | radius: border-radius:50 | Use semantic tokens/shared states; preserve measured geometry |
| U344 | Medium | components/ambient-clock/style.css:9 | radius: border-radius:50 | Use semantic tokens/shared states; preserve measured geometry |
| U345 | Medium | components/ambient-clock/style.css:1 | layer: z-index:3 | Use semantic tokens/shared states; preserve measured geometry |
| U346 | Medium | components/ambient/style.css:2 | layer: z-index:4 | Use semantic tokens/shared states; preserve measured geometry |
| U347 | Medium | components/ambient/style.css:26 | layer: z-index:5 | Use semantic tokens/shared states; preserve measured geometry |
| U348 | Medium | background/notes-service.js:23 | layer: z-index:2147483647 | Use semantic tokens/shared states; preserve measured geometry |
| U349 | Medium | background/notes-service.js:23 | inline: .style.cssText = | Use semantic tokens/shared states; preserve measured geometry |
| U350 | Medium | background/notes-service.js:29 | inline: .style.cssText = | Use semantic tokens/shared states; preserve measured geometry |
| U351 | High | background/service-worker.js:38 | color: #385b48 | Use semantic tokens/shared states; preserve measured geometry |
| U352 | High | blocked/style.css:1 | color: #172b22 | Use semantic tokens/shared states; preserve measured geometry |
| U353 | High | blocked/style.css:1 | color: #f6f1e7 | Use semantic tokens/shared states; preserve measured geometry |
| U354 | High | blocked/style.css:1 | color: #cad8c7 | Use semantic tokens/shared states; preserve measured geometry |
| U355 | High | blocked/style.css:1 | color: #c9d9b5 | Use semantic tokens/shared states; preserve measured geometry |
| U356 | High | blocked/style.css:1 | color: #142118 | Use semantic tokens/shared states; preserve measured geometry |
| U357 | High | blocked/style.css:1 | color: #ffe68c | Use semantic tokens/shared states; preserve measured geometry |
| U358 | High | blocked/style.css:1 | color: #ffb5ac | Use semantic tokens/shared states; preserve measured geometry |
| U359 | Medium | blocked/style.css:1 | spacing: padding:14px 20px | Use semantic tokens/shared states; preserve measured geometry |
| U360 | Medium | blocked/style.css:1 | spacing: margin:8px | Use semantic tokens/shared states; preserve measured geometry |
| U361 | Medium | blocked/style.css:1 | radius: border-radius:12 | Use semantic tokens/shared states; preserve measured geometry |
| U362 | Medium | blocked/style.css:1 | type: font:18px | Use semantic tokens/shared states; preserve measured geometry |
| U363 | Medium | blocked/style.css:1 | type: font-size:clamp(30px | Use semantic tokens/shared states; preserve measured geometry |
| U364 | Medium | blocked/style.css:1 | type: font-size:12px | Use semantic tokens/shared states; preserve measured geometry |
| U365 | High | scripts/assets.js:21 | color: #ffdea1 | Tooling/fixture; outside runtime style gate |
| U366 | High | scripts/assets.js:21 | color: #dce8ee | Tooling/fixture; outside runtime style gate |
| U367 | High | scripts/assets.js:22 | color: #dce1d7 | Tooling/fixture; outside runtime style gate |
| U368 | High | scripts/assets.js:22 | color: #cfdfd6 | Tooling/fixture; outside runtime style gate |
| U369 | High | scripts/assets.js:22 | color: #cfdfd6 | Tooling/fixture; outside runtime style gate |
| U370 | High | scripts/assets.js:22 | color: #cfdfd6 | Tooling/fixture; outside runtime style gate |
| U371 | High | scripts/assets.js:22 | color: #e8ece4 | Tooling/fixture; outside runtime style gate |
| U372 | High | scripts/assets.js:30 | color: #203c33 | Tooling/fixture; outside runtime style gate |
| U373 | High | scripts/assets.js:30 | color: #d6e9ba | Tooling/fixture; outside runtime style gate |
| U374 | High | scripts/launch-demo.js:45 | color: #122922 | Tooling/fixture; outside runtime style gate |
| U375 | High | scripts/launch-demo.js:45 | color: #f7f5e9 | Tooling/fixture; outside runtime style gate |
| U376 | High | scripts/launch-demo.js:45 | color: #fff | Tooling/fixture; outside runtime style gate |
| U377 | High | scripts/launch-demo.js:45 | color: #f7f5e9 | Tooling/fixture; outside runtime style gate |
| U378 | High | scripts/launch-demo.js:45 | color: #214336 | Tooling/fixture; outside runtime style gate |
| U379 | High | scripts/launch-pages.js:23 | color: #f7f6f1 | Tooling/fixture; outside runtime style gate |
| U380 | High | scripts/launch-pages.js:23 | color: #242824 | Tooling/fixture; outside runtime style gate |
| U381 | High | scripts/launch-pages.js:23 | color: #275943 | Tooling/fixture; outside runtime style gate |
| U382 | High | scripts/launch-pages.js:23 | color: #275943 | Tooling/fixture; outside runtime style gate |
| U383 | High | scripts/launch-pages.js:23 | color: #c4c8c1 | Tooling/fixture; outside runtime style gate |
| U384 | High | scripts/launch-pages.js:23 | color: #c4c8c1 | Tooling/fixture; outside runtime style gate |
| U385 | Medium | scripts/launch-pages.js:23 | spacing: padding:32px 24px | Tooling/fixture; outside runtime style gate |
| U386 | Medium | scripts/launch-pages.js:23 | spacing: gap:24px | Tooling/fixture; outside runtime style gate |
| U387 | Medium | scripts/launch-pages.js:23 | spacing: margin-top:36px | Tooling/fixture; outside runtime style gate |
| U388 | Medium | scripts/launch-pages.js:23 | spacing: padding:12px | Tooling/fixture; outside runtime style gate |
| U389 | Medium | scripts/launch-pages.js:23 | spacing: margin-top:40px | Tooling/fixture; outside runtime style gate |
| U390 | Medium | scripts/launch-pages.js:23 | spacing: padding-top:20px | Tooling/fixture; outside runtime style gate |
| U391 | Medium | scripts/launch-pages.js:23 | type: font:17px | Tooling/fixture; outside runtime style gate |
| U392 | Medium | scripts/launch-pages.js:23 | type: font-size:clamp(30px | Tooling/fixture; outside runtime style gate |
| U393 | Medium | scripts/launch-pages.js:23 | type: font-size:15px | Tooling/fixture; outside runtime style gate |
| U394 | Medium | scripts/launch-pages.js:23 | type: font-size:14px | Tooling/fixture; outside runtime style gate |
| U395 | High | scripts/refresh-wallpapers.js:9 | color: #8b9d98 | Tooling/fixture; outside runtime style gate |
| U396 | High | scripts/refresh-wallpapers.js:9 | color: #c7c6b6 | Tooling/fixture; outside runtime style gate |
| U397 | High | scripts/refresh-wallpapers.js:9 | color: #415f59 | Tooling/fixture; outside runtime style gate |
| U398 | High | scripts/refresh-wallpapers.js:9 | color: #1f3934 | Tooling/fixture; outside runtime style gate |
| U399 | High | scripts/refresh-wallpapers.js:12 | color: #a7aaa0 | Tooling/fixture; outside runtime style gate |
| U400 | High | scripts/refresh-wallpapers.js:12 | color: #d2c5ad | Tooling/fixture; outside runtime style gate |
| U401 | High | scripts/refresh-wallpapers.js:12 | color: #758e83 | Tooling/fixture; outside runtime style gate |
| U402 | High | scripts/refresh-wallpapers.js:12 | color: #344e48 | Tooling/fixture; outside runtime style gate |
| U403 | High | scripts/refresh-wallpapers.js:15 | color: #8e939e | Tooling/fixture; outside runtime style gate |
| U404 | High | scripts/refresh-wallpapers.js:15 | color: #c8bdb9 | Tooling/fixture; outside runtime style gate |
| U405 | High | scripts/refresh-wallpapers.js:15 | color: #747d87 | Tooling/fixture; outside runtime style gate |
| U406 | High | scripts/refresh-wallpapers.js:15 | color: #343f4b | Tooling/fixture; outside runtime style gate |
| U407 | High | scripts/refresh-wallpapers.js:18 | color: #9ba89b | Tooling/fixture; outside runtime style gate |
| U408 | High | scripts/refresh-wallpapers.js:18 | color: #ceceba | Tooling/fixture; outside runtime style gate |
| U409 | High | scripts/refresh-wallpapers.js:18 | color: #788c70 | Tooling/fixture; outside runtime style gate |
| U410 | High | scripts/refresh-wallpapers.js:18 | color: #3c5544 | Tooling/fixture; outside runtime style gate |
| U411 | High | scripts/refresh-wallpapers.js:21 | color: #34474e | Tooling/fixture; outside runtime style gate |
| U412 | High | scripts/refresh-wallpapers.js:21 | color: #84918f | Tooling/fixture; outside runtime style gate |
| U413 | High | scripts/refresh-wallpapers.js:21 | color: #465e64 | Tooling/fixture; outside runtime style gate |
| U414 | High | scripts/refresh-wallpapers.js:21 | color: #1b3038 | Tooling/fixture; outside runtime style gate |
| U415 | High | scripts/refresh-wallpapers.js:24 | color: #aa9c94 | Tooling/fixture; outside runtime style gate |
| U416 | High | scripts/refresh-wallpapers.js:24 | color: #d0baa3 | Tooling/fixture; outside runtime style gate |
| U417 | High | scripts/refresh-wallpapers.js:24 | color: #a5917e | Tooling/fixture; outside runtime style gate |
| U418 | High | scripts/refresh-wallpapers.js:24 | color: #695b50 | Tooling/fixture; outside runtime style gate |
| U419 | High | scripts/refresh-wallpapers.js:32 | color: #d9ddd0 | Tooling/fixture; outside runtime style gate |
| U420 | High | tests/browser.js:106 | color: #293c36 | Tooling/fixture; outside runtime style gate |
| U421 | High | tests/calm-home-browser.js:120 | color: #ffffff | Tooling/fixture; outside runtime style gate |
| U422 | High | tests/calm-home-browser.js:129 | color: #ffffff | Tooling/fixture; outside runtime style gate |
| U423 | Medium | tests/calm-home-browser.js:140 | inline: .style.visibility= | Tooling/fixture; outside runtime style gate |
| U424 | High | tests/calm-migration.test.js:7 | color: #7845df | Tooling/fixture; outside runtime style gate |
| U425 | High | tests/calm-migration.test.js:16 | color: #c9d9b5 | Tooling/fixture; outside runtime style gate |
| U426 | High | tests/calm-migration.test.js:21 | color: #7845df | Tooling/fixture; outside runtime style gate |
| U427 | High | tests/calm-migration.test.js:24 | color: #ffccaa | Tooling/fixture; outside runtime style gate |
| U428 | High | tests/dashboard-browser.js:38 | color: rgba(0 | Tooling/fixture; outside runtime style gate |
| U429 | High | tests/dashboard-browser.js:129 | color: #ffffff | Tooling/fixture; outside runtime style gate |
| U430 | High | tests/dashboard-browser.js:132 | color: rgb(2 | Tooling/fixture; outside runtime style gate |
| U431 | High | tests/design-foundation-browser.js:77 | color: rgba(0 | Tooling/fixture; outside runtime style gate |
| U432 | High | tests/design-foundation-browser.js:126 | color: #785bb3 | Tooling/fixture; outside runtime style gate |
| U433 | High | tests/design-foundation-browser.js:134 | color: #785bb3 | Tooling/fixture; outside runtime style gate |
| U434 | High | tests/design-stage-9-browser.js:39 | color: #ffffff | Tooling/fixture; outside runtime style gate |
| U435 | High | tests/design-stage-9-browser.js:42 | color: #ffffff | Tooling/fixture; outside runtime style gate |
| U436 | High | tests/design-stage-9-browser.js:42 | color: #000000 | Tooling/fixture; outside runtime style gate |
| U437 | High | tests/design-stage-9-browser.js:42 | color: #ffffff | Tooling/fixture; outside runtime style gate |
| U438 | Medium | tests/design-stage-9-browser.js:29 | inline: .style.visibility= | Tooling/fixture; outside runtime style gate |
| U439 | Medium | tests/design-stage-9-browser.js:30 | inline: .style.cssText= | Tooling/fixture; outside runtime style gate |
| U440 | Medium | tests/design-stage-9-browser.js:47 | inline: .style.color= | Tooling/fixture; outside runtime style gate |
| U441 | High | tests/home-foundation-browser.js:16 | color: rgb(2 | Tooling/fixture; outside runtime style gate |
| U442 | High | tests/notes-overlay-browser.js:31 | color: rgb(2 | Tooling/fixture; outside runtime style gate |
| U443 | Medium | tests/notes-overlay-browser.js:19 | type: font:40px | Tooling/fixture; outside runtime style gate |
| U444 | High | tests/resilience.js:18 | color: #123456 | Tooling/fixture; outside runtime style gate |
| U445 | High | tests/stage7-browser.js:105 | color: #ffffff | Tooling/fixture; outside runtime style gate |
| U446 | High | tests/stage7-browser.js:105 | color: #000000 | Tooling/fixture; outside runtime style gate |
| U447 | Medium | tests/stage7-browser.js:30 | inline: .style.opacity= | Tooling/fixture; outside runtime style gate |
| U448 | High | tests/studio-browser.js:47 | color: #293c36 | Tooling/fixture; outside runtime style gate |
| U449 | High | tests/studio-browser.js:60 | color: #123456 | Tooling/fixture; outside runtime style gate |
| U450 | High | tests/studio-browser.js:66 | color: #123456 | Tooling/fixture; outside runtime style gate |
| U451 | High | docs/launch/launch.css:1 | color: #f7f6f1 | Tooling/fixture; outside runtime style gate |
| U452 | High | docs/launch/launch.css:1 | color: #242824 | Tooling/fixture; outside runtime style gate |
| U453 | High | docs/launch/launch.css:1 | color: #275943 | Tooling/fixture; outside runtime style gate |
| U454 | High | docs/launch/launch.css:1 | color: #275943 | Tooling/fixture; outside runtime style gate |
| U455 | High | docs/launch/launch.css:1 | color: #c4c8c1 | Tooling/fixture; outside runtime style gate |
| U456 | High | docs/launch/launch.css:1 | color: #c4c8c1 | Tooling/fixture; outside runtime style gate |
| U457 | Medium | docs/launch/launch.css:1 | spacing: padding:32px 24px | Tooling/fixture; outside runtime style gate |
| U458 | Medium | docs/launch/launch.css:1 | spacing: gap:24px | Tooling/fixture; outside runtime style gate |
| U459 | Medium | docs/launch/launch.css:1 | spacing: margin-top:36px | Tooling/fixture; outside runtime style gate |
| U460 | Medium | docs/launch/launch.css:1 | spacing: padding:12px | Tooling/fixture; outside runtime style gate |
| U461 | Medium | docs/launch/launch.css:1 | spacing: margin-top:40px | Tooling/fixture; outside runtime style gate |
| U462 | Medium | docs/launch/launch.css:1 | spacing: padding-top:20px | Tooling/fixture; outside runtime style gate |
| U463 | Medium | docs/launch/launch.css:1 | type: font:17px | Tooling/fixture; outside runtime style gate |
| U464 | Medium | docs/launch/launch.css:1 | type: font-size:clamp(30px | Tooling/fixture; outside runtime style gate |
| U465 | Medium | docs/launch/launch.css:1 | type: font-size:15px | Tooling/fixture; outside runtime style gate |
| U466 | Medium | docs/launch/launch.css:1 | type: font-size:14px | Tooling/fixture; outside runtime style gate |

## Cross-component findings

| ID | Severity | Location | Issue | Fix |
|---|---|---|---|---|
| C1 | High | blocked/style.css:1 | Block page has an independent palette, typography and button recipe. | Load the shared tokens and controls. |
| C2 | High | components/notes/capture.css:1; newtab/system.css:100 | Notes and Settings have separate control recipes and colors. | Map aliases to the unified palette; share control states. |
| C3 | Medium | newtab/newtab.css:9; newtab/foundation.css:5 | Cascading pressed/hover rules conflict; disabled and busy states differ. | One final component state contract. |
| C4 | Medium | newtab/system.css:150; components/notes/capture.css:14 | Off-scale spacing and 17/19px icons survive earlier overrides. | Normalize spacing, typography and icon geometry. |
| C5 | Medium | newtab/tokens.css:253; core/studio-runtime.js:5 | Four saved font choices plus three base stacks exceed the new two-family rule. | Retain stored IDs and resolve to two approved families. |
| C6 | Medium | newtab/tokens.css:254 | One motion duration, no named layer or elevation scale. | Add semantic levels and reduced-motion scaling. |
| C7 | High | newtab/tokens.css:161; core/theme.js:53 | Light workspace muted text and custom accent ink need measured contrast; existing contrast evidence covers Home only. | Measure semantic pairs and all panel samples, fix failures. |
| C8 | Medium | scripts/check.js:1 | No comprehensive spacing, color or inline-style guard. | Add a runtime source lint gate and negative fixtures. |
| C9 | Medium | components/notes/capture.html:1 | Standalone notes document omits shared interaction states. | Include the shared component stylesheet. |
| C10 | Medium | newtab/index.html:1 | No developer component gallery or state matrix. | Add dev-only QA page, excluded by package allowlist. |

## Decision

On 13 October 2026 the user chose the stricter Stage 5 rules over the Constitution exceptions: unified palette and control recipe, two font families, normalized typography/spacing/radii. Preserve records, storage schemas and full-screen workspace navigation. Runtime geometry, user-selected media/colors and drawing data must remain data-driven; these are audited explicitly rather than confused with decorative literals. Contrast, zoom, empty/error and keyboard findings require the browser pass.
