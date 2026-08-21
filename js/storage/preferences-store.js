/** SuJi classic-compatible module wrapper. Source owner: js/storage/preferences-store.js */
SuJiModules.define("js/storage/preferences-store.js", function(require, exports){
'use strict';
/** SuJi Module: storage/preferences-store — persistent player option reads/writes. */
const {STORAGE_KEYS} = require("config/storage-keys.js");
const {app} = require("js/core/app-context.js");
function readToggle(key, defaultValue=true){
  const raw=localStorage.getItem(key);
  if(raw===null) return defaultValue;
  if(raw==='off' || raw==='false' || raw==='0') return false;
  if(raw==='on' || raw==='true' || raw==='1') return true;
  return defaultValue;
}
function readPicturePreference(){ return readToggle(STORAGE_KEYS.picture,true); }
function readHintPreference(){ return parseInt(localStorage.getItem(STORAGE_KEYS.hints)||'3',10); }
function writePreference(name,value){
  const key=STORAGE_KEYS[name];
  if(!key) throw new Error(`Unknown SuJi preference ${name}`);
  localStorage.setItem(key,typeof value==='boolean'?(value?'on':'off'):String(value));
}

Object.assign(app,{readToggle,readPicturePreference,readHintPreference,writePreference});
exports["readToggle"] = readToggle;
exports["readPicturePreference"] = readPicturePreference;
exports["readHintPreference"] = readHintPreference;
exports["writePreference"] = writePreference;
});
