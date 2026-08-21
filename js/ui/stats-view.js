/** SuJi classic-compatible module wrapper. Source owner: js/ui/stats-view.js */
SuJiModules.define("js/ui/stats-view.js", function(require, exports){
'use strict';
/**
 * SuJi Module: ui/stats-view
 * Migrated from the accepted 1.27.0 implementation with function bodies preserved.
 */
const {app} = require("js/core/app-context.js");
const {state} = require("js/core/state.js");
const {$, $$, board, rack} = require("js/core/dom.js");
const {TYPE_COLORS, TUTORIAL_LEVELS, RULE_COPY, GAME_CONFIG} = require("config/game-config.js");
const {UI_CONFIG} = require("config/ui-config.js");
const {STORAGE_KEYS} = require("config/storage-keys.js");
const formatDuration=(...args)=>app.formatDuration(...args);
const padLevel=(...args)=>app.padLevel(...args);
const updatePlacementHintButton=(...args)=>app.updatePlacementHintButton(...args);

function updateLevelTimer(){
  const el=$('#levelTimer');
  if(!el) return;
  const elapsed=state.levelStartedAt ? Math.max(0,Math.floor((Date.now()-state.levelStartedAt)/1000)) : 0;
  const next=formatDuration(elapsed);
  if(el.textContent!==next){
    el.textContent=next;
    el.classList.remove('timer-tick');
    void el.offsetWidth;
    el.classList.add('timer-tick');
  }
}

function updateMoveCounter(){
  const el=$('#movesStat');
  if(!el) return;
  const next=String(state.manualMoves||0);
  if(el.textContent!==next){
    el.textContent=next;
    el.classList.remove('move-bump');
    void el.offsetWidth;
    el.classList.add('move-bump');
  }
}

function stopLevelTimer(){
  if(state.levelTimerInterval){
    clearInterval(state.levelTimerInterval);
    state.levelTimerInterval=null;
  }
}

function resetLevelTimerDisplay(){
  stopLevelTimer();
  state.levelStartedAt=0;
  updateLevelTimer();
}

function startLevelTimer(){
  stopLevelTimer();
  state.levelStartedAt=Date.now();
  updateLevelTimer();
  state.levelTimerInterval=setInterval(updateLevelTimer,250);
}

function updateStats(){
  updateMoveCounter();
  $('#levelBtn').textContent='Level '+padLevel(state.level);
  updatePlacementHintButton();
}


Object.assign(app,{updateLevelTimer,updateMoveCounter,stopLevelTimer,resetLevelTimerDisplay,startLevelTimer,updateStats});
exports["updateLevelTimer"] = updateLevelTimer;
exports["updateMoveCounter"] = updateMoveCounter;
exports["stopLevelTimer"] = stopLevelTimer;
exports["resetLevelTimerDisplay"] = resetLevelTimerDisplay;
exports["startLevelTimer"] = startLevelTimer;
exports["updateStats"] = updateStats;
});
