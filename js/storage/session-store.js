/** SuJi classic-compatible module wrapper. Source owner: js/storage/session-store.js */
SuJiModules.define("js/storage/session-store.js", function(require, exports){
'use strict';
/**
 * SuJi Module: storage/session-store
 * Owns: crash/refresh-safe persistence for the currently active puzzle attempt.
 */
const {app} = require("js/core/app-context.js");
const {state} = require("js/core/state.js");
const {STORAGE_KEYS} = require("config/storage-keys.js");

const SESSION_SCHEMA=1;
const TUTORIAL_LAYOUT_REVISION=2;
let autosaveTimer=null;

function clearActiveGame(){
  try{ localStorage.removeItem(STORAGE_KEYS.activeGame); }catch(_){}
}

function activeElapsedMs(){
  return state.levelStartedAt ? Math.max(0,Date.now()-state.levelStartedAt) : 0;
}

function saveActiveGame(){
  // Never persist the temporary state used while a piece is physically in flight.
  // The last settled board state is safer if the browser disappears mid-drag.
  if(typeof app.isDragging==='function' && app.isDragging()) return false;

  // A completed puzzle is not resumable. Do not let periodic autosave recreate it
  // after the completion flow has deliberately cleared the active session.
  if(state.completionHandled){ clearActiveGame(); return false; }
  if(!state.levelStartedAt || !Array.isArray(state.sudoku) || state.sudoku.length!==9 || !Array.isArray(state.pieces) || !state.pieces.length) return false;

  const snapshot={
    schema:SESSION_SCHEMA,
    level:Number(state.level),
    savedAt:Date.now(),
    elapsedMs:activeElapsedMs(),
    picture:!!state.picture,
    guides:!!state.guides,
    hints:Number(state.hints)||3,
    hintRemaining:Number(state.hintRemaining)||0,
    hintArmed:!!state.hintArmed,
    hintInUse:!!state.hintInUse,
    hintSelectedId:state.hintSelectedId==null ? null : Number(state.hintSelectedId),
    hintBubbleDismissed:!!state.hintBubbleDismissed,
    hintMovablePieceIds:[...state.hintMovablePieceIds],
    hintCorrectPieces:[...state.hintCorrectPieces],
    sudoku:state.sudoku,
    pieces:state.pieces,
    placed:[...state.placed].map(([id,pos])=>[Number(id),{r:Number(pos.r),c:Number(pos.c)}]),
    anchors:[...state.anchors].map(Number),
    manualMoves:Number(state.manualMoves)||0,
    tutorialLayoutRevision:(Number(state.level)<=2 ? TUTORIAL_LAYOUT_REVISION : null)
  };

  try{
    localStorage.setItem(STORAGE_KEYS.activeGame,JSON.stringify(snapshot));
    return true;
  }catch(_){ return false; }
}

function loadActiveGame(level=state.level){
  try{
    const raw=localStorage.getItem(STORAGE_KEYS.activeGame);
    if(!raw) return null;
    const snap=JSON.parse(raw);
    if(!snap || snap.schema!==SESSION_SCHEMA || Number(snap.level)!==Number(level)) return null;
    if(Number(level)<=2 && Number(snap.tutorialLayoutRevision)!==TUTORIAL_LAYOUT_REVISION) return null;
    if(!Array.isArray(snap.sudoku) || snap.sudoku.length!==9 || snap.sudoku.some(row=>!Array.isArray(row)||row.length!==9)) return null;
    if(!Array.isArray(snap.pieces) || !snap.pieces.length || !Array.isArray(snap.placed) || !Array.isArray(snap.anchors)) return null;
    return snap;
  }catch(_){ return null; }
}

function initSessionAutosave(){
  if(autosaveTimer) return;
  // Save regularly as well as on lifecycle events. This protects progress even if
  // a phone loses power without giving the browser a normal pagehide event.
  autosaveTimer=setInterval(saveActiveGame,5000);
  window.addEventListener('pagehide',saveActiveGame);
  document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='hidden') saveActiveGame(); });
}

Object.assign(app,{saveActiveGame,loadActiveGame,clearActiveGame,initSessionAutosave});
exports["saveActiveGame"] = saveActiveGame;
exports["loadActiveGame"] = loadActiveGame;
exports["clearActiveGame"] = clearActiveGame;
exports["initSessionAutosave"] = initSessionAutosave;
});
