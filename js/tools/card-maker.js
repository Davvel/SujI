(function(){
'use strict';
const {makeSudoku}=SuJiModules.require('js/game/sudoku-generator.js');
const {makePieces}=SuJiModules.require('js/game/puzzle-builder.js');
const {sujiPatternForLevel}=SuJiModules.require('js/data/pattern-provider.js');
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
  // Avoid creating thousands of options. Regular defaults to the first 100 printable levels.
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
function boundary(cells){const set=new Set(cells.map(([r,c])=>`${r},${c}`)),e=[];for(const[r,c]of cells){if(!set.has(`${r-1},${c}`))e.push({o:'h',v:r,a:c,b:c+1});if(!set.has(`${r+1},${c}`))e.push({o:'h',v:r+1,a:c,b:c+1});if(!set.has(`${r},${c-1}`))e.push({o:'v',v:c,a:r,b:r+1});if(!set.has(`${r},${c+1}`))e.push({o:'v',v:c+1,a:r,b:r+1});}const g=new Map();for(const x of e){const k=`${x.o}:${x.v}`;(g.get(k)||g.set(k,[]).get(k)).push(x)}const out=[];for(const list of g.values()){list.sort((a,b)=>a.a-b.a);let cur={...list[0]};for(let i=1;i<list.length;i++){if(list[i].a===cur.b)cur.b=list[i].b;else{out.push(cur);cur={...list[i]}}}out.push(cur)}return out}
function outlinePath(cells,x,y,s){return boundary(cells).map(e=>e.o==='h'?`M ${x+e.a*s} ${y+e.v*s} L ${x+e.b*s} ${y+e.v*s}`:`M ${x+e.v*s} ${y+e.a*s} L ${x+e.v*s} ${y+e.b*s}`).join(' ')}
function seamBlocked(cells,o,v,a,b){const set=new Set(cells.map(([r,c])=>`${r},${c}`));if(o==='h'){for(let c=Math.floor(a);c<Math.ceil(b);c++){if(c>=a&&c<b&&set.has(`${v-1},${c}`)&&set.has(`${v},${c}`))return true}}else{for(let r=Math.floor(a);r<Math.ceil(b);r++){if(r>=a&&r<b&&set.has(`${r},${v-1}`)&&set.has(`${r},${v}`))return true}}return false}
function access(seg,cells,cols,rows){if(seg.o==='h'){const leftOk=!seamBlocked(cells,'h',seg.v,0,seg.a),rightOk=!seamBlocked(cells,'h',seg.v,seg.b,cols),left=seg.a,right=cols-seg.b;if(leftOk&&rightOk)return left<=right?{start:'left'}:{start:'right'};if(leftOk)return{start:'left'};if(rightOk)return{start:'right'};return null}const topOk=!seamBlocked(cells,'v',seg.v,0,seg.a),bottomOk=!seamBlocked(cells,'v',seg.v,seg.b,rows),top=seg.a,bottom=rows-seg.b;if(topOk&&bottomOk)return top<=bottom?{start:'top'}:{start:'bottom'};if(topOk)return{start:'top'};if(bottomOk)return{start:'bottom'};return null}
function makePiece(piece,rot,tile,img,show){const tiles=rotateTiles(piece,rot.turns),el=document.createElement('div');el.className='piece';const mr=Math.max(...tiles.map(x=>x.r)),mc=Math.max(...tiles.map(x=>x.c));el.style.width=`${(mc+1)*tile}mm`;el.style.height=`${(mr+1)*tile}mm`;for(const t of tiles){const c=document.createElement('div');c.className='cell'+(show&&img?' pic':'');c.style.left=`${t.c*tile}mm`;c.style.top=`${t.r*tile}mm`;if(show&&img){c.style.backgroundImage=`url("${img}")`;c.style.backgroundSize=`${tile*9}mm ${tile*9}mm`;c.style.backgroundPosition=`-${t.srcC*tile}mm -${t.srcR*tile}mm`}const d=document.createElement('span');d.className='digit';d.textContent=t.n;c.appendChild(d);el.appendChild(c)}return{el,rows:mr+1,cols:mc+1}}
function addOverlay(strip,rot,x,y,tile,sw,sh,start){const NS='http://www.w3.org/2000/svg',svg=document.createElementNS(NS,'svg');svg.classList.add('cut');svg.setAttribute('viewBox',`0 0 ${sw} ${sh}`);svg.setAttribute('preserveAspectRatio','none');const b=bounds(rot.cells),cols=b.maxC+1,rows=b.maxR+1;const p=document.createElementNS(NS,'path');p.setAttribute('class','outline');p.setAttribute('d',outlinePath(rot.cells,x,y,tile));svg.appendChild(p);const segs=boundary(rot.cells).sort((a,b)=>((a.o==='h'?a.v:(a.a+a.b)/2)-(b.o==='h'?b.v:(b.a+b.b)/2))||((a.o==='v'?a.v:(a.a+a.b)/2)-(b.o==='v'?b.v:(b.a+b.b)/2)));let n=start;for(const seg of segs){const ac=access(seg,rot.cells,cols,rows);if(!ac)continue;const l=document.createElementNS(NS,'line'),tx=document.createElementNS(NS,'text'),sc=document.createElementNS(NS,'text');let x1,y1,x2,y2,lx,ly,sx,sy;if(seg.o==='h'){y1=y2=y+seg.v*tile;if(ac.start==='left'){x1=0;x2=x+seg.b*tile;lx=x+seg.a*tile-2;sx=1.2}else{x1=x+seg.a*tile;x2=sw;lx=x+seg.b*tile+1;sx=sw-4}ly=y1-1;sy=y1-1}else{x1=x2=x+seg.v*tile;if(ac.start==='top'){y1=0;y2=y+seg.b*tile;ly=y+seg.a*tile-1;sy=3.5}else{y1=y+seg.a*tile;y2=sh;ly=y+seg.b*tile+3;sy=sh-1.5}lx=x1+1;sx=x1+1}l.setAttribute('class','guide');for(const[k,v]of Object.entries({x1,y1,x2,y2}))l.setAttribute(k,v);svg.appendChild(l);tx.setAttribute('class','num');tx.setAttribute('x',lx);tx.setAttribute('y',ly);tx.textContent=n++;svg.appendChild(tx);sc.setAttribute('class','sc');sc.setAttribute('x',sx);sc.setAttribute('y',sy);sc.textContent='✂';svg.appendChild(sc)}strip.appendChild(svg);return n}
function allocate(pieces){if(pieces.length>24)throw new Error(`Level has ${pieces.length} pieces; physical standard allows at most 24.`);const cards=Array.from({length:12},()=>[]),sorted=[...pieces].sort((a,b)=>{const A=bounds(a.cells),B=bounds(b.cells);return((B.maxR+1)*(B.maxC+1)-(A.maxR+1)*(A.maxC+1))||a.id-b.id});for(let i=0;i<Math.min(12,sorted.length);i++)cards[i].push(sorted[i]);for(let i=12;i<sorted.length;i++)cards[i-12].push(sorted[i]);return cards}
function renderStrip(card,cls,piece,ctx,start){const s=document.createElement('div');s.className=`strip ${cls}`;card.appendChild(s);if(!piece){s.innerHTML='<div class="empty">Spare cutting area<br>12-card pack standard</div>';return start}const title=document.createElement('div');title.className='strip-title';title.textContent=`Shape ${piece.id+1} · ${piece.type}`;s.appendChild(title);const sw=ctx.w-6,sh=cls==='single'?ctx.h-30:(ctx.h-24)/2,rot=chooseRotation(piece,sw,sh,ctx.tile);if(!rot.fit)ctx.tooLarge.push(`Shape ${piece.id+1}`);const built=makePiece(piece,rot,ctx.tile,ctx.img,ctx.show),pw=built.cols*ctx.tile,ph=built.rows*ctx.tile,x=clamp((sw-pw)/2,2,Math.max(2,sw-pw-2)),y=clamp((sh-ph)/2+1.5,5,Math.max(5,sh-ph-2));built.el.style.left=`${x}mm`;built.el.style.top=`${y}mm`;s.appendChild(built.el);return addOverlay(s,rot,x,y,ctx.tile,sw,sh,start)}
function renderCard(pieces,i,ctx){const c=document.createElement('article');c.className='card';c.innerHTML=`<div class="head"><span>SuJi · Cut &amp; Play</span><small>${esc(ctx.pack.name)} · Level ${pad4(ctx.displayLevel)} · ${String(i+1).padStart(2,'0')}/12</small></div>`;if(pieces.length===2){const sep=document.createElement('div');sep.className='separator';c.appendChild(sep);let n=2;n=renderStrip(c,'a',pieces[0],ctx,n);renderStrip(c,'b',pieces[1],ctx,n)}else renderStrip(c,'single',pieces[0]||null,ctx,1);const f=document.createElement('div');f.className='foot';f.innerHTML='<span>✂ Cut in number order</span><span>Digits show play orientation</span>';c.appendChild(f);return c}
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
  const sudoku=makeSudoku(level),pieces=makePieces(level,sudoku).sort((a,b)=>a.id-b.id),pattern=sujiPatternForLevel(level),cards=allocate(pieces);
  let img=uploadURL;if(!img&&pictureEl.checked)img=await loadImage(imagePath(pack,displayLevel,level));
  const ctx={pack,displayLevel,level,boardCm,boardMm,w,h,tile,img,show:pictureEl.checked,tooLarge:[]};
  renderBoard(ctx);root.replaceChildren(...cards.map((x,i)=>renderCard(x,i,ctx)));
  const pairs=cards.filter(x=>x.length===2).length,singles=cards.filter(x=>x.length===1).length,warn=[...new Set(ctx.tooLarge)];
  status.textContent=`${pack.name} · Level ${pad4(displayLevel)} · Engine level ${pad4(level)} · Pattern ${pattern.id} · Board ${boardCm.toFixed(1)} cm · Cell ${tile.toFixed(3)} mm · ${pieces.length} shapes → 12 cards (${pairs} two-shape, ${singles} one-shape). ${img?'Picture loaded.':'Number-only preview.'}${warn.length?` WARNING: ${warn.join(', ')} do not fit the current card dimensions at this board size. Increase card width/height.`:''}`;
  if(warn.length)status.className='status warn';
}catch(e){console.error(e);status.className='status error';status.textContent=e.message||String(e)}}
function doPrint(mode){document.body.dataset.print=mode;requestAnimationFrame(()=>requestAnimationFrame(()=>{window.print();setTimeout(()=>delete document.body.dataset.print,300)}))}
imageEl.addEventListener('change',()=>{if(uploadURL)URL.revokeObjectURL(uploadURL);uploadURL=imageEl.files&&imageEl.files[0]?URL.createObjectURL(imageEl.files[0]):null;build()});
packEl.addEventListener('change',()=>refreshLevels(true));
[levelEl,boardCmEl,cardWEl,cardHEl,pictureEl].forEach(x=>x.addEventListener('change',build));
$('#build').onclick=build;$('#printBoard').onclick=()=>doPrint('board');$('#printCards').onclick=()=>doPrint('cards');$('#printAll').onclick=()=>doPrint('all');
initPacks();build();
})();
