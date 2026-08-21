/** SuJi classic-compatible module wrapper. Source owner: js/core/app-context.js */
SuJiModules.define("js/core/app-context.js", function(require, exports){
'use strict';
/**
 * SuJi Module: core/app-context
 * Owns: lightweight public API registry used to decouple migrated modules.
 * Modules expose small APIs here; state remains owned by core/state.js.
 */
const app = Object.create(null);
exports["app"] = app;
});
