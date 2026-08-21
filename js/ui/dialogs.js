/** SuJi Module: ui/dialogs — generic dialog wiring. */
import {$} from '../core/dom.js';
export function initDialogs(){ const help=$('#helpBtn'); if(help) help.onclick=()=>$('#helpDialog').showModal(); }
