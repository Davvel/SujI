/** SuJi classic-compatible module wrapper. Source owner: js/levels/level-manager.js */
SuJiModules.define("js/levels/level-manager.js", function(require, exports){
'use strict';
/**
 * SuJi Module: levels/level-manager
 * Migrated from the accepted 1.27.0 implementation with function bodies preserved.
 */
const {app} = require("js/core/app-context.js");
const {state} = require("js/core/state.js");
const {$, $$, board, rack} = require("js/core/dom.js");
const {TYPE_COLORS, TUTORIAL_LEVELS, RULE_COPY, GAME_CONFIG} = require("config/game-config.js");
const {UI_CONFIG} = require("config/ui-config.js");
const {STORAGE_KEYS} = require("config/storage-keys.js");
const bestRecord=(...args)=>app.bestRecord(...args);
const chooseAnchors=(...args)=>app.chooseAnchors(...args);
const clamp=(...args)=>app.clamp(...args);
const cleanupDrag=(...args)=>app.cleanupDrag(...args);
const clearRuleRegion=(...args)=>app.clearRuleRegion(...args);
const closePicturePreview=(...args)=>app.closePicturePreview(...args);
const closeTutorialModal=(...args)=>app.closeTutorialModal(...args);
const findImage=(...args)=>app.findImage(...args);
const formatDuration=(...args)=>app.formatDuration(...args);
const getLevelDefinition=(...args)=>app.getLevelDefinition(...args);
const hasVisitedLevel=(...args)=>app.hasVisitedLevel(...args);
const isDragging=(...args)=>app.isDragging(...args);
const makePieces=(...args)=>app.makePieces(...args);
const markLevelVisited=(...args)=>app.markLevelVisited(...args);
const modalIsOpen=(...args)=>app.modalIsOpen(...args);
const padLevel=(...args)=>app.padLevel(...args);
const paintTeachingConflictCells=(...args)=>app.paintTeachingConflictCells(...args);
const persistHighestLevelReached=(...args)=>app.persistHighestLevelReached(...args);
const pieceBounds=(...args)=>app.pieceBounds(...args);
const pieceElement=(...args)=>app.pieceElement(...args);
const ratingForAttempt=(...args)=>app.ratingForAttempt(...args);
const readToggle=(...args)=>app.readToggle(...args);
const recordRating=(...args)=>app.recordRating(...args);
const renderAll=(...args)=>app.renderAll(...args);
const renderControls=(...args)=>app.renderControls(...args);
const resetLevelTimerDisplay=(...args)=>app.resetLevelTimerDisplay(...args);
const saveLevelHistory=(...args)=>app.saveLevelHistory(...args);
const setHintModeClass=(...args)=>app.setHintModeClass(...args);
const setTutorialBodyClass=(...args)=>app.setTutorialBodyClass(...args);
const resetTutorialHintCoach=(...args)=>app.resetTutorialHintCoach(...args);
const updateTutorialHintWaitingClass=(...args)=>app.updateTutorialHintWaitingClass(...args);
const showPicturePreview=(...args)=>app.showPicturePreview(...args);
const showTutorialDefault=(...args)=>app.showTutorialDefault(...args);
const starsText=(...args)=>app.starsText(...args);
const startLevelTimer=(...args)=>app.startLevelTimer(...args);
const stopLevelTimer=(...args)=>app.stopLevelTimer(...args);
const tutorialSudoku=(...args)=>app.tutorialSudoku(...args);
const updateHintInstruction=(...args)=>app.updateHintInstruction(...args);
const updateLevelTimer=(...args)=>app.updateLevelTimer(...args);
const updatePicturePreviewButton=(...args)=>app.updatePicturePreviewButton(...args);
const waitForTutorialModalClose=(...args)=>app.waitForTutorialModalClose(...args);
const loadActiveGame=(...args)=>app.loadActiveGame(...args);
const saveActiveGame=(...args)=>app.saveActiveGame(...args);
const clearActiveGame=(...args)=>app.clearActiveGame(...args);
let levelResetEpoch=0;
function cancelAnchorFlights(){
  document.querySelectorAll('.anchor-flight').forEach(el=>{
    try{ el.getAnimations().forEach(a=>a.cancel()); }catch(_){}
    el.remove();
  });
}

function configuredPieceIds(key){
  const configured=state.levelDefinition?.puzzle?.[key];
  if(!Array.isArray(configured)) return null;
  const valid=new Set(state.pieces.map(p=>p.id));
  const ids=new Set(configured.map(Number).filter(id=>valid.has(id)));
  return ids.size ? ids : null;
}

function startingRackPieceIds(){ return configuredPieceIds('startingRackPieceIds'); }
function startingBoardPieceIds(){ return configuredPieceIds('startingBoardPieceIds'); }

function chooseStartingAnchors(){
  const boardIds=startingBoardPieceIds();
  if(boardIds) return boardIds;
  const rackIds=startingRackPieceIds();
  if(!rackIds) return chooseAnchors();
  // Tutorial "almost complete" layouts lock every solved shape and leave only
  // the explicitly configured teaching pieces in the Rack.
  return new Set(state.pieces.filter(p=>!rackIds.has(p.id)).map(p=>p.id));
}

function prefillConfiguredAnchors(){
  const hasConfiguredLayout=!!(startingBoardPieceIds() || startingRackPieceIds());
  if(!hasConfiguredLayout) return false;
  for(const id of state.anchors){
    const piece=state.pieces.find(p=>p.id===id);
    if(piece) state.placed.set(id,{...piece.home});
  }
  return true;
}

async function animateAnchorsFromRack(epoch){
  const ids=[...state.anchors];

  // This animation belongs only to the reset that created it.
  if(epoch!==levelResetEpoch) return;

  state.placed.clear();
  renderAll(false);
  await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
  if(epoch!==levelResetEpoch) return;

  const br=board.getBoundingClientRect();
  const boardCell=br.width/9;

  for(let i=0;i<ids.length;i++){
    if(epoch!==levelResetEpoch) return;

    const id=ids[i];
    const p=state.pieces.find(x=>x.id===id);
    const source=rack.querySelector(`.piece[data-id="${id}"]`);
    if(!p || !source) continue;

    const sr=source.getBoundingClientRect();
    const b=pieceBounds(p);
    const ghost=pieceElement(p,boardCell,'board');
    ghost.classList.add('anchor-flight');
    ghost.dataset.resetEpoch=String(epoch);
    ghost.style.position='fixed';
    ghost.style.left=sr.left+'px';
    ghost.style.top=sr.top+'px';
    ghost.style.zIndex='10000';
    ghost.style.pointerEvents='none';
    ghost.style.transformOrigin='top left';
    document.body.appendChild(ghost);
    source.style.visibility='hidden';

    const fullW=b.cols*boardCell, fullH=b.rows*boardCell;
    const sx=sr.width/fullW, sy=sr.height/fullH;
    const targetLeft=br.left+p.home.c*boardCell;
    const targetTop=br.top+p.home.r*boardCell;
    const dx=targetLeft-sr.left, dy=targetTop-sr.top;

    const animation=ghost.animate([
      {transform:`translate3d(0,0,0) scale(${sx},${sy})`,opacity:.96},
      {transform:`translate3d(${dx*.20}px,${dy*.20}px,0) scale(${sx*1.02},${sy*1.02})`,opacity:1,offset:.18},
      {transform:`translate3d(${dx}px,${dy}px,0) scale(1,1)`,opacity:1}
    ],{
      duration:520,
      delay:i*45,
      easing:'cubic-bezier(.22,.86,.25,1)',
      fill:'forwards'
    });

    await animation.finished.catch(()=>{});

    // A level change may have happened while this piece was flying.
    if(epoch!==levelResetEpoch){
      ghost.remove();
      return;
    }

    ghost.remove();
    state.placed.set(id,{...p.home});
    renderAll(false);

    await new Promise(r=>setTimeout(r,55));
    if(epoch!==levelResetEpoch) return;
  }
}

async function restoreSavedLevel(snapshot,epoch){
  const level=state.level;
  state.levelDefinition=getLevelDefinition(level);
  markLevelVisited(level);

  cancelAnchorFlights();
  if(isDragging()){
    try{ cleanupDrag(); }catch(_){}
  }

  setTutorialBodyClass();
  resetTutorialHintCoach({consumed:!!snapshot.tutorialHintConsumed});
  closeTutorialModal();
  state.lastTipSignature=null;
  state.tutorialRule=null;
  state.lastDroppedId=null;
  state.activeTeachingConflict=null;
  state.conflictShakePieceIds.clear();
  state.conflictShakeOwners.clear();
  paintTeachingConflictCells(null);
  clearRuleRegion();

  state.picture=!!snapshot.picture;
  state.guides=!!snapshot.guides;
  state.hints=clamp(parseInt(snapshot.hints,10)||3,1,3);
  state.hintRemaining=Math.max(0,parseInt(snapshot.hintRemaining,10)||0);
  state.hintArmed=!!snapshot.hintArmed;
  state.hintInUse=!!snapshot.hintInUse;
  state.hintSelectedId=snapshot.hintSelectedId==null ? null : Number(snapshot.hintSelectedId);
  state.hintBubbleDismissed=!!snapshot.hintBubbleDismissed;
  updateTutorialHintWaitingClass();
  state.hintMovablePieceIds=new Set((snapshot.hintMovablePieceIds||[]).map(Number));
  state.hintCorrectPieces=new Set((snapshot.hintCorrectPieces||[]).map(Number));
  state.sudoku=snapshot.sudoku;
  state.pieces=snapshot.pieces;
  state.placed.clear();
  for(const entry of snapshot.placed||[]){
    if(!Array.isArray(entry) || entry.length!==2) continue;
    const id=Number(entry[0]), pos=entry[1];
    if(!Number.isFinite(id) || !pos) continue;
    state.placed.set(id,{r:Number(pos.r),c:Number(pos.c)});
  }
  state.anchors=new Set((snapshot.anchors||[]).map(Number));
  state.manualMoves=Math.max(0,Number(snapshot.manualMoves)||0);
  state.completionHandled=false;
  state.imageURL=null;

  localStorage.setItem(STORAGE_KEYS.currentLevel,String(level));
  persistHighestLevelReached(level);
  setHintModeClass();
  updateHintInstruction();
  renderControls();
  updatePicturePreviewButton();
  closePicturePreview();
  renderAll(false);

  // Restart the live timer from the saved active-play duration. Time spent with
  // the game closed is not charged to the player's attempt.
  startLevelTimer();
  state.levelStartedAt=Date.now()-Math.max(0,Number(snapshot.elapsedMs)||0);
  updateLevelTimer();

  const imageURL=await findImage(level);
  if(epoch!==levelResetEpoch || level!==state.level) return;
  state.imageURL=imageURL;
  updatePicturePreviewButton();
  renderAll(false);
  saveActiveGame();
}

async function resetLevel(animate=true,{resume=false}={}){
  const epoch=++levelResetEpoch;
  const level=state.level;
  if(resume){
    const snapshot=loadActiveGame(level);
    if(snapshot){
      await restoreSavedLevel(snapshot,epoch);
      return;
    }
  }
  // A deliberate Reset, Replay, or level change starts a new attempt.
  clearActiveGame();
  const pictureReadyAt=Date.now()+UI_CONFIG.picturePreviewFirstVisitDelayMs;
  state.levelDefinition=getLevelDefinition(level);
  const firstVisit=!hasVisitedLevel(level);
  // Mark immediately so Reset, Replay, or returning through the selector never
  // retriggers the automatic picture introduction for this level.
  markLevelVisited(level);

  // Levels 1–5 are the guided introduction. Their lesson-specific picture mode is
  // defined by the level content, while exactly 3 starting-hint preference points are
  // reserved for the tutorial. The player's saved preference becomes effective from
  // Level 6 onward.
  if(level<=5){
    // Tutorial levels can deliberately suppress artwork for a focused lesson
    // (Level 2 teaches Sudoku without relying on a picture).
    state.picture=state.levelDefinition?.rules?.pictureMode!==false;
    state.guides=false;
    state.hints=3;
  } else {
    state.picture=readToggle('suji.picture', true);
    state.guides=false;
    state.hints=clamp(parseInt(localStorage.getItem('suji.hints') || '3',10),1,3);
  }

  // Immediately terminate anything belonging to the previous level.
  cancelAnchorFlights();
  if(isDragging()){
    try{ cleanupDrag(); }catch(_){}
  }

  // Build the new level synchronously and clear the board immediately.
  setTutorialBodyClass();
  resetTutorialHintCoach({consumed:false});
  closeTutorialModal();
  state.lastTipSignature=null;
  state.tutorialRule=null;
  state.lastDroppedId=null;
  // Checkpoint 13 v13.0.2: placement hints are independent from the legacy
  // starting/locked-hint setting. Every level begins with exactly 5 placement hints.
  state.hintRemaining=5;
  state.hintArmed=false;
  state.hintInUse=false;
  state.hintSelectedId=null;
  state.hintBubbleDismissed=false;
  updateTutorialHintWaitingClass();
  setHintModeClass();
  updateHintInstruction();
  state.activeTeachingConflict=null;
  state.conflictShakePieceIds.clear();
  state.conflictShakeOwners.clear();
  state.hintCorrectPieces.clear();
  paintTeachingConflictCells(null);
  clearRuleRegion();
  state.sudoku=tutorialSudoku(level);
  state.pieces=makePieces(level,state.sudoku);
  state.placed.clear();
  state.manualMoves=0;
  state.completionHandled=false;
  resetLevelTimerDisplay();
  state.imageURL=null;
  // Entering/replaying a lower level must never reduce progression.
  persistHighestLevelReached(level);
  updatePicturePreviewButton();
  closePicturePreview();
  state.anchors=chooseStartingAnchors();
  const hasPrefilledTutorialLayout=prefillConfiguredAnchors();

  renderControls();
  showTutorialDefault();
  renderAll(false);
  localStorage.setItem('suji.level',level);

  // v8.0.2: a fresh attempt starts timing as soon as the level is entered/restarted.
  // Date-based timing remains accurate even if the browser throttles the interval.
  startLevelTimer();

  // Image lookup is asynchronous; never let an older lookup overwrite a newer level.
  const imageURL=await findImage(level);
  if(epoch!==levelResetEpoch || level!==state.level) return;
  state.imageURL=imageURL;
  updatePicturePreviewButton();
  renderAll(false);

  if(animate){
    // First the informational intro modal, then the completed-picture preview.
    if(modalIsOpen()){
      await waitForTutorialModalClose();
      if(epoch!==levelResetEpoch || level!==state.level) return;
    }
    if(imageURL && firstVisit){
      // The completed picture is introduced automatically only once per level,
      // two seconds after the player first enters that fresh level. Replays and
      // previously visited levels rely on the picture button instead.
      const previewWait=Math.max(0,pictureReadyAt-Date.now());
      if(previewWait) await new Promise(resolve=>setTimeout(resolve,previewWait));
      if(epoch!==levelResetEpoch || level!==state.level) return;
      await showPicturePreview();
      if(epoch!==levelResetEpoch || level!==state.level) return;
    }
    // Normal levels still fly their 1–3 opening locked shapes from the Rack.
    // Configured tutorial layouts are already dealt directly on the Board.
    // Levels 1–2 leave three teaching pieces; Level 3 pre-deals ten spread pieces.
    if(!hasPrefilledTutorialLayout) await animateAnchorsFromRack(epoch);
  } else {
    if(epoch!==levelResetEpoch) return;
    if(!hasPrefilledTutorialLayout){
      for(const id of state.anchors){
        const p=state.pieces.find(x=>x.id===id);
        if(p) state.placed.set(id,{...p.home});
      }
      renderAll(false);
    }
  }
  if(epoch===levelResetEpoch && level===state.level){
    updateLevelTimer();
    saveActiveGame();
  }
}

async function checkForLevelCompletion(){
  if(state.completionHandled || !state.levelStartedAt) return;
  if(state.placed.size!==state.pieces.length) return;
  const solved=state.pieces.every(p=>{
    const pos=state.placed.get(p.id);
    return pos && pos.r===p.home.r && pos.c===p.home.c;
  });
  if(!solved) return;

  state.completionHandled=true;
  clearActiveGame();
  stopLevelTimer();
  updateLevelTimer();

  const completedLevel=state.level;
  const elapsedSeconds=Math.max(1,Math.round((Date.now()-state.levelStartedAt)/1000));
  const moves=Math.max(0,Number(state.manualMoves)||0);
  const rating=ratingForAttempt(elapsedSeconds,moves||1);
  const previous=bestRecord(completedLevel);
  const prevRating=recordRating(previous);

  // Store the strongest complete attempt. Rating wins first; ties prefer faster time,
  // then fewer moves. This lets Replay genuinely chase a higher star result.
  const improved=!previous ||
    rating.performance>prevRating.performance ||
    (rating.performance===prevRating.performance && elapsedSeconds<Number(previous.bestSeconds||Infinity)) ||
    (rating.performance===prevRating.performance && elapsedSeconds===Number(previous.bestSeconds||Infinity) && moves<Number(previous.moves||Infinity));

  if(improved){
    state.levelHistory[String(completedLevel)]={
      bestSeconds:elapsedSeconds,
      moves,
      performance:rating.performance,
      stars:rating.stars,
      completedAt:new Date().toISOString()
    };
    saveLevelHistory();
  }

  // Completing Level N permanently unlocks Level N+1 immediately.
  // This is monotonic: replaying an older level can never reduce the stored maximum.
  persistHighestLevelReached(Math.min(9999,completedLevel+1));

  const shown=bestRecord(completedLevel);
  const shownRating=recordRating(shown);
  $('#levelCompleteTitle').textContent=`Level ${padLevel(completedLevel)} complete`;
  $('#levelCompleteTime').textContent=formatDuration(elapsedSeconds);
  $('#levelCompleteMoves').textContent=String(moves);
  $('#levelCompleteStars').textContent=starsText(rating.stars);
  $('#levelCompleteStars').setAttribute('aria-label',`${rating.stars} star rating, efficiency ${rating.performance} out of 100`);
  $('#levelCompleteBest').textContent=improved
    ? (previous ? `New best: ${rating.performance}/100 efficiency` : `First result recorded · ${rating.performance}/100 efficiency`)
    : `Best remains ${starsText(shownRating.stars)} · ${formatDuration(shown.bestSeconds)} · ${Number.isFinite(Number(shown.moves))?shown.moves:'—'} moves`;

  const dialog=$('#levelCompleteDialog');
  if(!dialog.open) dialog.showModal();
}


Object.assign(app,{cancelAnchorFlights,animateAnchorsFromRack,resetLevel,checkForLevelCompletion});

function initLevelActions(){
  $('#resetBtn').onclick=()=>resetLevel(true);
  const levelCompleteOK=$('#levelCompleteOK');
  if(levelCompleteOK) levelCompleteOK.onclick=async()=>{
    const completedLevel=state.level; const dialog=$('#levelCompleteDialog'); if(dialog.open) dialog.close();
    if(completedLevel<9999){ state.level=completedLevel+1; await resetLevel(true); }
  };
  const levelCompleteReplay=$('#levelCompleteReplay');
  if(levelCompleteReplay) levelCompleteReplay.onclick=async()=>{ const dialog=$('#levelCompleteDialog'); if(dialog.open) dialog.close(); await resetLevel(true); };
  const levelCompleteDialog=$('#levelCompleteDialog');
  if(levelCompleteDialog) levelCompleteDialog.addEventListener('cancel',e=>e.preventDefault());
}
Object.assign(app,{initLevelActions});
exports["cancelAnchorFlights"] = cancelAnchorFlights;
exports["animateAnchorsFromRack"] = animateAnchorsFromRack;
exports["resetLevel"] = resetLevel;
exports["checkForLevelCompletion"] = checkForLevelCompletion;
exports["initLevelActions"] = initLevelActions;
});
