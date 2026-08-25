/** SuJi classic-compatible module wrapper. Source owner: js/features/tutorial.js */
SuJiModules.define("js/features/tutorial.js", function(require, exports){
'use strict';
/**
 * SuJi Module: features/tutorial
 * Migrated from the accepted 1.27.0 implementation with function bodies preserved.
 */
const {app} = require("js/core/app-context.js");
const {state} = require("js/core/state.js");
const {$, $$, board, rack} = require("js/core/dom.js");
const {TYPE_COLORS, TUTORIAL_LEVELS, RULE_COPY, GAME_CONFIG} = require("config/game-config.js");
const {UI_CONFIG} = require("config/ui-config.js");
const {STORAGE_KEYS} = require("config/storage-keys.js");
const clamp=(...args)=>app.clamp(...args);
const makeSudoku=(...args)=>app.makeSudoku(...args);
const TUTORIAL_STORAGE_PREFIX=STORAGE_KEYS.tutorialPrefix;
let tutorialHintFinger=null;
function canonicalTutorialSudoku(){
  const shifts=[0,3,6,1,4,7,2,5,8];
  return shifts.map(shift=>Array.from({length:9},(_,c)=>((c+shift)%9)+1));
}

function tutorialSudoku(level){
  const g=canonicalTutorialSudoku();
  if(level===4) return g[0].map((_,c)=>g.map(row=>row[c]));
  if(level>=1 && level<=3) return g;
  return makeSudoku(level);
}

function tutorialCount(key){ return clamp(parseInt(localStorage.getItem(TUTORIAL_STORAGE_PREFIX+key)||'0',10),0,3); }

function setTutorialCount(key,n){ localStorage.setItem(TUTORIAL_STORAGE_PREFIX+key,String(clamp(n,0,3))); }

function tutorialActive(){ return state.level>=GAME_CONFIG.tutorialFirstLevel && state.level<=GAME_CONFIG.tutorialLastLevel; }

function setTutorialBodyClass(){
  for(let i=GAME_CONFIG.tutorialFirstLevel;i<=GAME_CONFIG.tutorialLastLevel;i++) document.body.classList.toggle('tutorial-level-'+i,state.level===i);
  if(state.level!==3) hideTutorialHintFinger();
  updateTutorialHintWaitingClass();
}

function modalIsOpen(){
  const modal=$('#tutorialModal');
  return !!(modal && modal.open);
}

function tutorialHintNeedsConsumption(){
  return state.level===3 && !state.tutorialHintConsumed;
}

function tutorialHintCoachActive(){
  // The hard tutorial lock applies only before Hint mode is entered. Once Hint
  // is armed the Rack must stay live so the player can choose a shape and spend it.
  return tutorialHintNeedsConsumption() && !state.hintArmed && !state.hintInUse;
}

function tutorialHintInteractionLocked(){
  return tutorialHintCoachActive();
}

function updateTutorialHintWaitingClass(){
  const waiting=tutorialHintCoachActive();
  document.body.classList.toggle('tutorial-hint-waiting',waiting);
  if(waiting && typeof app.ensureHintDimLayers==='function') app.ensureHintDimLayers();
}

function ensureTutorialHintFinger(){
  if(tutorialHintFinger && tutorialHintFinger.isConnected) return tutorialHintFinger;
  const el=document.createElement('div');
  el.className='tutorial-hint-finger';
  el.hidden=true;
  el.setAttribute('aria-hidden','true');
  document.body.appendChild(el);
  tutorialHintFinger=el;
  return el;
}

function positionTutorialHintFinger(){
  const finger=tutorialHintFinger;
  const btn=$('#placementHintBtn');
  if(!finger || finger.hidden || !btn) return;
  const br=btn.getBoundingClientRect();
  if(!br.width || !br.height) return;
  const above=br.top>=72;
  finger.textContent=above ? '👇' : '👆';
  finger.classList.toggle('tutorial-hint-finger-below',!above);
  const fr=finger.getBoundingClientRect();
  const left=Math.max(4,Math.min(window.innerWidth-fr.width-4,br.left+(br.width-fr.width)/2));
  const top=above ? Math.max(4,br.top-fr.height-8) : Math.min(window.innerHeight-fr.height-4,br.bottom+8);
  finger.style.left=`${Math.round(left)}px`;
  finger.style.top=`${Math.round(top)}px`;
}

function hideTutorialHintFinger(){
  if(tutorialHintFinger) tutorialHintFinger.hidden=true;
  document.body.classList.remove('tutorial-hint-prompting');
}

function showTutorialHintFinger(){
  if(!tutorialHintCoachActive() || modalIsOpen()) return false;
  const finger=ensureTutorialHintFinger();
  finger.hidden=false;
  document.body.classList.add('tutorial-hint-prompting');
  requestAnimationFrame(positionTutorialHintFinger);
  return true;
}

function resetTutorialHintCoach({consumed=false}={}){
  state.tutorialHintConsumed=!!consumed;
  hideTutorialHintFinger();
  updateTutorialHintWaitingClass();
}

function tutorialHintButtonPressed(){
  if(state.level!==3 || !tutorialHintNeedsConsumption()) return;
  // Pressing the bulb only STARTS the lesson. Do not mark it complete yet: the
  // first Level 3 Hint is consumed only after its selected Rack shape lands on the Board.
  hideTutorialHintFinger();
}

function tutorialPlacementHintConsumed(){
  if(state.level!==3 || state.tutorialHintConsumed) return;
  // In Level 3 the first Hint is not fully consumed merely by selecting a Rack
  // shape. Charge the Hint only after that selected shape has actually been
  // placed on a valid Board destination and the Hint session can complete.
  if(state.hintRemaining>0) state.hintRemaining--;
  state.tutorialHintConsumed=true;
  hideTutorialHintFinger();
  updateTutorialHintWaitingClass();
  if(typeof app.saveActiveGame==='function') app.saveActiveGame();
}

function tutorialHintSessionEnded(){
  if(!tutorialHintNeedsConsumption()) return;
  updateTutorialHintWaitingClass();
  // Cancelling before completing the hinted Rack-to-Board placement must
  // return Level 3 to its forced teaching state immediately.
  if(!modalIsOpen()) showTutorialHintFinger();
  if(typeof app.saveActiveGame==='function') app.saveActiveGame();
}

function tutorialHintInteractionCapture(event){
  if(!tutorialHintNeedsConsumption() || modalIsOpen()) return;
  const target=event.target instanceof Element ? event.target : null;
  if(target?.closest('#placementHintBtn')){
    tutorialHintButtonPressed();
    return;
  }
  if(target?.closest('#tutorialModal')) return;
  if(tutorialHintCoachActive()) showTutorialHintFinger();
}

function closeTutorialModal(){
  const modal=$('#tutorialModal');
  if(modal && modal.open) modal.close();
  updateTutorialHintWaitingClass();
  state.tutorialRule=null;
  state.activeTipSignature=null;
  if(state.tutorialModalResolver){
    const resolve=state.tutorialModalResolver;
    state.tutorialModalResolver=null;
    resolve();
  }
  // Collision teaching stripe is intentionally persistent. It disappears only
  // when the highlighted Sudoku conflict has actually been resolved.
}

function openTutorialModal(key,text,{rule=null,signature=null,mode='bottom',force=false}={}){
  if(!tutorialActive() || (!force && tutorialCount(key)>=3)) return false;
  const modal=$('#tutorialModal');
  if(!modal) return false;
  if(modal.open) modal.close();
  $('#tutorialText').textContent=text;
  modal.classList.remove('tutorial-modal-bottom','tutorial-modal-intro');
  modal.classList.add(mode==='intro' ? 'tutorial-modal-intro' : 'tutorial-modal-bottom');
  state.tutorialRule=rule;
  state.activeTipSignature=signature;
  if(!force) setTutorialCount(key,tutorialCount(key)+1);
  modal.showModal();
  return true;
}

function waitForTutorialModalClose(){
  const modal=$('#tutorialModal');
  if(!modal || !modal.open) return Promise.resolve();
  return new Promise(resolve=>{ state.tutorialModalResolver=resolve; });
}

function showTutorialDefault(){
  if(!tutorialActive()) return;
  const text=TUTORIAL_LEVELS[state.level];
  if(!text) return;
  // All non-error tutorial information should be shown as a centered
  // "super message" so the player can simply read it before playing.
  const key=state.level===3 ? 'intro.3.hint-v2' : 'intro.'+state.level;
  // Every guided tutorial level owns an intro lesson. A deliberate restart,
  // replay, or fresh entry must always show that lesson again, regardless of how
  // many times the player has already seen it. Rule/error tips keep their normal
  // anti-spam counters because only this default intro is forced.
  openTutorialModal(key,text,{mode:'intro',force:true});
}

function showRuleTip(rule,signature){
  if(!RULE_COPY[rule.type]) return false;
  return openTutorialModal('rule.'+rule.type,RULE_COPY[rule.type].text(rule.n),{rule,signature});
}

function clearRuleRegion(){
  $$('.board-cell.tutorial-rule-region,.piece-cell.tutorial-rule-region').forEach(el=>el.classList.remove('tutorial-rule-region'));
  const stripe=$('#tutorialStripe');
  if(stripe){
    stripe.hidden=true;
    stripe.className='tutorial-stripe';
    stripe.removeAttribute('style');
  }
}

function conflictIdentity(rule){
  if(!rule) return '';
  const region=rule.type==='box' ? `${rule.br},${rule.bc}` : String(rule.index);
  return `${rule.type}:${region}:${rule.n}`;
}

function sameConflict(a,b){ return !!a && !!b && conflictIdentity(a)===conflictIdentity(b); }

function conflictStillExists(rule,conflicts){ return conflicts.some(c=>sameConflict(c,rule)); }

function paintRuleRegion(rule){
  const stripe=$('#tutorialStripe');
  if(!stripe || !rule){ clearRuleRegion(); return; }
  stripe.hidden=false;
  stripe.className=`tutorial-stripe tutorial-stripe-${rule.type}`;
  stripe.removeAttribute('style');
  if(rule.type==='row'){
    stripe.style.left='0';
    stripe.style.top=`${(rule.index/9)*100}%`;
    stripe.style.width='100%';
    stripe.style.height=`${100/9}%`;
  } else if(rule.type==='col'){
    stripe.style.top='0';
    stripe.style.left=`${(rule.index/9)*100}%`;
    stripe.style.height='100%';
    stripe.style.width=`${100/9}%`;
  } else {
    stripe.style.left=`${(rule.bc/3)*100}%`;
    stripe.style.top=`${(rule.br/3)*100}%`;
    stripe.style.width=`${100/3}%`;
    stripe.style.height=`${100/3}%`;
  }
}


Object.assign(app,{canonicalTutorialSudoku,tutorialSudoku,tutorialCount,setTutorialCount,tutorialActive,setTutorialBodyClass,modalIsOpen,tutorialHintNeedsConsumption,tutorialHintCoachActive,tutorialHintInteractionLocked,updateTutorialHintWaitingClass,showTutorialHintFinger,hideTutorialHintFinger,resetTutorialHintCoach,tutorialHintButtonPressed,tutorialPlacementHintConsumed,tutorialHintSessionEnded,positionTutorialHintFinger,closeTutorialModal,openTutorialModal,waitForTutorialModalClose,showTutorialDefault,showRuleTip,clearRuleRegion,conflictIdentity,sameConflict,conflictStillExists,paintRuleRegion});

function initTutorial(){
  const dismissTutorialModalByUser=()=>{
    const shouldPrompt=tutorialHintNeedsConsumption();
    closeTutorialModal();
    // Level 3: the hand and bulb wiggle begin immediately after ANY deliberate
    // dismissal of the intro (OK, close X, or keyboard cancel).
    if(shouldPrompt) showTutorialHintFinger();
  };
  const tutorialClose=$('#tutorialClose'); if(tutorialClose) tutorialClose.addEventListener('click',dismissTutorialModalByUser);
  const tutorialOk=$('#tutorialOk'); if(tutorialOk) tutorialOk.addEventListener('click',dismissTutorialModalByUser);
  const tutorialModal=$('#tutorialModal'); if(tutorialModal) tutorialModal.addEventListener('cancel',e=>{ e.preventDefault(); dismissTutorialModalByUser(); });
  document.addEventListener('pointerdown',tutorialHintInteractionCapture,true);
  document.addEventListener('click',tutorialHintInteractionCapture,true);
  window.addEventListener('resize',positionTutorialHintFinger,{passive:true});
  window.addEventListener('scroll',positionTutorialHintFinger,{passive:true});
}
Object.assign(app,{initTutorial});
exports["canonicalTutorialSudoku"] = canonicalTutorialSudoku;
exports["tutorialSudoku"] = tutorialSudoku;
exports["tutorialCount"] = tutorialCount;
exports["setTutorialCount"] = setTutorialCount;
exports["tutorialActive"] = tutorialActive;
exports["setTutorialBodyClass"] = setTutorialBodyClass;
exports["modalIsOpen"] = modalIsOpen;
exports["tutorialHintNeedsConsumption"] = tutorialHintNeedsConsumption;
exports["tutorialHintCoachActive"] = tutorialHintCoachActive;
exports["tutorialHintInteractionLocked"] = tutorialHintInteractionLocked;
exports["updateTutorialHintWaitingClass"] = updateTutorialHintWaitingClass;
exports["showTutorialHintFinger"] = showTutorialHintFinger;
exports["hideTutorialHintFinger"] = hideTutorialHintFinger;
exports["resetTutorialHintCoach"] = resetTutorialHintCoach;
exports["tutorialHintButtonPressed"] = tutorialHintButtonPressed;
exports["tutorialPlacementHintConsumed"] = tutorialPlacementHintConsumed;
exports["tutorialHintSessionEnded"] = tutorialHintSessionEnded;
exports["positionTutorialHintFinger"] = positionTutorialHintFinger;
exports["closeTutorialModal"] = closeTutorialModal;
exports["openTutorialModal"] = openTutorialModal;
exports["waitForTutorialModalClose"] = waitForTutorialModalClose;
exports["showTutorialDefault"] = showTutorialDefault;
exports["showRuleTip"] = showRuleTip;
exports["clearRuleRegion"] = clearRuleRegion;
exports["conflictIdentity"] = conflictIdentity;
exports["sameConflict"] = sameConflict;
exports["conflictStillExists"] = conflictStillExists;
exports["paintRuleRegion"] = paintRuleRegion;
exports["initTutorial"] = initTutorial;
});
