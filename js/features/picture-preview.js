/** SuJi classic-compatible module wrapper. Source owner: js/features/picture-preview.js */
SuJiModules.define("js/features/picture-preview.js", function(require, exports){
'use strict';
/**
 * SuJi Module: features/picture-preview
 * Migrated from the accepted 1.27.0 implementation with function bodies preserved.
 */
const {app} = require("js/core/app-context.js");
const {state} = require("js/core/state.js");
const {$, $$, board, rack} = require("js/core/dom.js");
const {TYPE_COLORS, TUTORIAL_LEVELS, RULE_COPY, GAME_CONFIG} = require("config/game-config.js");
const {UI_CONFIG} = require("config/ui-config.js");
const {STORAGE_KEYS} = require("config/storage-keys.js");
const padLevel=(...args)=>app.padLevel(...args);

function clearPicturePreviewTimer(){
  if(state.picturePreviewTimer){
    clearTimeout(state.picturePreviewTimer);
    state.picturePreviewTimer=null;
  }
}

function updatePicturePreviewButton(){
  const btn=$('#picturePreviewBtn');
  if(!btn) return;
  const ready=!!state.imageURL;
  btn.disabled=!ready;
  btn.classList.toggle('ready',ready);
}

function closePicturePreview(){
  clearPicturePreviewTimer();
  const overlay=$('#picturePreviewOverlay');
  if(!overlay) return;
  overlay.hidden=true;
  overlay.setAttribute('aria-hidden','true');
  overlay.classList.remove('show','auto-mode','leaving');
}

function resolvePicturePreviewPromise(){
  if(state.picturePreviewResolver){
    const resolve=state.picturePreviewResolver;
    state.picturePreviewResolver=null;
    resolve();
  }
}

function bumpPicturePreviewButton(){
  const btn=$('#picturePreviewBtn');
  if(!btn) return;
  btn.classList.remove('arrival');
  void btn.offsetWidth;
  btn.classList.add('arrival');
}

function previewTransformFromButton(card,btn){
  const end=card.getBoundingClientRect();
  const start=btn ? btn.getBoundingClientRect() : {left:end.left+end.width/2,top:end.top+end.height/2,width:1,height:1};
  const startCx=start.left+start.width/2;
  const startCy=start.top+start.height/2;
  const endCx=end.left+end.width/2;
  const endCy=end.top+end.height/2;
  const dx=startCx-endCx;
  const dy=startCy-endCy;
  const scale=Math.max(.035, Math.min(start.width/end.width,start.height/end.height));
  return {dx,dy,scale};
}

function animatePicturePreviewToButton(resolve){
  const overlay=$('#picturePreviewOverlay');
  const card=$('#picturePreviewCard');
  const btn=$('#picturePreviewBtn');
  if(!overlay || !card || !btn){ closePicturePreview(); resolve?.(); return; }
  const {dx,dy,scale}=previewTransformFromButton(card,btn);
  overlay.classList.add('leaving');
  card.getAnimations().forEach(a=>a.cancel());
  const anim=card.animate([
    { transform:'translate3d(0,0,0) scale(1)', opacity:1 },
    { transform:`translate3d(${dx}px,${dy}px,0) scale(${scale})`, opacity:.16 }
  ], {
    duration:680,
    easing:'cubic-bezier(.36,0,.22,1)',
    fill:'forwards'
  });
  anim.onfinish=()=>{
    anim.cancel();
    card.style.transform='';
    card.style.opacity='';
    closePicturePreview();
    bumpPicturePreviewButton();
    resolve?.();
  };
}

function picturePreviewAnimationActive(){
  // Manual picture opening still uses the polished zoom effect. Automatic opening
  // is controlled separately so previously visited levels do not replay the intro.
  return true;
}

function requestClosePicturePreview(){
  if(!picturePreviewAnimationActive()){
    closePicturePreview();
    resolvePicturePreviewPromise();
    return;
  }
  animatePicturePreviewToButton(()=>{ resolvePicturePreviewPromise(); });
}

function picturePreviewTitle(level){
  const titles={
    1:'Picture Puzzle',
    2:'Cat Puzzle',
    3:'Flag of Germany Puzzle',
    4:'Flag of France Puzzle',
    5:'Dog Puzzle'
  };
  return titles[level] || `Level ${padLevel(level)} Puzzle`;
}

async function showPicturePreview(){
  if(!state.imageURL) return Promise.resolve();
  resolvePicturePreviewPromise();
  const overlay=$('#picturePreviewOverlay');
  const img=$('#picturePreviewImage');
  const card=$('#picturePreviewCard');
  const title=$('#picturePreviewTitle');
  const btn=$('#picturePreviewBtn');
  if(!overlay || !img || !card) return Promise.resolve();
  if(title) title.textContent=picturePreviewTitle(state.level);
  clearPicturePreviewTimer();

  // Decode the completed picture before beginning the zoom. This prevents the
  // browser from doing image decode/layout work halfway through the animation.
  if(img.src !== new URL(state.imageURL, document.baseURI).href){
    img.src=state.imageURL;
  }
  try{
    if(img.decode) await img.decode();
    else if(!img.complete) await new Promise(resolve=>img.addEventListener('load',resolve,{once:true}));
  }catch(_){ /* image can still be displayed even if decode() rejects */ }

  overlay.hidden=false;
  overlay.setAttribute('aria-hidden','false');
  overlay.classList.remove('leaving');
  overlay.classList.add('show');

  // The final window already has its full layout size. Only transform/opacity
  // change, keeping the animation on the compositor and avoiding layout thrash.
  card.getAnimations().forEach(a=>a.cancel());
  card.style.animation='none';
  card.style.transition='none';
  card.style.visibility='visible';
  card.style.transform='none';
  card.style.opacity='1';

  // The icon-to-window animation is tutorial-only. From Level 6 onward the
  // reference picture opens immediately, without the introductory zoom effect.
  if(!picturePreviewAnimationActive()){
    return new Promise(resolve=>{ state.picturePreviewResolver=resolve; });
  }

  // Measure the stable final geometry, then convert the icon geometry into a
  // translate+scale transform relative to that final centered rectangle.
  const {dx,dy,scale}=previewTransformFromButton(card,btn);
  const startTransform=`translate3d(${dx}px,${dy}px,0) scale(${scale})`;
  card.style.transform=startTransform;
  card.style.opacity='1';

  // Force the start transform to be committed before transitioning to full size.
  void card.offsetWidth;
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));

  const anim=card.animate([
    { transform:startTransform, opacity:1 },
    { transform:'translate3d(0,0,0) scale(1)', opacity:1 }
  ], {
    duration:560,
    easing:'cubic-bezier(.20,.78,.24,1)',
    fill:'forwards'
  });
  try{ await anim.finished; }catch(_){}
  anim.cancel();
  card.style.transform='translate3d(0,0,0) scale(1)';
  card.style.opacity='1';

  return new Promise(resolve=>{ state.picturePreviewResolver=resolve; });
}


Object.assign(app,{clearPicturePreviewTimer,updatePicturePreviewButton,closePicturePreview,resolvePicturePreviewPromise,bumpPicturePreviewButton,previewTransformFromButton,animatePicturePreviewToButton,picturePreviewAnimationActive,requestClosePicturePreview,picturePreviewTitle,showPicturePreview});

function initPicturePreview(){
  const btn=$('#picturePreviewBtn'); if(btn) btn.onclick=()=>{ showPicturePreview(); };
  const close=$('#picturePreviewClose'); if(close) close.onclick=()=>requestClosePicturePreview();
  const overlay=$('#picturePreviewOverlay'); if(overlay) overlay.addEventListener('click',e=>{ if(e.target===overlay) requestClosePicturePreview(); });
  window.addEventListener('keydown',e=>{ if(e.key==='Escape') requestClosePicturePreview(); });
}
Object.assign(app,{initPicturePreview});
exports["clearPicturePreviewTimer"] = clearPicturePreviewTimer;
exports["updatePicturePreviewButton"] = updatePicturePreviewButton;
exports["closePicturePreview"] = closePicturePreview;
exports["resolvePicturePreviewPromise"] = resolvePicturePreviewPromise;
exports["bumpPicturePreviewButton"] = bumpPicturePreviewButton;
exports["previewTransformFromButton"] = previewTransformFromButton;
exports["animatePicturePreviewToButton"] = animatePicturePreviewToButton;
exports["picturePreviewAnimationActive"] = picturePreviewAnimationActive;
exports["requestClosePicturePreview"] = requestClosePicturePreview;
exports["picturePreviewTitle"] = picturePreviewTitle;
exports["showPicturePreview"] = showPicturePreview;
exports["initPicturePreview"] = initPicturePreview;
});
