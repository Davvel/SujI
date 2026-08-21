/**
 * SuJi Module: game/validator
 * Migrated from the accepted 1.27.0 implementation with function bodies preserved.
 */
import {app} from '../core/app-context.js';
import {state} from '../core/state.js';
import {$,$$,board,rack} from '../core/dom.js';
import {TYPE_COLORS,TUTORIAL_LEVELS,RULE_COPY,GAME_CONFIG} from '../../config/game-config.js';
import {UI_CONFIG} from '../../config/ui-config.js';
import {STORAGE_KEYS} from '../../config/storage-keys.js';
const applyConflictPieceShake=(...args)=>app.applyConflictPieceShake(...args);
const clearRuleRegion=(...args)=>app.clearRuleRegion(...args);
const conflictIdentity=(...args)=>app.conflictIdentity(...args);
const conflictStillExists=(...args)=>app.conflictStillExists(...args);
const paintRuleRegion=(...args)=>app.paintRuleRegion(...args);
const paintTeachingConflictCells=(...args)=>app.paintTeachingConflictCells(...args);
const setConflictShakePiecesForRule=(...args)=>app.setConflictShakePiecesForRule(...args);
const updateConflictAlert=(...args)=>app.updateConflictAlert(...args);
const updateRackConflictLock=(...args)=>app.updateRackConflictLock(...args);

function validate(){
  // Clear previous per-cell conflict styling and tutorial context.
  $$('.piece-cell').forEach(el=>el.classList.remove('conflict','teaching-conflict'));
  clearRuleRegion();

  const occ=[];
  for(const [id,pos] of state.placed){
    const p=state.pieces.find(x=>x.id===id);
    p.tiles.forEach(t=>occ.push({id,dr:t.dr,dc:t.dc,r:pos.r+t.dr,c:pos.c+t.dc,n:t.n}));
  }

  const badKeys=new Set();
  const conflicts=[];
  const collect=(type,keyFn)=>{
    const groups=new Map();
    occ.forEach(x=>{ const k=keyFn(x); if(!groups.has(k)) groups.set(k,[]); groups.get(k).push(x); });
    for(const [key,arr] of groups){
      const nums=new Map();
      arr.forEach(x=>{ if(!nums.has(x.n)) nums.set(x.n,[]); nums.get(x.n).push(x); });
      for(const [n,xs] of nums){
        if(xs.length>1){
          xs.forEach(x=>badKeys.add(`${x.id}:${x.dr}:${x.dc}`));
          if(type==='row') conflicts.push({type,index:+key,n,cells:xs});
          if(type==='col') conflicts.push({type,index:+key,n,cells:xs});
          if(type==='box'){ const [br,bc]=key.split(',').map(Number); conflicts.push({type,br,bc,n,cells:xs}); }
        }
      }
    }
  };

  collect('row',x=>String(x.r));
  collect('col',x=>String(x.c));
  collect('box',x=>`${Math.floor(x.r/3)},${Math.floor(x.c/3)}`);

  // Apply conflict state directly to rendered board cells. Using direct piece lookup
  // avoids selector/overlay edge cases and keeps the red border anchored to the exact cells.
  for(const key of badKeys){
    const [id,dr,dc]=key.split(':').map(Number);
    const pel=[...document.querySelectorAll('.piece.board-piece')].find(el=>Number(el.dataset.id)===id);
    if(!pel) continue;
    const cell=[...pel.querySelectorAll('.piece-cell')].find(el=>Number(el.dataset.dr)===dr && Number(el.dataset.dc)===dc);
    if(cell) cell.classList.add('conflict');
  }

  // Keep at most ONE persistent visual error cue on every level. The yellow
  // row / column / 3x3 region and the pulsing conflicting numbers remain until
  // that exact conflict is resolved. Text teaching messages are still restricted
  // to tutorial Levels 1-5.
  if(state.activeTeachingConflict && !conflictStillExists(state.activeTeachingConflict,conflicts)){
    state.activeTeachingConflict=null;
    state.conflictShakePieceIds.clear();
    paintTeachingConflictCells(null);
    clearRuleRegion();
  }

  const droppedId=state.lastDroppedId;
  if(droppedId!==null){
    // Only a conflict involving the most recently dropped piece becomes the
    // active visual cue. Existing conflicts elsewhere do not steal focus.
    const relevant=conflicts.filter(c=>c.cells.some(x=>x.id===droppedId));
    if(relevant.length){
      const priority = state.level===4 ? ['col','row','box'] : state.level===5 ? ['box','row','col'] : ['row','col','box'];
      let chosen=null;
      for(const type of priority){
        chosen=relevant.find(c=>c.type===type);
        if(chosen) break;
      }
      if(chosen){
        state.activeTeachingConflict=chosen;
        // Shake every uncertain piece involved in the active Sudoku conflict.
        // If both pieces are movable, both shake. Locked anchors and Hint-confirmed
        // correct-home pieces never shake because that would falsely imply they
        // are the pieces the player should move.
        setConflictShakePiecesForRule(chosen);
        state.conflictShakeOwners.set(conflictIdentity(chosen), droppedId);
        paintRuleRegion(chosen);
        paintTeachingConflictCells(chosen);

        // Conflict warnings are now persistent, non-modal status messages.
        // There is no three-display limit: every active collision is reported.
      }
    } else if(state.activeTeachingConflict){
      paintRuleRegion(state.activeTeachingConflict);
      paintTeachingConflictCells(state.activeTeachingConflict);
    }
    state.lastDroppedId=null;
  } else if(state.activeTeachingConflict){
    paintRuleRegion(state.activeTeachingConflict);
    paintTeachingConflictCells(state.activeTeachingConflict);
  }

  // Always show the currently active collision at the top of the Board.
  // It is non-modal and disappears immediately when that conflict is fixed.
  if(state.activeTeachingConflict && conflictStillExists(state.activeTeachingConflict,conflicts)){
    setConflictShakePiecesForRule(state.activeTeachingConflict);
    updateConflictAlert(state.activeTeachingConflict);
  } else if(conflicts.length){
    // Safety fallback: if a previous conflict remains after the currently focused
    // conflict is removed, surface it again and restore the piece that originally
    // caused that rule violation as the reminder shaker.
    state.activeTeachingConflict=conflicts[0];
    // Recompute all uncertain participants for the resurfaced conflict. This avoids
    // blaming an arbitrary 'owner' when either of two movable pieces could be moved.
    setConflictShakePiecesForRule(state.activeTeachingConflict);
    paintRuleRegion(state.activeTeachingConflict);
    paintTeachingConflictCells(state.activeTeachingConflict);
    updateConflictAlert(state.activeTeachingConflict);
  } else {
    state.conflictShakePieceIds.clear();
    updateConflictAlert(null);
  }

  // Forget ownership records for conflicts that no longer exist.
  const liveIds=new Set(conflicts.map(conflictIdentity));
  for(const key of state.conflictShakeOwners.keys()) if(!liveIds.has(key)) state.conflictShakeOwners.delete(key);

  applyConflictPieceShake();
  updateRackConflictLock();
  return badKeys.size;
}


Object.assign(app,{validate});
export {validate};
