/**
 * SuJi Module: ui/rack-view
 * Migrated from the accepted 1.27.0 implementation with function bodies preserved.
 */
import {app} from '../core/app-context.js';
import {state} from '../core/state.js';
import {$,$$,board,rack} from '../core/dom.js';
import {TYPE_COLORS,TUTORIAL_LEVELS,RULE_COPY,GAME_CONFIG} from '../../config/game-config.js';
import {UI_CONFIG} from '../../config/ui-config.js';
import {STORAGE_KEYS} from '../../config/storage-keys.js';
const activateCompatiblePieceGuides=(...args)=>app.activateCompatiblePieceGuides(...args);
const buildRackLayout=(...args)=>app.buildRackLayout(...args);
const centerRackLayout=(...args)=>app.centerRackLayout(...args);
const checkForLevelCompletion=(...args)=>app.checkForLevelCompletion(...args);
const getResponsiveViewport=(...args)=>app.getResponsiveViewport(...args);
const pieceElement=(...args)=>app.pieceElement(...args);
const renderGuides=(...args)=>app.renderGuides(...args);
const resolvePortraitBoardRackGeometry=(...args)=>app.resolvePortraitBoardRackGeometry(...args);
const updateHintInstruction=(...args)=>app.updateHintInstruction(...args);
const updateStats=(...args)=>app.updateStats(...args);
const validate=(...args)=>app.validate(...args);

function renderAll(animateAnchors=false){
  renderGuides();
  $$('.piece.board-piece').forEach(x=>x.remove());
  rack.innerHTML='';
  const rackShell=document.querySelector('.rack-shell');
  let rackPieces=state.pieces.filter(p=>!state.placed.has(p.id));
  const landscape=document.body.classList.contains('landscape-ui');

  // v1.23.7: keep the resolved portrait geometry so the packer can size
  // against the SAME Rack dimensions that CSS is being told to render. Earlier
  // builds changed the CSS variable and then immediately re-measured a tray
  // that could still be part-way through its height transition, producing a
  // stale/smaller Rack measurement and therefore undersized shapes.
  let portraitGeometry=null;
  if(!landscape){
    portraitGeometry=resolvePortraitBoardRackGeometry(rackPieces);
    if(portraitGeometry){
      document.documentElement.style.setProperty('--portrait-board-size',Math.round(portraitGeometry.boardSize)+'px');
      document.documentElement.style.setProperty('--portrait-board-section-height',Math.round(portraitGeometry.boardSize+portraitGeometry.boardChrome)+'px');
      document.documentElement.style.setProperty('--portrait-rack-height',Math.round(portraitGeometry.rackHeight)+'px');
      document.documentElement.style.setProperty('--portrait-rack-section-height',Math.round(portraitGeometry.rackHeight+portraitGeometry.rackChrome)+'px');
      rackShell.style.setProperty('--portrait-rack-height',Math.round(portraitGeometry.rackHeight)+'px');
      // Force the browser to commit the new geometry before querying inner width.
      void rackShell.offsetHeight;
    }
  }else if(landscape){
    document.documentElement.style.removeProperty('--portrait-board-size');
    document.documentElement.style.removeProperty('--portrait-board-section-height');
    document.documentElement.style.removeProperty('--portrait-rack-height');
    document.documentElement.style.removeProperty('--portrait-rack-section-height');
    rackShell.style.removeProperty('--portrait-rack-height');
  }

  // Read Board geometry only AFTER the portrait size variable has been updated.
  const boardRect=board.getBoundingClientRect(), cell=boardRect.width/9;
  let layout;

  if(!landscape){
    const visualHeight=window.visualViewport?.height || window.innerHeight;
    const targetMin=Math.max(150,Math.min(visualHeight*0.22,210));
    const rackWidth=Math.max(80,rackShell.clientWidth || rack.getBoundingClientRect().width);

    // v1.25.2: use exactly the same adaptive portrait Rack packing in normal
    // play, while selecting a Hint shape, while dragging it, and after it locks.
    // Hint Mode no longer has any separate compact sizing path.
    const settledRackRect=rack.getBoundingClientRect();
    const settledRackWidth=Math.max(80,Math.floor(settledRackRect.width || rackWidth));
    const rackHeight=Math.max(targetMin,Math.floor(portraitGeometry?.rackHeight || settledRackRect.height || rackShell.clientHeight));
    const rackDrivenFloor=Math.max(28,Math.min(56,Math.floor(Math.min(settledRackWidth,rackHeight)*0.08)));
    layout=buildRackLayout(rackPieces,settledRackWidth,rackHeight,false,rackDrivenFloor);
    layout=centerRackLayout(layout,rackPieces,settledRackWidth,rackHeight,6);
    rackShell.style.height='';
    rackShell.style.minHeight='0px';
  } else {
    rackShell.style.height='';
    rackShell.style.minHeight='0px';
    const rackWidth=Math.max(80,rackShell.clientWidth || rack.getBoundingClientRect().width);
    const rackHeight=Math.max(120,rackShell.clientHeight || rack.getBoundingClientRect().height);
    const landscapeViewport=getResponsiveViewport();
    const landscapeMinCell=(landscapeViewport.width<1000 || landscapeViewport.height<720) ? 14 : 18;
    layout=buildRackLayout(rackPieces,rackWidth,rackHeight,true,landscapeMinCell);
  }

  rackPieces.forEach((p)=>{
    const pos=layout.map.get(p.id);
    if(!pos) return;
    const el=pieceElement(p,pos.cell,'rack');
    if(state.hintInUse && state.hintSelectedId===p.id) el.classList.add('hint-selected-piece');
    el.style.left=pos.x+'px';
    el.style.top=pos.y+'px';
    el.style.transform='none';
    rack.appendChild(el);
  });
  for(const [id,pos] of state.placed){
    const p=state.pieces.find(x=>x.id===id); if(!p) continue;
    const el=pieceElement(p,cell,'board');
    el.style.left=(pos.c*cell)+'px'; el.style.top=(pos.r*cell)+'px';
    if(animateAnchors && state.anchors.has(id)) el.classList.add('anchor-arrive');
    board.parentElement.appendChild(el);
  }
  if(state.hintInUse) activateCompatiblePieceGuides();
  updateHintInstruction();
  const conflictCount=validate();
  updateStats();
  if(conflictCount===0) checkForLevelCompletion();
}


Object.assign(app,{renderAll});
export {renderAll};
