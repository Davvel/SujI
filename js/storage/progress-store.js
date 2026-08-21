/**
 * SuJi Module: storage/progress-store
 * Owns: level history, visited levels and monotonic highest-level persistence.
 */
import {app} from '../core/app-context.js';
import {state} from '../core/state.js';
import {clamp} from '../core/utils.js';
import {STORAGE_KEYS} from '../../config/storage-keys.js';

export function loadLevelHistory(){
  try{
    const raw=JSON.parse(localStorage.getItem(STORAGE_KEYS.levelHistory)||'{}');
    return raw && typeof raw==='object' ? raw : {};
  }catch(_){ return {}; }
}
export function loadVisitedLevels(){
  try{
    const raw=JSON.parse(localStorage.getItem(STORAGE_KEYS.visitedLevels)||'[]');
    return new Set(Array.isArray(raw) ? raw.map(Number).filter(n=>Number.isFinite(n)&&n>=1&&n<=9999) : []);
  }catch(_){ return new Set(); }
}
export function highestUnlockedFromHistory(history){
  let highest=1;
  if(history && typeof history==='object'){
    for(const key of Object.keys(history)){
      const completed=parseInt(key,10);
      if(Number.isFinite(completed) && completed>=1) highest=Math.max(highest,Math.min(9999,completed+1));
    }
  }
  return highest;
}
export function saveLevelHistory(){ localStorage.setItem(STORAGE_KEYS.levelHistory,JSON.stringify(state.levelHistory)); }
export function bestRecord(level){ return state.levelHistory[String(level)] || null; }
export function saveVisitedLevels(){ localStorage.setItem(STORAGE_KEYS.visitedLevels,JSON.stringify([...state.visitedLevels].sort((a,b)=>a-b))); }
export function markLevelVisited(level){ level=clamp(parseInt(level,10)||1,1,9999); state.visitedLevels.add(level); saveVisitedLevels(); }
export function hasVisitedLevel(level){ return state.visitedLevels.has(Number(level)); }
export function persistHighestLevelReached(level){
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
