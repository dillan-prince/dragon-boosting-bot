import { keys as devKeys } from './dev.js';
import { keys as prodKeys } from './prod.js';

console.log(process.env.NODE_ENV);

export const keys = process.env.NODE_ENV === 'production' ? prodKeys : devKeys;
