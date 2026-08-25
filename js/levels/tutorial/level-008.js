/** SuJi classic-compatible module wrapper. Source owner: js/levels/tutorial/level-008.js */
SuJiModules.define("js/levels/tutorial/level-008.js", function(require, exports){
'use strict';
/** SuJi tutorial level 008. Content only; no game-engine logic. */
const __default_export__ = Object.freeze({
  id: 'tutorial-008',
  number: 8,
  type: 'tutorial',
  // Six spread shapes are pre-solved.
  puzzle: Object.freeze({size:9, patternId:8, sudokuSeed:8, startingBoardPieceIds:Object.freeze([0,15,17,3,12,20])}),
  // Reuse the existing dog artwork while Level 8 owns it as tutorial content.
  artwork: Object.freeze({image:`resources/Image_0008.png`}),
  rules: Object.freeze({pictureMode:true,piecesGuide:false,hintsAllowed:true,rotationsAllowed:false,placementHints:5}),
  progression: Object.freeze({unlockAfter:null}),
  metadata: Object.freeze({title:'Tutorial - Loyal Dog',puzzleTitle:'Loyal Dog',tutorialStep:8,tutorialTotal:10})
});
exports.default = __default_export__;
});
