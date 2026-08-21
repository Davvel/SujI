/** SuJi classic-compatible module wrapper. Source owner: js/levels/types/standard-level.js */
SuJiModules.define("js/levels/types/standard-level.js", function(require, exports){
'use strict';
/** Creates the common contract for the current generated SuJi progression. */
function createStandardLevel(level){
  const n=Number(level)||1;
  return Object.freeze({
    id:`standard-${String(n).padStart(4,'0')}`, number:n, type:'standard',
    puzzle:Object.freeze({size:9,patternId:((n-1)%10)+1,sudokuSeed:n}),
    artwork:Object.freeze({image:n<=5?`resources/Image_${String(n).padStart(4,'0')}.png`:null}),
    rules:Object.freeze({pictureMode:null,piecesGuide:false,hintsAllowed:true,rotationsAllowed:false,placementHints:5}),
    progression:Object.freeze({unlockAfter:n>1?`standard-${String(n-1).padStart(4,'0')}`:null}),
    metadata:Object.freeze({title:`Level ${n}`})
  });
}
exports["createStandardLevel"] = createStandardLevel;
});
