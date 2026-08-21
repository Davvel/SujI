/** SuJi classic-compatible module wrapper. Source owner: js/levels/tutorial/level-005.js */
SuJiModules.define("js/levels/tutorial/level-005.js", function(require, exports){
'use strict';
/** SuJi tutorial level 005. Content only; no game-engine logic. */
const __default_export__ = Object.freeze({
  id: 'tutorial-005',
  number: 5,
  type: 'tutorial',
  puzzle: Object.freeze({size:9, patternId:5, sudokuSeed:5}),
  artwork: Object.freeze({image:`resources/Image_0005.png`}),
  rules: Object.freeze({pictureMode:true,piecesGuide:false,hintsAllowed:true,rotationsAllowed:false,placementHints:5}),
  progression: Object.freeze({unlockAfter:'tutorial-004'}),
  metadata: Object.freeze({title:"Level 5, Use the picture and all Sudoku rules together.",tutorialStep:5})
});
exports.default = __default_export__;
});
