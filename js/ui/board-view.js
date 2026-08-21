/** SuJi classic-compatible module wrapper. Source owner: js/ui/board-view.js */
SuJiModules.define("js/ui/board-view.js", function(require, exports){
'use strict';
/**
 * SuJi Module: ui/board-view
 * Migrated from the accepted 1.27.0 implementation with function bodies preserved.
 */
const {app} = require("js/core/app-context.js");
const {state} = require("js/core/state.js");
const {$, $$, board, rack} = require("js/core/dom.js");
const {TYPE_COLORS, TUTORIAL_LEVELS, RULE_COPY, GAME_CONFIG} = require("config/game-config.js");
const {UI_CONFIG} = require("config/ui-config.js");
const {STORAGE_KEYS} = require("config/storage-keys.js");
const pieceBounds=(...args)=>app.pieceBounds(...args);
const placeholderOccupied=(...args)=>app.placeholderOccupied(...args);
const shapeKey=(...args)=>app.shapeKey(...args);

function buildBoard(){
  board.innerHTML='';
  for(let r=0;r<9;r++) for(let c=0;c<9;c++){
    const cell=document.createElement('div');
    cell.className='board-cell';
    cell.dataset.r=r; cell.dataset.c=c;
    board.appendChild(cell);
  }
}

function renderGuides(){
  $$('.guide-piece').forEach(x=>x.remove());
  $('#boardWrap').classList.toggle('guides-off', !state.hintInUse);
  if(!state.hintInUse) return;
  const br=board.getBoundingClientRect();
  const cell=br.width/9;
  for(const p of state.pieces){
    const b=pieceBounds(p);
    const g=document.createElement('div');
    g.className=`guide-piece guide-${p.type}`;
    g.dataset.guideId=p.id;
    g.dataset.shapeKey=shapeKey(p);
    if(placeholderOccupied(p)) g.classList.add('guide-occupied');
    g.style.left=(p.home.c*cell)+'px';
    g.style.top=(p.home.r*cell)+'px';
    g.style.width=(b.cols*cell)+'px';
    g.style.height=(b.rows*cell)+'px';
    for(const [dr,dc] of p.cells){
      const tile=document.createElement('span');
      tile.className='guide-tile';
      tile.style.left=(dc*cell)+'px'; tile.style.top=(dr*cell)+'px';
      tile.style.width=cell+'px'; tile.style.height=cell+'px';
      g.appendChild(tile);
    }
    board.parentElement.appendChild(g);
  }
}


Object.assign(app,{buildBoard,renderGuides});
exports["buildBoard"] = buildBoard;
exports["renderGuides"] = renderGuides;
});
