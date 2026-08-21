window.Suji=window.Suji||{}; window.Suji.levels=window.Suji.levels||{};
const registry=new Map(); window.Suji.levels.registry={register:(type,provider)=>registry.set(type,provider),get:type=>registry.get(type),has:type=>registry.has(type)};
