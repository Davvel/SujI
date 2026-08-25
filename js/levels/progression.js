/** SuJi classic-compatible module wrapper. Source owner: js/levels/progression.js */
SuJiModules.define("js/levels/progression.js", function(require, exports){
'use strict';
/** Level-system progression boundary. Storage remains in progress-store.js. */
const {state} = require("js/core/state.js");
const canOpenLevel = level => { const n=Number(level); return n>=1 && (n<=10 || n<=state.highestLevelReached); };
const highestLevelReached = () => state.highestLevelReached;
exports["canOpenLevel"] = canOpenLevel;
exports["highestLevelReached"] = highestLevelReached;
});
