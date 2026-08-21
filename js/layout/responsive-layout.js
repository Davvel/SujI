/** SuJi classic-compatible module wrapper. Source owner: js/layout/responsive-layout.js */
SuJiModules.define("js/layout/responsive-layout.js", function(require, exports){
'use strict';
/**
 * SuJi Module: layout/responsive-layout
 * Migrated from the accepted 1.27.0 implementation with function bodies preserved.
 */
const {app} = require("js/core/app-context.js");
const {state} = require("js/core/state.js");
const {$, $$, board, rack} = require("js/core/dom.js");
const {TYPE_COLORS, TUTORIAL_LEVELS, RULE_COPY, GAME_CONFIG} = require("config/game-config.js");
const {UI_CONFIG} = require("config/ui-config.js");
const {STORAGE_KEYS} = require("config/storage-keys.js");
const clamp=(...args)=>app.clamp(...args);
const renderAll=(...args)=>app.renderAll(...args);
const setHintModeClass=(...args)=>app.setHintModeClass(...args);
const updateConflictBubble=(...args)=>app.updateConflictBubble(...args);
const updateHintViewportMetrics=(...args)=>app.updateHintViewportMetrics(...args);
const updateStats=(...args)=>app.updateStats(...args);
let responsiveRelayoutRaf=0;
let responsiveRelayoutTimer=0;
let orientationRelayoutEpoch=0;
function getResponsiveViewport(){
  const vv=window.visualViewport;
  const width=Math.max(1,Math.round(vv?.width || document.documentElement.clientWidth || window.innerWidth || 1));
  const height=Math.max(1,Math.round(vv?.height || document.documentElement.clientHeight || window.innerHeight || 1));
  return {width,height};
}

function hasTouchPrimaryInput(){
  return (navigator.maxTouchPoints||0)>0 || !!window.matchMedia?.('(pointer: coarse)').matches;
}

function getScreenOrientationAngle(){
  const raw=(typeof screen.orientation?.angle==='number')
    ? screen.orientation.angle
    : (typeof window.orientation==='number' ? window.orientation : 0);
  return ((raw%360)+360)%360;
}

function updateMobileLandscapeSafeInsets(enabled,viewport){
  const root=document.documentElement;
  if(!enabled){
    root.style.removeProperty('--mobile-landscape-safe-left');
    root.style.removeProperty('--mobile-landscape-safe-right');
    return;
  }

  let safeLeft=0,safeRight=0;
  const vv=window.visualViewport;
  const layoutWidth=Math.max(document.documentElement.clientWidth||0,window.innerWidth||0);
  if(vv && layoutWidth){
    safeLeft=Math.max(0,Math.ceil(vv.offsetLeft||0));
    safeRight=Math.max(0,Math.ceil(layoutWidth-(vv.offsetLeft||0)-vv.width));
  }

  // Android's three-button navigation rail can be drawn over an edge-to-edge
  // PWA without reducing visualViewport.width.  Pixel-class phones therefore
  // need a small orientation-aware fallback inset when the browser reports 0.
  if(/Android/i.test(navigator.userAgent) && safeLeft<4 && safeRight<4){
    const fallback=Math.round(clamp(viewport.height*.08,28,38));
    const angle=getScreenOrientationAngle();
    if(angle===270) safeLeft=fallback;
    else safeRight=fallback;
  }

  root.style.setProperty('--mobile-landscape-safe-left',`${safeLeft}px`);
  root.style.setProperty('--mobile-landscape-safe-right',`${safeRight}px`);
}

function clearMobileLandscapeGeometry(){
  const root=document.documentElement;
  root.style.removeProperty('--mobile-landscape-board-size');
  root.style.removeProperty('--mobile-landscape-board-col');
}

function updateMobileLandscapeGeometry(enabled){
  if(!enabled){ clearMobileLandscapeGeometry(); return; }

  const play=document.querySelector('.play-layout');
  const boardSection=document.querySelector('.board-section');
  const heading=boardSection?.querySelector('.board-section-heading');
  if(!play || !boardSection || !heading) return;

  // v1.26.5: mobile landscape is deliberately balanced 50/50.  The Rack must
  // never grow past half the usable play width merely because the Board square
  // is height-limited.  Keeping a full half for the Board also gives Hint/error
  // bubbles room to open without being clipped at the left edge.
  void play.offsetHeight;

  const playHeight=Math.max(120,Math.floor(play.getBoundingClientRect().height));
  const boardRect=boardSection.getBoundingClientRect();
  const boardStyle=getComputedStyle(boardSection);
  const headingStyle=getComputedStyle(heading);
  const boardPadX=(parseFloat(boardStyle.paddingLeft)||0)+(parseFloat(boardStyle.paddingRight)||0);
  const boardPadY=(parseFloat(boardStyle.paddingTop)||0)+(parseFloat(boardStyle.paddingBottom)||0);
  const headingH=heading.getBoundingClientRect().height
    +(parseFloat(headingStyle.marginTop)||0)+(parseFloat(headingStyle.marginBottom)||0);

  const boardByHeight=Math.max(96,Math.floor(playHeight-boardPadY-headingH-4));
  // Leave a small white gutter on both sides of the square inside the Board half.
  const sideBreathing=18;
  const boardByWidth=Math.max(96,Math.floor(boardRect.width-boardPadX-(sideBreathing*2)));
  const boardSize=Math.max(96,Math.floor(Math.min(boardByHeight,boardByWidth)));

  const root=document.documentElement;
  root.style.setProperty('--mobile-landscape-board-size',`${boardSize}px`);
  // The CSS grid owns the equal columns; remove any stale width from v1.26.4.
  root.style.removeProperty('--mobile-landscape-board-col');
}

function updateResponsiveLayout(){
  const viewport=getResponsiveViewport();
  const touch=hasTouchPrimaryInput();
  const geometricLandscape=viewport.width>viewport.height;
  // Do not require a desktop-like 760px width for a rotated phone. Pixel-class
  // devices can report fewer CSS pixels depending on browser/PWA chrome.
  const landscape=geometricLandscape && (viewport.width>=700 || touch);
  const mobileLandscape=landscape && touch && viewport.height<=620;

  document.body.classList.toggle('landscape-ui',landscape);
  document.body.classList.toggle('portrait-ui',!landscape);
  document.body.classList.toggle('mobile-landscape-ui',mobileLandscape);
  document.documentElement.style.setProperty('--suji-visual-width',`${viewport.width}px`);
  document.documentElement.style.setProperty('--suji-visual-height',`${viewport.height}px`);
  updateMobileLandscapeSafeInsets(mobileLandscape,viewport);

  const topbar=document.querySelector('.topbar');
  if(topbar){
    document.documentElement.style.setProperty('--suji-topbar-h',`${Math.ceil(topbar.getBoundingClientRect().height)}px`);
  }

  updateHintControlLocation();
  updatePlacementHintLocation(landscape);
  updatePortraitPlayHeight(landscape);
  updateLandscapePlayHeight(landscape,viewport);
  updateMobileLandscapeGeometry(mobileLandscape);
}

function updateLandscapePlayHeight(landscape,viewport=getResponsiveViewport()){
  const play=document.querySelector('.play-layout');
  if(!play) return;
  if(!landscape){
    play.style.removeProperty('--landscape-play-height');
    return;
  }
  const top=play.getBoundingClientRect().top;
  const safeBottom=4;
  // Desktop keeps the historical minimum. A phone in landscape must instead
  // fit the *real* remaining viewport, otherwise the Board is guaranteed to run
  // below the screen after rotation.
  const minHeight=document.body.classList.contains('mobile-landscape-ui') ? 120 : 230;
  const available=Math.max(minHeight,Math.floor(viewport.height-top-safeBottom));
  play.style.setProperty('--landscape-play-height',`${available}px`);
}

function updatePlacementHintLocation(landscape){
  const btn=document.getElementById('placementHintBtn');
  const instruction=document.getElementById('hintInstruction');
  const headingTools=document.querySelector('.board-heading-tools');
  if(!btn || !instruction || !headingTools) return;
  // Checkpoint 17.0.3: Hint permanently belongs in the Board heading in every orientation.
  if(btn.parentElement!==headingTools) headingTools.insertBefore(btn, headingTools.firstChild);
  if(instruction.parentElement!==headingTools) headingTools.appendChild(instruction);
}

function updatePortraitPlayHeight(landscape){
  const play=document.querySelector('.play-layout');
  if(!play) return;
  if(landscape){
    play.style.removeProperty('--portrait-play-height');
    return;
  }
  const top=play.getBoundingClientRect().top;
  const visualHeight=window.visualViewport?.height || window.innerHeight;
  const available=Math.max(320, Math.floor(visualHeight-top-8));
  play.style.setProperty('--portrait-play-height', `${available}px`);
}

function updateHintControlLocation(){
  const hintGroup=document.getElementById('hintOptionGroup');
  const levelSlot=document.getElementById('hintLevelSlot');
  if(!hintGroup || !levelSlot) return;
  if(hintGroup.parentElement!==levelSlot){
    levelSlot.appendChild(hintGroup);
  }
}

function performResponsiveRelayout(){
  updateResponsiveLayout();
  setHintModeClass();
  updateHintViewportMetrics();
  updateStats();
  renderAll(false);
  if(state.activeTeachingConflict) updateConflictBubble(state.activeTeachingConflict);
}

function scheduleResponsiveRelayout(){
  if(responsiveRelayoutRaf) cancelAnimationFrame(responsiveRelayoutRaf);
  responsiveRelayoutRaf=requestAnimationFrame(()=>{
    responsiveRelayoutRaf=requestAnimationFrame(()=>{
      responsiveRelayoutRaf=0;
      performResponsiveRelayout();
    });
  });
  clearTimeout(responsiveRelayoutTimer);
  responsiveRelayoutTimer=setTimeout(performResponsiveRelayout,140);
}

function stabilizeAfterOrientationChange(){
  const epoch=++orientationRelayoutEpoch;
  // Android updates orientation, visualViewport and layout viewport in separate
  // phases. Re-measure several times, but only for the newest rotation.
  [0,70,180,360].forEach(delay=>{
    setTimeout(()=>{
      if(epoch!==orientationRelayoutEpoch) return;
      requestAnimationFrame(performResponsiveRelayout);
    },delay);
  });
}

function initResponsiveLayout(){
  window.addEventListener('resize',scheduleResponsiveRelayout,{passive:true});
  if(window.visualViewport) window.visualViewport.addEventListener('resize',scheduleResponsiveRelayout,{passive:true});
  window.addEventListener('orientationchange',stabilizeAfterOrientationChange,{passive:true});
  if(screen.orientation?.addEventListener) screen.orientation.addEventListener('change',stabilizeAfterOrientationChange);
  // Keep the conflict bubble attached after layout changes; fixes the old out-of-IIFE callback safely.
  window.addEventListener('resize',()=>{ if(state.activeTeachingConflict) updateConflictBubble(state.activeTeachingConflict); },{passive:true});
}
Object.assign(app,{initResponsiveLayout});
Object.assign(app,{getResponsiveViewport,hasTouchPrimaryInput,getScreenOrientationAngle,updateMobileLandscapeSafeInsets,clearMobileLandscapeGeometry,updateMobileLandscapeGeometry,updateResponsiveLayout,updateLandscapePlayHeight,updatePlacementHintLocation,updatePortraitPlayHeight,updateHintControlLocation,performResponsiveRelayout,scheduleResponsiveRelayout,stabilizeAfterOrientationChange});
exports["getResponsiveViewport"] = getResponsiveViewport;
exports["hasTouchPrimaryInput"] = hasTouchPrimaryInput;
exports["getScreenOrientationAngle"] = getScreenOrientationAngle;
exports["updateMobileLandscapeSafeInsets"] = updateMobileLandscapeSafeInsets;
exports["clearMobileLandscapeGeometry"] = clearMobileLandscapeGeometry;
exports["updateMobileLandscapeGeometry"] = updateMobileLandscapeGeometry;
exports["updateResponsiveLayout"] = updateResponsiveLayout;
exports["updateLandscapePlayHeight"] = updateLandscapePlayHeight;
exports["updatePlacementHintLocation"] = updatePlacementHintLocation;
exports["updatePortraitPlayHeight"] = updatePortraitPlayHeight;
exports["updateHintControlLocation"] = updateHintControlLocation;
exports["performResponsiveRelayout"] = performResponsiveRelayout;
exports["scheduleResponsiveRelayout"] = scheduleResponsiveRelayout;
exports["stabilizeAfterOrientationChange"] = stabilizeAfterOrientationChange;
exports["initResponsiveLayout"] = initResponsiveLayout;
});
