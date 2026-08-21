/**
 * SuJi Module: features/tutorial
 * Migrated from the accepted 1.27.0 implementation with function bodies preserved.
 */
import {app} from '../core/app-context.js';
import {state} from '../core/state.js';
import {$,$$,board,rack} from '../core/dom.js';
import {TYPE_COLORS,TUTORIAL_LEVELS,RULE_COPY,GAME_CONFIG} from '../../config/game-config.js';
import {UI_CONFIG} from '../../config/ui-config.js';
import {STORAGE_KEYS} from '../../config/storage-keys.js';
const clamp=(...args)=>app.clamp(...args);
const makeSudoku=(...args)=>app.makeSudoku(...args);
const TUTORIAL_STORAGE_PREFIX=STORAGE_KEYS.tutorialPrefix;
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

function tutorialActive(){ return state.level>=1 && state.level<=5; }

function setTutorialBodyClass(){
  for(let i=1;i<=5;i++) document.body.classList.toggle('tutorial-level-'+i,state.level===i);
}

function modalIsOpen(){
  const modal=$('#tutorialModal');
  return !!(modal && modal.open);
}

function closeTutorialModal(){
  const modal=$('#tutorialModal');
  if(modal && modal.open) modal.close();
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

function openTutorialModal(key,text,{rule=null,signature=null,mode='bottom'}={}){
  if(!tutorialActive() || tutorialCount(key)>=3) return false;
  const modal=$('#tutorialModal');
  if(!modal) return false;
  if(modal.open) modal.close();
  $('#tutorialText').textContent=text;
  modal.classList.remove('tutorial-modal-bottom','tutorial-modal-intro');
  modal.classList.add(mode==='intro' ? 'tutorial-modal-intro' : 'tutorial-modal-bottom');
  state.tutorialRule=rule;
  state.activeTipSignature=signature;
  setTutorialCount(key,tutorialCount(key)+1);
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
  openTutorialModal('intro.'+state.level,text,{mode:'intro'});
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


Object.assign(app,{canonicalTutorialSudoku,tutorialSudoku,tutorialCount,setTutorialCount,tutorialActive,setTutorialBodyClass,modalIsOpen,closeTutorialModal,openTutorialModal,waitForTutorialModalClose,showTutorialDefault,showRuleTip,clearRuleRegion,conflictIdentity,sameConflict,conflictStillExists,paintRuleRegion});
export {canonicalTutorialSudoku,tutorialSudoku,tutorialCount,setTutorialCount,tutorialActive,setTutorialBodyClass,modalIsOpen,closeTutorialModal,openTutorialModal,waitForTutorialModalClose,showTutorialDefault,showRuleTip,clearRuleRegion,conflictIdentity,sameConflict,conflictStillExists,paintRuleRegion};

export function initTutorial(){
  const tutorialClose=$('#tutorialClose'); if(tutorialClose) tutorialClose.addEventListener('click',closeTutorialModal);
  const tutorialOk=$('#tutorialOk'); if(tutorialOk) tutorialOk.addEventListener('click',closeTutorialModal);
  const tutorialModal=$('#tutorialModal'); if(tutorialModal) tutorialModal.addEventListener('cancel',e=>{ e.preventDefault(); closeTutorialModal(); });
}
Object.assign(app,{initTutorial});
