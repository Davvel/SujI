(() => {
'use strict';

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const board = $('#board'), rack = $('#rack');

function readToggle(key, defaultValue=true){
  const raw=localStorage.getItem(key);
  if(raw===null) return defaultValue;
  if(raw==='off' || raw==='false' || raw==='0') return false;
  if(raw==='on' || raw==='true' || raw==='1') return true;
  return defaultValue;
}

const LEVEL_HISTORY_KEY='suji.levelHistory.v1';
const HIGHEST_LEVEL_KEY='suji.highestLevelReached';
const VISITED_LEVELS_KEY='suji.visitedLevels.v1';

function loadLevelHistory(){
  try{
    const raw=JSON.parse(localStorage.getItem(LEVEL_HISTORY_KEY)||'{}');
    return raw && typeof raw==='object' ? raw : {};
  }catch(_){ return {}; }
}
function saveLevelHistory(){
  localStorage.setItem(LEVEL_HISTORY_KEY,JSON.stringify(state.levelHistory));
}
function bestRecord(level){ return state.levelHistory[String(level)] || null; }
function loadVisitedLevels(){
  try{
    const raw=JSON.parse(localStorage.getItem(VISITED_LEVELS_KEY)||'[]');
    return new Set(Array.isArray(raw) ? raw.map(Number).filter(n=>Number.isFinite(n)&&n>=1&&n<=9999) : []);
  }catch(_){ return new Set(); }
}
function saveVisitedLevels(){
  localStorage.setItem(VISITED_LEVELS_KEY,JSON.stringify([...state.visitedLevels].sort((a,b)=>a-b)));
}
function markLevelVisited(level){
  level=clamp(parseInt(level,10)||1,1,9999);
  state.visitedLevels.add(level);
  saveVisitedLevels();
}
function hasVisitedLevel(level){ return state.visitedLevels.has(Number(level)); }
function highestUnlockedFromHistory(history){
  let highest=1;
  if(history && typeof history==='object'){
    for(const key of Object.keys(history)){
      const completed=parseInt(key,10);
      if(Number.isFinite(completed) && completed>=1){
        highest=Math.max(highest,Math.min(9999,completed+1));
      }
    }
  }
  return highest;
}
function persistHighestLevelReached(level){
  const next=clamp(parseInt(level,10)||1,1,9999);
  if(next>state.highestLevelReached) state.highestLevelReached=next;
  localStorage.setItem(HIGHEST_LEVEL_KEY,String(state.highestLevelReached));

// Seed visit history when upgrading an existing browser profile. Completed levels and
// the already-active persisted level have necessarily been seen before. A brand-new
// profile still treats Level 1 as fresh so its introductory picture is shown once.
for(const key of Object.keys(state.levelHistory||{})){
  const n=parseInt(key,10);
  if(Number.isFinite(n)) state.visitedLevels.add(n);
}
if(localStorage.getItem('suji.level')!==null) state.visitedLevels.add(state.level);
saveVisitedLevels();
  return state.highestLevelReached;
}
function formatDuration(totalSeconds){
  totalSeconds=Math.max(0,Math.round(totalSeconds||0));
  const m=Math.floor(totalSeconds/60), sec=totalSeconds%60;
  return `${m}:${String(sec).padStart(2,'0')}`;
}
function formatDurationMinutes(totalSeconds){
  const seconds=Math.max(0,Math.round(totalSeconds||0));
  if(seconds<60) return `${seconds}s`;
  const m=Math.floor(seconds/60), sec=seconds%60;
  return sec ? `${m}m ${sec}s` : `${m}m`;
}
function scoreForSeconds(seconds){
  return Math.max(100,10000-Math.max(0,Math.round(seconds||0)));
}

// v8.0.6 static rating formula used for every level for now.
// Speed carries 60% of the rating and move efficiency 40%.
// Finishing in 2:00 or less AND 25 moves or fewer gives a perfect 100.
function performanceForAttempt(seconds,moves){
  seconds=Math.max(1,Number(seconds)||1);
  moves=Math.max(1,Number(moves)||1);
  const timePart=Math.min(1,120/seconds);
  const movePart=Math.min(1,25/moves);
  return Math.max(0,Math.min(100,Math.round(100*((.60*timePart)+(.40*movePart)))));
}
function starsForPerformance(score){
  score=Number(score)||0;
  return score>=90 ? 3 : score>=65 ? 2 : 1;
}
function ratingForAttempt(seconds,moves){
  const performance=performanceForAttempt(seconds,moves);
  return {performance,stars:starsForPerformance(performance)};
}
function starsText(stars){
  stars=clamp(Number(stars)||1,1,3);
  return '★'.repeat(stars)+'☆'.repeat(3-stars);
}
function recordRating(record){
  if(!record) return {performance:0,stars:0};
  if(Number.isFinite(Number(record.performance)) && Number(record.stars)){
    return {performance:Number(record.performance),stars:clamp(Number(record.stars),1,3)};
  }
  // Older v8.0.x records did not save moves. Give them a provisional time-only rating
  // until the player replays the level and records a complete time+move result.
  const seconds=Math.max(1,Number(record.bestSeconds)||1);
  const provisional=seconds<=120 ? 90 : seconds<=300 ? 70 : 50;
  return {performance:provisional,stars:starsForPerformance(provisional)};
}

function updateLevelTimer(){
  const el=$('#levelTimer');
  if(!el) return;
  const elapsed=state.levelStartedAt ? Math.max(0,Math.floor((Date.now()-state.levelStartedAt)/1000)) : 0;
  const next=formatDuration(elapsed);
  if(el.textContent!==next){
    el.textContent=next;
    el.classList.remove('timer-tick');
    void el.offsetWidth;
    el.classList.add('timer-tick');
  }
}
function updateMoveCounter(){
  const el=$('#movesStat');
  if(!el) return;
  const next=String(state.manualMoves||0);
  if(el.textContent!==next){
    el.textContent=next;
    el.classList.remove('move-bump');
    void el.offsetWidth;
    el.classList.add('move-bump');
  }
}
function stopLevelTimer(){
  if(state.levelTimerInterval){
    clearInterval(state.levelTimerInterval);
    state.levelTimerInterval=null;
  }
}
function resetLevelTimerDisplay(){
  stopLevelTimer();
  state.levelStartedAt=0;
  updateLevelTimer();
}
function startLevelTimer(){
  stopLevelTimer();
  state.levelStartedAt=Date.now();
  updateLevelTimer();
  state.levelTimerInterval=setInterval(updateLevelTimer,250);
}

const state = {
  level: clamp(parseInt(localStorage.getItem('suji.level') || '1',10),1,9999),
  picture: readToggle('suji.picture', true),
  hints: clamp(parseInt(localStorage.getItem('suji.hints') || '3',10),1,3),
  guides: false,
  hintRemaining: 0, hintArmed: false, hintInUse: false, hintSelectedId: null, hintBubbleDismissed: false, hintMovablePieceIds: new Set(),
  pieces: [], placed: new Map(), anchors: new Set(), manualMoves: 0,
  sudoku: null, imageURL: null, pendingChange: null,
  tutorialRule: null, lastTipSignature: null, activeTipSignature: null,
  lastDroppedId: null, activeTeachingConflict: null, conflictShakePieceIds: new Set(), conflictShakeOwners: new Map(), hintCorrectPieces: new Set(), picturePreviewTimer: null, tutorialModalResolver: null, picturePreviewResolver: null,
  levelHistory: loadLevelHistory(),
  visitedLevels: loadVisitedLevels(),
  // v8.0.6: highest progression is reconstructed from every trustworthy source.
  // A completed Level N permanently unlocks N+1, even after replaying an older level.
  highestLevelReached: 1,
  levelStartedAt: 0, levelTimerInterval: null, completionHandled: false, levelPickerPage: 0
};

// Rebuild progression on startup so older/stale localStorage cannot re-lock levels.
state.highestLevelReached=clamp(Math.max(
  parseInt(localStorage.getItem(HIGHEST_LEVEL_KEY)||'1',10)||1,
  parseInt(localStorage.getItem('suji.level')||'1',10)||1,
  state.level,
  highestUnlockedFromHistory(state.levelHistory)
),1,9999);
localStorage.setItem(HIGHEST_LEVEL_KEY,String(state.highestLevelReached));

const TYPE_COLORS = {I:'#2f80ed',O:'#f2b705',ONE:'#2fb65d'};


const TUTORIAL_LEVELS = {
  1:'Solve the Jigsaw, but mind the Sudoku numbers.',
  2:'Level 2, Notice the numbers as you build.',
  3:'Level 3, Follow the stripes: each row uses 1–9 once.',
  4:'Level 4, Follow the stripes: each column uses 1–9 once.',
  5:'Level 5, Use the picture and all Sudoku rules together.'
};
const RULE_COPY = {
  row:{text:n=>`${n} cannot be twice in a row.`},
  col:{text:n=>`${n} cannot be twice in a column.`},
  box:{text:n=>`${n} cannot be twice in a 3 by 3 area.`}
};

function findConflictCellElement(cellInfo){
  if(!cellInfo) return null;
  const pel=[...document.querySelectorAll('.piece.board-piece')].find(el=>Number(el.dataset.id)===cellInfo.id);
  if(!pel) return null;
  return [...pel.querySelectorAll('.piece-cell')].find(el=>Number(el.dataset.dr)===cellInfo.dr && Number(el.dataset.dc)===cellInfo.dc) || null;
}

function updateConflictBubble(rule){
  const bubble=$('#conflictBubble');
  const text=$('#conflictBubbleText');
  const wrap=$('#boardWrap');
  if(!bubble || !text || !wrap) return;
  if(!rule || !RULE_COPY[rule.type] || !rule.cells?.length){
    bubble.hidden=true;
    bubble.dataset.conflictIdentity='';
    text.textContent='';
    return;
  }

  const identity=conflictIdentity(rule);
  text.textContent=RULE_COPY[rule.type].text(rule.n);
  bubble.hidden=false;
  bubble.dataset.conflictIdentity=identity;

  // v1.20.0: pin the Sudoku message to one of the visibly jiggling culprit
  // shapes. Prefer the shape recorded as causing the conflict, then any other
  // currently shaking participant. Never choose a remote Board corner merely
  // because it has more empty space.
  const ownerId=state.conflictShakeOwners.get(identity);
  const candidateIds=[];
  if(ownerId!=null) candidateIds.push(ownerId);
  for(const cell of rule.cells){
    if(state.conflictShakePieceIds.has(cell.id) && !candidateIds.includes(cell.id)) candidateIds.push(cell.id);
  }
  for(const cell of rule.cells){
    if(!candidateIds.includes(cell.id)) candidateIds.push(cell.id);
  }

  let anchorElement=null;
  for(const id of candidateIds){
    const el=wrap.querySelector(`.piece.board-piece[data-id="${id}"]`);
    if(el){ anchorElement=el; break; }
  }
  if(!anchorElement){
    const targetInfo=rule.cells.find(x=>x.id===ownerId) || rule.cells[rule.cells.length-1];
    const target=findConflictCellElement(targetInfo);
    anchorElement=target?.closest('.piece') || target;
  }
  if(!anchorElement) return;

  requestAnimationFrame(()=>{
    if(bubble.hidden || bubble.dataset.conflictIdentity!==identity) return;
    const wrapRect=wrap.getBoundingClientRect();
    const anchorRect=anchorElement.getBoundingClientRect();
    const bubbleRect=bubble.getBoundingClientRect();
    const gap=7;
    const pad=6;
    const rel={
      left:anchorRect.left-wrapRect.left,
      top:anchorRect.top-wrapRect.top,
      right:anchorRect.right-wrapRect.left,
      bottom:anchorRect.bottom-wrapRect.top
    };
    const clampX=x=>Math.max(pad,Math.min(x,wrapRect.width-bubbleRect.width-pad));
    const clampY=y=>Math.max(pad,Math.min(y,wrapRect.height-bubbleRect.height-pad));

    // Only near-shape positions are considered. Above/below are preferred,
    // then the nearest side. Slight overlap with unrelated pieces is preferable
    // to detaching the message from the culprit.
    const candidates=[
      {side:'above', left:clampX(rel.left+(anchorRect.width-bubbleRect.width)/2), top:clampY(rel.top-bubbleRect.height-gap), pref:0},
      {side:'below', left:clampX(rel.left+(anchorRect.width-bubbleRect.width)/2), top:clampY(rel.bottom+gap), pref:5},
      {side:'left',  left:clampX(rel.left-bubbleRect.width-gap), top:clampY(rel.top+(anchorRect.height-bubbleRect.height)/2), pref:11},
      {side:'right', left:clampX(rel.right+gap), top:clampY(rel.top+(anchorRect.height-bubbleRect.height)/2), pref:11}
    ];

    const overlapArea=(a,b)=>Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
    const anchorBox={left:rel.left,top:rel.top,right:rel.right,bottom:rel.bottom};
    const pieces=[...wrap.querySelectorAll('.piece.board-piece')].map(el=>{
      const r=el.getBoundingClientRect();
      return {el,left:r.left-wrapRect.left,top:r.top-wrapRect.top,right:r.right-wrapRect.left,bottom:r.bottom-wrapRect.top};
    });

    let best=candidates[0], bestScore=Infinity;
    for(const c of candidates){
      const b={left:c.left,top:c.top,right:c.left+bubbleRect.width,bottom:c.top+bubbleRect.height};
      let score=c.pref;
      // Never cover the actual jiggling culprit if there is another nearby option.
      score += overlapArea(b,anchorBox)*100;
      // Avoid other pieces where practical, but closeness remains more important.
      for(const pr of pieces){
        if(pr.el===anchorElement) continue;
        score += overlapArea(b,pr)*0.35;
      }
      const bx=c.left+bubbleRect.width/2, by=c.top+bubbleRect.height/2;
      const ax=rel.left+anchorRect.width/2, ay=rel.top+anchorRect.height/2;
      score += Math.hypot(bx-ax,by-ay)*0.01;
      if(score<bestScore){bestScore=score;best=c;}
    }

    bubble.style.left=`${Math.round(best.left)}px`;
    bubble.style.top=`${Math.round(best.top)}px`;
    bubble.classList.remove('conflict-bubble-below-target','conflict-bubble-above-target');
  });
}

function updateConflictAlert(rule){
  const alert=$('#conflictAlert');
  const text=$('#conflictAlertText');

  // v16.1.0: Sudoku-rule text now lives beside the offending board cells.
  // The heading alert remains available for non-Sudoku feedback such as a
  // pinned starting shape, but Sudoku errors no longer make the player look up.
  if(alert && text){
    alert.hidden=true;
    text.textContent='';
    alert.dataset.conflictIdentity='';
    alert.classList.remove('conflict-alert-pulse','hint-alert-mode');
  }
  updateConflictBubble(rule);
}

function updateRackConflictLock(){
  const rackShell=document.querySelector('.rack-shell');
  if(!rackShell) return;
  const locked=!!state.activeTeachingConflict;
  rackShell.classList.toggle('rack-conflict-locked',locked);
  rackShell.setAttribute('aria-disabled', locked ? 'true' : 'false');
  rackShell.dataset.conflictLocked=locked ? 'true' : 'false';
}

function updatePlacementHintButton(){
  const btn=$('#placementHintBtn');
  const count=$('#placementHintCount');
  if(count) count.textContent=String(state.hintRemaining);
  if(!btn) return;
  const active=state.hintArmed || state.hintInUse;
  const rackHasMovableShapes=state.pieces.some(p=>!state.placed.has(p.id));
  const hasPendingSudokuError=!!state.activeTeachingConflict;
  // Checkpoint 18: keep Hint unavailable while there is unfinished Sudoku
  // housekeeping on the Board, or when there is nothing left in the Rack.
  // An already-active Hint session may still be cancelled normally.
  const disabled=!active && ((state.hintRemaining<=0) || !rackHasMovableShapes || hasPendingSudokuError);
  btn.disabled=disabled;
  btn.classList.toggle('hint-disabled',disabled);
  btn.classList.toggle('hint-active',active);
  btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  if(state.hintArmed){
    btn.title='Cancel hint';
    btn.setAttribute('aria-label', `Hint active. Tap to cancel. ${state.hintRemaining} remaining`);
  } else if(state.hintInUse){
    btn.title='Exit hint guidance';
    btn.setAttribute('aria-label', `Hint revealed. Tap to exit guidance. ${state.hintRemaining} remaining`);
  } else if(hasPendingSudokuError){
    btn.title='Fix the Sudoku error first';
    btn.setAttribute('aria-label', 'Hint unavailable while a Sudoku error is showing on the Board');
  } else if(!rackHasMovableShapes){
    btn.title='No rack shapes available';
    btn.setAttribute('aria-label', 'Hint unavailable because the Rack is empty');
  } else {
    btn.title='Show where a shape belongs';
    btn.setAttribute('aria-label', state.hintRemaining>0 ? `Use placement hint, ${state.hintRemaining} remaining` : 'No placement hints remaining');
  }
}


function pulseHintSelectedPiece(){
  if(state.hintSelectedId==null) return;
  $$(`.piece[data-id="${state.hintSelectedId}"]`).forEach(el=>{
    el.classList.remove('hint-reminder-pulse');
    void el.offsetWidth;
    el.classList.add('hint-reminder-pulse');
    setTimeout(()=>el.classList.remove('hint-reminder-pulse'),720);
  });
}

function bumpWrongHintPiece(el){
  if(!el) return;
  el.classList.remove('hint-blocked-bump');
  void el.offsetWidth;
  el.classList.add('hint-blocked-bump');
  setTimeout(()=>el.classList.remove('hint-blocked-bump'),500);
}

function placeHintBubbleNearSelectedPiece(box){
  const piece=document.querySelector(`.rack .piece[data-id="${state.hintSelectedId}"]`) || document.querySelector(`.piece[data-id="${state.hintSelectedId}"]`);
  if(!piece) return false;
  box.classList.add('hint-follow-piece');
  box.classList.remove('hint-below-piece','hint-anchor-right');
  box.style.left='0px';
  box.style.top='0px';
  const pr=piece.getBoundingClientRect();
  const margin=10;
  const gap=12;
  const br=box.getBoundingClientRect();
  const clampX=x=>Math.max(margin,Math.min(x,window.innerWidth-br.width-margin));
  const clampY=y=>Math.max(margin,Math.min(y,window.innerHeight-br.height-margin));
  const candidates=[
    {left:pr.right+gap,top:pr.top+(pr.height-br.height)/2,side:'right'},
    {left:pr.left-br.width-gap,top:pr.top+(pr.height-br.height)/2,side:'left'},
    {left:pr.left+(pr.width-br.width)/2,top:pr.top-br.height-gap,side:'above'},
    {left:pr.left+(pr.width-br.width)/2,top:pr.bottom+gap,side:'below'}
  ].map(c=>({...c,left:clampX(c.left),top:clampY(c.top)}));
  const overlapArea=(a,b)=>Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
  let best=candidates[0],bestScore=Infinity;
  for(const c of candidates){
    const r={left:c.left,top:c.top,right:c.left+br.width,bottom:c.top+br.height};
    // Covering the selected shape is overwhelmingly worse than being slightly farther away.
    const overlap=overlapArea(r,pr);
    const cx=c.left+br.width/2,cy=c.top+br.height/2;
    const px=pr.left+pr.width/2,py=pr.top+pr.height/2;
    const score=overlap*100+Math.hypot(cx-px,cy-py)*0.02;
    if(score<bestScore){bestScore=score;best=c;}
  }
  if(best.side==='left') box.classList.add('hint-anchor-right');
  if(best.side==='below') box.classList.add('hint-below-piece');
  box.style.setProperty('left',`${Math.round(best.left)}px`,'important');
  box.style.setProperty('right','auto','important');
  box.style.setProperty('top',`${Math.round(best.top)}px`,'important');
  box.style.setProperty('bottom','auto','important');
  return true;
}

function updateHintViewportMetrics(){
  if(!document.body.classList.contains('portrait-ui') || !(state.hintArmed || state.hintInUse)) return;
  const play=document.querySelector('.play-layout');
  if(!play) return;
  const top=Math.max(0,play.getBoundingClientRect().top);
  const available=Math.max(360,window.innerHeight-top-4);
  const rackShellH=Math.max(135,Math.min(window.innerHeight*0.22,185));
  const rackChrome=58; // Rack heading + Hint instruction + panel padding.
  const boardChrome=88; // Board heading + Hint taskbar + panel padding.
  const boardSize=Math.max(185,Math.min(window.innerWidth-30,available-rackShellH-rackChrome-boardChrome-8));
  document.documentElement.style.setProperty('--hint-play-height',`${available}px`);
  document.documentElement.style.setProperty('--hint-board-size',`${boardSize}px`);
}

function ensureHintDimLayers(){
  const boardWrap=$('#boardWrap');
  if(boardWrap && !boardWrap.querySelector(':scope > .hint-board-dim-layer')){
    const layer=document.createElement('div');
    layer.className='hint-board-dim-layer';
    layer.setAttribute('aria-hidden','true');
    boardWrap.appendChild(layer);
  }
  const rackShell=document.querySelector('.rack-shell');
  if(rackShell && !rackShell.querySelector(':scope > .hint-rack-dim-layer')){
    const layer=document.createElement('div');
    layer.className='hint-rack-dim-layer';
    layer.setAttribute('aria-hidden','true');
    rackShell.appendChild(layer);
  }
}

function setHintModeClass(){
  ensureHintDimLayers();
  document.body.classList.toggle('placement-hint-mode', state.hintArmed || state.hintInUse);
  document.body.classList.toggle('hint-awaiting-selection', state.hintArmed);
  document.body.classList.toggle('hint-shape-selected', state.hintInUse);
  updateHintViewportMetrics();
}

function updateHintInstruction(){
  const box=$('#hintInstruction');
  const text=$('#hintInstructionText');
  const cancel=$('#hintCancelLabel');
  if(!box || !text) return;
  const active=state.hintArmed || state.hintInUse;
  if(cancel) cancel.hidden=true;
  box.hidden=true;
  box.classList.remove('hint-follow-piece','hint-below-piece','hint-anchor-right');
  box.style.removeProperty('left');
  box.style.removeProperty('right');
  box.style.removeProperty('top');
  box.style.removeProperty('bottom');
  if(!active) return;

  // v1.19.7: the Hint bulb itself is the cancel affordance. Keep the UI clean
  // and explain inside the first-step popup that tapping the bulb again cancels
  // without spending a hint. The Board remains dimmed while the Rack stays live.
  if(state.hintArmed){
    text.textContent='Tap a shape from the Rack Area to reveal where it can fit. Tap the Hint bulb again to cancel. No hint is used until a shape is selected.';
    box.hidden=false;
    return;
  }

  text.textContent='Drag the selected shape onto the board.';
  if(state.hintBubbleDismissed) return;
  box.hidden=false;
  if(!placeHintBubbleNearSelectedPiece(box)){
    box.classList.remove('hint-follow-piece','hint-below-piece','hint-anchor-right');
  }
}

function armPlacementHint(){
  if(state.hintArmed){ finishPlacementHint(); renderAll(false); return; }
  if(state.hintInUse){ finishPlacementHint(); renderAll(false); return; }
  if(state.hintRemaining<=0) return;
  if(state.activeTeachingConflict) return;
  if(!state.pieces.some(p=>!state.placed.has(p.id))) return;
  state.hintArmed=true;
  state.hintSelectedId=null;
  state.hintBubbleDismissed=false;
  setHintModeClass();
  updateHintInstruction();
  updatePlacementHintButton();
  updateConflictAlert(null);
  renderAll(false);
}

function revealPlacementHintForPiece(id,{deferRender=false}={}){
  if(!state.hintArmed || state.hintRemaining<=0) return false;
  const p=state.pieces.find(x=>x.id===id);
  if(!p || state.anchors.has(id) || state.placed.has(id)) return false;
  state.hintArmed=false;
  state.hintInUse=true;
  state.hintSelectedId=id;
  state.hintBubbleDismissed=false;
  state.hintRemaining--;
  setHintModeClass();
  renderGuides();
  activateCompatiblePieceGuides();
  updatePlacementHintButton();
  updateConflictAlert(null);
  if(deferRender){
    updateHintInstruction();
  } else {
    renderAll(false);
  }
  return true;
}

function finishPlacementHint(){
  if(!state.hintArmed && !state.hintInUse) return;
  state.hintArmed=false;
  state.hintInUse=false;
  state.hintSelectedId=null;
  state.hintBubbleDismissed=false;
  state.hintMovablePieceIds.clear();
  clearCompatiblePieceGuides();
  renderGuides();
  setHintModeClass();
  updateHintInstruction();
  updatePlacementHintButton();
  updateConflictAlert(null);
}

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
const TUTORIAL_STORAGE_PREFIX='suji.cp6.v607.help.';
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


function updateResponsiveLayout(){
  const viewportWidth=window.visualViewport?.width || window.innerWidth;
  const viewportHeight=window.visualViewport?.height || window.innerHeight;
  const landscape = viewportWidth >= 760 && viewportWidth > viewportHeight;
  document.body.classList.toggle('landscape-ui', landscape);
  document.body.classList.toggle('portrait-ui', !landscape);

  const topbar=document.querySelector('.topbar');
  if(topbar){
    document.documentElement.style.setProperty('--suji-topbar-h', `${Math.ceil(topbar.getBoundingClientRect().height)}px`);
  }

  updateHintControlLocation();
  updatePlacementHintLocation(landscape);
  updatePortraitPlayHeight(landscape);
  updateLandscapePlayHeight(landscape);
}

function updateLandscapePlayHeight(landscape){
  const play=document.querySelector('.play-layout');
  if(!play) return;
  if(!landscape){
    play.style.removeProperty('--landscape-play-height');
    return;
  }
  const visualHeight=window.visualViewport?.height || window.innerHeight;
  const top=play.getBoundingClientRect().top;
  const safeBottom=6;
  const available=Math.max(230, Math.floor(visualHeight-top-safeBottom));
  play.style.setProperty('--landscape-play-height', `${available}px`);
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

function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
function padLevel(n){ return String(n).padStart(4,'0'); }
function mulberry32(a){ return function(){ let t=a+=0x6D2B79F5; t=Math.imul(t^t>>>15,t|1); t^=t+Math.imul(t^t>>>7,t|61); return ((t^t>>>14)>>>0)/4294967296; }; }
function shuffle(arr,rng){ arr=[...arr]; for(let i=arr.length-1;i>0;i--){ const j=Math.floor(rng()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; } return arr; }

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

// Checkpoint #11: choose one of ten fixed, prevalidated tessellations.
// Levels 1-10 use Patterns 1-10; the cycle repeats every ten levels.
// The Sudoku and picture still vary by level, while the physical board decomposition
// remains predictable and reusable.
function makePieces(seed, sudoku){
  const pattern=sujiPatternForLevel(seed);
  const raw=pattern.pieces.map((def,id)=>({
    id,
    type:def.type,
    cells:def.cells.map(([r,c])=>[r,c]),
    home:{r:def.home[0],c:def.home[1]},
    patternId:pattern.id
  }));

  raw.forEach(p=>{
    p.tiles=p.cells.map(([dr,dc])=>({
      dr,dc,
      srcR:p.home.r+dr, srcC:p.home.c+dc,
      n:sudoku[p.home.r+dr][p.home.c+dc]
    }));
  });

  // Rack order can still vary deterministically by level even though the tessellation is fixed.
  const rng=mulberry32((seed^0x9e3779b9)>>>0);
  const shuffled=shuffle(raw,rng);
  shuffled.forEach((p,i)=>p.rackIndex=i);
  return shuffled;
}

function pieceBounds(p){
  const maxR=Math.max(...p.cells.map(x=>x[0])), maxC=Math.max(...p.cells.map(x=>x[1]));
  return {rows:maxR+1,cols:maxC+1};
}

function shapeKey(p){
  return p.cells
    .map(([r,c])=>`${r},${c}`)
    .sort()
    .join('|');
}

function placeholderOccupied(targetPiece, ignoreId=null){
  const targetCells = new Set(
    targetPiece.cells.map(([dr,dc])=>`${targetPiece.home.r+dr}:${targetPiece.home.c+dc}`)
  );

  for(const [id,pos] of state.placed){
    if(id===ignoreId) continue;
    const p=state.pieces.find(x=>x.id===id);
    for(const [dr,dc] of p.cells){
      if(targetCells.has(`${pos.r+dr}:${pos.c+dc}`)) return true;
    }
  }
  return false;
}

function getBlockingPieceIds(targetPiece, ignoreId=null){
  const targetCells = new Set(
    targetPiece.cells.map(([dr,dc])=>`${targetPiece.home.r+dr}:${targetPiece.home.c+dc}`)
  );
  const blockers=new Set();

  for(const [id,pos] of state.placed){
    if(id===ignoreId) continue;
    const p=state.pieces.find(x=>x.id===id);
    if(!p) continue;
    for(const [dr,dc] of p.cells){
      if(targetCells.has(`${pos.r+dr}:${pos.c+dc}`)){
        blockers.add(id);
        break;
      }
    }
  }
  return blockers;
}

function blockerNeedsMoving(id){
  if(state.anchors.has(id)) return false;
  const p=state.pieces.find(x=>x.id===id);
  const pos=state.placed.get(id);
  if(!p || !pos) return false;
  // Any piece already sitting in its own canonical home is treated as correct and
  // should never be suggested as an obstruction to move away.
  return !(pos.r===p.home.r && pos.c===p.home.c);
}

function suppressBlockedHintDestination(blockingIds){
  if(!blockingIds || blockingIds.size===0) return false;
  // Hide the blocked candidate only when there is nothing useful for the player
  // to move: every blocker is either locked or already correctly placed.
  return ![...blockingIds].some(blockerNeedsMoving);
}

function clearHintBlockerEmphasis(){
  $$('.piece.board-piece.hint-blocker-move').forEach(el=>el.classList.remove('hint-blocker-move'));
}

function emphasizeMovableBlockers(blockingIds){
  if(!blockingIds) return;
  for(const id of blockingIds){
    if(!blockerNeedsMoving(id)) continue;
    $$(`.piece.board-piece[data-id="${id}"]`).forEach(el=>el.classList.add('hint-blocker-move'));
  }
}

function clearBlockedHintOverlays(){
  $$('.hint-blocked-shape-overlay').forEach(el=>el.remove());
}

function addBlockedHintOverlay(targetPiece){
  const wrap=$('#boardWrap');
  if(!wrap || !targetPiece) return;
  const br=board.getBoundingClientRect();
  const wr=wrap.getBoundingClientRect();
  const cell=br.width/9;
  const overlay=document.createElement('div');
  overlay.className='hint-blocked-shape-overlay';
  overlay.dataset.guideId=targetPiece.id;
  overlay.style.left=(br.left-wr.left + targetPiece.home.c*cell)+'px';
  overlay.style.top=(br.top-wr.top + targetPiece.home.r*cell)+'px';
  const b=pieceBounds(targetPiece);
  overlay.style.width=(b.cols*cell)+'px';
  overlay.style.height=(b.rows*cell)+'px';
  for(const [dr,dc] of targetPiece.cells){
    const tile=document.createElement('span');
    tile.className='hint-blocked-shape-tile';
    tile.style.left=(dc*cell)+'px';
    tile.style.top=(dr*cell)+'px';
    tile.style.width=cell+'px';
    tile.style.height=cell+'px';
    overlay.appendChild(tile);
  }
  wrap.appendChild(overlay);
}

function clearGuideHover(){
  $$('.guide-piece.guide-hover').forEach(g=>g.classList.remove('guide-hover'));
  $('#boardWrap')?.classList.remove('guide-focus-active');
  if(drag) drag.guideTarget=null;
}

// Checkpoint #11 v11.0.1: Pieces Guide is intentionally quiet until a piece is grabbed.
// At drag start, every FREE predefined home slot with the exact same fixed-orientation
// silhouette is illuminated. These are the only board destinations accepted while
// Pieces Guide is ON. Guides OFF continues to use unrestricted geometric placement.
function activateCompatiblePieceGuides(){
  $('#boardWrap')?.classList.remove('guide-focus-active');
  clearHintBlockerEmphasis();
  clearBlockedHintOverlays();
  const selectedPiece=state.pieces.find(x=>x.id===state.hintSelectedId);
  const wantedShape=selectedPiece ? shapeKey(selectedPiece) : null;
  $$('.guide-piece').forEach(el=>{
    el.classList.remove('guide-compatible','guide-hover','hint-destination','hint-occupied-destination');
    if(!state.hintInUse || state.hintSelectedId==null || !wantedShape) return;
    if(el.dataset.shapeKey!==wantedShape) return;
    const targetId=+el.dataset.guideId;
    const targetPiece=state.pieces.find(x=>x.id===targetId);
    if(!targetPiece) return;

    // Checkpoint 16 v16.1.2: Hint Mode reveals every matching home, even when
    // another board shape is currently covering it. Occupied homes are visibly
    // marked but remain unavailable for snap until the blocking shape is moved.
    const occupied=placeholderOccupied(targetPiece,state.hintSelectedId);
    if(occupied){
      const blockingIds=getBlockingPieceIds(targetPiece,state.hintSelectedId);
      if(suppressBlockedHintDestination(blockingIds)) return;
      emphasizeMovableBlockers(blockingIds);
      addBlockedHintOverlay(targetPiece);
    }
    el.classList.add('guide-compatible','hint-destination');
    if(occupied) el.classList.add('hint-occupied-destination');
  });
}

function clearCompatiblePieceGuides(){
  clearHintBlockerEmphasis();
  clearBlockedHintOverlays();
  $$('.guide-piece.guide-compatible, .guide-piece.guide-hover, .guide-piece.hint-destination, .guide-piece.hint-occupied-destination').forEach(el=>{
    el.classList.remove('guide-compatible','guide-hover','hint-destination','hint-occupied-destination');
  });
  $('#boardWrap')?.classList.remove('guide-focus-active');
  if(drag) drag.guideTarget=null;
}

function pieceBlocksVisibleHintDestination(pieceId,pos){
  if(!state.hintInUse || state.hintSelectedId==null || !pos) return false;
  const selectedPiece=state.pieces.find(x=>x.id===state.hintSelectedId);
  const movingPiece=state.pieces.find(x=>x.id===pieceId);
  if(!selectedPiece || !movingPiece) return false;

  const wantedShape=shapeKey(selectedPiece);
  const occupiedCells=new Set(
    movingPiece.cells.map(([dr,dc])=>`${pos.r+dr}:${pos.c+dc}`)
  );

  return state.pieces.some(targetPiece=>{
    if(shapeKey(targetPiece)!==wantedShape) return false;
    return targetPiece.cells.some(([dr,dc])=>
      occupiedCells.has(`${targetPiece.home.r+dr}:${targetPiece.home.c+dc}`)
    );
  });
}

function findGuideTargetForDrag(left, top){
  if(!state.hintInUse || !drag || state.hintSelectedId!==drag.id) return null;

  const ghostW=drag.ghost.getBoundingClientRect().width;
  const ghostH=drag.ghost.getBoundingClientRect().height;
  const gx1=left, gy1=top, gx2=left+ghostW, gy2=top+ghostH;
  const gArea=Math.max(1,ghostW*ghostH);

  let best=null;
  let bestScore=0;
  const wantedShape=shapeKey(drag.p);

  for(const el of $$('.guide-piece')){
    if(!el.classList.contains('guide-compatible')) continue;
    if(el.dataset.shapeKey!==wantedShape) continue;

    const targetId=+el.dataset.guideId;
    const targetPiece=state.pieces.find(x=>x.id===targetId);
    if(!targetPiece) continue;
    if(placeholderOccupied(targetPiece,drag.id)) continue;

    const r=el.getBoundingClientRect();
    const ix=Math.max(0,Math.min(gx2,r.right)-Math.max(gx1,r.left));
    const iy=Math.max(0,Math.min(gy2,r.bottom)-Math.max(gy1,r.top));
    const overlap=(ix*iy)/gArea;

    const gcx=(gx1+gx2)/2, gcy=(gy1+gy2)/2;
    const centerInside=gcx>=r.left && gcx<=r.right && gcy>=r.top && gcy<=r.bottom;
    const score=centerInside ? Math.max(.75,overlap) : overlap;

    if(score>bestScore && score>=.22){
      bestScore=score;
      best={el,targetPiece};
    }
  }
  return best;
}
function hasManualProgress(){ return state.manualMoves>0; }

let levelResetEpoch=0;

function cancelAnchorFlights(){
  document.querySelectorAll('.anchor-flight').forEach(el=>{
    try{ el.getAnimations().forEach(a=>a.cancel()); }catch(_){}
    el.remove();
  });
}

async function findImage(level){
  // For the curated onboarding artwork (Levels 1–5), use direct resource paths.
  // This avoids file:// / local-open issues where a HEAD request may fail even
  // though the image exists beside the HTML package.
  if(level>=1 && level<=5){
    return `resources/Image_${padLevel(level)}.png`;
  }
  const base='resources/Image_'+padLevel(level);
  for(const ext of ['png','jpg','jpeg','webp']){
    const url=base+'.'+ext;
    try{
      const res=await fetch(url,{method:'HEAD',cache:'no-store'});
      if(res.ok) return url;
    }catch(e){}
  }
  return null;
}

function buildBoard(){
  board.innerHTML='';
  for(let r=0;r<9;r++) for(let c=0;c<9;c++){
    const cell=document.createElement('div');
    cell.className='board-cell';
    cell.dataset.r=r; cell.dataset.c=c;
    board.appendChild(cell);
  }
}

function renderGuides(){
  $$('.guide-piece').forEach(x=>x.remove());
  $('#boardWrap').classList.toggle('guides-off', !state.hintInUse);
  if(!state.hintInUse) return;
  const br=board.getBoundingClientRect();
  const cell=br.width/9;
  for(const p of state.pieces){
    const b=pieceBounds(p);
    const g=document.createElement('div');
    g.className=`guide-piece guide-${p.type}`;
    g.dataset.guideId=p.id;
    g.dataset.shapeKey=shapeKey(p);
    if(placeholderOccupied(p)) g.classList.add('guide-occupied');
    g.style.left=(p.home.c*cell)+'px';
    g.style.top=(p.home.r*cell)+'px';
    g.style.width=(b.cols*cell)+'px';
    g.style.height=(b.rows*cell)+'px';
    for(const [dr,dc] of p.cells){
      const tile=document.createElement('span');
      tile.className='guide-tile';
      tile.style.left=(dc*cell)+'px'; tile.style.top=(dr*cell)+'px';
      tile.style.width=cell+'px'; tile.style.height=cell+'px';
      g.appendChild(tile);
    }
    board.parentElement.appendChild(g);
  }
}

function chooseAnchors(){
  // Starting hints must be meaningful, so never use a 1x1 piece as a free opening hint.
  // The opening 1 / 2 / 3 system-given hints are chosen only from larger tetrominoes.
  const candidates=state.pieces.filter(p=>p.cells.length>1);
  const rng=mulberry32((state.level*1103515245 + state.hints*9973)>>>0);
  return new Set(shuffle(candidates,rng).slice(0,state.hints).map(p=>p.id));
}

function pieceElement(p, cellPx, location='rack'){
  const b=pieceBounds(p);
  const el=document.createElement('div');
  el.className=`piece piece-${p.type} ${location==='board'?'board-piece':''} ${state.picture&&state.imageURL?'picture':''}`;
  if(location==='board' && state.conflictShakePieceIds.has(p.id)) el.classList.add('conflict-piece-shake');
  el.dataset.id=p.id;
  el.style.setProperty('--piece-cell',cellPx+'px');
  el.style.width=(b.cols*cellPx)+'px'; el.style.height=(b.rows*cellPx)+'px';
  if(state.picture&&state.imageURL) el.style.setProperty('--img',`url("${state.imageURL}")`);
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
      if(!best || usedH < best.usedH) best={placed,usedH};
    }
  }
  return best;
}

function buildRackLayout(pieces, W, H, landscape, minCell=18){
  const gap = landscape ? 8 : 6;

  // Find the largest readable piece cell size that actually fits this rack.
  // Unlike the previous conservative slot system, this allows pieces to grow
  // aggressively whenever the user gives the rack more space.
  let low=minCell, high=72, best=null;

  while(low<=high){
    const mid=Math.floor((low+high)/2);
    const attempt=tryPackRack(pieces,W,H,mid,gap);
    if(attempt){
      best=attempt;
      low=mid+1;
    } else {
      high=mid-1;
    }
  }

  // Safety fallback.
  if(!best){
    best=tryPackRack(pieces,W,H,minCell,4) || {placed:[],usedH:H};
  }

  const map=new Map();
  for(const item of best.placed){
    map.set(item.p.id,{x:item.x,y:item.y,cell:item.cell});
  }

  return {map,usedH:best.usedH,cell:best.placed[0]?.cell || 18};
}

function renderAll(animateAnchors=false){
  renderGuides();
  $$('.piece.board-piece').forEach(x=>x.remove());
  rack.innerHTML='';
  const boardRect=board.getBoundingClientRect(), cell=boardRect.width/9;
  const rackShell=document.querySelector('.rack-shell');
  const rackSection=document.querySelector('.rack-section');
  let rackPieces=state.pieces.filter(p=>!state.placed.has(p.id));
  const landscape=document.body.classList.contains('landscape-ui');
  const compactHintRack=!landscape && (state.hintArmed || state.hintInUse);

  // In landscape, CSS gives Rack exactly the same frame height as Board.
  // In portrait, Rack takes the full available width and grows only as tall as needed.
  let rackRect=rack.getBoundingClientRect();

  if(!landscape){
    // Checkpoint 17.0.1: portrait Rack is a bounded bottom tray. Never let it
    // grow the page vertically; packing adapts to the tray instead.
    const playHeight=document.querySelector('.play-layout')?.getBoundingClientRect().height || window.innerHeight;
    const targetMin=compactHintRack
      ? Math.max(118, Math.min(playHeight*0.20, 160))
      : Math.max(145, Math.min(playHeight*0.25, 205));
    rackShell.style.height=targetMin+'px';
    rackShell.style.minHeight='0px';
  } else {
    rackShell.style.height='';
    rackShell.style.minHeight='0px';
  }

  // Allow layout to settle before packing.
  rackRect=rack.getBoundingClientRect();

  let layout=buildRackLayout(
    rackPieces,
    Math.max(80,rackRect.width),
    Math.max(120,rackRect.height),
    landscape,
    compactHintRack ? 12 : 18
  );

  // Portrait deliberately does not grow the Rack vertically. A smaller packed
  // cell is preferable to forcing the player to scroll between Board and Rack.

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

async function animateAnchorsFromRack(epoch){
  const ids=[...state.anchors];

  // This animation belongs only to the reset that created it.
  if(epoch!==levelResetEpoch) return;

  state.placed.clear();
  renderAll(false);
  await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
  if(epoch!==levelResetEpoch) return;

  const br=board.getBoundingClientRect();
  const boardCell=br.width/9;

  for(let i=0;i<ids.length;i++){
    if(epoch!==levelResetEpoch) return;

    const id=ids[i];
    const p=state.pieces.find(x=>x.id===id);
    const source=rack.querySelector(`.piece[data-id="${id}"]`);
    if(!p || !source) continue;

    const sr=source.getBoundingClientRect();
    const b=pieceBounds(p);
    const ghost=pieceElement(p,boardCell,'board');
    ghost.classList.add('anchor-flight');
    ghost.dataset.resetEpoch=String(epoch);
    ghost.style.position='fixed';
    ghost.style.left=sr.left+'px';
    ghost.style.top=sr.top+'px';
    ghost.style.zIndex='10000';
    ghost.style.pointerEvents='none';
    ghost.style.transformOrigin='top left';
    document.body.appendChild(ghost);
    source.style.visibility='hidden';

    const fullW=b.cols*boardCell, fullH=b.rows*boardCell;
    const sx=sr.width/fullW, sy=sr.height/fullH;
    const targetLeft=br.left+p.home.c*boardCell;
    const targetTop=br.top+p.home.r*boardCell;
    const dx=targetLeft-sr.left, dy=targetTop-sr.top;

    const animation=ghost.animate([
      {transform:`translate3d(0,0,0) scale(${sx},${sy})`,opacity:.96},
      {transform:`translate3d(${dx*.20}px,${dy*.20}px,0) scale(${sx*1.02},${sy*1.02})`,opacity:1,offset:.18},
      {transform:`translate3d(${dx}px,${dy}px,0) scale(1,1)`,opacity:1}
    ],{
      duration:520,
      delay:i*45,
      easing:'cubic-bezier(.22,.86,.25,1)',
      fill:'forwards'
    });

    await animation.finished.catch(()=>{});

    // A level change may have happened while this piece was flying.
    if(epoch!==levelResetEpoch){
      ghost.remove();
      return;
    }

    ghost.remove();
    state.placed.set(id,{...p.home});
    renderAll(false);

    await new Promise(r=>setTimeout(r,55));
    if(epoch!==levelResetEpoch) return;
  }
}

function fits(p,r,c,ignoreId=null){
  for(const [dr,dc] of p.cells){
    const rr=r+dr, cc=c+dc;
    if(rr<0||rr>8||cc<0||cc>8) return false;
    for(const [id,pos] of state.placed){
      if(id===ignoreId) continue;
      const op=state.pieces.find(x=>x.id===id);
      if(op.cells.some(([or,oc])=>pos.r+or===rr&&pos.c+oc===cc)) return false;
    }
  }
  return true;
}

let drag=null;

function showLockedFeedback(e){
  e.preventDefault();
  e.stopPropagation();
  const el = e.currentTarget;
  el.classList.remove('locked-bump');
  void el.offsetWidth;
  el.classList.add('locked-bump');
  setTimeout(()=>el.classList.remove('locked-bump'), 650);

  // Checkpoint 16 v16.1.1: locked-shape feedback uses the same local,
  // non-modal bubble treatment as Sudoku conflicts. Keep it beside the shape
  // the player actually tried to move instead of sending their eyes elsewhere.
  const alert=$('#conflictAlert');
  const alertText=$('#conflictAlertText');
  if(alert && alertText){
    alert.hidden=true;
    alertText.textContent='';
    alert.dataset.conflictIdentity='';
    alert.classList.remove('conflict-alert-pulse','hint-alert-mode');
  }

  const bubble=$('#conflictBubble');
  const text=$('#conflictBubbleText');
  const wrap=$('#boardWrap');
  if(!bubble || !text || !wrap) return;

  text.textContent='Locked Shapes cannot be moved.';
  bubble.hidden=false;
  bubble.dataset.conflictIdentity='locked-shape';

  requestAnimationFrame(()=>{
    if(bubble.hidden || bubble.dataset.conflictIdentity!=='locked-shape') return;
    const wrapRect=wrap.getBoundingClientRect();
    const targetRect=el.getBoundingClientRect();
    const bubbleRect=bubble.getBoundingClientRect();
    const gap=12;
    const pad=6;
    const centerX=targetRect.left-wrapRect.left+(targetRect.width/2);
    let left=centerX-(bubbleRect.width/2);
    left=Math.max(pad,Math.min(left,wrapRect.width-bubbleRect.width-pad));

    const roomAbove=targetRect.top-wrapRect.top;
    const roomBelow=wrapRect.bottom-targetRect.bottom;
    const placeAbove=roomAbove>=bubbleRect.height+gap || roomAbove>=roomBelow;
    let top=placeAbove
      ? targetRect.top-wrapRect.top-bubbleRect.height-gap
      : targetRect.bottom-wrapRect.top+gap;
    top=Math.max(pad,Math.min(top,wrapRect.height-bubbleRect.height-pad));

    bubble.style.left=`${left}px`;
    bubble.style.top=`${top}px`;
    bubble.classList.toggle('conflict-bubble-below-target',placeAbove);
    bubble.classList.toggle('conflict-bubble-above-target',!placeAbove);
  });
}


function startDrag(e){
  e.preventDefault();
  e.stopPropagation();

  const source = e.currentTarget;
  const id = +source.dataset.id;
  if(state.anchors.has(id)) return;

  // Grabbing any movable shape clears the locked-shape bubble. If a Sudoku
  // conflict is still active, validation will surface that rule again as needed.
  const conflictBubble=$('#conflictBubble');
  if(conflictBubble?.dataset.conflictIdentity==='locked-shape') updateConflictAlert(null);

  const p = state.pieces.find(x=>x.id===id);
  const oldPos = state.placed.get(id) ? {...state.placed.get(id)} : null;

  // Checkpoint 18.2.0: while a Sudoku conflict is active, do not allow a new
  // shape to leave the Rack. Board shapes remain fully movable, including back
  // into the Rack, so the player can resolve the conflict by removing/repositioning
  // a placed shape. This guard is behavioral; the Rack also receives a visual
  // greyed-out state from updateRackConflictLock().
  if(!oldPos && state.activeTeachingConflict){
    return;
  }

  // Snapshot #14 v14.2.4: the first press in Hint Mode selects the rack shape
  // and reveals its compatible homes, but the SAME pointer gesture may continue
  // immediately into a drag. The player is no longer forced to lift and press again.
  if(state.hintArmed && !oldPos){
    const revealed=revealPlacementHintForPiece(id,{deferRender:true});
    if(!revealed) return;
    source.classList.add('hint-selected-piece');
  }

  // Checkpoint 17 v17.0.6: while a hint is active, a movable board shape that
  // blocks one of the revealed destinations may be moved out of the way. Once
  // the player has moved that blocker, keep that same shape movable for the rest
  // of the active Hint session even if it is dropped into another wrong place.
  // This prevents a Sudoku-conflicting relocation from becoming temporarily locked.
  if(state.hintInUse && state.hintSelectedId!==id){
    const isPreviouslyReleasedBlocker=state.hintMovablePieceIds.has(id);
    const blocksHintDestination=!!oldPos && pieceBlocksVisibleHintDestination(id,oldPos);
    const mayMoveDuringHint=!!oldPos && (blocksHintDestination || isPreviouslyReleasedBlocker);
    if(!mayMoveDuringHint){
      bumpWrongHintPiece(source);
      pulseHintSelectedPiece();
      return;
    }
    if(blocksHintDestination) state.hintMovablePieceIds.add(id);
  }

  const draggingHintedPiece=state.hintInUse && state.hintSelectedId===id;

  // If the player grabs the piece that caused the active Sudoku conflict,
  // stop its reminder shake immediately. It will resume after the drop only
  // if that new placement still creates a Sudoku-rule conflict.
  if(state.conflictShakePieceIds.has(id)){
    state.conflictShakePieceIds.delete(id);
    source.classList.remove('conflict-piece-shake');
  }

  // A Hint-confirmed piece is only protected from misleading conflict shaking
  // while it remains in the exact home position confirmed by that Hint. If the
  // player chooses to move it, it becomes an ordinary uncertain piece again.
  const wasHintCorrect=state.hintCorrectPieces.has(id);
  if(wasHintCorrect) state.hintCorrectPieces.delete(id);

  const sourceRect = source.getBoundingClientRect();
  const boardCell = board.getBoundingClientRect().width / 9;
  const sourceCell = sourceRect.width / pieceBounds(p).cols;

  const ghost = pieceElement(p, boardCell, 'board');
  ghost.classList.add('drag-ghost');
  ghost.style.left = '0';
  ghost.style.top = '0';
  document.body.appendChild(ghost);

  // If the piece was already on the board, temporarily remove it while dragging.
  if(oldPos) state.placed.delete(id);

  source.style.visibility = 'hidden';

  drag = {
    id,
    p,
    source,
    ghost,
    oldPos,
    dx: (e.clientX - sourceRect.left) * (boardCell / sourceCell),
    dy: (e.clientY - sourceRect.top) * (boardCell / sourceCell),
    pointerId: e.pointerId,
    startClientX:e.clientX,
    startClientY:e.clientY,
    wasHintCorrect
  };

  // Keep the selected-shape bubble visible while the finger is still resting on
  // the shape. It disappears only after the shape actually starts moving away.
  if(draggingHintedPiece){
    state.hintBubbleDismissed=false;
    updateHintInstruction();
    activateCompatiblePieceGuides();
  }
  moveGhost(e);
  try{ source.setPointerCapture(e.pointerId); }catch(_){}

  document.body.style.overflow = 'hidden';
  window.addEventListener('pointermove', moveGhost, {passive:false});
  window.addEventListener('pointerup', endDrag, {once:true});
  window.addEventListener('pointercancel', cancelDrag, {once:true});
}

function moveGhost(e){
  if(!drag) return;
  e.preventDefault();

  const left=e.clientX-drag.dx;
  const top=e.clientY-drag.dy;
  drag.ghost.style.transform = `translate3d(${left}px,${top}px,0)`;

  if(state.hintInUse && state.hintSelectedId===drag.id && !state.hintBubbleDismissed){
    const moved=Math.hypot(e.clientX-drag.startClientX,e.clientY-drag.startClientY);
    if(moved>=7){
      state.hintBubbleDismissed=true;
      updateHintInstruction();
    }
  }

  if(!state.hintInUse || state.hintSelectedId!==drag.id){
    clearGuideHover();
    return;
  }

  clearGuideHover();
  const target=findGuideTargetForDrag(left,top);
  if(target){
    $('#boardWrap')?.classList.add('guide-focus-active');
    target.el.classList.add('guide-hover');
    drag.guideTarget=target.targetPiece;
  }
}

function endDrag(e){
  if(!drag) return;

  const br = board.getBoundingClientRect();
  const cell = br.width / 9;
  const rackShell = document.querySelector('.rack-shell');
  const rr = rackShell.getBoundingClientRect();

  const left = e.clientX - drag.dx;
  const top = e.clientY - drag.dy;
  const c = Math.round((left - br.left) / cell);
  const r = Math.round((top - br.top) / cell);

  const pointInRack =
    e.clientX >= rr.left && e.clientX <= rr.right &&
    e.clientY >= rr.top && e.clientY <= rr.bottom;

  // Returning to Rack always wins, regardless of guide state.
  if(pointInRack){
    state.lastDroppedId=drag.id;
    if(drag.oldPos) state.manualMoves++;
    const usedHint=state.hintInUse && state.hintSelectedId===drag.id;
    clearCompatiblePieceGuides();
    cleanupDrag();
    // Releasing the hinted shape back in the rack does not waste the revealed guidance.
    // The destination remains visible so the player can grab it again when ready.
    if(usedHint){ renderGuides(); activateCompatiblePieceGuides(); }
    renderAll(false);
    return;
  }

  // v1.19.3 Hint flow: after a Rack shape is selected the hint is consumed, but
  // guidance remains active until the selected shape is released on a highlighted
  // compatible destination. Dropping it elsewhere on the Board simply returns it
  // to the Rack so the same revealed Hint can be tried again.
  let hintCompleted=false;
  if(state.hintInUse && state.hintSelectedId===drag.id){
    const target=drag.guideTarget;
    if(target && fits(drag.p,target.home.r,target.home.c,drag.id)){
      state.placed.set(drag.id,{r:target.home.r,c:target.home.c});
      if(target.id===drag.id) state.hintCorrectPieces.add(drag.id);
      else state.hintCorrectPieces.delete(drag.id);
      state.lastDroppedId=drag.id;
      state.manualMoves++;
      hintCompleted=true;
    } else if(drag.oldPos){
      state.placed.set(drag.id,drag.oldPos);
      if(drag.wasHintCorrect) state.hintCorrectPieces.add(drag.id);
    }
    // With no old Board position and no highlighted destination, leaving the
    // piece unplaced makes renderAll() put it back in the Rack automatically.
  } else if(fits(drag.p, r, c, drag.id)){
    // Outside Hint Mode, normal free geometric placement remains unchanged.
    state.placed.set(drag.id,{r,c});
    state.lastDroppedId=drag.id;
    state.manualMoves++;
  } else if(drag.oldPos){
    state.placed.set(drag.id,drag.oldPos);
    if(drag.wasHintCorrect) state.hintCorrectPieces.add(drag.id);
  }

  const usedHint=state.hintInUse && state.hintSelectedId===drag.id;
  clearCompatiblePieceGuides();
  cleanupDrag();
  if(usedHint && hintCompleted){
    finishPlacementHint();
  } else if(usedHint){
    renderGuides();
    activateCompatiblePieceGuides();
    setHintModeClass();
    updateHintInstruction();
  }
  renderAll(false);
}

function cancelDrag(){
  if(!drag) return;
  if(drag.oldPos){
    state.placed.set(drag.id, drag.oldPos);
    if(drag.wasHintCorrect) state.hintCorrectPieces.add(drag.id);
  }
  const usedHint=state.hintInUse && state.hintSelectedId===drag.id;
  clearCompatiblePieceGuides();
  cleanupDrag();
  if(usedHint){ renderGuides(); activateCompatiblePieceGuides(); }
  renderAll(false);
}

function cleanupDrag(){
  window.removeEventListener('pointermove', moveGhost);
  if(drag?.ghost) drag.ghost.remove();
  if(drag?.source) drag.source.style.visibility = '';
  drag = null;
  document.body.style.overflow = '';
}

function pieceIsConflictShakeProtected(id){
  if(state.anchors.has(id)) return true;
  if(!state.hintCorrectPieces.has(id)) return false;

  // A silent Hint correctness lock is valid only while that exact piece is still
  // sitting in its own canonical home. This also self-heals any stale protection.
  const p=state.pieces.find(x=>x.id===id);
  const pos=state.placed.get(id);
  const stillAtOwnHome=!!(p && pos && pos.r===p.home.r && pos.c===p.home.c);
  if(!stillAtOwnHome) state.hintCorrectPieces.delete(id);
  return stillAtOwnHome;
}

function setConflictShakePiecesForRule(rule){
  state.conflictShakePieceIds.clear();
  if(!rule || !rule.cells) return;
  // Every movable/uncertain piece participating in the active Sudoku error shakes.
  // System anchors and Hint-confirmed-home pieces are known-correct references and
  // therefore never shake, even though their exact clashing cells may still be red.
  for(const x of rule.cells){
    if(state.placed.has(x.id) && !pieceIsConflictShakeProtected(x.id)){
      state.conflictShakePieceIds.add(x.id);
    }
  }
}

function applyConflictPieceShake(){
  $$('.piece.board-piece').forEach(el=>{
    el.classList.toggle('conflict-piece-shake', state.conflictShakePieceIds.has(Number(el.dataset.id)));
  });
}

function paintTeachingConflictCells(rule){
  $$('.piece-cell.teaching-conflict').forEach(el=>el.classList.remove('teaching-conflict'));
  if(!rule || !rule.cells) return;
  for(const x of rule.cells){
    const pel=[...document.querySelectorAll('.piece.board-piece')].find(el=>Number(el.dataset.id)===x.id);
    if(!pel) continue;
    const cell=[...pel.querySelectorAll('.piece-cell')].find(el=>Number(el.dataset.dr)===x.dr && Number(el.dataset.dc)===x.dc);
    if(cell) cell.classList.add('teaching-conflict');
  }
}

function validate(){
  // Clear previous per-cell conflict styling and tutorial context.
  $$('.piece-cell').forEach(el=>el.classList.remove('conflict','teaching-conflict'));
  clearRuleRegion();

  const occ=[];
  for(const [id,pos] of state.placed){
    const p=state.pieces.find(x=>x.id===id);
    p.tiles.forEach(t=>occ.push({id,dr:t.dr,dc:t.dc,r:pos.r+t.dr,c:pos.c+t.dc,n:t.n}));
  }

  const badKeys=new Set();
  const conflicts=[];
  const collect=(type,keyFn)=>{
    const groups=new Map();
    occ.forEach(x=>{ const k=keyFn(x); if(!groups.has(k)) groups.set(k,[]); groups.get(k).push(x); });
    for(const [key,arr] of groups){
      const nums=new Map();
      arr.forEach(x=>{ if(!nums.has(x.n)) nums.set(x.n,[]); nums.get(x.n).push(x); });
      for(const [n,xs] of nums){
        if(xs.length>1){
          xs.forEach(x=>badKeys.add(`${x.id}:${x.dr}:${x.dc}`));
          if(type==='row') conflicts.push({type,index:+key,n,cells:xs});
          if(type==='col') conflicts.push({type,index:+key,n,cells:xs});
          if(type==='box'){ const [br,bc]=key.split(',').map(Number); conflicts.push({type,br,bc,n,cells:xs}); }
        }
      }
    }
  };

  collect('row',x=>String(x.r));
  collect('col',x=>String(x.c));
  collect('box',x=>`${Math.floor(x.r/3)},${Math.floor(x.c/3)}`);

  // Apply conflict state directly to rendered board cells. Using direct piece lookup
  // avoids selector/overlay edge cases and keeps the red border anchored to the exact cells.
  for(const key of badKeys){
    const [id,dr,dc]=key.split(':').map(Number);
    const pel=[...document.querySelectorAll('.piece.board-piece')].find(el=>Number(el.dataset.id)===id);
    if(!pel) continue;
    const cell=[...pel.querySelectorAll('.piece-cell')].find(el=>Number(el.dataset.dr)===dr && Number(el.dataset.dc)===dc);
    if(cell) cell.classList.add('conflict');
  }

  // Keep at most ONE persistent visual error cue on every level. The yellow
  // row / column / 3x3 region and the pulsing conflicting numbers remain until
  // that exact conflict is resolved. Text teaching messages are still restricted
  // to tutorial Levels 1-5.
  if(state.activeTeachingConflict && !conflictStillExists(state.activeTeachingConflict,conflicts)){
    state.activeTeachingConflict=null;
    state.conflictShakePieceIds.clear();
    paintTeachingConflictCells(null);
    clearRuleRegion();
  }

  const droppedId=state.lastDroppedId;
  if(droppedId!==null){
    // Only a conflict involving the most recently dropped piece becomes the
    // active visual cue. Existing conflicts elsewhere do not steal focus.
    const relevant=conflicts.filter(c=>c.cells.some(x=>x.id===droppedId));
    if(relevant.length){
      const priority = state.level===4 ? ['col','row','box'] : state.level===5 ? ['box','row','col'] : ['row','col','box'];
      let chosen=null;
      for(const type of priority){
        chosen=relevant.find(c=>c.type===type);
        if(chosen) break;
      }
      if(chosen){
        state.activeTeachingConflict=chosen;
        // Shake every uncertain piece involved in the active Sudoku conflict.
        // If both pieces are movable, both shake. Locked anchors and Hint-confirmed
        // correct-home pieces never shake because that would falsely imply they
        // are the pieces the player should move.
        setConflictShakePiecesForRule(chosen);
        state.conflictShakeOwners.set(conflictIdentity(chosen), droppedId);
        paintRuleRegion(chosen);
        paintTeachingConflictCells(chosen);

        // Conflict warnings are now persistent, non-modal status messages.
        // There is no three-display limit: every active collision is reported.
      }
    } else if(state.activeTeachingConflict){
      paintRuleRegion(state.activeTeachingConflict);
      paintTeachingConflictCells(state.activeTeachingConflict);
    }
    state.lastDroppedId=null;
  } else if(state.activeTeachingConflict){
    paintRuleRegion(state.activeTeachingConflict);
    paintTeachingConflictCells(state.activeTeachingConflict);
  }

  // Always show the currently active collision at the top of the Board.
  // It is non-modal and disappears immediately when that conflict is fixed.
  if(state.activeTeachingConflict && conflictStillExists(state.activeTeachingConflict,conflicts)){
    setConflictShakePiecesForRule(state.activeTeachingConflict);
    updateConflictAlert(state.activeTeachingConflict);
  } else if(conflicts.length){
    // Safety fallback: if a previous conflict remains after the currently focused
    // conflict is removed, surface it again and restore the piece that originally
    // caused that rule violation as the reminder shaker.
    state.activeTeachingConflict=conflicts[0];
    // Recompute all uncertain participants for the resurfaced conflict. This avoids
    // blaming an arbitrary 'owner' when either of two movable pieces could be moved.
    setConflictShakePiecesForRule(state.activeTeachingConflict);
    paintRuleRegion(state.activeTeachingConflict);
    paintTeachingConflictCells(state.activeTeachingConflict);
    updateConflictAlert(state.activeTeachingConflict);
  } else {
    state.conflictShakePieceIds.clear();
    updateConflictAlert(null);
  }

  // Forget ownership records for conflicts that no longer exist.
  const liveIds=new Set(conflicts.map(conflictIdentity));
  for(const key of state.conflictShakeOwners.keys()) if(!liveIds.has(key)) state.conflictShakeOwners.delete(key);

  applyConflictPieceShake();
  updateRackConflictLock();
  return badKeys.size;
}
function updateStats(){
  updateMoveCounter();
  $('#levelBtn').textContent='Level '+padLevel(state.level);
  updatePlacementHintButton();
}

async function resetLevel(animate=true){
  const epoch=++levelResetEpoch;
  const level=state.level;
  const pictureReadyAt=Date.now()+2000;
  const firstVisit=!hasVisitedLevel(level);
  // Mark immediately so Reset, Replay, or returning through the selector never
  // retriggers the automatic picture introduction for this level.
  markLevelVisited(level);

  // Levels 1–5 are the guided introduction: Picture, Guides, and exactly 3 hints are mandatory.
  // The player's saved hint preference is preserved separately in localStorage and only
  // becomes effective from Level 6 onward. Replaying Levels 1–5 must always use 3 hints.
  if(level<=5){
    state.picture=true;
    state.guides=false;
    state.hints=3;
  } else {
    state.picture=readToggle('suji.picture', true);
    state.guides=false;
    state.hints=clamp(parseInt(localStorage.getItem('suji.hints') || '3',10),1,3);
  }

  // Immediately terminate anything belonging to the previous level.
  cancelAnchorFlights();
  if(drag){
    try{ cleanupDrag(); }catch(_){}
  }

  // Build the new level synchronously and clear the board immediately.
  setTutorialBodyClass();
  closeTutorialModal();
  state.lastTipSignature=null;
  state.tutorialRule=null;
  state.lastDroppedId=null;
  // Checkpoint 13 v13.0.2: placement hints are independent from the legacy
  // starting/locked-hint setting. Every level begins with exactly 5 placement hints.
  state.hintRemaining=5;
  state.hintArmed=false;
  state.hintInUse=false;
  state.hintSelectedId=null;
  state.hintBubbleDismissed=false;
  setHintModeClass();
  updateHintInstruction();
  state.activeTeachingConflict=null;
  state.conflictShakePieceIds.clear();
  state.conflictShakeOwners.clear();
  state.hintCorrectPieces.clear();
  paintTeachingConflictCells(null);
  clearRuleRegion();
  state.sudoku=tutorialSudoku(level);
  state.pieces=makePieces(level,state.sudoku);
  state.placed.clear();
  state.manualMoves=0;
  state.completionHandled=false;
  resetLevelTimerDisplay();
  state.imageURL=null;
  // Entering/replaying a lower level must never reduce progression.
  persistHighestLevelReached(level);
  updatePicturePreviewButton();
  closePicturePreview();
  state.anchors=chooseAnchors();

  renderControls();
  showTutorialDefault();
  renderAll(false);
  localStorage.setItem('suji.level',level);

  // v8.0.2: a fresh attempt starts timing as soon as the level is entered/restarted.
  // Date-based timing remains accurate even if the browser throttles the interval.
  startLevelTimer();

  // Image lookup is asynchronous; never let an older lookup overwrite a newer level.
  const imageURL=await findImage(level);
  if(epoch!==levelResetEpoch || level!==state.level) return;
  state.imageURL=imageURL;
  updatePicturePreviewButton();
  renderAll(false);

  if(animate){
    // First the informational intro modal, then the completed-picture preview.
    if(modalIsOpen()){
      await waitForTutorialModalClose();
      if(epoch!==levelResetEpoch || level!==state.level) return;
    }
    if(imageURL && firstVisit){
      // The completed picture is introduced automatically only once per level,
      // two seconds after the player first enters that fresh level. Replays and
      // previously visited levels rely on the picture button instead.
      const previewWait=Math.max(0,pictureReadyAt-Date.now());
      if(previewWait) await new Promise(resolve=>setTimeout(resolve,previewWait));
      if(epoch!==levelResetEpoch || level!==state.level) return;
      await showPicturePreview();
      if(epoch!==levelResetEpoch || level!==state.level) return;
    }
    await animateAnchorsFromRack(epoch);
  } else {
    if(epoch!==levelResetEpoch) return;
    for(const id of state.anchors){
      const p=state.pieces.find(x=>x.id===id);
      if(p) state.placed.set(id,{...p.home});
    }
    renderAll(false);
  }
  if(epoch===levelResetEpoch && level===state.level){
    updateLevelTimer();
  }
}

function renderControls(){
  const tutorialLocked=state.level<=5;
  const pictureGroup=document.querySelector('.option-group-picture');
  const hintGroup=$('#hintOptionGroup');
  if(pictureGroup) pictureGroup.hidden=false;
  if(hintGroup) hintGroup.hidden=true;

  const config=$('.settings-config');
  if(config){
    config.hidden=false;
    config.style.display='';
  }

  const settingsLockedNote=$('#settingsLockedNote');
  if(settingsLockedNote) settingsLockedNote.hidden=!tutorialLocked;
  const pictureLock=$('#pictureLock');
  if(pictureLock) pictureLock.hidden=!tutorialLocked;

  const pictureToggle=$('#pictureToggle');
  const pictureText=$('#pictureToggleText');
  if(pictureToggle){
    pictureToggle.classList.toggle('on',state.picture);
    pictureToggle.classList.toggle('off',!state.picture);
    pictureToggle.setAttribute('aria-pressed',String(state.picture));
    pictureToggle.disabled=false;
    pictureToggle.classList.toggle('settings-switch-locked',tutorialLocked);
    pictureToggle.setAttribute('aria-label',`Show Jigsaw Picture ${state.picture ? 'on' : 'off'}${tutorialLocked ? ', locked' : ''}`);
    pictureToggle.title=tutorialLocked ? 'Locked during tutorial levels' : 'Show or hide the jigsaw picture';
  }
  if(pictureText) pictureText.textContent='Show Jigsaw Picture';

  const hintValue=$('#hintValue');
  if(hintValue) hintValue.textContent=String(state.hints);

  const hintDownBtn=$('#hintDownBtn');
  const hintUpBtn=$('#hintUpBtn');
  if(hintDownBtn) hintDownBtn.disabled = state.hints<=1;
  if(hintUpBtn) hintUpBtn.disabled = state.hints>=3;

  updatePlacementHintButton();
}

function requestOptionChange(kind,value){
  const same=(kind==='picture'?state.picture===value:kind==='hints'?state.hints===value:state.guides===value);
  if(same)return;

  const label =
    kind==='picture' ? 'Picture / No Picture' :
    kind==='hints' ? 'Start Hints' :
    'Board Guide';

  const apply=async()=>{
    state[kind]=value;
    if(kind==='picture' || kind==='guides'){
      localStorage.setItem('suji.'+kind, value ? 'on' : 'off');
    } else {
      localStorage.setItem('suji.'+kind,String(value));
    }
    await resetLevel(true);
  };

  // No warning if the player has not moved/placed any piece themselves.
  if(!hasManualProgress()){
    apply();
    return;
  }

  state.pendingChange=apply;
  $('#confirmText').textContent=
    `Changing ${label} will restart Level ${padLevel(state.level)} and erase your current progress. Are you sure you want to continue?`;
  $('#confirmDialog').showModal();
}

$('#confirmDialog').addEventListener('close',()=>{
  if($('#confirmDialog').returnValue==='confirm'&&state.pendingChange)state.pendingChange();
  state.pendingChange=null;
});
function shakeSettingsPadlock(lockId){
  const lock=$(lockId);
  if(!lock) return;
  lock.classList.remove('settings-padlock-shake');
  void lock.offsetWidth;
  lock.classList.add('settings-padlock-shake');
}

const pictureToggle=$('#pictureToggle');
if(pictureToggle) pictureToggle.onclick=()=>{
  if(state.level<=5){
    shakeSettingsPadlock('#pictureLock');
    return;
  }
  requestOptionChange('picture',!state.picture);
};

const hintDownBtn=$('#hintDownBtn');
const hintUpBtn=$('#hintUpBtn');
if(hintDownBtn){
  hintDownBtn.onclick=()=>requestOptionChange('hints', Math.max(1,state.hints-1));
}
if(hintUpBtn){
  hintUpBtn.onclick=()=>requestOptionChange('hints', Math.min(3,state.hints+1));
}


function requestLevelChange(newLevel){
  newLevel=clamp(newLevel,1,9999);
  if(newLevel===state.level)return;

  const apply=async()=>{
    state.level=newLevel;
    await resetLevel(true);
  };

  if(!hasManualProgress()){
    apply();
    return;
  }

  state.pendingChange=apply;
  $('#confirmText').textContent=
    `Changing level will leave Level ${padLevel(state.level)} and erase your current progress. Are you sure you want to continue?`;
  $('#confirmDialog').showModal();
}

function isCompletedLevel(level){ return !!bestRecord(level); }
function canOpenLevel(level){
  // Progression is based on the highest level EVER reached, not the level currently being played.
  // Replaying Level 1 after reaching Level 2 must never re-lock Level 2.
  return level>=1 && level<=state.highestLevelReached;
}
function renderLevelPicker(){
  const page=state.levelPickerPage;
  const start=page*100+1;
  const end=Math.min(9999,start+99);

  // v8.0.7: make the selector an achievement / bragging screen, not only navigation.
  const historyEntries=Object.entries(state.levelHistory||{});
  const completedRecords=historyEntries
    .map(([level,record])=>({level:Number(level),record}))
    .filter(x=>Number.isFinite(x.level) && x.record && Number.isFinite(Number(x.record.bestSeconds)));
  const completedCount=completedRecords.length;
  const perfectCount=completedRecords.filter(x=>recordRating(x.record).stars===3).length;
  const totalStars=completedRecords.reduce((sum,x)=>sum+recordRating(x.record).stars,0);
  const allPerfect=completedCount>0 && perfectCount===completedCount;
  $('#levelHighestReached').textContent=state.highestLevelReached;
  $('#levelCompletedCount').textContent=completedCount;
  $('#levelPerfectCount').textContent=perfectCount;
  $('#levelAchievementHeadline').textContent=`Level ${state.highestLevelReached} reached`;
  $('#levelAchievementMessage').textContent=allPerfect
    ? `Perfect run so far, ${totalStars} stars collected with every cleared level at ★★★.`
    : (completedCount
      ? `${totalStars} stars collected · ${perfectCount} perfect ${perfectCount===1?'clear':'clears'}. Chase ★★★ on every level.`
      : 'Complete your first level and start building your star collection.');

  $('#levelPickerRange').textContent=`Levels ${start}–${end}`;
  $('#levelPageLabel').textContent=`${start}–${end}`;
  $('#levelPagePrev').disabled=page<=0;
  $('#levelPageNext').disabled=end>=9999;
  const grid=$('#levelGrid');
  grid.innerHTML='';
  for(let level=start;level<=end;level++){
    const record=bestRecord(level);
    const completed=!!record;
    const replayable=canOpenLevel(level);
    const current=level===state.level;
    const card=document.createElement('button');
    card.type='button';
    card.className='level-grid-card';
    if(completed) card.classList.add('completed');
    if(current) card.classList.add('current');
    if(!replayable && !current) card.classList.add('locked');
    card.setAttribute('aria-label', current ? `Current level ${level}` : (replayable ? `Open level ${level}` : `Level ${level} locked`));

    const number=document.createElement('strong');
    number.className='level-grid-number';
    number.textContent=`Level ${level}`;
    card.appendChild(number);

    if(completed){
      const rating=recordRating(record);
      const stars=document.createElement('span');
      stars.className=`level-grid-stars stars-${rating.stars}`;
      stars.textContent=starsText(rating.stars);
      stars.setAttribute('aria-label',`${rating.stars} star rating`);
      const summary=document.createElement('span');
      summary.className='level-grid-summary';
      summary.textContent=`${formatDurationMinutes(record.bestSeconds)} · ${Number.isFinite(Number(record.moves)) ? Number(record.moves) : '—'} moves`;
      card.append(stars,summary);
    }else if(!replayable && !current){
      // Only levels ABOVE highest_level_reached are locked.
      // An unlocked but not-yet-completed level must never display a padlock.
      const lock=document.createElement('span');
      lock.className='level-grid-lock';
      lock.textContent='🔒';
      card.appendChild(lock);
    }
    if(current){
      const here=document.createElement('span');
      here.className='level-grid-current';
      here.textContent='Current';
      card.appendChild(here);
    }
    card.onclick=()=>{
      if(current){
        $('#levelDialog').close();
        return;
      }
      if(replayable){
        $('#levelDialog').close();
        requestLevelChange(level);
        return;
      }
      card.classList.remove('locked-shake');
      void card.offsetWidth;
      card.classList.add('locked-shake');
      setTimeout(()=>card.classList.remove('locked-shake'),520);
    };
    grid.appendChild(card);
  }
}
function openLevelPicker(){
  state.levelPickerPage=Math.floor((Math.max(1,state.level)-1)/100);
  renderLevelPicker();
  $('#levelDialog').showModal();
}

async function checkForLevelCompletion(){
  if(state.completionHandled || !state.levelStartedAt) return;
  if(state.placed.size!==state.pieces.length) return;
  const solved=state.pieces.every(p=>{
    const pos=state.placed.get(p.id);
    return pos && pos.r===p.home.r && pos.c===p.home.c;
  });
  if(!solved) return;

  state.completionHandled=true;
  stopLevelTimer();
  updateLevelTimer();

  const completedLevel=state.level;
  const elapsedSeconds=Math.max(1,Math.round((Date.now()-state.levelStartedAt)/1000));
  const moves=Math.max(0,Number(state.manualMoves)||0);
  const rating=ratingForAttempt(elapsedSeconds,moves||1);
  const previous=bestRecord(completedLevel);
  const prevRating=recordRating(previous);

  // Store the strongest complete attempt. Rating wins first; ties prefer faster time,
  // then fewer moves. This lets Replay genuinely chase a higher star result.
  const improved=!previous ||
    rating.performance>prevRating.performance ||
    (rating.performance===prevRating.performance && elapsedSeconds<Number(previous.bestSeconds||Infinity)) ||
    (rating.performance===prevRating.performance && elapsedSeconds===Number(previous.bestSeconds||Infinity) && moves<Number(previous.moves||Infinity));

  if(improved){
    state.levelHistory[String(completedLevel)]={
      bestSeconds:elapsedSeconds,
      moves,
      performance:rating.performance,
      stars:rating.stars,
      completedAt:new Date().toISOString()
    };
    saveLevelHistory();
  }

  // Completing Level N permanently unlocks Level N+1 immediately.
  // This is monotonic: replaying an older level can never reduce the stored maximum.
  persistHighestLevelReached(Math.min(9999,completedLevel+1));

  const shown=bestRecord(completedLevel);
  const shownRating=recordRating(shown);
  $('#levelCompleteTitle').textContent=`Level ${padLevel(completedLevel)} complete`;
  $('#levelCompleteTime').textContent=formatDuration(elapsedSeconds);
  $('#levelCompleteMoves').textContent=String(moves);
  $('#levelCompleteStars').textContent=starsText(rating.stars);
  $('#levelCompleteStars').setAttribute('aria-label',`${rating.stars} star rating, efficiency ${rating.performance} out of 100`);
  $('#levelCompleteBest').textContent=improved
    ? (previous ? `New best: ${rating.performance}/100 efficiency` : `First result recorded · ${rating.performance}/100 efficiency`)
    : `Best remains ${starsText(shownRating.stars)} · ${formatDuration(shown.bestSeconds)} · ${Number.isFinite(Number(shown.moves))?shown.moves:'—'} moves`;

  const dialog=$('#levelCompleteDialog');
  if(!dialog.open) dialog.showModal();
}

$('#resetBtn').onclick=()=>resetLevel(true);
const levelCompleteOK=$('#levelCompleteOK');
if(levelCompleteOK) levelCompleteOK.onclick=async()=>{
  const completedLevel=state.level;
  const dialog=$('#levelCompleteDialog');
  if(dialog.open) dialog.close();
  if(completedLevel<9999){
    state.level=completedLevel+1;
    await resetLevel(true);
  }
};
const levelCompleteReplay=$('#levelCompleteReplay');
if(levelCompleteReplay) levelCompleteReplay.onclick=async()=>{
  const dialog=$('#levelCompleteDialog');
  if(dialog.open) dialog.close();
  await resetLevel(true);
};
const levelCompleteDialog=$('#levelCompleteDialog');
if(levelCompleteDialog) levelCompleteDialog.addEventListener('cancel',e=>e.preventDefault());
const levelSelectBtn=$('#levelSelectBtn');
if(levelSelectBtn) levelSelectBtn.onclick=openLevelPicker;
$('#levelPickerClose').onclick=()=>$('#levelDialog').close();
function jumpToLevelPage(){
  const input=$('#levelJumpInput');
  const error=$('#levelJumpError');
  const raw=String(input.value||'').trim();
  const level=Number(raw);
  if(!raw || !Number.isInteger(level) || level<1 || level>9999){
    error.textContent='Enter a whole number from 1 to 9999.';
    input.classList.remove('jump-invalid');
    void input.offsetWidth;
    input.classList.add('jump-invalid');
    return;
  }
  error.textContent='';
  input.classList.remove('jump-invalid');
  state.levelPickerPage=Math.floor((level-1)/100);
  renderLevelPicker();
  requestAnimationFrame(()=>{
    const grid=$('#levelGrid');
    if(grid) grid.scrollTop=0;
  });
}
$('#levelPagePrev').onclick=()=>{ state.levelPickerPage=Math.max(0,state.levelPickerPage-1); renderLevelPicker(); };
$('#levelPageNext').onclick=()=>{ state.levelPickerPage=Math.min(99,state.levelPickerPage+1); renderLevelPicker(); };
$('#levelJumpGo').onclick=jumpToLevelPage;
$('#levelJumpInput').addEventListener('keydown',event=>{
  if(event.key==='Enter'){
    event.preventDefault();
    jumpToLevelPage();
  }
});
$('#levelDialog').addEventListener('cancel',e=>{ e.preventDefault(); $('#levelDialog').close(); });

const tutorialClose=$('#tutorialClose');
if(tutorialClose) tutorialClose.addEventListener('click',closeTutorialModal);
const tutorialOk=$('#tutorialOk');
if(tutorialOk) tutorialOk.addEventListener('click',closeTutorialModal);
const tutorialModal=$('#tutorialModal');
if(tutorialModal){
  tutorialModal.addEventListener('cancel',e=>{ e.preventDefault(); closeTutorialModal(); });
}

$('#helpBtn').onclick=()=>$('#helpDialog').showModal();
const placementHintBtn=$('#placementHintBtn');
if(placementHintBtn) placementHintBtn.onclick=()=>armPlacementHint();

const picturePreviewBtn=$('#picturePreviewBtn');
if(picturePreviewBtn) picturePreviewBtn.onclick=()=>{ showPicturePreview(); };
const picturePreviewClose=$('#picturePreviewClose');
if(picturePreviewClose) picturePreviewClose.onclick=()=>requestClosePicturePreview();
const picturePreviewOverlay=$('#picturePreviewOverlay');
if(picturePreviewOverlay) picturePreviewOverlay.addEventListener('click',e=>{ if(e.target===picturePreviewOverlay) requestClosePicturePreview(); });
window.addEventListener('keydown',e=>{ if(e.key==='Escape'){ requestClosePicturePreview(); } });

window.addEventListener('resize',()=>{ updateResponsiveLayout(); setHintModeClass(); updateHintViewportMetrics(); updateStats(); renderAll(false); });
updateResponsiveLayout(); buildBoard(); resetLevel(true);
})();

// Checkpoint 16 v16.1.0 — UX/UI refinement: local Sudoku conflict bubbles.
(() => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(err => console.warn('SuJi service worker registration failed:', err));
    }, { once:true });
  }

  const promptEl = document.getElementById('pwaInstallPrompt');
  const installBtn = document.getElementById('pwaInstallBtn');
  const dismissBtn = document.getElementById('pwaInstallDismiss');
  const titleEl = document.getElementById('pwaInstallTitle');
  const textEl = document.getElementById('pwaInstallText');
  if (!promptEl || !installBtn || !dismissBtn) return;

  const standalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  const isiOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  let deferredInstallPrompt = null;
  const dismissedKey = 'suji_pwa_install_dismissed_v15';

  const showPrompt = () => {
    if (standalone() || sessionStorage.getItem(dismissedKey) === '1') return;
    promptEl.hidden = false;
  };
  const hidePrompt = () => { promptEl.hidden = true; };

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    promptEl.classList.remove('is-ios');
    titleEl.textContent = 'Install SuJi';
    textEl.textContent = 'Add SuJi to your Home Screen and play it like a normal app.';
    showPrompt();
  });

  installBtn.addEventListener('click', async () => {
    if (!deferredInstallPrompt) return;
    hidePrompt();
    deferredInstallPrompt.prompt();
    try { await deferredInstallPrompt.userChoice; } catch (_) {}
    deferredInstallPrompt = null;
  });

  dismissBtn.addEventListener('click', () => {
    hidePrompt();
    try { sessionStorage.setItem(dismissedKey, '1'); } catch (_) {}
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    hidePrompt();
    try { sessionStorage.removeItem(dismissedKey); } catch (_) {}
  });

  // iPhone/iPad Safari has no beforeinstallprompt event, so provide the native Add-to-Home-Screen route.
  if (isiOS && !standalone()) {
    promptEl.classList.add('is-ios');
    titleEl.textContent = 'Install SuJi';
    textEl.textContent = 'Tap Share, then “Add to Home Screen” to install SuJi.';
    window.setTimeout(showPrompt, 1400);
  }
})();

// Keep the local Sudoku callout attached to its conflict after responsive layout changes.
window.addEventListener('resize',()=>{
  if(state.activeTeachingConflict) updateConflictBubble(state.activeTeachingConflict);
});
