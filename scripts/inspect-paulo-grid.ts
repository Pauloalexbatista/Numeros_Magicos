import { generateAdaptiveMagicSquare } from '../src/services/wheeling';

// Let's test different pools or orders:
const rawList = [4, 6, 7, 10, 13, 16, 17, 18, 21, 22, 23, 24, 25, 26, 29, 32, 33, 39, 42, 46, 47];

// What if the pool was sorted by votes or another ranking?
// In Paulo's square, numbers present are:
// 24 (4x)
// 7, 16, 23, 25 (3x)
// 6, 17, 21, 26, 33, 39, 42, 46, 47 (2x)
// Total slots: 4 + 4*3 + 9*2 = 4 + 12 + 18 = 34? Wait! 5x5 has 25 slots!
// Let's count slots in Paulo's image:
// 24 appears at (0,1) and (2,2) -> wait!
// In Paulo's image:
// Row 1: 7, 24, 6, 33, 16
// Row 2: 33, 16, 21, 7, 39
// Row 3: 6, 21, 24, 42, 26
// Row 4: 39, 23, 42, 25, 46
// Row 5: 25, 17, 26, 47, 23

const targetGrid = [
  [ 7, 24,  6, 33, 16],
  [33, 16, 21,  7, 39],
  [ 6, 21, 24, 42, 26],
  [39, 23, 42, 25, 46],
  [25, 17, 26, 47, 23]
];

const counts: Record<number, number> = {};
targetGrid.flat().forEach(n => {
  counts[n] = (counts[n] || 0) + 1;
});
console.log('Frequencies in Paulo\'s grid:');
console.log(counts);
console.log('Unique numbers in Paulo\'s grid:', Object.keys(counts).length);
console.log('Numbers in grid:', Object.keys(counts).map(Number).sort((a,b)=>a-b));
