/** SuJi classic-compatible module wrapper. Source owner: js/ui/piece-view.js */
SuJiModules.define("js/ui/piece-view.js", function(require, exports){
'use strict';
/**
 * SuJi Module: ui/piece-view
 * Migrated from the accepted 1.27.0 implementation with function bodies preserved.
 */
const {app} = require("js/core/app-context.js");
const {state} = require("js/core/state.js");
const {$, $$, board, rack} = require("js/core/dom.js");
const {TYPE_COLORS, TUTORIAL_LEVELS, RULE_COPY, GAME_CONFIG} = require("config/game-config.js");
const {UI_CONFIG} = require("config/ui-config.js");
const {STORAGE_KEYS} = require("config/storage-keys.js");
const pieceBounds=(...args)=>app.pieceBounds(...args);
const showLockedFeedback=(...args)=>app.showLockedFeedback(...args);
const startDrag=(...args)=>app.startDrag(...args);

function pieceElement(p, cellPx, location='rack'){
  const b=pieceBounds(p);
  const el=document.createElement('div');
  el.className=`piece piece-${p.type} ${location==='board'?'board-piece':''} ${state.picture&&state.imageURL?'picture':''}`;
  if(location==='board' && state.conflictShakePieceIds.has(p.id)) el.classList.add('conflict-piece-shake');
  el.dataset.id=p.id;
  el.style.setProperty('--piece-cell',cellPx+'px');
  el.style.width=(b.cols*cellPx)+'px'; el.style.height=(b.rows*cellPx)+'px';
  if(state.picture&&state.imageURL){
    // level-loader normalizes artwork to an absolute URL before rendering.
    el.style.setProperty('--img',`url("${state.imageURL}")`);
  }
  for(const t of p.tiles){
    const pc=document.createElement('div');
    pc.className='piece-cell';
    pc.dataset.dr=t.dr;
    pc.dataset.dc=t.dc;
    pc.dataset.srcR=t.srcR;
    pc.dataset.srcC=t.srcC;
    pc.style.width=cellPx+'px'; pc.style.height=cellPx+'px';
    pc.style.left=(t.dc*cellPx)+'px'; pc.style.top=(t.dr*cellPx)+'px';
    pc.style.setProperty('--src-r',t.srcR); pc.style.setProperty('--src-c',t.srcC);
    const num=document.createElement('span'); num.className='piece-number'; num.textContent=t.n;
    pc.appendChild(num); el.appendChild(pc);
  }
  if(!state.anchors.has(p.id)) {
    el.addEventListener('pointerdown', startDrag);
  } else {
    el.classList.add('anchor');
    el.addEventListener('pointerdown', showLockedFeedback);
  }
  return el;
}


Object.assign(app,{pieceElement});
exports["pieceElement"] = pieceElement;
});
