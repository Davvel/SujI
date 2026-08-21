/** SuJi classic-compatible module wrapper. Source owner: js/levels/packs/pack-manager.js */
SuJiModules.define("js/levels/packs/pack-manager.js", function(require, exports){
'use strict';
const {getPack} = require("js/levels/packs/pack-registry.js");
async function loadPackLevel(packId,levelId){
  const provider=getPack(packId); if(!provider) throw new Error(`Unknown SuJi pack: ${packId}`);
  return provider(levelId);
}
exports["loadPackLevel"] = loadPackLevel;
});
