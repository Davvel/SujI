/** SuJi classic-compatible module wrapper. Source owner: js/ui/dialogs.js */
SuJiModules.define("js/ui/dialogs.js", function(require, exports){
'use strict';
/** SuJi Module: ui/dialogs — generic dialog wiring. */
const {$} = require("js/core/dom.js");
function initDialogs(){ const help=$('#helpBtn'); if(help) help.onclick=()=>$('#helpDialog').showModal(); }
exports["initDialogs"] = initDialogs;
});
