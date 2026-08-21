import level001 from './tutorial/level-001.js';
import level002 from './tutorial/level-002.js';
import level003 from './tutorial/level-003.js';
import level004 from './tutorial/level-004.js';
import level005 from './tutorial/level-005.js';
import {normalizeTutorialLevel} from './types/tutorial-level.js';
import {getStandardLevel} from './standard/standard-level-provider.js';
const tutorials=new Map([level001,level002,level003,level004,level005].map(x=>[x.number,normalizeTutorialLevel(x)]));
export function resolveNumericLevel(level){ const n=Number(level)||1; return tutorials.get(n)||getStandardLevel(n); }
