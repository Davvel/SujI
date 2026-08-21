/** SuJi classic-compatible module wrapper. Source owner: js/levels/packs/pack-registry.js */
SuJiModules.define("js/levels/packs/pack-registry.js", function(require, exports){
'use strict';
/** Registry for themed/photo packs. Packs can be added without editing the puzzle engine. */
const packs=new Map();
const registerPack=(id,provider)=>packs.set(id,provider);
const getPack=id=>packs.get(id)||null;
const listPacks=()=>[...packs.keys()];
exports["registerPack"] = registerPack;
exports["getPack"] = getPack;
exports["listPacks"] = listPacks;
});
