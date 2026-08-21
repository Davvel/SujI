/** SuJi classic-compatible module wrapper. Source owner: js/core/dom.js */
SuJiModules.define("js/core/dom.js", function(require, exports){
'use strict';
/** SuJi Module: core/dom — shared DOM lookup helpers only. */
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const board = $('#board');
const rack = $('#rack');
exports["$"] = $;
exports["$$"] = $$;
exports["board"] = board;
exports["rack"] = rack;
});
