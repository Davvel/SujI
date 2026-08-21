import {getPack} from './pack-registry.js';
export async function loadPackLevel(packId,levelId){
  const provider=getPack(packId); if(!provider) throw new Error(`Unknown SuJi pack: ${packId}`);
  return provider(levelId);
}
