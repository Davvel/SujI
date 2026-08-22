/** SuJi classic-compatible module wrapper. Source owner: js/features/drag-drop.js */
SuJiModules.define("js/features/drag-drop.js", function(require, exports){
'use strict';
/**
 * SuJi Module: features/drag-drop
 * Migrated from the accepted 1.27.0 implementation with function bodies preserved.
 */
const {app} = require("js/core/app-context.js");
const {state} = require("js/core/state.js");
const {$, $$, board, rack} = require("js/core/dom.js");
const {TYPE_COLORS, TUTORIAL_LEVELS, RULE_COPY, GAME_CONFIG} = require("config/game-config.js");
const {UI_CONFIG} = require("config/ui-config.js");
const {STORAGE_KEYS} = require("config/storage-keys.js");
const addBlockedHintOverlay=(...args)=>app.addBlockedHintOverlay(...args);
const bumpWrongHintPiece=(...args)=>app.bumpWrongHintPiece(...args);
const clearBlockedHintOverlays=(...args)=>app.clearBlockedHintOverlays(...args);
const clearHintBlockerEmphasis=(...args)=>app.clearHintBlockerEmphasis(...args);
const conflictIdentity=(...args)=>app.conflictIdentity(...args);
const emphasizeMovableBlockers=(...args)=>app.emphasizeMovableBlockers(...args);
const finishPlacementHint=(...args)=>app.finishPlacementHint(...args);
const fits=(...args)=>app.fits(...args);
const getBlockingPieceIds=(...args)=>app.getBlockingPieceIds(...args);
const pieceBounds=(...args)=>app.pieceBounds(...args);
const pieceElement=(...args)=>app.pieceElement(...args);
const placeholderOccupied=(...args)=>app.placeholderOccupied(...args);
const pulseHintSelectedPiece=(...args)=>app.pulseHintSelectedPiece(...args);
const renderAll=(...args)=>app.renderAll(...args);
const renderGuides=(...args)=>app.renderGuides(...args);
const saveActiveGame=(...args)=>app.saveActiveGame(...args);
const revealPlacementHintForPiece=(...args)=>app.revealPlacementHintForPiece(...args);
const setHintModeClass=(...args)=>app.setHintModeClass(...args);
const shapeKey=(...args)=>app.shapeKey(...args);
const suppressBlockedHintDestination=(...args)=>app.suppressBlockedHintDestination(...args);
const updateConflictAlert=(...args)=>app.updateConflictAlert(...args);
const updateHintInstruction=(...args)=>app.updateHintInstruction(...args);
const updateRackConflictLock=(...args)=>app.updateRackConflictLock(...args);
let drag=null;
function clearGuideHover(){
  $$('.guide-piece.guide-hover').forEach(g=>g.classList.remove('guide-hover'));
  $('#boardWrap')?.classList.remove('guide-focus-active');
  if(drag) drag.guideTarget=null;
}

function activateCompatiblePieceGuides(){
  $('#boardWrap')?.classList.remove('guide-focus-active');
  clearHintBlockerEmphasis();
  clearBlockedHintOverlays();
  const selectedPiece=state.pieces.find(x=>x.id===state.hintSelectedId);
  const wantedShape=selectedPiece ? shapeKey(selectedPiece) : null;
  $$('.guide-piece').forEach(el=>{
    el.classList.remove('guide-compatible','guide-hover','hint-destination','hint-occupied-destination');
    if(!state.hintInUse || state.hintSelectedId==null || !wantedShape) return;
    if(el.dataset.shapeKey!==wantedShape) return;
    const targetId=+el.dataset.guideId;
    const targetPiece=state.pieces.find(x=>x.id===targetId);
    if(!targetPiece) return;

    // Checkpoint 16 v16.1.2: Hint Mode reveals every matching home, even when
    // another board shape is currently covering it. Occupied homes are visibly
    // marked but remain unavailable for snap until the blocking shape is moved.
    const occupied=placeholderOccupied(targetPiece,state.hintSelectedId);
    if(occupied){
      const blockingIds=getBlockingPieceIds(targetPiece,state.hintSelectedId);
      if(suppressBlockedHintDestination(blockingIds)) return;
      emphasizeMovableBlockers(blockingIds);
      addBlockedHintOverlay(targetPiece);
    }
    el.classList.add('guide-compatible','hint-destination');
    if(occupied) el.classList.add('hint-occupied-destination');
  });
}

function clearCompatiblePieceGuides(){
  clearHintBlockerEmphasis();
  clearBlockedHintOverlays();
  $$('.guide-piece.guide-compatible, .guide-piece.guide-hover, .guide-piece.hint-destination, .guide-piece.hint-occupied-destination').forEach(el=>{
    el.classList.remove('guide-compatible','guide-hover','hint-destination','hint-occupied-destination');
  });
  $('#boardWrap')?.classList.remove('guide-focus-active');
  if(drag) drag.guideTarget=null;
}

function pieceBlocksVisibleHintDestination(pieceId,pos){
  if(!state.hintInUse || state.hintSelectedId==null || !pos) return false;
  const selectedPiece=state.pieces.find(x=>x.id===state.hintSelectedId);
  const movingPiece=state.pieces.find(x=>x.id===pieceId);
  if(!selectedPiece || !movingPiece) return false;

  const wantedShape=shapeKey(selectedPiece);
  const occupiedCells=new Set(
    movingPiece.cells.map(([dr,dc])=>`${pos.r+dr}:${pos.c+dc}`)
  );

  return state.pieces.some(targetPiece=>{
    if(shapeKey(targetPiece)!==wantedShape) return false;
    return targetPiece.cells.some(([dr,dc])=>
      occupiedCells.has(`${targetPiece.home.r+dr}:${targetPiece.home.c+dc}`)
    );
  });
}

function cacheGuideTargetsForDrag(){
  if(!drag || !state.hintInUse || state.hintSelectedId!==drag.id){
    if(drag) drag.guideTargetCache=[];
    return;
  }

  const wantedShape=shapeKey(drag.p);
  const piecesById=new Map(state.pieces.map(piece=>[piece.id,piece]));
  drag.guideTargetCache=[];

  // v1.24.1 performance: guide geometry is static for the duration of a drag.
  // Measure it once instead of forcing layout reads on every pointermove.
  for(const el of $$('.guide-piece.guide-compatible')){
    if(el.dataset.shapeKey!==wantedShape) continue;
    const targetPiece=piecesById.get(+el.dataset.guideId);
    if(!targetPiece || placeholderOccupied(targetPiece,drag.id)) continue;
    const r=el.getBoundingClientRect();
    drag.guideTargetCache.push({
      el,
      targetPiece,
      left:r.left,
      top:r.top,
      right:r.right,
      bottom:r.bottom
    });
  }
}

function findGuideTargetForDrag(left, top){
  if(!state.hintInUse || !drag || state.hintSelectedId!==drag.id) return null;

  const ghostW=drag.ghostW;
  const ghostH=drag.ghostH;
  const gx1=left, gy1=top, gx2=left+ghostW, gy2=top+ghostH;
  const gArea=Math.max(1,ghostW*ghostH);

  let best=null;
  let bestScore=0;
  const targets=drag.guideTargetCache || [];

  for(const target of targets){
    const ix=Math.max(0,Math.min(gx2,target.right)-Math.max(gx1,target.left));
    const iy=Math.max(0,Math.min(gy2,target.bottom)-Math.max(gy1,target.top));
    const overlap=(ix*iy)/gArea;

    const gcx=(gx1+gx2)/2, gcy=(gy1+gy2)/2;
    const centerInside=gcx>=target.left && gcx<=target.right && gcy>=target.top && gcy<=target.bottom;
    const score=centerInside ? Math.max(.75,overlap) : overlap;

    if(score>bestScore && score>=.22){
      bestScore=score;
      best={el:target.el,targetPiece:target.targetPiece};
    }
  }
  return best;
}

function showLockedFeedback(e){
  e.preventDefault();
  e.stopPropagation();
  const el = e.currentTarget;
  el.classList.remove('locked-bump');
  void el.offsetWidth;
  el.classList.add('locked-bump');
  setTimeout(()=>el.classList.remove('locked-bump'), 650);

  // Checkpoint 16 v16.1.1: locked-shape feedback uses the same local,
  // non-modal bubble treatment as Sudoku conflicts. Keep it beside the shape
  // the player actually tried to move instead of sending their eyes elsewhere.
  const alert=$('#conflictAlert');
  const alertText=$('#conflictAlertText');
  if(alert && alertText){
    alert.hidden=true;
    alertText.textContent='';
    alert.dataset.conflictIdentity='';
    alert.classList.remove('conflict-alert-pulse','hint-alert-mode');
  }

  const bubble=$('#conflictBubble');
  const text=$('#conflictBubbleText');
  const wrap=$('#boardWrap');
  if(!bubble || !text || !wrap) return;

  text.textContent='Locked Shapes cannot be moved.';
  bubble.hidden=false;
  bubble.dataset.conflictIdentity='locked-shape';

  requestAnimationFrame(()=>{
    if(bubble.hidden || bubble.dataset.conflictIdentity!=='locked-shape') return;
    const wrapRect=wrap.getBoundingClientRect();
    const targetRect=el.getBoundingClientRect();
    const bubbleRect=bubble.getBoundingClientRect();
    const gap=12;
    const pad=6;
    const centerX=targetRect.left-wrapRect.left+(targetRect.width/2);
    let left=centerX-(bubbleRect.width/2);
    left=Math.max(pad,Math.min(left,wrapRect.width-bubbleRect.width-pad));

    const roomAbove=targetRect.top-wrapRect.top;
    const roomBelow=wrapRect.bottom-targetRect.bottom;
    const placeAbove=roomAbove>=bubbleRect.height+gap || roomAbove>=roomBelow;
    let top=placeAbove
      ? targetRect.top-wrapRect.top-bubbleRect.height-gap
      : targetRect.bottom-wrapRect.top+gap;
    top=Math.max(pad,Math.min(top,wrapRect.height-bubbleRect.height-pad));

    bubble.style.left=`${left}px`;
    bubble.style.top=`${top}px`;
    bubble.classList.toggle('conflict-bubble-below-target',placeAbove);
    bubble.classList.toggle('conflict-bubble-above-target',!placeAbove);
  });
}

function startDrag(e){
  e.preventDefault();
  e.stopPropagation();

  const source = e.currentTarget;
  const id = +source.dataset.id;
  if(state.anchors.has(id)) return;

  // Grabbing any movable shape clears the locked-shape bubble. If a Sudoku
  // conflict is still active, validation will surface that rule again as needed.
  const conflictBubble=$('#conflictBubble');
  if(conflictBubble?.dataset.conflictIdentity==='locked-shape') updateConflictAlert(null);

  const p = state.pieces.find(x=>x.id===id);
  const oldPos = state.placed.get(id) ? {...state.placed.get(id)} : null;

  // Checkpoint 18.2.0: while a Sudoku conflict is active, do not allow a new
  // shape to leave the Rack. Board shapes remain fully movable, including back
  // into the Rack, so the player can resolve the conflict by removing/repositioning
  // a placed shape. This guard is behavioral; the Rack also receives a visual
  // greyed-out state from updateRackConflictLock().
  if(!oldPos && state.activeTeachingConflict){
    return;
  }

  // Snapshot #14 v14.2.4: the first press in Hint Mode selects the rack shape
  // and reveals its compatible homes, but the SAME pointer gesture may continue
  // immediately into a drag. The player is no longer forced to lift and press again.
  if(state.hintArmed && !oldPos){
    const revealed=revealPlacementHintForPiece(id,{deferRender:true});
    if(!revealed) return;
    source.classList.add('hint-selected-piece');
  }

  // Checkpoint 17 v17.0.6: while a hint is active, a movable board shape that
  // blocks one of the revealed destinations may be moved out of the way. Once
  // the player has moved that blocker, keep that same shape movable for the rest
  // of the active Hint session even if it is dropped into another wrong place.
  // This prevents a Sudoku-conflicting relocation from becoming temporarily locked.
  if(state.hintInUse && state.hintSelectedId!==id){
    const isPreviouslyReleasedBlocker=state.hintMovablePieceIds.has(id);
    const blocksHintDestination=!!oldPos && pieceBlocksVisibleHintDestination(id,oldPos);
    const mayMoveDuringHint=!!oldPos && (blocksHintDestination || isPreviouslyReleasedBlocker);
    if(!mayMoveDuringHint){
      bumpWrongHintPiece(source);
      pulseHintSelectedPiece();
      return;
    }
    if(blocksHintDestination) state.hintMovablePieceIds.add(id);
  }

  const draggingHintedPiece=state.hintInUse && state.hintSelectedId===id;

  // If the player grabs the piece that caused the active Sudoku conflict,
  // stop its reminder shake immediately. It will resume after the drop only
  // if that new placement still creates a Sudoku-rule conflict.
  if(state.conflictShakePieceIds.has(id)){
    state.conflictShakePieceIds.delete(id);
    source.classList.remove('conflict-piece-shake');
  }

  // A Hint-confirmed piece is only protected from misleading conflict shaking
  // while it remains in the exact home position confirmed by that Hint. If the
  // player chooses to move it, it becomes an ordinary uncertain piece again.
  const wasHintCorrect=state.hintCorrectPieces.has(id);
  if(wasHintCorrect) state.hintCorrectPieces.delete(id);

  const sourceRect = source.getBoundingClientRect();
  const boardCell = board.getBoundingClientRect().width / 9;
  const sourceCell = sourceRect.width / pieceBounds(p).cols;

  const ghost = pieceElement(p, boardCell, 'board');
  ghost.classList.add('drag-ghost');
  ghost.style.left = '0';
  ghost.style.top = '0';
  document.body.appendChild(ghost);

  // If the piece was already on the board, temporarily remove it while dragging.
  if(oldPos) state.placed.delete(id);

  source.style.visibility = 'hidden';

  const bounds=pieceBounds(p);
  drag = {
    id,
    p,
    source,
    ghost,
    oldPos,
    dx: (e.clientX - sourceRect.left) * (boardCell / sourceCell),
    dy: (e.clientY - sourceRect.top) * (boardCell / sourceCell),
    ghostW:bounds.cols*boardCell,
    ghostH:bounds.rows*boardCell,
    pointerId: e.pointerId,
    startClientX:e.clientX,
    startClientY:e.clientY,
    lastClientX:e.clientX,
    lastClientY:e.clientY,
    rafId:0,
    guideTargetCache:[],
    hoverEl:null,
    landingPreview:null,
    landingKey:'',
    occupiedCells:new Set(
      [...state.placed].flatMap(([placedId,pos])=>{
        if(placedId===id) return [];
        const placedPiece=state.pieces.find(piece=>piece.id===placedId);
        return placedPiece ? placedPiece.cells.map(([dr,dc])=>`${pos.r+dr}:${pos.c+dc}`) : [];
      })
    ),
    wasHintCorrect
  };

  // Keep the selected-shape bubble visible while the finger is still resting on
  // the shape. It disappears only after the shape actually starts moving away.
  if(draggingHintedPiece){
    // v1.21.3: dim the entire Board only while the selected Hint piece is physically
    // being dragged. Releasing it immediately restores the normal Board so a
    // misplaced blocker can be grabbed and moved before the next attempt.
    document.body.classList.add('hint-dragging-selected');
    state.hintBubbleDismissed=false;
    updateHintInstruction();
    activateCompatiblePieceGuides();
    cacheGuideTargetsForDrag();
  }
  moveGhost(e);
  try{ source.setPointerCapture(e.pointerId); }catch(_){}

  // v1.24.2: mark the short drag gesture so CSS can suspend non-essential
  // animation/repaint work and dedicate the frame budget to the moving piece.
  document.body.classList.add('suji-drag-active');
  document.body.style.overflow = 'hidden';
  // touch-action:none on .piece already owns the gesture, so pointermove does not
  // need to be a blocking/non-passive listener on mobile browsers.
  window.addEventListener('pointermove', moveGhost, {passive:true});
  window.addEventListener('pointerup', endDrag, {once:true});
  window.addEventListener('pointercancel', cancelDrag, {once:true});
}

function clearLandingPreview(){
  if(!drag) return;
  if(drag.landingPreview){
    drag.landingPreview.remove();
    drag.landingPreview=null;
  }
  drag.landingKey='';
}

function updateLandingPreview(r,c,cell){
  // v1.24.4: normal-play landing preview only. Hint Mode owns its own guidance.
  if(!drag || state.hintArmed || state.hintInUse){
    clearLandingPreview();
    return;
  }

  const occupied=drag.occupiedCells || new Set();
  const targetCells=[];
  for(const [dr,dc] of drag.p.cells){
    const rr=r+dr, cc=c+dc;
    if(rr<0 || rr>8 || cc<0 || cc>8 || occupied.has(`${rr}:${cc}`)){
      clearLandingPreview();
      return;
    }
    targetCells.push([rr,cc]);
  }

  const key=targetCells.map(([rr,cc])=>`${rr}:${cc}`).join('|');
  if(key===drag.landingKey) return;
  drag.landingKey=key;

  let overlay=drag.landingPreview;
  if(!overlay){
    overlay=document.createElement('div');
    overlay.className='normal-landing-preview';
    $('#boardWrap')?.appendChild(overlay);
    drag.landingPreview=overlay;
  }
  overlay.replaceChildren();
  for(const [rr,cc] of targetCells){
    const tile=document.createElement('span');
    tile.className='normal-landing-preview-cell';
    tile.style.left=`${cc*cell}px`;
    tile.style.top=`${rr*cell}px`;
    tile.style.width=`${cell}px`;
    tile.style.height=`${cell}px`;
    overlay.appendChild(tile);
  }
}

function renderDragFrame(){
  if(!drag) return;
  drag.rafId=0;

  const clientX=drag.lastClientX;
  const clientY=drag.lastClientY;
  const left=clientX-drag.dx;
  const top=clientY-drag.dy;
  drag.ghost.style.transform = `translate3d(${left}px,${top}px,0)`;

  // Match the exact grid rounding used by drop logic, so the highlighted red
  // cells are precisely where this shape would lock if released now.
  if(!state.hintArmed && !state.hintInUse){
    const br=board.getBoundingClientRect();
    const cell=br.width/9;
    const c=Math.round((left-br.left)/cell);
    const r=Math.round((top-br.top)/cell);
    updateLandingPreview(r,c,cell);
  } else {
    clearLandingPreview();
  }

  if(state.hintInUse && state.hintSelectedId===drag.id && !state.hintBubbleDismissed){
    const moved=Math.hypot(clientX-drag.startClientX,clientY-drag.startClientY);
    if(moved>=7){
      state.hintBubbleDismissed=true;
      updateHintInstruction();
    }
  }

  if(!state.hintInUse || state.hintSelectedId!==drag.id){
    if(drag.hoverEl){
      drag.hoverEl.classList.remove('guide-hover');
      drag.hoverEl=null;
    }
    $('#boardWrap')?.classList.remove('guide-focus-active');
    drag.guideTarget=null;
    return;
  }

  const target=findGuideTargetForDrag(left,top);
  const nextEl=target?.el || null;

  // Only touch guide classes when the active destination actually changes.
  if(nextEl!==drag.hoverEl){
    if(drag.hoverEl) drag.hoverEl.classList.remove('guide-hover');
    if(nextEl) nextEl.classList.add('guide-hover');
    drag.hoverEl=nextEl;
    $('#boardWrap')?.classList.toggle('guide-focus-active',!!nextEl);
  }
  drag.guideTarget=target?.targetPiece || null;
}

function moveGhost(e){
  if(!drag) return;

  // v1.24.1 performance: pointer events may arrive much faster than the display
  // can paint. Keep only the newest position and render once per animation frame.
  drag.lastClientX=e.clientX;
  drag.lastClientY=e.clientY;
  if(!drag.rafId) drag.rafId=requestAnimationFrame(renderDragFrame);
}

function endDrag(e){
  if(!drag) return;

  // Flush the final pointer position before drop logic so the visual position and
  // cached Hint destination always agree, even when pointerup lands between frames.
  drag.lastClientX=e.clientX;
  drag.lastClientY=e.clientY;
  if(drag.rafId){
    cancelAnimationFrame(drag.rafId);
    drag.rafId=0;
  }
  renderDragFrame();

  const br = board.getBoundingClientRect();
  const cell = br.width / 9;
  const rackShell = document.querySelector('.rack-shell');
  const rr = rackShell.getBoundingClientRect();

  const left = e.clientX - drag.dx;
  const top = e.clientY - drag.dy;
  const c = Math.round((left - br.left) / cell);
  const r = Math.round((top - br.top) / cell);

  const pointInRack =
    e.clientX >= rr.left && e.clientX <= rr.right &&
    e.clientY >= rr.top && e.clientY <= rr.bottom;

  // Returning to Rack always wins, regardless of guide state.
  if(pointInRack){
    state.lastDroppedId=drag.id;
    if(drag.oldPos) state.manualMoves++;
    const usedHint=state.hintInUse && state.hintSelectedId===drag.id;
    clearCompatiblePieceGuides();
    cleanupDrag();
    // Releasing the hinted shape back in the rack does not waste the revealed guidance.
    // The destination remains visible so the player can grab it again when ready.
    if(usedHint){ renderGuides(); activateCompatiblePieceGuides(); }
    renderAll(false);
    saveActiveGame();
    return;
  }

  // v1.19.3 Hint flow: after a Rack shape is selected the hint is consumed, but
  // guidance remains active until the selected shape is released on a highlighted
  // compatible destination. Dropping it elsewhere on the Board simply returns it
  // to the Rack so the same revealed Hint can be tried again.
  let hintCompleted=false;
  if(state.hintInUse && state.hintSelectedId===drag.id){
    const target=drag.guideTarget;
    if(target && fits(drag.p,target.home.r,target.home.c,drag.id)){
      state.placed.set(drag.id,{r:target.home.r,c:target.home.c});
      if(target.id===drag.id) state.hintCorrectPieces.add(drag.id);
      else state.hintCorrectPieces.delete(drag.id);
      state.lastDroppedId=drag.id;
      state.manualMoves++;
      hintCompleted=true;
    } else if(drag.oldPos){
      state.placed.set(drag.id,drag.oldPos);
      if(drag.wasHintCorrect) state.hintCorrectPieces.add(drag.id);
    }
    // With no old Board position and no highlighted destination, leaving the
    // piece unplaced makes renderAll() put it back in the Rack automatically.
  } else if(fits(drag.p, r, c, drag.id)){
    // Outside Hint Mode, normal free geometric placement remains unchanged.
    state.placed.set(drag.id,{r,c});
    state.lastDroppedId=drag.id;
    state.manualMoves++;
  } else if(drag.oldPos){
    state.placed.set(drag.id,drag.oldPos);
    if(drag.wasHintCorrect) state.hintCorrectPieces.add(drag.id);
  }

  const usedHint=state.hintInUse && state.hintSelectedId===drag.id;
  clearCompatiblePieceGuides();
  cleanupDrag();
  if(usedHint && hintCompleted){
    finishPlacementHint();
  } else if(usedHint){
    renderGuides();
    activateCompatiblePieceGuides();
    setHintModeClass();
    updateHintInstruction();
  }
  renderAll(false);
  saveActiveGame();
}

function cancelDrag(){
  if(!drag) return;
  if(drag.oldPos){
    state.placed.set(drag.id, drag.oldPos);
    if(drag.wasHintCorrect) state.hintCorrectPieces.add(drag.id);
  }
  const usedHint=state.hintInUse && state.hintSelectedId===drag.id;
  clearCompatiblePieceGuides();
  cleanupDrag();
  if(usedHint){ renderGuides(); activateCompatiblePieceGuides(); }
  renderAll(false);
}

function cleanupDrag(){
  window.removeEventListener('pointermove', moveGhost);
  document.body.classList.remove('hint-dragging-selected');
  document.body.classList.remove('suji-drag-active');
  if(drag?.rafId) cancelAnimationFrame(drag.rafId);
  clearLandingPreview();
  if(drag?.hoverEl) drag.hoverEl.classList.remove('guide-hover');
  $('#boardWrap')?.classList.remove('guide-focus-active');
  if(drag?.ghost) drag.ghost.remove();
  if(drag?.source) drag.source.style.visibility = '';
  drag = null;
  document.body.style.overflow = '';
}

function isDragging(){ return !!drag; }
Object.assign(app,{isDragging});

Object.assign(app,{clearGuideHover,activateCompatiblePieceGuides,clearCompatiblePieceGuides,pieceBlocksVisibleHintDestination,cacheGuideTargetsForDrag,findGuideTargetForDrag,showLockedFeedback,startDrag,clearLandingPreview,updateLandingPreview,renderDragFrame,moveGhost,endDrag,cancelDrag,cleanupDrag});
exports["isDragging"] = isDragging;
exports["clearGuideHover"] = clearGuideHover;
exports["activateCompatiblePieceGuides"] = activateCompatiblePieceGuides;
exports["clearCompatiblePieceGuides"] = clearCompatiblePieceGuides;
exports["pieceBlocksVisibleHintDestination"] = pieceBlocksVisibleHintDestination;
exports["cacheGuideTargetsForDrag"] = cacheGuideTargetsForDrag;
exports["findGuideTargetForDrag"] = findGuideTargetForDrag;
exports["showLockedFeedback"] = showLockedFeedback;
exports["startDrag"] = startDrag;
exports["clearLandingPreview"] = clearLandingPreview;
exports["updateLandingPreview"] = updateLandingPreview;
exports["renderDragFrame"] = renderDragFrame;
exports["moveGhost"] = moveGhost;
exports["endDrag"] = endDrag;
exports["cancelDrag"] = cancelDrag;
exports["cleanupDrag"] = cleanupDrag;
});
