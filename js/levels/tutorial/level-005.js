/** SuJi classic-compatible module wrapper. Source owner: js/levels/tutorial/level-005.js */
SuJiModules.define("js/levels/tutorial/level-005.js", function(require, exports){
'use strict';
/** SuJi tutorial level 005. Content only; no game-engine logic. */
const __default_export__ = Object.freeze({
  id: 'tutorial-005',
  number: 5,
  type: 'tutorial',
  // Thirteen spread shapes are pre-solved, leaving eight shapes in the Rack.
  puzzle: Object.freeze({size:9, patternId:5, sudokuSeed:5, startingBoardPieceIds:Object.freeze([0,20,4,16,10,2,18,6,12,8,14,3,17])}),
  artwork: Object.freeze({image:null}),
  rules: Object.freeze({pictureMode:false,piecesGuide:false,hintsAllowed:true,rotationsAllowed:false,placementHints:5}),
  progression: Object.freeze({unlockAfter:null}),
  metadata: Object.freeze({title:'Tutorial Level - Sudoku Medium',tutorialStep:5,tutorialTotal:10})
});
exports.default = __default_export__;
});
