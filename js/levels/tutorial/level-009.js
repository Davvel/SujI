/** SuJi classic-compatible module wrapper. Source owner: js/levels/tutorial/level-009.js */
SuJiModules.define("js/levels/tutorial/level-009.js", function(require, exports){
'use strict';
/** SuJi tutorial level 009. Content only; no game-engine logic. */
const __default_export__ = Object.freeze({
  id: 'tutorial-009',
  number: 9,
  type: 'tutorial',
  // Ten spread shapes are pre-solved.
  puzzle: Object.freeze({size:9, patternId:9, sudokuSeed:9, startingBoardPieceIds:Object.freeze([0,18,15,5,8,19,10,3,11,6])}),
  artwork: Object.freeze({image:null}),
  rules: Object.freeze({pictureMode:false,piecesGuide:false,hintsAllowed:true,rotationsAllowed:false,placementHints:5}),
  progression: Object.freeze({unlockAfter:null}),
  metadata: Object.freeze({title:'Tutorial Level - Sudoku Hard',tutorialStep:9,tutorialTotal:10})
});
exports.default = __default_export__;
});
