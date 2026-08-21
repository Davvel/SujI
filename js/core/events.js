/** SuJi classic-compatible module wrapper. Source owner: js/core/events.js */
SuJiModules.define("js/core/events.js", function(require, exports){
'use strict';
/** SuJi Module: core/events — tiny event bus for future low-coupling feature coordination. */
const target = new EventTarget();
const on = (name,handler,options) => target.addEventListener(name,handler,options);
const off = (name,handler,options) => target.removeEventListener(name,handler,options);
const emit = (name,detail) => target.dispatchEvent(new CustomEvent(name,{detail}));
exports["on"] = on;
exports["off"] = off;
exports["emit"] = emit;
});
