(function(){
'use strict';
const {app}=SuJiModules.require('js/core/app-context.js');
const {makeSudoku}=SuJiModules.require('js/game/sudoku-generator.js');
const {makePieces}=SuJiModules.require('js/game/puzzle-builder.js');
const {sujiPatternForLevel}=SuJiModules.require('js/data/pattern-provider.js');
const {getFrozenLevel}=SuJiModules.require('js/levels/frozen/frozen-level-data.js');
const $=s=>document.querySelector(s), root=$('#cards'), status=$('#status');
const packEl=$('#pack'), levelEl=$('#level'), boardCmEl=$('#boardCm'), imageEl=$('#image'), cardWEl=$('#cardW'), cardHEl=$('#cardH'), pictureEl=$('#picture');
const packs=(Array.isArray(window.SuJiPrintPacks)&&window.SuJiPrintPacks.length?window.SuJiPrintPacks:[{id:'regular',name:'Regular',minLevel:1,maxLevel:9999,engineLevelOffset:0,imageTemplate:'resources/Image_{engineLevel4}.png'}]);
let uploadURL=null;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const pad4=n=>String(n).padStart(4,'0');
const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function activePack(){return packs.find(p=>String(p.id)===packEl.value)||packs[0]}
function displayLevels(pack){
  if(Array.isArray(pack.levels)&&pack.levels.length)return pack.levels.map(Number).filter(Number.isFinite);
  const min=Number.isFinite(+pack.minLevel)?+pack.minLevel:1,max=Number.isFinite(+pack.maxLevel)?+pack.maxLevel:100;
  return Array.from({length:Math.max(1,Math.min(max-min+1,100))},(_,i)=>min+i);
}
function engineLevel(pack,displayLevel){
  if(pack.engineLevels&&Object.prototype.hasOwnProperty.call(pack.engineLevels,displayLevel))return +pack.engineLevels[displayLevel];
  return displayLevel+(+pack.engineLevelOffset||0);
}
function imagePath(pack,displayLevel,eng){
  const tpl=pack.imageTemplate||'resources/Image_{engineLevel4}.png';
  return tpl.replaceAll('{level}',String(displayLevel)).replaceAll('{level4}',pad4(displayLevel)).replaceAll('{engineLevel}',String(eng)).replaceAll('{engineLevel4}',pad4(eng));
}
function initPacks(){
  packEl.innerHTML=packs.map(p=>`<option value="${esc(p.id)}">${esc(p.name||p.id)}</option>`).join('');
  refreshLevels(false);
}
function refreshLevels(rebuild=true){
  const old=+levelEl.value||1, levels=displayLevels(activePack());
  levelEl.innerHTML=levels.map(n=>`<option value="${n}">${String(n).padStart(4,'0')}</option>`).join('');
  levelEl.value=levels.includes(old)?String(old):String(levels[0]);
  if(rebuild)build();
}
function bounds(cells){const r=cells.map(x=>x[0]),c=cells.map(x=>x[1]);return{minR:Math.min(...r),maxR:Math.max(...r),minC:Math.min(...c),maxC:Math.max(...c)}}
function norm(cells){const b=bounds(cells);return cells.map(([r,c])=>[r-b.minR,c-b.minC])}
function rotateCells(cells,t){let out=norm(cells);while(t--){const h=Math.max(...out.map(x=>x[0]))+1;out=norm(out.map(([r,c])=>[c,h-1-r]));}return out}
function rotateTiles(piece,t){let out=piece.tiles.map(x=>({r:x.dr,c:x.dc,n:x.n,srcR:x.srcR,srcC:x.srcC}));while(t--){const h=Math.max(...out.map(x=>x.r))+1;out=out.map(x=>({...x,r:x.c,c:h-1-x.r}));const mr=Math.min(...out.map(x=>x.r)),mc=Math.min(...out.map(x=>x.c));out=out.map(x=>({...x,r:x.r-mr,c:x.c-mc}));}return out}
function chooseRotation(piece,w,h,tile){return[0,1,2,3].map(turns=>{const cells=rotateCells(piece.cells,turns),b=bounds(cells),pw=(b.maxC+1)*tile,ph=(b.maxR+1)*tile,fit=pw<=w-10&&ph<=h-10;return{turns,cells,pw,ph,fit,score:(fit?0:1e4)+pw*ph+ph*.6}}).sort((a,b)=>a.score-b.score)[0]}
function makePiece(piece,rot,tile,img,show,locked=false){const tiles=rotateTiles(piece,rot.turns),el=document.createElement('div');el.className='piece';const mr=Math.max(...tiles.map(x=>x.r)),mc=Math.max(...tiles.map(x=>x.c));const angle=rot.turns*90,lockTile=locked?lockTileForPiece(piece):null;el.style.width=`${(mc+1)*tile}mm`;el.style.height=`${(mr+1)*tile}mm`;for(const t of tiles){const c=document.createElement('div');c.className='cell';c.style.left=`${t.c*tile}mm`;c.style.top=`${t.r*tile}mm`;const face=document.createElement('div');face.className='face'+(show&&img?' pic':'');face.style.transform=`rotate(${angle}deg)`;if(show&&img){face.style.backgroundImage=`url("${img}")`;face.style.backgroundSize=`${tile*9}mm ${tile*9}mm`;face.style.backgroundPosition=`-${t.srcC*tile}mm -${t.srcR*tile}mm`}if(sameSourceTile(t,lockTile))face.appendChild(makePrintLock());const d=document.createElement('span');d.className='digit';d.textContent=t.n;face.appendChild(d);c.appendChild(face);el.appendChild(c)}return{el,rows:mr+1,cols:mc+1}}
function allocate(pieces){
  if(pieces.length>22)throw new Error(`Level has ${pieces.length} pieces; with Card 12 reserved for the guide, the 11 shape cards can hold at most 22 shapes.`);
  const cards=Array.from({length:11},()=>[]),sorted=[...pieces].sort((a,b)=>{const A=bounds(a.cells),B=bounds(b.cells);return((B.maxR+1)*(B.maxC+1)-(A.maxR+1)*(A.maxC+1))||a.id-b.id});
  for(let i=0;i<Math.min(11,sorted.length);i++)cards[i].push(sorted[i]);
  for(let i=11;i<sorted.length;i++)cards[i-11].push(sorted[i]);
  return cards;
}
function chooseStarterAnchors(level,rackOrderedPieces,hints=3){
  // IMPORTANT: this must mirror the digital game's chooseAnchors() exactly.
  // makePieces() returns state.pieces in deterministic rack order; the second
  // seeded shuffle is then applied to that rack-ordered candidate list.
  const candidates=rackOrderedPieces.filter(p=>p.cells.length>1);
  const rng=app.mulberry32((level*1103515245 + hints*9973)>>>0);
  return new Set(app.shuffle(candidates,rng).slice(0,hints).map(p=>p.id));
}
function lockTileForPiece(piece){
  // IMPORTANT: mirror js/ui/piece-view.js exactly.
  // The locked tile is the first tile nearest the geometric centre of the
  // piece bounding box. Ties intentionally keep piece.tiles iteration order.
  const rows=Math.max(...piece.tiles.map(t=>t.dr))+1;
  const cols=Math.max(...piece.tiles.map(t=>t.dc))+1;
  const centreR=rows/2;
  const centreC=cols/2;
  let lockTile=null;
  let bestDistance=Infinity;
  for(const t of piece.tiles){
    const dr=(t.dr+.5)-centreR;
    const dc=(t.dc+.5)-centreC;
    const distance=(dr*dr)+(dc*dc);
    if(distance<bestDistance){
      bestDistance=distance;
      lockTile=t;
    }
  }
  return lockTile;
}

function sameSourceTile(a,b){
  return !!a && !!b && a.srcR===b.srcR && a.srcC===b.srcC;
}

function makePrintLock(className='card-piece-lock'){
  const lock=document.createElement('span');
  lock.className=className;
  lock.setAttribute('aria-hidden','true');
  lock.textContent='🔒';
  return lock;
}

function renderStrip(card,cls,piece,ctx){
  const s=document.createElement('div');s.className=`strip ${cls}`;card.appendChild(s);
  if(!piece){s.innerHTML='<div class="empty">Unused shape slot<br>Card 12 is now the guide card</div>';return}
  const title=document.createElement('div');title.className='strip-title';title.textContent=`Shape ${piece.id+1} · ${piece.type}`;s.appendChild(title);
  const sw=ctx.w-6,sh=cls==='single'?ctx.h-30:(ctx.h-24)/2,rot=chooseRotation(piece,sw,sh,ctx.tile);
  if(!rot.fit)ctx.tooLarge.push(`Shape ${piece.id+1}`);
  const isLocked=!!(ctx.anchorIdSet && ctx.anchorIdSet.has(piece.id));
  const built=makePiece(piece,rot,ctx.tile,ctx.img,ctx.show,isLocked),pw=built.cols*ctx.tile,ph=built.rows*ctx.tile,x=clamp((sw-pw)/2,2,Math.max(2,sw-pw-2)),y=clamp((sh-ph)/2+1.5,5,Math.max(5,sh-ph-2));
  built.el.style.left=`${x}mm`;built.el.style.top=`${y}mm`;
  if(isLocked) built.el.classList.add('locked-piece');
  s.appendChild(built.el);
}
function renderShapeCard(pieces,i,ctx){
  const c=document.createElement('article');c.className='card';
  c.innerHTML=`<div class="head"><span>SuJi · Cut &amp; Play</span><small>${esc(ctx.pack.name)} · Level ${pad4(ctx.displayLevel)} · ${String(i+1).padStart(2,'0')}/14</small></div>`;
  if(pieces.length===2){const sep=document.createElement('div');sep.className='separator';sep.innerHTML='<span class="sep-scissor" aria-hidden="true">✂</span>';c.appendChild(sep);renderStrip(c,'a',pieces[0],ctx);renderStrip(c,'b',pieces[1],ctx)}
  else renderStrip(c,'single',pieces[0]||null,ctx);
  const f=document.createElement('div');f.className='foot';f.innerHTML='<span></span><span>Digits show play orientation</span>';c.appendChild(f);return c
}
function renderMiniLockedBoard(ctx){
  const wrap=document.createElement('div');wrap.className='locked-guide-wrap';
    const board=document.createElement('div');board.className='mini-board locked-mini-board';
  for(let r=0;r<9;r++)for(let c=0;c<9;c++){
    const cell=document.createElement('div');cell.className='mini-cell';
    if(c===2||c===5)cell.classList.add('block-right');
    if(r===2||r===5)cell.classList.add('block-bottom');
    board.appendChild(cell);
  }
  ctx.anchorPieces.forEach(piece=>{
    const lockTile=lockTileForPiece(piece);
    piece.tiles.forEach(t=>{
      const cell=document.createElement('div');cell.className='locked-piece-cell';
      cell.style.left=`calc((100% / 9) * ${t.srcC})`;
      cell.style.top=`calc((100% / 9) * ${t.srcR})`;
      if(ctx.img){
        cell.style.backgroundImage=`url("${ctx.img}")`;
        cell.style.backgroundSize='900% 900%';
        cell.style.backgroundPosition=`${(t.srcC/8)*100}% ${(t.srcR/8)*100}%`;
      }
      if(sameSourceTile(t,lockTile))cell.appendChild(makePrintLock('mini-piece-lock'));
      const d=document.createElement('span');d.className='mini-digit';d.textContent=t.n;cell.appendChild(d);
      board.appendChild(cell);
    });
  });
  wrap.appendChild(board);return wrap;
}
function renderGuideCard(ctx){
  const c=document.createElement('article');c.className='card info-card guide-card';
  c.innerHTML=`<div class="head"><span>SuJi · Locked Shapes Guide</span><small>${esc(ctx.pack.name)} · Level ${pad4(ctx.displayLevel)} · 12/14</small></div>`;
  const body=document.createElement('div');body.className='guide-only-body';
  const guidePanel=document.createElement('section');guidePanel.className='info-panel guide-board-panel guide-only-panel';
  const guideTitle=document.createElement('div');guideTitle.className='info-title';guideTitle.textContent='Place these padlocked starter shapes first';guidePanel.appendChild(guideTitle);
  guidePanel.appendChild(renderMiniLockedBoard(ctx));
  body.appendChild(guidePanel);
  c.appendChild(body);
  const f=document.createElement('div');f.className='foot';f.innerHTML='<span>Locked starter positions</span><span>Card 12</span>';c.appendChild(f);return c;
}
function renderPictureCard(ctx){
  const c=document.createElement('article');c.className='card solved-card picture-card';
  c.innerHTML=`<div class="head"><span>SuJi · Picture Reference</span><small>${esc(ctx.pack.name)} · Level ${pad4(ctx.displayLevel)} · 13/14</small></div>`;
  const body=document.createElement('div');body.className='solved-body picture-body';
  const title=document.createElement('div');title.className='solved-title picture-title';title.textContent=pictureTitle(ctx.pack,ctx.displayLevel);body.appendChild(title);
  const art=document.createElement('div');art.className='picture-reference';
  if(ctx.img){art.style.backgroundImage=`url("${ctx.img}")`;} else {art.innerHTML='<span>No picture available for this level</span>';}
  body.appendChild(art);
  const note=document.createElement('div');note.className='solved-note';note.textContent='Picture only — no Sudoku numbers are shown on this card.';body.appendChild(note);
  c.appendChild(body);const f=document.createElement('div');f.className='foot';f.innerHTML='<span>Picture card</span><span>Card 13</span>';c.appendChild(f);return c;
}


function renderRulesCard(ctx){
  const c=document.createElement('article');c.className='card info-card rules-card';
  c.innerHTML=`<div class="head"><span>SuJi · How to Play</span><small>${esc(ctx.pack.name)} · Level ${pad4(ctx.displayLevel)} · 14/14</small></div>`;
  const body=document.createElement('div');body.className='rules-only-body';
  const panel=document.createElement('section');panel.className='info-panel rules-only-panel';
  const title=document.createElement('div');title.className='info-title';title.textContent='Rules';panel.appendChild(title);
  const ul=document.createElement('ul');ul.className='rules';
  ul.innerHTML='    <li>Start by placing the <b>padlocked shapes</b> first, exactly where Card 12 shows them.</li>    <li>Then place all remaining shapes to complete the 9×9 board and rebuild the picture.</li>    <li>Every <b>row</b> must contain the digits 1 to 9 exactly once.</li>    <li>Every <b>column</b> must contain the digits 1 to 9 exactly once.</li>    <li>Every bold <b>3×3 box</b> must also contain the digits 1 to 9 exactly once.</li>    <li>Keep the digits upright: shapes do <b>not rotate</b> during play.</li>    <li>The picture helps, but the Sudoku rules decide whether a shape truly fits.</li>';
  panel.appendChild(ul);
  body.appendChild(panel);
  c.appendChild(body);
  const f=document.createElement('div');f.className='foot';f.innerHTML='<span>Rules card</span><span>Card 14</span>';c.appendChild(f);return c;
}

function pictureTitle(pack,displayLevel){
  const key=`${String(pack.id).toLowerCase()}:${displayLevel}`;
  const titles={
    'regular:1':'SuJi Face',
    'regular:2':'Cat',
    'regular:3':'Flag of Germany',
    'regular:4':'Flag of France',
    'regular:5':'Dog'
  };
  return titles[key]||`${pack.name} Picture`;
}

function renderBoard(ctx){
  const board=$('#board'); board.replaceChildren();
  for(let r=0;r<9;r++)for(let c=0;c<9;c++){const cell=document.createElement('div');cell.className='board-cell';if(c===2||c===5)cell.classList.add('block-right');if(r===2||r===5)cell.classList.add('block-bottom');board.appendChild(cell)}
  $('#boardLabel').textContent=`${ctx.pack.name} · Level ${pad4(ctx.displayLevel)}`;
  $('#boardSizeLabel').textContent=`${ctx.boardCm.toFixed(1)} cm × ${ctx.boardCm.toFixed(1)} cm`;
  $('#cardScaleLabel').textContent=`Cell / shape unit: ${ctx.tile.toFixed(3)} mm`;
}
function loadImage(url){return new Promise(r=>{if(!url)return r(null);const i=new Image();i.onload=()=>r(url);i.onerror=()=>r(null);i.src=url})}
async function build(){try{
  status.className='status';status.textContent='Building…';
  const pack=activePack(),displayLevel=+levelEl.value||displayLevels(pack)[0],level=engineLevel(pack,displayLevel),boardCm=clamp(+boardCmEl.value||18,9,60),boardMm=boardCm*10,tile=boardMm/9,w=clamp(+cardWEl.value||100,70,210),h=clamp(+cardHEl.value||135,90,297);
  document.documentElement.style.setProperty('--board-side',`${boardMm}mm`);document.documentElement.style.setProperty('--card-w',`${w}mm`);document.documentElement.style.setProperty('--card-h',`${h}mm`);document.documentElement.style.setProperty('--tile',`${tile}mm`);
  const frozen=getFrozenLevel(level),sudoku=frozen?frozen.sudoku.map(row=>row.slice()):makeSudoku(level),rackPieces=makePieces(level,sudoku),pieces=[...rackPieces].sort((a,b)=>a.id-b.id),pattern=frozen?{id:frozen.patternId}:sujiPatternForLevel(level),cards=allocate(pieces);
  let img=uploadURL || await loadImage(imagePath(pack,displayLevel,level));
  const anchorIds=chooseStarterAnchors(level,rackPieces,3);
  const ctx={pack,displayLevel,level,boardCm,boardMm,w,h,tile,img,show:pictureEl.checked,sudoku,tooLarge:[],anchorIdSet:anchorIds,anchorPieces:pieces.filter(p=>anchorIds.has(p.id)).sort((a,b)=>a.id-b.id)};
  renderBoard(ctx);root.replaceChildren(...cards.map((x,i)=>renderShapeCard(x,i,ctx)),renderGuideCard(ctx),renderPictureCard(ctx),renderRulesCard(ctx));
  const pairs=cards.filter(x=>x.length===2).length,singles=cards.filter(x=>x.length===1).length,warn=[...new Set(ctx.tooLarge)];
  status.textContent=`${pack.name} · Level ${pad4(displayLevel)} · Engine level ${pad4(level)} · Pattern ${pattern.id} · Board ${boardCm.toFixed(1)} cm · Cell ${tile.toFixed(3)} mm · ${pieces.length} shapes → 11 shape cards + Card 12 locked-shape guide + Card 13 picture + Card 14 rules (${pairs} two-shape, ${singles} one-shape). ${img?'Picture loaded.':'Picture unavailable.'}${warn.length?` WARNING: ${warn.join(', ')} do not fit the current card dimensions at this board size. Increase card width/height.`:''}`;
  if(warn.length)status.className='status warn';
}catch(e){console.error(e);status.className='status error';status.textContent=e.message||String(e)}}
function doPrint(mode){document.body.dataset.print=mode;requestAnimationFrame(()=>requestAnimationFrame(()=>{window.print();setTimeout(()=>delete document.body.dataset.print,300)}))}
imageEl.addEventListener('change',()=>{if(uploadURL)URL.revokeObjectURL(uploadURL);uploadURL=imageEl.files&&imageEl.files[0]?URL.createObjectURL(imageEl.files[0]):null;build()});
packEl.addEventListener('change',()=>refreshLevels(true));
[levelEl,boardCmEl,cardWEl,cardHEl,pictureEl].forEach(x=>x.addEventListener('change',build));
$('#build').onclick=build;$('#printBoard').onclick=()=>doPrint('board');$('#printCards').onclick=()=>doPrint('cards');$('#printAll').onclick=()=>doPrint('all');
initPacks();build();
})();
