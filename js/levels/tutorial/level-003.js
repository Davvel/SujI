/** SuJi tutorial level 003. Content only; no game-engine logic. */
export default Object.freeze({
  id: 'tutorial-003',
  number: 3,
  type: 'tutorial',
  puzzle: Object.freeze({size:9, patternId:3, sudokuSeed:3}),
  artwork: Object.freeze({image:`resources/Image_0003.png`}),
  rules: Object.freeze({pictureMode:true,piecesGuide:false,hintsAllowed:true,rotationsAllowed:false,placementHints:5}),
  progression: Object.freeze({unlockAfter:'tutorial-002'}),
  metadata: Object.freeze({title:"Level 3, Follow the stripes: each row uses 1\u20139 once.",tutorialStep:3})
});
