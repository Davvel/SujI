/** Normalizes a tutorial definition into the common LevelDefinition contract. */
export function normalizeTutorialLevel(definition){ return Object.freeze({...definition,type:'tutorial'}); }
