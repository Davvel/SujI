/** SuJi classic-compatible module wrapper. Source owner: config/ui-config.js */
SuJiModules.define("config/ui-config.js", function(require, exports){
'use strict';
/**
 * SuJi Module: config/ui-config
 * Owns: JS-visible layout and timing constants.
 */
const UI_CONFIG = Object.freeze({
  responsiveDebounceMs: 140,
  orientationStabilizationMs: Object.freeze([0,70,180,360]),
  picturePreviewFirstVisitDelayMs: 2000
});
exports["UI_CONFIG"] = UI_CONFIG;
});
