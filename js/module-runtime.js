/**
 * SuJi lightweight module runtime.
 * Allows the specialised module files to work both from GitHub Pages/http(s)
 * and when index.html is opened directly from a local file:// path.
 */
(function(global){
  'use strict';
  const definitions=Object.create(null);
  const cache=Object.create(null);
  function define(id,factory){
    if(definitions[id]) throw new Error('Duplicate SuJi module: '+id);
    definitions[id]=factory;
  }
  function require(id){
    if(cache[id]) return cache[id].exports;
    const factory=definitions[id];
    if(!factory) throw new Error('SuJi module not loaded: '+id);
    const module={exports:{}};
    cache[id]=module;
    factory(require,module.exports,module);
    return module.exports;
  }
  global.SuJiModules=Object.freeze({define,require});
})(window);
