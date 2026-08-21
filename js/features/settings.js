/** SuJi classic-compatible module wrapper. Source owner: js/features/settings.js */
SuJiModules.define("js/features/settings.js", function(require, exports){
'use strict';
/**
 * SuJi Module: features/settings
 * Migrated from the accepted 1.27.0 implementation with function bodies preserved.
 */
const {app} = require("js/core/app-context.js");
const {state} = require("js/core/state.js");
const {$, $$, board, rack} = require("js/core/dom.js");
const {TYPE_COLORS, TUTORIAL_LEVELS, RULE_COPY, GAME_CONFIG} = require("config/game-config.js");
const {UI_CONFIG} = require("config/ui-config.js");
const {STORAGE_KEYS} = require("config/storage-keys.js");
const padLevel=(...args)=>app.padLevel(...args);
const resetLevel=(...args)=>app.resetLevel(...args);
const updatePlacementHintButton=(...args)=>app.updatePlacementHintButton(...args);

function hasManualProgress(){ return state.manualMoves>0; }

function renderControls(){
  const tutorialLocked=state.level<=5;
  const pictureGroup=document.querySelector('.option-group-picture');
  const hintGroup=$('#hintOptionGroup');
  if(pictureGroup) pictureGroup.hidden=false;
  if(hintGroup) hintGroup.hidden=true;

  const config=$('.settings-config');
  if(config){
    config.hidden=false;
    config.style.display='';
  }

  const settingsLockedNote=$('#settingsLockedNote');
  if(settingsLockedNote) settingsLockedNote.hidden=!tutorialLocked;
  const pictureLock=$('#pictureLock');
  if(pictureLock) pictureLock.hidden=!tutorialLocked;

  const pictureToggle=$('#pictureToggle');
  const pictureText=$('#pictureToggleText');
  if(pictureToggle){
    pictureToggle.classList.toggle('on',state.picture);
    pictureToggle.classList.toggle('off',!state.picture);
    pictureToggle.setAttribute('aria-pressed',String(state.picture));
    pictureToggle.disabled=false;
    pictureToggle.classList.toggle('settings-switch-locked',tutorialLocked);
    pictureToggle.setAttribute('aria-label',`Show Jigsaw Picture ${state.picture ? 'on' : 'off'}${tutorialLocked ? ', locked' : ''}`);
    pictureToggle.title=tutorialLocked ? 'Locked during tutorial levels' : 'Show or hide the jigsaw picture';
  }
  if(pictureText) pictureText.textContent='Show Jigsaw Picture';

  const hintValue=$('#hintValue');
  if(hintValue) hintValue.textContent=String(state.hints);

  const hintDownBtn=$('#hintDownBtn');
  const hintUpBtn=$('#hintUpBtn');
  if(hintDownBtn) hintDownBtn.disabled = state.hints<=1;
  if(hintUpBtn) hintUpBtn.disabled = state.hints>=3;

  updatePlacementHintButton();
}

function requestOptionChange(kind,value){
  const same=(kind==='picture'?state.picture===value:kind==='hints'?state.hints===value:state.guides===value);
  if(same)return;

  const label =
    kind==='picture' ? 'Picture / No Picture' :
    kind==='hints' ? 'Start Hints' :
    'Board Guide';

  const apply=async()=>{
    state[kind]=value;
    if(kind==='picture' || kind==='guides'){
      localStorage.setItem('suji.'+kind, value ? 'on' : 'off');
    } else {
      localStorage.setItem('suji.'+kind,String(value));
    }
    await resetLevel(true);
  };

  // No warning if the player has not moved/placed any piece themselves.
  if(!hasManualProgress()){
    apply();
    return;
  }

  state.pendingChange=apply;
  $('#confirmText').textContent=
    `Changing ${label} will restart Level ${padLevel(state.level)} and erase your current progress. Are you sure you want to continue?`;
  $('#confirmDialog').showModal();
}

function shakeSettingsPadlock(lockId){
  const lock=$(lockId);
  if(!lock) return;
  lock.classList.remove('settings-padlock-shake');
  void lock.offsetWidth;
  lock.classList.add('settings-padlock-shake');
}


Object.assign(app,{hasManualProgress,renderControls,requestOptionChange,shakeSettingsPadlock});

function initSettings(){
  $('#confirmDialog').addEventListener('close',()=>{ if($('#confirmDialog').returnValue==='confirm'&&state.pendingChange)state.pendingChange(); state.pendingChange=null; });
  const pictureToggle=$('#pictureToggle');
  if(pictureToggle) pictureToggle.onclick=()=>{ if(state.level<=5){ shakeSettingsPadlock('#pictureLock'); return; } requestOptionChange('picture',!state.picture); };
  const hintDownBtn=$('#hintDownBtn'), hintUpBtn=$('#hintUpBtn');
  if(hintDownBtn) hintDownBtn.onclick=()=>requestOptionChange('hints',Math.max(1,state.hints-1));
  if(hintUpBtn) hintUpBtn.onclick=()=>requestOptionChange('hints',Math.min(3,state.hints+1));
}
Object.assign(app,{initSettings});
exports["hasManualProgress"] = hasManualProgress;
exports["renderControls"] = renderControls;
exports["requestOptionChange"] = requestOptionChange;
exports["shakeSettingsPadlock"] = shakeSettingsPadlock;
exports["initSettings"] = initSettings;
});
