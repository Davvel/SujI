# SuJi 1.28.0 — Architecture Migration Baseline

This package is the first SuJi build arranged around `arch_1.1.0.md`. It preserves the accepted 1.27.0 gameplay while beginning real code extraction.

## Already extracted
- central configuration (`config/`)
- design-token starting point (`config/theme.css`)
- pattern provider (`js/data/pattern-provider.js`)
- Sudoku generator (`js/game/sudoku-generator.js`)
- puzzle/piece builder (`js/game/puzzle-builder.js`)
- first-class Levels subsystem (`js/levels/`) supporting Tutorial, Standard, Themed and Sponsored families

## Transitional compatibility
`js/app.js` still contains the proven interaction, rendering, Hint, validation, responsive-layout and persistence code from 1.27.0. Those areas are intentionally migrated in later controlled steps rather than rewritten simultaneously. `css/legacy.css` likewise preserves the accepted visual behaviour while new visual constants begin in `config/theme.css`.

The ownership target and migration rules are defined in `arch_1.1.0.md`.
