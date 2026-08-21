/** SuJi classic-compatible module wrapper. Source owner: js/levels/types/sponsored-level.js */
SuJiModules.define("js/levels/types/sponsored-level.js", function(require, exports){
'use strict';
/** Adapter for future sponsored/quiz-unlocked puzzle packs. */
function createSponsoredLevel({id,number,puzzle,artwork,rules={},progression={},metadata={}}){
  return Object.freeze({id,number,type:'sponsored',puzzle,artwork,rules:Object.freeze({hintsAllowed:true,rotationsAllowed:false,...rules}),progression,metadata});
}
exports["createSponsoredLevel"] = createSponsoredLevel;
});
