/** SuJi classic-compatible module wrapper. Source owner: config/game-config.js */
SuJiModules.define("config/game-config.js", function(require, exports){
'use strict';
/**
 * SuJi Module: config/game-config
 * Owns: stable non-visual game constants and tutorial copy.
 */
const GAME_CONFIG = Object.freeze({
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

const TYPE_COLORS = Object.freeze({I:'#2f80ed',O:'#f2b705',ONE:'#2fb65d'});

const TUTORIAL_LEVELS = Object.freeze({
  1:'Find the last 3 shapes in the Jigsaw Puzzle to complete Level 1.',
  2:'The last 3 shapes are identical. Double-check where each one fits using Sudoku: a number cannot repeat horizontally, vertically, or inside any 3 × 3 quadrant.',
  3:'Level 3, Follow the stripes: each row uses 1–9 once.',
  4:'Level 4, Follow the stripes: each column uses 1–9 once.',
  5:'Level 5, Use the picture and all Sudoku rules together.'
});

const RULE_COPY = Object.freeze({
  row:{text:n=>`${n} cannot be twice in a row.`},
  col:{text:n=>`${n} cannot be twice in a column.`},
  box:{text:n=>`${n} cannot be twice in a 3 by 3 area.`}
});
exports["GAME_CONFIG"] = GAME_CONFIG;
exports["TYPE_COLORS"] = TYPE_COLORS;
exports["TUTORIAL_LEVELS"] = TUTORIAL_LEVELS;
exports["RULE_COPY"] = RULE_COPY;
});
