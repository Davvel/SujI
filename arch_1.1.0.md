# SuJi Architecture Blueprint

**Architecture Version:** `arch_1.1.0`  
**Game Baseline Analysed:** `SuJi 1.27.0`  
**Status:** Revised refactoring blueprint — Levels subsystem added  
**Purpose:** Define how SuJi will be progressively separated into small, specialised, low-coupling files so future changes can normally be made by editing only the file responsible for that behaviour.

---

## 1. Why We Are Refactoring

SuJi 1.27.0 is working well as a game, but its implementation has grown organically during rapid development.

The current package contains, among other files:

- `app.js` — approximately 3,084 lines and currently responsible for most game behaviour.
- `styles.css` — approximately 8,069 lines and contains the visual history of many successive refinements and overrides.
- `patterns.js` — already a useful example of data/logic that has been separated from the main application.
- `pattern_data/*.json` — ten pattern data files.
- `index.html` — application markup and dialogs.
- `sw.js` — PWA caching/service-worker behaviour.

The main architectural problem is not that the game is too large. The problem is that unrelated responsibilities currently live together.

For example, `app.js` currently contains functions for:

- saved progress and local storage;
- scoring and timers;
- tutorial behaviour;
- Hint Mode;
- conflict detection and conflict UI;
- responsive layout calculations;
- Sudoku generation;
- puzzle-piece creation;
- Board construction;
- Rack packing/layout;
- drag and drop;
- placement previews;
- validation;
- level selection;
- dialogs;
- picture preview;
- PWA-related startup behaviour.

Similarly, `styles.css` contains accumulated styling for the Board, Rack, pieces, guides, Hint Mode, dialogs, responsive behaviour, landscape corrections, conflict effects and many historical overrides.

This means a small request can require reading a very large amount of unrelated code. The refactor will make the **file structure itself describe the game architecture**.

---

## 2. Primary Architectural Goal

After the refactor, a request should naturally point to a specialised file.

Examples:

| Requested change | Primary file expected to change |
|---|---|
| Change a colour | `config/theme.css` |
| Change animation timing | `config/ui-config.js` or `config/theme.css` |
| Change how a Sudoku is generated | `js/game/sudoku-generator.js` |
| Change how pieces are built from a puzzle pattern | `js/game/puzzle-builder.js` |
| Change legal placement rules | `js/game/placement-rules.js` |
| Change Sudoku conflict detection | `js/game/validator.js` |
| Change Hint Mode logic | `js/features/hints.js` |
| Change tutorial behaviour | `js/features/tutorial.js` |
| Change dragging behaviour | `js/features/drag-drop.js` |
| Change Rack packing | `js/layout/rack-layout.js` |
| Change mobile landscape calculation | `js/layout/responsive-layout.js` |
| Change Board HTML rendering | `js/ui/board-view.js` |
| Change Rack HTML rendering | `js/ui/rack-view.js` |
| Change scoring/stars | `js/game/scoring.js` |
| Change level unlocking/progression | `js/levels/progression.js` |
| Change how a level is loaded | `js/levels/level-loader.js` |
| Change a specific tutorial level | `js/levels/tutorial/level-XXX.js` |
| Change normal generated level rules | `js/levels/types/standard-level.js` |
| Change themed/photo-pack level behaviour | `js/levels/types/themed-level.js` |
| Change sponsored level behaviour | `js/levels/types/sponsored-level.js` |
| Change saved settings/progress | `js/storage/*.js` |
| Add/change a tessellation | `data/patterns/*.json` |
| Change offline/PWA cache behaviour | `sw.js` |

The normal future workflow should therefore become:

1. Consult `arch.md` / the latest architecture blueprint.
2. Identify the owning module.
3. Read only that module and its documented dependencies.
4. Modify the smallest possible surface.
5. Return the modified file only.
6. Request additional files only when the requested change crosses a defined module boundary.

**Important:** one-file delivery is the default objective, not an artificial restriction. Some legitimate architectural changes may require two or more coordinated files. We should not duplicate logic merely to force every change into one file.

---

## 3. Design Principles

### 3.1 One responsibility per module

Each file should have one clear reason to change.

`validator.js`, for example, should determine whether the puzzle violates Sudoku/game rules. It should not open a red bubble, animate a piece, save progress or calculate Rack dimensions.

### 3.2 Configuration instead of scattered magic values

Colours, durations, responsive thresholds, storage keys, level limits and similar values should live in dedicated configuration files rather than being scattered through application code.

### 3.3 Game logic must not depend on the DOM

Core puzzle logic should operate on plain JavaScript data.

A function that checks whether a piece fits should receive a Board/piece position and return a result. It should not call `document.querySelector()` or change CSS classes.

This makes the core game safer, easier to test and much smaller for AI context.

### 3.4 UI modules render; game modules decide

The game layer decides **what is true**.

The UI layer decides **how that truth looks**.

Example:

- `validator.js` returns a row conflict involving number 5.
- `conflict-view.js` decides where and how to display the conflict bubble.
- `theme.css` decides the red colour, shadow and animation appearance.

### 3.5 Feature modules orchestrate user interactions

Features such as Hint Mode and Tutorial Mode naturally touch several systems. Their modules should orchestrate those systems through public functions rather than reaching into another module's private variables.

### 3.6 One central application state

SuJi should have one intentional state owner instead of state being implicitly distributed through DOM classes, global variables and local storage.

The state object may remain simple JavaScript; we do not need a framework.

### 3.7 Explicit module APIs

Every important module should export a small public API. Internal helper functions remain private to the file.

That gives us a stable contract and lets future work focus on one file without needing to understand every implementation detail elsewhere.

### 3.8 No framework or build system unless we later need one

SuJi is a small HTML/JavaScript PWA and should remain easy to run from GitHub Pages.

The first refactor should use native browser **ES modules** (`type="module"`) rather than introducing React, Vue, Webpack or another build chain.

This preserves the current simplicity while giving us proper imports/exports and module boundaries.

---

## 4. Proposed Target Folder Structure

```text
SuJi/
│
├── index.html
├── manifest.webmanifest
├── sw.js
├── README.md
├── arch.md
│
├── config/
│   ├── theme.css
│   ├── game-config.js
│   ├── ui-config.js
│   └── storage-keys.js
│
├── css/
│   ├── base.css
│   ├── app-shell.css
│   ├── board.css
│   ├── rack.css
│   ├── pieces.css
│   ├── hints.css
│   ├── conflicts.css
│   ├── dialogs.css
│   ├── tutorial.css
│   ├── level-picker.css
│   ├── pwa.css
│   └── responsive.css
│
├── js/
│   ├── main.js
│   │
│   ├── core/
│   │   ├── state.js
│   │   ├── events.js
│   │   ├── dom.js
│   │   └── utils.js
│   │
│   ├── game/
│   │   ├── sudoku-generator.js
│   │   ├── puzzle-builder.js
│   │   ├── placement-rules.js
│   │   ├── validator.js
│   │   └── scoring.js
│   │
│   ├── levels/
│   │   ├── level-manager.js
│   │   ├── level-loader.js
│   │   ├── level-registry.js
│   │   ├── progression.js
│   │   │
│   │   ├── types/
│   │   │   ├── tutorial-level.js
│   │   │   ├── standard-level.js
│   │   │   ├── themed-level.js
│   │   │   └── sponsored-level.js
│   │   │
│   │   ├── tutorial/
│   │   │   ├── level-001.js
│   │   │   ├── level-002.js
│   │   │   ├── level-003.js
│   │   │   ├── level-004.js
│   │   │   └── level-005.js
│   │   │
│   │   ├── standard/
│   │   │   ├── standard-level-provider.js
│   │   │   └── standard-progression.js
│   │   │
│   │   ├── packs/
│   │   │   ├── pack-manager.js
│   │   │   └── pack-registry.js
│   │   │
│   │   └── sponsored/
│   │       └── sponsored-pack-provider.js
│   │
│   ├── data/
│   │   └── pattern-provider.js
│   │
│   ├── layout/
│   │   ├── rack-layout.js
│   │   └── responsive-layout.js
│   │
│   ├── features/
│   │   ├── drag-drop.js
│   │   ├── hints.js
│   │   ├── tutorial.js
│   │   ├── picture-preview.js
│   │   ├── level-picker.js
│   │   └── settings.js
│   │
│   ├── ui/
│   │   ├── board-view.js
│   │   ├── rack-view.js
│   │   ├── piece-view.js
│   │   ├── conflict-view.js
│   │   ├── stats-view.js
│   │   └── dialogs.js
│   │
│   └── storage/
│       ├── preferences-store.js
│       └── progress-store.js
│
├── data/
│   └── patterns/
│       ├── pattern_01.json
│       ├── pattern_02.json
│       └── ...
│
├── resources/
└── icons/
```

This is the intended end-state. We should reach it progressively, not through a dangerous one-shot rewrite.

---

## 5. Configuration Layer

### `config/theme.css`

This should become the first place to look for visual colour changes.

It will contain CSS custom properties such as:

```css
:root {
  --color-piece-i: #2f80ed;
  --color-piece-o: #f2b705;
  --color-piece-one: #2fb65d;

  --color-board-background: #ffffff;
  --color-conflict: #d93025;
  --color-hint-start: #ffd54a;
  --color-hint-end: #ef5350;
  --color-landing-preview: rgba(255, 80, 80, 0.28);

  --radius-panel: 18px;
  --duration-hint-pulse: 900ms;
  --duration-piece-shake: 300ms;
}
```

A future request such as “make valid landing previews blue instead of light red” should ideally require only `theme.css`.

### `config/game-config.js`

Owns non-visual game constants, for example:

- Board size = 9;
- maximum level;
- number of hints;
- tutorial-level range;
- levels per selector page;
- scoring thresholds;
- pattern cycling rules where appropriate.

### `config/ui-config.js`

Owns behaviour-related UI constants, for example:

- landscape/portrait breakpoints;
- minimum Rack cell size;
- animation delays that JavaScript must know about;
- orientation stabilization timings;
- preview timings.

### `config/storage-keys.js`

All local/session storage keys should be declared here. This prevents accidental key mismatches and makes future migrations much safer.

---

## 6. Core Layer

### `js/core/state.js`

Owns the application's runtime state.

It should expose controlled operations such as:

```js
getState()
setLevel(level)
setPieces(pieces)
setPlacement(pieceId, position)
resetLevelState()
```

Modules should not create unrelated global state of their own unless it is purely temporary/private.

### `js/core/events.js`

A very small event mechanism can decouple modules.

Examples of useful events:

- `level:loaded`
- `piece:moved`
- `validation:changed`
- `hint:started`
- `hint:finished`
- `layout:changed`
- `level:completed`

We should keep this lightweight and use it only where it genuinely reduces coupling.

### `js/core/dom.js`

Contains reusable DOM lookup/helpers, replacing scattered `$` / `$$` access where useful.

### `js/core/utils.js`

Generic helpers only, such as:

- `clamp()`;
- seeded RNG;
- shuffle;
- time formatting;
- safe number conversion.

No SuJi-specific gameplay should be hidden in `utils.js`.

---

## 7. Game Domain Layer

This is the most important separation because it contains the actual rules of SuJi.

### `js/game/sudoku-generator.js`

Owns Sudoku-number generation only.

Current responsibility migrating here:

- `makeSudoku(seed)`;
- tutorial/canonical Sudoku generation if it belongs to puzzle data rather than tutorial presentation.

Input:

```text
seed / level parameters
```

Output:

```text
9×9 Sudoku data
```

It must not render anything.

### `js/game/puzzle-builder.js`

Owns construction of SuJi puzzle pieces from a level, Sudoku and tessellation pattern.

Current responsibility migrating here:

- `makePieces()`;
- piece normalization;
- piece home positions;
- mapping Sudoku values into piece cells.

This will be the main file to modify if we later change **how a puzzle is assembled**.

### `js/game/placement-rules.js`

Owns the rules for whether and where a piece may be placed.

Current responsibilities migrating here include the logical portion of:

- `fits()`;
- overlap checks;
- Board-boundary checks;
- compatible target/home checks;
- identifying blocking pieces.

It returns results; it does not colour cells or animate blockers.

### `js/game/validator.js`

Owns Sudoku/game validation.

Current responsibility migrating here:

- logical portion of `validate()`;
- row conflicts;
- column conflicts;
- 3×3 conflicts;
- conflict identity/data.

A validation result should look approximately like:

```js
{
  valid: false,
  conflicts: [
    {
      type: 'row',
      number: 5,
      cells: [...],
      pieceIds: [...]
    }
  ]
}
```

The validator should have no knowledge of bubbles, CSS, shaking or tutorials.

### `js/game/scoring.js`

Owns:

- score calculation;
- performance rating;
- stars;
- completion record comparisons.

Progression no longer belongs inside the low-level game engine. It belongs to the Levels subsystem because progression may differ by level type, pack, tutorial, campaign or sponsored content.

---

## 8. Levels Subsystem

Levels are a first-class architectural domain in SuJi.

The game engine must not decide **what kind of level** the player is playing. It should receive a normalized level definition and build/play that level using common game APIs.

This prepares SuJi for four distinct level families while keeping the engine independent from content strategy.

### 8.1 The four level types

#### 1. Tutorial Levels

Purpose:

- teach mechanics progressively;
- force or restrict settings where required;
- provide curated starting states and instructional sequencing;
- support hand-authored behaviour for early levels.

Primary modules:

```text
js/levels/types/tutorial-level.js
js/levels/tutorial/level-001.js
js/levels/tutorial/level-002.js
...
```

A specific tutorial rule should normally be changed in that level's own file.

#### 2. Standard Levels

Purpose:

- provide the main SuJi progression;
- use generated/selected Sudoku and tessellation data;
- support long-running progression, potentially including abstract/generated artwork from later levels onward.

Primary modules:

```text
js/levels/types/standard-level.js
js/levels/standard/standard-level-provider.js
js/levels/standard/standard-progression.js
```

#### 3. Themed / Photo-Pack Levels

Purpose:

- provide purchasable or unlockable collections such as Malta, animals, cities, calendars or artist-created packs;
- associate artwork, metadata and optional story progression with normal SuJi gameplay;
- allow packs to be added without modifying the core engine.

Primary modules:

```text
js/levels/types/themed-level.js
js/levels/packs/pack-manager.js
js/levels/packs/pack-registry.js
```

Pack-specific data should live outside the engine and be loaded through the pack system.

#### 4. Sponsored Levels

Purpose:

- support branded puzzle packs supplied by companies;
- associate sponsorship metadata, quiz/unlock requirements and branded artwork with a level;
- keep advertising/commercial logic away from puzzle generation and Board interaction.

Primary modules:

```text
js/levels/types/sponsored-level.js
js/levels/sponsored/sponsored-pack-provider.js
```

The core SuJi engine should not contain sponsor-specific conditions.

### 8.2 Standard LevelDefinition contract

Every level type must be converted into a common object before it reaches the puzzle engine.

Conceptually:

```js
{
  id: "malta-001",
  type: "themed",

  puzzle: {
    size: 9,
    patternId: 4,
    sudokuSeed: 12345
  },

  artwork: {
    image: "assets/packs/malta/001.jpg"
  },

  rules: {
    piecesGuide: true,
    pictureMode: true,
    hintsAllowed: true,
    rotationsAllowed: false
  },

  progression: {
    unlockAfter: "malta-000"
  },

  metadata: {
    packId: "malta",
    title: "Valletta"
  }
}
```

The exact schema may evolve, but all level providers must normalize their data into the same contract.

### 8.3 `js/levels/level-manager.js`

Owns the currently selected level at the application-content level.

Responsibilities:

- request a level from the appropriate provider;
- normalize the result;
- expose current level metadata/rules;
- coordinate level completion with progression.

It must not generate Sudoku, render the Board or perform drag/drop.

### 8.4 `js/levels/level-loader.js`

Owns loading/resolving a level definition.

Examples:

- load tutorial level 3;
- resolve standard level 127;
- load themed pack `malta`, level 14;
- load a sponsored pack level.

It returns a normalized `LevelDefinition`.

### 8.5 `js/levels/level-registry.js`

Maps level types/providers to their implementations.

This keeps the system extensible. A future fifth type such as `daily`, `event`, `community` or `challenge` can be registered without rewriting the game engine.

### 8.6 `js/levels/progression.js`

Owns progression at the level-system boundary:

- which level becomes available next;
- highest standard level reached;
- pack progression;
- replay eligibility;
- tutorial completion gates;
- provider-specific progression delegation.

Persistence still remains in `js/storage/progress-store.js`.

### 8.7 Separation between Level System and Puzzle Builder

This distinction is mandatory:

```text
LEVEL SYSTEM
"What should the player play?"
        ↓
LevelDefinition
        ↓
PUZZLE BUILDER
"How do we construct the playable SuJi puzzle?"
        ↓
GameState
```

Therefore:

- `js/levels/` decides content, rules, metadata and progression context.
- `js/game/puzzle-builder.js` builds the playable puzzle from that definition.
- `js/game/` must not know whether the source was tutorial, standard, themed or sponsored.

This is one of the most important boundaries in the architecture.

---

## 9. Pattern/Data Layer

SuJi already has a good start here through `patterns.js` and the `pattern_data` JSON files.

The end-state should make the JSON pattern files the canonical data source where practical.

### `js/data/pattern-provider.js`

Responsibilities:

- load/cache pattern definitions;
- select a pattern for a level;
- validate pattern structure;
- expose pattern data to `puzzle-builder.js`.

Pattern validation belongs close to this provider, not in UI or drag code.

Future addition of hundreds of patterns should therefore not enlarge the gameplay engine.

---

## 10. Layout Layer

Layout mathematics is different from rendering and should have its own boundary.

### `js/layout/rack-layout.js`

Owns Rack geometry and packing.

Current functions that will largely migrate here include:

- `tryPackRack()`;
- `tryPackRackDense()`;
- `buildRackLayout()`;
- `centerRackLayout()`;
- `distributeRackLayout()`;
- `resolvePortraitRackLayout()`;
- Rack-related geometry from `resolvePortraitBoardRackGeometry()`.

Input:

```text
piece dimensions + available Rack width/height + layout mode
```

Output:

```text
positions and cell size
```

No DOM changes.

### `js/layout/responsive-layout.js`

Owns the calculations that determine Board/Rack sizing for:

- portrait;
- desktop/laptop landscape;
- short mobile landscape;
- visual viewport/orientation changes;
- safe inset calculations.

Current functions migrating here include much of:

- `getResponsiveViewport()`;
- `updateMobileLandscapeSafeInsets()`;
- `updateMobileLandscapeGeometry()`;
- `updateResponsiveLayout()`;
- `updateLandscapePlayHeight()`;
- `updatePortraitPlayHeight()`.

This is the likely file for future Pixel/mobile geometry work.

---

## 11. Feature Layer

Feature modules manage user workflows by calling the game, layout and UI APIs.

### `js/features/drag-drop.js`

Owns the drag lifecycle:

- start drag;
- update drag ghost;
- determine candidate Board location;
- request placement validation;
- commit/reject drop;
- cancel/cleanup.

Current responsibilities migrating here include:

- `startDrag()`;
- `moveGhost()`;
- `renderDragFrame()`;
- `endDrag()`;
- `cancelDrag()`;
- `cleanupDrag()`.

The actual legal-placement rule remains in `placement-rules.js`.

The landing-preview appearance remains in CSS/UI.

### `js/features/hints.js`

Owns Hint Mode state and workflow:

- arm hint;
- select hinted Rack piece;
- identify compatible destinations;
- manage blocked destinations;
- finish/cancel Hint Mode;
- determine whether hints are available.

It should use `placement-rules.js` for facts and UI modules for visuals.

### `js/features/tutorial.js`

Owns:

- tutorial level behaviour;
- tutorial message sequencing;
- rule-tip decisions;
- tutorial completion/dismissal state.

Tutorial visual presentation belongs in `tutorial.css` / dialogs UI.

### `js/features/picture-preview.js`

Owns the picture-preview workflow and animation orchestration.

### `js/features/level-picker.js`

Owns level-selection interaction and paging.

### `js/features/settings.js`

Owns Picture/Guide/other setting changes, including any restrictions imposed by the current level or tutorial.

---

## 12. UI Layer

UI files translate application state into DOM.

### `js/ui/board-view.js`

Owns:

- creating Board cells;
- rendering pieces on the Board;
- Board-specific overlays;
- exposing Board coordinate/DOM helper methods to interaction code.

### `js/ui/rack-view.js`

Owns Rack DOM rendering using positions supplied by `rack-layout.js`.

### `js/ui/piece-view.js`

Owns creation/update of piece DOM, including piece cells and numbers.

### `js/ui/conflict-view.js`

Owns:

- conflict bubble position/text;
- conflict cell highlighting;
- conflict shake presentation.

It consumes data from `validator.js`.

### `js/ui/stats-view.js`

Owns timer, move counter, stars/progress display and related labels.

### `js/ui/dialogs.js`

Owns generic dialog open/close operations and common dialog helpers.

---

## 13. Storage Layer

### `js/storage/preferences-store.js`

Owns user options such as:

- Picture setting;
- Guide setting;
- other persistent preferences.

### `js/storage/progress-store.js`

Owns:

- level history;
- visited levels;
- highest level reached;
- best completion records;
- migration of older storage formats if required.

The rest of the game should not contain hard-coded `localStorage.getItem()` calls.

---

## 14. CSS Architecture

The current `styles.css` should not simply be split arbitrarily by line number. It should be **consolidated by final responsibility**, removing obsolete overrides as each section is migrated.

### `config/theme.css`

Only design tokens and globally adjustable values.

### `css/base.css`

- reset/basic elements;
- typography;
- common utilities.

### `css/app-shell.css`

- header;
- controls;
- main game container;
- footer.

### `css/board.css`

- Board frame;
- Sudoku grid;
- Board layers;
- watermark.

### `css/rack.css`

- Rack frame;
- Rack surface;
- Rack states.

### `css/pieces.css`

- piece cell styling;
- shape families;
- locked/given pieces;
- piece numbers;
- generic piece animations.

### `css/hints.css`

- hint destinations;
- blocked destination stencils;
- yellow/red cycling;
- Hint Mode dimming;
- selected hint piece emphasis.

### `css/conflicts.css`

- conflict cells;
- conflict bubbles;
- conflict shakes;
- Rack conflict lock presentation.

### `css/responsive.css`

Only responsive CSS rules. Complex sizing maths should remain in `responsive-layout.js` rather than being duplicated unpredictably in CSS.

**Rule:** new CSS should be added to its owning component file, not appended to the bottom of an unrelated stylesheet as another version override.

---

## 15. Dependency Direction

The dependency direction should remain predictable:

```text
config / data / core
        ↓
      levels
        ↓
       game
        ↓
      layout
        ↓
    features
        ↓
       ui
        ↓
       DOM
```

Storage is accessed through its explicit store API.

A lower-level game module must never import a UI or feature module.

Examples:

**Allowed**

```text
level-loader.js → level-registry.js
puzzle-builder.js → pattern-provider.js
hints.js → placement-rules.js
board-view.js → state.js
rack-view.js → rack-layout.js
```

**Not allowed**

```text
sudoku-generator.js → sponsored-level.js
puzzle-builder.js → tutorial-level.js
validator.js → conflict-view.js
puzzle-builder.js → hints.js
rack-layout.js → rack-view.js
```

This one-way dependency discipline is essential for small context windows.

---

## 16. `main.js` Should Become Small

`js/main.js` is the composition root. It wires modules together and starts the application.

It should eventually be only a few hundred lines at most and ideally much less.

Typical responsibilities:

```text
1. load configuration/data;
2. initialize state/stores;
3. initialize the Levels subsystem;
4. initialize UI modules;
5. register feature controllers;
6. load/reset the selected level through `level-manager.js`;
7. register responsive/PWA startup hooks.
```

It should not contain the detailed implementation of Hint Mode, Rack packing, Sudoku generation or validation.

---

## 17. Module Header Contract

To make future AI-assisted development easier, each significant JS module should start with a small header comment.

Example:

```js
/**
 * SuJi Module: game/validator
 * Owns: Sudoku row/column/box validation.
 * May import: core/state types, game constants.
 * Must not import: UI, layout or feature modules.
 * Public API: validateBoard(), findConflicts().
 */
```

This gives both a human developer and an AI a quick statement of scope without reading the whole project.

---

## 18. Future AI Development Workflow

Once the refactor is complete, `arch.md` becomes the map of the project.

For a normal future change:

### Example A — colour change

Request:

> Make the landing preview pale blue instead of pale red.

Files normally needed:

```text
arch.md
config/theme.css
```

Expected delivery:

```text
config/theme.css only
```

### Example B — level-specific change

Request:

> Tutorial Level 3 should always force Pieces Guide ON.

Likely files:

```text
arch.md
js/levels/tutorial/level-003.js
```

Expected delivery:

```text
js/levels/tutorial/level-003.js
```

### Example C — puzzle generation change

Request:

> Change how starting locked pieces are selected.

Likely files:

```text
arch.md
js/game/puzzle-builder.js
config/game-config.js (only if a setting is involved)
```

Expected delivery:

```text
js/game/puzzle-builder.js
```

### Example D — mobile Rack sizing

Request:

> On portrait phones, allow the Rack to consume more vertical space when 15+ pieces remain.

Likely files:

```text
arch.md
js/layout/rack-layout.js
js/layout/responsive-layout.js (only if viewport allocation changes)
```

### Example E — Hint Mode visual change

Request:

> Make blocked hint destinations more visible but do not alter Hint logic.

Likely files:

```text
arch.md
css/hints.css
```

No game JavaScript should need to be read.

---

## 19. Refactoring Strategy — Do Not Rewrite Everything at Once

The current SuJi 1.27.0 should remain the protected behavioural baseline while refactoring.

The migration should happen in controlled stages, with the game tested after every stage.

### Phase 1 — Freeze baseline and introduce configuration

1. Keep SuJi 1.27.0 untouched as rollback baseline.
2. Introduce `arch.md`.
3. Extract colours/design tokens into `config/theme.css`.
4. Extract game/UI constants into config JS files.
5. Verify zero behavioural change.

### Phase 2 — Extract pure game logic

Move the safest, least DOM-dependent code first:

1. utilities;
2. Sudoku generator;
3. puzzle builder;
4. pattern provider;
5. placement rules;
6. validator;
7. scoring/progression.

This creates the clean logical foundation.

### Phase 3 — Establish the Levels subsystem

Before extracting tutorial and level-picker UI behaviour, create the content boundary:

1. `level-registry.js`;
2. `level-loader.js`;
3. `level-manager.js`;
4. `progression.js`;
5. the four level-type adapters;
6. migrate current tutorial/standard level definitions without changing gameplay.

The existing SuJi levels must first be reproduced through the common `LevelDefinition` contract.

### Phase 4 — Extract persistence

Move local/session storage responsibilities into the storage modules.

### Phase 5 — Extract layout mathematics

Move Rack packing and responsive calculations into `js/layout/` while keeping rendering unchanged.

### Phase 6 — Extract UI rendering

Move Board, Rack, piece, stats and conflict DOM rendering into `js/ui/`.

### Phase 7 — Extract features

Move drag/drop, Hint Mode, Tutorial Mode, picture preview, settings and level picker.

These are more interconnected, so they should be migrated after stable core APIs exist.

### Phase 8 — Consolidate CSS

Progressively move final effective styles into component CSS files and delete superseded historical overrides.

Do not mechanically copy all 8,000 lines into multiple files; the goal is to preserve the **final appearance** while removing obsolete cascade history.

### Phase 9 — Thin `main.js` and finalize module boundaries

At the end, `main.js` should mainly initialize modules and coordinate application startup.

### Phase 10 — Update PWA cache list

As files are split, update `sw.js` precache entries so offline behaviour remains correct.

---

## 20. Behaviour-Preservation Rule

A refactoring package must not silently alter gameplay.

During the architecture migration, we should preserve all accepted SuJi 1.27.0 behaviour, including the current:

- Board/Rack responsive behaviour;
- mobile landscape 50/50 balance;
- Hint Mode workflow;
- blocked hint destinations;
- conflict Rack lock;
- drag-and-drop behaviour;
- valid landing preview when Hint Mode is OFF;
- tutorial behaviour;
- level history/progression;
- Picture Mode;
- PWA installation/offline behaviour.

If we deliberately change behaviour, that should be treated as a feature change separate from the refactor and explicitly identified.

---

## 21. File Ownership Rule

Every future feature or behaviour must have a declared owner.

If a piece of logic appears in two modules, we should ask:

> Which module is the authoritative owner of this rule?

Then the other module should call that owner instead of duplicating the rule.

Examples:

- `validator.js` owns Sudoku conflicts.
- `placement-rules.js` owns legal placement.
- `rack-layout.js` owns Rack packing mathematics.
- `theme.css` owns colours.
- `hints.js` owns Hint workflow.
- `level-manager.js` owns current level orchestration.
- `level-loader.js` owns level resolution/loading.
- `level-registry.js` owns level-provider registration.
- `levels/progression.js` owns level-system progression.
- each `levels/types/*.js` adapter owns rules unique to that level family.

This is what prevents the architecture from slowly becoming monolithic again.

---

## 22. Rules for Future Changes

1. **Consult `arch.md` first.**
2. Identify the owning file before editing code.
3. Prefer changing configuration over logic when the request is genuinely configurable.
4. Do not put a feature-specific workaround into a general-purpose module.
5. Do not duplicate game rules in UI code.
6. Do not append CSS overrides merely because it is faster; modify the owning component/token.
7. Keep exported APIs small.
8. Keep private helpers private.
9. Update `arch.md` when a module is added, removed, renamed or changes ownership.
10. Update the architecture version when the blueprint materially changes.

---

## 23. Architecture Versioning

The architecture file should have its own version independent from the game version.

Current document:

```text
arch_1.1.0.md
```

Previous baseline:

```text
arch_1.0.0.md
```

Once accepted, the working project may keep a copy named simply:

```text
arch.md
```

Examples of future architecture changes:

- `arch_1.0.1` — wording/ownership clarification only.
- `arch_1.1.0` — add first-class Levels subsystem and four level-family architecture.
- `arch_1.2.0` — possible monetization/purchase architecture.
- `arch_1.3.0` — possible downloadable content/provider expansion.
- `arch_2.0.0` — major platform or framework change.

The architecture version should change only when the blueprint changes, not for every SuJi gameplay release.

---

## 24. Scalability Beyond the Current Game

This structure intentionally leaves room for future SuJi capabilities without expanding the core engine into one large file.

The new `js/levels/` subsystem already provides the home for tutorial, standard, themed/photo-pack and sponsored level families.

Possible future modules could include:

```text
js/levels/types/daily-level.js
js/levels/types/event-level.js
js/levels/types/community-level.js
js/content/daily-puzzle-provider.js
js/commerce/catalog.js
js/commerce/purchases.js
js/commerce/entitlements.js
js/ads/sponsored-pack.js
js/sharing/share-image.js
js/printing/export-print.js
```

These future features should consume the existing game APIs rather than being inserted inside puzzle generation, drag/drop or Board rendering.

---

## 25. Success Criteria

We will consider this refactor successful when:

- a colour change can normally be made in `theme.css` only;
- puzzle-construction changes are isolated from rendering;
- a change to a specific level type does not require editing the core puzzle engine;
- new packs and future level types can be added through the Levels subsystem;
- Sudoku rules can change without touching drag/drop or CSS;
- Rack/layout work can be done without reading Hint/tutorial code;
- Hint visual changes can be made without reading puzzle-generation code;
- persistence is isolated from gameplay;
- `main.js` becomes a small coordinator;
- there is no single multi-thousand-line application file;
- CSS no longer depends on a long chain of historical version overrides;
- each module has an obvious owner and public API;
- future AI-assisted changes normally require `arch.md` plus one or two relevant files rather than the complete SuJi project.

---

## 25. Recommended First Implementation Step

The first actual code refactor after approving this blueprint should be deliberately low risk:

### Refactor 1 — Configuration Foundation

Create:

```text
config/theme.css
config/game-config.js
config/ui-config.js
config/storage-keys.js
```

Then migrate only existing constants/tokens into those files while preserving SuJi 1.27.0 behaviour exactly.

This gives us an immediate architectural win and proves the modular approach before moving gameplay logic.

The next extraction should then be the **pure game layer**, starting with utilities, Sudoku generation and puzzle construction.

Immediately after the pure game foundation is stable, establish the **Levels subsystem** so Tutorial, Standard, Themed/Photo-Pack and Sponsored levels all reach the engine through the same `LevelDefinition` contract.

---

# Architecture Decision

**SuJi will remain a lightweight vanilla HTML/CSS/JavaScript PWA, but its implementation will be reorganized into native ES modules with strict ownership boundaries, central configuration, a first-class Levels subsystem, pure game-domain logic, separate layout mathematics, feature controllers and component-level UI/CSS.**

**The Levels subsystem will support Tutorial, Standard, Themed/Photo-Pack and Sponsored level families through one normalized `LevelDefinition` contract, so new content models can scale without contaminating the core game engine.**

This architecture is specifically designed to make SuJi easier to scale, safer to modify, and much more efficient to work on with limited AI context windows.
