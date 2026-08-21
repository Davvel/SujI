/** SuJi Module: storage/preferences-store — persistent player option reads/writes. */
import {STORAGE_KEYS} from '../../config/storage-keys.js';
import {app} from '../core/app-context.js';
export function readToggle(key, defaultValue=true){
  const raw=localStorage.getItem(key);
  if(raw===null) return defaultValue;
  if(raw==='off' || raw==='false' || raw==='0') return false;
  if(raw==='on' || raw==='true' || raw==='1') return true;
  return defaultValue;
}
export function readPicturePreference(){ return readToggle(STORAGE_KEYS.picture,true); }
export function readHintPreference(){ return parseInt(localStorage.getItem(STORAGE_KEYS.hints)||'3',10); }
export function writePreference(name,value){
  const key=STORAGE_KEYS[name];
  if(!key) throw new Error(`Unknown SuJi preference ${name}`);
  localStorage.setItem(key,typeof value==='boolean'?(value?'on':'off'):String(value));
}

Object.assign(app,{readToggle,readPicturePreference,readHintPreference,writePreference});
