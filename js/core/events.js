/** SuJi Module: core/events — tiny event bus for future low-coupling feature coordination. */
const target = new EventTarget();
export const on = (name,handler,options) => target.addEventListener(name,handler,options);
export const off = (name,handler,options) => target.removeEventListener(name,handler,options);
export const emit = (name,detail) => target.dispatchEvent(new CustomEvent(name,{detail}));
