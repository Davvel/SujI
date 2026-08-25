/** SuJi classic-compatible module wrapper. Source owner: js/levels/tutorial/level-002.js */
SuJiModules.define("js/levels/tutorial/level-002.js", function(require, exports){
'use strict';
/** SuJi tutorial level 002. Content only; no game-engine logic. */
const __default_export__ = Object.freeze({
  id: 'tutorial-002',
  number: 2,
  type: 'tutorial',
  puzzle: Object.freeze({size:9, patternId:2, sudokuSeed:2, startingRackPieceIds:Object.freeze([2,12,16])}),
  artwork: Object.freeze({image:null}),
  rules: Object.freeze({pictureMode:false,piecesGuide:false,hintsAllowed:true,rotationsAllowed:false,placementHints:5}),
  progression: Object.freeze({unlockAfter:null}),
  metadata: Object.freeze({title:'Tutorial Level - Sudoku Lite',tutorialStep:2,tutorialTotal:10})
});
exports.default = __default_export__;
});
