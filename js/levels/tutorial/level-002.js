/** SuJi tutorial level 002. Content only; no game-engine logic. */
export default Object.freeze({
  id: 'tutorial-002',
  number: 2,
  type: 'tutorial',
  puzzle: Object.freeze({size:9, patternId:2, sudokuSeed:2}),
  artwork: Object.freeze({image:`resources/Image_0002.png`}),
  rules: Object.freeze({pictureMode:true,piecesGuide:false,hintsAllowed:true,rotationsAllowed:false,placementHints:5}),
  progression: Object.freeze({unlockAfter:'tutorial-001'}),
  metadata: Object.freeze({title:"Level 2, Notice the numbers as you build.",tutorialStep:2})
});
