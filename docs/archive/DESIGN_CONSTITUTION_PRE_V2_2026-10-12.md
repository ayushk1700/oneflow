# ONEFLOW Design Constitution

## Focus work context — 11 October 2026

Capsules, Recovery, Next-Step Compiler, Focus DNA and Energy Planner are secondary tools disclosed through More and command search. Active session options may expose capsule capture and resume-note entry. They use the shared panel lifecycle and theme tokens, flat sections, editable estimates and one primary action per workflow. Capsule restore pauses media and offers a quiet re-entry screen; it never replaces an active interval. Learning and switch counting are separate opt-ins. Recovery language describes unfinished progress without judging tab changes. Planning keeps recovery time unassigned and makes unplaced tasks visible. No new permanent Home widget is introduced.

## Personal workspaces — 11 October 2026

First Step Mode, Recall Rooms, Idea Garden, Proof of Work, Energy Weather, Afterglow, Career Sprint, Quiet Web and Skill Loops are secondary tools in More and command search. Use the shared panel, flat sections and theme tokens. Capture forms collapse after saved work exists. Concept and skill maps are semantic responsive groups; confidence and due dates remain readable without color. Capsules may show bundled scenery previews and actual linked history. Proposals remain editable, energy ratings voluntary, and report exports require approval per line. Browser parking uses inline confirmation with a saved return path. No permanent Home widget is added.

## Ambient redesign — 11 October 2026

The user-approved Ambient mockup defines a scenery-first view with a matte clock at lower-left, local-time caption, scene picker, compact shared sound controls, Back to Home, More and Immersive. Home shortcuts and Settings are disclosed through More while Ambient is active. Clock and Sounds widget visibility still apply. The active-session pill returns to the existing focus session without changing its deadline. Immersive fades controls after four seconds; pointer/keyboard activity reveals them, focused controls and open menus remain visible, and Escape exits immersion. The center remains clear. Scene selection never starts audio. Controls and matte clock colors use shared tokens, with stacked controls on compact screens.

## Home refinement — 11 October 2026

- Corner navigation remains Journal at top-right, Notes/Sounds at bottom-left, and More/Settings at bottom-right, following the user's refinement prompt. Secondary shortcuts share quiet surfaces; the focus action retains the filled accent.
- Home uses an explicitly editable focus entry with 25/50/custom duration selection. Existing task selection shares this entry and preserves the custom draft when switching back.
- On tall desktop layouts the quote sits above the footer; compact layouts keep it in document flow. Attribution and quote actions use native disclosure for touch and keyboard access. Explicit Studio placements remain authoritative.
- Focus uses a lighter task heading, one dominant timer, accessible progress, and context-specific session follow-up actions.
- Appearance exposes common controls first, a live typography preview, and Advanced customization for Studio. Notes and Journal retain their dedicated full-screen surfaces.
- The open More menu must appear above the Ambient clock. Readability combines a mild overall veil with a linear central treatment; unknown uploads and strong contrast retain conservative protection.

## Notes workspace exception — 11 October 2026

By explicit user request, Notes uses a light, full-screen workspace inspired by the supplied Notely screenshot. Its sidebar, search, quick capture, pinned cards, and note grid use `--notes-*` colors from `newtab/tokens.css`. The user's actual notes fill the cards; the reference's sample content is not included. The dashboard opens the standalone extension frame through `core/ui.js`, with the outer heading/navigation hidden. Injected webpage capture uses the same responsive workspace in its secure frame, retaining keyboard, drag, and resize controls. Existing dark preference remains available. Notes continues to include tasks and habits.

## Settings workspace — 11 October 2026

Settings is a full-screen, focused page. A quiet desktop rail exposes its eight sections; smaller screens use one section selector. Each section keeps a narrow reading width, clear heading, and grouped controls. Appearance, Focus, and Reminders use calm cards instead of one uninterrupted form. The palette follows the dashboard's effective light or dark theme using shared `--settings-*` tokens. The dedicated layout replaces the shared tool switcher while Settings is open; the close control and Escape return to the dashboard.

Status: active from Stage 0, 9 October 2026

This is the visual contract for every existing and future ONEFLOW feature. The product should feel like a calm place to begin work: scenic, focused, quiet, and easy to understand.

## 1. Product feeling

ONEFLOW uses one visual promise: a peaceful environment for starting and sustaining focused work. If an element adds noise before it adds value, hide it, simplify it, or remove it.

## 2. Hierarchy

Every screen has one focal point:

- Home: clock and daily focus.
- Focus: active task and timer.
- Ambient: scene and atmosphere.
- Settings and tools: the current section or task.

No screen may have two equally loud primary actions.

## 3. Backgrounds

The background is the hero. It must create atmosphere without competing with the content. Every scene must work with the shared readability treatment, keep the clock legible, and belong to the same color-graded collection.

## 4. Shared visual system

All shared colors, spacing, radii, shadows, blur, typography, motion, and canvas tokens live in `newtab/tokens.css`. Components consume these tokens; they do not redefine them.

One-off values are allowed only when they describe component geometry or a documented accessibility requirement. They are not allowed for decorative styling.

## 5. Color

Use background color for atmosphere, neutral text for hierarchy, one approved accent for action and selection, and danger colors only for destructive actions. Do not add decorative colors just to make a widget stand out.

## 6. Progressive disclosure

The first view contains only the greeting, clock, date, main focus, search, and one quiet dock. Secondary features belong in the dock, expandable areas, panels, or Focus Mode controls.

## 7. Typography and spacing

Typography must communicate priority without making every element bold. Whitespace is part of the product. Use the shared spacing scale and keep control heights, icon sizes, and heading hierarchy consistent.

## 8. Controls and panels

Use filled controls only for the primary action. Secondary actions should be quiet until needed. Panels share one shell, close behavior, tab treatment, padding, border, radius, and empty-state language.

## 9. Focus Mode

During a focus session, unrelated widgets disappear. The active task, timer, progress, pause/resume, finish/stop, sound access, and exit action remain available. Focus Mode must be quieter than Home.

## 10. Motion and accessibility

Motion clarifies state, transition, or progress. It must respect reduced-motion settings. All controls require readable contrast, a visible keyboard focus state, an accessible name, and a usable touch target.

## 11. New-element admission rule

Before adding a permanent visible element, answer:

1. What user problem does it solve?
2. Why must it be visible immediately?
3. What existing element can it replace or combine with?
4. Can it live in the dock or a panel instead?
5. Does it use existing tokens and component patterns?
6. Does it work on Home, Focus, Ambient, and mobile?
7. Does it preserve the calm first impression?

If these answers are unclear, the element must not become permanently visible.

## 12. Definition of done

A visual change is complete only when it has been checked on desktop and mobile, in light and dark themes, over scenic backgrounds, with keyboard navigation, reduced motion, first-run/empty/error states, and the relevant browser tests. The change must not introduce a second design language or a new source of shared tokens.

## Stage 1/2 implementation decisions

- Default palette: sage action (`--accent`), warm neutral text, green-charcoal surfaces. User-selected accent colors remain supported.
- Home clock: 128px maximum at weight 400 by default; 24px greeting, 12px secondary text. Saved custom typography remains authoritative.
- One centered dock contains Tasks, Sounds, Journal, Tools and Options. Missing/disabled widgets do not leave empty shortcuts.
- Options owns view switching, settings, fullscreen, shortcuts, scenery, quote/weather and optional links/countdowns. Music and Stats remain in Tools.
- Readability follows scene metadata, contrast preference and the extra-shading control. Home/Focus protect central text; Ambient removes the central shade; pure black/white canvases need no image shade.
- Explicit Studio widget placements may opt out of the default disclosure. Reverting to the default layout restores those widgets to Options. Extra custom dock tools wrap on narrow screens.
- Preserve user data and custom preferences during visual migrations. Only a complete match to the previous stock look is upgraded automatically.
- Run `node scripts/styles.js`, `node scripts/check.js`, the unit suite and `tests/calm-home-browser.js` for changes to this baseline. New source remains dependency-free at runtime; bundled SVG assets are rendered offline to WebP.
- The first view may include one quiet daily quote because it supports the same greeting/clock ritual as the background; weather, links, dates, and management tools remain progressive.
- Static artwork is sourced from `/wallpaper`; live media is sourced from `/livewallpaper`. New media must be indexed with `npm run wallpapers`, use safe local filenames, and preserve a still fallback.

## Stage 5/6 contract (supersedes earlier panel and dock details)

- The primary dock is Tasks, Sounds, Journal, More. Secondary tools, including Stats and Notifications, do not earn permanent home buttons.
- `core/ui.js` owns the dialog lifecycle, heading, close control, focus handling and tool navigation. `newtab/system.css` is the shared final styling layer; components must not create competing panel frames.
- Standard panels use 20px radius, 24px desktop padding, 16px compact padding, the shared border and solid theme surface. Responsive widths/heights are geometry, not additional design tokens. Prefer flat sections and separators to nested glass cards.
- Journal remains a full-screen writing surface by explicit user choice on 2026-10-10. Its paper/dark writing palette, calendar geometry and optional saved writing font are deliberate exceptions. Do not turn it back into a floating panel.
- Default interface type is the shared Segoe UI stack; user-selected typography remains supported. Body text is 14px, secondary 12px, labels 11px, headings 24px at weight 550, and metrics 32/48px at weight 400. Use weight, scale and placement—not color alone—to establish hierarchy.
- Use spacing tokens for 4/8/12/16/24/32/48px rhythm (40px remains a page-padding option). Controls use 44px targets, 12px radius and 20px locally bundled Lucide icons. Small elements use 8px radius. Chart dimensions and seven-column calendar cells are documented geometry exceptions.
- Tabs and selected controls use the shared quiet surface and underline/border indication. Empty states explain what appears here and the next step without congratulating an empty dataset.
- Destructive actions belong in a separated footer or secondary action menu, with an explicit label and confirmation or undo. Errors must explain recovery; do not silently replace useful content with a blank surface.
- Toasts are dismissible, pause dismissal on hover/focus, and remain operable above a modal. Errors persist until dismissed. Notification history is local, bounded to 40 records, and cleared only after confirmation; no new permissions or remote calls are required.
- For changes to this contract, regenerate styles, run the static and unit checks, and run `tests/stats-notifications-browser.js` in Chrome and Edge. Check filled/empty/error states, 1440/390/320px widths, both themes, keyboard focus and reduced motion. Keep generated CSS in sync with its sources.

## Panel redesign Stage 1 contract

- Standard tool panels use All tools and a compact Switch tool disclosure in the shared frame. Notes, Journal and Settings retain their dedicated navigation.
- Tools offers search, explicit favorites and local recent tools. These do not add permanent Home controls.
- Capsules leads with saved context and Resume; capture and management remain progressive. Recall, Garden, Career and Skills use searchable collections with one selected detail and contextual views where appropriate.
- Preserve unfinished editors while switching these tools within a tab. Hidden views retain editor values; selection and contextual view survive a save. Do not imply drafts survive reload unless persisted explicitly.
- Reuse existing typography, surfaces, spacing and action tokens. Mobile collections become a compact horizontal strip above detail; controls remain keyboard accessible with usable touch targets. Context tabs implement arrow, Home and End navigation.
- Verify this contract with `tests/panel-redesign-browser.js` in Chrome and Edge plus the baseline checks above. Reference `docs/PANEL_REDESIGN_STAGE_1_REPORT.md` for scope and evidence.

## Panel redesign Stage 2 contract

- First Step Mode leads with saved small beginnings once they exist; new entry uses disclosure. Search and state filters expose one editable action and its two-minute start control.
- Next-Step Compiler separates the brief from the editable plan. The first action is open, later actions expandable, and Notes/Journal copies secondary. Suggestions remain deterministic and editable before task creation.
- Focus Recovery leads with the saved next action and one return control. Editing, deletion and recovery preferences are disclosed. The return handler reads current timer state before resuming so retained views cannot overwrite a running interval.
- These tools retain drafts during switching in the same tab, not across reloads. Verify using `tests/panel-entry-browser.js` in Chrome and Edge and the work-context regression.

## Panel redesign Stages 3 and 4 contract

- DNA leads with its explanatory recipe; learning, switch-counting and deletion remain explicit in Learning & privacy.
- Energy Planner separates Today, Task effort and Energy pattern. Energy Weather separates Check in, History and Recovery. Priorities leads with up to three chosen tasks and searches the remaining task collection.
- Proof of Work and Afterglow use searchable collections with one selected project/meeting. Deliverables and report approval are separate; meeting overview, actions and follow-up are separate. Read fresh project evidence/session references when preparing reports and require per-line export approval.
- Quiet Web separates Now, Later and Reference links with search. Browser review is explicit and optional; parking requires confirmation and a saved capsule before closing matching inactive tabs. Long URLs wrap on mobile.
- Planner, Weather, project and meeting editors retain drafts during tool switching within a tab. Quiet Web and DNA refresh their read-dependent views rather than retaining stale browser/learning snapshots. No draft persistence across closing/reloading is implied.
- Verify using `tests/panel-planning-browser.js` in Chrome and Edge, journeys/work-context regressions, and the shared panel baseline checks.

## Panel redesign Stage 5 contract

- Sounds separates Mixer, Saved mixes and Sleep, with shared playback controls. Saved mixes/master volume refresh from local state, and scheduled stop status remains truthful.
- Scenes uses searchable Built-in/Saved collections and one selected atmosphere/action. Capture, duplicate, rename and deletion use disclosure. Async refreshes must still own the current view before replacing it. Scene apply/undo retains existing semantics and active timer deadlines.
- Music uses Listen/Search views inside the shared frame, with theme-token surfaces and disclosed API credentials. Loading a search result returns to Listen. Opening/reopening Music never connects a player automatically; leaving the tool disposes playback/search resources while retaining input drafts during live tool switching.
- Website Blocking remains in Settings and separates Rules/Activity with current configuration status. Optional host permissions and Flow-only session rules retain their existing contract.
- Escape dismisses the shared panel from a focused search field on its first press. Verify with the environment suite, controlled provider playback/search, isolated real-rule fixtures and shared panel/Home checks.

## Panel redesign Stages 6–8 contract

- Daily check-in separates Today/History and discloses optional priorities/draft management. Reflection keeps the latest recorded session and restores its saved text; Mood labels recorded choices. Suggestions lead with one local idea.
- Stats separates Overview/Patterns while retaining its chart, daily data and exports; resize the chart when returning to Overview. Notifications search and filter All/Unread/Attention without changing bounded history or clear confirmation.
- Countdowns show date-ordered searchable milestones with quiet management. Web search stays explicit; Dictionary discloses its connection/privacy controls and keeps its session cache. Command search explains keyboard navigation and result counts.
- Help/Feedback are separate contexts; feedback drafts survive live tool switching and exports remain local. Customize retains its nonmodal preview and gets searchable category navigation; Layout switches the existing editor category without discarding the preview.
- Final release audit covers packaged offline tools, checksum/CRC, browser runtime errors, optional grants, initial JS and cached startup. Treat native consent, live provider availability and unavailable Firefox runtime as explicit unverified release gates.
- Stage reports describe delivered scopes. The full recommendation has separate exact-layout progress in `docs/PANEL_REDESIGN_RECOMMENDATION_STATUS.md`; do not equate stage completion with every suggested extra behavior being implemented.
