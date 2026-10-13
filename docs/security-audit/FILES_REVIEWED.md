# Security audit file inventory

Every listed regular file was read in full for hashing. Text files received automated security-pattern and credential scans. Binary assets were not visually/aurally reviewed; reading their bytes is not a semantic review. The main report lists manually traced source areas. Browser profiles, Git internals, node_modules and this output directory were excluded; reachable Git text blobs were scanned separately.

| File | Review coverage | Bytes |
|---|---|---:|
| .gitignore | Text scanned | 58 |
| AGENTS.md | Text scanned | 5745 |
| assets/backgrounds/alpine-thumb.webp | Binary hashed only | 1430 |
| assets/backgrounds/alpine.svg | Text scanned | 6919 |
| assets/backgrounds/alpine.webp | Binary hashed only | 17208 |
| assets/backgrounds/cozy-thumb.webp | Binary hashed only | 914 |
| assets/backgrounds/cozy.svg | Text scanned | 1664 |
| assets/backgrounds/cozy.webp | Binary hashed only | 12298 |
| assets/backgrounds/dark-thumb.webp | Binary hashed only | 1086 |
| assets/backgrounds/dark.svg | Text scanned | 6931 |
| assets/backgrounds/dark.webp | Binary hashed only | 14360 |
| assets/backgrounds/LICENSES.md | Text scanned | 722 |
| assets/backgrounds/lofi-thumb.webp | Binary hashed only | 1114 |
| assets/backgrounds/lofi.svg | Text scanned | 1416 |
| assets/backgrounds/lofi.webp | Binary hashed only | 12850 |
| assets/backgrounds/minimal-thumb.webp | Binary hashed only | 996 |
| assets/backgrounds/minimal.svg | Text scanned | 1410 |
| assets/backgrounds/minimal.webp | Binary hashed only | 12372 |
| assets/backgrounds/summit-thumb.webp | Binary hashed only | 926 |
| assets/backgrounds/summit.svg | Text scanned | 1465 |
| assets/backgrounds/summit.webp | Binary hashed only | 11644 |
| assets/icons/icon-128.png | Binary hashed only | 3392 |
| assets/icons/icon-16.png | Binary hashed only | 505 |
| assets/icons/icon-32.png | Binary hashed only | 1093 |
| assets/icons/icon-48.png | Binary hashed only | 1693 |
| assets/icons/lucide.svg | Text scanned | 15658 |
| assets/sounds/brown.wav | Binary hashed only | 384044 |
| assets/sounds/cafe.wav | Binary hashed only | 384044 |
| assets/sounds/fireplace.wav | Binary hashed only | 384044 |
| assets/sounds/forest.wav | Binary hashed only | 384044 |
| assets/sounds/LICENSES.md | Text scanned | 1179 |
| assets/sounds/ocean.wav | Binary hashed only | 384044 |
| assets/sounds/rain.wav | Binary hashed only | 384044 |
| assets/sounds/white.wav | Binary hashed only | 384044 |
| background/audio/audio.js | Text scanned | 718 |
| background/audio/index.html | Text scanned | 167 |
| background/focus-service.js | Text scanned | 7149 |
| background/notes-service.js | Text scanned | 8642 |
| background/pexels.js | Text scanned | 1845 |
| background/service-worker.js | Text scanned | 8751 |
| background/studio.js | Text scanned | 2277 |
| blocked/index.html | Text scanned | 718 |
| blocked/index.js | Text scanned | 1455 |
| blocked/style.css | Text scanned | 783 |
| components/afterglow/index.js | Text scanned | 4364 |
| components/ambient/index.js | Text scanned | 8094 |
| components/ambient/style.css | Text scanned | 5550 |
| components/ambient-clock/index.js | Text scanned | 3244 |
| components/ambient-clock/style.css | Text scanned | 2592 |
| components/blocker/index.js | Text scanned | 3531 |
| components/break/index.js | Text scanned | 871 |
| components/break/style.css | Text scanned | 463 |
| components/capsules/index.js | Text scanned | 8055 |
| components/career/index.js | Text scanned | 58 |
| components/career/view.js | Text scanned | 4735 |
| components/clock/index.js | Text scanned | 1562 |
| components/clock/style.css | Text scanned | 847 |
| components/commands/index.js | Text scanned | 3425 |
| components/compiler/index.js | Text scanned | 5005 |
| components/countdowns/index.js | Text scanned | 3555 |
| components/countdowns/style.css | Text scanned | 197 |
| components/customizer/index.js | Text scanned | 26882 |
| components/dictionary/api.js | Text scanned | 2554 |
| components/dictionary/index.js | Text scanned | 4703 |
| components/dictionary/style.css | Text scanned | 601 |
| components/dna/index.js | Text scanned | 3306 |
| components/energy/index.js | Text scanned | 7011 |
| components/energyweather/index.js | Text scanned | 4988 |
| components/firststep/index.js | Text scanned | 3296 |
| components/flow/index.js | Text scanned | 6468 |
| components/flow/style.css | Text scanned | 860 |
| components/focus/index.js | Text scanned | 1975 |
| components/focus/style.css | Text scanned | 4085 |
| components/garden/index.js | Text scanned | 5638 |
| components/habits/index.js | Text scanned | 146 |
| components/habits/style.css | Text scanned | 335 |
| components/journal/index.js | Text scanned | 63 |
| components/journal/settings.js | Text scanned | 1858 |
| components/journal/style.css | Text scanned | 7711 |
| components/journal/workspace.js | Text scanned | 9398 |
| components/journeys/shared.js | Text scanned | 2143 |
| components/journeys/style.css | Text scanned | 852 |
| components/layout/index.js | Text scanned | 285 |
| components/layout/style.css | Text scanned | 1219 |
| components/links/index.js | Text scanned | 2849 |
| components/links/style.css | Text scanned | 952 |
| components/mood/index.js | Text scanned | 1521 |
| components/mood/style.css | Text scanned | 336 |
| components/music/index.js | Text scanned | 12231 |
| components/music/style.css | Text scanned | 684 |
| components/music/youtube-player.js | Text scanned | 2310 |
| components/music/youtube-search.js | Text scanned | 1622 |
| components/notes/capture.css | Text scanned | 20679 |
| components/notes/capture.html | Text scanned | 505 |
| components/notes/capture.js | Text scanned | 32896 |
| components/notes/checklist.js | Text scanned | 559 |
| components/notes/index.js | Text scanned | 1860 |
| components/notes/planner.js | Text scanned | 13147 |
| components/notes/style.css | Text scanned | 484 |
| components/notifications/index.js | Text scanned | 3997 |
| components/notifications/style.css | Text scanned | 1721 |
| components/onboarding/index.js | Text scanned | 53 |
| components/onboarding/style.css | Text scanned | 1692 |
| components/onboarding/wizard.js | Text scanned | 5115 |
| components/panel-design/index.js | Text scanned | 4164 |
| components/panel-design/style.css | Text scanned | 5108 |
| components/pexels/index.js | Text scanned | 8323 |
| components/proof/index.js | Text scanned | 6145 |
| components/queue/index.js | Text scanned | 3934 |
| components/quietweb/index.js | Text scanned | 4473 |
| components/quotes/index.js | Text scanned | 2327 |
| components/quotes/style.css | Text scanned | 830 |
| components/recall/index.js | Text scanned | 60 |
| components/recall/review.js | Text scanned | 5046 |
| components/recovery/index.js | Text scanned | 3163 |
| components/reflection/index.js | Text scanned | 2548 |
| components/rituals/index.js | Text scanned | 6442 |
| components/scenes/index.js | Text scanned | 7117 |
| components/search/index.js | Text scanned | 892 |
| components/search/style.css | Text scanned | 623 |
| components/session-enhancements/index.js | Text scanned | 3957 |
| components/session-view/index.js | Text scanned | 10341 |
| components/settings/customization.js | Text scanned | 7186 |
| components/settings/data-tools.js | Text scanned | 4499 |
| components/settings/index.js | Text scanned | 18491 |
| components/settings/style.css | Text scanned | 1474 |
| components/skills/index.js | Text scanned | 4689 |
| components/sounds/index.js | Text scanned | 6856 |
| components/sounds/style.css | Text scanned | 736 |
| components/stats/index.js | Text scanned | 10907 |
| components/stats/style.css | Text scanned | 2971 |
| components/suggestions/index.js | Text scanned | 975 |
| components/support/index.js | Text scanned | 4221 |
| components/tasks/index.js | Text scanned | 146 |
| components/tasks/style.css | Text scanned | 1424 |
| components/timer/index.js | Text scanned | 1287 |
| components/timer/preferences.js | Text scanned | 3109 |
| components/timer/style.css | Text scanned | 1901 |
| components/tools/index.js | Text scanned | 2818 |
| components/unsplash/index.js | Text scanned | 5204 |
| components/unsplash/style.css | Text scanned | 715 |
| components/weather/index.js | Text scanned | 6306 |
| components/weather/style.css | Text scanned | 391 |
| components/websearch/index.js | Text scanned | 1181 |
| components/workbench/shared.js | Text scanned | 1237 |
| components/workbench/style.css | Text scanned | 1383 |
| components/workspace/index.js | Text scanned | 1956 |
| core/audio-engine.js | Text scanned | 3257 |
| core/background-presentation.js | Text scanned | 3553 |
| core/backup.js | Text scanned | 8764 |
| core/blocker-logic.js | Text scanned | 1730 |
| core/config.js | Text scanned | 116 |
| core/crypto-backup.js | Text scanned | 2328 |
| core/dashboard-view.js | Text scanned | 3172 |
| core/db.js | Text scanned | 3080 |
| core/design-system.js | Text scanned | 3185 |
| core/diagnostics.js | Text scanned | 1559 |
| core/drafts.js | Text scanned | 1038 |
| core/events.js | Text scanned | 604 |
| core/features.js | Text scanned | 1599 |
| core/home-menu.js | Text scanned | 1375 |
| core/i18n.js | Text scanned | 34205 |
| core/image-preview.js | Text scanned | 731 |
| core/journal.js | Text scanned | 970 |
| core/journeys-logic.js | Text scanned | 5422 |
| core/journeys-schema.js | Text scanned | 4999 |
| core/journeys.js | Text scanned | 2986 |
| core/layout.js | Text scanned | 965 |
| core/lazy-widgets.js | Text scanned | 2470 |
| core/live-wallpaper.js | Text scanned | 2251 |
| core/notes-schema.js | Text scanned | 1924 |
| core/notes.js | Text scanned | 4650 |
| core/notifications.js | Text scanned | 1710 |
| core/panel-navigation.js | Text scanned | 1963 |
| core/pexels-credit.js | Text scanned | 690 |
| core/publisher.js | Text scanned | 453 |
| core/refinement-schema.js | Text scanned | 1635 |
| core/scenes.js | Text scanned | 2946 |
| core/schema.js | Text scanned | 8452 |
| core/search.js | Text scanned | 697 |
| core/stage2-schema.js | Text scanned | 4307 |
| core/stage3-schema.js | Text scanned | 5728 |
| core/state.js | Text scanned | 354 |
| core/stats-logic.js | Text scanned | 2094 |
| core/storage.js | Text scanned | 5924 |
| core/studio-logic.js | Text scanned | 2432 |
| core/studio-presets.js | Text scanned | 4602 |
| core/studio-runtime.js | Text scanned | 8368 |
| core/studio-schema.js | Text scanned | 6114 |
| core/suggestions.js | Text scanned | 746 |
| core/theme.js | Text scanned | 9527 |
| core/timer-client.js | Text scanned | 1149 |
| core/timer-engine.js | Text scanned | 2064 |
| core/timer-logic.js | Text scanned | 5876 |
| core/toaster.js | Text scanned | 2535 |
| core/tool-catalog.js | Text scanned | 4538 |
| core/tool-preferences.js | Text scanned | 836 |
| core/ui.js | Text scanned | 9464 |
| core/utils.js | Text scanned | 2025 |
| core/work-context.js | Text scanned | 13074 |
| core/work-logic.js | Text scanned | 5741 |
| core/work-monitor.js | Text scanned | 1327 |
| core/work-schema.js | Text scanned | 5297 |
| data/backgrounds.json | Text scanned | 8413 |
| data/livewallpapers.json | Text scanned | 3 |
| data/prompts.json | Text scanned | 6792 |
| data/quotes.json | Text scanned | 83365 |
| data/scenes.json | Text scanned | 6772 |
| docs/AMBIENT_CLOCK_REPORT.md | Text scanned | 2237 |
| docs/AMBIENT_REDESIGN_REPORT.md | Text scanned | 4790 |
| docs/ARCHITECTURE.md | Text scanned | 18161 |
| docs/archive/DESIGN_CONSTITUTION_PRE_V2_2026-10-12.md | Text scanned | 18528 |
| docs/BACKGROUNDS_RELEASE_REPORT.md | Text scanned | 9020 |
| docs/BETA_GUIDE.md | Text scanned | 3563 |
| docs/CALM_HOME_STAGE_1_2_REPORT.md | Text scanned | 5122 |
| docs/CHANGELOG.md | Text scanned | 5437 |
| docs/CLEAR_HOME_NOTES_REPORT.md | Text scanned | 4243 |
| docs/CLEAR_WALLPAPER_REPORT.md | Text scanned | 1676 |
| docs/CUSTOMIZATION_STUDIO_REPORT.md | Text scanned | 8286 |
| docs/DASHBOARD_REPLACEMENT_REPORT.md | Text scanned | 7144 |
| docs/design/panel-redesign-v1/01-focus-and-reentry.png | Binary hashed only | 1847165 |
| docs/design/panel-redesign-v1/02-personal-workspaces.png | Binary hashed only | 1886676 |
| docs/design/panel-redesign-v1/03-reflection-and-atmosphere.png | Binary hashed only | 1795174 |
| docs/design/panel-redesign-v1/04-utilities-and-customization.png | Binary hashed only | 1826117 |
| docs/DESIGN_CONSTITUTION.md | Text scanned | 35069 |
| docs/DESIGN_STAGE_0_REPORT.md | Text scanned | 16696 |
| docs/DESIGN_STAGE_1_2_REPORT.md | Text scanned | 12062 |
| docs/DESIGN_STAGE_3_4_REPORT.md | Text scanned | 10917 |
| docs/DESIGN_STAGE_5_6_REPORT.md | Text scanned | 13731 |
| docs/DESIGN_STAGE_7_8_REPORT.md | Text scanned | 12535 |
| docs/DESIGN_UNIFICATION_AUDIT.md | Text scanned | 74811 |
| docs/FOCUS_PANELS_REPORT.md | Text scanned | 8105 |
| docs/FOCUS_WORK_CONTEXT_PLAN.md | Text scanned | 2675 |
| docs/FOCUS_WORK_CONTEXT_REPORT.md | Text scanned | 9246 |
| docs/HOME_TRANSFORMATION_REPORT.md | Text scanned | 6887 |
| docs/JOURNAL_PAGE_REPORT.md | Text scanned | 3942 |
| docs/launch/chrome-failure.png | Binary hashed only | 183654 |
| docs/launch/chrome-mobile.png | Binary hashed only | 114306 |
| docs/launch/chrome-onboarding.png | Binary hashed only | 214427 |
| docs/launch/chrome-see-progress.png | Binary hashed only | 244836 |
| docs/launch/chrome-start-easily.png | Binary hashed only | 240941 |
| docs/launch/chrome-stay-focused.png | Binary hashed only | 247452 |
| docs/launch/edge-failure.png | Binary hashed only | 331160 |
| docs/launch/edge-mobile.png | Binary hashed only | 125362 |
| docs/launch/edge-onboarding.png | Binary hashed only | 266405 |
| docs/launch/edge-see-progress.png | Binary hashed only | 330482 |
| docs/launch/edge-start-easily.png | Binary hashed only | 328747 |
| docs/launch/edge-stay-focused.png | Binary hashed only | 333050 |
| docs/launch/launch.css | Text scanned | 605 |
| docs/launch/oneflow-demo.webm | Binary hashed only | 889194 |
| docs/launch/privacy.html | Text scanned | 10473 |
| docs/launch/promo-440x280.png | Binary hashed only | 46388 |
| docs/launch/promo.svg | Text scanned | 30723 |
| docs/launch/support.html | Text scanned | 2676 |
| docs/LAUNCH_CHECKLIST.md | Text scanned | 3702 |
| docs/MARKET_RELEASE_REPORT.md | Text scanned | 7844 |
| docs/NOTELY_NOTES_UI_REPORT.md | Text scanned | 2780 |
| docs/NOTES_CAPTURE_REPORT.md | Text scanned | 10060 |
| docs/PANEL_REDESIGN_RECOMMENDATION_STATUS.md | Text scanned | 4639 |
| docs/PANEL_REDESIGN_STAGE_1_PLAN.md | Text scanned | 923 |
| docs/PANEL_REDESIGN_STAGE_1_REPORT.md | Text scanned | 5198 |
| docs/PANEL_REDESIGN_STAGE_2_PLAN.md | Text scanned | 875 |
| docs/PANEL_REDESIGN_STAGE_2_REPORT.md | Text scanned | 4191 |
| docs/PANEL_REDESIGN_STAGE_3_4_PLAN.md | Text scanned | 1388 |
| docs/PANEL_REDESIGN_STAGE_3_4_REPORT.md | Text scanned | 6438 |
| docs/PANEL_REDESIGN_STAGE_5_PLAN.md | Text scanned | 1216 |
| docs/PANEL_REDESIGN_STAGE_5_REPORT.md | Text scanned | 6109 |
| docs/PANEL_REDESIGN_STAGE_6_8_PLAN.md | Text scanned | 1432 |
| docs/PANEL_REDESIGN_STAGE_6_8_REPORT.md | Text scanned | 5851 |
| docs/PERMISSIONS.md | Text scanned | 9295 |
| docs/PEXELS_CONNECTION_REPORT.md | Text scanned | 1979 |
| docs/PEXELS_REPORT.md | Text scanned | 3880 |
| docs/PRIVACY_POLICY.md | Text scanned | 9659 |
| docs/qa-results/ambient-redesign-chrome.json | Text scanned | 605 |
| docs/qa-results/ambient-redesign-edge.json | Text scanned | 542 |
| docs/qa-results/backgrounds-chrome-report.json | Text scanned | 855 |
| docs/qa-results/backgrounds-edge-report.json | Text scanned | 853 |
| docs/qa-results/backgrounds-package-chrome-report.json | Text scanned | 571 |
| docs/qa-results/backgrounds-package-edge-report.json | Text scanned | 569 |
| docs/qa-results/backgrounds-panels-chrome-report.json | Text scanned | 1089 |
| docs/qa-results/backgrounds-panels-edge-report.json | Text scanned | 1087 |
| docs/qa-results/backgrounds-stage2-integrations-chrome-report.json | Text scanned | 504 |
| docs/qa-results/backgrounds-stage2-integrations-edge-report.json | Text scanned | 504 |
| docs/qa-results/backgrounds-stage3-chrome-report.json | Text scanned | 2090 |
| docs/qa-results/backgrounds-stage3-edge-report.json | Text scanned | 2101 |
| docs/qa-results/backgrounds-unified-chrome-report.json | Text scanned | 717 |
| docs/qa-results/backgrounds-unified-edge-report.json | Text scanned | 715 |
| docs/qa-results/chrome-report.json | Text scanned | 1049 |
| docs/qa-results/combined-notes-chrome.json | Text scanned | 383 |
| docs/qa-results/combined-notes-edge.json | Text scanned | 383 |
| docs/qa-results/design-foundation-chrome.json | Text scanned | 827 |
| docs/qa-results/design-foundation-edge.json | Text scanned | 5820 |
| docs/qa-results/design-stage-0-baseline.json | Text scanned | 13453 |
| docs/qa-results/design-stage-1-2-baseline.json | Text scanned | 7522 |
| docs/qa-results/design-stage-3-4-baseline.json | Text scanned | 7546 |
| docs/qa-results/design-stage-3-4-chrome.json | Text scanned | 831 |
| docs/qa-results/design-stage-3-4-edge.json | Text scanned | 6202 |
| docs/qa-results/design-stage-5-6-baseline.json | Text scanned | 7522 |
| docs/qa-results/design-stage-5-6-chrome.json | Text scanned | 525 |
| docs/qa-results/design-stage-7-8-chrome.json | Text scanned | 919 |
| docs/qa-results/design-stage-7-8-edge.json | Text scanned | 6176 |
| docs/qa-results/design-stage-9-ambient-redesign.log | Text scanned | 545 |
| docs/qa-results/design-stage-9-baseline.json | Text scanned | 31699 |
| docs/qa-results/design-stage-9-before-baseline.json | Text scanned | 7533 |
| docs/qa-results/design-stage-9-calm-home.log | Text scanned | 753 |
| docs/qa-results/design-stage-9-chrome.json | Text scanned | 163668 |
| docs/qa-results/design-stage-9-combined-notes.log | Text scanned | 343 |
| docs/qa-results/design-stage-9-contrast-before.json | Text scanned | 130340 |
| docs/qa-results/design-stage-9-design-foundation.log | Text scanned | 766 |
| docs/qa-results/design-stage-9-design-stage-3-4.log | Text scanned | 769 |
| docs/qa-results/design-stage-9-design-stage-5-6.log | Text scanned | 467 |
| docs/qa-results/design-stage-9-design-stage-7-8.log | Text scanned | 857 |
| docs/qa-results/design-stage-9-edge-launch.log | Text scanned | 9151 |
| docs/qa-results/design-stage-9-extra-ambient-clock.log | Text scanned | 425 |
| docs/qa-results/design-stage-9-extra-calm-home.log | Text scanned | 753 |
| docs/qa-results/design-stage-9-extra-design-foundation.log | Text scanned | 766 |
| docs/qa-results/design-stage-9-extra-studio.log | Text scanned | 838 |
| docs/qa-results/design-stage-9-extra-suites.json | Text scanned | 2792 |
| docs/qa-results/design-stage-9-extra-syntax.log | Text scanned | 145 |
| docs/qa-results/design-stage-9-extra-ui-refinement.log | Text scanned | 367 |
| docs/qa-results/design-stage-9-extra-units.log | Text scanned | 8649 |
| docs/qa-results/design-stage-9-followup-ambient-clock.log | Text scanned | 298 |
| docs/qa-results/design-stage-9-followup-journeys-tabs.log | Text scanned | 274 |
| docs/qa-results/design-stage-9-followup-suites.json | Text scanned | 2336 |
| docs/qa-results/design-stage-9-followup-syntax.log | Text scanned | 145 |
| docs/qa-results/design-stage-9-followup-units.log | Text scanned | 8779 |
| docs/qa-results/design-stage-9-followup-work-context.log | Text scanned | 717 |
| docs/qa-results/design-stage-9-journal-fullscreen.log | Text scanned | 305 |
| docs/qa-results/design-stage-9-journeys-tabs.log | Text scanned | 277 |
| docs/qa-results/design-stage-9-music-api.log | Text scanned | 373 |
| docs/qa-results/design-stage-9-notes-capture.log | Text scanned | 696 |
| docs/qa-results/design-stage-9-notes-overlay.log | Text scanned | 563 |
| docs/qa-results/design-stage-9-package-before.json | Text scanned | 317 |
| docs/qa-results/design-stage-9-panel-boundaries.log | Text scanned | 284 |
| docs/qa-results/design-stage-9-panel-entry.log | Text scanned | 490 |
| docs/qa-results/design-stage-9-panel-environment.log | Text scanned | 640 |
| docs/qa-results/design-stage-9-panel-planning.log | Text scanned | 841 |
| docs/qa-results/design-stage-9-panel-redesign.log | Text scanned | 789 |
| docs/qa-results/design-stage-9-panel-remaining.log | Text scanned | 921 |
| docs/qa-results/design-stage-9-preload-baseline.json | Text scanned | 26583 |
| docs/qa-results/design-stage-9-profile-baseline.json | Text scanned | 26163 |
| docs/qa-results/design-stage-9-rectangle-probe.json | Text scanned | 77764 |
| docs/qa-results/design-stage-9-settings-page.log | Text scanned | 279 |
| docs/qa-results/design-stage-9-stats-notifications.log | Text scanned | 523 |
| docs/qa-results/design-stage-9-suites.json | Text scanned | 7516 |
| docs/qa-results/design-stage-9-syntax.log | Text scanned | 145 |
| docs/qa-results/design-stage-9-unified-timer.log | Text scanned | 661 |
| docs/qa-results/design-stage-9-units.log | Text scanned | 8647 |
| docs/qa-results/design-stage-9-work-context.log | Text scanned | 717 |
| docs/qa-results/edge-report.json | Text scanned | 1079 |
| docs/qa-results/home-chrome-report.json | Text scanned | 598 |
| docs/qa-results/home-edge-report.json | Text scanned | 596 |
| docs/qa-results/home-stage3-chrome-report.json | Text scanned | 2114 |
| docs/qa-results/journeys-chrome.json | Text scanned | 1018 |
| docs/qa-results/journeys-edge.json | Text scanned | 1018 |
| docs/qa-results/journeys-media-chrome.json | Text scanned | 151 |
| docs/qa-results/journeys-tabs-chrome.json | Text scanned | 353 |
| docs/qa-results/journeys-tabs-edge.json | Text scanned | 240 |
| docs/qa-results/market-chrome-report.json | Text scanned | 2316 |
| docs/qa-results/market-edge-report.json | Text scanned | 2401 |
| docs/qa-results/market-lookup-chrome-report.json | Text scanned | 370 |
| docs/qa-results/market-package-chrome-report.json | Text scanned | 621 |
| docs/qa-results/market-package-edge-report.json | Text scanned | 619 |
| docs/qa-results/market-panels-chrome-report.json | Text scanned | 1095 |
| docs/qa-results/market-stage3-chrome-report.json | Text scanned | 2111 |
| docs/qa-results/market-stage3-edge-report.json | Text scanned | 2112 |
| docs/qa-results/market-unified-chrome-report.json | Text scanned | 721 |
| docs/qa-results/notes-chrome-report.json | Text scanned | 648 |
| docs/qa-results/notes-edge-report.json | Text scanned | 648 |
| docs/qa-results/notes-overlay-chrome-report.json | Text scanned | 482 |
| docs/qa-results/notes-overlay-edge-report.json | Text scanned | 482 |
| docs/qa-results/package-chrome-report.json | Text scanned | 571 |
| docs/qa-results/package-edge-report.json | Text scanned | 569 |
| docs/qa-results/panel-boundaries-chrome.json | Text scanned | 355 |
| docs/qa-results/panel-boundaries-edge.json | Text scanned | 355 |
| docs/qa-results/panel-entry-chrome.json | Text scanned | 549 |
| docs/qa-results/panel-entry-edge.json | Text scanned | 549 |
| docs/qa-results/panel-environment-chrome.json | Text scanned | 700 |
| docs/qa-results/panel-environment-edge.json | Text scanned | 700 |
| docs/qa-results/panel-planning-chrome.json | Text scanned | 904 |
| docs/qa-results/panel-planning-edge.json | Text scanned | 904 |
| docs/qa-results/panel-redesign-chrome.json | Text scanned | 851 |
| docs/qa-results/panel-redesign-edge.json | Text scanned | 851 |
| docs/qa-results/panel-remaining-chrome.json | Text scanned | 1047 |
| docs/qa-results/panel-remaining-edge.json | Text scanned | 1047 |
| docs/qa-results/panels-chrome-report.json | Text scanned | 1089 |
| docs/qa-results/panels-edge-report.json | Text scanned | 1087 |
| docs/qa-results/panels-package-chrome-report.json | Text scanned | 571 |
| docs/qa-results/panels-package-edge-report.json | Text scanned | 569 |
| docs/qa-results/panels-stage3-chrome-report.json | Text scanned | 2089 |
| docs/qa-results/release-audit-chrome.json | Text scanned | 812 |
| docs/qa-results/release-audit-edge.json | Text scanned | 773 |
| docs/qa-results/release-audited-runtime.json | Text scanned | 82 |
| docs/qa-results/release-final-package.json | Text scanned | 174 |
| docs/qa-results/resilience-report.json | Text scanned | 538 |
| docs/qa-results/settings-page-chrome.json | Text scanned | 319 |
| docs/qa-results/stage2-chrome-report.json | Text scanned | 1466 |
| docs/qa-results/stage2-edge-report.json | Text scanned | 1416 |
| docs/qa-results/stage2-integrations-report.json | Text scanned | 497 |
| docs/qa-results/stage2-regression-chrome-report.json | Text scanned | 1072 |
| docs/qa-results/stage3-chrome-report.json | Text scanned | 2102 |
| docs/qa-results/stage3-edge-report.json | Text scanned | 2102 |
| docs/qa-results/ui-refinement-chrome.json | Text scanned | 425 |
| docs/qa-results/ui-refinement-edge.json | Text scanned | 426 |
| docs/qa-results/unification-after-chrome.json | Text scanned | 69628 |
| docs/qa-results/unification-before-chrome-initial.json | Text scanned | 523 |
| docs/qa-results/unification-before-chrome-supplement.json | Text scanned | 2696 |
| docs/qa-results/unification-before-chrome.json | Text scanned | 523 |
| docs/qa-results/unification-before-inventory.json | Text scanned | 126657 |
| docs/qa-results/unification-style-migration.json | Text scanned | 166564 |
| docs/qa-results/unified-chrome-report.json | Text scanned | 717 |
| docs/qa-results/unified-edge-report.json | Text scanned | 715 |
| docs/qa-results/unified-package-chrome-report.json | Text scanned | 571 |
| docs/qa-results/unified-package-edge-report.json | Text scanned | 569 |
| docs/qa-results/unified-stage3-chrome-report.json | Text scanned | 2075 |
| docs/qa-results/work-context-chrome.json | Text scanned | 778 |
| docs/qa-results/work-context-edge.json | Text scanned | 778 |
| docs/qa-results/work-tabs-chrome.json | Text scanned | 233 |
| docs/qa-results/work-tabs-edge.json | Text scanned | 233 |
| docs/qa-results/workflow-completion-chrome.json | Text scanned | 354 |
| docs/qa-results/workflow-completion-edge.json | Text scanned | 354 |
| docs/QA.md | Text scanned | 15237 |
| docs/REFINEMENT_COMPLETION_REPORT.md | Text scanned | 4845 |
| docs/REFINEMENT_STAGE_REPORT.md | Text scanned | 7213 |
| docs/RELEASE_CHECKLIST.md | Text scanned | 7315 |
| docs/screenshots/ambient-analog-320.png | Binary hashed only | 45790 |
| docs/screenshots/ambient-analog-390.png | Binary hashed only | 52569 |
| docs/screenshots/ambient-analog-card.png | Binary hashed only | 8764 |
| docs/screenshots/ambient-analog-desktop.png | Binary hashed only | 143336 |
| docs/screenshots/ambient-redesign-chrome-dark-1280.png | Binary hashed only | 1070786 |
| docs/screenshots/ambient-redesign-chrome-dark-1440.png | Binary hashed only | 1212562 |
| docs/screenshots/ambient-redesign-chrome-dark-320.png | Binary hashed only | 170575 |
| docs/screenshots/ambient-redesign-chrome-dark-390.png | Binary hashed only | 208843 |
| docs/screenshots/ambient-redesign-chrome-light-1280.png | Binary hashed only | 1070747 |
| docs/screenshots/ambient-redesign-chrome-light-1440.png | Binary hashed only | 1212451 |
| docs/screenshots/ambient-redesign-chrome-light-320.png | Binary hashed only | 170573 |
| docs/screenshots/ambient-redesign-chrome-light-390.png | Binary hashed only | 208843 |
| docs/screenshots/ambient-redesign-edge-dark-1280.png | Binary hashed only | 1073400 |
| docs/screenshots/ambient-redesign-edge-dark-1440.png | Binary hashed only | 1215106 |
| docs/screenshots/ambient-redesign-edge-dark-320.png | Binary hashed only | 172703 |
| docs/screenshots/ambient-redesign-edge-dark-390.png | Binary hashed only | 211040 |
| docs/screenshots/ambient-redesign-edge-light-1280.png | Binary hashed only | 1073321 |
| docs/screenshots/ambient-redesign-edge-light-1440.png | Binary hashed only | 1215310 |
| docs/screenshots/ambient-redesign-edge-light-320.png | Binary hashed only | 172673 |
| docs/screenshots/ambient-redesign-edge-light-390.png | Binary hashed only | 211043 |
| docs/screenshots/backgrounds-chrome-alpine-1280.png | Binary hashed only | 220591 |
| docs/screenshots/backgrounds-chrome-alpine-1440.png | Binary hashed only | 270068 |
| docs/screenshots/backgrounds-chrome-alpine-320.png | Binary hashed only | 71031 |
| docs/screenshots/backgrounds-chrome-alpine-390.png | Binary hashed only | 88187 |
| docs/screenshots/backgrounds-chrome-cozy-1280.png | Binary hashed only | 218534 |
| docs/screenshots/backgrounds-chrome-cozy-1440.png | Binary hashed only | 269511 |
| docs/screenshots/backgrounds-chrome-cozy-320.png | Binary hashed only | 73319 |
| docs/screenshots/backgrounds-chrome-cozy-390.png | Binary hashed only | 94535 |
| docs/screenshots/backgrounds-chrome-dark-1280.png | Binary hashed only | 217265 |
| docs/screenshots/backgrounds-chrome-dark-1440.png | Binary hashed only | 266633 |
| docs/screenshots/backgrounds-chrome-dark-320.png | Binary hashed only | 70601 |
| docs/screenshots/backgrounds-chrome-dark-390.png | Binary hashed only | 87518 |
| docs/screenshots/backgrounds-chrome-flow.png | Binary hashed only | 292961 |
| docs/screenshots/backgrounds-chrome-lofi-1280.png | Binary hashed only | 221080 |
| docs/screenshots/backgrounds-chrome-lofi-1440.png | Binary hashed only | 271935 |
| docs/screenshots/backgrounds-chrome-lofi-320.png | Binary hashed only | 72095 |
| docs/screenshots/backgrounds-chrome-lofi-390.png | Binary hashed only | 91379 |
| docs/screenshots/backgrounds-chrome-minimal-1280.png | Binary hashed only | 206463 |
| docs/screenshots/backgrounds-chrome-minimal-1440.png | Binary hashed only | 258641 |
| docs/screenshots/backgrounds-chrome-minimal-320.png | Binary hashed only | 71834 |
| docs/screenshots/backgrounds-chrome-minimal-390.png | Binary hashed only | 90675 |
| docs/screenshots/backgrounds-chrome-scenes.png | Binary hashed only | 188328 |
| docs/screenshots/backgrounds-chrome-summit-1280.png | Binary hashed only | 256682 |
| docs/screenshots/backgrounds-chrome-summit-1440.png | Binary hashed only | 334301 |
| docs/screenshots/backgrounds-chrome-summit-320.png | Binary hashed only | 91310 |
| docs/screenshots/backgrounds-chrome-summit-390.png | Binary hashed only | 120271 |
| docs/screenshots/backgrounds-chrome-uploads.png | Binary hashed only | 234661 |
| docs/screenshots/backgrounds-chrome-zoom-200.png | Binary hashed only | 71667 |
| docs/screenshots/backgrounds-edge-alpine-1280.png | Binary hashed only | 222190 |
| docs/screenshots/backgrounds-edge-alpine-1440.png | Binary hashed only | 273020 |
| docs/screenshots/backgrounds-edge-alpine-320.png | Binary hashed only | 71063 |
| docs/screenshots/backgrounds-edge-alpine-390.png | Binary hashed only | 89569 |
| docs/screenshots/backgrounds-edge-cozy-1280.png | Binary hashed only | 220257 |
| docs/screenshots/backgrounds-edge-cozy-1440.png | Binary hashed only | 272688 |
| docs/screenshots/backgrounds-edge-cozy-320.png | Binary hashed only | 73314 |
| docs/screenshots/backgrounds-edge-cozy-390.png | Binary hashed only | 96002 |
| docs/screenshots/backgrounds-edge-dark-1280.png | Binary hashed only | 219132 |
| docs/screenshots/backgrounds-edge-dark-1440.png | Binary hashed only | 269737 |
| docs/screenshots/backgrounds-edge-dark-320.png | Binary hashed only | 70609 |
| docs/screenshots/backgrounds-edge-dark-390.png | Binary hashed only | 88922 |
| docs/screenshots/backgrounds-edge-flow.png | Binary hashed only | 292652 |
| docs/screenshots/backgrounds-edge-lofi-1280.png | Binary hashed only | 222828 |
| docs/screenshots/backgrounds-edge-lofi-1440.png | Binary hashed only | 274935 |
| docs/screenshots/backgrounds-edge-lofi-320.png | Binary hashed only | 72096 |
| docs/screenshots/backgrounds-edge-lofi-390.png | Binary hashed only | 92776 |
| docs/screenshots/backgrounds-edge-minimal-1280.png | Binary hashed only | 208045 |
| docs/screenshots/backgrounds-edge-minimal-1440.png | Binary hashed only | 261764 |
| docs/screenshots/backgrounds-edge-minimal-320.png | Binary hashed only | 71839 |
| docs/screenshots/backgrounds-edge-minimal-390.png | Binary hashed only | 91938 |
| docs/screenshots/backgrounds-edge-scenes.png | Binary hashed only | 188452 |
| docs/screenshots/backgrounds-edge-summit-1280.png | Binary hashed only | 258664 |
| docs/screenshots/backgrounds-edge-summit-1440.png | Binary hashed only | 338403 |
| docs/screenshots/backgrounds-edge-summit-320.png | Binary hashed only | 91374 |
| docs/screenshots/backgrounds-edge-summit-390.png | Binary hashed only | 121701 |
| docs/screenshots/backgrounds-edge-uploads.png | Binary hashed only | 232895 |
| docs/screenshots/backgrounds-edge-zoom-200.png | Binary hashed only | 71667 |
| docs/screenshots/calm-chrome-ambient.png | Binary hashed only | 1212451 |
| docs/screenshots/calm-chrome-focus.png | Binary hashed only | 1272391 |
| docs/screenshots/calm-chrome-home-1280.png | Binary hashed only | 1006165 |
| docs/screenshots/calm-chrome-home-1440.png | Binary hashed only | 1268218 |
| docs/screenshots/calm-chrome-home-320.png | Binary hashed only | 148742 |
| docs/screenshots/calm-chrome-home-390.png | Binary hashed only | 192427 |
| docs/screenshots/calm-chrome-light-options.png | Binary hashed only | 608844 |
| docs/screenshots/calm-chrome-onboarding.png | Binary hashed only | 549366 |
| docs/screenshots/calm-chrome-options-1280.png | Binary hashed only | 837951 |
| docs/screenshots/calm-chrome-options-320.png | Binary hashed only | 82823 |
| docs/screenshots/calm-chrome-options-390.png | Binary hashed only | 130502 |
| docs/screenshots/calm-chrome-scene-alpine.png | Binary hashed only | 654400 |
| docs/screenshots/calm-chrome-scene-cozy.png | Binary hashed only | 655675 |
| docs/screenshots/calm-chrome-scene-dark.png | Binary hashed only | 636718 |
| docs/screenshots/calm-chrome-scene-lofi.png | Binary hashed only | 641832 |
| docs/screenshots/calm-chrome-scene-minimal.png | Binary hashed only | 658751 |
| docs/screenshots/calm-chrome-scene-still-085fc81103c532c6.png | Binary hashed only | 1493683 |
| docs/screenshots/calm-chrome-scene-still-0e4855219f32f3cb.png | Binary hashed only | 1689825 |
| docs/screenshots/calm-chrome-scene-still-30bb8a4e5ee2183a.png | Binary hashed only | 1470079 |
| docs/screenshots/calm-chrome-scene-still-477c20f3f04f5cfd.png | Binary hashed only | 1697164 |
| docs/screenshots/calm-chrome-scene-still-4dd1c2193ceaa5fb.png | Binary hashed only | 1784117 |
| docs/screenshots/calm-chrome-scene-still-54b7319536a12df4.png | Binary hashed only | 1398174 |
| docs/screenshots/calm-chrome-scene-still-585cd0c8fcdc6730.png | Binary hashed only | 1639352 |
| docs/screenshots/calm-chrome-scene-still-5fd0bc0d1743fc06.png | Binary hashed only | 2014952 |
| docs/screenshots/calm-chrome-scene-still-991a7d9c9316d34e.png | Binary hashed only | 1779302 |
| docs/screenshots/calm-chrome-scene-still-9df1f9015a5f6659.png | Binary hashed only | 1966368 |
| docs/screenshots/calm-chrome-scene-still-a6fbba24c95b0620.png | Binary hashed only | 1319107 |
| docs/screenshots/calm-chrome-scene-still-ec30a7337910c6ec.png | Binary hashed only | 1273331 |
| docs/screenshots/calm-chrome-scene-still-efe29597ad8dfe46.png | Binary hashed only | 1506356 |
| docs/screenshots/calm-chrome-scene-still-f08fc60ebdbf23bf.png | Binary hashed only | 1796496 |
| docs/screenshots/calm-chrome-scene-still-f8ad5325ae74b1f5.png | Binary hashed only | 1898249 |
| docs/screenshots/calm-chrome-scene-summit.png | Binary hashed only | 646978 |
| docs/screenshots/calm-chrome-settings.png | Binary hashed only | 59735 |
| docs/screenshots/calm-chrome-studio-320.png | Binary hashed only | 84014 |
| docs/screenshots/calm-chrome-tasks.png | Binary hashed only | 45030 |
| docs/screenshots/calm-chrome-white-upload.png | Binary hashed only | 55924 |
| docs/screenshots/calm-chrome-white.png | Binary hashed only | 54150 |
| docs/screenshots/calm-corners-failure.png | Binary hashed only | 541314 |
| docs/screenshots/calm-corners-home-1440.png | Binary hashed only | 1268692 |
| docs/screenshots/calm-corners-home-320.png | Binary hashed only | 224027 |
| docs/screenshots/calm-corners-home-390.png | Binary hashed only | 311037 |
| docs/screenshots/calm-corners-notes-320.png | Binary hashed only | 55287 |
| docs/screenshots/calm-corners-notes-390.png | Binary hashed only | 56982 |
| docs/screenshots/calm-corners-notes.png | Binary hashed only | 566262 |
| docs/screenshots/calm-edge-ambient.png | Binary hashed only | 259590 |
| docs/screenshots/calm-edge-focus.png | Binary hashed only | 604080 |
| docs/screenshots/calm-edge-home-1280.png | Binary hashed only | 498420 |
| docs/screenshots/calm-edge-home-1440.png | Binary hashed only | 584375 |
| docs/screenshots/calm-edge-home-320.png | Binary hashed only | 151959 |
| docs/screenshots/calm-edge-home-390.png | Binary hashed only | 208296 |
| docs/screenshots/calm-edge-light-options.png | Binary hashed only | 611514 |
| docs/screenshots/calm-edge-onboarding.png | Binary hashed only | 475505 |
| docs/screenshots/calm-edge-options-1280.png | Binary hashed only | 507059 |
| docs/screenshots/calm-edge-options-320.png | Binary hashed only | 92272 |
| docs/screenshots/calm-edge-options-390.png | Binary hashed only | 141847 |
| docs/screenshots/calm-edge-scene-alpine.png | Binary hashed only | 596600 |
| docs/screenshots/calm-edge-scene-cozy.png | Binary hashed only | 565849 |
| docs/screenshots/calm-edge-scene-dark.png | Binary hashed only | 525692 |
| docs/screenshots/calm-edge-scene-lofi.png | Binary hashed only | 547512 |
| docs/screenshots/calm-edge-scene-minimal.png | Binary hashed only | 564596 |
| docs/screenshots/calm-edge-scene-summit.png | Binary hashed only | 561651 |
| docs/screenshots/calm-edge-settings.png | Binary hashed only | 312889 |
| docs/screenshots/calm-edge-studio-320.png | Binary hashed only | 144153 |
| docs/screenshots/calm-edge-tasks.png | Binary hashed only | 358500 |
| docs/screenshots/calm-edge-white-upload.png | Binary hashed only | 493716 |
| docs/screenshots/calm-edge-white.png | Binary hashed only | 34014 |
| docs/screenshots/clear-focus.png | Binary hashed only | 659683 |
| docs/screenshots/clear-home.png | Binary hashed only | 682751 |
| docs/screenshots/combined-notes-chrome-1440.png | Binary hashed only | 56720 |
| docs/screenshots/combined-notes-chrome-320.png | Binary hashed only | 35436 |
| docs/screenshots/combined-notes-chrome-390.png | Binary hashed only | 37991 |
| docs/screenshots/combined-notes-edge-1440.png | Binary hashed only | 694727 |
| docs/screenshots/combined-notes-edge-320.png | Binary hashed only | 55435 |
| docs/screenshots/combined-notes-edge-390.png | Binary hashed only | 56593 |
| docs/screenshots/completion12-chrome-failure.png | Binary hashed only | 51570 |
| docs/screenshots/completion12-edge-failure.png | Binary hashed only | 51570 |
| docs/screenshots/custom-chrome-appearance.png | Binary hashed only | 284819 |
| docs/screenshots/custom-chrome-failure.png | Binary hashed only | 214024 |
| docs/screenshots/custom-chrome-journal-320.png | Binary hashed only | 33695 |
| docs/screenshots/custom-chrome-journal-390.png | Binary hashed only | 34425 |
| docs/screenshots/custom-chrome-journal.png | Binary hashed only | 130927 |
| docs/screenshots/custom-chrome-live-ambient.png | Binary hashed only | 186140 |
| docs/screenshots/custom-chrome-video.png | Binary hashed only | 306413 |
| docs/screenshots/custom-edge-appearance.png | Binary hashed only | 245664 |
| docs/screenshots/custom-edge-journal-320.png | Binary hashed only | 15278 |
| docs/screenshots/custom-edge-journal-390.png | Binary hashed only | 15591 |
| docs/screenshots/custom-edge-journal.png | Binary hashed only | 42097 |
| docs/screenshots/custom-edge-live-ambient.png | Binary hashed only | 187237 |
| docs/screenshots/custom-edge-video.png | Binary hashed only | 303332 |
| docs/screenshots/dashboard-chrome-ambient-1280.png | Binary hashed only | 268914 |
| docs/screenshots/dashboard-chrome-ambient-320.png | Binary hashed only | 87766 |
| docs/screenshots/dashboard-chrome-ambient-390.png | Binary hashed only | 112144 |
| docs/screenshots/dashboard-chrome-ambient-session.png | Binary hashed only | 328024 |
| docs/screenshots/dashboard-chrome-ambient.png | Binary hashed only | 326029 |
| docs/screenshots/dashboard-chrome-failure.png | Binary hashed only | 364659 |
| docs/screenshots/dashboard-chrome-focus-1280.png | Binary hashed only | 302486 |
| docs/screenshots/dashboard-chrome-focus-320.png | Binary hashed only | 98317 |
| docs/screenshots/dashboard-chrome-focus-390.png | Binary hashed only | 127202 |
| docs/screenshots/dashboard-chrome-focus-ready.png | Binary hashed only | 368681 |
| docs/screenshots/dashboard-chrome-focus-running.png | Binary hashed only | 373036 |
| docs/screenshots/dashboard-chrome-home-1280.png | Binary hashed only | 304727 |
| docs/screenshots/dashboard-chrome-home-320.png | Binary hashed only | 100740 |
| docs/screenshots/dashboard-chrome-home-390.png | Binary hashed only | 124863 |
| docs/screenshots/dashboard-chrome-home.png | Binary hashed only | 365858 |
| docs/screenshots/dashboard-chrome-settings.png | Binary hashed only | 231434 |
| docs/screenshots/dashboard-chrome-sounds-1280.png | Binary hashed only | 249670 |
| docs/screenshots/dashboard-chrome-sounds-320.png | Binary hashed only | 50951 |
| docs/screenshots/dashboard-chrome-sounds-390.png | Binary hashed only | 62027 |
| docs/screenshots/dashboard-chrome-sounds.png | Binary hashed only | 299824 |
| docs/screenshots/dashboard-chrome-tasks.png | Binary hashed only | 306966 |
| docs/screenshots/dashboard-chrome-white.png | Binary hashed only | 61412 |
| docs/screenshots/dashboard-desktop.png | Binary hashed only | 68519 |
| docs/screenshots/dashboard-edge-ambient-1280.png | Binary hashed only | 271163 |
| docs/screenshots/dashboard-edge-ambient-320.png | Binary hashed only | 78482 |
| docs/screenshots/dashboard-edge-ambient-390.png | Binary hashed only | 102735 |
| docs/screenshots/dashboard-edge-ambient-session.png | Binary hashed only | 330094 |
| docs/screenshots/dashboard-edge-ambient.png | Binary hashed only | 328091 |
| docs/screenshots/dashboard-edge-failure.png | Binary hashed only | 369937 |
| docs/screenshots/dashboard-edge-focus-1280.png | Binary hashed only | 304771 |
| docs/screenshots/dashboard-edge-focus-320.png | Binary hashed only | 89596 |
| docs/screenshots/dashboard-edge-focus-390.png | Binary hashed only | 117999 |
| docs/screenshots/dashboard-edge-focus-ready.png | Binary hashed only | 370873 |
| docs/screenshots/dashboard-edge-focus-running.png | Binary hashed only | 375169 |
| docs/screenshots/dashboard-edge-home-1280.png | Binary hashed only | 304248 |
| docs/screenshots/dashboard-edge-home-320.png | Binary hashed only | 88780 |
| docs/screenshots/dashboard-edge-home-390.png | Binary hashed only | 113936 |
| docs/screenshots/dashboard-edge-home.png | Binary hashed only | 363415 |
| docs/screenshots/dashboard-edge-settings.png | Binary hashed only | 251254 |
| docs/screenshots/dashboard-edge-sounds-1280.png | Binary hashed only | 255439 |
| docs/screenshots/dashboard-edge-sounds-320.png | Binary hashed only | 50276 |
| docs/screenshots/dashboard-edge-sounds-390.png | Binary hashed only | 67241 |
| docs/screenshots/dashboard-edge-sounds.png | Binary hashed only | 315724 |
| docs/screenshots/dashboard-edge-tasks.png | Binary hashed only | 314728 |
| docs/screenshots/dashboard-edge-white.png | Binary hashed only | 58337 |
| docs/screenshots/dashboard-mobile.png | Binary hashed only | 88931 |
| docs/screenshots/design-1-2-chrome-failure.png | Binary hashed only | 1443631 |
| docs/screenshots/design-1-2-chrome-home-dark-1440.png | Binary hashed only | 1268652 |
| docs/screenshots/design-1-2-chrome-home-dark-320.png | Binary hashed only | 149682 |
| docs/screenshots/design-1-2-chrome-home-dark-390.png | Binary hashed only | 193463 |
| docs/screenshots/design-1-2-chrome-home-light-1440.png | Binary hashed only | 1270536 |
| docs/screenshots/design-1-2-chrome-home-light-320.png | Binary hashed only | 149609 |
| docs/screenshots/design-1-2-chrome-home-light-390.png | Binary hashed only | 193363 |
| docs/screenshots/design-1-2-chrome-journal-dark.png | Binary hashed only | 32526 |
| docs/screenshots/design-1-2-chrome-journal-light.png | Binary hashed only | 32526 |
| docs/screenshots/design-1-2-chrome-notes-dark-1440.png | Binary hashed only | 44367 |
| docs/screenshots/design-1-2-chrome-notes-dark-320.png | Binary hashed only | 25252 |
| docs/screenshots/design-1-2-chrome-notes-light-1440.png | Binary hashed only | 44645 |
| docs/screenshots/design-1-2-chrome-notes-light-320.png | Binary hashed only | 24839 |
| docs/screenshots/design-1-2-chrome-settings-dark.png | Binary hashed only | 59735 |
| docs/screenshots/design-1-2-chrome-settings-light.png | Binary hashed only | 59094 |
| docs/screenshots/design-1-2-chrome-sounds-dark.png | Binary hashed only | 562597 |
| docs/screenshots/design-1-2-chrome-sounds-light.png | Binary hashed only | 564643 |
| docs/screenshots/design-3-4-chrome-failure.png | Binary hashed only | 564650 |
| docs/screenshots/design-3-4-chrome-focus-completed.png | Binary hashed only | 280122 |
| docs/screenshots/design-3-4-chrome-focus-options-320.png | Binary hashed only | 278343 |
| docs/screenshots/design-3-4-chrome-tools-dark-1440.png | Binary hashed only | 560554 |
| docs/screenshots/design-3-4-chrome-tools-dark-320.png | Binary hashed only | 61169 |
| docs/screenshots/design-3-4-chrome-tools-dark-390.png | Binary hashed only | 68118 |
| docs/screenshots/design-3-4-chrome-tools-light-1440.png | Binary hashed only | 562202 |
| docs/screenshots/design-3-4-chrome-tools-light-320.png | Binary hashed only | 60835 |
| docs/screenshots/design-3-4-chrome-tools-light-390.png | Binary hashed only | 67686 |
| docs/screenshots/design-5-6-chrome-milestones-320.png | Binary hashed only | 50918 |
| docs/screenshots/design-7-8-chrome-failure.png | Binary hashed only | 548321 |
| docs/screenshots/design-7-8-chrome-stats-320.png | Binary hashed only | 61037 |
| docs/screenshots/design-9-chrome-home-1440.png | Binary hashed only | 1270120 |
| docs/screenshots/design-9-chrome-home-320.png | Binary hashed only | 146984 |
| docs/screenshots/entry-chrome-compiler-dark-1440.png | Binary hashed only | 559759 |
| docs/screenshots/entry-chrome-compiler-dark-320.png | Binary hashed only | 52290 |
| docs/screenshots/entry-chrome-compiler-dark-390.png | Binary hashed only | 53290 |
| docs/screenshots/entry-chrome-compiler-light-1440.png | Binary hashed only | 565773 |
| docs/screenshots/entry-chrome-compiler-light-320.png | Binary hashed only | 53729 |
| docs/screenshots/entry-chrome-compiler-light-390.png | Binary hashed only | 55439 |
| docs/screenshots/entry-chrome-firststep-dark-1440.png | Binary hashed only | 581028 |
| docs/screenshots/entry-chrome-firststep-dark-320.png | Binary hashed only | 60938 |
| docs/screenshots/entry-chrome-firststep-dark-390.png | Binary hashed only | 63572 |
| docs/screenshots/entry-chrome-firststep-light-1440.png | Binary hashed only | 586147 |
| docs/screenshots/entry-chrome-firststep-light-320.png | Binary hashed only | 62014 |
| docs/screenshots/entry-chrome-firststep-light-390.png | Binary hashed only | 65214 |
| docs/screenshots/entry-chrome-recovery-dark-1440.png | Binary hashed only | 562967 |
| docs/screenshots/entry-chrome-recovery-dark-320.png | Binary hashed only | 54737 |
| docs/screenshots/entry-chrome-recovery-dark-390.png | Binary hashed only | 56639 |
| docs/screenshots/entry-chrome-recovery-light-1440.png | Binary hashed only | 569339 |
| docs/screenshots/entry-chrome-recovery-light-320.png | Binary hashed only | 56393 |
| docs/screenshots/entry-chrome-recovery-light-390.png | Binary hashed only | 58840 |
| docs/screenshots/entry-edge-compiler-dark-1440.png | Binary hashed only | 542560 |
| docs/screenshots/entry-edge-compiler-dark-320.png | Binary hashed only | 56688 |
| docs/screenshots/entry-edge-compiler-dark-390.png | Binary hashed only | 58150 |
| docs/screenshots/entry-edge-compiler-light-1440.png | Binary hashed only | 547590 |
| docs/screenshots/entry-edge-compiler-light-320.png | Binary hashed only | 57830 |
| docs/screenshots/entry-edge-compiler-light-390.png | Binary hashed only | 60142 |
| docs/screenshots/entry-edge-firststep-dark-1440.png | Binary hashed only | 558064 |
| docs/screenshots/entry-edge-firststep-dark-320.png | Binary hashed only | 67536 |
| docs/screenshots/entry-edge-firststep-dark-390.png | Binary hashed only | 71739 |
| docs/screenshots/entry-edge-firststep-light-1440.png | Binary hashed only | 562290 |
| docs/screenshots/entry-edge-firststep-light-320.png | Binary hashed only | 68511 |
| docs/screenshots/entry-edge-firststep-light-390.png | Binary hashed only | 73151 |
| docs/screenshots/entry-edge-recovery-dark-1440.png | Binary hashed only | 545679 |
| docs/screenshots/entry-edge-recovery-dark-320.png | Binary hashed only | 59121 |
| docs/screenshots/entry-edge-recovery-dark-390.png | Binary hashed only | 61410 |
| docs/screenshots/entry-edge-recovery-light-1440.png | Binary hashed only | 550722 |
| docs/screenshots/entry-edge-recovery-light-320.png | Binary hashed only | 60997 |
| docs/screenshots/entry-edge-recovery-light-390.png | Binary hashed only | 63627 |
| docs/screenshots/environment-chrome-blocker-dark-1440.png | Binary hashed only | 52812 |
| docs/screenshots/environment-chrome-blocker-dark-320.png | Binary hashed only | 32976 |
| docs/screenshots/environment-chrome-blocker-dark-390.png | Binary hashed only | 33356 |
| docs/screenshots/environment-chrome-blocker-light-1440.png | Binary hashed only | 52763 |
| docs/screenshots/environment-chrome-blocker-light-320.png | Binary hashed only | 33090 |
| docs/screenshots/environment-chrome-blocker-light-390.png | Binary hashed only | 33479 |
| docs/screenshots/environment-chrome-failure.png | Binary hashed only | 729696 |
| docs/screenshots/environment-chrome-music-dark-1440.png | Binary hashed only | 561541 |
| docs/screenshots/environment-chrome-music-dark-320.png | Binary hashed only | 56279 |
| docs/screenshots/environment-chrome-music-dark-390.png | Binary hashed only | 57734 |
| docs/screenshots/environment-chrome-music-light-1440.png | Binary hashed only | 564135 |
| docs/screenshots/environment-chrome-music-light-320.png | Binary hashed only | 56276 |
| docs/screenshots/environment-chrome-music-light-390.png | Binary hashed only | 57708 |
| docs/screenshots/environment-chrome-scenes-dark-1440.png | Binary hashed only | 744720 |
| docs/screenshots/environment-chrome-scenes-dark-320.png | Binary hashed only | 66140 |
| docs/screenshots/environment-chrome-scenes-dark-390.png | Binary hashed only | 70251 |
| docs/screenshots/environment-chrome-scenes-light-1440.png | Binary hashed only | 746513 |
| docs/screenshots/environment-chrome-scenes-light-320.png | Binary hashed only | 65702 |
| docs/screenshots/environment-chrome-scenes-light-390.png | Binary hashed only | 70089 |
| docs/screenshots/environment-chrome-sounds-dark-1440.png | Binary hashed only | 553600 |
| docs/screenshots/environment-chrome-sounds-dark-320.png | Binary hashed only | 50097 |
| docs/screenshots/environment-chrome-sounds-dark-390.png | Binary hashed only | 51067 |
| docs/screenshots/environment-chrome-sounds-light-1440.png | Binary hashed only | 556140 |
| docs/screenshots/environment-chrome-sounds-light-320.png | Binary hashed only | 50053 |
| docs/screenshots/environment-chrome-sounds-light-390.png | Binary hashed only | 51235 |
| docs/screenshots/environment-edge-blocker-dark-1440.png | Binary hashed only | 53899 |
| docs/screenshots/environment-edge-blocker-dark-320.png | Binary hashed only | 33434 |
| docs/screenshots/environment-edge-blocker-dark-390.png | Binary hashed only | 33908 |
| docs/screenshots/environment-edge-blocker-light-1440.png | Binary hashed only | 53516 |
| docs/screenshots/environment-edge-blocker-light-320.png | Binary hashed only | 33116 |
| docs/screenshots/environment-edge-blocker-light-390.png | Binary hashed only | 33684 |
| docs/screenshots/environment-edge-failure.png | Binary hashed only | 1449290 |
| docs/screenshots/environment-edge-music-dark-1440.png | Binary hashed only | 546006 |
| docs/screenshots/environment-edge-music-dark-320.png | Binary hashed only | 60569 |
| docs/screenshots/environment-edge-music-dark-390.png | Binary hashed only | 62777 |
| docs/screenshots/environment-edge-music-light-1440.png | Binary hashed only | 547364 |
| docs/screenshots/environment-edge-music-light-320.png | Binary hashed only | 60399 |
| docs/screenshots/environment-edge-music-light-390.png | Binary hashed only | 62546 |
| docs/screenshots/environment-edge-scenes-dark-1440.png | Binary hashed only | 728841 |
| docs/screenshots/environment-edge-scenes-dark-320.png | Binary hashed only | 70294 |
| docs/screenshots/environment-edge-scenes-dark-390.png | Binary hashed only | 74960 |
| docs/screenshots/environment-edge-scenes-light-1440.png | Binary hashed only | 729980 |
| docs/screenshots/environment-edge-scenes-light-320.png | Binary hashed only | 69896 |
| docs/screenshots/environment-edge-scenes-light-390.png | Binary hashed only | 74663 |
| docs/screenshots/environment-edge-sounds-dark-1440.png | Binary hashed only | 538306 |
| docs/screenshots/environment-edge-sounds-dark-320.png | Binary hashed only | 54546 |
| docs/screenshots/environment-edge-sounds-dark-390.png | Binary hashed only | 55761 |
| docs/screenshots/environment-edge-sounds-light-1440.png | Binary hashed only | 539901 |
| docs/screenshots/environment-edge-sounds-light-320.png | Binary hashed only | 54455 |
| docs/screenshots/environment-edge-sounds-light-390.png | Binary hashed only | 55861 |
| docs/screenshots/home-chrome-black.png | Binary hashed only | 236748 |
| docs/screenshots/home-chrome-desktop.png | Binary hashed only | 633545 |
| docs/screenshots/home-chrome-light.png | Binary hashed only | 623864 |
| docs/screenshots/home-chrome-mobile.png | Binary hashed only | 150168 |
| docs/screenshots/home-chrome-session.png | Binary hashed only | 629144 |
| docs/screenshots/home-chrome-white.png | Binary hashed only | 45109 |
| docs/screenshots/home-edge-black.png | Binary hashed only | 236014 |
| docs/screenshots/home-edge-desktop.png | Binary hashed only | 632930 |
| docs/screenshots/home-edge-light.png | Binary hashed only | 624290 |
| docs/screenshots/home-edge-mobile.png | Binary hashed only | 150180 |
| docs/screenshots/home-edge-session.png | Binary hashed only | 630668 |
| docs/screenshots/home-edge-white.png | Binary hashed only | 45289 |
| docs/screenshots/journal-page-chrome-1280.png | Binary hashed only | 33192 |
| docs/screenshots/journal-page-chrome-320.png | Binary hashed only | 12310 |
| docs/screenshots/journal-page-chrome-390.png | Binary hashed only | 13254 |
| docs/screenshots/journal-page-chrome-700.png | Binary hashed only | 13667 |
| docs/screenshots/journal-page-chrome-dark.png | Binary hashed only | 34716 |
| docs/screenshots/journal-page-chrome-failure.png | Binary hashed only | 39129 |
| docs/screenshots/journal-page-chrome-home.png | Binary hashed only | 1265870 |
| docs/screenshots/journal-page-chrome-light.png | Binary hashed only | 32526 |
| docs/screenshots/journal-page-chrome-settings-320.png | Binary hashed only | 19659 |
| docs/screenshots/journal-page-chrome-settings-390.png | Binary hashed only | 25501 |
| docs/screenshots/journal-page-chrome-settings-700.png | Binary hashed only | 25245 |
| docs/screenshots/journal-page-chrome-settings-dark.png | Binary hashed only | 36438 |
| docs/screenshots/journal-unified-mobile.png | Binary hashed only | 34438 |
| docs/screenshots/journal-unified.png | Binary hashed only | 98214 |
| docs/screenshots/journeys-chrome-afterglow-dark-1440.png | Binary hashed only | 550495 |
| docs/screenshots/journeys-chrome-afterglow-dark-320.png | Binary hashed only | 60419 |
| docs/screenshots/journeys-chrome-afterglow-light-1440.png | Binary hashed only | 551631 |
| docs/screenshots/journeys-chrome-afterglow-light-320.png | Binary hashed only | 59873 |
| docs/screenshots/journeys-chrome-capsules-dark-1440.png | Binary hashed only | 675162 |
| docs/screenshots/journeys-chrome-capsules-dark-320.png | Binary hashed only | 92884 |
| docs/screenshots/journeys-chrome-capsules-light-1440.png | Binary hashed only | 676171 |
| docs/screenshots/journeys-chrome-capsules-light-320.png | Binary hashed only | 92633 |
| docs/screenshots/journeys-chrome-career-dark-1440.png | Binary hashed only | 557395 |
| docs/screenshots/journeys-chrome-career-dark-320.png | Binary hashed only | 59030 |
| docs/screenshots/journeys-chrome-career-light-1440.png | Binary hashed only | 558918 |
| docs/screenshots/journeys-chrome-career-light-320.png | Binary hashed only | 58819 |
| docs/screenshots/journeys-chrome-energyweather-dark-1440.png | Binary hashed only | 547086 |
| docs/screenshots/journeys-chrome-energyweather-dark-320.png | Binary hashed only | 58622 |
| docs/screenshots/journeys-chrome-energyweather-light-1440.png | Binary hashed only | 548721 |
| docs/screenshots/journeys-chrome-energyweather-light-320.png | Binary hashed only | 58467 |
| docs/screenshots/journeys-chrome-failure.png | Binary hashed only | 548995 |
| docs/screenshots/journeys-chrome-firststep-dark-1440.png | Binary hashed only | 554855 |
| docs/screenshots/journeys-chrome-firststep-dark-320.png | Binary hashed only | 64488 |
| docs/screenshots/journeys-chrome-firststep-light-1440.png | Binary hashed only | 556744 |
| docs/screenshots/journeys-chrome-firststep-light-320.png | Binary hashed only | 64195 |
| docs/screenshots/journeys-chrome-garden-dark-1440.png | Binary hashed only | 555338 |
| docs/screenshots/journeys-chrome-garden-dark-320.png | Binary hashed only | 59119 |
| docs/screenshots/journeys-chrome-garden-light-1440.png | Binary hashed only | 556413 |
| docs/screenshots/journeys-chrome-garden-light-320.png | Binary hashed only | 58936 |
| docs/screenshots/journeys-chrome-proof-dark-1440.png | Binary hashed only | 546580 |
| docs/screenshots/journeys-chrome-proof-dark-320.png | Binary hashed only | 59580 |
| docs/screenshots/journeys-chrome-proof-light-1440.png | Binary hashed only | 548344 |
| docs/screenshots/journeys-chrome-proof-light-320.png | Binary hashed only | 59072 |
| docs/screenshots/journeys-chrome-quietweb-dark-1440.png | Binary hashed only | 535022 |
| docs/screenshots/journeys-chrome-quietweb-dark-320.png | Binary hashed only | 49970 |
| docs/screenshots/journeys-chrome-quietweb-light-1440.png | Binary hashed only | 537735 |
| docs/screenshots/journeys-chrome-quietweb-light-320.png | Binary hashed only | 49955 |
| docs/screenshots/journeys-chrome-recall-dark-1440.png | Binary hashed only | 558195 |
| docs/screenshots/journeys-chrome-recall-dark-320.png | Binary hashed only | 62591 |
| docs/screenshots/journeys-chrome-recall-light-1440.png | Binary hashed only | 560382 |
| docs/screenshots/journeys-chrome-recall-light-320.png | Binary hashed only | 62275 |
| docs/screenshots/journeys-chrome-skills-dark-1440.png | Binary hashed only | 560318 |
| docs/screenshots/journeys-chrome-skills-dark-320.png | Binary hashed only | 61642 |
| docs/screenshots/journeys-chrome-skills-light-1440.png | Binary hashed only | 561352 |
| docs/screenshots/journeys-chrome-skills-light-320.png | Binary hashed only | 61304 |
| docs/screenshots/journeys-edge-afterglow-dark-1440.png | Binary hashed only | 546002 |
| docs/screenshots/journeys-edge-afterglow-dark-320.png | Binary hashed only | 59925 |
| docs/screenshots/journeys-edge-afterglow-light-1440.png | Binary hashed only | 548261 |
| docs/screenshots/journeys-edge-afterglow-light-320.png | Binary hashed only | 59562 |
| docs/screenshots/journeys-edge-capsules-dark-1440.png | Binary hashed only | 549152 |
| docs/screenshots/journeys-edge-capsules-dark-320.png | Binary hashed only | 61730 |
| docs/screenshots/journeys-edge-capsules-light-1440.png | Binary hashed only | 551724 |
| docs/screenshots/journeys-edge-capsules-light-320.png | Binary hashed only | 61614 |
| docs/screenshots/journeys-edge-career-dark-1440.png | Binary hashed only | 547613 |
| docs/screenshots/journeys-edge-career-dark-320.png | Binary hashed only | 61981 |
| docs/screenshots/journeys-edge-career-light-1440.png | Binary hashed only | 549465 |
| docs/screenshots/journeys-edge-career-light-320.png | Binary hashed only | 61819 |
| docs/screenshots/journeys-edge-energyweather-dark-1440.png | Binary hashed only | 551318 |
| docs/screenshots/journeys-edge-energyweather-dark-320.png | Binary hashed only | 63004 |
| docs/screenshots/journeys-edge-energyweather-light-1440.png | Binary hashed only | 553169 |
| docs/screenshots/journeys-edge-energyweather-light-320.png | Binary hashed only | 62793 |
| docs/screenshots/journeys-edge-firststep-dark-1440.png | Binary hashed only | 552495 |
| docs/screenshots/journeys-edge-firststep-dark-320.png | Binary hashed only | 64540 |
| docs/screenshots/journeys-edge-firststep-light-1440.png | Binary hashed only | 554726 |
| docs/screenshots/journeys-edge-firststep-light-320.png | Binary hashed only | 64215 |
| docs/screenshots/journeys-edge-garden-dark-1440.png | Binary hashed only | 544657 |
| docs/screenshots/journeys-edge-garden-dark-320.png | Binary hashed only | 58092 |
| docs/screenshots/journeys-edge-garden-light-1440.png | Binary hashed only | 547207 |
| docs/screenshots/journeys-edge-garden-light-320.png | Binary hashed only | 57961 |
| docs/screenshots/journeys-edge-proof-dark-1440.png | Binary hashed only | 543392 |
| docs/screenshots/journeys-edge-proof-dark-320.png | Binary hashed only | 57935 |
| docs/screenshots/journeys-edge-proof-light-1440.png | Binary hashed only | 545977 |
| docs/screenshots/journeys-edge-proof-light-320.png | Binary hashed only | 57783 |
| docs/screenshots/journeys-edge-quietweb-dark-1440.png | Binary hashed only | 545227 |
| docs/screenshots/journeys-edge-quietweb-dark-320.png | Binary hashed only | 59676 |
| docs/screenshots/journeys-edge-quietweb-light-1440.png | Binary hashed only | 547517 |
| docs/screenshots/journeys-edge-quietweb-light-320.png | Binary hashed only | 59255 |
| docs/screenshots/journeys-edge-recall-dark-1440.png | Binary hashed only | 542472 |
| docs/screenshots/journeys-edge-recall-dark-320.png | Binary hashed only | 55398 |
| docs/screenshots/journeys-edge-recall-light-1440.png | Binary hashed only | 544798 |
| docs/screenshots/journeys-edge-recall-light-320.png | Binary hashed only | 55423 |
| docs/screenshots/journeys-edge-skills-dark-1440.png | Binary hashed only | 549203 |
| docs/screenshots/journeys-edge-skills-dark-320.png | Binary hashed only | 61250 |
| docs/screenshots/journeys-edge-skills-light-1440.png | Binary hashed only | 551619 |
| docs/screenshots/journeys-edge-skills-light-320.png | Binary hashed only | 61051 |
| docs/screenshots/notes-chrome-1100-dark.png | Binary hashed only | 116857 |
| docs/screenshots/notes-chrome-1100-light.png | Binary hashed only | 90732 |
| docs/screenshots/notes-chrome-320-dark.png | Binary hashed only | 65538 |
| docs/screenshots/notes-chrome-320-light.png | Binary hashed only | 64426 |
| docs/screenshots/notes-chrome-390-dark.png | Binary hashed only | 71690 |
| docs/screenshots/notes-chrome-390-light.png | Binary hashed only | 72736 |
| docs/screenshots/notes-edge-1100-dark.png | Binary hashed only | 28297 |
| docs/screenshots/notes-edge-320-dark.png | Binary hashed only | 23266 |
| docs/screenshots/notes-edge-320-light.png | Binary hashed only | 23503 |
| docs/screenshots/notes-edge-390-dark.png | Binary hashed only | 23861 |
| docs/screenshots/notes-overlay-chrome-320.png | Binary hashed only | 24304 |
| docs/screenshots/notes-overlay-chrome.png | Binary hashed only | 58144 |
| docs/screenshots/notes-overlay-edge-320.png | Binary hashed only | 21515 |
| docs/screenshots/notes-overlay-edge.png | Binary hashed only | 39331 |
| docs/screenshots/panel-redesign-chrome-capsules-dark-1440.png | Binary hashed only | 647241 |
| docs/screenshots/panel-redesign-chrome-capsules-dark-320.png | Binary hashed only | 89236 |
| docs/screenshots/panel-redesign-chrome-capsules-dark-390.png | Binary hashed only | 104045 |
| docs/screenshots/panel-redesign-chrome-capsules-light-1440.png | Binary hashed only | 650011 |
| docs/screenshots/panel-redesign-chrome-capsules-light-320.png | Binary hashed only | 88922 |
| docs/screenshots/panel-redesign-chrome-capsules-light-390.png | Binary hashed only | 104139 |
| docs/screenshots/panel-redesign-chrome-career-dark-1440.png | Binary hashed only | 570889 |
| docs/screenshots/panel-redesign-chrome-career-dark-320.png | Binary hashed only | 55598 |
| docs/screenshots/panel-redesign-chrome-career-dark-390.png | Binary hashed only | 57428 |
| docs/screenshots/panel-redesign-chrome-career-light-1440.png | Binary hashed only | 573990 |
| docs/screenshots/panel-redesign-chrome-career-light-320.png | Binary hashed only | 55402 |
| docs/screenshots/panel-redesign-chrome-career-light-390.png | Binary hashed only | 57457 |
| docs/screenshots/panel-redesign-chrome-day-dark-1440.png | Binary hashed only | 573878 |
| docs/screenshots/panel-redesign-chrome-day-dark-320.png | Binary hashed only | 51264 |
| docs/screenshots/panel-redesign-chrome-day-dark-390.png | Binary hashed only | 57199 |
| docs/screenshots/panel-redesign-chrome-day-light-1440.png | Binary hashed only | 576619 |
| docs/screenshots/panel-redesign-chrome-day-light-320.png | Binary hashed only | 51217 |
| docs/screenshots/panel-redesign-chrome-day-light-390.png | Binary hashed only | 56776 |
| docs/screenshots/panel-redesign-chrome-failure.png | Binary hashed only | 549190 |
| docs/screenshots/panel-redesign-chrome-garden-dark-1440.png | Binary hashed only | 580534 |
| docs/screenshots/panel-redesign-chrome-garden-dark-320.png | Binary hashed only | 55803 |
| docs/screenshots/panel-redesign-chrome-garden-dark-390.png | Binary hashed only | 59405 |
| docs/screenshots/panel-redesign-chrome-garden-light-1440.png | Binary hashed only | 581695 |
| docs/screenshots/panel-redesign-chrome-garden-light-320.png | Binary hashed only | 55498 |
| docs/screenshots/panel-redesign-chrome-garden-light-390.png | Binary hashed only | 59102 |
| docs/screenshots/panel-redesign-chrome-recall-dark-1440.png | Binary hashed only | 561744 |
| docs/screenshots/panel-redesign-chrome-recall-dark-320.png | Binary hashed only | 53019 |
| docs/screenshots/panel-redesign-chrome-recall-dark-390.png | Binary hashed only | 55644 |
| docs/screenshots/panel-redesign-chrome-recall-light-1440.png | Binary hashed only | 562437 |
| docs/screenshots/panel-redesign-chrome-recall-light-320.png | Binary hashed only | 53026 |
| docs/screenshots/panel-redesign-chrome-recall-light-390.png | Binary hashed only | 55524 |
| docs/screenshots/panel-redesign-chrome-skills-dark-1440.png | Binary hashed only | 576770 |
| docs/screenshots/panel-redesign-chrome-skills-dark-320.png | Binary hashed only | 58241 |
| docs/screenshots/panel-redesign-chrome-skills-dark-390.png | Binary hashed only | 65791 |
| docs/screenshots/panel-redesign-chrome-skills-light-1440.png | Binary hashed only | 577783 |
| docs/screenshots/panel-redesign-chrome-skills-light-320.png | Binary hashed only | 57996 |
| docs/screenshots/panel-redesign-chrome-skills-light-390.png | Binary hashed only | 65194 |
| docs/screenshots/panel-redesign-edge-capsules-dark-1440.png | Binary hashed only | 628310 |
| docs/screenshots/panel-redesign-edge-capsules-dark-320.png | Binary hashed only | 102082 |
| docs/screenshots/panel-redesign-edge-capsules-dark-390.png | Binary hashed only | 134052 |
| docs/screenshots/panel-redesign-edge-capsules-light-1440.png | Binary hashed only | 628941 |
| docs/screenshots/panel-redesign-edge-capsules-light-320.png | Binary hashed only | 101803 |
| docs/screenshots/panel-redesign-edge-capsules-light-390.png | Binary hashed only | 134294 |
| docs/screenshots/panel-redesign-edge-career-dark-1440.png | Binary hashed only | 553155 |
| docs/screenshots/panel-redesign-edge-career-dark-320.png | Binary hashed only | 59834 |
| docs/screenshots/panel-redesign-edge-career-dark-390.png | Binary hashed only | 62523 |
| docs/screenshots/panel-redesign-edge-career-light-1440.png | Binary hashed only | 554656 |
| docs/screenshots/panel-redesign-edge-career-light-320.png | Binary hashed only | 59633 |
| docs/screenshots/panel-redesign-edge-career-light-390.png | Binary hashed only | 62484 |
| docs/screenshots/panel-redesign-edge-day-dark-1440.png | Binary hashed only | 562674 |
| docs/screenshots/panel-redesign-edge-day-dark-320.png | Binary hashed only | 62714 |
| docs/screenshots/panel-redesign-edge-day-dark-390.png | Binary hashed only | 69204 |
| docs/screenshots/panel-redesign-edge-day-light-1440.png | Binary hashed only | 564880 |
| docs/screenshots/panel-redesign-edge-day-light-320.png | Binary hashed only | 62555 |
| docs/screenshots/panel-redesign-edge-day-light-390.png | Binary hashed only | 69087 |
| docs/screenshots/panel-redesign-edge-failure.png | Binary hashed only | 548897 |
| docs/screenshots/panel-redesign-edge-garden-dark-1440.png | Binary hashed only | 562570 |
| docs/screenshots/panel-redesign-edge-garden-dark-320.png | Binary hashed only | 59980 |
| docs/screenshots/panel-redesign-edge-garden-dark-390.png | Binary hashed only | 64365 |
| docs/screenshots/panel-redesign-edge-garden-light-1440.png | Binary hashed only | 563534 |
| docs/screenshots/panel-redesign-edge-garden-light-320.png | Binary hashed only | 59664 |
| docs/screenshots/panel-redesign-edge-garden-light-390.png | Binary hashed only | 63980 |
| docs/screenshots/panel-redesign-edge-recall-dark-1440.png | Binary hashed only | 543387 |
| docs/screenshots/panel-redesign-edge-recall-dark-320.png | Binary hashed only | 57413 |
| docs/screenshots/panel-redesign-edge-recall-dark-390.png | Binary hashed only | 60653 |
| docs/screenshots/panel-redesign-edge-recall-light-1440.png | Binary hashed only | 544037 |
| docs/screenshots/panel-redesign-edge-recall-light-320.png | Binary hashed only | 57250 |
| docs/screenshots/panel-redesign-edge-recall-light-390.png | Binary hashed only | 60458 |
| docs/screenshots/panel-redesign-edge-skills-dark-1440.png | Binary hashed only | 557986 |
| docs/screenshots/panel-redesign-edge-skills-dark-320.png | Binary hashed only | 63380 |
| docs/screenshots/panel-redesign-edge-skills-dark-390.png | Binary hashed only | 70494 |
| docs/screenshots/panel-redesign-edge-skills-light-1440.png | Binary hashed only | 559184 |
| docs/screenshots/panel-redesign-edge-skills-light-320.png | Binary hashed only | 63043 |
| docs/screenshots/panel-redesign-edge-skills-light-390.png | Binary hashed only | 69826 |
| docs/screenshots/panels-chrome-320-sounds.png | Binary hashed only | 50420 |
| docs/screenshots/panels-chrome-320-tasks.png | Binary hashed only | 50965 |
| docs/screenshots/panels-chrome-390-sounds.png | Binary hashed only | 51288 |
| docs/screenshots/panels-chrome-390-tasks.png | Binary hashed only | 47913 |
| docs/screenshots/panels-chrome-desktop-sounds.png | Binary hashed only | 193117 |
| docs/screenshots/panels-chrome-desktop-tasks.png | Binary hashed only | 199461 |
| docs/screenshots/panels-chrome-directory.png | Binary hashed only | 201893 |
| docs/screenshots/panels-chrome-flow.png | Binary hashed only | 364177 |
| docs/screenshots/panels-chrome-light-settings.png | Binary hashed only | 41472 |
| docs/screenshots/panels-chrome-mobile-flow.png | Binary hashed only | 116605 |
| docs/screenshots/panels-chrome-mobile-settings.png | Binary hashed only | 44168 |
| docs/screenshots/panels-chrome-notes.png | Binary hashed only | 162597 |
| docs/screenshots/panels-chrome-reminders.png | Binary hashed only | 166033 |
| docs/screenshots/panels-chrome-settings-focus.png | Binary hashed only | 169636 |
| docs/screenshots/panels-chrome-tasks.png | Binary hashed only | 200243 |
| docs/screenshots/panels-edge-320-sounds.png | Binary hashed only | 50206 |
| docs/screenshots/panels-edge-320-tasks.png | Binary hashed only | 50586 |
| docs/screenshots/panels-edge-390-sounds.png | Binary hashed only | 51337 |
| docs/screenshots/panels-edge-390-tasks.png | Binary hashed only | 47955 |
| docs/screenshots/panels-edge-desktop-sounds.png | Binary hashed only | 190457 |
| docs/screenshots/panels-edge-desktop-tasks.png | Binary hashed only | 200491 |
| docs/screenshots/panels-edge-directory.png | Binary hashed only | 201206 |
| docs/screenshots/panels-edge-flow.png | Binary hashed only | 369671 |
| docs/screenshots/panels-edge-light-settings.png | Binary hashed only | 53439 |
| docs/screenshots/panels-edge-mobile-flow.png | Binary hashed only | 116420 |
| docs/screenshots/panels-edge-mobile-settings.png | Binary hashed only | 45395 |
| docs/screenshots/panels-edge-notes.png | Binary hashed only | 162599 |
| docs/screenshots/panels-edge-reminders.png | Binary hashed only | 166332 |
| docs/screenshots/panels-edge-settings-focus.png | Binary hashed only | 169021 |
| docs/screenshots/panels-edge-tasks.png | Binary hashed only | 199716 |
| docs/screenshots/pexels-offline.png | Binary hashed only | 353895 |
| docs/screenshots/planning-chrome-afterglow-dark-1440.png | Binary hashed only | 562723 |
| docs/screenshots/planning-chrome-afterglow-dark-320.png | Binary hashed only | 55807 |
| docs/screenshots/planning-chrome-afterglow-dark-390.png | Binary hashed only | 57537 |
| docs/screenshots/planning-chrome-afterglow-light-1440.png | Binary hashed only | 564711 |
| docs/screenshots/planning-chrome-afterglow-light-320.png | Binary hashed only | 55502 |
| docs/screenshots/planning-chrome-afterglow-light-390.png | Binary hashed only | 57209 |
| docs/screenshots/planning-chrome-dna-dark-1440.png | Binary hashed only | 546664 |
| docs/screenshots/planning-chrome-dna-dark-320.png | Binary hashed only | 46121 |
| docs/screenshots/planning-chrome-dna-dark-390.png | Binary hashed only | 47350 |
| docs/screenshots/planning-chrome-dna-light-1440.png | Binary hashed only | 550786 |
| docs/screenshots/planning-chrome-dna-light-320.png | Binary hashed only | 46231 |
| docs/screenshots/planning-chrome-dna-light-390.png | Binary hashed only | 47360 |
| docs/screenshots/planning-chrome-energy-dark-1440.png | Binary hashed only | 565468 |
| docs/screenshots/planning-chrome-energy-dark-320.png | Binary hashed only | 59265 |
| docs/screenshots/planning-chrome-energy-dark-390.png | Binary hashed only | 62060 |
| docs/screenshots/planning-chrome-energy-light-1440.png | Binary hashed only | 566850 |
| docs/screenshots/planning-chrome-energy-light-320.png | Binary hashed only | 58870 |
| docs/screenshots/planning-chrome-energy-light-390.png | Binary hashed only | 61905 |
| docs/screenshots/planning-chrome-energyweather-dark-1440.png | Binary hashed only | 559043 |
| docs/screenshots/planning-chrome-energyweather-dark-320.png | Binary hashed only | 54962 |
| docs/screenshots/planning-chrome-energyweather-dark-390.png | Binary hashed only | 56264 |
| docs/screenshots/planning-chrome-energyweather-light-1440.png | Binary hashed only | 561688 |
| docs/screenshots/planning-chrome-energyweather-light-320.png | Binary hashed only | 54861 |
| docs/screenshots/planning-chrome-energyweather-light-390.png | Binary hashed only | 56221 |
| docs/screenshots/planning-chrome-failure.png | Binary hashed only | 543363 |
| docs/screenshots/planning-chrome-proof-dark-1440.png | Binary hashed only | 561004 |
| docs/screenshots/planning-chrome-proof-dark-320.png | Binary hashed only | 55889 |
| docs/screenshots/planning-chrome-proof-dark-390.png | Binary hashed only | 58455 |
| docs/screenshots/planning-chrome-proof-light-1440.png | Binary hashed only | 563705 |
| docs/screenshots/planning-chrome-proof-light-320.png | Binary hashed only | 55926 |
| docs/screenshots/planning-chrome-proof-light-390.png | Binary hashed only | 58426 |
| docs/screenshots/planning-chrome-queue-dark-1440.png | Binary hashed only | 565437 |
| docs/screenshots/planning-chrome-queue-dark-320.png | Binary hashed only | 58162 |
| docs/screenshots/planning-chrome-queue-dark-390.png | Binary hashed only | 61387 |
| docs/screenshots/planning-chrome-queue-light-1440.png | Binary hashed only | 566670 |
| docs/screenshots/planning-chrome-queue-light-320.png | Binary hashed only | 58141 |
| docs/screenshots/planning-chrome-queue-light-390.png | Binary hashed only | 61376 |
| docs/screenshots/planning-chrome-quietweb-dark-1440.png | Binary hashed only | 560370 |
| docs/screenshots/planning-chrome-quietweb-dark-320.png | Binary hashed only | 54224 |
| docs/screenshots/planning-chrome-quietweb-dark-390.png | Binary hashed only | 55581 |
| docs/screenshots/planning-chrome-quietweb-light-1440.png | Binary hashed only | 561512 |
| docs/screenshots/planning-chrome-quietweb-light-320.png | Binary hashed only | 53915 |
| docs/screenshots/planning-chrome-quietweb-light-390.png | Binary hashed only | 55327 |
| docs/screenshots/planning-edge-afterglow-dark-1440.png | Binary hashed only | 545753 |
| docs/screenshots/planning-edge-afterglow-dark-320.png | Binary hashed only | 60349 |
| docs/screenshots/planning-edge-afterglow-dark-390.png | Binary hashed only | 62835 |
| docs/screenshots/planning-edge-afterglow-light-1440.png | Binary hashed only | 546584 |
| docs/screenshots/planning-edge-afterglow-light-320.png | Binary hashed only | 59815 |
| docs/screenshots/planning-edge-afterglow-light-390.png | Binary hashed only | 62239 |
| docs/screenshots/planning-edge-dna-dark-1440.png | Binary hashed only | 530169 |
| docs/screenshots/planning-edge-dna-dark-320.png | Binary hashed only | 50124 |
| docs/screenshots/planning-edge-dna-dark-390.png | Binary hashed only | 52356 |
| docs/screenshots/planning-edge-dna-light-1440.png | Binary hashed only | 532811 |
| docs/screenshots/planning-edge-dna-light-320.png | Binary hashed only | 50401 |
| docs/screenshots/planning-edge-dna-light-390.png | Binary hashed only | 52242 |
| docs/screenshots/planning-edge-energy-dark-1440.png | Binary hashed only | 545546 |
| docs/screenshots/planning-edge-energy-dark-320.png | Binary hashed only | 63477 |
| docs/screenshots/planning-edge-energy-dark-390.png | Binary hashed only | 66049 |
| docs/screenshots/planning-edge-energy-light-1440.png | Binary hashed only | 547504 |
| docs/screenshots/planning-edge-energy-light-320.png | Binary hashed only | 63166 |
| docs/screenshots/planning-edge-energy-light-390.png | Binary hashed only | 65741 |
| docs/screenshots/planning-edge-energyweather-dark-1440.png | Binary hashed only | 540695 |
| docs/screenshots/planning-edge-energyweather-dark-320.png | Binary hashed only | 58004 |
| docs/screenshots/planning-edge-energyweather-dark-390.png | Binary hashed only | 59959 |
| docs/screenshots/planning-edge-energyweather-light-1440.png | Binary hashed only | 542465 |
| docs/screenshots/planning-edge-energyweather-light-320.png | Binary hashed only | 57797 |
| docs/screenshots/planning-edge-energyweather-light-390.png | Binary hashed only | 59740 |
| docs/screenshots/planning-edge-failure.png | Binary hashed only | 547807 |
| docs/screenshots/planning-edge-proof-dark-1440.png | Binary hashed only | 542946 |
| docs/screenshots/planning-edge-proof-dark-320.png | Binary hashed only | 60464 |
| docs/screenshots/planning-edge-proof-dark-390.png | Binary hashed only | 63064 |
| docs/screenshots/planning-edge-proof-light-1440.png | Binary hashed only | 545057 |
| docs/screenshots/planning-edge-proof-light-320.png | Binary hashed only | 60364 |
| docs/screenshots/planning-edge-proof-light-390.png | Binary hashed only | 62817 |
| docs/screenshots/planning-edge-queue-dark-1440.png | Binary hashed only | 542679 |
| docs/screenshots/planning-edge-queue-dark-320.png | Binary hashed only | 60658 |
| docs/screenshots/planning-edge-queue-dark-390.png | Binary hashed only | 61831 |
| docs/screenshots/planning-edge-queue-light-1440.png | Binary hashed only | 544666 |
| docs/screenshots/planning-edge-queue-light-320.png | Binary hashed only | 60563 |
| docs/screenshots/planning-edge-queue-light-390.png | Binary hashed only | 61850 |
| docs/screenshots/planning-edge-quietweb-dark-1440.png | Binary hashed only | 542168 |
| docs/screenshots/planning-edge-quietweb-dark-320.png | Binary hashed only | 58400 |
| docs/screenshots/planning-edge-quietweb-dark-390.png | Binary hashed only | 60503 |
| docs/screenshots/planning-edge-quietweb-light-1440.png | Binary hashed only | 543201 |
| docs/screenshots/planning-edge-quietweb-light-320.png | Binary hashed only | 58000 |
| docs/screenshots/planning-edge-quietweb-light-390.png | Binary hashed only | 60123 |
| docs/screenshots/refined-chrome-appearance-preview.png | Binary hashed only | 49082 |
| docs/screenshots/refined-chrome-dark-1280.png | Binary hashed only | 1116066 |
| docs/screenshots/refined-chrome-dark-1440.png | Binary hashed only | 1270585 |
| docs/screenshots/refined-chrome-dark-320.png | Binary hashed only | 164782 |
| docs/screenshots/refined-chrome-dark-390.png | Binary hashed only | 192916 |
| docs/screenshots/refined-chrome-focus-paused-320.png | Binary hashed only | 169814 |
| docs/screenshots/refined-chrome-light-1280.png | Binary hashed only | 1115957 |
| docs/screenshots/refined-chrome-light-1440.png | Binary hashed only | 1270292 |
| docs/screenshots/refined-chrome-light-320.png | Binary hashed only | 164729 |
| docs/screenshots/refined-chrome-light-390.png | Binary hashed only | 192800 |
| docs/screenshots/refined-edge-appearance-preview.png | Binary hashed only | 48925 |
| docs/screenshots/refined-edge-dark-1280.png | Binary hashed only | 1290138 |
| docs/screenshots/refined-edge-dark-1440.png | Binary hashed only | 1447791 |
| docs/screenshots/refined-edge-dark-320.png | Binary hashed only | 249956 |
| docs/screenshots/refined-edge-dark-390.png | Binary hashed only | 302355 |
| docs/screenshots/refined-edge-focus-paused-320.png | Binary hashed only | 261201 |
| docs/screenshots/refined-edge-light-1280.png | Binary hashed only | 1290065 |
| docs/screenshots/refined-edge-light-1440.png | Binary hashed only | 1447698 |
| docs/screenshots/refined-edge-light-320.png | Binary hashed only | 249929 |
| docs/screenshots/refined-edge-light-390.png | Binary hashed only | 302403 |
| docs/screenshots/remaining-chrome-commands-dark-1440.png | Binary hashed only | 557991 |
| docs/screenshots/remaining-chrome-commands-dark-320.png | Binary hashed only | 53514 |
| docs/screenshots/remaining-chrome-commands-dark-390.png | Binary hashed only | 54715 |
| docs/screenshots/remaining-chrome-commands-light-1440.png | Binary hashed only | 566214 |
| docs/screenshots/remaining-chrome-commands-light-320.png | Binary hashed only | 53697 |
| docs/screenshots/remaining-chrome-commands-light-390.png | Binary hashed only | 54719 |
| docs/screenshots/remaining-chrome-countdowns-dark-1440.png | Binary hashed only | 549191 |
| docs/screenshots/remaining-chrome-countdowns-dark-320.png | Binary hashed only | 46828 |
| docs/screenshots/remaining-chrome-countdowns-dark-390.png | Binary hashed only | 48165 |
| docs/screenshots/remaining-chrome-countdowns-light-1440.png | Binary hashed only | 558642 |
| docs/screenshots/remaining-chrome-countdowns-light-320.png | Binary hashed only | 47031 |
| docs/screenshots/remaining-chrome-countdowns-light-390.png | Binary hashed only | 48240 |
| docs/screenshots/remaining-chrome-dictionary-dark-1440.png | Binary hashed only | 545468 |
| docs/screenshots/remaining-chrome-dictionary-dark-320.png | Binary hashed only | 44346 |
| docs/screenshots/remaining-chrome-dictionary-dark-390.png | Binary hashed only | 45850 |
| docs/screenshots/remaining-chrome-dictionary-light-1440.png | Binary hashed only | 555541 |
| docs/screenshots/remaining-chrome-dictionary-light-320.png | Binary hashed only | 44270 |
| docs/screenshots/remaining-chrome-dictionary-light-390.png | Binary hashed only | 45757 |
| docs/screenshots/remaining-chrome-failure.png | Binary hashed only | 562777 |
| docs/screenshots/remaining-chrome-layout-dark-1440.png | Binary hashed only | 924798 |
| docs/screenshots/remaining-chrome-layout-dark-320.png | Binary hashed only | 141402 |
| docs/screenshots/remaining-chrome-layout-dark-390.png | Binary hashed only | 156743 |
| docs/screenshots/remaining-chrome-layout-light-1440.png | Binary hashed only | 925420 |
| docs/screenshots/remaining-chrome-layout-light-320.png | Binary hashed only | 141133 |
| docs/screenshots/remaining-chrome-layout-light-390.png | Binary hashed only | 156504 |
| docs/screenshots/remaining-chrome-mood-dark-1440.png | Binary hashed only | 554371 |
| docs/screenshots/remaining-chrome-mood-dark-320.png | Binary hashed only | 53423 |
| docs/screenshots/remaining-chrome-mood-dark-390.png | Binary hashed only | 54768 |
| docs/screenshots/remaining-chrome-mood-light-1440.png | Binary hashed only | 563632 |
| docs/screenshots/remaining-chrome-mood-light-320.png | Binary hashed only | 53322 |
| docs/screenshots/remaining-chrome-mood-light-390.png | Binary hashed only | 60101 |
| docs/screenshots/remaining-chrome-notifications-dark-1440.png | Binary hashed only | 570182 |
| docs/screenshots/remaining-chrome-notifications-dark-320.png | Binary hashed only | 60947 |
| docs/screenshots/remaining-chrome-notifications-dark-390.png | Binary hashed only | 62649 |
| docs/screenshots/remaining-chrome-notifications-light-1440.png | Binary hashed only | 578644 |
| docs/screenshots/remaining-chrome-notifications-light-320.png | Binary hashed only | 60640 |
| docs/screenshots/remaining-chrome-notifications-light-390.png | Binary hashed only | 62530 |
| docs/screenshots/remaining-chrome-reflection-dark-1440.png | Binary hashed only | 549779 |
| docs/screenshots/remaining-chrome-reflection-dark-320.png | Binary hashed only | 47599 |
| docs/screenshots/remaining-chrome-reflection-dark-390.png | Binary hashed only | 47890 |
| docs/screenshots/remaining-chrome-reflection-light-1440.png | Binary hashed only | 558421 |
| docs/screenshots/remaining-chrome-reflection-light-320.png | Binary hashed only | 47235 |
| docs/screenshots/remaining-chrome-reflection-light-390.png | Binary hashed only | 53153 |
| docs/screenshots/remaining-chrome-rituals-dark-1440.png | Binary hashed only | 544851 |
| docs/screenshots/remaining-chrome-rituals-dark-320.png | Binary hashed only | 43887 |
| docs/screenshots/remaining-chrome-rituals-dark-390.png | Binary hashed only | 45285 |
| docs/screenshots/remaining-chrome-rituals-light-1440.png | Binary hashed only | 555227 |
| docs/screenshots/remaining-chrome-rituals-light-320.png | Binary hashed only | 43860 |
| docs/screenshots/remaining-chrome-rituals-light-390.png | Binary hashed only | 50572 |
| docs/screenshots/remaining-chrome-stats-dark-1440.png | Binary hashed only | 578439 |
| docs/screenshots/remaining-chrome-stats-dark-320.png | Binary hashed only | 60028 |
| docs/screenshots/remaining-chrome-stats-dark-390.png | Binary hashed only | 62369 |
| docs/screenshots/remaining-chrome-stats-light-1440.png | Binary hashed only | 587453 |
| docs/screenshots/remaining-chrome-stats-light-320.png | Binary hashed only | 59959 |
| docs/screenshots/remaining-chrome-stats-light-390.png | Binary hashed only | 62407 |
| docs/screenshots/remaining-chrome-suggestions-dark-1440.png | Binary hashed only | 551874 |
| docs/screenshots/remaining-chrome-suggestions-dark-320.png | Binary hashed only | 54457 |
| docs/screenshots/remaining-chrome-suggestions-dark-390.png | Binary hashed only | 56035 |
| docs/screenshots/remaining-chrome-suggestions-light-1440.png | Binary hashed only | 563030 |
| docs/screenshots/remaining-chrome-suggestions-light-320.png | Binary hashed only | 54944 |
| docs/screenshots/remaining-chrome-suggestions-light-390.png | Binary hashed only | 61700 |
| docs/screenshots/remaining-chrome-support-dark-1440.png | Binary hashed only | 555190 |
| docs/screenshots/remaining-chrome-support-dark-320.png | Binary hashed only | 52121 |
| docs/screenshots/remaining-chrome-support-dark-390.png | Binary hashed only | 53636 |
| docs/screenshots/remaining-chrome-support-light-1440.png | Binary hashed only | 563582 |
| docs/screenshots/remaining-chrome-support-light-320.png | Binary hashed only | 51846 |
| docs/screenshots/remaining-chrome-support-light-390.png | Binary hashed only | 53301 |
| docs/screenshots/remaining-chrome-websearch-dark-1440.png | Binary hashed only | 549526 |
| docs/screenshots/remaining-chrome-websearch-dark-320.png | Binary hashed only | 47799 |
| docs/screenshots/remaining-chrome-websearch-dark-390.png | Binary hashed only | 49143 |
| docs/screenshots/remaining-chrome-websearch-light-1440.png | Binary hashed only | 559477 |
| docs/screenshots/remaining-chrome-websearch-light-320.png | Binary hashed only | 47699 |
| docs/screenshots/remaining-chrome-websearch-light-390.png | Binary hashed only | 48999 |
| docs/screenshots/remaining-edge-commands-dark-1440.png | Binary hashed only | 543156 |
| docs/screenshots/remaining-edge-commands-dark-320.png | Binary hashed only | 57795 |
| docs/screenshots/remaining-edge-commands-dark-390.png | Binary hashed only | 63578 |
| docs/screenshots/remaining-edge-commands-light-1440.png | Binary hashed only | 547565 |
| docs/screenshots/remaining-edge-commands-light-320.png | Binary hashed only | 61629 |
| docs/screenshots/remaining-edge-commands-light-390.png | Binary hashed only | 65751 |
| docs/screenshots/remaining-edge-countdowns-dark-1440.png | Binary hashed only | 535898 |
| docs/screenshots/remaining-edge-countdowns-dark-320.png | Binary hashed only | 50895 |
| docs/screenshots/remaining-edge-countdowns-dark-390.png | Binary hashed only | 56598 |
| docs/screenshots/remaining-edge-countdowns-light-1440.png | Binary hashed only | 540650 |
| docs/screenshots/remaining-edge-countdowns-light-320.png | Binary hashed only | 55774 |
| docs/screenshots/remaining-edge-countdowns-light-390.png | Binary hashed only | 58808 |
| docs/screenshots/remaining-edge-dictionary-dark-1440.png | Binary hashed only | 533128 |
| docs/screenshots/remaining-edge-dictionary-dark-320.png | Binary hashed only | 48887 |
| docs/screenshots/remaining-edge-dictionary-dark-390.png | Binary hashed only | 54647 |
| docs/screenshots/remaining-edge-dictionary-light-1440.png | Binary hashed only | 538134 |
| docs/screenshots/remaining-edge-dictionary-light-320.png | Binary hashed only | 53603 |
| docs/screenshots/remaining-edge-dictionary-light-390.png | Binary hashed only | 56812 |
| docs/screenshots/remaining-edge-failure.png | Binary hashed only | 540523 |
| docs/screenshots/remaining-edge-layout-dark-1440.png | Binary hashed only | 1074086 |
| docs/screenshots/remaining-edge-layout-dark-320.png | Binary hashed only | 184712 |
| docs/screenshots/remaining-edge-layout-dark-390.png | Binary hashed only | 211414 |
| docs/screenshots/remaining-edge-layout-light-1440.png | Binary hashed only | 1083154 |
| docs/screenshots/remaining-edge-layout-light-320.png | Binary hashed only | 184511 |
| docs/screenshots/remaining-edge-layout-light-390.png | Binary hashed only | 211119 |
| docs/screenshots/remaining-edge-mood-dark-1440.png | Binary hashed only | 541849 |
| docs/screenshots/remaining-edge-mood-dark-320.png | Binary hashed only | 57705 |
| docs/screenshots/remaining-edge-mood-dark-390.png | Binary hashed only | 63811 |
| docs/screenshots/remaining-edge-mood-light-1440.png | Binary hashed only | 545821 |
| docs/screenshots/remaining-edge-mood-light-320.png | Binary hashed only | 62403 |
| docs/screenshots/remaining-edge-mood-light-390.png | Binary hashed only | 65694 |
| docs/screenshots/remaining-edge-notifications-dark-1440.png | Binary hashed only | 556254 |
| docs/screenshots/remaining-edge-notifications-dark-320.png | Binary hashed only | 65454 |
| docs/screenshots/remaining-edge-notifications-dark-390.png | Binary hashed only | 70342 |
| docs/screenshots/remaining-edge-notifications-light-1440.png | Binary hashed only | 560365 |
| docs/screenshots/remaining-edge-notifications-light-320.png | Binary hashed only | 66398 |
| docs/screenshots/remaining-edge-notifications-light-390.png | Binary hashed only | 72072 |
| docs/screenshots/remaining-edge-reflection-dark-1440.png | Binary hashed only | 537177 |
| docs/screenshots/remaining-edge-reflection-dark-320.png | Binary hashed only | 51576 |
| docs/screenshots/remaining-edge-reflection-dark-390.png | Binary hashed only | 56678 |
| docs/screenshots/remaining-edge-reflection-light-1440.png | Binary hashed only | 541025 |
| docs/screenshots/remaining-edge-reflection-light-320.png | Binary hashed only | 56079 |
| docs/screenshots/remaining-edge-reflection-light-390.png | Binary hashed only | 58698 |
| docs/screenshots/remaining-edge-rituals-dark-1440.png | Binary hashed only | 532478 |
| docs/screenshots/remaining-edge-rituals-dark-320.png | Binary hashed only | 48397 |
| docs/screenshots/remaining-edge-rituals-dark-390.png | Binary hashed only | 54188 |
| docs/screenshots/remaining-edge-rituals-light-1440.png | Binary hashed only | 537608 |
| docs/screenshots/remaining-edge-rituals-light-320.png | Binary hashed only | 52972 |
| docs/screenshots/remaining-edge-rituals-light-390.png | Binary hashed only | 56425 |
| docs/screenshots/remaining-edge-stats-dark-1440.png | Binary hashed only | 565340 |
| docs/screenshots/remaining-edge-stats-dark-320.png | Binary hashed only | 64212 |
| docs/screenshots/remaining-edge-stats-dark-390.png | Binary hashed only | 71216 |
| docs/screenshots/remaining-edge-stats-light-1440.png | Binary hashed only | 569943 |
| docs/screenshots/remaining-edge-stats-light-320.png | Binary hashed only | 66995 |
| docs/screenshots/remaining-edge-stats-light-390.png | Binary hashed only | 73738 |
| docs/screenshots/remaining-edge-suggestions-dark-1440.png | Binary hashed only | 539503 |
| docs/screenshots/remaining-edge-suggestions-dark-320.png | Binary hashed only | 58882 |
| docs/screenshots/remaining-edge-suggestions-dark-390.png | Binary hashed only | 65203 |
| docs/screenshots/remaining-edge-suggestions-light-1440.png | Binary hashed only | 544983 |
| docs/screenshots/remaining-edge-suggestions-light-320.png | Binary hashed only | 64257 |
| docs/screenshots/remaining-edge-suggestions-light-390.png | Binary hashed only | 67448 |
| docs/screenshots/remaining-edge-support-dark-1440.png | Binary hashed only | 541649 |
| docs/screenshots/remaining-edge-support-dark-320.png | Binary hashed only | 56272 |
| docs/screenshots/remaining-edge-support-dark-390.png | Binary hashed only | 62320 |
| docs/screenshots/remaining-edge-support-light-1440.png | Binary hashed only | 546571 |
| docs/screenshots/remaining-edge-support-light-320.png | Binary hashed only | 60828 |
| docs/screenshots/remaining-edge-support-light-390.png | Binary hashed only | 63938 |
| docs/screenshots/remaining-edge-websearch-dark-1440.png | Binary hashed only | 536955 |
| docs/screenshots/remaining-edge-websearch-dark-320.png | Binary hashed only | 52199 |
| docs/screenshots/remaining-edge-websearch-dark-390.png | Binary hashed only | 58327 |
| docs/screenshots/remaining-edge-websearch-light-1440.png | Binary hashed only | 541864 |
| docs/screenshots/remaining-edge-websearch-light-320.png | Binary hashed only | 57079 |
| docs/screenshots/remaining-edge-websearch-light-390.png | Binary hashed only | 60265 |
| docs/screenshots/settings-corner-1440.png | Binary hashed only | 1269267 |
| docs/screenshots/settings-corner-320.png | Binary hashed only | 259376 |
| docs/screenshots/settings-corner-390.png | Binary hashed only | 323832 |
| docs/screenshots/settings-page-320.png | Binary hashed only | 40933 |
| docs/screenshots/settings-page-390.png | Binary hashed only | 41123 |
| docs/screenshots/settings-page-desktop.png | Binary hashed only | 59735 |
| docs/screenshots/settings-page-focus.png | Binary hashed only | 65302 |
| docs/screenshots/settings-page-light.png | Binary hashed only | 59094 |
| docs/screenshots/settings-page-reminders.png | Binary hashed only | 47309 |
| docs/screenshots/stage2-chrome-dashboard.png | Binary hashed only | 276543 |
| docs/screenshots/stage2-chrome-mobile.png | Binary hashed only | 91713 |
| docs/screenshots/stage2-chrome-sounds.png | Binary hashed only | 183911 |
| docs/screenshots/stage2-chrome-stats.png | Binary hashed only | 184996 |
| docs/screenshots/stage2-chrome-timer.png | Binary hashed only | 180007 |
| docs/screenshots/stage3-chrome-dashboard.png | Binary hashed only | 270164 |
| docs/screenshots/stage3-chrome-flow.png | Binary hashed only | 54148 |
| docs/screenshots/stage3-chrome-mobile.png | Binary hashed only | 80326 |
| docs/screenshots/stage3-chrome-ritual.png | Binary hashed only | 190287 |
| docs/screenshots/stage3-chrome-scenes.png | Binary hashed only | 198518 |
| docs/screenshots/stage3-edge-dashboard.png | Binary hashed only | 270871 |
| docs/screenshots/stage3-edge-flow.png | Binary hashed only | 45701 |
| docs/screenshots/stage3-edge-mobile.png | Binary hashed only | 79996 |
| docs/screenshots/stage3-edge-ritual.png | Binary hashed only | 189334 |
| docs/screenshots/stage3-edge-scenes.png | Binary hashed only | 198403 |
| docs/screenshots/studio-chrome-1440.png | Binary hashed only | 154475 |
| docs/screenshots/studio-chrome-320.png | Binary hashed only | 51293 |
| docs/screenshots/studio-chrome-390.png | Binary hashed only | 54541 |
| docs/screenshots/studio-chrome-editor.png | Binary hashed only | 479489 |
| docs/screenshots/studio-chrome-failure.png | Binary hashed only | 48191 |
| docs/screenshots/studio-chrome-journal.png | Binary hashed only | 28815 |
| docs/screenshots/studio-edge-1440.png | Binary hashed only | 283698 |
| docs/screenshots/studio-edge-320.png | Binary hashed only | 102349 |
| docs/screenshots/studio-edge-390.png | Binary hashed only | 111609 |
| docs/screenshots/studio-edge-editor.png | Binary hashed only | 312707 |
| docs/screenshots/studio-edge-journal.png | Binary hashed only | 150335 |
| docs/screenshots/tasks-panel.png | Binary hashed only | 160052 |
| docs/screenshots/tools-page.png | Binary hashed only | 214050 |
| docs/screenshots/unification-after-chrome/afterglow-dark-1440.png | Binary hashed only | 448757 |
| docs/screenshots/unification-after-chrome/afterglow-dark-320.png | Binary hashed only | 47439 |
| docs/screenshots/unification-after-chrome/afterglow-dark-390.png | Binary hashed only | 48710 |
| docs/screenshots/unification-after-chrome/afterglow-dark-720.png | Binary hashed only | 63178 |
| docs/screenshots/unification-after-chrome/afterglow-light-1440.png | Binary hashed only | 449169 |
| docs/screenshots/unification-after-chrome/afterglow-light-320.png | Binary hashed only | 47573 |
| docs/screenshots/unification-after-chrome/afterglow-light-390.png | Binary hashed only | 48803 |
| docs/screenshots/unification-after-chrome/afterglow-light-720.png | Binary hashed only | 63793 |
| docs/screenshots/unification-after-chrome/blocker-dark-1440.png | Binary hashed only | 54511 |
| docs/screenshots/unification-after-chrome/blocker-dark-320.png | Binary hashed only | 34146 |
| docs/screenshots/unification-after-chrome/blocker-dark-390.png | Binary hashed only | 34399 |
| docs/screenshots/unification-after-chrome/blocker-dark-720.png | Binary hashed only | 20276 |
| docs/screenshots/unification-after-chrome/blocker-light-1440.png | Binary hashed only | 54859 |
| docs/screenshots/unification-after-chrome/blocker-light-320.png | Binary hashed only | 34133 |
| docs/screenshots/unification-after-chrome/blocker-light-390.png | Binary hashed only | 34579 |
| docs/screenshots/unification-after-chrome/blocker-light-720.png | Binary hashed only | 20416 |
| docs/screenshots/unification-after-chrome/capsules-dark-1440.png | Binary hashed only | 456787 |
| docs/screenshots/unification-after-chrome/capsules-dark-320.png | Binary hashed only | 54477 |
| docs/screenshots/unification-after-chrome/capsules-dark-390.png | Binary hashed only | 57689 |
| docs/screenshots/unification-after-chrome/capsules-dark-720.png | Binary hashed only | 63959 |
| docs/screenshots/unification-after-chrome/capsules-light-1440.png | Binary hashed only | 457449 |
| docs/screenshots/unification-after-chrome/capsules-light-320.png | Binary hashed only | 54717 |
| docs/screenshots/unification-after-chrome/capsules-light-390.png | Binary hashed only | 57975 |
| docs/screenshots/unification-after-chrome/capsules-light-720.png | Binary hashed only | 64635 |
| docs/screenshots/unification-after-chrome/career-dark-1440.png | Binary hashed only | 453331 |
| docs/screenshots/unification-after-chrome/career-dark-320.png | Binary hashed only | 53174 |
| docs/screenshots/unification-after-chrome/career-dark-390.png | Binary hashed only | 54547 |
| docs/screenshots/unification-after-chrome/career-dark-720.png | Binary hashed only | 63059 |
| docs/screenshots/unification-after-chrome/career-light-1440.png | Binary hashed only | 453553 |
| docs/screenshots/unification-after-chrome/career-light-320.png | Binary hashed only | 53195 |
| docs/screenshots/unification-after-chrome/career-light-390.png | Binary hashed only | 54554 |
| docs/screenshots/unification-after-chrome/career-light-720.png | Binary hashed only | 63580 |
| docs/screenshots/unification-after-chrome/commands-dark-1440.png | Binary hashed only | 453933 |
| docs/screenshots/unification-after-chrome/commands-dark-320.png | Binary hashed only | 51259 |
| docs/screenshots/unification-after-chrome/commands-dark-390.png | Binary hashed only | 52721 |
| docs/screenshots/unification-after-chrome/commands-dark-720.png | Binary hashed only | 64837 |
| docs/screenshots/unification-after-chrome/commands-light-1440.png | Binary hashed only | 453296 |
| docs/screenshots/unification-after-chrome/commands-light-320.png | Binary hashed only | 51065 |
| docs/screenshots/unification-after-chrome/commands-light-390.png | Binary hashed only | 52547 |
| docs/screenshots/unification-after-chrome/commands-light-720.png | Binary hashed only | 65179 |
| docs/screenshots/unification-after-chrome/compiler-dark-1440.png | Binary hashed only | 447218 |
| docs/screenshots/unification-after-chrome/compiler-dark-320.png | Binary hashed only | 47808 |
| docs/screenshots/unification-after-chrome/compiler-dark-390.png | Binary hashed only | 47953 |
| docs/screenshots/unification-after-chrome/compiler-dark-720.png | Binary hashed only | 64927 |
| docs/screenshots/unification-after-chrome/compiler-light-1440.png | Binary hashed only | 448039 |
| docs/screenshots/unification-after-chrome/compiler-light-320.png | Binary hashed only | 47335 |
| docs/screenshots/unification-after-chrome/compiler-light-390.png | Binary hashed only | 48075 |
| docs/screenshots/unification-after-chrome/compiler-light-720.png | Binary hashed only | 65510 |
| docs/screenshots/unification-after-chrome/countdowns-dark-1440.png | Binary hashed only | 439108 |
| docs/screenshots/unification-after-chrome/countdowns-dark-320.png | Binary hashed only | 38378 |
| docs/screenshots/unification-after-chrome/countdowns-dark-390.png | Binary hashed only | 39813 |
| docs/screenshots/unification-after-chrome/countdowns-dark-720.png | Binary hashed only | 60965 |
| docs/screenshots/unification-after-chrome/countdowns-light-1440.png | Binary hashed only | 439835 |
| docs/screenshots/unification-after-chrome/countdowns-light-320.png | Binary hashed only | 38620 |
| docs/screenshots/unification-after-chrome/countdowns-light-390.png | Binary hashed only | 40039 |
| docs/screenshots/unification-after-chrome/countdowns-light-720.png | Binary hashed only | 61557 |
| docs/screenshots/unification-after-chrome/customizer-dark-1440.png | Binary hashed only | 837803 |
| docs/screenshots/unification-after-chrome/customizer-dark-320.png | Binary hashed only | 151158 |
| docs/screenshots/unification-after-chrome/customizer-dark-390.png | Binary hashed only | 170712 |
| docs/screenshots/unification-after-chrome/customizer-dark-720.png | Binary hashed only | 174301 |
| docs/screenshots/unification-after-chrome/customizer-light-1440.png | Binary hashed only | 840176 |
| docs/screenshots/unification-after-chrome/customizer-light-320.png | Binary hashed only | 151513 |
| docs/screenshots/unification-after-chrome/customizer-light-390.png | Binary hashed only | 170779 |
| docs/screenshots/unification-after-chrome/customizer-light-720.png | Binary hashed only | 173908 |
| docs/screenshots/unification-after-chrome/dictionary-dark-1440.png | Binary hashed only | 442277 |
| docs/screenshots/unification-after-chrome/dictionary-dark-320.png | Binary hashed only | 42341 |
| docs/screenshots/unification-after-chrome/dictionary-dark-390.png | Binary hashed only | 43544 |
| docs/screenshots/unification-after-chrome/dictionary-dark-720.png | Binary hashed only | 61906 |
| docs/screenshots/unification-after-chrome/dictionary-light-1440.png | Binary hashed only | 442792 |
| docs/screenshots/unification-after-chrome/dictionary-light-320.png | Binary hashed only | 42479 |
| docs/screenshots/unification-after-chrome/dictionary-light-390.png | Binary hashed only | 43627 |
| docs/screenshots/unification-after-chrome/dictionary-light-720.png | Binary hashed only | 62405 |
| docs/screenshots/unification-after-chrome/dna-dark-1440.png | Binary hashed only | 444540 |
| docs/screenshots/unification-after-chrome/dna-dark-320.png | Binary hashed only | 45074 |
| docs/screenshots/unification-after-chrome/dna-dark-390.png | Binary hashed only | 45992 |
| docs/screenshots/unification-after-chrome/dna-dark-720.png | Binary hashed only | 65901 |
| docs/screenshots/unification-after-chrome/dna-light-1440.png | Binary hashed only | 444423 |
| docs/screenshots/unification-after-chrome/dna-light-320.png | Binary hashed only | 45118 |
| docs/screenshots/unification-after-chrome/dna-light-390.png | Binary hashed only | 46009 |
| docs/screenshots/unification-after-chrome/dna-light-720.png | Binary hashed only | 66489 |
| docs/screenshots/unification-after-chrome/energy-dark-1440.png | Binary hashed only | 454863 |
| docs/screenshots/unification-after-chrome/energy-dark-320.png | Binary hashed only | 54256 |
| docs/screenshots/unification-after-chrome/energy-dark-390.png | Binary hashed only | 55439 |
| docs/screenshots/unification-after-chrome/energy-dark-720.png | Binary hashed only | 67054 |
| docs/screenshots/unification-after-chrome/energy-light-1440.png | Binary hashed only | 454751 |
| docs/screenshots/unification-after-chrome/energy-light-320.png | Binary hashed only | 54020 |
| docs/screenshots/unification-after-chrome/energy-light-390.png | Binary hashed only | 55296 |
| docs/screenshots/unification-after-chrome/energy-light-720.png | Binary hashed only | 67454 |
| docs/screenshots/unification-after-chrome/energyweather-dark-1440.png | Binary hashed only | 457551 |
| docs/screenshots/unification-after-chrome/energyweather-dark-320.png | Binary hashed only | 55234 |
| docs/screenshots/unification-after-chrome/energyweather-dark-390.png | Binary hashed only | 56406 |
| docs/screenshots/unification-after-chrome/energyweather-dark-720.png | Binary hashed only | 67051 |
| docs/screenshots/unification-after-chrome/energyweather-light-1440.png | Binary hashed only | 457748 |
| docs/screenshots/unification-after-chrome/energyweather-light-320.png | Binary hashed only | 55371 |
| docs/screenshots/unification-after-chrome/energyweather-light-390.png | Binary hashed only | 56493 |
| docs/screenshots/unification-after-chrome/energyweather-light-720.png | Binary hashed only | 67470 |
| docs/screenshots/unification-after-chrome/firststep-dark-1440.png | Binary hashed only | 451733 |
| docs/screenshots/unification-after-chrome/firststep-dark-320.png | Binary hashed only | 49966 |
| docs/screenshots/unification-after-chrome/firststep-dark-390.png | Binary hashed only | 50730 |
| docs/screenshots/unification-after-chrome/firststep-dark-720.png | Binary hashed only | 66218 |
| docs/screenshots/unification-after-chrome/firststep-light-1440.png | Binary hashed only | 451554 |
| docs/screenshots/unification-after-chrome/firststep-light-320.png | Binary hashed only | 49771 |
| docs/screenshots/unification-after-chrome/firststep-light-390.png | Binary hashed only | 50605 |
| docs/screenshots/unification-after-chrome/firststep-light-720.png | Binary hashed only | 66501 |
| docs/screenshots/unification-after-chrome/garden-dark-1440.png | Binary hashed only | 449499 |
| docs/screenshots/unification-after-chrome/garden-dark-320.png | Binary hashed only | 49202 |
| docs/screenshots/unification-after-chrome/garden-dark-390.png | Binary hashed only | 50240 |
| docs/screenshots/unification-after-chrome/garden-dark-720.png | Binary hashed only | 61912 |
| docs/screenshots/unification-after-chrome/garden-light-1440.png | Binary hashed only | 450092 |
| docs/screenshots/unification-after-chrome/garden-light-320.png | Binary hashed only | 49443 |
| docs/screenshots/unification-after-chrome/garden-light-390.png | Binary hashed only | 50500 |
| docs/screenshots/unification-after-chrome/garden-light-720.png | Binary hashed only | 62616 |
| docs/screenshots/unification-after-chrome/home-dark-1440.png | Binary hashed only | 1187418 |
| docs/screenshots/unification-after-chrome/home-dark-320.png | Binary hashed only | 168883 |
| docs/screenshots/unification-after-chrome/home-dark-390.png | Binary hashed only | 199128 |
| docs/screenshots/unification-after-chrome/home-dark-720.png | Binary hashed only | 363797 |
| docs/screenshots/unification-after-chrome/home-light-1440.png | Binary hashed only | 1188242 |
| docs/screenshots/unification-after-chrome/home-light-320.png | Binary hashed only | 169553 |
| docs/screenshots/unification-after-chrome/home-light-390.png | Binary hashed only | 200092 |
| docs/screenshots/unification-after-chrome/home-light-720.png | Binary hashed only | 363970 |
| docs/screenshots/unification-after-chrome/journal-dark-1440.png | Binary hashed only | 33802 |
| docs/screenshots/unification-after-chrome/journal-dark-320.png | Binary hashed only | 19147 |
| docs/screenshots/unification-after-chrome/journal-dark-390.png | Binary hashed only | 22321 |
| docs/screenshots/unification-after-chrome/journal-dark-720.png | Binary hashed only | 19583 |
| docs/screenshots/unification-after-chrome/journal-light-1440.png | Binary hashed only | 33781 |
| docs/screenshots/unification-after-chrome/journal-light-320.png | Binary hashed only | 20287 |
| docs/screenshots/unification-after-chrome/journal-light-390.png | Binary hashed only | 23617 |
| docs/screenshots/unification-after-chrome/journal-light-720.png | Binary hashed only | 19753 |
| docs/screenshots/unification-after-chrome/layout-dark-1440.png | Binary hashed only | 840900 |
| docs/screenshots/unification-after-chrome/layout-dark-320.png | Binary hashed only | 135600 |
| docs/screenshots/unification-after-chrome/layout-dark-390.png | Binary hashed only | 150723 |
| docs/screenshots/unification-after-chrome/layout-dark-720.png | Binary hashed only | 164868 |
| docs/screenshots/unification-after-chrome/layout-light-1440.png | Binary hashed only | 840094 |
| docs/screenshots/unification-after-chrome/layout-light-320.png | Binary hashed only | 135645 |
| docs/screenshots/unification-after-chrome/layout-light-390.png | Binary hashed only | 150794 |
| docs/screenshots/unification-after-chrome/layout-light-720.png | Binary hashed only | 164722 |
| docs/screenshots/unification-after-chrome/links-dark-1440.png | Binary hashed only | 441767 |
| docs/screenshots/unification-after-chrome/links-dark-320.png | Binary hashed only | 41354 |
| docs/screenshots/unification-after-chrome/links-dark-390.png | Binary hashed only | 42645 |
| docs/screenshots/unification-after-chrome/links-dark-720.png | Binary hashed only | 60862 |
| docs/screenshots/unification-after-chrome/links-light-1440.png | Binary hashed only | 441656 |
| docs/screenshots/unification-after-chrome/links-light-320.png | Binary hashed only | 41666 |
| docs/screenshots/unification-after-chrome/links-light-390.png | Binary hashed only | 42689 |
| docs/screenshots/unification-after-chrome/links-light-720.png | Binary hashed only | 61318 |
| docs/screenshots/unification-after-chrome/mood-dark-1440.png | Binary hashed only | 453256 |
| docs/screenshots/unification-after-chrome/mood-dark-320.png | Binary hashed only | 53804 |
| docs/screenshots/unification-after-chrome/mood-dark-390.png | Binary hashed only | 54936 |
| docs/screenshots/unification-after-chrome/mood-dark-720.png | Binary hashed only | 67505 |
| docs/screenshots/unification-after-chrome/mood-light-1440.png | Binary hashed only | 454009 |
| docs/screenshots/unification-after-chrome/mood-light-320.png | Binary hashed only | 54068 |
| docs/screenshots/unification-after-chrome/mood-light-390.png | Binary hashed only | 55412 |
| docs/screenshots/unification-after-chrome/mood-light-720.png | Binary hashed only | 67789 |
| docs/screenshots/unification-after-chrome/music-dark-1440.png | Binary hashed only | 456112 |
| docs/screenshots/unification-after-chrome/music-dark-320.png | Binary hashed only | 54004 |
| docs/screenshots/unification-after-chrome/music-dark-390.png | Binary hashed only | 55406 |
| docs/screenshots/unification-after-chrome/music-dark-720.png | Binary hashed only | 67140 |
| docs/screenshots/unification-after-chrome/music-light-1440.png | Binary hashed only | 455707 |
| docs/screenshots/unification-after-chrome/music-light-320.png | Binary hashed only | 54157 |
| docs/screenshots/unification-after-chrome/music-light-390.png | Binary hashed only | 55514 |
| docs/screenshots/unification-after-chrome/music-light-720.png | Binary hashed only | 67700 |
| docs/screenshots/unification-after-chrome/notes-dark-1440.png | Binary hashed only | 48745 |
| docs/screenshots/unification-after-chrome/notes-dark-320.png | Binary hashed only | 28922 |
| docs/screenshots/unification-after-chrome/notes-dark-390.png | Binary hashed only | 31200 |
| docs/screenshots/unification-after-chrome/notes-dark-720.png | Binary hashed only | 41575 |
| docs/screenshots/unification-after-chrome/notes-light-1440.png | Binary hashed only | 48745 |
| docs/screenshots/unification-after-chrome/notes-light-320.png | Binary hashed only | 28922 |
| docs/screenshots/unification-after-chrome/notes-light-390.png | Binary hashed only | 31200 |
| docs/screenshots/unification-after-chrome/notes-light-720.png | Binary hashed only | 41575 |
| docs/screenshots/unification-after-chrome/notifications-dark-1440.png | Binary hashed only | 459119 |
| docs/screenshots/unification-after-chrome/notifications-dark-320.png | Binary hashed only | 55095 |
| docs/screenshots/unification-after-chrome/notifications-dark-390.png | Binary hashed only | 56090 |
| docs/screenshots/unification-after-chrome/notifications-dark-720.png | Binary hashed only | 68854 |
| docs/screenshots/unification-after-chrome/notifications-light-1440.png | Binary hashed only | 459911 |
| docs/screenshots/unification-after-chrome/notifications-light-320.png | Binary hashed only | 55510 |
| docs/screenshots/unification-after-chrome/notifications-light-390.png | Binary hashed only | 56465 |
| docs/screenshots/unification-after-chrome/notifications-light-720.png | Binary hashed only | 69478 |
| docs/screenshots/unification-after-chrome/proof-dark-1440.png | Binary hashed only | 449654 |
| docs/screenshots/unification-after-chrome/proof-dark-320.png | Binary hashed only | 48639 |
| docs/screenshots/unification-after-chrome/proof-dark-390.png | Binary hashed only | 49604 |
| docs/screenshots/unification-after-chrome/proof-dark-720.png | Binary hashed only | 63149 |
| docs/screenshots/unification-after-chrome/proof-light-1440.png | Binary hashed only | 450468 |
| docs/screenshots/unification-after-chrome/proof-light-320.png | Binary hashed only | 48898 |
| docs/screenshots/unification-after-chrome/proof-light-390.png | Binary hashed only | 49757 |
| docs/screenshots/unification-after-chrome/proof-light-720.png | Binary hashed only | 63715 |
| docs/screenshots/unification-after-chrome/queue-dark-1440.png | Binary hashed only | 453776 |
| docs/screenshots/unification-after-chrome/queue-dark-320.png | Binary hashed only | 54747 |
| docs/screenshots/unification-after-chrome/queue-dark-390.png | Binary hashed only | 56307 |
| docs/screenshots/unification-after-chrome/queue-dark-720.png | Binary hashed only | 68413 |
| docs/screenshots/unification-after-chrome/queue-light-1440.png | Binary hashed only | 454180 |
| docs/screenshots/unification-after-chrome/queue-light-320.png | Binary hashed only | 54760 |
| docs/screenshots/unification-after-chrome/queue-light-390.png | Binary hashed only | 56457 |
| docs/screenshots/unification-after-chrome/queue-light-720.png | Binary hashed only | 68897 |
| docs/screenshots/unification-after-chrome/quietweb-dark-1440.png | Binary hashed only | 443314 |
| docs/screenshots/unification-after-chrome/quietweb-dark-320.png | Binary hashed only | 43671 |
| docs/screenshots/unification-after-chrome/quietweb-dark-390.png | Binary hashed only | 44901 |
| docs/screenshots/unification-after-chrome/quietweb-dark-720.png | Binary hashed only | 62567 |
| docs/screenshots/unification-after-chrome/quietweb-light-1440.png | Binary hashed only | 443269 |
| docs/screenshots/unification-after-chrome/quietweb-light-320.png | Binary hashed only | 43785 |
| docs/screenshots/unification-after-chrome/quietweb-light-390.png | Binary hashed only | 44879 |
| docs/screenshots/unification-after-chrome/quietweb-light-720.png | Binary hashed only | 63089 |
| docs/screenshots/unification-after-chrome/recall-dark-1440.png | Binary hashed only | 450526 |
| docs/screenshots/unification-after-chrome/recall-dark-320.png | Binary hashed only | 49204 |
| docs/screenshots/unification-after-chrome/recall-dark-390.png | Binary hashed only | 50455 |
| docs/screenshots/unification-after-chrome/recall-dark-720.png | Binary hashed only | 63062 |
| docs/screenshots/unification-after-chrome/recall-light-1440.png | Binary hashed only | 450840 |
| docs/screenshots/unification-after-chrome/recall-light-320.png | Binary hashed only | 49330 |
| docs/screenshots/unification-after-chrome/recall-light-390.png | Binary hashed only | 50472 |
| docs/screenshots/unification-after-chrome/recall-light-720.png | Binary hashed only | 63463 |
| docs/screenshots/unification-after-chrome/recovery-dark-1440.png | Binary hashed only | 459587 |
| docs/screenshots/unification-after-chrome/recovery-dark-320.png | Binary hashed only | 56719 |
| docs/screenshots/unification-after-chrome/recovery-dark-390.png | Binary hashed only | 58174 |
| docs/screenshots/unification-after-chrome/recovery-dark-720.png | Binary hashed only | 63815 |
| docs/screenshots/unification-after-chrome/recovery-light-1440.png | Binary hashed only | 459684 |
| docs/screenshots/unification-after-chrome/recovery-light-320.png | Binary hashed only | 56601 |
| docs/screenshots/unification-after-chrome/recovery-light-390.png | Binary hashed only | 57891 |
| docs/screenshots/unification-after-chrome/recovery-light-720.png | Binary hashed only | 64155 |
| docs/screenshots/unification-after-chrome/reflection-dark-1440.png | Binary hashed only | 434480 |
| docs/screenshots/unification-after-chrome/reflection-dark-320.png | Binary hashed only | 36204 |
| docs/screenshots/unification-after-chrome/reflection-dark-390.png | Binary hashed only | 36821 |
| docs/screenshots/unification-after-chrome/reflection-dark-720.png | Binary hashed only | 57935 |
| docs/screenshots/unification-after-chrome/reflection-light-1440.png | Binary hashed only | 434377 |
| docs/screenshots/unification-after-chrome/reflection-light-320.png | Binary hashed only | 36410 |
| docs/screenshots/unification-after-chrome/reflection-light-390.png | Binary hashed only | 36923 |
| docs/screenshots/unification-after-chrome/reflection-light-720.png | Binary hashed only | 58337 |
| docs/screenshots/unification-after-chrome/rituals-dark-1440.png | Binary hashed only | 447559 |
| docs/screenshots/unification-after-chrome/rituals-dark-320.png | Binary hashed only | 47450 |
| docs/screenshots/unification-after-chrome/rituals-dark-390.png | Binary hashed only | 48866 |
| docs/screenshots/unification-after-chrome/rituals-dark-720.png | Binary hashed only | 62217 |
| docs/screenshots/unification-after-chrome/rituals-light-1440.png | Binary hashed only | 448436 |
| docs/screenshots/unification-after-chrome/rituals-light-320.png | Binary hashed only | 47342 |
| docs/screenshots/unification-after-chrome/rituals-light-390.png | Binary hashed only | 48881 |
| docs/screenshots/unification-after-chrome/rituals-light-720.png | Binary hashed only | 62766 |
| docs/screenshots/unification-after-chrome/scenes-dark-1440.png | Binary hashed only | 534869 |
| docs/screenshots/unification-after-chrome/scenes-dark-320.png | Binary hashed only | 64455 |
| docs/screenshots/unification-after-chrome/scenes-dark-390.png | Binary hashed only | 69062 |
| docs/screenshots/unification-after-chrome/scenes-dark-720.png | Binary hashed only | 65248 |
| docs/screenshots/unification-after-chrome/scenes-light-1440.png | Binary hashed only | 535050 |
| docs/screenshots/unification-after-chrome/scenes-light-320.png | Binary hashed only | 64428 |
| docs/screenshots/unification-after-chrome/scenes-light-390.png | Binary hashed only | 68749 |
| docs/screenshots/unification-after-chrome/scenes-light-720.png | Binary hashed only | 65863 |
| docs/screenshots/unification-after-chrome/settings-dark-1440.png | Binary hashed only | 58016 |
| docs/screenshots/unification-after-chrome/settings-dark-320.png | Binary hashed only | 34557 |
| docs/screenshots/unification-after-chrome/settings-dark-390.png | Binary hashed only | 34880 |
| docs/screenshots/unification-after-chrome/settings-dark-720.png | Binary hashed only | 22276 |
| docs/screenshots/unification-after-chrome/settings-light-1440.png | Binary hashed only | 57940 |
| docs/screenshots/unification-after-chrome/settings-light-320.png | Binary hashed only | 34479 |
| docs/screenshots/unification-after-chrome/settings-light-390.png | Binary hashed only | 34839 |
| docs/screenshots/unification-after-chrome/settings-light-720.png | Binary hashed only | 22224 |
| docs/screenshots/unification-after-chrome/skills-dark-1440.png | Binary hashed only | 446808 |
| docs/screenshots/unification-after-chrome/skills-dark-320.png | Binary hashed only | 46581 |
| docs/screenshots/unification-after-chrome/skills-dark-390.png | Binary hashed only | 47704 |
| docs/screenshots/unification-after-chrome/skills-dark-720.png | Binary hashed only | 61592 |
| docs/screenshots/unification-after-chrome/skills-light-1440.png | Binary hashed only | 447101 |
| docs/screenshots/unification-after-chrome/skills-light-320.png | Binary hashed only | 46601 |
| docs/screenshots/unification-after-chrome/skills-light-390.png | Binary hashed only | 47864 |
| docs/screenshots/unification-after-chrome/skills-light-720.png | Binary hashed only | 62131 |
| docs/screenshots/unification-after-chrome/sounds-dark-1440.png | Binary hashed only | 456469 |
| docs/screenshots/unification-after-chrome/sounds-dark-320.png | Binary hashed only | 51602 |
| docs/screenshots/unification-after-chrome/sounds-dark-390.png | Binary hashed only | 53182 |
| docs/screenshots/unification-after-chrome/sounds-dark-720.png | Binary hashed only | 63898 |
| docs/screenshots/unification-after-chrome/sounds-light-1440.png | Binary hashed only | 455807 |
| docs/screenshots/unification-after-chrome/sounds-light-320.png | Binary hashed only | 51597 |
| docs/screenshots/unification-after-chrome/sounds-light-390.png | Binary hashed only | 52956 |
| docs/screenshots/unification-after-chrome/sounds-light-720.png | Binary hashed only | 64381 |
| docs/screenshots/unification-after-chrome/stats-dark-1440.png | Binary hashed only | 476039 |
| docs/screenshots/unification-after-chrome/stats-dark-320.png | Binary hashed only | 57432 |
| docs/screenshots/unification-after-chrome/stats-dark-390.png | Binary hashed only | 61161 |
| docs/screenshots/unification-after-chrome/stats-dark-720.png | Binary hashed only | 66856 |
| docs/screenshots/unification-after-chrome/stats-light-1440.png | Binary hashed only | 476348 |
| docs/screenshots/unification-after-chrome/stats-light-320.png | Binary hashed only | 57603 |
| docs/screenshots/unification-after-chrome/stats-light-390.png | Binary hashed only | 61152 |
| docs/screenshots/unification-after-chrome/stats-light-720.png | Binary hashed only | 67414 |
| docs/screenshots/unification-after-chrome/suggestions-dark-1440.png | Binary hashed only | 447418 |
| docs/screenshots/unification-after-chrome/suggestions-dark-320.png | Binary hashed only | 50278 |
| docs/screenshots/unification-after-chrome/suggestions-dark-390.png | Binary hashed only | 51630 |
| docs/screenshots/unification-after-chrome/suggestions-dark-720.png | Binary hashed only | 70769 |
| docs/screenshots/unification-after-chrome/suggestions-light-1440.png | Binary hashed only | 447742 |
| docs/screenshots/unification-after-chrome/suggestions-light-320.png | Binary hashed only | 50451 |
| docs/screenshots/unification-after-chrome/suggestions-light-390.png | Binary hashed only | 51836 |
| docs/screenshots/unification-after-chrome/suggestions-light-720.png | Binary hashed only | 71187 |
| docs/screenshots/unification-after-chrome/support-dark-1440.png | Binary hashed only | 468303 |
| docs/screenshots/unification-after-chrome/support-dark-320.png | Binary hashed only | 60382 |
| docs/screenshots/unification-after-chrome/support-dark-390.png | Binary hashed only | 63070 |
| docs/screenshots/unification-after-chrome/support-dark-720.png | Binary hashed only | 72040 |
| docs/screenshots/unification-after-chrome/support-light-1440.png | Binary hashed only | 468177 |
| docs/screenshots/unification-after-chrome/support-light-320.png | Binary hashed only | 60471 |
| docs/screenshots/unification-after-chrome/support-light-390.png | Binary hashed only | 63128 |
| docs/screenshots/unification-after-chrome/support-light-720.png | Binary hashed only | 72566 |
| docs/screenshots/unification-after-chrome/tools-dark-1440.png | Binary hashed only | 474190 |
| docs/screenshots/unification-after-chrome/tools-dark-320.png | Binary hashed only | 54851 |
| docs/screenshots/unification-after-chrome/tools-dark-390.png | Binary hashed only | 59087 |
| docs/screenshots/unification-after-chrome/tools-dark-720.png | Binary hashed only | 64412 |
| docs/screenshots/unification-after-chrome/tools-light-1440.png | Binary hashed only | 474387 |
| docs/screenshots/unification-after-chrome/tools-light-320.png | Binary hashed only | 55190 |
| docs/screenshots/unification-after-chrome/tools-light-390.png | Binary hashed only | 59360 |
| docs/screenshots/unification-after-chrome/tools-light-720.png | Binary hashed only | 64881 |
| docs/screenshots/unification-after-chrome/weather-dark-1440.png | Binary hashed only | 444493 |
| docs/screenshots/unification-after-chrome/weather-dark-320.png | Binary hashed only | 45164 |
| docs/screenshots/unification-after-chrome/weather-dark-390.png | Binary hashed only | 46150 |
| docs/screenshots/unification-after-chrome/weather-dark-720.png | Binary hashed only | 63810 |
| docs/screenshots/unification-after-chrome/weather-light-1440.png | Binary hashed only | 444664 |
| docs/screenshots/unification-after-chrome/weather-light-320.png | Binary hashed only | 45210 |
| docs/screenshots/unification-after-chrome/weather-light-390.png | Binary hashed only | 46032 |
| docs/screenshots/unification-after-chrome/weather-light-720.png | Binary hashed only | 64269 |
| docs/screenshots/unification-after-chrome/websearch-dark-1440.png | Binary hashed only | 446047 |
| docs/screenshots/unification-after-chrome/websearch-dark-320.png | Binary hashed only | 45870 |
| docs/screenshots/unification-after-chrome/websearch-dark-390.png | Binary hashed only | 47160 |
| docs/screenshots/unification-after-chrome/websearch-dark-720.png | Binary hashed only | 66689 |
| docs/screenshots/unification-after-chrome/websearch-light-1440.png | Binary hashed only | 446188 |
| docs/screenshots/unification-after-chrome/websearch-light-320.png | Binary hashed only | 45794 |
| docs/screenshots/unification-after-chrome/websearch-light-390.png | Binary hashed only | 47120 |
| docs/screenshots/unification-after-chrome/websearch-light-720.png | Binary hashed only | 67071 |
| docs/screenshots/unification-before-chrome/afterglow-dark-1440.png | Binary hashed only | 552591 |
| docs/screenshots/unification-before-chrome/afterglow-light-1440.png | Binary hashed only | 337153 |
| docs/screenshots/unification-before-chrome/blocker-dark-1440.png | Binary hashed only | 53824 |
| docs/screenshots/unification-before-chrome/blocker-light-1440.png | Binary hashed only | 90904 |
| docs/screenshots/unification-before-chrome/capsules-dark-1440.png | Binary hashed only | 562461 |
| docs/screenshots/unification-before-chrome/capsules-light-1440.png | Binary hashed only | 344612 |
| docs/screenshots/unification-before-chrome/career-dark-1440.png | Binary hashed only | 559034 |
| docs/screenshots/unification-before-chrome/career-light-1440.png | Binary hashed only | 343126 |
| docs/screenshots/unification-before-chrome/commands-dark-1440.png | Binary hashed only | 347563 |
| docs/screenshots/unification-before-chrome/commands-light-1440.png | Binary hashed only | 349350 |
| docs/screenshots/unification-before-chrome/compiler-dark-1440.png | Binary hashed only | 552212 |
| docs/screenshots/unification-before-chrome/compiler-light-1440.png | Binary hashed only | 336300 |
| docs/screenshots/unification-before-chrome/countdowns-dark-1440.png | Binary hashed only | 541738 |
| docs/screenshots/unification-before-chrome/countdowns-light-1440.png | Binary hashed only | 545526 |
| docs/screenshots/unification-before-chrome/customizer-dark-1440.png | Binary hashed only | 924581 |
| docs/screenshots/unification-before-chrome/customizer-light-1440.png | Binary hashed only | 933229 |
| docs/screenshots/unification-before-chrome/dictionary-dark-1440.png | Binary hashed only | 545476 |
| docs/screenshots/unification-before-chrome/dictionary-light-1440.png | Binary hashed only | 329166 |
| docs/screenshots/unification-before-chrome/dna-dark-1440.png | Binary hashed only | 547399 |
| docs/screenshots/unification-before-chrome/dna-light-1440.png | Binary hashed only | 333552 |
| docs/screenshots/unification-before-chrome/energy-dark-1440.png | Binary hashed only | 559231 |
| docs/screenshots/unification-before-chrome/energy-light-1440.png | Binary hashed only | 345577 |
| docs/screenshots/unification-before-chrome/energyweather-dark-1440.png | Binary hashed only | 562788 |
| docs/screenshots/unification-before-chrome/energyweather-light-1440.png | Binary hashed only | 347114 |
| docs/screenshots/unification-before-chrome/firststep-dark-1440.png | Binary hashed only | 555632 |
| docs/screenshots/unification-before-chrome/firststep-light-1440.png | Binary hashed only | 338568 |
| docs/screenshots/unification-before-chrome/garden-dark-1440.png | Binary hashed only | 553216 |
| docs/screenshots/unification-before-chrome/garden-light-1440.png | Binary hashed only | 337407 |
| docs/screenshots/unification-before-chrome/home-dark-1440.png | Binary hashed only | 1270354 |
| docs/screenshots/unification-before-chrome/home-light-1440.png | Binary hashed only | 932871 |
| docs/screenshots/unification-before-chrome/journal-dark-1440.png | Binary hashed only | 34600 |
| docs/screenshots/unification-before-chrome/journal-light-1440.png | Binary hashed only | 34600 |
| docs/screenshots/unification-before-chrome/layout-dark-1440.png | Binary hashed only | 927518 |
| docs/screenshots/unification-before-chrome/layout-light-1440.png | Binary hashed only | 934667 |
| docs/screenshots/unification-before-chrome/links-dark-1440.png | Binary hashed only | 544630 |
| docs/screenshots/unification-before-chrome/links-light-1440.png | Binary hashed only | 547693 |
| docs/screenshots/unification-before-chrome/mood-dark-1440.png | Binary hashed only | 339990 |
| docs/screenshots/unification-before-chrome/mood-light-1440.png | Binary hashed only | 343023 |
| docs/screenshots/unification-before-chrome/music-dark-1440.png | Binary hashed only | 560522 |
| docs/screenshots/unification-before-chrome/music-light-1440.png | Binary hashed only | 345601 |
| docs/screenshots/unification-before-chrome/notes-dark-1440.png | Binary hashed only | 45030 |
| docs/screenshots/unification-before-chrome/notes-light-1440.png | Binary hashed only | 45030 |
| docs/screenshots/unification-before-chrome/notifications-dark-1440.png | Binary hashed only | 564052 |
| docs/screenshots/unification-before-chrome/notifications-light-1440.png | Binary hashed only | 348193 |
| docs/screenshots/unification-before-chrome/proof-dark-1440.png | Binary hashed only | 553966 |
| docs/screenshots/unification-before-chrome/proof-light-1440.png | Binary hashed only | 337521 |
| docs/screenshots/unification-before-chrome/queue-dark-1440.png | Binary hashed only | 557663 |
| docs/screenshots/unification-before-chrome/queue-light-1440.png | Binary hashed only | 344162 |
| docs/screenshots/unification-before-chrome/quietweb-dark-1440.png | Binary hashed only | 546420 |
| docs/screenshots/unification-before-chrome/quietweb-light-1440.png | Binary hashed only | 332306 |
| docs/screenshots/unification-before-chrome/recall-dark-1440.png | Binary hashed only | 555459 |
| docs/screenshots/unification-before-chrome/recall-light-1440.png | Binary hashed only | 337949 |
| docs/screenshots/unification-before-chrome/recovery-dark-1440.png | Binary hashed only | 564285 |
| docs/screenshots/unification-before-chrome/recovery-light-1440.png | Binary hashed only | 348450 |
| docs/screenshots/unification-before-chrome/reflection-dark-1440.png | Binary hashed only | 316616 |
| docs/screenshots/unification-before-chrome/reflection-light-1440.png | Binary hashed only | 319806 |
| docs/screenshots/unification-before-chrome/rituals-dark-1440.png | Binary hashed only | 551380 |
| docs/screenshots/unification-before-chrome/rituals-light-1440.png | Binary hashed only | 333435 |
| docs/screenshots/unification-before-chrome/scenes-dark-1440.png | Binary hashed only | 647980 |
| docs/screenshots/unification-before-chrome/scenes-light-1440.png | Binary hashed only | 428272 |
| docs/screenshots/unification-before-chrome/settings-dark-1440.png | Binary hashed only | 59735 |
| docs/screenshots/unification-before-chrome/settings-light-1440.png | Binary hashed only | 59094 |
| docs/screenshots/unification-before-chrome/skills-dark-1440.png | Binary hashed only | 551389 |
| docs/screenshots/unification-before-chrome/skills-light-1440.png | Binary hashed only | 334723 |
| docs/screenshots/unification-before-chrome/sounds-dark-1440.png | Binary hashed only | 562617 |
| docs/screenshots/unification-before-chrome/sounds-light-1440.png | Binary hashed only | 342621 |
| docs/screenshots/unification-before-chrome/stats-dark-1440.png | Binary hashed only | 578615 |
| docs/screenshots/unification-before-chrome/stats-light-1440.png | Binary hashed only | 359775 |
| docs/screenshots/unification-before-chrome/suggestions-dark-1440.png | Binary hashed only | 549088 |
| docs/screenshots/unification-before-chrome/suggestions-light-1440.png | Binary hashed only | 335507 |
| docs/screenshots/unification-before-chrome/support-dark-1440.png | Binary hashed only | 362828 |
| docs/screenshots/unification-before-chrome/support-light-1440.png | Binary hashed only | 367240 |
| docs/screenshots/unification-before-chrome/tools-dark-1440.png | Binary hashed only | 580780 |
| docs/screenshots/unification-before-chrome/tools-light-1440.png | Binary hashed only | 367567 |
| docs/screenshots/unification-before-chrome/weather-dark-1440.png | Binary hashed only | 547874 |
| docs/screenshots/unification-before-chrome/weather-light-1440.png | Binary hashed only | 551358 |
| docs/screenshots/unification-before-chrome/websearch-dark-1440.png | Binary hashed only | 339648 |
| docs/screenshots/unification-before-chrome/websearch-light-1440.png | Binary hashed only | 341380 |
| docs/screenshots/unified-chrome-mobile.png | Binary hashed only | 84850 |
| docs/screenshots/unified-chrome-running.png | Binary hashed only | 263925 |
| docs/screenshots/unified-edge-mobile.png | Binary hashed only | 84848 |
| docs/screenshots/unified-edge-running.png | Binary hashed only | 264107 |
| docs/screenshots/work-chrome-capsules-dark-1440.png | Binary hashed only | 568832 |
| docs/screenshots/work-chrome-capsules-dark-320.png | Binary hashed only | 60780 |
| docs/screenshots/work-chrome-capsules-dark-390.png | Binary hashed only | 63112 |
| docs/screenshots/work-chrome-capsules-light-1440.png | Binary hashed only | 576998 |
| docs/screenshots/work-chrome-capsules-light-320.png | Binary hashed only | 61662 |
| docs/screenshots/work-chrome-capsules-light-390.png | Binary hashed only | 64137 |
| docs/screenshots/work-chrome-compiler-dark-1440.png | Binary hashed only | 560896 |
| docs/screenshots/work-chrome-compiler-dark-320.png | Binary hashed only | 53632 |
| docs/screenshots/work-chrome-compiler-dark-390.png | Binary hashed only | 54152 |
| docs/screenshots/work-chrome-compiler-light-1440.png | Binary hashed only | 565223 |
| docs/screenshots/work-chrome-compiler-light-320.png | Binary hashed only | 54532 |
| docs/screenshots/work-chrome-compiler-light-390.png | Binary hashed only | 55096 |
| docs/screenshots/work-chrome-dna-dark-1440.png | Binary hashed only | 563092 |
| docs/screenshots/work-chrome-dna-dark-320.png | Binary hashed only | 56667 |
| docs/screenshots/work-chrome-dna-dark-390.png | Binary hashed only | 57318 |
| docs/screenshots/work-chrome-dna-light-1440.png | Binary hashed only | 568747 |
| docs/screenshots/work-chrome-dna-light-320.png | Binary hashed only | 57798 |
| docs/screenshots/work-chrome-dna-light-390.png | Binary hashed only | 58617 |
| docs/screenshots/work-chrome-energy-dark-1440.png | Binary hashed only | 579051 |
| docs/screenshots/work-chrome-energy-dark-320.png | Binary hashed only | 62553 |
| docs/screenshots/work-chrome-energy-dark-390.png | Binary hashed only | 66436 |
| docs/screenshots/work-chrome-energy-light-1440.png | Binary hashed only | 581715 |
| docs/screenshots/work-chrome-energy-light-320.png | Binary hashed only | 63424 |
| docs/screenshots/work-chrome-energy-light-390.png | Binary hashed only | 67132 |
| docs/screenshots/work-chrome-failure.png | Binary hashed only | 547990 |
| docs/screenshots/work-chrome-recovery-dark-1440.png | Binary hashed only | 563169 |
| docs/screenshots/work-chrome-recovery-dark-320.png | Binary hashed only | 55881 |
| docs/screenshots/work-chrome-recovery-dark-390.png | Binary hashed only | 57336 |
| docs/screenshots/work-chrome-recovery-light-1440.png | Binary hashed only | 568253 |
| docs/screenshots/work-chrome-recovery-light-320.png | Binary hashed only | 57055 |
| docs/screenshots/work-chrome-recovery-light-390.png | Binary hashed only | 58487 |
| docs/screenshots/work-edge-capsules-dark-1440.png | Binary hashed only | 550956 |
| docs/screenshots/work-edge-capsules-dark-320.png | Binary hashed only | 65297 |
| docs/screenshots/work-edge-capsules-dark-390.png | Binary hashed only | 66606 |
| docs/screenshots/work-edge-capsules-light-1440.png | Binary hashed only | 555700 |
| docs/screenshots/work-edge-capsules-light-320.png | Binary hashed only | 65979 |
| docs/screenshots/work-edge-capsules-light-390.png | Binary hashed only | 67268 |
| docs/screenshots/work-edge-compiler-dark-1440.png | Binary hashed only | 536893 |
| docs/screenshots/work-edge-compiler-dark-320.png | Binary hashed only | 55463 |
| docs/screenshots/work-edge-compiler-dark-390.png | Binary hashed only | 56768 |
| docs/screenshots/work-edge-compiler-light-1440.png | Binary hashed only | 541109 |
| docs/screenshots/work-edge-compiler-light-320.png | Binary hashed only | 56166 |
| docs/screenshots/work-edge-compiler-light-390.png | Binary hashed only | 57415 |
| docs/screenshots/work-edge-dna-dark-1440.png | Binary hashed only | 558542 |
| docs/screenshots/work-edge-dna-dark-320.png | Binary hashed only | 71654 |
| docs/screenshots/work-edge-dna-dark-390.png | Binary hashed only | 74803 |
| docs/screenshots/work-edge-dna-light-1440.png | Binary hashed only | 562402 |
| docs/screenshots/work-edge-dna-light-320.png | Binary hashed only | 72597 |
| docs/screenshots/work-edge-dna-light-390.png | Binary hashed only | 75794 |
| docs/screenshots/work-edge-energy-dark-1440.png | Binary hashed only | 560565 |
| docs/screenshots/work-edge-energy-dark-320.png | Binary hashed only | 66942 |
| docs/screenshots/work-edge-energy-dark-390.png | Binary hashed only | 71771 |
| docs/screenshots/work-edge-energy-light-1440.png | Binary hashed only | 564460 |
| docs/screenshots/work-edge-energy-light-320.png | Binary hashed only | 67848 |
| docs/screenshots/work-edge-energy-light-390.png | Binary hashed only | 72708 |
| docs/screenshots/work-edge-failure.png | Binary hashed only | 548606 |
| docs/screenshots/work-edge-recovery-dark-1440.png | Binary hashed only | 551106 |
| docs/screenshots/work-edge-recovery-dark-320.png | Binary hashed only | 65984 |
| docs/screenshots/work-edge-recovery-dark-390.png | Binary hashed only | 69801 |
| docs/screenshots/work-edge-recovery-light-1440.png | Binary hashed only | 556032 |
| docs/screenshots/work-edge-recovery-light-320.png | Binary hashed only | 66928 |
| docs/screenshots/work-edge-recovery-light-390.png | Binary hashed only | 70605 |
| docs/screenshots/workspace-tabs.png | Binary hashed only | 179084 |
| docs/SEARCH_DICTIONARY_REPORT.md | Text scanned | 3366 |
| docs/SETTINGS_CORNER_REPORT.md | Text scanned | 1759 |
| docs/SETTINGS_PAGE_REPORT.md | Text scanned | 2640 |
| docs/SKETCH_UI_REPORT.md | Text scanned | 4976 |
| docs/STAGE_0_DESIGN_AUDIT.md | Text scanned | 3249 |
| docs/STAGE_1_REPORT.md | Text scanned | 9051 |
| docs/STAGE_2_REPORT.md | Text scanned | 10429 |
| docs/STAGE_3_4_REPORT.md | Text scanned | 2778 |
| docs/STAGE_3_REPORT.md | Text scanned | 10806 |
| docs/STAGE_5_6_REPORT.md | Text scanned | 5539 |
| docs/STORE_LISTING.md | Text scanned | 4037 |
| docs/TOOLS_MUSIC_REPORT.md | Text scanned | 4386 |
| docs/UI_FOCUS_REFINEMENT_REPORT.md | Text scanned | 6177 |
| docs/UI_REDESIGN_REPORT.md | Text scanned | 5211 |
| docs/UNIFIED_APPEARANCE_REPORT.md | Text scanned | 2020 |
| docs/UNIFIED_TIMER_REPORT.md | Text scanned | 4287 |
| docs/WALLPAPER_REFRESH_REPORT.md | Text scanned | 1540 |
| docs/WORKFLOW_COMPLETION_12_PLAN.md | Text scanned | 1503 |
| docs/WORKSPACES_PLAN.md | Text scanned | 1245 |
| docs/WORKSPACES_STAGE_REPORT.md | Text scanned | 7645 |
| docs/WORKSPACE_REPORT.md | Text scanned | 2905 |
| docs/YOUTUBE_API_REPORT.md | Text scanned | 2835 |
| livewallpaper/ghibli-coffee-shop-1920x1080.mp4 | Binary hashed only | 16450544 |
| livewallpaper/ghibli-cottage-meadow.mp4 | Binary hashed only | 47381665 |
| livewallpaper/peaceful-mountain-meadow-live-wallpaper-wallsflow-com.mp4 | Binary hashed only | 20927614 |
| livewallpaper/README.md | Text scanned | 837 |
| manifest.json | Text scanned | 2360 |
| newtab/app.css | Text scanned | 196581 |
| newtab/components.css | Text scanned | 11965 |
| newtab/dashboard.css | Text scanned | 50495 |
| newtab/foundation.css | Text scanned | 14072 |
| newtab/index.html | Text scanned | 5099 |
| newtab/newtab.css | Text scanned | 16161 |
| newtab/newtab.js | Text scanned | 10944 |
| newtab/panels.css | Text scanned | 12758 |
| newtab/sketch.css | Text scanned | 12597 |
| newtab/system.css | Text scanned | 25682 |
| newtab/tokens.css | Text scanned | 14875 |
| newtab/widgets.css | Text scanned | 49947 |
| package.json | Text scanned | 417 |
| README.md | Text scanned | 12446 |
| release/oneflow-1.0.0.zip | Binary hashed only | 103618928 |
| release/oneflow-1.0.0.zip.sha256 | Text scanned | 84 |
| release/SCREENSHOTS.json | Text scanned | 474 |
| scripts/assets.js | Text scanned | 4081 |
| scripts/audit-design-release.js | Text scanned | 2585 |
| scripts/check.js | Text scanned | 4103 |
| scripts/data.js | Text scanned | 3113 |
| scripts/design-inventory.js | Text scanned | 5427 |
| scripts/design-lint.js | Text scanned | 3543 |
| scripts/icons.js | Text scanned | 1448 |
| scripts/index-wallpapers.js | Text scanned | 2690 |
| scripts/launch-captures.js | Text scanned | 2322 |
| scripts/launch-demo.js | Text scanned | 4662 |
| scripts/launch-pages.js | Text scanned | 5173 |
| scripts/localize.js | Text scanned | 7850 |
| scripts/measure-design-baseline.js | Text scanned | 6266 |
| scripts/package.js | Text scanned | 4672 |
| scripts/preview.js | Text scanned | 1280 |
| scripts/refresh-wallpapers.js | Text scanned | 5376 |
| scripts/stage2-assets.js | Text scanned | 3021 |
| scripts/styles.js | Text scanned | 940 |
| scripts/tailwind.config.cjs | Text scanned | 113 |
| scripts/tailwind.input.css | Text scanned | 21 |
| scripts/unify-source-styles.js | Text scanned | 4182 |
| scripts/widget-styles.json | Text scanned | 1078 |
| test-results/ambient-clock-report.json | Text scanned | 355 |
| test-results/apply-design-foundation.cjs | Text scanned | 8892 |
| test-results/backgrounds-chrome-alpine-1280.png | Binary hashed only | 220591 |
| test-results/backgrounds-chrome-alpine-1440.png | Binary hashed only | 270068 |
| test-results/backgrounds-chrome-alpine-320.png | Binary hashed only | 71031 |
| test-results/backgrounds-chrome-alpine-390.png | Binary hashed only | 88187 |
| test-results/backgrounds-chrome-cozy-1280.png | Binary hashed only | 218534 |
| test-results/backgrounds-chrome-cozy-1440.png | Binary hashed only | 269511 |
| test-results/backgrounds-chrome-cozy-320.png | Binary hashed only | 73319 |
| test-results/backgrounds-chrome-cozy-390.png | Binary hashed only | 94535 |
| test-results/backgrounds-chrome-dark-1280.png | Binary hashed only | 217265 |
| test-results/backgrounds-chrome-dark-1440.png | Binary hashed only | 266633 |
| test-results/backgrounds-chrome-dark-320.png | Binary hashed only | 70601 |
| test-results/backgrounds-chrome-dark-390.png | Binary hashed only | 87518 |
| test-results/backgrounds-chrome-failure.png | Binary hashed only | 274896 |
| test-results/backgrounds-chrome-flow.png | Binary hashed only | 292961 |
| test-results/backgrounds-chrome-lofi-1280.png | Binary hashed only | 221080 |
| test-results/backgrounds-chrome-lofi-1440.png | Binary hashed only | 271935 |
| test-results/backgrounds-chrome-lofi-320.png | Binary hashed only | 72095 |
| test-results/backgrounds-chrome-lofi-390.png | Binary hashed only | 91379 |
| test-results/backgrounds-chrome-minimal-1280.png | Binary hashed only | 206463 |
| test-results/backgrounds-chrome-minimal-1440.png | Binary hashed only | 258641 |
| test-results/backgrounds-chrome-minimal-320.png | Binary hashed only | 71834 |
| test-results/backgrounds-chrome-minimal-390.png | Binary hashed only | 90675 |
| test-results/backgrounds-chrome-report.json | Text scanned | 855 |
| test-results/backgrounds-chrome-scenes.png | Binary hashed only | 188328 |
| test-results/backgrounds-chrome-summit-1280.png | Binary hashed only | 256682 |
| test-results/backgrounds-chrome-summit-1440.png | Binary hashed only | 334301 |
| test-results/backgrounds-chrome-summit-320.png | Binary hashed only | 91310 |
| test-results/backgrounds-chrome-summit-390.png | Binary hashed only | 120271 |
| test-results/backgrounds-chrome-uploads.png | Binary hashed only | 234661 |
| test-results/backgrounds-chrome-zoom-200.png | Binary hashed only | 71667 |
| test-results/backgrounds-edge-alpine-1280.png | Binary hashed only | 222190 |
| test-results/backgrounds-edge-alpine-1440.png | Binary hashed only | 273020 |
| test-results/backgrounds-edge-alpine-320.png | Binary hashed only | 71063 |
| test-results/backgrounds-edge-alpine-390.png | Binary hashed only | 89569 |
| test-results/backgrounds-edge-cozy-1280.png | Binary hashed only | 220257 |
| test-results/backgrounds-edge-cozy-1440.png | Binary hashed only | 272688 |
| test-results/backgrounds-edge-cozy-320.png | Binary hashed only | 73314 |
| test-results/backgrounds-edge-cozy-390.png | Binary hashed only | 96002 |
| test-results/backgrounds-edge-dark-1280.png | Binary hashed only | 219132 |
| test-results/backgrounds-edge-dark-1440.png | Binary hashed only | 269737 |
| test-results/backgrounds-edge-dark-320.png | Binary hashed only | 70609 |
| test-results/backgrounds-edge-dark-390.png | Binary hashed only | 88922 |
| test-results/backgrounds-edge-flow.png | Binary hashed only | 292652 |
| test-results/backgrounds-edge-lofi-1280.png | Binary hashed only | 222828 |
| test-results/backgrounds-edge-lofi-1440.png | Binary hashed only | 274935 |
| test-results/backgrounds-edge-lofi-320.png | Binary hashed only | 72096 |
| test-results/backgrounds-edge-lofi-390.png | Binary hashed only | 92776 |
| test-results/backgrounds-edge-minimal-1280.png | Binary hashed only | 208045 |
| test-results/backgrounds-edge-minimal-1440.png | Binary hashed only | 261764 |
| test-results/backgrounds-edge-minimal-320.png | Binary hashed only | 71839 |
| test-results/backgrounds-edge-minimal-390.png | Binary hashed only | 91938 |
| test-results/backgrounds-edge-report.json | Text scanned | 853 |
| test-results/backgrounds-edge-scenes.png | Binary hashed only | 188452 |
| test-results/backgrounds-edge-summit-1280.png | Binary hashed only | 258664 |
| test-results/backgrounds-edge-summit-1440.png | Binary hashed only | 338403 |
| test-results/backgrounds-edge-summit-320.png | Binary hashed only | 91374 |
| test-results/backgrounds-edge-summit-390.png | Binary hashed only | 121701 |
| test-results/backgrounds-edge-uploads.png | Binary hashed only | 232895 |
| test-results/backgrounds-edge-zoom-200.png | Binary hashed only | 71667 |
| test-results/calm-chrome-report.json | Text scanned | 1103 |
| test-results/calm-corners.json | Text scanned | 350 |
| test-results/calm-edge-report.json | Text scanned | 1100 |
| test-results/chrome-backup.json | Text scanned | 31410 |
| test-results/chrome-report.json | Text scanned | 1087 |
| test-results/dashboard-chrome-report.json | Text scanned | 714 |
| test-results/dashboard-desktop.png | Binary hashed only | 80478 |
| test-results/dashboard-edge-report.json | Text scanned | 712 |
| test-results/dashboard-mobile.png | Binary hashed only | 85350 |
| test-results/debug-notes-1440.png | Binary hashed only | 133481 |
| test-results/debug-notes-320.png | Binary hashed only | 25484 |
| test-results/debug-notes-390.png | Binary hashed only | 28082 |
| test-results/debug-panels.js | Text scanned | 1658 |
| test-results/design-chrome-dashboard.png | Binary hashed only | 275722 |
| test-results/design-chrome-failure.png | Binary hashed only | 278510 |
| test-results/design-chrome-light-settings.png | Binary hashed only | 192634 |
| test-results/design-chrome-mobile-320.png | Binary hashed only | 64470 |
| test-results/design-chrome-mobile-390.png | Binary hashed only | 77897 |
| test-results/design-chrome-mobile-844.png | Binary hashed only | 94647 |
| test-results/design-chrome-mobile-dashboard.png | Binary hashed only | 121928 |
| test-results/design-chrome-report.json | Text scanned | 939 |
| test-results/design-chrome-tasks.png | Binary hashed only | 195638 |
| test-results/design-edge-dashboard.png | Binary hashed only | 276038 |
| test-results/design-edge-failure.png | Binary hashed only | 196286 |
| test-results/design-edge-light-settings.png | Binary hashed only | 224171 |
| test-results/design-edge-mobile-320.png | Binary hashed only | 68038 |
| test-results/design-edge-mobile-390.png | Binary hashed only | 79134 |
| test-results/design-edge-mobile-844.png | Binary hashed only | 94661 |
| test-results/design-edge-mobile-dashboard.png | Binary hashed only | 122151 |
| test-results/design-edge-report.json | Text scanned | 951 |
| test-results/design-edge-tasks.png | Binary hashed only | 202205 |
| test-results/edge-backup.json | Text scanned | 30677 |
| test-results/edge-report.json | Text scanned | 1079 |
| test-results/failure.png | Binary hashed only | 183082 |
| test-results/home-chrome-black.png | Binary hashed only | 236748 |
| test-results/home-chrome-desktop.png | Binary hashed only | 633545 |
| test-results/home-chrome-failure.png | Binary hashed only | 191048 |
| test-results/home-chrome-light.png | Binary hashed only | 623864 |
| test-results/home-chrome-mobile.png | Binary hashed only | 150168 |
| test-results/home-chrome-report.json | Text scanned | 598 |
| test-results/home-chrome-session.png | Binary hashed only | 629144 |
| test-results/home-chrome-white.png | Binary hashed only | 45109 |
| test-results/home-edge-black.png | Binary hashed only | 236014 |
| test-results/home-edge-desktop.png | Binary hashed only | 632930 |
| test-results/home-edge-light.png | Binary hashed only | 624290 |
| test-results/home-edge-mobile.png | Binary hashed only | 150180 |
| test-results/home-edge-report.json | Text scanned | 596 |
| test-results/home-edge-session.png | Binary hashed only | 630668 |
| test-results/home-edge-white.png | Binary hashed only | 45289 |
| test-results/image-size.js | Text scanned | 295 |
| test-results/journal-chrome-report.json | Text scanned | 508 |
| test-results/journal-edge-report.json | Text scanned | 506 |
| test-results/journal-page-chrome.json | Text scanned | 385 |
| test-results/lookup-chrome-mobile.png | Binary hashed only | 37068 |
| test-results/lookup-chrome-report.json | Text scanned | 370 |
| test-results/lookup-chrome.png | Binary hashed only | 156283 |
| test-results/lookup-edge-mobile.png | Binary hashed only | 35545 |
| test-results/lookup-edge-report.json | Text scanned | 370 |
| test-results/lookup-edge.png | Binary hashed only | 149269 |
| test-results/make-summit.js | Text scanned | 431 |
| test-results/market-chrome-report.json | Text scanned | 2298 |
| test-results/market-edge-report.json | Text scanned | 2340 |
| test-results/music-api-chrome-report.json | Text scanned | 433 |
| test-results/music-api-chrome.png | Binary hashed only | 638146 |
| test-results/music-api-edge-report.json | Text scanned | 433 |
| test-results/music-api-edge.png | Binary hashed only | 637032 |
| test-results/notes-chrome-failure.png | Binary hashed only | 87605 |
| test-results/notes-edge-failure.png | Binary hashed only | 23058 |
| test-results/oneflow-focus-week.csv | Binary hashed only | 157 |
| test-results/package-chrome-report.json | Text scanned | 2146 |
| test-results/package-edge-report.json | Text scanned | 619 |
| test-results/panels-chrome-320-sounds.png | Binary hashed only | 67511 |
| test-results/panels-chrome-320-tasks.png | Binary hashed only | 57216 |
| test-results/panels-chrome-390-sounds.png | Binary hashed only | 74737 |
| test-results/panels-chrome-390-tasks.png | Binary hashed only | 62311 |
| test-results/panels-chrome-desktop-sounds.png | Binary hashed only | 287980 |
| test-results/panels-chrome-desktop-tasks.png | Binary hashed only | 211381 |
| test-results/panels-chrome-directory.png | Binary hashed only | 164516 |
| test-results/panels-chrome-failure.png | Binary hashed only | 1339095 |
| test-results/panels-chrome-flow.png | Binary hashed only | 210773 |
| test-results/panels-chrome-light-settings.png | Binary hashed only | 121563 |
| test-results/panels-chrome-mobile-flow.png | Binary hashed only | 86195 |
| test-results/panels-chrome-mobile-settings.png | Binary hashed only | 94624 |
| test-results/panels-chrome-notes.png | Binary hashed only | 203899 |
| test-results/panels-chrome-reminders.png | Binary hashed only | 210791 |
| test-results/panels-chrome-report.json | Text scanned | 242 |
| test-results/panels-chrome-settings-focus.png | Binary hashed only | 224719 |
| test-results/panels-chrome-tasks.png | Binary hashed only | 211705 |
| test-results/panels-edge-320-sounds.png | Binary hashed only | 66357 |
| test-results/panels-edge-320-tasks.png | Binary hashed only | 57087 |
| test-results/panels-edge-390-sounds.png | Binary hashed only | 73359 |
| test-results/panels-edge-390-tasks.png | Binary hashed only | 61968 |
| test-results/panels-edge-desktop-sounds.png | Binary hashed only | 285020 |
| test-results/panels-edge-desktop-tasks.png | Binary hashed only | 211481 |
| test-results/panels-edge-directory.png | Binary hashed only | 167049 |
| test-results/panels-edge-failure.png | Binary hashed only | 287262 |
| test-results/panels-edge-flow.png | Binary hashed only | 210559 |
| test-results/panels-edge-light-settings.png | Binary hashed only | 64102 |
| test-results/panels-edge-mobile-flow.png | Binary hashed only | 86348 |
| test-results/panels-edge-mobile-settings.png | Binary hashed only | 94275 |
| test-results/panels-edge-notes.png | Binary hashed only | 199250 |
| test-results/panels-edge-reminders.png | Binary hashed only | 201479 |
| test-results/panels-edge-report.json | Text scanned | 1093 |
| test-results/panels-edge-settings-focus.png | Binary hashed only | 240962 |
| test-results/panels-edge-tasks.png | Binary hashed only | 210116 |
| test-results/refinement-dashboard.png | Binary hashed only | 259579 |
| test-results/refinement-mobile.png | Binary hashed only | 76324 |
| test-results/refinement-scenes.png | Binary hashed only | 216505 |
| test-results/refinement-tasks.png | Binary hashed only | 189235 |
| test-results/resilience-report.json | Text scanned | 538 |
| test-results/save-background-evidence.js | Text scanned | 1125 |
| test-results/scan-panels.js | Text scanned | 2154 |
| test-results/sketch-chrome-focus.png | Binary hashed only | 258600 |
| test-results/sketch-chrome-home.png | Binary hashed only | 255981 |
| test-results/sketch-chrome-mobile-light.png | Binary hashed only | 74426 |
| test-results/sketch-chrome-mobile-music.png | Binary hashed only | 126213 |
| test-results/sketch-chrome-mobile.png | Binary hashed only | 85703 |
| test-results/sketch-chrome-music.png | Binary hashed only | 304413 |
| test-results/sketch-chrome-report.json | Text scanned | 695 |
| test-results/sketch-chrome-settings.png | Binary hashed only | 106522 |
| test-results/sketch-chrome-tools.png | Binary hashed only | 149131 |
| test-results/sketch-edge-focus.png | Binary hashed only | 258342 |
| test-results/sketch-edge-home.png | Binary hashed only | 255965 |
| test-results/sketch-edge-mobile-light.png | Binary hashed only | 74249 |
| test-results/sketch-edge-mobile-music.png | Binary hashed only | 126066 |
| test-results/sketch-edge-mobile.png | Binary hashed only | 85445 |
| test-results/sketch-edge-music.png | Binary hashed only | 304428 |
| test-results/sketch-edge-report.json | Text scanned | 693 |
| test-results/sketch-edge-settings.png | Binary hashed only | 106562 |
| test-results/sketch-edge-tools.png | Binary hashed only | 149128 |
| test-results/stage2-chrome-dashboard.png | Binary hashed only | 274553 |
| test-results/stage2-chrome-mobile.png | Binary hashed only | 84497 |
| test-results/stage2-chrome-report.json | Text scanned | 1478 |
| test-results/stage2-chrome-sounds.png | Binary hashed only | 209757 |
| test-results/stage2-chrome-stats.png | Binary hashed only | 194602 |
| test-results/stage2-chrome-timer.png | Binary hashed only | 245863 |
| test-results/stage2-edge-dashboard.png | Binary hashed only | 274335 |
| test-results/stage2-edge-mobile.png | Binary hashed only | 83779 |
| test-results/stage2-edge-report.json | Text scanned | 1465 |
| test-results/stage2-edge-sounds.png | Binary hashed only | 195047 |
| test-results/stage2-edge-stats.png | Binary hashed only | 180895 |
| test-results/stage2-edge-timer.png | Binary hashed only | 262075 |
| test-results/stage2-failure.png | Binary hashed only | 268597 |
| test-results/stage2-integrations-chrome-report.json | Text scanned | 504 |
| test-results/stage2-integrations-edge-report.json | Text scanned | 504 |
| test-results/stage2-integrations-report.json | Text scanned | 504 |
| test-results/stage3-chrome-dashboard.png | Binary hashed only | 1555308 |
| test-results/stage3-chrome-failure.png | Binary hashed only | 203932 |
| test-results/stage3-chrome-flow.png | Binary hashed only | 321189 |
| test-results/stage3-chrome-mobile.png | Binary hashed only | 82342 |
| test-results/stage3-chrome-report.json | Text scanned | 1140 |
| test-results/stage3-chrome-ritual.png | Binary hashed only | 373258 |
| test-results/stage3-chrome-scenes.png | Binary hashed only | 887800 |
| test-results/stage3-edge-dashboard.png | Binary hashed only | 266065 |
| test-results/stage3-edge-failure.png | Binary hashed only | 188263 |
| test-results/stage3-edge-flow.png | Binary hashed only | 319307 |
| test-results/stage3-edge-mobile.png | Binary hashed only | 82743 |
| test-results/stage3-edge-report.json | Text scanned | 2112 |
| test-results/stage3-edge-ritual.png | Binary hashed only | 118785 |
| test-results/stage3-edge-scenes.png | Binary hashed only | 160636 |
| test-results/stage56-chrome-failure.png | Binary hashed only | 57832 |
| test-results/stage56-chrome-notes-320.png | Binary hashed only | 24707 |
| test-results/stage56-chrome-notifications-320.png | Binary hashed only | 58459 |
| test-results/stage56-chrome-notifications-toast.png | Binary hashed only | 576430 |
| test-results/stage56-chrome-report.json | Text scanned | 588 |
| test-results/stage56-chrome-settings-320.png | Binary hashed only | 70471 |
| test-results/stage56-chrome-settings-light.png | Binary hashed only | 59094 |
| test-results/stage56-chrome-sounds-1440.png | Binary hashed only | 562535 |
| test-results/stage56-chrome-sounds-320.png | Binary hashed only | 55044 |
| test-results/stage56-chrome-sounds-390.png | Binary hashed only | 55900 |
| test-results/stage56-chrome-stats-320.png | Binary hashed only | 61290 |
| test-results/stage56-chrome-stats-desktop.png | Binary hashed only | 580446 |
| test-results/stage56-chrome-stats-light.png | Binary hashed only | 582323 |
| test-results/stage56-chrome-tasks-320.png | Binary hashed only | 24707 |
| test-results/stage56-edge-notes-320.png | Binary hashed only | 24318 |
| test-results/stage56-edge-notifications-320.png | Binary hashed only | 62899 |
| test-results/stage56-edge-notifications-toast.png | Binary hashed only | 560036 |
| test-results/stage56-edge-report.json | Text scanned | 586 |
| test-results/stage56-edge-settings-320.png | Binary hashed only | 71279 |
| test-results/stage56-edge-settings-light.png | Binary hashed only | 59595 |
| test-results/stage56-edge-sounds-1440.png | Binary hashed only | 547343 |
| test-results/stage56-edge-sounds-320.png | Binary hashed only | 58686 |
| test-results/stage56-edge-sounds-390.png | Binary hashed only | 60673 |
| test-results/stage56-edge-stats-320.png | Binary hashed only | 65489 |
| test-results/stage56-edge-stats-desktop.png | Binary hashed only | 564981 |
| test-results/stage56-edge-stats-light.png | Binary hashed only | 566863 |
| test-results/stage56-edge-tasks-320.png | Binary hashed only | 24318 |
| test-results/stage7-chrome-ambient-1440.png | Binary hashed only | 2331802 |
| test-results/stage7-chrome-ambient-320.png | Binary hashed only | 503607 |
| test-results/stage7-chrome-ambient-390.png | Binary hashed only | 619449 |
| test-results/stage7-chrome-failure.png | Binary hashed only | 1183341 |
| test-results/stage7-chrome-focus-keyboard.png | Binary hashed only | 1182640 |
| test-results/stage7-chrome-home-1440.png | Binary hashed only | 1823718 |
| test-results/stage7-chrome-home-320.png | Binary hashed only | 401940 |
| test-results/stage7-chrome-home-390.png | Binary hashed only | 487244 |
| test-results/stage7-chrome-light-home.png | Binary hashed only | 626092 |
| test-results/stage7-chrome-report.json | Text scanned | 13956 |
| test-results/stage7-chrome-short-mobile.png | Binary hashed only | 263465 |
| test-results/studio-chrome-report.json | Text scanned | 901 |
| test-results/studio-edge-report.json | Text scanned | 900 |
| test-results/tasks-panel.png | Binary hashed only | 191067 |
| test-results/tidy-readme.js | Text scanned | 362 |
| test-results/unified-chrome-mobile.png | Binary hashed only | 315082 |
| test-results/unified-chrome-report.json | Text scanned | 729 |
| test-results/unified-chrome-running.png | Binary hashed only | 1506096 |
| test-results/unified-edge-mobile.png | Binary hashed only | 316830 |
| test-results/unified-edge-report.json | Text scanned | 727 |
| test-results/unified-edge-running.png | Binary hashed only | 1514170 |
| test-results/update-integrations.js | Text scanned | 1480 |
| test-results/verify-final-package.js | Text scanned | 770 |
| test-results/youtube-live-report.json | Text scanned | 155 |
| test-results/youtube-live.png | Binary hashed only | 240600 |
| tests/ambient-clock-browser.js | Text scanned | 4933 |
| tests/ambient-redesign-browser.js | Text scanned | 8144 |
| tests/background-presentation.test.js | Text scanned | 2264 |
| tests/backgrounds-browser.js | Text scanned | 10839 |
| tests/browser.js | Text scanned | 11850 |
| tests/calm-corners-browser.js | Text scanned | 5154 |
| tests/calm-home-browser.js | Text scanned | 13701 |
| tests/calm-migration.test.js | Text scanned | 1463 |
| tests/combined-notes-browser.js | Text scanned | 7715 |
| tests/dashboard-browser.js | Text scanned | 9920 |
| tests/design-browser.js | Text scanned | 10942 |
| tests/design-foundation-browser.js | Text scanned | 11914 |
| tests/design-lint.test.js | Text scanned | 1121 |
| tests/design-stage-3-4-browser.js | Text scanned | 12005 |
| tests/design-stage-5-6-browser.js | Text scanned | 10613 |
| tests/design-stage-7-8-browser.js | Text scanned | 12283 |
| tests/design-stage-9-browser.js | Text scanned | 10566 |
| tests/design-unification-browser.js | Text scanned | 4286 |
| tests/dictionary.test.js | Text scanned | 1792 |
| tests/home-foundation-browser.js | Text scanned | 5682 |
| tests/integrations.test.js | Text scanned | 786 |
| tests/journal-fullscreen-browser.js | Text scanned | 7994 |
| tests/journal-wallpapers-browser.js | Text scanned | 10106 |
| tests/journeys-browser.js | Text scanned | 11672 |
| tests/journeys-media-browser.js | Text scanned | 3155 |
| tests/journeys-tabs-browser.js | Text scanned | 6492 |
| tests/journeys.test.js | Text scanned | 4023 |
| tests/lookup-browser.js | Text scanned | 5133 |
| tests/market-browser.js | Text scanned | 11336 |
| tests/market-ready.test.js | Text scanned | 3759 |
| tests/music-api-browser.js | Text scanned | 5384 |
| tests/notes-capture-browser.js | Text scanned | 11968 |
| tests/notes-capture.test.js | Text scanned | 1592 |
| tests/notes-checklist.test.js | Text scanned | 848 |
| tests/notes-overlay-browser.js | Text scanned | 7901 |
| tests/package-browser.js | Text scanned | 6591 |
| tests/panel-boundaries-browser.js | Text scanned | 4505 |
| tests/panel-entry-browser.js | Text scanned | 6882 |
| tests/panel-environment-browser.js | Text scanned | 8201 |
| tests/panel-planning-browser.js | Text scanned | 9514 |
| tests/panel-redesign-browser.js | Text scanned | 10371 |
| tests/panel-remaining-browser.js | Text scanned | 9951 |
| tests/panels-browser.js | Text scanned | 11650 |
| tests/pexels-browser.js | Text scanned | 6927 |
| tests/pexels-worker.test.js | Text scanned | 930 |
| tests/pexels.test.js | Text scanned | 1563 |
| tests/refinement-browser.js | Text scanned | 7565 |
| tests/release-audit-browser.js | Text scanned | 4750 |
| tests/resilience.js | Text scanned | 7027 |
| tests/schema.test.js | Text scanned | 4044 |
| tests/settings-page-browser.js | Text scanned | 5227 |
| tests/sketch-browser.js | Text scanned | 6647 |
| tests/stage2-browser.js | Text scanned | 15748 |
| tests/stage2-integrations.js | Text scanned | 7640 |
| tests/stage2.test.js | Text scanned | 5979 |
| tests/stage3-browser.js | Text scanned | 17193 |
| tests/stage3.test.js | Text scanned | 5493 |
| tests/stage34-browser.js | Text scanned | 4259 |
| tests/stage7-browser.js | Text scanned | 11308 |
| tests/stats-notifications-browser.js | Text scanned | 10411 |
| tests/storage-startup.test.js | Text scanned | 2161 |
| tests/studio-browser.js | Text scanned | 13882 |
| tests/studio.test.js | Text scanned | 3708 |
| tests/tab-restoration.test.js | Text scanned | 1764 |
| tests/task-dates.test.js | Text scanned | 773 |
| tests/ui-refinement-browser.js | Text scanned | 6078 |
| tests/unified-timer-browser.js | Text scanned | 7149 |
| tests/unified-timer.test.js | Text scanned | 2692 |
| tests/work-context-browser.js | Text scanned | 14490 |
| tests/work-context.test.js | Text scanned | 5224 |
| tests/work-tabs-browser.js | Text scanned | 3742 |
| tests/workflow-completion-browser.js | Text scanned | 10027 |
| tests/workspace-browser.js | Text scanned | 3313 |
| tests/youtube-live-browser.js | Text scanned | 1988 |
| tests/youtube-music.test.js | Text scanned | 1289 |
| tests/youtube-search.test.js | Text scanned | 1500 |
| vendor/canvas-confetti/1.9.3/confetti.browser.min.js | Text scanned | 10808 |
| vendor/canvas-confetti/1.9.3/LICENSE | Text scanned | 743 |
| vendor/chart.js/4.4.8/chart.umd.js | Text scanned | 206279 |
| vendor/chart.js/4.4.8/LICENSE.md | Text scanned | 1093 |
| vendor/lucide/0.468.0/LICENSE | Text scanned | 880 |
| vendor/lucide/0.468.0/lucide.min.js | Text scanned | 357796 |
| vendor/README.md | Text scanned | 2044 |
| vendor/sortablejs/1.15.6/LICENSE | Text scanned | 1106 |
| vendor/sortablejs/1.15.6/Sortable.min.js | Text scanned | 45092 |
| vendor/tailwindcss/3.4.17/LICENSE | Text scanned | 1071 |
| vendor/tailwindcss/3.4.17/tailwind.min.css | Text scanned | 343 |
| wallpaper/1198589-2048x1128-desktop-hd-studio-ghibli-wallpaper-photo.jpg | Binary hashed only | 1920257 |
| wallpaper/1198594-3200x1680-desktop-hd-studio-ghibli-background.jpg | Binary hashed only | 1673299 |
| wallpaper/1198609-2560x1440-desktop-hd-studio-ghibli-background.jpg | Binary hashed only | 585548 |
| wallpaper/1198615-2560x1440-desktop-hd-studio-ghibli-background.jpg | Binary hashed only | 485948 |
| wallpaper/1198627-2080x1319-desktop-hd-studio-ghibli-wallpaper.jpg | Binary hashed only | 402805 |
| wallpaper/1198712-3840x2160-desktop-4k-studio-ghibli-wallpaper.jpg | Binary hashed only | 598609 |
| wallpaper/1198775-3200x1720-desktop-hd-studio-ghibli-wallpaper-photo.jpg | Binary hashed only | 844818 |
| wallpaper/1198790-3840x2160-desktop-4k-studio-ghibli-wallpaper.jpg | Binary hashed only | 999165 |
| wallpaper/1198793-3054x1666-desktop-hd-studio-ghibli-wallpaper.jpg | Binary hashed only | 1004106 |
| wallpaper/1198875-2560x1440-desktop-hd-studio-ghibli-background-image.jpg | Binary hashed only | 619761 |
| wallpaper/1198882-2560x1440-desktop-hd-studio-ghibli-wallpaper.jpg | Binary hashed only | 514530 |
| wallpaper/1198883-2166x1278-desktop-hd-studio-ghibli-background-photo.jpg | Binary hashed only | 777985 |
| wallpaper/122083-2404x1704-desktop-hd-the-garden-of-words-background-image.jpg | Binary hashed only | 1070960 |
| wallpaper/33038-1920x1080-desktop-1080p-the-garden-of-words-wallpaper-image.jpg | Binary hashed only | 518728 |
| wallpaper/alpine-thumb.webp | Binary hashed only | 1430 |
| wallpaper/alpine.svg | Text scanned | 6919 |
| wallpaper/alpine.webp | Binary hashed only | 17208 |
| wallpaper/cozy-thumb.webp | Binary hashed only | 914 |
| wallpaper/cozy.svg | Text scanned | 1664 |
| wallpaper/cozy.webp | Binary hashed only | 12298 |
| wallpaper/dark-thumb.webp | Binary hashed only | 1086 |
| wallpaper/dark.svg | Text scanned | 6931 |
| wallpaper/dark.webp | Binary hashed only | 14360 |
| wallpaper/lofi-thumb.webp | Binary hashed only | 1114 |
| wallpaper/lofi.svg | Text scanned | 1416 |
| wallpaper/lofi.webp | Binary hashed only | 12850 |
| wallpaper/minimal-thumb.webp | Binary hashed only | 996 |
| wallpaper/minimal.svg | Text scanned | 1410 |
| wallpaper/minimal.webp | Binary hashed only | 12372 |
| wallpaper/pexels-jan-van-der-wolf-11680885-10267558.jpg | Binary hashed only | 3616972 |
| wallpaper/README.md | Text scanned | 954 |
| wallpaper/summit-thumb.webp | Binary hashed only | 926 |
| wallpaper/summit.svg | Text scanned | 1465 |
| wallpaper/summit.webp | Binary hashed only | 11644 |
