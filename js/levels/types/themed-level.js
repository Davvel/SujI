/** SuJi classic-compatible module wrapper. Source owner: js/levels/types/themed-level.js */
SuJiModules.define("js/levels/types/themed-level.js", function(require, exports){
'use strict';
/** Adapter for future purchasable/unlockable artwork packs. */
function createThemedLevel({id,number,puzzle,artwork,rules={},progression={},metadata={}}){
  return Object.freeze({id,number,type:'themed',puzzle,artwork,rules:Object.freeze({hintsAllowed:true,rotationsAllowed:false,...rules}),progression,metadata});
}
exports["createThemedLevel"] = createThemedLevel;
});
