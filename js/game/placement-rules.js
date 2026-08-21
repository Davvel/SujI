/** SuJi classic-compatible module wrapper. Source owner: js/game/placement-rules.js */
SuJiModules.define("js/game/placement-rules.js", function(require, exports){
'use strict';
/**
 * SuJi Module: game/placement-rules
 * Migrated from the accepted 1.27.0 implementation with function bodies preserved.
 */
const {app} = require("js/core/app-context.js");
const {state} = require("js/core/state.js");
const {$, $$, board, rack} = require("js/core/dom.js");
const {TYPE_COLORS, TUTORIAL_LEVELS, RULE_COPY, GAME_CONFIG} = require("config/game-config.js");
const {UI_CONFIG} = require("config/ui-config.js");
const {STORAGE_KEYS} = require("config/storage-keys.js");
function placeholderOccupied(targetPiece, ignoreId=null){
  const targetCells = new Set(
    targetPiece.cells.map(([dr,dc])=>`${targetPiece.home.r+dr}:${targetPiece.home.c+dc}`)
  );

  for(const [id,pos] of state.placed){
    if(id===ignoreId) continue;
    const p=state.pieces.find(x=>x.id===id);
    for(const [dr,dc] of p.cells){
      if(targetCells.has(`${pos.r+dr}:${pos.c+dc}`)) return true;
    }
  }
  return false;
}

function getBlockingPieceIds(targetPiece, ignoreId=null){
  const targetCells = new Set(
    targetPiece.cells.map(([dr,dc])=>`${targetPiece.home.r+dr}:${targetPiece.home.c+dc}`)
  );
  const blockers=new Set();

  for(const [id,pos] of state.placed){
    if(id===ignoreId) continue;
    const p=state.pieces.find(x=>x.id===id);
    if(!p) continue;
    for(const [dr,dc] of p.cells){
      if(targetCells.has(`${pos.r+dr}:${pos.c+dc}`)){
        blockers.add(id);
        break;
      }
    }
  }
  return blockers;
}

function blockerNeedsMoving(id){
  if(state.anchors.has(id)) return false;
  const p=state.pieces.find(x=>x.id===id);
  const pos=state.placed.get(id);
  if(!p || !pos) return false;
  // Any piece already sitting in its own canonical home is treated as correct and
  // should never be suggested as an obstruction to move away.
  return !(pos.r===p.home.r && pos.c===p.home.c);
}

function fits(p,r,c,ignoreId=null){
  for(const [dr,dc] of p.cells){
    const rr=r+dr, cc=c+dc;
    if(rr<0||rr>8||cc<0||cc>8) return false;
    for(const [id,pos] of state.placed){
      if(id===ignoreId) continue;
      const op=state.pieces.find(x=>x.id===id);
      if(op.cells.some(([or,oc])=>pos.r+or===rr&&pos.c+oc===cc)) return false;
    }
  }
  return true;
}


Object.assign(app,{placeholderOccupied,getBlockingPieceIds,blockerNeedsMoving,fits});
exports["placeholderOccupied"] = placeholderOccupied;
exports["getBlockingPieceIds"] = getBlockingPieceIds;
exports["blockerNeedsMoving"] = blockerNeedsMoving;
exports["fits"] = fits;
});
