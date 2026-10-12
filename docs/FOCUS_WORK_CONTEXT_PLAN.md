# Focus work context implementation plan

Requested scope: Focus Capsules → Focus Recovery → Next-Step Compiler → Local Focus DNA → Energy-Based Day Planner. This stage delivers the offline first implementation of all five tools, without AI or calendar services.

1. Establish a versioned, local-only `focusWork` document behind `core/storage.js`, bounded learning observations in IndexedDB, and validated backup/reset support.
2. Capture named capsules containing ordinary current-window web tabs on an optional grant, active tasks, selected note text/checklists, remaining timer time, background, soundscape and selected Scene. Restore without replacing a live session, editing newer tasks, closing tabs, autoplay or double-counting historical focus.
3. Record one lightweight recovery point on pause/early stop/dashboard departure, with an optional reason and next action. Preserve the active session when resuming; offer a fresh ten-minute interval when no session remains.
4. Compile pasted text deterministically into an editable outcome and three to five actions, rough effort estimates and focus-block counts. Persist actions with outcome and selected Scene metadata; connect the first action to the shared timer, and provide Notes and Journal actions.
5. Make learning and switch counting separate opt-ins. Compare repeated local observations with explicit denominators and an association warning. Require at least six observations and three in each comparison group. Support applying next-session duration/sound/break conditions and deleting learning data.
6. Build manual, non-overlapping daily energy blocks. Match task effort to compatible capacity, never assign recovery time, retain unplaced tasks, and suggest earlier demanding work only after repeated deep-work observations support it.
7. Verify pure rules, actual extension-worker transitions, optional permission fallback, granted tab APIs in an isolated fixture, backups/deletion, responsive themes, keyboard navigation, reduced motion and offline behavior.

Design: all five tools live in More → All tools and command search. Focus session options expose Save a capsule and Leave a resume note. Shared panels and tokens remain authoritative; no permanent Home widgets are added.

Main risks and mitigations: shared timer locks prevent active-session replacement; revision guards preserve session identity; restored intervals begin with only the captured remaining time; note copies preserve current notes; serialized URL matching includes pending navigations to prevent duplicates; sampling is opt-in, bounded and explainable. Browser-native permission consent must remain under user control.
