import { keys as devKeys } from './dev.js';
import { keys as prodKeys } from './prod.js';

export const keys = process.env.NODE_ENV === 'production' ? prodKeys : devKeys;
