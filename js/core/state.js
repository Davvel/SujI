/**
 * SuJi Module: core/state
 * Owns: the single mutable runtime state object.
 */
import {clamp} from './utils.js';
import {readToggle} from '../storage/preferences-store.js';
import {STORAGE_KEYS} from '../../config/storage-keys.js';

function bootstrapLevelHistory(){
  try{ const raw=JSON.parse(localStorage.getItem(STORAGE_KEYS.levelHistory)||'{}'); return raw&&typeof raw==='object'?raw:{}; }
  catch(_){ return {}; }
}
function bootstrapVisitedLevels(){
  try{ const raw=JSON.parse(localStorage.getItem(STORAGE_KEYS.visitedLevels)||'[]'); return new Set(Array.isArray(raw)?raw.map(Number).filter(n=>Number.isFinite(n)&&n>=1&&n<=9999):[]); }
  catch(_){ return new Set(); }
}
function highestUnlockedFromHistory(history){
  let highest=1;
  for(const key of Object.keys(history||{})){
    const completed=parseInt(key,10);
    if(Number.isFinite(completed)&&completed>=1) highest=Math.max(highest,Math.min(9999,completed+1));
  }
  return highest;
}

export const state = {
  level: clamp(parseInt(localStorage.getItem(STORAGE_KEYS.currentLevel) || '1',10),1,9999),
  picture: readToggle(STORAGE_KEYS.picture, true),
  hints: clamp(parseInt(localStorage.getItem(STORAGE_KEYS.hints) || '3',10),1,3),
  guides: false,
  hintRemaining: 0, hintArmed: false, hintInUse: false, hintSelectedId: null, hintBubbleDismissed: false, hintMovablePieceIds: new Set(),
  pieces: [], placed: new Map(), anchors: new Set(), manualMoves: 0,
  sudoku: null, imageURL: null, pendingChange: null,
  tutorialRule: null, lastTipSignature: null, activeTipSignature: null,
  lastDroppedId: null, activeTeachingConflict: null, conflictShakePieceIds: new Set(), conflictShakeOwners: new Map(), hintCorrectPieces: new Set(), picturePreviewTimer: null, tutorialModalResolver: null, picturePreviewResolver: null,
  levelHistory: bootstrapLevelHistory(),
  visitedLevels: bootstrapVisitedLevels(),
  highestLevelReached: 1,
  levelStartedAt: 0, levelTimerInterval: null, completionHandled: false, levelPickerPage: 0,
  levelDefinition: null
};
state.highestLevelReached=clamp(Math.max(
  parseInt(localStorage.getItem(STORAGE_KEYS.highestLevelReached)||'1',10)||1,
  parseInt(localStorage.getItem(STORAGE_KEYS.currentLevel)||'1',10)||1,
  state.level,
  highestUnlockedFromHistory(state.levelHistory)
),1,9999);
localStorage.setItem(STORAGE_KEYS.highestLevelReached,String(state.highestLevelReached));
