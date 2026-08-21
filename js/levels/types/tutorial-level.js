/** SuJi classic-compatible module wrapper. Source owner: js/levels/types/tutorial-level.js */
SuJiModules.define("js/levels/types/tutorial-level.js", function(require, exports){
'use strict';
/** Normalizes a tutorial definition into the common LevelDefinition contract. */
function normalizeTutorialLevel(definition){ return Object.freeze({...definition,type:'tutorial'}); }
exports["normalizeTutorialLevel"] = normalizeTutorialLevel;
});
