/** SuJi classic-compatible module wrapper. Source owner: js/levels/tutorial/level-004.js */
SuJiModules.define("js/levels/tutorial/level-004.js", function(require, exports){
'use strict';
/** SuJi tutorial level 004. Content only; no game-engine logic. */
const __default_export__ = Object.freeze({
  id: 'tutorial-004',
  number: 4,
  type: 'tutorial',
  // Nine spread shapes are solved, leaving twelve shapes for the player.
  puzzle: Object.freeze({size:9, patternId:4, sudokuSeed:4, startingBoardPieceIds:Object.freeze([0,20,3,13,8,10,17,2,7])}),
  artwork: Object.freeze({image:`resources/Image_0004.png`}),
  rules: Object.freeze({pictureMode:true,piecesGuide:false,hintsAllowed:true,rotationsAllowed:false,placementHints:5}),
  progression: Object.freeze({unlockAfter:null}),
  metadata: Object.freeze({title:'Tutorial - Flag of France',puzzleTitle:'Flag of France',tutorialStep:4,tutorialTotal:10})
});
exports.default = __default_export__;
});
