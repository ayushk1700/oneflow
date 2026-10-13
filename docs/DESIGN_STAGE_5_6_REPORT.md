# Design Stages 5 and 6 — dedicated workspaces, Focus and Plan

Implemented on 13 October 2026 after the user explicitly advanced the task from Stages 3/4 to Stages 5/6. Stop before Stage 7. Existing implementations were audited and retained where they already met the constitution; changes address the remaining gaps and data/session regressions. This is source-checkout verification, not a release approval.

## Stage 5: dedicated workspaces

- Notes retains its fullscreen Paper workspace with sidebar, search, quick capture, pinned notes, the actual user note grid, dark preference, tasks and habits. Dedicated navigation remains independent; the outer heading/switcher is hidden. Existing task IDs, timer links, habit check-ins and reminders remain live.
- Secure webpage capture retains its authorized frame, text-safe rendering, keyboard move/resize/focus loop, protected-page fallback and close/focus restoration. Forged webpage frames cannot read or initialize the Notes UI. No reference-image sample data was added.
- Journal retains fullscreen paper/dark/auto writing surfaces, calendar and saved font/size choices. Daily check-in keeps Today/History, optional priorities and draft management. Session reflection reads the latest recorded session and restores saved text.
- Check-in disables submission while saving and ignores repeated submits. A completed save refreshes only the same connected form, so choosing another check-in or tool cannot be undone by a late refresh.
- Fixed cross-tool Journal writes: Journal can save a generated record ID, so looking up today's entry by a date-as-ID was incorrect. Added a shared date-based save boundary used by Journal, evening check-in, compiler exports and recovery re-entry. It preserves the existing record ID and prompt, serializes concurrent dated writes, respects backup operations and refuses oversized text before writing. Existing entry contents are preserved during appends; no data migration or deletion was introduced.
- Settings retains eight desktop sections and its compact selector, narrow grouped content, effective-theme Workspace tokens, common Appearance controls, live type preview and Advanced customization. Website Blocking remains in Settings with Rules/Activity and truthful current status. Close/Escape and focus return work. Optional permissions and Flow-only enforcement remain unchanged.

## Stage 6: Focus and Plan

- Capsules already led with saved context and Resume, progressive capture/management, optional tabs/notes and protected restoration. Added matching-result status and a truthful empty search result.
- Recovery already led with a saved next action and one current-state return handler; editing, deletion and privacy preferences stay disclosed. Its journal-line option now appends to the same dated entry rather than creating another record.
- Compiler retains deterministic offline suggestions, an editable plan with the first action open, expandable later actions, reviewed task creation and secondary Notes/Journal copies. The Journal copy now preserves existing dated writing even when its ID was generated.
- First Step now places saved beginnings first in a searchable/state-filtered collection with one editable selected action and its two-minute start. New entry is disclosed once saved work exists. Rescue/history remains supplemental. Empty state still offers the direct first-entry form.
- Focus DNA retains its explanatory recipe and explicit learning, switch-counting and deletion controls. No new observation or privacy opt-in is enabled.
- Quiet Web retains Now/Later/Reference search, explicit optional browser review and fresh browser-dependent views. Parking requires inline confirmation and a saved return capsule before matching inactive tabs close. The active tab remains open; reopening avoids duplicates.
- Energy Planner retains Today/Task effort/Energy pattern, editable estimates, protected unassigned recovery blocks and visible unplaced tasks.
- Priorities retains three numbered slots and searchable remaining tasks. Its start action now also refuses a paused restored interval with no session ID, preventing that context from being reset.
- Countdowns retains searchable, date-ordered milestones and disclosed management. Live filters/editors remain in the shared panel lifecycle.

No tools were merged, no permanent Home controls added, and no dependencies, permissions, secrets or remote services introduced. Existing user data and saved appearance choices were preserved. The pre-existing working tree was kept; no combined commit was made.

## Changed file tree

```text
core/
  journal.js                       new shared dated-save boundary
  work-context.js                  recovery Journal append uses existing entry
components/
  journal/workspace.js             shared save boundary
  rituals/index.js                 evening check-in preserves dated entry
  compiler/index.js                outline appends to existing dated writing
  firststep/index.js               saved collection leads; new-entry disclosure
  capsules/index.js                search result/empty status
  queue/index.js                   protect paused restored intervals
newtab/
  widgets.css, app.css             regenerated/verified generated styles
tests/
  design-stage-5-6-browser.js       new dated-writing and session regression checks
  combined-notes-browser.js        exact labels and current habit-table assertions
  journal-fullscreen-browser.js    workspace-local export download path
  panel-planning-browser.js        current contextual tabs and download path
  work-context-browser.js          current scoped capsule-save action
  journeys-tabs-browser.js         Windows fixture copy fallback
  panel-boundaries-browser.js      Windows fixture copy fallback
docs/
  DESIGN_CONSTITUTION.md           append-only Stage 5/6 decision
  RELEASE_CHECKLIST.md             named acceptance coverage
  DESIGN_STAGE_5_6_REPORT.md        this report
  qa-results/design-stage-5-6-chrome.json
  qa-results/design-stage-5-6-baseline.json
  qa-results/{combined-notes,notes,notes-overlay,settings-page,
              panel-entry,panel-planning,work-context,journeys-tabs,
              panel-boundaries}-chrome*.json
  screenshots/{entry,planning,work,combined-notes,journal-page}-chrome-*.png
```

Journal fullscreen and detailed capture artifacts also live in the existing ignored `test-results/` directory. Test repairs account for the current application: habit filtering opens the weekly table, project reporting uses Work history/Deliverables/Review report, and capsule capture uses Save capsule inside its panel. These are test adaptations, not new Stage 7 product work. Windows denied fixture junction creation; runners fall back to copying named source folders into isolated test checkouts. Production manifest permissions remain optional. A workspace-local download path allows actual exported Journal content to be read and checked.

## Load and test

In Chrome open `chrome://extensions`, enable Developer mode, Load unpacked → `D:\BOOKS\ONEFLOW`, or reload the existing installation. Open a fresh new tab. No compilation is needed to run the extension.

Manual acceptance walk:

1. Open Notes. Search/pin/create your own notes, edit existing tasks/habits and check saved state after reopening. Use the extension toolbar on a normal webpage to capture selected text; exercise keyboard move/resize, Escape and focus return.
2. Open Journal, write/save a reflection and adjust its appearance/typeface. Copy an edited compiler outline to today's Journal and verify the original writing remains on that same page. Save a check-in and inspect Today/History and the latest session reflection.
3. Open Settings through More. Visit all eight sections, verify the compact selector, Appearance preview/Studio disclosure and Website Blocking Rules/Activity. Close or Escape back to More.
4. Open Focus/Plan tools. Create and resume a saved beginning; search Capsules; edit an outline before adding tasks; retain a draft while switching tools. Plan tasks around recovery blocks and check unplaced work. Verify Priorities cannot replace a paused interval. Search date-ordered milestones.
5. Review Quiet Web tabs explicitly. Confirm parking only after a return capsule exists, then reopen saved tabs. Check DNA learning/switch-counting/deletion controls, optional permission denial and offline behavior.

Reproduce from the repository root:

```powershell
node scripts/styles.js
node scripts/check.js
node --test tests/*.test.js
$env:ONEFLOW_NODE_MODULES = 'C:/Users/ayush/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules'
node tests/design-stage-5-6-browser.js
node tests/combined-notes-browser.js chrome
node tests/notes-capture-browser.js chrome
node tests/notes-overlay-browser.js chrome
node tests/journal-fullscreen-browser.js chrome
node tests/settings-page-browser.js chrome
node tests/panel-entry-browser.js chrome
node tests/panel-planning-browser.js chrome
node tests/work-context-browser.js chrome
node tests/journeys-tabs-browser.js chrome
node tests/panel-boundaries-browser.js chrome
node scripts/measure-design-baseline.js chrome --output=design-stage-5-6-baseline.json
```

The runtime path is machine-specific and test-only. All runners use disposable profiles; no user's browser profile is altered. Actual tab parking and blocking rules are tested in isolated fixtures with pre-granted permissions. Native permission-dialog appearance/interaction remains a manual release check.

## Acceptance checklist

| Criterion | Result | Evidence |
|---|---|---|
| Manifest paths, CSP, syntax, safe rendering, local assets | PASS | `scripts/check.js` |
| Existing schema, privacy, timer and data behavior | PASS | 104 unit tests |
| Shared dated Journal ID/text/prompt, serialized appends, size limit, latest saved session reflection | PASS | Stage 5/6 regression browser checks |
| First Step saved-first collection, disclosed capture, filters, live edited action and actual two-minute session | PASS | Regression checks + panel-entry: 5 check groups |
| Priorities protects a paused interval with no session ID | PASS | Regression browser checks |
| Date-ordered/searchable milestones and offline dated-writing persistence | PASS | Regression browser checks |
| Notes/tasks/habits IDs, history, search/filter, legacy routes and shortcut persistence | PASS | Combined Notes: 4 check groups |
| Notes autosave, literal markup, labels/pinning/task conversion, attachments/drawing/voice, conflict/backup/trash, responsive themes | PASS | Notes capture: 7 check groups |
| Secure injected capture, move/resize, keyboard trap/return, forged-frame rejection, alarms and protected-page fallback | PASS | Notes overlay: 5 check groups |
| Journal fullscreen, immediate-close draft, saved dark/font/size, manual save/export, calendar/search, compact/offline/reduced motion | PASS | Journal fullscreen: 3 check groups |
| Settings eight sections, retained Focus draft, reminders, compact selector, Data and Escape | PASS | Settings page: 4 check groups |
| DNA opt-in, Energy pattern/effort/recovery, unplaced tasks, three priorities, Quiet Web denial, independent drafts/themes | PASS | Panel planning: 9 check groups |
| Capsule capture/restore guards, shared-session recovery, edited task creation, DNA observations/privacy deletion, backup and denied tab access | PASS | Work context: 7 check groups |
| Real tab category/confirmation/capsule-before-close/active-tab protection/duplicate-free reopening | PASS | Journeys tabs: 1 check group |
| Real Flow-only session rules, pause/resume deadline continuity, exit cleanup and disconnect | PASS | Panel boundaries: 2 check groups |
| Page errors/unexpected remote calls in relevant suites | PASS | Saved browser reports |
| Edge | UNVERIFIED | Installed browser startup crash before extension loading; Stage 3/4 evidence retained |
| Initial JavaScript | PASS | 152,825 bytes (149.24 KiB), below the 153,600-byte cap |
| Cached startup target | FAIL | Median 331.3ms, maximum 425.7ms across eight reloads; target is below 300ms for every sample |

## Performance measurement

Chrome 154.0.8037.98 on the recorded Windows host measured 152,825 initial static JavaScript bytes, median initialization 331.3ms and maximum 425.7ms. Results, individual samples and initial-module hashes are in `qa-results/design-stage-5-6-baseline.json`. The earlier Stage 3/4 failed run is also retained. Functional test browsers were closed before this measurement; no threshold was relaxed.

Inspection found no added eager Journal/tool code in these stages: the dated-writing helper and hub metadata are loaded with their tools, and the global switcher no longer loads on initial Home. Artwork decoding already runs outside the readiness path. The remaining startup target is an open performance/release gate; the measurement does not establish a cause or measure first paint. Stages 5/6 functional acceptance passes, but overall release acceptance does not.

## Known limits and decisions

Edge crashes before loading the extension. Firefox, audible playback, native permission prompts, screen-reader speech and extracted-release checks remain unverified release work. No package/publish action was performed. The earlier Stage 3/4 performance run exceeded 300ms and is preserved; final source measurement is recorded separately after functional browser runners close, without changing thresholds or deleting failed evidence.

All in-scope functional requirements are implemented or verified in their existing implementation. Current names and independent workflows remain. No additional decision is required from the user. Stop before Stage 7.
