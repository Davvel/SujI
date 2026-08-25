/** SuJi classic-compatible module wrapper. Source owner: js/levels/tutorial/level-006.js */
SuJiModules.define("js/levels/tutorial/level-006.js", function(require, exports){
'use strict';
/** SuJi tutorial level 006. Content only; no game-engine logic. */
const __default_export__ = Object.freeze({
  id: 'tutorial-006',
  number: 6,
  type: 'tutorial',
  // Eleven spread shapes are pre-solved, leaving ten shapes in the Rack.
  puzzle: Object.freeze({size:9, patternId:6, sudokuSeed:6, startingBoardPieceIds:Object.freeze([0,20,4,18,8,12,2,16,6,10,14])}),
  artwork: Object.freeze({image:`resources/Image_0006.png`}),
  rules: Object.freeze({pictureMode:true,piecesGuide:false,hintsAllowed:true,rotationsAllowed:false,placementHints:5}),
  progression: Object.freeze({unlockAfter:null}),
  metadata: Object.freeze({title:'Tutorial - Cuddly Cat',puzzleTitle:'Cuddly Cat',tutorialStep:6,tutorialTotal:10})
});
exports.default = __default_export__;
});
