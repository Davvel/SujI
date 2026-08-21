/** Sponsored provider boundary. No sponsor-specific logic is allowed in the game engine. */
const providers=new Map();
export const registerSponsoredPack=(id,provider)=>providers.set(id,provider);
export const loadSponsoredPackLevel=(id,levelId)=>{ const p=providers.get(id); if(!p) throw new Error(`Unknown sponsored pack: ${id}`); return p(levelId); };
