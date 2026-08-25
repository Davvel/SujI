/** SuJi classic-compatible module wrapper. Source owner: js/levels/tutorial/level-007.js */
SuJiModules.define("js/levels/tutorial/level-007.js", function(require, exports){
'use strict';
/** SuJi tutorial level 007. Content only; no game-engine logic. */
const __default_export__ = Object.freeze({
  id: 'tutorial-007',
  number: 7,
  type: 'tutorial',
  // Nine spread shapes are solved, leaving twelve shapes for the player.
  puzzle: Object.freeze({size:9, patternId:7, sudokuSeed:7, startingBoardPieceIds:Object.freeze([0,19,3,17,9,1,10,4,20])}),
  artwork: Object.freeze({image:null}),
  rules: Object.freeze({pictureMode:false,piecesGuide:false,hintsAllowed:true,rotationsAllowed:false,placementHints:5}),
  progression: Object.freeze({unlockAfter:null}),
  metadata: Object.freeze({title:'Tutorial Level - Slightly Harder',tutorialStep:7,tutorialTotal:10})
});
exports.default = __default_export__;
});
