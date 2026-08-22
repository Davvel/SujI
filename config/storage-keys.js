/** SuJi classic-compatible module wrapper. Source owner: config/storage-keys.js */
SuJiModules.define("config/storage-keys.js", function(require, exports){
'use strict';
/**
 * SuJi Module: config/storage-keys
 * Owns: all persistent/session storage key names.
 */
const STORAGE_KEYS = Object.freeze({
  currentLevel: 'suji.level',
  picture: 'suji.picture',
  hints: 'suji.hints',
  guides: 'suji.guides',
  levelHistory: 'suji.levelHistory.v1',
  highestLevelReached: 'suji.highestLevelReached',
  visitedLevels: 'suji.visitedLevels.v1',
  activeGame: 'suji.activeGame.v1',
  tutorialPrefix: 'suji.cp6.v607.help.',
  pwaInstallDismissed: 'suji_pwa_install_dismissed_v15'
});
exports["STORAGE_KEYS"] = STORAGE_KEYS;
});
