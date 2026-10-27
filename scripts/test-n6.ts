import { generateAdaptiveMagicSquare } from '../src/services/wheeling';

// Let's test with pool of 30 numbers for n=6
const pool30 = Array.from({ length: 30 }, (_, i) => i + 1);

console.log('Testing n=6 with 30 numbers...');
// We will test updating wheeling.ts
