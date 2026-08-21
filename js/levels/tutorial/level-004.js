/** SuJi classic-compatible module wrapper. Source owner: js/levels/tutorial/level-004.js */
SuJiModules.define("js/levels/tutorial/level-004.js", function(require, exports){
'use strict';
/** SuJi tutorial level 004. Content only; no game-engine logic. */
const __default_export__ = Object.freeze({
  id: 'tutorial-004',
  number: 4,
  type: 'tutorial',
  puzzle: Object.freeze({size:9, patternId:4, sudokuSeed:4}),
  artwork: Object.freeze({image:`resources/Image_0004.png`}),
  rules: Object.freeze({pictureMode:true,piecesGuide:false,hintsAllowed:true,rotationsAllowed:false,placementHints:5}),
  progression: Object.freeze({unlockAfter:'tutorial-003'}),
  metadata: Object.freeze({title:"Level 4, Follow the stripes: each column uses 1\u20139 once.",tutorialStep:4})
});
exports.default = __default_export__;
});
