/** SuJi classic-compatible module wrapper. Source owner: js/game/sudoku-generator.js */
SuJiModules.define("js/game/sudoku-generator.js", function(require, exports){
'use strict';
/**
 * SuJi Module: game/sudoku-generator
 * Migrated from the accepted 1.27.0 implementation with function bodies preserved.
 */
const {app} = require("js/core/app-context.js");
const {state} = require("js/core/state.js");
const {$, $$, board, rack} = require("js/core/dom.js");
const {TYPE_COLORS, TUTORIAL_LEVELS, RULE_COPY, GAME_CONFIG} = require("config/game-config.js");
const {UI_CONFIG} = require("config/ui-config.js");
const {STORAGE_KEYS} = require("config/storage-keys.js");
const mulberry32=(...args)=>app.mulberry32(...args);
const shuffle=(...args)=>app.shuffle(...args);

function makeSudoku(seed){
  const rng=mulberry32(seed*2654435761>>>0);
  const base=(r,c)=>(r*3+Math.floor(r/3)+c)%9;
  let digits=shuffle([1,2,3,4,5,6,7,8,9],rng);
  let bands=shuffle([0,1,2],rng), stacks=shuffle([0,1,2],rng);
  let rows=bands.flatMap(b=>shuffle([0,1,2],rng).map(x=>b*3+x));
  let cols=stacks.flatMap(s=>shuffle([0,1,2],rng).map(x=>s*3+x));
  let grid=rows.map(r=>cols.map(c=>digits[base(r,c)]));
  if(rng()>.5) grid=grid[0].map((_,c)=>grid.map(row=>row[c]));
  return grid;
}


Object.assign(app,{makeSudoku});
exports["makeSudoku"] = makeSudoku;
});
