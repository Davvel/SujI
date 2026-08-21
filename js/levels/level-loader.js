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
async function findImage(level){
  // For the curated onboarding artwork (Levels 1–5), use direct resource paths.
  // This avoids file:// / local-open issues where a HEAD request may fail even
  // though the image exists beside the HTML package.
  if(level>=1 && level<=5){
    return `resources/Image_${padLevel(level)}.png`;
  }
  const base='resources/Image_'+padLevel(level);
  for(const ext of ['png','jpg','jpeg','webp']){
    const url=base+'.'+ext;
    try{
      const res=await fetch(url,{method:'HEAD',cache:'no-store'});
      if(res.ok) return url;
    }catch(e){}
  }
  return null;
}
Object.assign(app,{getLevelDefinition,findImage});
exports["findImage"] = findImage;
exports["getLevelDefinition"] = getLevelDefinition;
});
