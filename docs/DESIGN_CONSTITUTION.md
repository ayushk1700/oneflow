# ONEFLOW Design Constitution

**Version 2.0 · 12 October 2026**
**Status:** Active. This is the single source of truth for ONEFLOW's visual and interaction rules.

This document replaces the append-only v1 constitution (Stage 0, 9 October 2026, plus all stage contracts up to 11 October 2026). Nothing from v1 was dropped: principles stay in Part 1, current specs in Part 5, and dated history in the Decision Log (Part 8).

Release and test procedures live in [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md), not here. The [Stage 0 audit](DESIGN_STAGE_0_REPORT.md) records implementation gaps, measured baselines, and pending decisions; it is not approval of proposed product changes.

## How to read this document

| Part | Contents | Changes how often |
|---|---|---|
| 1. Principles | Why ONEFLOW looks and behaves the way it does | Rarely |
| 2. Navigation map | Where every control lives | When navigation changes |
| 3. Surface families | Approved visual exceptions | When an exception is added |
| 4. Tool hubs and admission | How tools are grouped and admitted | When a tool is added or merged |
| 5. Component specs | Current rules per screen and tool | Per stage |
| 6. Measurable criteria | Testable targets | When targets are tuned |
| 7. Browser support | Supported and unverified browsers | Per release |
| 8. Decision log | Dated, append-only history | Every decision |
| 9. Glossary | Definitions of terms and tool names | When terms are added |

**Rule for editing:** Parts 1–7 and 9 are edited in place so they always describe the present. Only Part 8 is append-only. Never write "supersedes" notes in Parts 1–7; log the change in Part 8 and update the rule itself.

---

# Part 1. Principles

## 1.1 Product feeling

ONEFLOW makes one visual promise: a peaceful environment for starting and sustaining focused work. It should feel like a calm place to begin work: scenic, focused, quiet and easy to understand. If an element adds noise before it adds value, hide it, simplify it or remove it.

## 1.2 Hierarchy

Every screen has one focal point:

- **Home:** clock and daily focus.
- **Focus:** active task and timer.
- **Ambient:** scene and atmosphere.
- **Settings and tools:** the current section or task.

No screen may have two equally loud primary actions.

## 1.3 Backgrounds

The background is the hero. It creates atmosphere without competing with content. Every scene must work with the shared readability treatment, keep the clock legible (see 6.1) and belong to the same color-graded collection.

## 1.4 Shared visual system

All shared colors, spacing, radii, shadows, blur, typography, motion and canvas tokens live in `newtab/tokens.css`. Components consume these tokens; they do not redefine them.

One-off values are allowed only for component geometry or a documented accessibility requirement. They are not allowed for decorative styling.

## 1.5 Color

Use background color for atmosphere, neutral text for hierarchy, one approved accent for action and selection, and danger colors only for destructive actions. Do not add decorative colors to make a widget stand out.

## 1.6 Progressive disclosure

The first view contains only the greeting, clock, date, main focus, search, and the quiet navigation defined in Part 2 (plus one quiet daily quote, see 5.1). Secondary features belong in More, expandable areas, panels or Focus Mode controls.

## 1.7 Typography and spacing

Typography communicates priority without making every element bold. Whitespace is part of the product. Use the shared spacing scale and keep control heights, icon sizes and heading hierarchy consistent. Use weight, scale and placement, not color alone, to establish hierarchy.

## 1.8 Controls and panels

Use filled controls only for the primary action. Secondary actions stay quiet until needed. Panels share one shell, close behavior, tab treatment, padding, border, radius and empty-state language.

## 1.9 Focus Mode

During a focus session, unrelated widgets disappear. The active task, timer, progress, pause/resume, finish/stop, sound access and exit action remain available. Focus Mode must be quieter than Home.

## 1.10 Motion and accessibility

Motion clarifies state, transition or progress. It respects reduced-motion settings. All controls require readable contrast, a visible keyboard focus state, an accessible name and a usable touch target. Meaning never depends on color alone.

## 1.11 New-element admission rule (visible elements)

Before adding a permanent visible element, answer:

1. What user problem does it solve?
2. Why must it be visible immediately?
3. What existing element can it replace or combine with?
4. Can it live in More or a panel instead?
5. Does it use existing tokens and component patterns?
6. Does it work on Home, Focus, Ambient and mobile?
7. Does it preserve the calm first impression?

If the answers are unclear, the element must not become permanently visible. Tools have a separate admission rule (4.3).

## 1.12 Definition of done

A visual change is complete only when it has passed the checks in `RELEASE_CHECKLIST.md`, section "Per-change gate". The change must not introduce a second design language or a new source of shared tokens.

## 1.13 Data and trust principles

These apply to every feature:

- Preserve user data and custom preferences during visual migrations. Only a complete match to the previous stock look is upgraded automatically.
- Learning, switch counting and similar tracking are separate, explicit opt-ins.
- Recovery language describes unfinished progress and never judges tab changes.
- Energy ratings are voluntary. Proposals stay editable before they create tasks.
- Report exports require approval per line.
- Destructive actions need an explicit label plus confirmation or undo, in a separated footer or secondary menu.
- Errors explain recovery. Never silently replace useful content with a blank surface.
- Selecting a scene never starts audio. Opening Music never connects a player automatically.
- New source stays dependency-free at runtime. No new permissions or remote calls are added for local features.

---

# Part 2. Navigation map

This part is the only place that describes where controls live. If another section disagrees, this part wins and the other section is a bug.

## 2.1 Home

| Position | Control |
|---|---|
| Center | Greeting, clock, date, focus entry, search |
| Top-right | Journal |
| Bottom-left | Notes, Sounds |
| Bottom-right | More (includes Settings) |
| Above footer (tall desktop) | One quiet daily quote; in document flow on compact layouts |

- Secondary shortcuts share quiet surfaces. The focus action keeps the filled accent.
- Missing or disabled widgets do not leave empty shortcuts. Extra custom tools wrap on narrow screens.
- Explicit Studio placements are authoritative and may opt out of the default disclosure. Reverting to the default layout restores those widgets to More.

## 2.2 Name of the overflow menu

The overflow menu is called **More**. The names "Options" and "Tools" (as menu names) are retired. "Tools" now means only the searchable All tools list inside More.

## 2.3 What More contains

- All tools (searchable, with explicit favorites and local recent tools)
- Settings
- View switching, fullscreen, shortcuts, scenery
- Quote and weather options, optional links and countdowns
- Stats and Notifications (secondary, never permanent Home buttons)

## 2.4 Tasks

Tasks are reached through the Home focus entry (existing task selection) and the Notes workspace (which includes tasks and habits). There is no separate permanent Tasks button.

> **Open item (confirm):** v1 listed Tasks in the dock; the 11 October Home refinement removed the dock in favor of corner navigation. This map assumes Tasks lives in the focus entry and Notes. Confirm or adjust.

## 2.5 Ambient

While Ambient is active, Home shortcuts and Settings are reached through More. Controls: Back to Home, More, Immersive, scene picker, compact shared sound controls. The active-session pill returns to the existing focus session without changing its deadline.

## 2.6 Dedicated navigation

Notes, Journal and Settings keep their own full-screen navigation. All other tool panels use the shared frame with **All tools** and a compact **Switch tool** disclosure.

---

# Part 3. Surface families

ONEFLOW has three approved surface families. Every family uses tokens from `newtab/tokens.css`. No fourth family may be added without an entry in this part and a log entry in Part 8.

| Family | Surfaces | Palette | Token prefix |
|---|---|---|---|
| **Calm** (default) | Home, Focus, Ambient, standard tool panels | Sage accent, warm neutral text, green-charcoal surfaces over scenery | `--` shared tokens |
| **Paper** | Journal, Notes | Light paper or dark writing palette; Notes uses a light workspace | `--notes-*`, journal palette |
| **Workspace** | Settings | Follows the dashboard's effective light or dark theme | `--settings-*` |

## 3.1 Alias token rule

Each family maps to the shared base tokens through alias tokens (for example `--notes-surface: var(--surface-paper)`). Components inside a family consume the alias, never raw values. This keeps exceptions swappable when the base palette changes.

## 3.2 Exception register

A new exception requires an entry with: the surface, why the Calm family is not enough, the user decision or evidence behind it, the date and the tokens involved.

| Surface | Reason | Source | Date |
|---|---|---|---|
| Journal | Full-screen writing surface; paper/dark writing palette, calendar geometry and optional saved writing font | Explicit user choice | 2026-10-10 |
| Notes | Light, full-screen workspace; sidebar, search, quick capture, pinned cards and note grid use `--notes-*` colors | Explicit user request, inspired by supplied Notely screenshot | 2026-10-11 |
| Settings | Full-screen focused page with its own palette via `--settings-*` | Settings redesign | 2026-10-11 |

Do not turn Journal back into a floating panel.

---

# Part 4. Tool hubs and admission

## 4.1 Why hubs

Hiding tools in More reduces visual noise but not cognitive load. Tools are therefore grouped into five hubs plus System utilities. Within More, the All tools list shows hubs first, then tools.

## 4.2 Hub map

Internal names are kept. "Display label" is the plain-language name shown in menus and command search, with the internal name as an optional subtitle.

| Hub | Tool (internal name) | Display label |
|---|---|---|
| **Focus** | Capsules | Capsules (saved context) |
| | Focus Recovery | Resume work |
| | Next-Step Compiler | Next steps |
| | First Step Mode | First step |
| | Focus DNA | Focus patterns |
| | Quiet Web | Quiet web |
| **Plan** | Energy Planner | Day planner |
| | Priorities | Priorities |
| | Countdowns | Countdowns |
| **Reflect** | Daily check-in | Daily check-in |
| | Energy Weather | Energy check-in |
| | Afterglow | Meeting follow-up |
| | Stats | Stats |
| | Suggestions | Suggestions |
| **Learn and Career** | Recall Rooms | Recall |
| | Idea Garden | Ideas |
| | Skill Loops | Skills |
| | Career Sprint | Career |
| | Proof of Work | Proof of work |
| | Dictionary | Dictionary |
| **Environment** | Sounds | Sounds |
| | Scenes | Scenes |
| | Music | Music |
| **System** | Notifications, Customize, Help and Feedback, Web search, Command search | as named |

Website Blocking remains in Settings.

> Display labels are a proposal. Rename in the UI only after the command-search aliases are added, so the old names still find the tools.

## 4.3 Tool admission rule

A new tool may be added only if all of these are true:

1. It states, in one sentence, the user problem it solves that no existing tool solves.
2. It joins an existing hub, or it replaces or merges with a tool in one.
3. Its hub stays at six tools or fewer. A seventh tool forces a merge or retirement.
4. It has a plain-language label and command-search aliases for its internal name.
5. It uses the shared panel, flat sections and theme tokens (5.4).
6. It is secondary: no new permanent Home element.
7. It has a named browser test and an owner.

## 4.4 Merge review

These pairs overlap in purpose and should be reviewed for merging before any new tool is added to their hubs:

| Candidates | Question to settle |
|---|---|
| Capsules and Focus Recovery | Is "resume" one workflow with two entry points? |
| Energy Planner and Energy Weather | Is the check-in just the first step of planning? |
| Next-Step Compiler and First Step Mode | Is the two-minute start a mode of the compiler? |
| Next-Step Compiler and Priorities | Do both turn intent into chosen tasks? |
| Proof of Work, Career Sprint and Afterglow | Do all three produce reports and follow-up? |

A merge decision is logged in Part 8 with the user-facing impact.

---

# Part 5. Component specs

## 5.1 Home

- Default clock: 128px maximum at weight 400. Greeting 24px, secondary text 12px. Saved custom typography remains authoritative.
- The focus entry is explicitly editable, with 25 / 50 / custom duration selection. Existing task selection shares this entry and preserves the custom draft when switching back.
- One quiet daily quote is allowed because it supports the same greeting and clock ritual as the background. Attribution and quote actions use native disclosure for touch and keyboard access. Weather, links, dates and management tools remain progressive.
- Readability combines a mild overall veil with a linear central treatment. Unknown uploads and strong contrast retain conservative protection. Home and Focus protect central text.
- The open More menu appears above the Ambient clock.
- No permanent Home widget is added for any secondary tool.

## 5.2 Focus

- A lighter task heading, one dominant timer, accessible progress and context-specific follow-up actions.
- Active session options may expose capsule capture and resume-note entry.
- Capsule restore pauses media and offers a quiet re-entry screen; it never replaces an active interval.
- Focus Mode is quieter than Home (1.9).

## 5.3 Ambient

- Scenery-first view with a matte clock at lower-left, a local-time caption, scene picker, compact shared sound controls, Back to Home, More and Immersive.
- Clock and Sounds widget visibility still apply. The center remains clear and Ambient removes the central shade.
- Immersive fades controls after four seconds. Pointer or keyboard activity reveals them; focused controls and open menus stay visible; Escape exits immersion.
- Scene selection never starts audio.
- Controls and matte clock colors use shared tokens. Controls stack on compact screens.

## 5.4 Shared panels

- `core/ui.js` owns the dialog lifecycle, heading, close control, focus handling and tool navigation. `newtab/system.css` is the final shared styling layer. Components do not create competing panel frames.
- Standard panels: 20px radius, 24px desktop padding, 16px compact padding, the shared border and a solid theme surface. Responsive widths and heights are geometry, not extra tokens.
- Prefer flat sections and separators to nested glass cards.
- Tabs and selected controls use the shared quiet surface with an underline or border indicator. Context tabs support arrow, Home and End keys.
- Empty states explain what will appear and the next step, without congratulating an empty dataset.
- Escape dismisses the shared panel on its first press, including from a focused search field.
- Tools offers search, explicit favorites and local recent tools.
- Unfinished editors are preserved while switching tools within a tab. Hidden views retain editor values; selection and contextual view survive a save. Drafts are not implied to survive a reload unless persisted explicitly.
- Mobile collections become a compact horizontal strip above the detail view. Long URLs wrap.
- Concept and skill maps are semantic responsive groups. Confidence and due dates stay readable without color.
- Capture forms collapse after saved work exists.

## 5.5 Typography, spacing, controls

- Default interface type: the shared stack in 5.5.1. User-selected typography remains supported.
- Body 14px, secondary 12px, labels 11px, headings 24px, metrics 32 and 48px at weight 400.
- Spacing tokens follow a 4 / 8 / 12 / 16 / 24 / 32 / 48px rhythm. 40px remains a page-padding option.
- Controls: 44px targets, 12px radius, 20px locally bundled Lucide icons. Small elements use 8px radius.
- Chart dimensions and seven-column calendar cells are documented geometry exceptions.

### 5.5.1 Font stack and weights

```css
--font-ui: "Segoe UI", system-ui, -apple-system, "SF Pro Text", Roboto,
           "Helvetica Neue", Arial, sans-serif;
--weight-regular: 400;
--weight-medium: 500;
--weight-heading: 600;
```

**Change from v1:** v1 specified heading weight 550. Weight 550 renders only with variable fonts, and Segoe UI is not installed on macOS, Linux or ChromeOS. v2 defines weights as tokens (400 / 500 / 600) and adds a cross-platform fallback chain. Optionally bundle one variable UI font locally; if so, restore a 550 token and log it in Part 8.

## 5.6 Colors and readability

- Default palette: sage action (`--accent`), warm neutral text, green-charcoal surfaces. User-selected accent colors remain supported.
- Readability follows scene metadata, the contrast preference and the extra-shading control. Pure black or white canvases need no image shade.
- Static artwork comes from `/wallpaper`; live media from `/livewallpaper`. New media is indexed with `npm run wallpapers`, uses safe local filenames and keeps a still fallback. Bundled SVG assets are rendered offline to WebP.

## 5.7 Notes (Paper family)

- Light, full-screen workspace. Sidebar, search, quick capture, pinned cards and the note grid use `--notes-*` colors from `newtab/tokens.css`.
- The user's actual notes fill the cards; the reference's sample content is not included.
- The dashboard opens the standalone extension frame through `core/ui.js` with the outer heading and navigation hidden. Injected webpage capture uses the same responsive workspace in its secure frame, keeping keyboard, drag and resize controls.
- The existing dark preference remains available. Notes continues to include tasks and habits.

## 5.8 Journal (Paper family)

- Full-screen writing surface with its paper/dark writing palette, calendar geometry and optional saved writing font.
- Daily check-in separates Today and History, discloses optional priorities and draft management. Reflection keeps the latest recorded session and restores its saved text. Mood labels recorded choices.

## 5.9 Settings (Workspace family)

- Full-screen focused page. A quiet desktop rail exposes eight sections; smaller screens use one section selector.
- Each section keeps a narrow reading width, a clear heading and grouped controls. Appearance, Focus and Reminders use calm cards, not one uninterrupted form.
- The palette follows the dashboard's effective theme through `--settings-*` tokens.
- The dedicated layout replaces the shared tool switcher while Settings is open. The close control and Escape return to the dashboard.
- Appearance exposes common controls first, a live typography preview, and Advanced customization for Studio.
- Website Blocking stays in Settings with Rules and Activity views and current configuration status. Optional host permissions and Flow-only session rules keep their existing contract.

## 5.10 Focus hub tools

- **Capsules:** lead with saved context and Resume; capture and management are progressive. May show bundled scenery previews and actual linked history.
- **Focus Recovery:** leads with the saved next action and one return control. Editing, deletion and recovery preferences are disclosed. The return handler reads current timer state before resuming so retained views cannot overwrite a running interval.
- **Next-Step Compiler:** separates the brief from the editable plan. The first action is open, later actions expandable, Notes/Journal copies secondary. Suggestions are deterministic and editable before task creation.
- **First Step Mode:** leads with saved small beginnings once they exist; new entry uses disclosure. Search and state filters expose one editable action and its two-minute start control.
- **Focus DNA:** leads with its explanatory recipe. Learning, switch counting and deletion remain explicit in Learning and privacy.
- **Quiet Web:** separates Now, Later and Reference links with search. Browser review is explicit and optional; parking uses inline confirmation and a saved capsule with a return path before closing matching inactive tabs. Refreshes browser-dependent views rather than retaining stale snapshots.

## 5.11 Plan hub tools

- **Energy Planner:** separates Today, Task effort and Energy pattern. Estimates are editable. Recovery time stays unassigned and unplaced tasks stay visible.
- **Priorities:** leads with up to three chosen tasks and searches the remaining task collection.
- **Countdowns:** date-ordered, searchable milestones with quiet management.

## 5.12 Reflect hub tools

- **Energy Weather:** separates Check in, History and Recovery. Ratings are voluntary.
- **Afterglow:** searchable collection with one selected meeting; overview, actions and follow-up are separate.
- **Stats:** separates Overview and Patterns, keeping its chart, daily data and exports. Resize the chart when returning to Overview.
- **Suggestions:** lead with one local idea.

## 5.13 Learn and Career hub tools

- **Recall Rooms, Idea Garden, Career Sprint, Skill Loops:** searchable collections with one selected detail and contextual views where appropriate.
- **Proof of Work:** searchable collection with one selected project. Deliverables and report approval are separate. Read fresh project evidence and session references when preparing reports, and require per-line export approval.
- **Dictionary:** discloses its connection and privacy controls and keeps its session cache. Web search stays explicit.

## 5.14 Environment hub tools

- **Sounds:** separates Mixer, Saved mixes and Sleep with shared playback controls. Saved mixes and master volume refresh from local state; scheduled stop status stays truthful.
- **Scenes:** searchable Built-in and Saved collections with one selected atmosphere and action. Capture, duplicate, rename and delete use disclosure. Async refreshes must own the current view before replacing it. Apply and undo keep existing semantics and active timer deadlines.
- **Music:** Listen and Search views in the shared frame with theme-token surfaces and disclosed API credentials. Loading a search result returns to Listen. Leaving the tool disposes playback and search resources while retaining input drafts during live tool switching.

## 5.15 System tools

- **Toasts:** dismissible, pause dismissal on hover or focus, operable above a modal. Errors persist until dismissed.
- **Notifications:** local history bounded to 40 records, cleared only after confirmation. Search and filter All, Unread and Attention.
- **Command search:** explains keyboard navigation and result counts.
- **Help and Feedback:** separate contexts. Feedback drafts survive live tool switching; exports stay local.
- **Customize:** keeps its nonmodal preview and has searchable category navigation. Layout switches the existing editor category without discarding the preview.

---

# Part 6. Measurable criteria

"Calm", "quiet" and "noise" are intentions. These are the testable targets that stand in for them. Values marked *proposed* are starting points to validate against the current build, then lock.

## 6.1 Legibility

| Criterion | Target |
|---|---|
| Body and secondary text contrast | At least 4.5:1 (WCAG AA) |
| Large text (clock, headings) and UI components | At least 3:1 |
| Clock legibility over every scene | Automated check samples luminance behind the clock region per scene and fails below target |
| Readability veil | Defined as tokens with a documented min and max opacity. Current formulas and measured defaults are recorded in the Stage 0 audit; these are observations, not newly approved limits. |

## 6.2 Calm first view

| Criterion | Target |
|---|---|
| Distinct element groups in the first view | At most 9 (*proposed; pending approval*): greeting, clock, date, focus entry, search, quote, Journal, bottom-left group, More. Count semantic groups, not nested controls. Separate branding, Settings, and other visible additions must be reported, not omitted. A dedicated numeric assertion is still needed; `calm-home-browser.js` currently checks selected visible/hidden controls and layout. |
| Interactions from Home to a running focus session | 2 or fewer (*proposed*) |
| Permanent Home elements added by tools | 0 |

## 6.3 Performance

| Criterion | Target |
|---|---|
| Initial JS size | Stage 0 baseline: 152,249 bytes (148.68 KiB) for the eager static import graph. Keep the existing hard gate below 150 KiB; an additional +5% allowance remains *proposed* and cannot override that gate. |
| Cached startup | Existing hard gate: each measured cached ready sample below 300 ms. Stage 0 Chrome median 207.45 ms / maximum 330.20 ms fails this gate; Edge did not launch. An additional +10% regression allowance remains *proposed*. See the audit for measurement limitations. |

## 6.4 Tool load

| Criterion | Target |
|---|---|
| Tools per hub | At most 6 |
| Tools reachable from command search by plain label | 100% |

---

# Part 7. Browser support

| Browser | Status |
|---|---|
| Chrome | Supported. Full browser suite required. |
| Edge | Supported. Full browser suite required. |
| Firefox | **Unverified.** Not a supported release target until a Firefox runtime is available and the smoke test in `RELEASE_CHECKLIST.md` passes. |

> **Decision needed:** v1 listed the Firefox runtime as an unverified gate without saying whether Firefox is supported. This version declares Chrome and Edge supported and Firefox unverified. Change this table if you intend to ship on Firefox.

---

# Part 8. Decision log

Append-only. Newest entries at the bottom. Format: date, decision, source.

| Date | Decision | Source |
|---|---|---|
| 2026-10-09 | Stage 0: constitution becomes the visual contract for all existing and future features | Stage 0 |
| 2026-10-09 | Stage 1/2: sage default palette; 128px clock; one centered dock (Tasks, Sounds, Journal, Tools, Options); Options owns view switching, settings, fullscreen, shortcuts, scenery, quote/weather and links/countdowns; Music and Stats in Tools | Stage 1/2 |
| 2026-10-09 | Stage 1/2: readability follows scene metadata, contrast preference and extra-shading; Studio placements may opt out of default disclosure | Stage 1/2 |
| 2026-10-09 | Stage 1/2: one quiet daily quote allowed on first view | Stage 1/2 |
| 2026-10-09 | Stage 5/6: dock reduced to Tasks, Sounds, Journal, More; Stats and Notifications become secondary; panel lifecycle moved to `core/ui.js`; 20px panel radius; typography and spacing scale fixed; destructive-action, toast and notification rules set | Stage 5/6 |
| 2026-10-10 | Journal stays a full-screen writing surface by explicit user choice | User |
| 2026-10-10 | Panel redesign Stage 1: All tools and Switch tool disclosure; Tools search, favorites and recents; Capsules lead with Resume; collections with one selected detail | Panel Stage 1 |
| 2026-10-10 | Panel redesign Stage 2: First Step Mode, Next-Step Compiler and Focus Recovery restructured; drafts retained across tool switches in a tab only | Panel Stage 2 |
| 2026-10-10 | Panel redesign Stages 3 and 4: DNA, Energy Planner, Energy Weather, Priorities, Proof of Work, Afterglow, Quiet Web restructured | Panel Stages 3-4 |
| 2026-10-10 | Panel redesign Stage 5: Sounds, Scenes, Music and Website Blocking restructured; Escape closes panel from search field | Panel Stage 5 |
| 2026-10-10 | Panel redesign Stages 6-8: Check-in, Stats, Notifications, Countdowns, Dictionary, Command search, Help, Customize restructured; release audit scope defined | Panel Stages 6-8 |
| 2026-10-11 | Home refinement: corner navigation (Journal top-right, Notes/Sounds bottom-left, More/Settings bottom-right); editable focus entry; quote placement; lighter focus heading; Appearance common controls first | User refinement prompt |
| 2026-10-11 | Ambient redesign: scenery-first view per user-approved mockup; Immersive mode | User-approved mockup |
| 2026-10-11 | Notes becomes a light full-screen workspace using `--notes-*` tokens | User request |
| 2026-10-11 | Settings becomes a full-screen workspace using `--settings-*` tokens | Settings redesign |
| 2026-10-11 | Focus work context: Capsules, Recovery, Next-Step Compiler, Focus DNA, Energy Planner are secondary tools with no new Home widget | Focus work context |
| 2026-10-11 | Personal workspaces: First Step Mode, Recall Rooms, Idea Garden, Proof of Work, Energy Weather, Afterglow, Career Sprint, Quiet Web, Skill Loops are secondary tools | Personal workspaces |
| 2026-10-12 | **Constitution v2:** restructured into nine parts; navigation unified on corner layout with "More" as the only overflow name; tool hubs and tool admission rule added; surface families and exception register added; typography weights tokenized (550 replaced by 600 in proposal); measurable criteria added; browser support declared; release process moved to `RELEASE_CHECKLIST.md`; glossary added | Design analysis |
| 2026-10-12 | Design Stage 0: established canonical release checklist; corrected nine-item Home counting proposal without approving it; recorded source baselines and missing measurement coverage; clarified Studio and Flow from code. Product proposals remain pending; no runtime/UI implementation changed. | DESIGN_STAGE_0_REPORT.md |

---

# Part 9. Glossary

Entries marked *(confirm)* were inferred from v1 and should be checked.

| Term | Meaning |
|---|---|
| **More** | The single overflow menu at bottom-right of Home. Contains All tools, Settings and view options. |
| **All tools** | The searchable list of tools inside More and the shared panel frame. |
| **Switch tool** | Compact disclosure in the shared panel frame for moving between standard tools. |
| **Studio** | The advanced customization editor reached from Appearance, including explicit layouts, typography and scene preferences; confirmed in Settings and the Studio runtime. |
| **Flow** | Explicit fullscreen Flow Mode, distinct from an ordinary focus session or the dashboard Focus view. Current blocking requires Flow active, Flow blocking selected, blocker enabled, and a running unexpired focus interval; pauses, breaks and leaving Flow release blocking. Verified in `core/blocker-logic.js`. |
| **Capsule** | A saved work context (task, notes, linked history, optional scenery) that can be resumed. |
| **Recovery (Focus Recovery)** | Shows the saved next action after an interruption and offers one control to return. Describes unfinished progress without judging. |
| **Next-Step Compiler** | Turns a brief into an editable plan of actions, then optional tasks. |
| **First Step Mode** | Stores small beginnings with a two-minute start control. |
| **Focus DNA** | A local, opt-in view of the user's focus patterns, shown as an explanatory recipe. |
| **Energy Planner** | Plans the day by task effort and energy pattern; keeps recovery time unassigned. |
| **Energy Weather** | Voluntary energy check-in with history and recovery views. |
| **Afterglow** | Meeting follow-up: overview, actions, follow-up. |
| **Proof of Work** | Project evidence and reports; export needs per-line approval. |
| **Quiet Web** | Now, Later and Reference links plus optional, confirmed tab parking. |
| **Recall Rooms / Idea Garden / Skill Loops / Career Sprint** | Searchable collections for recall practice, ideas, skills and career goals respectively. |
| **Scene** | A background atmosphere (built-in or saved). Selecting one never starts audio. |
| **Immersive** | Ambient state in which controls fade after four seconds. |
| **Surface family** | One of Calm, Paper or Workspace (Part 3). |
| **Hub** | One of the five tool groups in Part 4. |
