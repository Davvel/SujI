/** SuJi classic-compatible module wrapper. Source owner: js/levels/standard/standard-progression.js */
SuJiModules.define("js/levels/standard/standard-progression.js", function(require, exports){
'use strict';
/** Standard numeric progression policy. */
const nextStandardLevel = level => Math.min(9999,(Number(level)||1)+1);
exports["nextStandardLevel"] = nextStandardLevel;
});
