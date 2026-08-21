/**
 * SuJi Module: game/scoring
 * Migrated from the accepted 1.27.0 implementation with function bodies preserved.
 */
import {app} from '../core/app-context.js';
import {state} from '../core/state.js';
import {$,$$,board,rack} from '../core/dom.js';
import {TYPE_COLORS,TUTORIAL_LEVELS,RULE_COPY,GAME_CONFIG} from '../../config/game-config.js';
import {UI_CONFIG} from '../../config/ui-config.js';
import {STORAGE_KEYS} from '../../config/storage-keys.js';
const clamp=(...args)=>app.clamp(...args);

function scoreForSeconds(seconds){
  return Math.max(100,10000-Math.max(0,Math.round(seconds||0)));
}

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


Object.assign(app,{scoreForSeconds,performanceForAttempt,starsForPerformance,ratingForAttempt,starsText,recordRating});
export {scoreForSeconds,performanceForAttempt,starsForPerformance,ratingForAttempt,starsText,recordRating};
