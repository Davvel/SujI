/** SuJi classic-compatible module wrapper. Source owner: js/levels/standard/standard-level-provider.js */
SuJiModules.define("js/levels/standard/standard-level-provider.js", function(require, exports){
'use strict';
const {createStandardLevel} = require("js/levels/types/standard-level.js");
const getStandardLevel = level => createStandardLevel(level);
exports["getStandardLevel"] = getStandardLevel;
});
