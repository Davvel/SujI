/** SuJi classic-compatible module wrapper. Source owner: js/features/level-picker.js */
SuJiModules.define("js/features/level-picker.js", function(require, exports){
'use strict';
/**
 * SuJi Module: features/level-picker
 * Migrated from the accepted 1.27.0 implementation with function bodies preserved.
 */
const {app} = require("js/core/app-context.js");
const {state} = require("js/core/state.js");
const {$, $$, board, rack} = require("js/core/dom.js");
const {TYPE_COLORS, TUTORIAL_LEVELS, RULE_COPY, GAME_CONFIG} = require("config/game-config.js");
const {UI_CONFIG} = require("config/ui-config.js");
const {STORAGE_KEYS} = require("config/storage-keys.js");
const bestRecord=(...args)=>app.bestRecord(...args);
const clamp=(...args)=>app.clamp(...args);
const formatDurationMinutes=(...args)=>app.formatDurationMinutes(...args);
const hasManualProgress=(...args)=>app.hasManualProgress(...args);
const padLevel=(...args)=>app.padLevel(...args);
const recordRating=(...args)=>app.recordRating(...args);
const resetLevel=(...args)=>app.resetLevel(...args);
const starsText=(...args)=>app.starsText(...args);

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


Object.assign(app,{requestLevelChange,isCompletedLevel,canOpenLevel,renderLevelPicker,openLevelPicker,jumpToLevelPage});

function initLevelPicker(){
  const levelSelectBtn=$('#levelSelectBtn'); if(levelSelectBtn) levelSelectBtn.onclick=openLevelPicker;
  $('#levelPickerClose').onclick=()=>$('#levelDialog').close();
  $('#levelPagePrev').onclick=()=>{ state.levelPickerPage=Math.max(0,state.levelPickerPage-1); renderLevelPicker(); };
  $('#levelPageNext').onclick=()=>{ state.levelPickerPage=Math.min(99,state.levelPickerPage+1); renderLevelPicker(); };
  $('#levelJumpGo').onclick=jumpToLevelPage;
  $('#levelJumpInput').addEventListener('keydown',event=>{ if(event.key==='Enter'){ event.preventDefault(); jumpToLevelPage(); } });
  $('#levelDialog').addEventListener('cancel',e=>{ e.preventDefault(); $('#levelDialog').close(); });
}
Object.assign(app,{initLevelPicker});
exports["requestLevelChange"] = requestLevelChange;
exports["isCompletedLevel"] = isCompletedLevel;
exports["canOpenLevel"] = canOpenLevel;
exports["renderLevelPicker"] = renderLevelPicker;
exports["openLevelPicker"] = openLevelPicker;
exports["jumpToLevelPage"] = jumpToLevelPage;
exports["initLevelPicker"] = initLevelPicker;
});
