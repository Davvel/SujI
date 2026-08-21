/** SuJi classic-compatible module wrapper. Source owner: js/layout/rack-layout.js */
SuJiModules.define("js/layout/rack-layout.js", function(require, exports){
'use strict';
/**
 * SuJi Module: layout/rack-layout
 * Migrated from the accepted 1.27.0 implementation with function bodies preserved.
 */
const {app} = require("js/core/app-context.js");
const {state} = require("js/core/state.js");
const {$, $$, board, rack} = require("js/core/dom.js");
const {TYPE_COLORS, TUTORIAL_LEVELS, RULE_COPY, GAME_CONFIG} = require("config/game-config.js");
const {UI_CONFIG} = require("config/ui-config.js");
const {STORAGE_KEYS} = require("config/storage-keys.js");
const pieceBounds=(...args)=>app.pieceBounds(...args);

function tryPackRack(pieces, W, H, cell, gap){
  const orders = [
    [...pieces].sort((a,b)=>{
      const A=pieceBounds(a), B=pieceBounds(b);
      return (B.rows-A.rows) || (B.cols-A.cols) || (a.rackIndex-b.rackIndex);
    }),
    [...pieces].sort((a,b)=>{
      const A=pieceBounds(a), B=pieceBounds(b);
      return (B.cols-A.cols) || (B.rows-A.rows) || (a.rackIndex-b.rackIndex);
    }),
    [...pieces].sort((a,b)=>a.rackIndex-b.rackIndex)
  ];

  let best=null;

  for(const ordered of orders){
    const placed=[];
    let x=gap, y=gap, shelfH=0, usedH=gap;

    for(const p of ordered){
      const b=pieceBounds(p);
      const pw=b.cols*cell;
      const ph=b.rows*cell;

      if(x+pw+gap > W){
        x=gap;
        y += shelfH + gap;
        shelfH=0;
      }

      if(y+ph+gap > H){
        placed.length=0;
        break;
      }

      placed.push({p,x,y,cell});
      x += pw + gap;
      shelfH=Math.max(shelfH,ph);
      usedH=Math.max(usedH,y+ph+gap);
    }

    if(placed.length===pieces.length){
      const usedW=Math.max(gap,...placed.map(item=>item.x+pieceBounds(item.p).cols*cell+gap));
      if(!best || usedH*usedW < best.usedH*best.usedW) best={placed,usedH,usedW};
    }
  }
  return best;
}

function tryPackRackDense(pieces,W,H,cell,gap){
  if(!pieces.length) return {placed:[],usedH:0,usedW:0};
  const orders=[
    [...pieces].sort((a,b)=>{
      const A=pieceBounds(a),B=pieceBounds(b);
      return (B.rows*B.cols-A.rows*A.cols)||(B.cols-A.cols)||(B.rows-A.rows)||(a.rackIndex-b.rackIndex);
    }),
    [...pieces].sort((a,b)=>{
      const A=pieceBounds(a),B=pieceBounds(b);
      return (B.cols-A.cols)||(B.rows-A.rows)||(a.rackIndex-b.rackIndex);
    }),
    [...pieces].sort((a,b)=>{
      const A=pieceBounds(a),B=pieceBounds(b);
      return (B.rows-A.rows)||(B.cols-A.cols)||(a.rackIndex-b.rackIndex);
    })
  ];
  let overallBest=null;
  const overlaps=(a,b)=>a.x < b.x+b.w+gap && a.x+a.w+gap > b.x && a.y < b.y+b.h+gap && a.y+a.h+gap > b.y;

  for(const ordered of orders){
    const placed=[];
    let failed=false;
    for(const p of ordered){
      const b=pieceBounds(p), pw=b.cols*cell, ph=b.rows*cell;
      const xCandidates=new Set([gap]);
      for(const r of placed){
        const x=r.x+r.w+gap;
        if(x+pw+gap<=W) xCandidates.add(Math.round(x));
      }
      let bestPos=null;
      for(const x of [...xCandidates].sort((a,b)=>a-b)){
        if(x+pw+gap>W) continue;
        let y=gap, guard=0;
        while(guard++<placed.length+3){
          const probe={x,y,w:pw,h:ph};
          const hits=placed.filter(r=>overlaps(probe,r));
          if(!hits.length) break;
          y=Math.max(...hits.map(r=>r.y+r.h+gap));
        }
        if(y+ph+gap>H) continue;
        const score=(y+ph)*10000+x; // bottom-most, then left-most
        if(!bestPos || score<bestPos.score) bestPos={x,y,score};
      }
      if(!bestPos){ failed=true; break; }
      placed.push({p,x:bestPos.x,y:bestPos.y,w:pw,h:ph,cell});
    }
    if(failed || placed.length!==pieces.length) continue;
    const usedH=Math.max(gap,...placed.map(r=>r.y+r.h+gap));
    const usedW=Math.max(gap,...placed.map(r=>r.x+r.w+gap));
    const score=usedH*usedW;
    if(!overallBest || score<overallBest.score) overallBest={placed,usedH,usedW,score};
  }
  return overallBest;
}

function buildRackLayout(pieces, W, H, landscape, minCell=18){
  const gap = landscape ? 8 : 6;

  // v1.23.6: shape size is now derived from the ACTUAL Rack dimensions. Search
  // for the largest cell size that the tray can hold, using dense packing first.
  // The upper bound itself grows with the tray, so extra Rack area means visibly
  // larger shapes rather than merely larger gaps around fixed-size shapes.
  const dimensionCap=Math.floor(Math.min(W,H)*0.24);
  let low=Math.max(10,minCell), high=Math.max(low,Math.min(96,dimensionCap)), best=null;

  const attemptAt=(cell)=>{
    const dense=tryPackRackDense(pieces,W,H,cell,gap);
    if(dense) return dense;
    return tryPackRack(pieces,W,H,cell,gap);
  };

  while(low<=high){
    const mid=Math.floor((low+high)/2);
    const attempt=attemptAt(mid);
    if(attempt){
      best=attempt;
      low=mid+1;
    } else {
      high=mid-1;
    }
  }

  if(!best){
    for(let fallbackCell=Math.max(10,minCell-2); fallbackCell>=10 && !best; fallbackCell-=2){
      best=attemptAt(fallbackCell);
    }
  }
  if(!best) best={placed:[],usedH:H,usedW:W};

  const map=new Map();
  for(const item of best.placed){
    map.set(item.p.id,{x:item.x,y:item.y,cell:item.cell});
  }

  return {map,usedH:best.usedH,usedW:best.usedW,cell:best.placed[0]?.cell || minCell};
}

function centerRackLayout(layout,pieces,W,H,gap=6){
  if(!layout?.map?.size || !pieces?.length) return layout;
  let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
  for(const p of pieces){
    const pos=layout.map.get(p.id); if(!pos) continue;
    const b=pieceBounds(p);
    minX=Math.min(minX,pos.x); minY=Math.min(minY,pos.y);
    maxX=Math.max(maxX,pos.x+b.cols*pos.cell);
    maxY=Math.max(maxY,pos.y+b.rows*pos.cell);
  }
  if(!Number.isFinite(minX)) return layout;
  const usedW=maxX-minX, usedH=maxY-minY;
  const dx=Math.max(0,(W-usedW)/2-minX);
  const dy=Math.max(0,(H-usedH)/2-minY);
  const map=new Map();
  for(const p of pieces){
    const pos=layout.map.get(p.id); if(!pos) continue;
    map.set(p.id,{...pos,x:Math.round(pos.x+dx),y:Math.round(pos.y+dy)});
  }
  return {...layout,map,usedW,usedH};
}

function distributeRackLayout(layout, pieces, W, H, gap=6){
  if(!layout?.map?.size || !pieces?.length) return layout;

  // Group packed shapes into their shelf rows, then use the ENTIRE tray instead
  // of leaving all rows bunched against the top-left corner.
  const rows=[];
  const sorted=[...pieces]
    .map(p=>({p,pos:layout.map.get(p.id),b:pieceBounds(p)}))
    .filter(x=>x.pos)
    .sort((a,b)=>(a.pos.y-b.pos.y)||(a.pos.x-b.pos.x));

  for(const item of sorted){
    let row=rows.find(r=>Math.abs(r.sourceY-item.pos.y)<=2);
    if(!row){
      row={sourceY:item.pos.y,items:[]};
      rows.push(row);
    }
    row.items.push(item);
  }
  rows.sort((a,b)=>a.sourceY-b.sourceY);
  if(!rows.length) return layout;

  for(const row of rows){
    row.items.sort((a,b)=>a.pos.x-b.pos.x);
    row.height=Math.max(...row.items.map(x=>x.b.rows*x.pos.cell));
    row.width=row.items.reduce((sum,x)=>sum+x.b.cols*x.pos.cell,0)+gap*Math.max(0,row.items.length-1);
  }

  const totalRowHeight=rows.reduce((sum,r)=>sum+r.height,0);
  const freeVertical=Math.max(0,H-totalRowHeight);
  const verticalGap=freeVertical/(rows.length+1);
  let y=verticalGap;
  const map=new Map();

  for(const row of rows){
    const freeHorizontal=Math.max(0,W-row.width);
    // Centre each row and give it modest extra breathing room when space permits.
    const extraBetween=row.items.length>1 ? Math.min(18,freeHorizontal/(row.items.length+1)) : 0;
    const usedWidth=row.width+extraBetween*Math.max(0,row.items.length-1);
    let x=Math.max(gap,(W-usedWidth)/2);
    for(const item of row.items){
      const ph=item.b.rows*item.pos.cell;
      map.set(item.p.id,{
        x:Math.round(x),
        y:Math.round(y+(row.height-ph)/2),
        cell:item.pos.cell
      });
      x += item.b.cols*item.pos.cell + gap + extraBetween;
    }
    y += row.height+verticalGap;
  }

  return {...layout,map,usedH:H};
}

function resolvePortraitRackLayout(pieces, width, minHeight, maxHeight, compactHintRack, targetCell){
  const gap=6;
  const safeMin=Math.max(96,Math.floor(minHeight));
  const safeMax=Math.max(safeMin,Math.floor(maxHeight));
  const desiredCell=Math.max(compactHintRack ? 18 : 24,Math.floor(targetCell || 32));

  if(!pieces.length){
    return {
      height:safeMin,
      layout:buildRackLayout(pieces,width,safeMin,false,compactHintRack ? 14 : 18)
    };
  }

  const fitsAt=(height,cell)=>!!tryPackRack(pieces,width,height,cell,gap);

  // v1.23.2: readability comes first. Keep Rack cells near a useful fraction
  // of a Board cell, and grow the tray only as much as is required to fit them.
  // This uses the extra portrait height for LARGER shapes instead of merely
  // adding empty wooden space around tiny shapes.
  let chosenCell=desiredCell;
  if(!fitsAt(safeMax,chosenCell)){
    // If even a Board-height Rack cannot hold the requested readable size,
    // find the largest cell size that does fit rather than clipping pieces.
    let low=10,high=chosenCell,best=10;
    while(low<=high){
      const mid=Math.floor((low+high)/2);
      if(fitsAt(safeMax,mid)){
        best=mid;
        low=mid+1;
      }else{
        high=mid-1;
      }
    }
    chosenCell=best;
  }

  // Find the SHORTEST Rack that accommodates every remaining shape at the
  // chosen readable size. This makes the Rack shrink progressively as shapes
  // leave it, with safeMin and Board height acting as the two hard limits.
  let chosenHeight=safeMax;
  if(fitsAt(safeMin,chosenCell)){
    chosenHeight=safeMin;
  }else{
    let low=safeMin,high=safeMax,best=safeMax;
    while(low<=high){
      const mid=Math.floor((low+high)/2);
      if(fitsAt(mid,chosenCell)){
        best=mid;
        high=mid-1;
      }else{
        low=mid+1;
      }
    }
    chosenHeight=best;
  }

  return {
    height:chosenHeight,
    layout:buildRackLayout(pieces,width,chosenHeight,false,chosenCell)
  };
}

function resolvePortraitBoardRackGeometry(rackPieces){
  const play=document.querySelector('.play-layout');
  const boardSection=document.querySelector('.board-section');
  const rackSection=document.querySelector('.rack-section');
  const rackShell=document.querySelector('.rack-shell');
  const boardWrap=document.querySelector('#boardWrap');
  if(!play || !boardSection || !rackSection || !rackShell || !boardWrap) return null;

  const visualHeight=window.visualViewport?.height || window.innerHeight;
  const playTop=play.getBoundingClientRect().top;
  const availableHeight=Math.max(360,Math.floor(visualHeight-playTop-6));
  const sectionWidth=Math.max(180,boardSection.clientWidth);
  const boardStyle=getComputedStyle(boardSection);
  const boardHorizontalPadding=(parseFloat(boardStyle.paddingLeft)||0)+(parseFloat(boardStyle.paddingRight)||0);
  const maxBoardByWidth=Math.max(180,Math.floor(sectionWidth-boardHorizontalPadding));

  // Measure the non-square chrome instead of guessing: title row + panel padding
  // above/below the Board, and Rack panel padding/borders outside the wooden tray.
  const currentBoardRect=boardWrap.getBoundingClientRect();
  const currentBoardSectionRect=boardSection.getBoundingClientRect();
  const boardChrome=Math.max(42,Math.round(currentBoardSectionRect.height-currentBoardRect.height));
  const currentRackRect=rackShell.getBoundingClientRect();
  const currentRackSectionRect=rackSection.getBoundingClientRect();
  const rackChrome=Math.max(10,Math.round(currentRackSectionRect.height-currentRackRect.height));
  const gap=6;
  const minRack=Math.max(150,Math.min(visualHeight*0.22,210));

  // v1.23.5: the Board is allowed to shrink more aggressively when the Rack is
  // crowded. The minimum Board size is dynamic instead of fixed: at the start
  // of a level the Rack gets priority; as shapes leave the Rack the Board grows
  // back toward its normal size.
  const remaining=rackPieces.length;
  let boardFloorRatio;
  if(remaining>=18) boardFloorRatio=window.innerWidth<=520 ? .54 : .60;
  else if(remaining>=12) boardFloorRatio=window.innerWidth<=520 ? .60 : .66;
  else if(remaining>=7) boardFloorRatio=window.innerWidth<=520 ? .66 : .70;
  else boardFloorRatio=window.innerWidth<=520 ? .72 : .76;
  const minBoard=Math.max(190,Math.floor(maxBoardByWidth*boardFloorRatio));
  const maxBoard=Math.max(minBoard,Math.min(maxBoardByWidth,availableHeight-boardChrome-rackChrome-gap-minRack));
  const rackWidth=Math.max(100,rackSection.clientWidth-14);

  if(!rackPieces.length){
    const boardSize=maxBoard;
    return {boardSize,rackHeight:minRack,boardChrome,rackChrome,gap};
  }

  // Search from the largest Board downward. The first geometry that gives all
  // Rack pieces a comfortably readable size wins. This is the core v1.23.3
  // behaviour: a crowded Rack is allowed to take height FROM the Board.
  let fallback=null;
  for(let boardSize=maxBoard;boardSize>=minBoard;boardSize-=4){
    const rackHeight=Math.floor(availableHeight-boardChrome-rackChrome-gap-boardSize);
    if(rackHeight<minRack) continue;
    if(rackHeight>boardSize) continue; // original rule: Rack never taller than Board.

    const boardCell=boardSize/9;
    const crowdBoost=remaining>=18 ? 4 : remaining>=12 ? 2 : 0;
    const targetRackCell=Math.max(30+crowdBoost,Math.min(50,boardCell*.66+crowdBoost));
    const fit=tryPackRack(rackPieces,rackWidth,rackHeight,Math.floor(targetRackCell),6);
    if(fit) return {boardSize,rackHeight,boardChrome,rackChrome,gap};
    fallback={boardSize,rackHeight,boardChrome,rackChrome,gap};
  }

  // If the ideal readable size cannot fit, use the most Rack-friendly legal
  // geometry and let the packer find the largest cell size possible inside it.
  if(fallback) return fallback;
  const boardSize=minBoard;
  const rackHeight=Math.max(minRack,Math.min(boardSize,availableHeight-boardChrome-rackChrome-gap-boardSize));
  return {boardSize,rackHeight,boardChrome,rackChrome,gap};
}


Object.assign(app,{tryPackRack,tryPackRackDense,buildRackLayout,centerRackLayout,distributeRackLayout,resolvePortraitRackLayout,resolvePortraitBoardRackGeometry});
exports["tryPackRack"] = tryPackRack;
exports["tryPackRackDense"] = tryPackRackDense;
exports["buildRackLayout"] = buildRackLayout;
exports["centerRackLayout"] = centerRackLayout;
exports["distributeRackLayout"] = distributeRackLayout;
exports["resolvePortraitRackLayout"] = resolvePortraitRackLayout;
exports["resolvePortraitBoardRackGeometry"] = resolvePortraitBoardRackGeometry;
});
