/**
 * SuJi Module: core/app-context
 * Owns: lightweight public API registry used to decouple migrated modules.
 * Modules expose small APIs here; state remains owned by core/state.js.
 */
export const app = Object.create(null);
