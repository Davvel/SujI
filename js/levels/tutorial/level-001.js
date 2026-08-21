/** SuJi classic-compatible module wrapper. Source owner: js/levels/tutorial/level-001.js */
SuJiModules.define("js/levels/tutorial/level-001.js", function(require, exports){
'use strict';
/** SuJi tutorial level 001. Content only; no game-engine logic. */
const __default_export__ = Object.freeze({
  id: 'tutorial-001',
  number: 1,
  type: 'tutorial',
  puzzle: Object.freeze({size:9, patternId:1, sudokuSeed:1}),
  artwork: Object.freeze({image:`resources/Image_0001.png`}),
  rules: Object.freeze({pictureMode:true,piecesGuide:false,hintsAllowed:true,rotationsAllowed:false,placementHints:5}),
  progression: Object.freeze({unlockAfter:null}),
  metadata: Object.freeze({title:"Solve the Jigsaw, but mind the Sudoku numbers.",tutorialStep:1})
});
exports.default = __default_export__;
});
