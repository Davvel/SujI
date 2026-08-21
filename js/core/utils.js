/** SuJi Module: core/utils — generic helpers only. */
import {app} from './app-context.js';
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

function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }

function padLevel(n){ return String(n).padStart(4,'0'); }

function mulberry32(a){ return function(){ let t=a+=0x6D2B79F5; t=Math.imul(t^t>>>15,t|1); t^=t+Math.imul(t^t>>>7,t|61); return ((t^t>>>14)>>>0)/4294967296; }; }

function shuffle(arr,rng){ arr=[...arr]; for(let i=arr.length-1;i>0;i--){ const j=Math.floor(rng()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; } return arr; }

Object.assign(app,{formatDuration,formatDurationMinutes,clamp,padLevel,mulberry32,shuffle});
export {formatDuration,formatDurationMinutes,clamp,padLevel,mulberry32,shuffle};
