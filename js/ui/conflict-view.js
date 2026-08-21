/**
 * SuJi Module: ui/conflict-view
 * Migrated from the accepted 1.27.0 implementation with function bodies preserved.
 */
import {app} from '../core/app-context.js';
import {state} from '../core/state.js';
import {$,$$,board,rack} from '../core/dom.js';
import {TYPE_COLORS,TUTORIAL_LEVELS,RULE_COPY,GAME_CONFIG} from '../../config/game-config.js';
import {UI_CONFIG} from '../../config/ui-config.js';
import {STORAGE_KEYS} from '../../config/storage-keys.js';
const conflictIdentity=(...args)=>app.conflictIdentity(...args);

function findConflictCellElement(cellInfo){
  if(!cellInfo) return null;
  const pel=[...document.querySelectorAll('.piece.board-piece')].find(el=>Number(el.dataset.id)===cellInfo.id);
  if(!pel) return null;
  return [...pel.querySelectorAll('.piece-cell')].find(el=>Number(el.dataset.dr)===cellInfo.dr && Number(el.dataset.dc)===cellInfo.dc) || null;
}

function updateConflictBubble(rule){
  const bubble=$('#conflictBubble');
  const text=$('#conflictBubbleText');
  const wrap=$('#boardWrap');
  if(!bubble || !text || !wrap) return;
  if(!rule || !RULE_COPY[rule.type] || !rule.cells?.length){
    bubble.hidden=true;
    bubble.dataset.conflictIdentity='';
    text.textContent='';
    return;
  }

  const identity=conflictIdentity(rule);
  text.textContent=RULE_COPY[rule.type].text(rule.n);
  bubble.hidden=false;
  bubble.dataset.conflictIdentity=identity;

  // v1.20.0: pin the Sudoku message to one of the visibly jiggling culprit
  // shapes. Prefer the shape recorded as causing the conflict, then any other
  // currently shaking participant. Never choose a remote Board corner merely
  // because it has more empty space.
  const ownerId=state.conflictShakeOwners.get(identity);
  const candidateIds=[];
  if(ownerId!=null) candidateIds.push(ownerId);
  for(const cell of rule.cells){
    if(state.conflictShakePieceIds.has(cell.id) && !candidateIds.includes(cell.id)) candidateIds.push(cell.id);
  }
  for(const cell of rule.cells){
    if(!candidateIds.includes(cell.id)) candidateIds.push(cell.id);
  }

  let anchorElement=null;
  for(const id of candidateIds){
    const el=wrap.querySelector(`.piece.board-piece[data-id="${id}"]`);
    if(el){ anchorElement=el; break; }
  }
  if(!anchorElement){
    const targetInfo=rule.cells.find(x=>x.id===ownerId) || rule.cells[rule.cells.length-1];
    const target=findConflictCellElement(targetInfo);
    anchorElement=target?.closest('.piece') || target;
  }
  if(!anchorElement) return;

  requestAnimationFrame(()=>{
    if(bubble.hidden || bubble.dataset.conflictIdentity!==identity) return;
    const wrapRect=wrap.getBoundingClientRect();
    const anchorRect=anchorElement.getBoundingClientRect();
    const bubbleRect=bubble.getBoundingClientRect();
    const gap=7;
    const pad=6;
    const rel={
      left:anchorRect.left-wrapRect.left,
      top:anchorRect.top-wrapRect.top,
      right:anchorRect.right-wrapRect.left,
      bottom:anchorRect.bottom-wrapRect.top
    };
    const clampX=x=>Math.max(pad,Math.min(x,wrapRect.width-bubbleRect.width-pad));
    const clampY=y=>Math.max(pad,Math.min(y,wrapRect.height-bubbleRect.height-pad));

    // Only near-shape positions are considered. Above/below are preferred,
    // then the nearest side. Slight overlap with unrelated pieces is preferable
    // to detaching the message from the culprit.
    const candidates=[
      {side:'above', left:clampX(rel.left+(anchorRect.width-bubbleRect.width)/2), top:clampY(rel.top-bubbleRect.height-gap), pref:0},
      {side:'below', left:clampX(rel.left+(anchorRect.width-bubbleRect.width)/2), top:clampY(rel.bottom+gap), pref:5},
      {side:'left',  left:clampX(rel.left-bubbleRect.width-gap), top:clampY(rel.top+(anchorRect.height-bubbleRect.height)/2), pref:11},
      {side:'right', left:clampX(rel.right+gap), top:clampY(rel.top+(anchorRect.height-bubbleRect.height)/2), pref:11}
    ];

    const overlapArea=(a,b)=>Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
    const anchorBox={left:rel.left,top:rel.top,right:rel.right,bottom:rel.bottom};
    const pieces=[...wrap.querySelectorAll('.piece.board-piece')].map(el=>{
      const r=el.getBoundingClientRect();
      return {el,left:r.left-wrapRect.left,top:r.top-wrapRect.top,right:r.right-wrapRect.left,bottom:r.bottom-wrapRect.top};
    });

    let best=candidates[0], bestScore=Infinity;
    for(const c of candidates){
      const b={left:c.left,top:c.top,right:c.left+bubbleRect.width,bottom:c.top+bubbleRect.height};
      let score=c.pref;
      // Never cover the actual jiggling culprit if there is another nearby option.
      score += overlapArea(b,anchorBox)*100;
      // Avoid other pieces where practical, but closeness remains more important.
      for(const pr of pieces){
        if(pr.el===anchorElement) continue;
        score += overlapArea(b,pr)*0.35;
      }
      const bx=c.left+bubbleRect.width/2, by=c.top+bubbleRect.height/2;
      const ax=rel.left+anchorRect.width/2, ay=rel.top+anchorRect.height/2;
      score += Math.hypot(bx-ax,by-ay)*0.01;
      if(score<bestScore){bestScore=score;best=c;}
    }

    bubble.style.left=`${Math.round(best.left)}px`;
    bubble.style.top=`${Math.round(best.top)}px`;
    bubble.classList.remove('conflict-bubble-below-target','conflict-bubble-above-target');
  });
}

function updateConflictAlert(rule){
  const alert=$('#conflictAlert');
  const text=$('#conflictAlertText');

  // v16.1.0: Sudoku-rule text now lives beside the offending board cells.
  // The heading alert remains available for non-Sudoku feedback such as a
  // pinned starting shape, but Sudoku errors no longer make the player look up.
  if(alert && text){
    alert.hidden=true;
    text.textContent='';
    alert.dataset.conflictIdentity='';
    alert.classList.remove('conflict-alert-pulse','hint-alert-mode');
  }
  updateConflictBubble(rule);
}

function updateRackConflictLock(){
  const rackShell=document.querySelector('.rack-shell');
  if(!rackShell) return;
  const locked=!!state.activeTeachingConflict;
  rackShell.classList.toggle('rack-conflict-locked',locked);
  rackShell.setAttribute('aria-disabled', locked ? 'true' : 'false');
  rackShell.dataset.conflictLocked=locked ? 'true' : 'false';
}

function pieceIsConflictShakeProtected(id){
  if(state.anchors.has(id)) return true;
  if(!state.hintCorrectPieces.has(id)) return false;

  // A silent Hint correctness lock is valid only while that exact piece is still
  // sitting in its own canonical home. This also self-heals any stale protection.
  const p=state.pieces.find(x=>x.id===id);
  const pos=state.placed.get(id);
  const stillAtOwnHome=!!(p && pos && pos.r===p.home.r && pos.c===p.home.c);
  if(!stillAtOwnHome) state.hintCorrectPieces.delete(id);
  return stillAtOwnHome;
}

function setConflictShakePiecesForRule(rule){
  state.conflictShakePieceIds.clear();
  if(!rule || !rule.cells) return;
  // Every movable/uncertain piece participating in the active Sudoku error shakes.
  // System anchors and Hint-confirmed-home pieces are known-correct references and
  // therefore never shake, even though their exact clashing cells may still be red.
  for(const x of rule.cells){
    if(state.placed.has(x.id) && !pieceIsConflictShakeProtected(x.id)){
      state.conflictShakePieceIds.add(x.id);
    }
  }
}

function applyConflictPieceShake(){
  $$('.piece.board-piece').forEach(el=>{
    el.classList.toggle('conflict-piece-shake', state.conflictShakePieceIds.has(Number(el.dataset.id)));
  });
}

function paintTeachingConflictCells(rule){
  $$('.piece-cell.teaching-conflict').forEach(el=>el.classList.remove('teaching-conflict'));
  if(!rule || !rule.cells) return;
  for(const x of rule.cells){
    const pel=[...document.querySelectorAll('.piece.board-piece')].find(el=>Number(el.dataset.id)===x.id);
    if(!pel) continue;
    const cell=[...pel.querySelectorAll('.piece-cell')].find(el=>Number(el.dataset.dr)===x.dr && Number(el.dataset.dc)===x.dc);
    if(cell) cell.classList.add('teaching-conflict');
  }
}


Object.assign(app,{findConflictCellElement,updateConflictBubble,updateConflictAlert,updateRackConflictLock,pieceIsConflictShakeProtected,setConflictShakePiecesForRule,applyConflictPieceShake,paintTeachingConflictCells});
export {findConflictCellElement,updateConflictBubble,updateConflictAlert,updateRackConflictLock,pieceIsConflictShakeProtected,setConflictShakePiecesForRule,applyConflictPieceShake,paintTeachingConflictCells};
