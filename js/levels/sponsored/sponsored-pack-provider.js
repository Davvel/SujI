/** SuJi classic-compatible module wrapper. Source owner: js/levels/sponsored/sponsored-pack-provider.js */
SuJiModules.define("js/levels/sponsored/sponsored-pack-provider.js", function(require, exports){
'use strict';
/** Sponsored provider boundary. No sponsor-specific logic is allowed in the game engine. */
const providers=new Map();
const registerSponsoredPack=(id,provider)=>providers.set(id,provider);
const loadSponsoredPackLevel=(id,levelId)=>{ const p=providers.get(id); if(!p) throw new Error(`Unknown sponsored pack: ${id}`); return p(levelId); };
exports["registerSponsoredPack"] = registerSponsoredPack;
exports["loadSponsoredPackLevel"] = loadSponsoredPackLevel;
});
