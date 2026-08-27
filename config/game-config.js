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
  tutorialLastLevel: 10,
  placementHintsPerLevel: 5,
  minStartingHints: 1,
  maxStartingHints: 3,
  defaultStartingHints: 3
});

const TYPE_COLORS = Object.freeze({I:'#2f80ed',O:'#f2b705',ONE:'#2fb65d'});

const TUTORIAL_LEVELS = Object.freeze({
  1:'SuJi - Where Sudoku meets Jigsaw Puzzle. Drag the missing shapes to complete the picture.',
  2:'Let\'s try a Sudoku level. Without a picture to guide which shape goes where, Sudoku rules will guide us. In Sudoku levels, colours only help you distinguish the different shapes; they do not affect the solution. Sudoku forbids the same number from repeating in any row, column, or 3 × 3 quadrant.',
  3:'In this level you must use a hint at least once.',
  4:'Some levels include pictures that can still be hard to solve, especially when large areas have the same colour. In these cases, you can rely on both the visual cues from the colours and the Sudoku rules.',
  5:'Level 5, Use all Sudoku rules together.'
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
