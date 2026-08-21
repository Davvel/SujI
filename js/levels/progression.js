/** Level-system progression boundary. Storage remains in progress-store.js. */
import {state} from '../core/state.js';
export const canOpenLevel = level => Number(level)>=1 && Number(level)<=state.highestLevelReached;
export const highestLevelReached = () => state.highestLevelReached;
