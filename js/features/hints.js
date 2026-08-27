/** SuJi classic-compatible module wrapper. Source owner: js/features/hints.js */
SuJiModules.define("js/features/hints.js", function(require, exports){
'use strict';
/**
 * SuJi Module: features/hints
 * Migrated from the accepted 1.27.0 implementation with function bodies preserved.
 */
const {app} = require("js/core/app-context.js");
const {state} = require("js/core/state.js");
const {$, $$, board, rack} = require("js/core/dom.js");
const {TYPE_COLORS, TUTORIAL_LEVELS, RULE_COPY, GAME_CONFIG} = require("config/game-config.js");
const {UI_CONFIG} = require("config/ui-config.js");
const {STORAGE_KEYS} = require("config/storage-keys.js");
const activateCompatiblePieceGuides=(...args)=>app.activateCompatiblePieceGuides(...args);
const blockerNeedsMoving=(...args)=>app.blockerNeedsMoving(...args);
const clearCompatiblePieceGuides=(...args)=>app.clearCompatiblePieceGuides(...args);
const pieceBounds=(...args)=>app.pieceBounds(...args);
const renderAll=(...args)=>app.renderAll(...args);
const renderGuides=(...args)=>app.renderGuides(...args);
const saveActiveGame=(...args)=>app.saveActiveGame(...args);
const updateConflictAlert=(...args)=>app.updateConflictAlert(...args);

function updatePlacementHintButton(){
  const btn=$('#placementHintBtn');
  const count=$('#placementHintCount');
  if(count) count.textContent=String(state.hintRemaining);
  if(!btn) return;
  const active=state.hintArmed || state.hintInUse;
  const rackHasMovableShapes=state.pieces.some(p=>!state.placed.has(p.id));
  const hasPendingSudokuError=!!state.activeTeachingConflict;
  // Checkpoint 18: keep Hint unavailable while there is unfinished Sudoku
  // housekeeping on the Board, or when there is nothing left in the Rack.
  // An already-active Hint session may still be cancelled normally.
  const disabled=!active && ((state.hintRemaining<=0) || !rackHasMovableShapes || hasPendingSudokuError);
  btn.disabled=disabled;
  btn.classList.toggle('hint-disabled',disabled);
  btn.classList.toggle('hint-active',active);
  btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  const forcedTutorialHint=typeof app.tutorialHintNeedsConsumption==='function' && app.tutorialHintNeedsConsumption();
  if(state.hintArmed){
    if(forcedTutorialHint){
      btn.title='Choose a shape from the Rack';
      btn.setAttribute('aria-label','Hint lesson active. Now tap a shape from the Rack');
    } else {
      btn.title='Cancel hint';
      btn.setAttribute('aria-label', `Hint active. Tap to cancel. ${state.hintRemaining} remaining`);
    }
  } else if(state.hintInUse){
    if(forcedTutorialHint){
      btn.title='Drag the selected shape to a highlighted position';
      btn.setAttribute('aria-label','Hint lesson active. Drag the selected shape to a highlighted position');
    } else {
      btn.title='Exit hint guidance';
      btn.setAttribute('aria-label', `Hint revealed. Tap to exit guidance. ${state.hintRemaining} remaining`);
    }
  } else if(hasPendingSudokuError){
    btn.title='Fix the Sudoku error first';
    btn.setAttribute('aria-label', 'Hint unavailable while a Sudoku error is showing on the Board');
  } else if(!rackHasMovableShapes){
    btn.title='No rack shapes available';
    btn.setAttribute('aria-label', 'Hint unavailable because the Rack is empty');
  } else {
    btn.title='Show where a shape belongs';
    btn.setAttribute('aria-label', state.hintRemaining>0 ? `Use placement hint, ${state.hintRemaining} remaining` : 'No placement hints remaining');
  }
}

function pulseHintSelectedPiece(){
  if(state.hintSelectedId==null) return;
  $$(`.piece[data-id="${state.hintSelectedId}"]`).forEach(el=>{
    el.classList.remove('hint-reminder-pulse');
    void el.offsetWidth;
    el.classList.add('hint-reminder-pulse');
    setTimeout(()=>el.classList.remove('hint-reminder-pulse'),720);
  });
}

function bumpWrongHintPiece(el){
  if(!el) return;
  el.classList.remove('hint-blocked-bump');
  void el.offsetWidth;
  el.classList.add('hint-blocked-bump');
  setTimeout(()=>el.classList.remove('hint-blocked-bump'),500);
}

function placeHintBubbleNearSelectedPiece(box){
  const piece=document.querySelector(`.rack .piece[data-id="${state.hintSelectedId}"]`) || document.querySelector(`.piece[data-id="${state.hintSelectedId}"]`);
  if(!piece) return false;
  box.classList.add('hint-follow-piece');
  box.classList.remove('hint-below-piece','hint-anchor-right');
  box.style.left='0px';
  box.style.top='0px';
  const pr=piece.getBoundingClientRect();
  const margin=10;
  const gap=12;
  const br=box.getBoundingClientRect();
  const clampX=x=>Math.max(margin,Math.min(x,window.innerWidth-br.width-margin));
  const clampY=y=>Math.max(margin,Math.min(y,window.innerHeight-br.height-margin));
  const candidates=[
    {left:pr.right+gap,top:pr.top+(pr.height-br.height)/2,side:'right'},
    {left:pr.left-br.width-gap,top:pr.top+(pr.height-br.height)/2,side:'left'},
    {left:pr.left+(pr.width-br.width)/2,top:pr.top-br.height-gap,side:'above'},
    {left:pr.left+(pr.width-br.width)/2,top:pr.bottom+gap,side:'below'}
  ].map(c=>({...c,left:clampX(c.left),top:clampY(c.top)}));
  const overlapArea=(a,b)=>Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
  let best=candidates[0],bestScore=Infinity;
  for(const c of candidates){
    const r={left:c.left,top:c.top,right:c.left+br.width,bottom:c.top+br.height};
    // Covering the selected shape is overwhelmingly worse than being slightly farther away.
    const overlap=overlapArea(r,pr);
    const cx=c.left+br.width/2,cy=c.top+br.height/2;
    const px=pr.left+pr.width/2,py=pr.top+pr.height/2;
    const score=overlap*100+Math.hypot(cx-px,cy-py)*0.02;
    if(score<bestScore){bestScore=score;best=c;}
  }
  if(best.side==='left') box.classList.add('hint-anchor-right');
  if(best.side==='below') box.classList.add('hint-below-piece');
  box.style.setProperty('left',`${Math.round(best.left)}px`,'important');
  box.style.setProperty('right','auto','important');
  box.style.setProperty('top',`${Math.round(best.top)}px`,'important');
  box.style.setProperty('bottom','auto','important');
  return true;
}

function updateHintViewportMetrics(){
  // v1.25.2: Hint Mode is now visual/interaction-only. Older builds used a
  // special compact portrait Board/Rack geometry so every Rack shape could be
  // seen at once. The normal adaptive Rack now already provides that behaviour,
  // so Hint must never resize the play area or publish Hint-only size variables.
  document.documentElement.style.removeProperty('--hint-play-height');
  document.documentElement.style.removeProperty('--hint-board-size');
}

function ensureHintDimLayers(){
  const boardEl=$('#board');
  const boardWrap=$('#boardWrap');
  // v1.21.4: the drag-focus scrim must live in the SAME stacking context as
  // Board pieces and Hint guides. A wrapper-level scrim cannot sit between
  // ordinary pieces and guide destinations because #board is itself a stacking
  // context. Remove any legacy wrapper scrim and recreate it inside #board.
  boardWrap?.querySelectorAll(':scope > .hint-board-dim-layer').forEach(el=>el.remove());
  if(boardEl && !boardEl.querySelector(':scope > .hint-board-dim-layer')){
    const layer=document.createElement('div');
    layer.className='hint-board-dim-layer';
    layer.setAttribute('aria-hidden','true');
    boardEl.appendChild(layer);
  }
  // v1.32.1: Board pieces and guides are siblings of #board inside #boardWrap.
  // Some mobile browsers therefore render the legacy inner scrim underneath
  // those pieces. Add a dedicated wrapper-level Step-1 scrim for touch/mobile
  // layouts so tapping Hint reliably greys the entire visible Board.
  if(boardWrap && !boardWrap.querySelector(':scope > .hint-board-mobile-dim-layer')){
    const layer=document.createElement('div');
    layer.className='hint-board-mobile-dim-layer';
    layer.setAttribute('aria-hidden','true');
    boardWrap.appendChild(layer);
  }
  const rackShell=document.querySelector('.rack-shell');
  if(rackShell && !rackShell.querySelector(':scope > .hint-rack-dim-layer')){
    const layer=document.createElement('div');
    layer.className='hint-rack-dim-layer';
    layer.setAttribute('aria-hidden','true');
    rackShell.appendChild(layer);
  }
}

function setHintModeClass(){
  ensureHintDimLayers();
  document.body.classList.toggle('placement-hint-mode', state.hintArmed || state.hintInUse);
  document.body.classList.toggle('hint-awaiting-selection', state.hintArmed);
  document.body.classList.toggle('hint-shape-selected', state.hintInUse);
  updateHintViewportMetrics();
}

function updateHintInstruction(){
  const box=$('#hintInstruction');
  const text=$('#hintInstructionText');
  const cancel=$('#hintCancelLabel');
  if(!box || !text) return;
  const active=state.hintArmed || state.hintInUse;
  if(cancel) cancel.hidden=true;
  box.hidden=true;
  box.classList.remove('hint-follow-piece','hint-below-piece','hint-anchor-right');
  box.style.removeProperty('left');
  box.style.removeProperty('right');
  box.style.removeProperty('top');
  box.style.removeProperty('bottom');
  if(!active) return;

  // v1.19.7: the Hint bulb itself is the cancel affordance. Keep the UI clean
  // and explain inside the first-step popup that tapping the bulb again cancels
  // without spending a hint. The Board remains dimmed while the Rack stays live.
  const forcedTutorialHint=typeof app.tutorialHintNeedsConsumption==='function' && app.tutorialHintNeedsConsumption();
  if(state.hintArmed){
    text.textContent=forcedTutorialHint
      ? 'Now tap a shape from the Rack.'
      : 'Tap a shape you want to solve. Tap Hint Bulb again to Cancel.';
    box.hidden=false;
    return;
  }

  text.textContent=forcedTutorialHint
    ? 'Now drag this shape to a highlighted position.'
    : 'Drag the selected shape onto the board.';
  if(state.hintBubbleDismissed) return;
  box.hidden=false;
  if(!placeHintBubbleNearSelectedPiece(box)){
    box.classList.remove('hint-follow-piece','hint-below-piece','hint-anchor-right');
  }
}

function armPlacementHint(){
  const forcedTutorialHint=typeof app.tutorialHintNeedsConsumption==='function' && app.tutorialHintNeedsConsumption();
  if(state.hintArmed){
    if(forcedTutorialHint){
      updateHintInstruction();
      if(typeof app.showTutorialHintRackCoach==='function') app.showTutorialHintRackCoach();
      return;
    }
    finishPlacementHint(); renderAll(false); return;
  }
  if(state.hintInUse){
    if(forcedTutorialHint){
      pulseHintSelectedPiece();
      updateHintInstruction();
      return;
    }
    finishPlacementHint(); renderAll(false); return;
  }
  if(state.hintRemaining<=0) return;
  if(state.activeTeachingConflict) return;
  if(!state.pieces.some(p=>!state.placed.has(p.id))) return;
  state.hintArmed=true;
  state.hintSelectedId=null;
  state.hintBubbleDismissed=false;
  if(typeof app.hideTutorialHintFinger==='function') app.hideTutorialHintFinger();
  if(typeof app.updateTutorialHintWaitingClass==='function') app.updateTutorialHintWaitingClass();
  setHintModeClass();
  updateHintInstruction();
  updatePlacementHintButton();
  updateConflictAlert(null);
  renderAll(false);
  if(forcedTutorialHint && typeof app.showTutorialHintRackCoach==='function') app.showTutorialHintRackCoach();
  saveActiveGame();
}

function revealPlacementHintForPiece(id,{deferRender=false}={}){
  if(!state.hintArmed || state.hintRemaining<=0) return false;
  const p=state.pieces.find(x=>x.id===id);
  if(!p || state.anchors.has(id) || state.placed.has(id)) return false;
  state.hintArmed=false;
  state.hintInUse=true;
  state.hintSelectedId=id;
  state.hintBubbleDismissed=false;
  if(typeof app.tutorialHintPieceSelected==='function') app.tutorialHintPieceSelected(id);
  // Normal levels spend the Hint when a Rack shape is selected and its homes are
  // revealed. Level 3's mandatory lesson is stricter: its first Hint is charged
  // only after the selected shape is successfully dragged from Rack to Board.
  const level3PlacementGate=typeof app.tutorialHintNeedsConsumption==='function' && app.tutorialHintNeedsConsumption();
  if(!level3PlacementGate) state.hintRemaining--;
  setHintModeClass();
  renderGuides();
  activateCompatiblePieceGuides();
  updatePlacementHintButton();
  updateConflictAlert(null);
  if(deferRender){
    updateHintInstruction();
  } else {
    renderAll(false);
  }
  saveActiveGame();
  return true;
}

function finishPlacementHint(){
  if(!state.hintArmed && !state.hintInUse) return;
  state.hintArmed=false;
  state.hintInUse=false;
  state.hintSelectedId=null;
  state.hintBubbleDismissed=false;
  state.hintMovablePieceIds.clear();
  clearCompatiblePieceGuides();
  renderGuides();
  setHintModeClass();
  updateHintInstruction();
  updatePlacementHintButton();
  updateConflictAlert(null);
  if(typeof app.tutorialHintSessionEnded==='function') app.tutorialHintSessionEnded();
  saveActiveGame();
}

function suppressBlockedHintDestination(blockingIds){
  if(!blockingIds || blockingIds.size===0) return false;
  // Hide the blocked candidate only when there is nothing useful for the player
  // to move: every blocker is either locked or already correctly placed.
  return ![...blockingIds].some(blockerNeedsMoving);
}

function ensureHintBlockerBubble(el){
  if(!el) return;
  const pieceId=el.dataset.id || '';
  let bubble=document.querySelector(`body > .hint-blocker-callout[data-piece-id="${pieceId}"]`);
  if(!bubble){
    bubble=document.createElement('span');
    bubble.className='hint-blocker-callout';
    bubble.dataset.pieceId=pieceId;
    bubble.textContent='Move this shape';
    bubble.setAttribute('aria-hidden','true');
    document.body.appendChild(bubble);
  }
  bubble.style.left='0px';
  bubble.style.top='0px';
  const pieceRect=el.getBoundingClientRect();
  const bubbleRect=bubble.getBoundingClientRect();
  const gap=10;
  const pad=8;
  let left=pieceRect.left + (pieceRect.width/2) - (bubbleRect.width/2);
  left=Math.max(pad,Math.min(left,window.innerWidth-bubbleRect.width-pad));
  let top=pieceRect.top - bubbleRect.height - gap;
  if(top < pad) top=Math.min(window.innerHeight-bubbleRect.height-pad,pieceRect.bottom + gap);
  bubble.style.setProperty('left',`${Math.round(left)}px`,'important');
  bubble.style.setProperty('top',`${Math.round(top)}px`,'important');
  bubble.style.setProperty('bottom','auto','important');
  bubble.classList.toggle('hint-blocker-callout-below', top > pieceRect.top);
}

function clearHintBlockerEmphasis(){
  $$('.piece.board-piece.hint-blocker-move').forEach(el=>{
    el.classList.remove('hint-blocker-move');
  });
  $$('body > .hint-blocker-callout').forEach(node=>node.remove());
}

function emphasizeMovableBlockers(blockingIds){
  if(!blockingIds) return;
  for(const id of blockingIds){
    if(!blockerNeedsMoving(id)) continue;
    $$(`.piece.board-piece[data-id="${id}"]`).forEach(el=>{
      el.classList.add('hint-blocker-move');
      ensureHintBlockerBubble(el);
    });
  }
}

function clearBlockedHintOverlays(){
  $$('.hint-blocked-shape-overlay').forEach(el=>el.remove());
}

function addBlockedHintOverlay(targetPiece){
  const wrap=$('#boardWrap');
  if(!wrap || !targetPiece) return;
  const br=board.getBoundingClientRect();
  const wr=wrap.getBoundingClientRect();
  const cell=br.width/9;
  const overlay=document.createElement('div');
  overlay.className='hint-blocked-shape-overlay';
  overlay.dataset.guideId=targetPiece.id;
  overlay.style.left=(br.left-wr.left + targetPiece.home.c*cell)+'px';
  overlay.style.top=(br.top-wr.top + targetPiece.home.r*cell)+'px';
  const b=pieceBounds(targetPiece);
  overlay.style.width=(b.cols*cell)+'px';
  overlay.style.height=(b.rows*cell)+'px';
  for(const [dr,dc] of targetPiece.cells){
    const tile=document.createElement('span');
    tile.className='hint-blocked-shape-tile';
    tile.style.left=(dc*cell)+'px';
    tile.style.top=(dr*cell)+'px';
    tile.style.width=cell+'px';
    tile.style.height=cell+'px';
    overlay.appendChild(tile);
  }
  wrap.appendChild(overlay);
}


Object.assign(app,{updatePlacementHintButton,pulseHintSelectedPiece,bumpWrongHintPiece,placeHintBubbleNearSelectedPiece,updateHintViewportMetrics,ensureHintDimLayers,setHintModeClass,updateHintInstruction,armPlacementHint,revealPlacementHintForPiece,finishPlacementHint,suppressBlockedHintDestination,clearHintBlockerEmphasis,emphasizeMovableBlockers,clearBlockedHintOverlays,addBlockedHintOverlay});

function initHints(){ const placementHintBtn=$('#placementHintBtn'); if(placementHintBtn) placementHintBtn.onclick=()=>armPlacementHint(); }
Object.assign(app,{initHints});
exports["updatePlacementHintButton"] = updatePlacementHintButton;
exports["pulseHintSelectedPiece"] = pulseHintSelectedPiece;
exports["bumpWrongHintPiece"] = bumpWrongHintPiece;
exports["placeHintBubbleNearSelectedPiece"] = placeHintBubbleNearSelectedPiece;
exports["updateHintViewportMetrics"] = updateHintViewportMetrics;
exports["ensureHintDimLayers"] = ensureHintDimLayers;
exports["setHintModeClass"] = setHintModeClass;
exports["updateHintInstruction"] = updateHintInstruction;
exports["armPlacementHint"] = armPlacementHint;
exports["revealPlacementHintForPiece"] = revealPlacementHintForPiece;
exports["finishPlacementHint"] = finishPlacementHint;
exports["suppressBlockedHintDestination"] = suppressBlockedHintDestination;
exports["ensureHintBlockerBubble"] = ensureHintBlockerBubble;
exports["clearHintBlockerEmphasis"] = clearHintBlockerEmphasis;
exports["emphasizeMovableBlockers"] = emphasizeMovableBlockers;
exports["clearBlockedHintOverlays"] = clearBlockedHintOverlays;
exports["addBlockedHintOverlay"] = addBlockedHintOverlay;
exports["initHints"] = initHints;
});
