/** SuJi Module: core/dom — shared DOM lookup helpers only. */
export const $ = selector => document.querySelector(selector);
export const $$ = selector => [...document.querySelectorAll(selector)];
export const board = $('#board');
export const rack = $('#rack');
