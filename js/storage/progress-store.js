/** SuJi classic-compatible module wrapper. Source owner: js/storage/progress-store.js */
SuJiModules.define("js/storage/progress-store.js", function(require, exports){
'use strict';
/**
 * SuJi Module: storage/progress-store
 * Owns: level history, visited levels and monotonic highest-level persistence.
 */
const {app} = require("js/core/app-context.js");
const {state} = require("js/core/state.js");
const {clamp} = require("js/core/utils.js");
const {STORAGE_KEYS} = require("config/storage-keys.js");
function loadLevelHistory(){
  try{
    const raw=JSON.parse(localStorage.getItem(STORAGE_KEYS.levelHistory)||'{}');
    return raw && typeof raw==='object' ? raw : {};
  }catch(_){ return {}; }
}
function loadVisitedLevels(){
  try{
    const raw=JSON.parse(localStorage.getItem(STORAGE_KEYS.visitedLevels)||'[]');
    return new Set(Array.isArray(raw) ? raw.map(Number).filter(n=>Number.isFinite(n)&&n>=1&&n<=9999) : []);
  }catch(_){ return new Set(); }
}
function highestUnlockedFromHistory(history){
  let highest=1;
  if(history && typeof history==='object'){
    for(const key of Object.keys(history)){
      const completed=parseInt(key,10);
      if(Number.isFinite(completed) && completed>=1) highest=Math.max(highest,Math.min(9999,completed+1));
    }
  }
  return highest;
}
function saveLevelHistory(){ localStorage.setItem(STORAGE_KEYS.levelHistory,JSON.stringify(state.levelHistory)); }
function bestRecord(level){ return state.levelHistory[String(level)] || null; }
function saveVisitedLevels(){ localStorage.setItem(STORAGE_KEYS.visitedLevels,JSON.stringify([...state.visitedLevels].sort((a,b)=>a-b))); }
function markLevelVisited(level){ level=clamp(parseInt(level,10)||1,1,9999); state.visitedLevels.add(level); saveVisitedLevels(); }
function hasVisitedLevel(level){ return state.visitedLevels.has(Number(level)); }
function persistHighestLevelReached(level){
  const next=clamp(parseInt(level,10)||1,1,9999);
  if(next>state.highestLevelReached) state.highestLevelReached=next;
  localStorage.setItem(STORAGE_KEYS.highestLevelReached,String(state.highestLevelReached));
  // Preserve the 1.27.0 upgrade seeding behaviour exactly.
  for(const key of Object.keys(state.levelHistory||{})){
    const n=parseInt(key,10);
    if(Number.isFinite(n)) state.visitedLevels.add(n);
  }
  if(localStorage.getItem(STORAGE_KEYS.currentLevel)!==null) state.visitedLevels.add(state.level);
  saveVisitedLevels();
  return state.highestLevelReached;
}
Object.assign(app,{saveLevelHistory,bestRecord,saveVisitedLevels,markLevelVisited,hasVisitedLevel,highestUnlockedFromHistory,persistHighestLevelReached});
exports["loadLevelHistory"] = loadLevelHistory;
exports["loadVisitedLevels"] = loadVisitedLevels;
exports["highestUnlockedFromHistory"] = highestUnlockedFromHistory;
exports["saveLevelHistory"] = saveLevelHistory;
exports["bestRecord"] = bestRecord;
exports["saveVisitedLevels"] = saveVisitedLevels;
exports["markLevelVisited"] = markLevelVisited;
exports["hasVisitedLevel"] = hasVisitedLevel;
exports["persistHighestLevelReached"] = persistHighestLevelReached;
});
