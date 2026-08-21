/**
 * SuJi Module: config/game-config
 * Owns: stable non-visual game constants and tutorial copy.
 */
export const GAME_CONFIG = Object.freeze({
  boardSize: 9,
  maxLevel: 9999,
  levelsPerPickerPage: 100,
  tutorialFirstLevel: 1,
  tutorialLastLevel: 5,
  placementHintsPerLevel: 5,
  minStartingHints: 1,
  maxStartingHints: 3,
  defaultStartingHints: 3
});

export const TYPE_COLORS = Object.freeze({I:'#2f80ed',O:'#f2b705',ONE:'#2fb65d'});

export const TUTORIAL_LEVELS = Object.freeze({
  1:'Solve the Jigsaw, but mind the Sudoku numbers.',
  2:'Level 2, Notice the numbers as you build.',
  3:'Level 3, Follow the stripes: each row uses 1–9 once.',
  4:'Level 4, Follow the stripes: each column uses 1–9 once.',
  5:'Level 5, Use the picture and all Sudoku rules together.'
});

export const RULE_COPY = Object.freeze({
  row:{text:n=>`${n} cannot be twice in a row.`},
  col:{text:n=>`${n} cannot be twice in a column.`},
  box:{text:n=>`${n} cannot be twice in a 3 by 3 area.`}
});
