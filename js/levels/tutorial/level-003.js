/** SuJi classic-compatible module wrapper. Source owner: js/levels/tutorial/level-003.js */
SuJiModules.define("js/levels/tutorial/level-003.js", function(require, exports){
'use strict';
/** SuJi tutorial level 003. Content only; no game-engine logic. */
const __default_export__ = Object.freeze({
  id: 'tutorial-003',
  number: 3,
  type: 'tutorial',
  // Ten of Pattern 3's 21 shapes are pre-dealt. Their homes were selected to
  // cover all nine 3x3 regions and keep the locked shapes spatially dispersed.
  puzzle: Object.freeze({size:9, patternId:3, sudokuSeed:3, startingBoardPieceIds:Object.freeze([0,2,4,6,8,10,15,16,17,18])}),
  artwork: Object.freeze({image:null}),
  rules: Object.freeze({pictureMode:false,piecesGuide:false,hintsAllowed:true,rotationsAllowed:false,placementHints:5}),
  progression: Object.freeze({unlockAfter:'tutorial-002'}),
  metadata: Object.freeze({title:"Level 3, Learn to use Hint with Sudoku.",tutorialStep:3})
});
exports.default = __default_export__;
});
