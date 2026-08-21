/** SuJi classic-compatible module wrapper. Source owner: js/levels/level-loader.js */
SuJiModules.define("js/levels/level-loader.js", function(require, exports){
'use strict';
/**
 * SuJi Module: levels/level-loader
 * Owns: resolving a normalized LevelDefinition and current artwork discovery.
 */
const {app} = require("js/core/app-context.js");
const {state} = require("js/core/state.js");
const {$, $$, board, rack} = require("js/core/dom.js");
const {resolveNumericLevel} = require("js/levels/level-registry.js");
const padLevel=(...args)=>app.padLevel(...args);
function getLevelDefinition(level){ return resolveNumericLevel(level); }
function resolveLevelAsset(path){
  return path ? new URL(path,document.baseURI).href : null;
}
async function findImage(level){
  // Level definitions own their artwork path. Resolve it once against the page
  // so the same URL works from file://, localhost and a GitHub Pages subfolder.
  const definition=getLevelDefinition(level);
  if(definition?.artwork?.image) return resolveLevelAsset(definition.artwork.image);

  const base='resources/Image_'+padLevel(level);
  for(const ext of ['png','jpg','jpeg','webp']){
    const url=resolveLevelAsset(base+'.'+ext);
    try{
      const res=await fetch(url,{method:'HEAD',cache:'no-store'});
      if(res.ok) return url;
    }catch(e){}
  }
  return null;
}
Object.assign(app,{getLevelDefinition,resolveLevelAsset,findImage});
exports["findImage"] = findImage;
exports["getLevelDefinition"] = getLevelDefinition;
exports["resolveLevelAsset"] = resolveLevelAsset;
});
