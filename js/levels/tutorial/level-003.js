/** SuJi classic-compatible module wrapper. Source owner: js/levels/tutorial/level-003.js */
SuJiModules.define("js/levels/tutorial/level-003.js", function(require, exports){
'use strict';
/** SuJi tutorial level 003. Content only; no game-engine logic. */
const __default_export__ = Object.freeze({
  id: 'tutorial-003',
  number: 3,
  type: 'tutorial',
  // Six dispersed shapes remain in the Rack; the other fifteen are pre-solved.
  puzzle: Object.freeze({size:9, patternId:3, sudokuSeed:3, startingRackPieceIds:Object.freeze([0,17,4,16,11,18])}),
  artwork: Object.freeze({image:null}),
  rules: Object.freeze({pictureMode:false,piecesGuide:false,hintsAllowed:true,rotationsAllowed:false,placementHints:5}),
  progression: Object.freeze({unlockAfter:null}),
  metadata: Object.freeze({title:'Tutorial Level - Sudoku Easy',tutorialStep:3,tutorialTotal:10})
});
exports.default = __default_export__;
});
