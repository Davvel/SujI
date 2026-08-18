# SuJi — Snapshot 1.24.0

> **Checkpoint naming from v1.20.0 onward:** the checkpoint number is the full semantic version itself (`Major.Minor.Patch`). Therefore this release is **Checkpoint 1.20.0**, not Checkpoint 19.


## v17.0.4 — Edge-aware Hint speech bubbles

- Hint speech bubbles now keep a readable width near screen edges.
- When the originating shape/control is near the right edge, the bubble automatically opens to the left.
- In that flipped state, the speech-bubble pointer moves to the right side so it still points back to the originating object.
- PWA cache namespace updated to v17.0.4.


## v17.0.3 — Hint permanently in Board heading
- Placement Hint bulb now remains in the Board heading in both portrait and landscape, immediately to the left of the Picture button.
- Picture remains the far-right Board control in both orientations.
- The old lower Board Hint taskbar is retired entirely in both orientations.
- Landscape now gives the recovered vertical space back to the square Board instead of reserving space beneath it.
- Portrait keeps the compact no-scroll layout introduced in v17.0.1/v17.0.2.
- PWA cache namespace updated to v17.0.3.

## v17.0.2 — Portrait whitespace reclamation
- Portrait Board panel now sizes to its actual Board content instead of stretching vertically, removing the unused white area below the square Board.
- The reclaimed vertical space is given to the Rack, keeping the single-screen portrait play goal.
- In portrait, the Hint bulb is immediately to the left of the Picture button; Picture remains the far-right top control.
- Landscape/desktop presentation remains unchanged.
- PWA cache namespace updated to v17.0.2.

## v17.0.1 — Portrait no-scroll normal play

- Portrait normal play is now sized to the visible viewport so the Board and Rack remain on screen together without page scrolling.
- The former Board taskbar is removed from portrait layout and the placement Hint bulb is moved beside the Picture button in the Board heading.
- The Rack title is hidden in portrait because the tray itself is visually self-explanatory; landscape keeps the Rack heading and existing Board taskbar.
- Portrait Board padding, headings, gaps, and Rack framing are tightened to reclaim vertical space while keeping the Board square and playable.
- The portrait Rack is a bounded bottom tray and no longer grows vertically to enlarge pieces; its packing adapts to the available tray instead.
- Landscape/desktop gameplay layout remains unchanged.
- PWA cache namespace updated to v17.0.1.

## v17.0.0 — Protected Checkpoint 17 baseline

Checkpoint 17 freezes the accepted Checkpoint 16 v16.1.2 state as the protected deployment and rollback baseline. No gameplay or UX behavior changed during the checkpoint save.

---

# SuJi — Checkpoint #16 v16.1.2



## v16.1.2 — Hint destination visibility and snap cue

- Hint Mode now reveals every matching destination for the selected shape, including destinations temporarily covered by another board shape.
- Covered destinations are shown as a translucent silver/dashed stencil above the blocking shape so the player can still see that the hinted shape belongs there.
- A movable board shape covering one of those revealed destinations may be dragged away while Hint Mode remains active. Locked starting shapes remain immovable.
- Occupied hint destinations cannot accept the hinted shape until the blocker is moved.
- When the selected hinted shape locks onto a free compatible destination, that target now changes to a strong red/coral tint and glow to clearly communicate that releasing will snap the shape there.
- Normal play outside Hint Mode is unchanged.
- Portrait normal-play redesign is intentionally not included in this release.
- PWA cache namespace updated to v16.1.2.

## v16.1.1 — Locked-shape bubble refinement

- Locked starting-shape feedback now uses the same local non-modal bubble treatment as Sudoku conflicts.
- Message shortened to **“Locked Shapes cannot be moved.”**
- The bubble is positioned beside the locked shape the player tried to move.
- The bubble clears when the player grabs a movable shape.
- Existing locked-shape bump/flash feedback and all gameplay rules remain unchanged.
- PWA cache namespace updated to v16.1.1 so installed/offline clients receive the refinement.

## v16.1.0 — Sudoku conflict UX cleanup

- Removed the `Sudoku Rule,` prefix from Sudoku conflict messages.
- Simplified conflict wording to forms such as `2 cannot be twice in a row.`, `6 cannot be twice in a column.`, and `5 cannot be twice in a 3 by 3 area.`
- Moved Sudoku conflict text from the Board heading into a compact non-modal bubble positioned beside the active offending tile.
- The bubble follows the currently focused conflict and repositions responsively without blocking drag/drop.
- Existing red conflict cells, yellow row/column/3×3 rule-region highlighting, conflict shaking, and locked/pinned-shape behavior are retained.
- PWA cache namespace updated so installed/offline clients receive the v16.1.0 files.


## v16.0.0 — Protected Checkpoint 16 baseline

Checkpoint 16 freezes the accepted Snapshot 15 v15.0.1 PWA build as the new protected rollback reference. No gameplay behavior has been changed. This baseline includes the full installable PWA setup, offline service worker/cache, manifest, mobile install experience, SuJi app icons, Hint Mode refinements, immediate press-and-drag touch behavior, and all previously accepted Sudoku/gameplay behavior.

---

## v15.0.1 — True Progressive Web App

- SuJi is now installable as a real Progressive Web App when served over HTTPS (including GitHub Pages).
- Added a Service Worker (`sw.js`) so the application shell, puzzle patterns, images and icons are cached for reliable offline reopening after the first successful load.
- Added a mobile install offer using the browser's native PWA install flow when available.
- Added iPhone/iPad guidance for Safari's **Share → Add to Home Screen** installation route.
- Upgraded the Web App Manifest with app identity, scope, categories, standalone display mode, and dedicated maskable icon support.
- Added a new SuJi app icon family: 192px, 512px, 512px maskable, and 180px Apple Touch icon, plus an SVG source.
- Added Apple mobile-web-app metadata and Home Screen icon linkage.
- Existing Snapshot 15 gameplay, Hint Mode, Sudoku feedback, levels, pictures and drag behaviour are unchanged.

## Deployment note

For installability, publish the package through HTTPS. GitHub Pages already provides HTTPS, so no special server configuration is required beyond publishing these files together at the site root.

---

## v15.0.0 — Protected Snapshot 15 baseline

Snapshot 15.0.0 froze the accepted v14.2.4 gameplay state, including the orange↔purple Hint Mode guidance borders, immediate press-and-drag touch behaviour, nearby drag guidance bubble, shimmering hint destinations, and the accepted non-modal locked-shape feedback.

# SuJi — Snapshot #14 v14.2.4

## Snapshot 14 baseline

- Snapshot #14 is created directly from the accepted Checkpoint #13 v13.0.4 build.
- No gameplay behaviour is changed by this snapshot creation.
- This is the protected starting baseline for Snapshot #14.
- New versioning convention begins here: **v1.14.0**.
  - `1` = first major release line.
  - `14` = Snapshot / checkpoint number.
  - `0` = no minor revision has yet been made within Snapshot 14.
- Future minor revisions within this snapshot should increment the final component: v1.14.1, v1.14.2, and so on.


## v14.2.4 — guided area glow + one-touch Hint drag
- Entering Hint Mode now gives the **Rack Area** an animated shimmering border that cycles from orange to purple, clearly indicating where the player should choose a shape.
- Once a Rack shape is selected, the Rack emphasis stops and the **Board Area** receives the animated shimmering border instead.
- Fixed the mobile touch flow so pressing a Rack shape can immediately continue into dragging that same shape in one continuous gesture; lifting the finger and pressing again is no longer required.
- The selected-shape bubble still appears beside the chosen shape while the finger is initially resting there.
- As soon as the pointer/finger moves the selected shape away from its starting position, the bubble disappears automatically.
- Existing silver shimmering fit areas, wrong-shape lock wiggle, and selected-shape attention pulse are preserved.

## v14.2.3 — clearer Rack wording + safe empty-Rack hint disable
- The Hint bubble wording is now: **“Tap a shape from the Rack Area to Reveal where it can fit.”**
- If the Rack is empty, the Hint bulb is now automatically disabled so the player cannot try to use Hint when there is no selectable Rack shape.
- The disabled Hint bulb also exposes clearer accessibility text explaining that the Rack is empty.

## v14.2.2 — larger mobile message text
- Increased the font size of the main gameplay messages to improve readability on mobile.
- This includes the Hint speech bubble, the top non-modal Sudoku / pinned-shape warning strip, and the compact bottom tutorial/information messages.
- The first-game intro modal text was also increased slightly for consistency.

## v14.2.1 — follow-the-selected-shape guidance
- After a shape is selected for a Hint, the **“Drag the selected Shape onto the board.”** bubble moves away from the bulb and appears **right beside that selected shape** so the player’s attention stays on the correct piece.
- As soon as the player starts dragging the selected shape, that bubble disappears.
- While a Hint is active, trying to drag any other movable shape now behaves like a temporary locked attempt: the wrong shape wiggles and does not start dragging.
- At the same time, the correct selected shape performs a stronger zoom pulse to say **“drag me.”**
- The silver shimmering fit areas remain visible as before.

## v14.2.0 — stronger placement Hint guidance
- After a Hint selects a Rack shape, **all currently free same-shape fit areas** on the Board are shown in **solid silver** rather than only one destination.
- These silver fit areas now have a soft shimmer and gentle wiggle so they are much easier to notice on mobile.
- The selected Rack shape also performs a subtle wiggle, reinforcing which shape the player should drag.
- The instructional message is no longer separated from the bulb; it now appears as a **non-modal cartoon speech bubble** directly above the Hint bulb.
- The active Hint message text is now: **“Drag the selected Shape onto the board.”**
- Pressing the bulb still does not consume a hint by itself; the hint is consumed only when the player taps a Rack shape and the guidance is revealed.

## v14.1.0 — Mobile-first placement Hint UX
- Placement Hint no longer consumes a hint when the bulb is pressed. The bulb first enters **Hint Mode**.
- In portrait mobile Hint Mode, the Board is compacted and the Rack becomes a compact visible tray so both remain on screen together without requiring the player to scroll between them.
- The first tap on a Rack shape selects it and reveals that shape's exact canonical destination; the player may release their finger immediately.
- The hint is consumed at the instant the destination is revealed, preventing free reveal-and-cancel abuse.
- The selected shape and its destination remain highlighted until the player places it correctly or explicitly exits the already-consumed hint guidance.
- Releasing the selected shape back into the Rack does not consume another hint and does not erase the revealed destination.
- Before any shape is selected/revealed, tapping the active Hint bulb cancels Hint Mode for free.
- A single hint is locked to one selected shape and cannot reveal additional destinations.
- Existing Sudoku, pinned-shape, picture, guide, scoring and level behaviour is otherwise preserved.

## v1.14.1 — Non-modal pinned-shape warning
- Trying to move a locked starting shape now uses the same non-modal Board warning area as Sudoku-rule errors; it no longer opens the bottom tutorial modal.
- Warning text changed to: **“Pinned shape, starting shapes cannot be moved.”**
- The pinned-shape warning remains visible until another warning replaces it or the player grabs any movable shape.
- No gameplay is blocked by this warning.

## Inherited accepted behaviour

Snapshot #14 preserves the full accepted v13.0.4 state, including:
- five placement hints on every level;
- authoritative purple Hint lock-on placement;
- Hint-confirmed pieces receive a silent correctness lock only in their exact canonical home;
- uncertain pieces involved in a Sudoku conflict shake, while system-locked and correctly Hint-confirmed pieces do not;
- successful Hint drops terminate the drag cleanly on mouse/finger release.

---

# SuJi — Checkpoint #13 v13.0.4

## v13.0.4 — Hint drop release / drag cleanup fix

- Fixed a v13.0.3 JavaScript error that occurred after releasing a piece onto a locked purple Hint destination.
- The Hint drop code was incorrectly reading `target.targetPiece.id` even though `target` was already the target piece object.
- The error interrupted `cleanupDrag()`, leaving the drag ghost attached to the mouse/finger even after release.
- Corrected the exact-home test to use `target.id === drag.id`.
- Successful Hint drops now commit to the board, terminate the drag immediately, consume the Hint normally, and retain the silent correctness-lock behaviour only for the piece's own canonical home.
- All v13.0.3 behaviour is otherwise preserved.

Checkpoint #13 branches from the latest Checkpoint #12 build, v12.0.2.


## v13.0.3 — correct Hint certainty + complete conflict shaking

- Fixed a bug where snapping a piece with a placement Hint into **any compatible same-shape placeholder** incorrectly gave it the invisible correctness lock.
- A piece now receives the silent Hint correctness lock **only when it is placed into its own exact canonical home placeholder**.
- Same-shape but wrong-home placements remain uncertain and therefore shake when they participate in an active Sudoku conflict.
- The protection check also verifies that a Hint-confirmed piece is still physically at its own home, preventing stale correctness state from suppressing a legitimate shake.
- This specifically fixes cases such as a movable 2×2 `5-6 / 9-1` piece failing to shake during a 3×3 duplicate-number conflict.
- Preserves the five placement hints per level, authoritative purple lock-on drop, and all v13.0.2 conflict rules.

## v13.0.2 — fair Sudoku conflict shaking + silent Hint correctness lock

- Sudoku conflicts no longer automatically blame only the most recently placed piece.
- For the active Sudoku error, **every movable/uncertain piece participating in that error shakes**. If two ordinary pieces conflict, both shake because either one may be the piece the player chooses to move.
- System starting/anchor pieces remain fully locked and never perform the Sudoku-error reminder shake.
- A piece placed successfully into the exact purple destination using a placement Hint gains an invisible **correctness lock** for conflict feedback. It stays movable and shows no padlock icon, but it will not shake while it remains in the Hint-confirmed home position.
- If another piece later conflicts with that Hint-confirmed piece, only the uncertain piece shakes. The exact conflicting cells can still receive the normal red Sudoku styling.
- If the player deliberately moves a Hint-confirmed piece away from its confirmed home, its invisible correctness protection is removed and it becomes an ordinary uncertain piece again. Cancelling an attempted move or an invalid drop that restores it to the same home restores the protection.
- Preserves v13.0.1 five placement hints per level and the v13.0.0 authoritative purple-lock drop behaviour.

## v13.0.1 — five placement hints on every level

- Every level now starts with exactly **5 placement hints** in the Board taskbar.
- Placement hints are now independent from the legacy starting/locked-hints count.
- Using a placement hint consumes one from the five-count as before.
- Resetting, replaying, or entering any level replenishes the placement-hint counter to 5.
- The v13.0.0 authoritative purple placeholder lock remains unchanged.


## v13.0.0 — authoritative purple placeholder lock

- When a placement-hint target has visibly locked purple, that target becomes authoritative for the current drag.
- Releasing the mouse/finger commits the piece to that highlighted placeholder even if the pointer drifts slightly before release.
- The drop no longer requires the final rounded pointer-derived board cell to still equal the locked guide target.
- The locked destination is still validated with the normal `fits(...)` check before placement.
- Rack-return behaviour and non-hint free placement are unchanged.

---

# SuJi — Checkpoint #12

## Frozen end state: v12.0.2

- Checkpoint #12 ended with the locked-placeholder release fix that is carried forward as the starting baseline for Checkpoint #13.


## Current UI changes

- Removed the Board eyebrow text “PLAY HERE”.
- Removed the Rack eyebrow text “FACE-UP PIECES”.
- Removed the Rack “Pattern … shape families” summary.
- Removed the Board “Picture / Guides ON” summary text; the picture-preview icon remains.
- Removed “Show Pieces Guide” from Settings.
- Added a compact Board taskbar below the Board.
- Added a yellow placement-hint bulb with a remaining-hints counter.
- Pressing the bulb consumes one hint, greys/disables it, and shows a pulsing bulb message in the normal Sudoku-warning location: “Next piece: we’ll show where it can fit.”
- The next movable piece grabbed reveals matching available destinations.
- The hint message disappears after that piece is dropped, including when dropped back into the Rack.
- If hints remain, the bulb is enabled again; at zero it remains grey/disabled.
- The hint reveals destinations only and does not change the normal free-placement drop rules.

---

# SuJi — Checkpoint #11

## v11.0.0 — Ten fixed tessellation patterns

This build branches from the accepted Checkpoint #10 v10.0.2 state and begins Checkpoint #11.

### New tessellation system

- Added `patterns.js`, a centralized library containing 10 fixed 9×9 tessellations.
- Level-to-pattern mapping is deterministic and cycles every 10 levels: Level 1 → Pattern 1, ... Level 10 → Pattern 10, Level 11 → Pattern 1.
- Every pattern contains exactly 21 pieces and covers all 81 board cells exactly once.
- Every pattern uses five shape families.
- Each pattern uses eighteen 4-cell pieces and three 3-cell pieces; no 1×1 filler pieces are required.
- Patterns include I, O, T, L, S, J and Z-style tetromino families plus straight and bent triominoes.
- Pieces remain fixed-orientation: there is still no rotation mechanic.
- Sudoku generation remains level-based and deterministic, so the same physical pattern can carry different Sudoku numbers on different levels.
- Picture fragments continue to map from each piece's true home cells.
- Guides ON now renders the actual irregular cell silhouette for every destination piece.
- Guides OFF preserves free geometrically valid non-overlapping placement.
- Starting hints continue to select meaningful multi-cell pieces.
- Checkpoint #10 conflict wording and once-per-second violating-piece shake are preserved unchanged.

### Pattern cycle

| Levels | Pattern |
|---|---|
| 1, 11, 21, ... | 1 |
| 2, 12, 22, ... | 2 |
| 3, 13, 23, ... | 3 |
| 4, 14, 24, ... | 4 |
| 5, 15, 25, ... | 5 |
| 6, 16, 26, ... | 6 |
| 7, 17, 27, ... | 7 |
| 8, 18, 28, ... | 8 |
| 9, 19, 29, ... | 9 |
| 10, 20, 30, ... | 10 |

---

## Inherited Checkpoint #10 history

## Frozen baseline: v10.0.0

Checkpoint #10 starts from the accepted Checkpoint #9 v9.0.18 build.

## v10.0.2 — Restore shake when an earlier conflict resurfaces

- If the current conflict is removed and another highlighted Sudoku conflict remains, the yellow region continues to identify it and the piece that originally caused that conflict resumes its once-per-second reminder shake.
- No automatic Rack return.
- All v10.0.1 wording and behaviour are preserved.

## v10.0.1 — Sudoku Rule wording + offending-piece reminder shake

- Conflict text now uses `Sudoku Rule,` instead of `Illegal Move —`.
- User-facing message punctuation uses commas instead of em dashes.
- The most recently placed piece that creates the active Sudoku conflict stays on the Board and gives a short shake once every second.
- The piece does not automatically return to the Rack.
- The shake stops immediately when the player grabs that piece and resumes only if its new placement still causes a Sudoku conflict.
- Moving other pieces does not cancel the reminder shake while the original conflict remains.


This package is now the protected SuJi Checkpoint #10 baseline.

Future development should branch from this exact v10.0.0 state without modifying the frozen baseline directly.

### Accepted state carried into Checkpoint #10

- Compact SuJi header and single-line Level / Time / Moves status strip.
- Settings moved behind the top-right cog.
- Picture Guides and Jigsaw Picture switches live in Settings.
- Tutorial Levels 1–5 lock those settings with visible padlocks.
- Locked tutorial switches remain visually grey.
- Clicking a locked switch shakes the corresponding padlock every time.
- Tutorial lock message remains at the bottom of the Settings panel.
- Conflict warnings are non-modal, always shown while active, centered above the Board, and disappear immediately when fixed.
- Conflict warning triangle and text pulse for attention.
- Picture / Guides board summary remains permanently stacked.
- Level selector, timer, move counter, stars, progression gating and replay behavior from Checkpoint #9 are preserved.

---

## v9.0.18 — Locked settings padlock shake

- During Tutorial Levels 1–5, clicking either locked settings switch no longer does nothing silently.
- The related padlock now shakes every time the player tries to use the locked switch.
- The setting itself remains unchanged until Level 6.

## v9.0.17 — Settings close button changed to SVG image icon

- Replaced the text-based X with a true SVG image icon inside the close button.
- This allows the close mark to be centered precisely without relying on text glyph alignment.

## v9.0.16 — Close X centered precisely

- Reworked the close button so the X is truly centered in the square.
- Removed the earlier visual nudge and replaced it with exact centering.

## v9.0.15 — Settings window-style top bar and close-button centering tweak

- Styled the Settings title area as a distinct blue top bar, like a window header.
- Tweaked the X icon so it appears more vertically centered inside the close button.

## v9.0.14 — Close button centred, larger note text, padlocks moved by switches

- Centered the X inside the close button more accurately.
- Enlarged the bottom yellow-note text and kept it black for contrast.
- Moved each padlock so it sits next to the switch rather than next to the label text.

## v9.0.13 — Settings visual corrections

- Centered the close X button properly.
- Changed the bottom yellow-note text to black for better contrast.
- Moved the padlocks into the left side content area of each switch.
- Made the toggle switch colour grey during tutorial Levels 1–5.

## v9.0.12 — Bottom yellow message box and reserved space for future settings

- Moved the tutorial note to the true bottom of the Settings panel.
- Restyled the tutorial note as a yellowish message box rather than a button.
- Matched the note more closely to the SuJi warning/error message colour family.
- Reserved vertical space for three future setting options between the last switch and the bottom note.

## v9.0.11 — Settings popup close button and bottom tutorial note refinement

- Removed the Done button from the settings popup.
- Added a top-right X button to close the settings panel.
- Made the tutorial warning label more yellowish and bottom-aligned.
- Increased the gap between the last settings item and the bottom tutorial label.
- Enlarged the padlock icons.

## v9.0.10 — Settings dialog redesigned with two lockable switches

- Removed the explanatory text from the settings panel.
- Added two slider switches: Show Picture Guides and Show Jigsaw Picture.
- In Levels 1–5, both switches stay visible but show a small padlock and remain locked.
- From Level 6 onwards, the padlocks disappear and both switches can be turned on or off.
- Added a yellow tutorial note at the bottom: "During Tutorial Levels 1-5 Some settings are locked."
- Gave the settings panel a double-border treatment and stronger drop shadow.

## v9.0.9 — Cog opens settings popup

- The top-right cog button now opens a settings popup.
- Picture ON/OFF, Guides ON/OFF, and Hints are moved into that popup.
- The former in-page options panel is removed from the main layout.
- Tutorial levels show a note explaining that extra settings unlock from Level 6.

## v9.0.8 — Compact chrome and single-line status strip

- Reduced the height of the SuJi header bar.
- Replaced the top-right question-mark button with a cog-wheel placeholder for the future settings-based UI.
- Condensed Level selection, Time, and Moves into one thin, neat strip.
- Kept Restart on the same strip for a cleaner top layout.

## v9.0.7 — Picture / Guides always stacked

- The Board heading summary is no longer responsive.
- It always displays **Picture / No Picture** on the top line.
- It always displays **Guides ON / OFF** on the bottom line.
- This applies in landscape, portrait, desktop, tablet and mobile.

## v9.0.6 — Portrait condensed Picture / Guides summary

- On narrow portrait devices, the right-side mode summary is condensed to two lines.
- The first line shows Picture / No Picture.
- The second line shows Guides ON / OFF.
- This prevents overlap with the picture preview button.

## v9.0.5 — Slimmer warning label and pulsing text test

- Reduced the warning label height so it sits less tall.
- Kept the triangle free to protrude outside the label rectangle.
- Added a zoom-in / zoom-out pulse to the warning text as well as the triangle for visual testing.

## v9.0.4 — Softer warning triangle and better label balance

- The warning triangle is now less pointy and visually softer.
- The triangle is vertically centred at the left side of the warning label.
- The warning text is centred within the remaining label area between the triangle and the right edge.

## v9.0.3 — Conflict warning triangle enlarged and pulsing

- The warning triangle is now larger and can extend beyond the yellow conflict label.
- The triangle now zooms in and out with a clear pulse while the conflict remains active.
- The yellow warning label remains centered and non-modal.

## v9.0.1 — Empty options divider fully removed

- When Picture/Guides/Hints controls are unavailable, the whole options panel is now removed from layout rather than leaving its blue background/border visible as a thin divider.

## v8.0.11 — Level selector jump to 1–9999

- Level selector supports Levels 1 through 9999.
- Pages still contain up to 100 levels each.
- A player may type any whole level number from 1–9999 to jump directly to the page containing that level.
- Paging stops at the final page, Levels 9901–9999.
- No placeholder/cell is rendered for Level 10000 or any higher level.

## v8.0.10 — Tutorial hints fixed at 3

- Levels 1–5 always use exactly 3 starting hints, even if the player later chooses 1 or 2 hints from Level 6 onward.
- The player's Level 6+ hint preference remains stored in localStorage and is restored whenever a Level 6+ puzzle is entered.
- Replaying tutorial levels does not overwrite that saved preference.

## v8.0.9 — Hint progression + one-time picture introduction

- Hints stay hidden until the player has reached Level 6.
- Default hint count is 3 for a fresh browser profile; once changed, the player's chosen 1–3 value persists across future and replayed levels.
- The empty options/divider panel is removed whenever it has no visible controls.
- A fresh level automatically shows its completed-picture preview once, after a 2-second delay.
- Replays, Reset, and returning to any previously visited level do not auto-open the picture; the picture button remains available.
- Visited-level state is stored locally in the browser.

## v8.0.8 — Unlocked highest-level display fix

- Fixed the Level Selector so an unfinished level at or below `highest_level_reached` is shown unlocked with no padlock.
- Padlocks now render only for levels strictly above `highest_level_reached`.
- Progression and click behaviour are unchanged: all levels from 1 through the highest-ever reached level remain selectable.


- Level access is now based on the highest level ever reached, stored locally. Replaying an earlier level never re-locks later levels already reached.
- Any level from 1 through the highest-ever reached level can be opened from the selector, whether or not it is the currently active level.
- Levels above the highest-ever reached level remain locked and shake when tapped.
- Replaced the Placed / Conflicts / Remaining status boxes with a compact animated Time + Moves HUD.
- The live timer keeps running while overlays/selectors are open and stops only when the level is correctly completed.
- Time and Moves reset when a level is deliberately opened from the selector, when advancing to a new level, or when Reset/restart starts a fresh attempt.
- Tapping the current level in the selector merely closes the selector, preserving its running timer and move count.

## v8.0.2 — Local level history, best times, scores and 100-level selector
- Removed the previous/next < > arrows from the Level control.
- The level row now shows the current level plus a compact grid icon for opening level history.
- Added a 10×10 level picker showing 100 levels per page, with 100-level backward/forward paging.
- Completed past levels show their locally stored best completion time and score and can be replayed.
- Unvisited/unavailable levels show a padlock and cannot be selected.
- The current progression frontier cannot be skipped: only completed levels below the highest reached level are replayable.
- Added browser-local persistence for level history and highest level reached.
- A replay only updates the record when the completion time improves; slower attempts never overwrite the best result.
- Score is time-derived: 10,000 minus completion seconds, with a minimum of 100 points.
- Added a Well done completion screen showing the run time and score, followed by automatic progression to the next level.


## Checkpoint 5 v5.0.4 tutorial messaging
- All automatic onboarding/help messages in Levels 1–5 are one-line modal messages with an × close button.
- Each level-introduction message appears at most 3 times.
- Row, column and 3×3 conflict teaching messages each appear at most 3 times.
- Trying to drag a pinned starting tetromino shows a compact modal at most 3 times.
- Closing a conflict message immediately removes its yellow teaching stripe; the true red Sudoku conflict remains.
- All automatic tutorial/help messages are disabled after Level 5.
- Permanent board/rack instructional sentences were removed.
# SuJi — Checkpoint 5 v5.0.4

This build refines the original Checkpoint #1 prototype into the visual language intended to bridge SuJi Online and SuJi Printed.

## New in v2.1
- Three independent icon-style options:
  - Picture / No Picture
  - 1 / 2 / 3 starting hint pieces
  - pale colour-matched board guides On / Off
- Board guides are glass-like and contain no numbers.
- Rack is a loose, face-up "box of pieces" instead of framed tray cards.
- Piece colours are consistent by piece type:
  - I = blue
  - O = yellow
  - 1x1 helper = green
- Correct 9x9 square geometry is preserved at all times.
- Long I pieces can cross 3x3 Sudoku quadrant boundaries; quadrants are never stretched.
- Pointer-event drag/drop, deterministic Sudoku, deterministic piece order, locked anchors and Sudoku conflict highlighting are preserved.
- Picture fragments move with their pieces.
- No rotation.
- No service worker is registered in this development checkpoint, avoiding stale cached builds.

## Run
Because Picture Mode loads a resource image, serve the folder over HTTP:

    python3 -m http.server 8000

Then open:

    http://localhost:8000/SuJi_Checkpoint_1_v2_1/

For a phone on the same Wi-Fi, use your computer's LAN IP instead of localhost.


## v2.1.1 correction
- Each board destination is now a distinct faint colour-matched silhouette, so adjacent yellow O destinations no longer read as one huge yellow square.
- Blue I pieces show as unmistakable pale-blue 1×4/4×1 slots, like crossword word positions.
- Starting hint pieces now visibly travel from their real Rack positions upward to the board one after another.

## v2.1.2 board-guide refinement
- Each 2×2 yellow O-piece now has its own separate faint 2×2 destination indentation.
- Adjacent O-piece destinations have a small visible gutter, so they no longer merge into one huge yellow field.
- Destination areas are intentionally very faint, like coloured glass viewed from above.
- Same-colour darker lower/right bevels plus lighter upper/left highlights create a recessed 3D mould effect.
- Blue I pieces have separate pale-blue 1×4 or 4×1 slots.
- The green 1×1 helper has its own pale-green indentation.
- With Board Guide switched off, all coloured indentations disappear and the board becomes a normal clean 9×9 Sudoku board with only the 3×3 quadrant boundaries.

## v2.1.3 visual refinement
- Board-guide colours are now much lighter and more transparent, like very lightly tinted glass.
- The Sudoku board remains visible through every guide indentation.
- Guided mode now uses a subtle pale sage/green felt-like board surface to strengthen the physical-board illusion.
- The 3D cue is carried mainly by very soft bevel highlights/shadows rather than opaque colour fills.
- Adjacent 2x2 destinations remain individually separated and readable.
- No Guide mode still returns to a conventional clean Sudoku board with no coloured moulds.

## v2.1.4 visual correction
- Removed the green felt concept completely.
- Guided and No Guide modes now use the exact same clean white Sudoku board.
- Guide indentations are only a very faint translucent tint in the matching piece colour.
- The board and its lines remain clearly visible through every guide slot.
- Actual SuJi pieces remain bright, glossy, plastic-looking objects.
- Added a large faint circular SuJi watermark in the exact centre of the board.
- The watermark remains visible in both Guide and No Guide modes, making the relationship between the two board states immediately obvious.
- Guide mode therefore feels like a transparent mould/indentation layer placed over the same underlying Sudoku board.

## v2.1.5 guide-opacity correction
- Fixed a legacy CSS rule that was still applying a solid yellow/blue background directly to guide containers.
- Guide containers are now explicitly transparent.
- Yellow and blue guides are now only a tiny translucent tint over the white Sudoku board.
- The main visual cue comes from a faint same-colour indentation edge/refraction, not from colour fill.
- The central circular SuJi watermark has been made noticeably brighter while remaining subtle enough to function as a watermark.

## v2.1.6 visibility balance
- Increased guide visibility from v2.1.5 while preserving translucency.
- Yellow and blue slots now carry a noticeable but light tint over the same white board.
- Edge/refraction strength increased slightly so each destination piece remains individually readable.
- The large central SuJi watermark has been made more visible.
- Bright plastic game pieces are unchanged.

## v2.1.7 readability refinement
- Increased guide readability while keeping the guides translucent.
- Yellow and blue guide borders are now much clearer and the bevel/indentation effect is stronger.
- The white Sudoku board still shows through the guide slots.
- The central SuJi watermark is now faint but colourful rather than monochrome.
- The watermark ring is also a little easier to notice, without becoming gameplay clutter.

## v2.1.8 interaction and rack refinement
- Picture/No Picture, Start Hints 1/2/3, and Board Guide On/Off now always require confirmation before changing.
- Confirmation explicitly warns that changing the game option restarts the current level and erases progress.
- Rack pieces no longer overlap.
- Every rack piece has its own clear visual space so all numbers and image fragments remain readable.
- The Rack Area automatically becomes taller when necessary instead of shrinking or stacking pieces on top of one another.
- Narrow phones use fewer rack columns and more vertical space, preserving mobile readability.
- Pieces remain loose and face-up with no individual card/frame around them.

## v2.1.9 progress-protection and rack compaction
- Picture/No Picture, Start Hints, and Board Guide changes now restart immediately if the player has not manually placed/moved any piece.
- Those same changes ask for confirmation only after the player has made real progress.
- Previous Level, Next Level, and direct Level selection now also ask for confirmation only when manual progress would be lost.
- Board Area renamed to Board.
- Rack Area renamed to Rack.
- Rack spacing is tighter and more efficient while still preventing overlap.
- Wider screens use more rack columns; narrower phones use fewer columns and grow vertically only as much as needed.

## v2.2.0 checkpoint-2 final layout
- Rack packing is tighter again, reducing wasted vertical space while still preventing overlap.
- In portrait/mobile layout, Board remains above Rack.
- In landscape layout (for laptops and tablets held horizontally), the interface automatically changes to a two-column view:
  - Board on the left
  - Rack on the right
- Responsive layout is decided dynamically from the current viewport shape.
- The Rack remains mobile-friendly and grows only as much as required.
- Existing progress-protection behaviour remains:
  - configuration changes or level changes warn only if the player has already made manual progress.

## v2.2.1 adaptive rack sizing
- Replaced the conservative fixed-slot rack algorithm with a dynamic maximum-size packing algorithm.
- Rack pieces now grow as large as the actual available Rack frame permits.
- No overlaps are allowed.
- Landscape mode now stretches Board and Rack frames to the same outer height.
- In landscape, the Rack uses its full height instead of leaving large unused vertical gaps.
- In portrait/mobile, Board and Rack are both full width and the Rack grows vertically only as much as needed.
- Resizing the browser recalculates the layout and piece scale automatically.
- Large laptop/tablet displays now use more of the available viewport instead of keeping the Rack artificially small.

## v2.2.2 conflict-highlighting fix
- Fixed the Sudoku conflict feedback bug that was colouring an entire tetromino red whenever only one or two of its cells were actually in conflict.
- Only the exact numbered cells that break a Sudoku rule now flash/highlight red.
- Innocent numbers on the same piece remain normal.
- Conflict counter now reflects the number of individual conflicting cells, which is more intuitive for players.

## v2.2.3 drag-to-rack fix
- Fixed the bug that prevented placed pieces from being dragged back off the Board into the Rack.
- A piece dropped back onto the Rack is now removed from the Board and becomes available in the Rack again.
- Invalid drops elsewhere still snap the piece back to its previous board position.
- Dragging from the Rack to the Board continues to behave normally.

## v2.2.4 guided-placement finale
- When Board Guide is ON, pieces can no longer be dropped into arbitrary board cells.
- A piece may only snap into a predefined, currently empty placeholder with the exact same shape/orientation.
- Hovering a matching piece over an eligible placeholder makes that placeholder pulse brightly in its translucent family colour.
- Releasing while that placeholder is pulsing snaps the piece precisely into the slot.
- Wrong-shape placeholders do not activate.
- Occupied placeholders do not activate.
- Dropping away from an eligible placeholder returns the piece to its prior Board location or keeps it in the Rack.
- No Guide mode retains free board placement and standard Sudoku-only validation.

## v2.2.5 placeholder pulse refinement
- Increased the guide-hover pulse visibility by roughly 15%.
- Active placeholders now glow slightly more strongly, with a brighter translucent fill, a clearer coloured rim, and a stronger pulse animation.
- Behaviour is otherwise unchanged from v2.2.4.

## v2.2.6 landscape fit-to-height
- Landscape mode now sizes the Board/Rack area from the actual browser viewport height.
- The Board remains perfectly square but will shrink vertically when needed, so normal 100% browser zoom should show the full Board.
- Board and Rack still share the same outer height in landscape.
- Landscape controls are slightly more compact to reserve maximum height for gameplay.
- Very short landscape windows receive an additional compact-layout adjustment.
- Portrait/mobile behaviour is unchanged.

## v2.2.7 minimum sensible landscape height
- Refined the landscape fit-to-height behaviour so SuJi no longer keeps shrinking indefinitely as the browser window becomes shorter.
- The Board/Rack area now shrinks dynamically only down to a sensible minimum size.
- Once that minimum is reached, the page becomes vertically scrollable instead of making the Board smaller and smaller.
- This preserves the normal 100% zoom landscape experience while avoiding an over-compressed game board in very short browser windows.

## v2.2.8 landscape threshold and roomy rack
- Changed the landscape vertical-fit threshold to 1000px high.
- If the browser viewport is 1000px high or more, SuJi continues to fit vertically.
- If the browser viewport drops below 1000px high, SuJi stops shrinking further and the page becomes vertically scrollable instead.
- On wide landscape screens, the Rack now receives more horizontal space.
- Very wide screens give even more width to the Rack, helping the piece packer enlarge pieces and reduce wasted beige space.

## v2.2.9 landscape threshold refinement
- Reduced the landscape scroll cutoff from the previous 1000px rule to a more realistic desktop/laptop threshold.
- SuJi now keeps shrinking-to-fit on normal landscape desktop windows like the one shown in the user screenshot.
- Vertical scrolling only begins once the browser height becomes genuinely short (below roughly 860px).
- The Board/Rack area still stops shrinking beyond a sensible minimum when the window becomes very short.

## v2.2.10 footer breathing room
- Added a clean footer area below the Board/Rack, approximately the height of one 1x1 SuJi tile.
- Landscape fit-to-height maths now reserves that footer space before sizing the Board/Rack pair.
- This prevents the puzzle frame from sitting flush against the bottom edge of the browser.
- The footer is intentionally quiet and minimal so it acts primarily as visual breathing room.

## v2.2.11 pinned starting pieces
- System-given starting pieces now display a small pin badge.
- They also have a subtle cyan halo so they read as fixed/system-provided without looking like errors.
- Added a tiny Board note: “Pinned pieces were given to you at the start.”
- The visual treatment is deliberately lightweight so players understand the distinction immediately without adding another large UI panel.

## v2.2.12 starting-piece styling change
- Removed the pin badge from system-given starting pieces.
- Starting pieces are now indicated with a dark grey border treatment instead.
- Updated the small Board legend so it explains that dark-bordered pieces were given at the start.
- This keeps the meaning clear while looking calmer and more integrated into the puzzle UI.

## v2.2.13 clarity refinement
- Made the system-given starting pieces more clearly identifiable by strengthening the dark-grey border treatment.
- Added a clearer dark outer contour around the whole anchored tetromino, not just subtle internal cell edging.
- Improved the small Board legend sample so it matches the stronger anchored-piece visual language.
- Fixed the board layering so the heavy 3x3 quadrant lines now sit underneath tetromino pieces, where they belong as part of the board.
- Guides remain above the board, and placed/dragged pieces remain above the guides.

## v2.2.14 anchored-piece border refinement
- Moved the system-piece border treatment inside the tetromino bounds instead of outside.
- This ensures the marker remains visible even when another tetromino is directly adjacent.
- Softened the dark-grey styling slightly so it remains clear without looking too heavy.
- Updated the small legend sample to match the refined anchored-piece appearance.

## v2.2.15 anchored-piece marker experiment
- Removed the anchored-piece border treatment.
- Added a small centered padlock on system-given starting pieces instead.
- Updated the small Board legend so it now explains that locked pieces were given to you at the start.
- This keeps the piece art clean while testing whether a simple lock marker communicates the meaning more clearly.

## v2.2.16 shadow-first markers
- Replaced the white circular plate under the padlock with a shadow-only lock treatment.
- Replaced the filled number circles with shadow-style numbers, so the tile art and colours remain visible underneath.
- The numbers now rely on layered text shadow / drop shadow for contrast instead of a solid badge.
- Reinforced the opening-hint rule: 1x1 pieces are never selected as the initial free hints.

## v2.2.17 locked-piece interaction feedback
- Increased the size of the central padlock slightly.
- Locked starter pieces now respond when the user tries to drag them.
- A blocked drag attempt makes the lock flash and the piece shake briefly, clearly communicating that the piece is locked and cannot be moved.
- All other behaviour remains unchanged.

## v2.2.18 number contrast and conflict persistence
- Thickened the contrast edge around numbers using a stronger white stroke so digits stay readable even on dark picture areas.
- Fixed the conflict styling so it also applies clearly to the initial system-given / locked hint tetrominoes.
- Collision cells now flash first, then remain slightly lighter/backlit while the conflict still exists, together with the red border.
- Reconfirmed the opening-hint rule: 1x1 pieces are never chosen as the free initial hints.

## v3.0.0 — Checkpoint #3 begins
- Checkpoint #2 (v2.2.18) remains frozen as the protected baseline.
- First Checkpoint #3 fix: No Guide mode now correctly allows free placement anywhere on the Board, subject only to board boundaries and overlap rules.
- Pieces dropped in a valid free position no longer bounce back to the Rack when guides are disabled.

## v3.0.1 — No-Guide placement and mode-control correction
- Fixed the root persistence issue: older boolean strings such as "false" are now correctly interpreted as OFF after a reload.
- Picture and Guides settings are now persisted explicitly as "on"/"off".
- Guides OFF uses a completely separate free-placement path and never consults placeholder hover/pulse/snap logic.
- In Guides OFF mode, a piece can be placed anywhere it geometrically fits inside the 9x9 board without overlap.
- Replaced the two Show Fits / No Guide buttons with a single two-state slider control labelled Guides ON / Guides OFF.
- Increased game-mode and option text sizes for easier reading.

## v3.0.2 — clearer faint Sudoku cell lines
- Strengthened the faint 1x1 board grid lines so each 3x3 quadrant clearly shows its 9 individual cells.
- Kept these lines subtle, so they stay lighter than the heavy 3x3 quadrant separators.
- This makes the empty board read more immediately like a Sudoku grid without overpowering the tetrominoes or guides.

## v3.0.3 — dedicated faint Sudoku cell grid
- Added a separate thin 9x9 cell-grid overlay instead of relying only on borders inside the underlying Board cells.
- The faint 1x1 Sudoku lines now render above translucent guide placeholders, so they remain visible when Guides are ON.
- The thin grid still renders below actual tetromino pieces.
- Heavy 3x3 quadrant lines remain visually stronger than the faint 1x1 cell grid.

## v3.0.4 — unified mode sliders
- Replaced Picture / No Picture with a single Picture ON / Picture OFF slider toggle, matching the Guides control.
- Replaced the three separate Start Hints buttons with a three-stop slider.
- Hint stops show 1, 2, or 3 lightbulbs.
- The hint track uses a red-to-amber-to-green gradient: one hint is visually red, three hints visually green.
- Selecting a stop still uses the existing progress-protection/restart logic.
- All three game-mode controls now share a more consistent, readable UX.

## v3.0.5 — toggle visual fix and mode icons
- Fixed the Picture ON/OFF slider thumb so ON visibly slides the knob to the right, matching the Guides toggle.
- Unified the slider mechanics for Picture and Guides.
- Added a clear visual icon to every mode section:
  - Picture: smiley/image cue
  - Start Hints: lightbulb cue
  - Guides: guide/diamond cue
- Added small icons inside the Picture and Guides controls so the mode panel feels less text-heavy and bland.

## v3.0.6 — tighter top control layout
- Removed the repeated Picture title above the Picture slider to save vertical space.
- Redesigned the Start Hints control into a single compact horizontal slider.
- The left side now reads "Starting Hints".
- A larger lightbulb icon sits on the far right for visual balance.
- The slider thumb now contains a white circular badge with a black border and a black number showing the active hint count (1, 2, or 3).
- Retained the three-stop slider behaviour and colour gradient from red (1 hint) to green (3 hints).

## v3.0.7 — draggable Start Hints slider
- Removed the translucent circular hint-stop buttons completely.
- The user now changes Start Hints by physically dragging the white numbered slider ball left or right.
- The ball follows the pointer/finger during the drag and snaps to the nearest of three values on release.
- Added three small permanent triangle markers to indicate the available snap positions.
- The ball continues to show the current value (1, 2, or 3) as a black number inside a white circle with a dark border.
- Existing restart/progress-confirmation logic still applies after the drag selects a new value.

## v3.0.8 — compact Guides control
- Removed the redundant "Guides" heading above the Guides ON/OFF slider.
- The slider itself remains labelled Guides ON / Guides OFF, saving vertical space and matching the compact Picture control style.

## v3.0.9 — portrait Starting Hints relocation
- Fixed the cramped Starting Hints control in portrait mode.
- In portrait/mobile, Starting Hints now moves into the Level navigation panel on a full-width second row.
- This gives the draggable 3-stop hint slider enough horizontal room for its label, gradient track, numbered thumb, stop markers, and lightbulb.
- Picture and Guides then share the game-options row equally in portrait.
- In landscape, Starting Hints automatically moves back between Picture and Guides, preserving the accepted wide-screen layout.
- The control is physically moved in the DOM rather than duplicated, so its drag logic and state remain the same.

## v4.0.0 — Checkpoint #4 begins
- Renamed the current accepted working build from Checkpoint #3 / v3.0.9 to Checkpoint #4 / v4.0.0.
- No gameplay or UI behaviour has been changed in this rename-only release.
- v4.0.0 is the starting baseline for all further Checkpoint #4 development.

## v4.0.1 — Starting Hints inline with Level in portrait
- Moved the Starting Hints selector onto the same line as the Level controls in portrait mode.
- Portrait level-row now lays out as: Previous / Level / Starting Hints / Next / Restart.
- Compressed the portrait hint slider slightly so it fits neatly inline while staying readable.
- Landscape behaviour remains unchanged.

## v4.0.2 — simplified Locked Hints selector
- Replaced the old Starting Hints slider with a simpler control:
  - label: "Locked Hints :"
  - left arrow to decrease
  - bracketed current value, e.g. [1], [2], [3]
  - right arrow to increase
- Moved this Locked Hints selector back underneath the Level row in all layouts.
- Removed the inline portrait version and the previous draggable hint slider.
- Game options row now focuses only on Picture and Guides.
- Existing restart/progress-confirmation logic for hint changes remains intact.

## v4.0.3 — grouped one-line Level and Locked Hints controls
- Replaced the previous second-row Locked Hints stepper with a one-line grouped control.
- The main selector line now reads visually like:
  - < Level 0001 >
  - < Locked Hints 2 >
- Styled both Level and Locked Hints as matching grouped controls with left/right arrows and centered text.
- Kept Restart as a separate button on the same line.
- The Picture and Guides row remains below as a clean two-option layout.

## v4.0.4 — portrait fix for Level / Locked Hints row
- Fixed the portrait/mobile bug where the new one-line Level + Locked Hints layout was breaking.
- Added explicit portrait overrides so the old experimental portrait CSS no longer damages the row.
- In portrait, Level, Locked Hints, and Restart now remain visible and aligned on one line.
- Reduced arrow/button widths and font sizes slightly in portrait to preserve the intended grouped-control look without overlap.

## v4.0.5 — narrow portrait label refinement
- On very narrow portrait screens, the Locked Hints control now switches its label from "Locked Hints" to "Hints".
- This preserves useful meaning instead of truncating to just "Locked ...".
- Normal-width screens still show the full "Locked Hints" label.

## v4.0.6 — compact Hints label
- Replaced the truncated "Locked Hints" wording with a simpler compact label:
  - "Hints 🔒"
- This keeps the meaning clear even on very narrow portrait screens.
- The small lock communicates that these are locked/free starting hints.

## v4.0.7 — Hints label lock refinement
- Moved the lock icon to the front of the Hints label.
- Increased the lock icon slightly so it more closely matches the padlock style used on pinned tetromino hints.
- The label now reads visually as: 🔒 Hints 3

## v4.0.8 — faster locked-hint entry + rapid level-change race fix
- Made the opening locked-hint placement animation noticeably faster:
  - flight duration reduced from about 760 ms to about 520 ms
  - stagger reduced from 80 ms to 45 ms
  - pause after each arrival reduced from 120 ms to 55 ms
- Added a reset-generation token so animations and asynchronous image lookups from an old level cannot update a newer level.
- Changing levels now immediately cancels and removes any locked-hint flight still in progress.
- The Board/Rack state is cleared and rebuilt for the new level immediately, before asynchronous image loading completes.
- Rapidly clicking Previous/Next can no longer merge locked pieces from one level into the next level.


## v5.0.2 — Checkpoint #5 onboarding, based directly on protected v4.0.8
- Preserves the original multi-file PWA structure: index.html, styles.css, app.js, manifest.webmanifest, icons/, resources/.
- Preserves Checkpoint 4 board/rack layout, adaptive rack packing, controls, watermark, guides, drag/drop, responsive layout and locked-hint behaviour.
- Adds five gentle onboarding levels:
  - Level 1: picture-first jigsaw, very faint numbers.
  - Level 2: picture-first jigsaw, clearer numbers.
  - Level 3: German flag horizontal stripes + an easy left-to-right Sudoku pattern.
  - Level 4: French flag vertical stripes + the transposed easy top-to-bottom Sudoku pattern.
  - Level 5: less positional abstract image + normal Sudoku logic.
- Adds contextual Sudoku teaching without modal overlays. Messages live below the Board so they never cover gameplay on mobile.
- When teaching a row/column/3x3-box error, the complete relevant region is highlighted yellow while the exact duplicate cells remain red.
- Each rule is taught at most three times, with a per-rule “Don’t show this kind of Sudoku tip again” option.
- Tutorial artwork remains in resources/ and is loaded through the existing Picture Mode resource mechanism.


## v5.0.2 correction
- Strong red outline on exact duplicate cells, including Picture mode and locked hints.
- Entire offending row/column/3x3 region receives a visible yellow teaching tint.
- Error teaching reduced to one compact line; on mobile it sits at the bottom of the screen.
- Removed “SuJi Says” from error messages.
- Selecting “Don’t show” immediately closes the message and removes the yellow teaching region.
- Tutorial message counters use a new v5.0.2 namespace so this corrected behaviour can be tested cleanly.


Checkpoint 5 v5.0.4 changes
- Level 1 intro: "Solve the Jigsaw - Take care of the Sudoku numbers".
- A single translucent yellow teaching stripe spans the full offending row/column (or box).
- The stripe remains after the popup is closed and disappears only when that exact conflict is resolved.
- Stripe is pointer-events:none and never blocks dragging.
- Conflict popup is triggered only by a conflict involving the most recently dropped piece.
- Existing unrelated board conflicts never generate a new popup.


Checkpoint #5 v5.0.5
----------------------
- Tutorial/error modal backdrop is fully transparent: no dimming and no blur, so the board remains sharp and readable while the message is shown.
- Persistent teaching region is substantially stronger and immediately eye-catching.
- Row conflicts highlight the complete 9-cell row edge-to-edge.
- Column conflicts highlight the complete 9-cell column edge-to-edge.
- Box conflicts highlight the complete 3x3 quadrant.
- Attention region pulses once when triggered, then stays steadily visible until that exact conflict is resolved.
- Teaching overlay remains pointer-events:none and cannot interfere with drag/drop after the modal is closed.


## v5.0.6
- Strengthened the red highlighting of the exact cells in conflict while a tutorial yellow row/column/box band is visible.
- Added thicker red outline, stronger glow and slightly higher contrast for the active conflicting cells.


## v5.0.7
- Increased the visibility of the exact conflicting numbers inside the active teaching conflict.
- Added stronger white edge, slightly larger number rendering, and a subtle light plate behind the number so it remains readable over the yellow band.


## v5.0.8
- The yellow tutorial row/column/box band now continuously fades out for one second and fades back in for one second while the active conflict remains.
- Red conflict borders and the conflicting numbers do not fade, making them much easier to inspect whenever the yellow band recedes.
- The breathing animation ends automatically when the highlighted conflict is resolved because the stripe is removed by the existing conflict lifecycle.


## v5.0.9
- First startup tutorial message is now a centered classic modal with blurred/dimmed backdrop and an OK button.
- Later teaching/error messages remain as discreet bottom modal bars with only a close × and no blur.
- Strengthened red conflict borders so the exact clashing cells stand out more clearly.


## v5.0.10
- Reset Checkpoint 5 tutorial display counters for this build so the Level 1 central introduction is shown again during testing.
- Beautified the bottom teaching/error modal while keeping it compact and one-line.
- Refined the Level 1 central introduction styling and message.


## Checkpoint 6 v6.0.1
- The actively reported colliding numbers now pulse/zoom so they pop out more clearly while the yellow teaching band breathes.
- Tutorial number visibility is no longer faded: numbers are clearly visible from Level 1 onward.
- Tutorial message storage key bumped so the intro/tutorial messages can be retested cleanly.


## Checkpoint 6 v6.0.3
- Fixed tutorial artwork loading for local file use. Levels 1–5 now map directly to their resource images instead of relying on a HEAD request that can fail under file://.
- Level 2 cat, Level 3 German flag, Level 4 French flag, and Level 5 dog now display reliably when opening the package locally.


## Checkpoint 6 v6.0.4
- Changed all non-error informational tutorial messages (such as the level teaching intros) to centered, blurred-background super messages with OK buttons.
- Error-related teaching remains as the discreet bottom modal bar.
- Bumped tutorial storage key so the informational popups can be tested cleanly again.


## Checkpoint 6 v6.0.5
- Added completed-picture preview system. On level entry, the solved picture is shown centered, then zooms/fades into a picture-icon button.
- Added reusable picture preview button so the completed image can be reopened at any time.
- The picture preview can be closed with an × in the top-right corner or by pressing Escape/clicking outside.


## Checkpoint 6 v6.0.6
- Level-start sequence corrected: intro super-message appears first; only after OK does the completed-picture preview appear.
- The player cannot begin play until the picture preview is closed; closing it shrinks it into the picture icon.
- Picture preview restyled as a white-bordered printed polaroid / photo card.


## Checkpoint 6 v6.0.7
- Fixed missing picture-preview overlay markup, which prevented both level-start picture display and the picture button from working.
- Updated visible title/header to Checkpoint #6 · Version 6.0.7.
- Replaced monochrome picture symbol with an original coloured SuJi landscape/photo SVG icon.


## Checkpoint 6 v6.0.8
- Picture preview redesigned as a centered framed puzzle window.
- Added a compact top title bar with level-specific title and close ×.
- Reduced surrounding white area to approximately 5mm and removed the large polaroid bottom margin.
- Level 3 title is 'Flag of Germany Puzzle'.


## Checkpoint 6 v6.0.9
- Standardised Sudoku conflict messages to the 'Illegal Move' wording for row, column, and 3×3 box conflicts.


## Checkpoint 6 v6.0.10
- Slowed and smoothed the completed-picture shrink animation so it zooms out more gracefully.
- Removed the old minimum shrink cap so the preview now collapses down to approximately the same size as the picture icon.
- Increased title bar contrast and added a bold black border around the entire picture preview window.
- Updated visible build label to Checkpoint #6 · Version 6.0.10.


## Checkpoint 6 v6.0.11
- Added a true icon-to-preview opening animation. The completed picture now grows from the picture icon's exact position and size into the full centered frame over ~1 second.
- Closing continues to animate in reverse back into the icon.
- Updated visible build label to Checkpoint #6 · Version 6.0.11.


## Checkpoint 6 v6.0.12
- Fixed picture zoom animation so the complete framed preview window animates as one object.
- Title bar, X, white picture border, image and bold black outer border now grow/shrink together continuously.
- Updated visible build label to Checkpoint #6 · Version 6.0.12.


## Checkpoint 6 v6.0.13
- Replaced cloned-preview zoom with direct animation of the real complete preview window.
- Opening now starts at picture-icon size/position and reaches nearly full phone width in about 0.7 seconds.
- Removed the final visual hand-off that caused the animation to skip/chop at the end.
- Closing uses the reverse direct animation back to the icon.


## Checkpoint 6 v6.0.14
- Rebuilt zoom-in to remove jerking: the image is decoded before animation begins.
- Removed the old CSS pop animation that was competing with the Web Animations transform.
- Zoom-in now uses a single compositor translate+scale from the picture icon to the full-width centered window in ~0.56 seconds.
- Phone preview now expands to virtually the full screen width.
- Updated visible build label to Checkpoint #6 · Version 6.0.14.


## Checkpoint 6 v6.0.15
- Limited the picture-preview zoom-in and zoom-out animation to Levels 1–5 only.
- From Level 6 onward the completed-picture reference still opens and closes, but without the zoom animation.
- Updated visible build label to Checkpoint #6 · Version 6.0.15.


## Checkpoint 7 v7.0.0
- Frozen Checkpoint #7 baseline created from the accepted Checkpoint #6 v6.0.15 state.
- No gameplay behaviour changed during this checkpoint save/rename.
- Future Checkpoint #7 development should branch from this exact v7.0.0 baseline.


## Checkpoint 7 v7.0.1
- Levels 1–5 are now mandatory guided-picture levels: Picture and Guides are forced ON.
- Picture ON/OFF and Guides ON/OFF controls are completely hidden in Levels 1–5.
- From Level 6 onward both controls reappear and the player's saved Picture/Guides preferences are restored.

## Checkpoint 7 v7.0.2
- Yellow row, column, and 3×3 error-region highlighting now remains active on every level.
- From Level 6 onward there is no Illegal Move teaching popup; only the visual cue remains.
- Active conflicting numbers now pulse larger and use a subtle shimmer for improved visibility.
- Visible version updated to Checkpoint #7 · Version 7.0.2.


## Checkpoint 9 v8.0.0
- Checkpoint #9 frozen baseline, created from the accepted Checkpoint #7 v7.0.2 build.
- No gameplay, tutorial, animation, layout, or visual behaviour was changed in this freeze/rename step.
- This is the protected starting point for future Checkpoint #9 work.


## v8.0.2 changes
- Current level is shown without a padlock in the 100-level selector.
- On level entry/restart, the picture preview waits 1 second before zooming in.
- Added a discreet live digital attempt timer. It resets for every new or restarted level.
- Completion time is recorded locally only after a fully correct solution; slower replays do not replace the best time.


## Checkpoint #9 v8.0.7
- Level selector uses larger cards and a five-across mobile grid with vertical scrolling through each 100-level page.
- Completed cards show level, best time, moves and 1–3 stars.
- Static rating formula: 60% speed and 40% move efficiency; 2:00 and 25 moves are the current perfect targets.
- Win screen shows stars, time and moves with Replay and OK/Next Level choices.
- Start-of-level picture preview is delayed until at least two seconds after entering the level.


Checkpoint #9 v9.0.1 change
----------------------------
- Sudoku collision messages are no longer limited to three displays.
- Every active collision is shown as a non-modal warning in the Board heading.
- The warning is centered between the Board title and the Picture/Guides summary.
- A warning triangle and subtle pulse draw attention without blocking play.
- The warning disappears immediately when the conflict is fixed.
- Large informational/tutorial modals are unchanged.

## Checkpoint #11 v11.0.1 — Active Pieces Guide

The guide system is now contextual rather than permanently colouring the board. With **Show Pieces Guide** enabled, picking up a piece illuminates and shimmers every currently empty predefined destination that has the same exact fixed-orientation silhouette. The player can drop only into one of those illuminated homes. With the guide disabled, no destination shimmer is shown and the piece may be placed anywhere it geometrically fits without overlapping another piece.


## v17.0.5 UX refinement
- In Hint Mode, after a Rack shape is selected, the instruction “Drag the selected Shape onto the board.” is anchored beside that selected Rack shape.
- The selected-shape speech bubble retains the v17.0.4 edge-aware left/right flipping and pointer direction.
- No gameplay rules changed.


## v17.0.6 UX / Hint Mode bug fix
- Removed the decorative diamond / pointer from Hint instruction bubbles.
- A movable board shape that is allowed to move because it blocks a revealed Hint destination remains movable for the rest of that active Hint session, even if it is dropped into another incorrect Sudoku position.
- Unrelated Rack shapes and unrelated board shapes remain protected from accidental Hint Mode interaction.
- Locked starting shapes remain immovable.
- PWA cache namespace updated to v17.0.6.


## v18.0.0 — Checkpoint 18 baseline

Checkpoint 18 starts directly from the accepted Checkpoint 17 v17.0.6 state and adds one simplifying Hint-availability rule.

- The placement Hint button is greyed out and disabled whenever the Rack is empty.
- The placement Hint button is greyed out and disabled whenever a pending Sudoku conflict is showing on the Board.
- Once the Sudoku conflict is resolved, Hint automatically becomes available again provided Rack shapes and Hint uses remain.
- The Hint action also guards these states internally, so it cannot be started through an alternate input path while unavailable.
- An already-active Hint session can still be cancelled normally.
- All accepted Checkpoint 17 gameplay, portrait/landscape layout, local bubbles, PWA behavior, and Hint guidance behavior are otherwise retained.
- PWA cache namespace updated to v18.0.0.


## v18.2.0 — Rack locked while a Sudoku error is active

- Starting from the Checkpoint 18 v18.0.0 baseline, a pending Sudoku conflict now temporarily locks Rack -> Board dragging.
- While the conflict remains, the entire Rack is visibly greyed out to communicate that no new Rack shape may be introduced.
- Shapes already on the Board remain movable and may still be dropped back into the Rack, allowing the player to resolve the conflict by removing or repositioning a Board shape.
- As soon as the Sudoku conflict is resolved, the Rack automatically returns to its normal appearance and Rack -> Board dragging becomes available again.
- Existing Checkpoint 18 Hint disabling during Sudoku conflicts remains unchanged.
- PWA cache namespace updated to v18.2.0.

## v19.0.0 — Checkpoint 19 protected baseline

- Checkpoint 19 is frozen directly from the accepted Checkpoint 18 v18.2.0 state.
- No gameplay, UI, Hint, Sudoku-conflict, Rack-lock, pattern, PWA-install, or drag-and-drop behavior changed during this checkpoint save.
- The Checkpoint 18.2.0 rule remains protected: while a Sudoku conflict is active, the Rack is visually greyed out and Rack -> Board dragging cannot start, while Board -> Rack remains allowed so the player can resolve the conflict.
- Existing Hint disabling during Sudoku conflicts remains protected.
- Visible application version updated to 19.0.0.
- PWA cache namespace updated to v19.0.0.
- Treat this exact package as the protected rollback baseline for all future Checkpoint 19 development.


## v1.19.3 — Hint focus-flow refinement

Built from the protected Checkpoint 19 v19.0.0 baseline and includes the accumulated 1.19.1–1.19.3 refinements:

- Board heading renamed to **SuJi Board**.
- Sudoku conflict balloon no longer has a pointer and now chooses a nearby position that minimises overlap with Board shapes/numbers.
- Central SuJi watermark is subtly smile-like while remaining faint and recognisably the same mark.
- On first pressing Hint, a small **Cancel** label appears under the bulb; the Board is colour-preservingly dimmed while the Rack stays fully visible.
- Selecting a Rack shape consumes the Hint and removes **Cancel**. The Board returns to normal brightness; the Rack dims while the selected shape stays bright.
- If the hinted shape is dropped anywhere on the Board except a highlighted compatible destination, it returns to the Rack and Hint Mode remains active for another try.
- Releasing on the highlighted destination completes the Hint, exits Hint Mode, and restores the Rack.
- Selected-shape instruction bubbles continue to avoid covering the selected Rack shape.
- PWA cache namespace updated for v1.19.3.


## v1.19.4 — Conflict balloon cleanup
- Removed the remaining decorative diamond/tail from the local Sudoku conflict balloon.

## v1.19.5 — Hint first-step message fix
- Clicking Hint now immediately shows: “Tap a shape from the Rack Area to Reveal where it can fit.”
- The existing Cancel label, Board colour-preserving dimming, and Rack-selection flow remain unchanged.
- Repaired escaped CSS append blocks so the accumulated Checkpoint 17 / v1.19.x UI rules parse normally.
- No package created for this working revision.


## v1.19.8 — Hint polish and conflict-bubble proximity

- Removed the visible `Cancel` label beside the Hint bulb.
- First-step Hint guidance now explains that tapping the Hint bulb again cancels without consuming a hint.
- After selecting a Rack shape in Hint Mode, the Rack dims clearly except for the selected shape.
- Hint destination placeholders on the Board are stronger and use a clearer red outline.
- Sudoku conflict messages now prefer a closer placement above the offending shape cluster when space allows.
- Visible application version updated to 1.19.8.
- PWA cache namespace updated to v1.19.8.

## v1.20.0 — Stable Hint and Sudoku conflict UX baseline

This release promotes the accepted v1.19.x refinement line to a new stable v1.20.0 baseline.

- Retains the v1.19.9 Hint refinements, including stronger Step-1 Board gray-out and brighter warm silver/yellow Hint destination placeholders with clear red outlines.
- Sudoku conflict messages are now anchored as close as practical to one of the visibly jiggling culprit shapes.
- Prefer the shape that caused the conflict; otherwise use another jiggling participant.
- Message placement considers only nearby positions (above, below, left, right) and no longer drifts to a remote Board corner simply to avoid overlap.
- Above/below are preferred, with side placement used as a fallback.
- Visible application version updated to 1.20.0.
- PWA cache namespace updated to v1.20.0.


## v1.20.1 — Google Pixel / short mobile landscape fit

- Fixed landscape mode on short phone viewports such as Google Pixel-class devices.
- Removed the old desktop landscape minimum Board size on phone-height landscape screens.
- Board and Rack now fit side-by-side inside the actual visual viewport without the lower game area being cropped.
- Landscape chrome is compacted only on short-height devices; normal desktop/tablet landscape and portrait behaviour are preserved.
- Responsive sizing now uses `visualViewport` when available, so browser/PWA UI bars are accounted for more accurately.
- Visible application version updated to 1.20.1.
- PWA cache namespace updated to v1.20.1.

## v1.20.5 — stronger blocked Hint destination cue

- Continued from v1.20.4, keeping the simple FREE vs BLOCKED destination distinction.
- BLOCKED Hint destinations are now much more visible, using a stronger pale-blue filled ghost with bolder dotted borders and diagonal obstruction hatching.
- Added a compact non-verbal move-away cue badge on blocked destinations so the player can immediately read “something is in the way” without words.
- FREE destinations still pulse yellow ↔ silver as before.
- No Hint logic, drag/drop, or blocker-piece behaviour changed.
- Visible application version updated to 1.20.5.
- PWA cache namespace updated to v1.20.5.

## v1.20.6 — clearer blocked destinations, less fill, smarter suppression

- BLOCKED Hint destinations now preserve the underlying numbers much better by using only a very light translucent fill.
- Added a thicker animated “marching ants” border around blocked destinations so the obstruction reads clearly without covering the board content.
- Removed the previous blocked-destination move badge.
- BLOCKED markers are now suppressed when the destination is occupied by a locked starting shape or by a shape that is already sitting in its own correct home, because those are not pieces the player needs to move for the selected Hint.
- FREE destinations continue to pulse yellow ↔ silver.
- Visible application version updated to 1.20.6.
- PWA cache namespace updated to v1.20.6.

## v1.20.8 — visible blocked silhouettes + blocker jiggle

- BLOCKED Hint destinations are now rendered above ordinary Board pieces as a transparent cyan marching-ants outline, so the destination cannot disappear underneath its blocker.
- The actual Board shape that is preventing the destination from being used gently jiggles and gets a cyan/amber edge while keeping its original colours and numbers readable.
- Only movable/misplaced blockers are emphasised. Locked starting pieces and pieces already sitting in their own correct home do not receive a blocked cue.
- Valid free destinations remain distinct, and the active drag lock-on target is forced above Board pieces with a strong red fill/glow.
- Visible application version updated to 1.20.8.
- PWA cache namespace updated to v1.20.8.

## v1.20.9 — dedicated blocked-shape silhouette

- Blocked Hint destinations now use a separate high-z-index Board overlay instead of relying on the legacy guide cells.
- The entire selected silhouette (for example a T shape) is drawn over the blocking piece with bright cyan dashed cells plus animated amber marching accents.
- The interior remains almost transparent so the blocking shape numbers remain visible.
- Movable blockers continue to jiggle and now use a stronger amber/cyan edge.
- Locked/correct-home blockers remain excluded from the move-away cue.
- Valid free destinations and the red lock-on target remain unchanged.
- Visible application version updated to 1.20.9.
- PWA cache namespace updated to v1.20.9.

## v1.21.0 — new protected checkpoint baseline

- This version marks the accepted state after the successful blocked-destination silhouette fix.
- Checkpoint **1.21.0** is now the new protected baseline.
- It is created directly from the accepted **v1.20.9** state, with no further gameplay or UX changes beyond version/checkpoint promotion.
- Visible application version updated to **1.21.0**.
- PWA cache namespace updated to **v1.21.0**.



## v1.21.1 — mobile Hint focus-mask fix

- Fixed Hint Mode dimming on mobile/portrait layouts.
- Hint Step 1 now uses a dedicated mobile-safe Board scrim instead of relying on a filtered pseudo-element.
- Hint Step 2 uses a dedicated Rack scrim while keeping the selected hinted shape fully visible above it.
- Desktop v1.21.0 Hint presentation and the accepted blocked-destination/jiggle/red lock-on behaviour are unchanged.
- Visible application version updated to **1.21.1**.
- PWA cache namespace updated to **v1.21.1**.


## v1.21.2 — drag-only Hint Board dimming + stronger blocker jiggle

- During active Hint guidance, the Board now stays in normal colour while the hinted shape is not being dragged, so the player can clearly find and move an incorrectly placed blocking shape.
- The Board greys out only while the selected hinted shape is actively in hand/being dragged toward its revealed destinations.
- Releasing or cancelling that drag immediately removes the Board grey-out.
- Yellow/red Hint destinations and blocked-destination overlays remain visually above the temporary Board scrim.
- Incorrect movable shapes that block a revealed Hint destination now jiggle more strongly and more frequently.
- Visible application version updated to **1.21.2**.
- PWA cache namespace updated to **v1.21.2**.
- Packaging rule: project files are stored directly at ZIP root with no extra enclosing version folder.


## v1.21.4 — corrected Hint drag dimming and foreground drag piece
- Repaired malformed literal escaped-newline CSS left in the v1.21.2 append, which could prevent the drag-time Board dim rule from matching.
- While the selected hinted shape is actively dragged, ordinary Board content now receives a strong grey focus scrim.
- Hint destinations remain visible above the greyed Board.
- The dragged shape is forced fully opaque and onto the highest document layer so destination overlays cannot cover it.
- Releasing the hinted shape immediately removes the Board dimming so a misplaced blocking piece can be moved.
- PWA cache namespace updated to v1.21.4.


## v1.21.5 — deterministic Hint drag Board greying

- During an active drag of the selected Hint shape, ordinary Board cells and placed Board pieces are now directly greyed/darkened instead of relying on a compositor-dependent overlay.
- Yellow/valid Hint destinations remain fully bright and above the greyed Board.
- The dragged shape remains fully vivid and above the Hint destinations.
- Releasing the hinted shape immediately restores normal Board colours so blockers can be moved.
- PWA cache namespace updated to v1.21.5.


## v1.21.7 — vivid animated Hint destinations

- Starts from the accepted v1.21.5 drag-time Board greying build.
- Free Hint destination cells now continuously cycle through vivid yellow, orange and warm red, then back to yellow.
- The existing solid-red guide-hover/lock-on state is preserved when the dragged hinted shape reaches a valid snap target.
- Blocked marching-ants destinations and blocker-jiggle behaviour are unchanged.
- PWA cache namespace updated to v1.21.7.


## v1.21.8 — corrected animated Hint targets and drag ghost

- Free Hint destination cells now visibly and continuously cycle yellow → orange → red → orange → yellow using a dedicated animated overlay, so legacy `background: ... !important` rules cannot freeze the colour.
- The currently dragged hinted shape is explicitly exempt from Board greying/desaturation even when it was cloned from a Board piece.
- Existing drag-only Board fade, lock-on red state, blocker movement/jiggle and Hint logic remain unchanged.
- PWA cache namespace updated to v1.21.8.
- Package remains rooted directly at the ZIP root with no extra parent folder.

## v1.22.0 — protected Snapshot 22 baseline

- Snapshot **1.22.0** freezes the accepted **v1.21.8** state as the new protected rollback baseline.
- No gameplay, Hint, Board-dimming, animated-destination, blocker-jiggle, drag/drop, PWA-install or visual behavior changed during the snapshot save.
- Visible application version updated to **1.22.0**.
- PWA cache namespace updated to **v1.22.0**.
- Package remains rooted directly at the ZIP root with no extra parent folder.



## v1.23.0 — adaptive portrait Rack + landscape fit correction

- Starting from **v1.22.0**, the portrait Rack now grows automatically when many shapes remain, up to a maximum height equal to the Board height.
- As Rack shapes are used up, the Rack shrinks back down smoothly toward its normal compact height.
- This adaptive Rack sizing applies only in **portrait** and avoids using an internal Rack scrollbar.
- **Landscape** packing/layout math was relaxed for narrow screens so the Board/Rack pair no longer force oversized minimum widths that can clip the Rack on mobile landscape.
- Visible application version updated to **1.23.0**.
- PWA cache namespace updated to **v1.23.0**.


## v1.23.2 — portrait Rack height correction

- Fixes the portrait regression where the Rack could collapse into a thin wooden strip while leaving empty space below.
- The JavaScript-calculated adaptive Rack height now overrides the legacy `height:100%` portrait rule correctly.
- The Rack still grows only as required, never above the Board height, and shrinks again as shapes are removed.
- Landscape corrections from v1.23.0 are retained.
- Visible application version updated to **1.23.2** and PWA cache namespace updated accordingly.


## v1.23.2 — readable adaptive portrait Rack

- Corrects the remaining portrait Rack calculation from v1.23.1.
- Rack growth now prioritizes a **readable piece size** based on the Board cell size, then calculates the minimum Rack height required to fit every remaining shape.
- The Rack may grow up to the Board height when crowded and progressively shrinks as shapes leave the Rack.
- Removed the feedback loop where the current Rack height influenced its own minimum-height calculation.
- Landscape corrections from v1.23.x remain unchanged.
- Visible application version and PWA cache namespace updated to **1.23.2**.


## v1.23.3 — portrait Board/Rack shared-height rebalance

- Portrait mode now treats Board and Rack as two consumers of the same visible gameplay height.
- When many shapes remain, the Board automatically shrinks and the Rack grows using the recovered height.
- The Rack is still capped so it never grows taller than the Board.
- As shapes leave the Rack, the Rack contracts and the Board can grow back toward full width.
- Rack packing now targets larger, more readable cells after the Rack has been given enough height.
- Landscape behaviour remains separate and retains the v1.23.x narrow-landscape corrections.
- Visible version and PWA cache namespace updated to **1.23.3**.


## v1.23.4 — Rack panel sizing and full-space distribution

- Portrait Rack white panel now grows to the same calculated height as the wooden Rack tray.
- Fixes the v1.23.3 mismatch where the tray could visually overflow a shorter white Rack panel.
- Rack shapes are no longer packed tightly into the top-left only; shelf rows are centred and distributed vertically across the available Rack area.
- Board/Rack adaptive sharing from v1.23.3 remains in place.
- Visible version and PWA cache namespace updated to **1.23.4**.


## v1.23.5 — stronger crowded-Rack priority

- Portrait Board minimum size is now dynamic according to the number of shapes remaining in the Rack.
- When the Rack is heavily populated, the Board may shrink substantially more than in v1.23.4 so the Rack can claim more vertical space.
- As the Rack empties, the Board progressively grows back toward its normal size.
- Crowded Rack layouts also receive a small readability boost when choosing Rack piece size.
- Landscape behaviour is unchanged from v1.23.4.
- Visible application version updated to **1.23.5** and the PWA cache namespace to **v1.23.5**.


## v1.23.6 — Rack-size-driven shape scaling

- Portrait Rack shapes now scale from the **actual available Rack width and height**, rather than merely being spread farther apart when the Rack grows.
- Added a denser two-dimensional Rack packing pass so enlarged Rack space can be converted into larger piece cells.
- The packer searches for the largest cell size that genuinely fits every remaining Rack shape, then centres the packed result.
- Removed the previous normal-portrait post-packing vertical distribution step, which could create large gaps while leaving the shapes unnecessarily small.
- Board/Rack adaptive height sharing from v1.23.5 is retained.
- Visible application version updated to **1.23.6** and the PWA cache namespace to **v1.23.6**.


## v1.23.7 — dynamic Rack measurement synchronisation

- Fixes portrait Rack piece sizing when the Rack changes height dynamically.
- The packer now sizes against the resolved target Rack height and the actual inner `.rack` width after layout is committed, rather than reading an intermediate animated shell height.
- Removed the normal-portrait Rack height transition that could make synchronous measurements stale.
- Larger dynamic Rack dimensions now feed directly into the maximum piece-size calculation.
- Visible version and PWA cache namespace updated to **1.23.7**.


## v1.24.0 — protected Snapshot 24 baseline

- Snapshot **1.24.0** freezes the accepted **v1.23.7** state as the new protected rollback baseline.
- No gameplay, Rack sizing, Board sizing, portrait/landscape layout, Hint, Sudoku-conflict, PWA-install, drag-and-drop, pattern, or visual behaviour changed during this snapshot save.
- The accepted dynamic portrait geometry from v1.23.7 is retained: Rack height is resolved first, the final inner Rack dimensions are then measured, and shapes are packed at the largest fitting size for that actual Rack area.
- Visible application version updated to **1.24.0**.
- PWA cache namespace updated to **v1.24.0**.

## v1.24.1 — drag performance refinement

- Preserves the protected **v1.24.0** gameplay, Rack sizing, Board sizing, Hint behavior, visuals, and placement rules.
- Drag rendering is now synchronized to `requestAnimationFrame`, preventing excessive pointer events from triggering more updates than the display can render.
- Hint destination geometry is measured once at drag start and cached for the active gesture instead of repeatedly forcing layout reads.
- Guide hover classes are updated only when the active destination changes.
- Drag ghost dimensions are cached and the ghost receives compositor hints (`will-change`, `translate3d`, containment) to improve mobile smoothness.
- Visible application version and PWA cache namespace updated to **v1.24.1**.


## v1.24.2 — deeper mobile drag optimisation

- Continues from **v1.24.1** with no placement-rule, Rack-sizing, Board-sizing, Sudoku, Hint-count, or level-content changes.
- Mobile pointer movement now uses a passive listener because piece gestures already use `touch-action:none`; this avoids a browser scroll-blocking path on every pointer update.
- A short-lived `suji-drag-active` rendering mode gives the moving shape priority while the pointer is down.
- Non-essential pulses and jiggles are temporarily paused during dragging and automatically resume on release.
- The moving ghost removes expensive drop-shadow, per-cell shadow, and soft-light blend decoration while preserving its shape, colours, picture and numbers.
- Hint-mode Board greying is rendered as one inexpensive solid dimming layer during the gesture instead of grayscale/brightness filters across many Board elements. Hint destinations remain vivid and above the dimmer.
- Visible application version and PWA cache namespace updated to **v1.24.2**.


## v1.24.3 — normal-mode red landing target
- Based directly on accepted v1.24.2.
- When Hint Mode is OFF, dragging a shape over a valid Board placement highlights the exact destination cells in red.
- The preview uses the same grid rounding as the actual drop logic, so it represents where the shape will lock if released.
- If any target cell is outside the Board or occupied by another placed shape, no red landing preview is shown.
- The preview uses a cached occupied-cell set and a small dedicated overlay to preserve the v1.24.x drag-performance improvements.
- Hint Mode guidance and landing behavior are unchanged.
- Visible version and PWA cache namespace updated to v1.24.3.


## v1.24.4 — visible valid-drop light-red shadow

- Fixed the normal-play landing preview that was invisible in v1.24.3 because the appended CSS contained literal escaped newline characters.
- While Hint Mode is OFF, the exact Board cells that would receive the dragged shape if released now are filled with a translucent light red.
- The preview is shown only when the complete shape is within the 9×9 Board and none of its target cells are occupied by another placed shape.
- If the current release would be rejected and the shape would return to the Rack/previous position, no landing preview is displayed.
- Existing v1.24.2 drag-performance optimisations remain in place.
- Visible version and PWA cache namespace updated to v1.24.4.


## v1.25.0 — protected checkpoint

- Frozen directly from the accepted **v1.24.4** state.
- No gameplay, visual, placement, Hint Mode, Board/Rack sizing, Sudoku, level-content, or drag-behaviour changes were introduced for this checkpoint.
- Retains the v1.24.x mobile drag-performance optimisations.
- Retains the normal-play valid-drop preview: when Hint Mode is OFF, the exact Board cells that would receive a dragged shape are filled with translucent light red only when the release would be accepted; no preview is shown for overlaps, out-of-bounds placements, or any release that would return the shape to the Rack/previous position.
- Visible application version and PWA cache namespace updated to **v1.25.0**.

## v1.25.2 — Hint layout unification

- Branched directly from the protected **v1.25.0** baseline.
- Removed the legacy portrait Hint-only Board/Rack shrinking path.
- Hint Mode now uses the same adaptive Board/Rack geometry and Rack packing as normal play.
- `updateHintViewportMetrics()` no longer publishes Hint-specific Board/Rack sizing variables.
- Hint remains a visual/interaction mode only: dimming, selection emphasis, instructions, destination guidance and drag restrictions are preserved.
- Fixes the Rack shrinking/miscalculation that could remain after a successful Hint placement.
- Visible application version and PWA cache namespace updated to **v1.25.2**.

## v1.26.0 — Checkpoint 26 protected baseline

- Created directly from the accepted **v1.25.2** build.
- No gameplay, Hint Mode, Rack sizing, Board sizing, drag-and-drop, Sudoku, guide, visual, or responsive-layout behavior changed during this checkpoint save.
- This version freezes the accepted v1.25.2 state as the new protected rollback baseline.
- Visible application version updated to **v1.26.0**.
- PWA service-worker cache namespace updated to **suji-v1-26-0** so mobile installations fetch the checkpoint build as a new version.

## v1.26.4 — rotation-stable mobile landscape

- Built directly from the protected **v1.26.0** baseline; the experimental v1.26.1–v1.26.3 landscape changes are not carried forward.
- Adds an explicit short-touch/mobile landscape mode so laptop/desktop landscape keeps the accepted v1.26.0 behaviour.
- Removes the legacy 900px minimum application width only on mobile landscape, preventing the Rack from being pushed underneath the Android navigation rail.
- Uses `visualViewport` dimensions and recalculates after `resize`, `visualViewport.resize`, `orientationchange`, and `screen.orientation.change`.
- Android rotation is remeasured in several short settling passes because the orientation, layout viewport and visual viewport can update at different moments after portrait → landscape rotation.
- The mobile Board column is derived from the genuinely available gameplay height; the square Board is sized explicitly so its complete 9×9 area remains on-screen.
- The Rack automatically receives all remaining horizontal space and is repacked only after the settled landscape geometry is measured.
- Adds an orientation-aware Android navigation-rail safety inset for edge-to-edge PWA cases where the browser reports no inset.
- `Version 1.26.4` remains visible in both portrait and short mobile landscape.
- Adds `.gitattributes` to keep project text files on LF line endings.
- PWA service-worker cache namespace updated to **suji-v1-26-4**.
