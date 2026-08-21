/** Registry for themed/photo packs. Packs can be added without editing the puzzle engine. */
const packs=new Map();
export const registerPack=(id,provider)=>packs.set(id,provider);
export const getPack=id=>packs.get(id)||null;
export const listPacks=()=>[...packs.keys()];
