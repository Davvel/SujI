/** SuJi classic-compatible module wrapper. Source owner: js/levels/level-registry.js */
SuJiModules.define("js/levels/level-registry.js", function(require, exports){
'use strict';
const level001 = require("js/levels/tutorial/level-001.js").default;
const level002 = require("js/levels/tutorial/level-002.js").default;
const level003 = require("js/levels/tutorial/level-003.js").default;
const level004 = require("js/levels/tutorial/level-004.js").default;
const level005 = require("js/levels/tutorial/level-005.js").default;
const level006 = require("js/levels/tutorial/level-006.js").default;
const level007 = require("js/levels/tutorial/level-007.js").default;
const level008 = require("js/levels/tutorial/level-008.js").default;
const level009 = require("js/levels/tutorial/level-009.js").default;
const level010 = require("js/levels/tutorial/level-010.js").default;
const {normalizeTutorialLevel} = require("js/levels/types/tutorial-level.js");
const {getStandardLevel} = require("js/levels/standard/standard-level-provider.js");
const tutorials=new Map([
  level001,level002,level003,level004,level005,
  level006,level007,level008,level009,level010
].map(x=>[x.number,normalizeTutorialLevel(x)]));
function resolveNumericLevel(level){ const n=Number(level)||1; return tutorials.get(n)||getStandardLevel(n); }
exports["resolveNumericLevel"] = resolveNumericLevel;
});
