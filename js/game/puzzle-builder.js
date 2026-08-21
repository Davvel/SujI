/**
 * SuJi Module: game/puzzle-builder
 * Migrated from the accepted 1.27.0 implementation with function bodies preserved.
 */
import {app} from '../core/app-context.js';
import {state} from '../core/state.js';
import {$,$$,board,rack} from '../core/dom.js';
import {TYPE_COLORS,TUTORIAL_LEVELS,RULE_COPY,GAME_CONFIG} from '../../config/game-config.js';
import {UI_CONFIG} from '../../config/ui-config.js';
import {STORAGE_KEYS} from '../../config/storage-keys.js';
const mulberry32=(...args)=>app.mulberry32(...args);
const shuffle=(...args)=>app.shuffle(...args);
const sujiPatternForLevel=(...args)=>app.sujiPatternForLevel(...args);

function makePieces(seed, sudoku){
  const pattern=sujiPatternForLevel(seed);
  const raw=pattern.pieces.map((def,id)=>({
    id,
    type:def.type,
    cells:def.cells.map(([r,c])=>[r,c]),
    home:{r:def.home[0],c:def.home[1]},
    patternId:pattern.id
  }));

  raw.forEach(p=>{
    p.tiles=p.cells.map(([dr,dc])=>({
      dr,dc,
      srcR:p.home.r+dr, srcC:p.home.c+dc,
      n:sudoku[p.home.r+dr][p.home.c+dc]
    }));
  });

  // Rack order can still vary deterministically by level even though the tessellation is fixed.
  const rng=mulberry32((seed^0x9e3779b9)>>>0);
  const shuffled=shuffle(raw,rng);
  shuffled.forEach((p,i)=>p.rackIndex=i);
  return shuffled;
}

function pieceBounds(p){
  const maxR=Math.max(...p.cells.map(x=>x[0])), maxC=Math.max(...p.cells.map(x=>x[1]));
  return {rows:maxR+1,cols:maxC+1};
}

function shapeKey(p){
  return p.cells
    .map(([r,c])=>`${r},${c}`)
    .sort()
    .join('|');
}

function chooseAnchors(){
  // Starting hints must be meaningful, so never use a 1x1 piece as a free opening hint.
  // The opening 1 / 2 / 3 system-given hints are chosen only from larger tetrominoes.
  const candidates=state.pieces.filter(p=>p.cells.length>1);
  const rng=mulberry32((state.level*1103515245 + state.hints*9973)>>>0);
  return new Set(shuffle(candidates,rng).slice(0,state.hints).map(p=>p.id));
}


Object.assign(app,{makePieces,pieceBounds,shapeKey,chooseAnchors});
export {makePieces,pieceBounds,shapeKey,chooseAnchors};
