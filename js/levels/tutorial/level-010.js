/** SuJi classic-compatible module wrapper. Source owner: js/levels/tutorial/level-010.js */
SuJiModules.define("js/levels/tutorial/level-010.js", function(require, exports){
'use strict';
/** SuJi tutorial level 010. Content only; no game-engine logic. */
const __default_export__ = Object.freeze({
  id: 'tutorial-010',
  number: 10,
  type: 'tutorial',
  // Six spread shapes are pre-solved.
  puzzle: Object.freeze({size:9, patternId:10, sudokuSeed:10, startingBoardPieceIds:Object.freeze([0,20,16,3,10,18])}),
  artwork: Object.freeze({image:null}),
  rules: Object.freeze({pictureMode:false,piecesGuide:false,hintsAllowed:true,rotationsAllowed:false,placementHints:5}),
  progression: Object.freeze({unlockAfter:null}),
  metadata: Object.freeze({title:'Tutorial Level - Sudoku Harder',tutorialStep:10,tutorialTotal:10})
});
exports.default = __default_export__;
});
