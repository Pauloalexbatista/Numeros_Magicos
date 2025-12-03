
/**
 * Calculates the average of an array of numbers.
 */
export const calculateAverage = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((a, b) => a + b, 0);
  return Number((sum / numbers.length).toFixed(2));
};

/**
 * Calculates the range (amplitude) of an array of numbers (max - min).
 */
export const calculateRange = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  const min = Math.min(...numbers);
  const max = Math.max(...numbers);
  return max - min;
};

/**
 * Returns the parity pattern of stars (e.g., "PP", "PI").
 * P = Par (Even), I = Ímpar (Odd)
 */
export const getStarParity = (stars: number[]): string => {
  return stars.map(s => s % 2 === 0 ? 'P' : 'I').join('');
};

/**
 * Counts the number of prime numbers in the array.
 * Primes up to 50: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47
 */
export const countPrimes = (numbers: number[]): number => {
  const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
  return numbers.filter(n => primes.includes(n)).length;
};

/**
 * Returns the distribution of numbers by tens (0-9, 10-19, etc.).
 * Format: "n1-n2-n3-n4-n5-n6"
 */
export const getTensDistribution = (numbers: number[]): string => {
  const counts = [0, 0, 0, 0, 0, 0]; // 0-9, 10-19, 20-29, 30-39, 40-49, 50
  numbers.forEach(n => {
    if (n < 10) counts[0]++;
    else if (n < 20) counts[1]++;
    else if (n < 30) counts[2]++;
    else if (n < 40) counts[3]++;
    else if (n < 50) counts[4]++;
    else counts[5]++;
  });
  return counts.join('-');
};

/**
 * Returns the distribution of numbers by quadrants.
 * Q1: 1-12, Q2: 13-25, Q3: 26-37, Q4: 38-50
 */
export const getQuadrantsDistribution = (numbers: number[]): string => {
  const counts = [0, 0, 0, 0];
  numbers.forEach(n => {
    if (n <= 12) counts[0]++;
    else if (n <= 25) counts[1]++;
    else if (n <= 37) counts[2]++;
    else counts[3]++;
  });
  return counts.join('-');
};

/**
 * Counts the multiples of a specific divisor in the array.
 */
export const countMultiples = (numbers: number[], divisor: number): number => {
  return numbers.filter(n => n % divisor === 0).length;
};

/**
 * Calculates the Standard Deviation of an array of numbers.
 */
export const calculateStandardDeviation = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  const avg = calculateAverage(numbers);
  const squareDiffs = numbers.map(n => Math.pow(n - avg, 2));
  const avgSquareDiff = calculateAverage(squareDiffs);
  return Number(Math.sqrt(avgSquareDiff).toFixed(2));
};

/**
 * Calculates the Median of an array of numbers.
 */
export const calculateMedian = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
};

/**
 * Calculates the Mode(s) of an array of numbers.
 */
export const calculateMode = (numbers: number[]): number[] => {
  if (numbers.length === 0) return [];
  const counts: { [key: number]: number } = {};
  let maxFreq = 0;

  numbers.forEach(n => {
    counts[n] = (counts[n] || 0) + 1;
    if (counts[n] > maxFreq) maxFreq = counts[n];
  });

  if (maxFreq <= 1) return []; // No mode if all numbers appear once

  return Object.keys(counts)
    .map(Number)
    .filter(n => counts[n] === maxFreq)
    .sort((a, b) => a - b);
};

/**
 * Calculates the Average Delay of the numbers in a draw.
 * Delay = How many draws ago did this number last appear?
 * @param numbers The numbers in the current draw
 * @param pastDraws The history of draws *before* the current draw
 */
export const calculateAverageDelay = (numbers: number[], pastDraws: { numbers: number[] }[]): number => {
  if (pastDraws.length === 0) return 0;

  let totalDelay = 0;

  numbers.forEach(num => {
    let delay = 0;
    let found = false;

    // Look backwards through history
    for (let i = 0; i < pastDraws.length; i++) {
      delay++;
      if (pastDraws[i].numbers.includes(num)) {
        found = true;
        break;
      }
    }

    // If not found in provided history, assume a large delay or cap it?
    // For now, use the delay found (which might be the length of history if not found)
    totalDelay += delay;
  });

  return Number((totalDelay / numbers.length).toFixed(1));
};

/**
 * Visual Pattern Analysis
 * Based on a 5x10 grid layout (standard ticket)
 * Row 1: 1-5
 * Row 2: 6-10
 * ...
 * Row 10: 46-50
 */
export const getVisualPatterns = (numbers: number[]): { horizontal: number, vertical: number, diagonal: number } => {
  const gridWidth = 5;
  const gridHeight = 10;

  // Helper to get coordinates (row, col) 0-indexed
  const getCoords = (num: number) => {
    const n = num - 1; // 0-49
    return {
      row: Math.floor(n / gridWidth),
      col: n % gridWidth
    };
  };

  let horizontal = 0;
  let vertical = 0;
  let diagonal = 0;

  // Check every pair of numbers
  for (let i = 0; i < numbers.length; i++) {
    for (let j = i + 1; j < numbers.length; j++) {
      const p1 = getCoords(numbers[i]);
      const p2 = getCoords(numbers[j]);

      // Horizontal: Same row, adjacent columns (distance 1)
      if (p1.row === p2.row && Math.abs(p1.col - p2.col) === 1) {
        horizontal++;
      }

      // Vertical: Same column, adjacent rows (distance 1)
      if (p1.col === p2.col && Math.abs(p1.row - p2.row) === 1) {
        vertical++;
      }

      // Diagonal: Row distance 1, Col distance 1
      if (Math.abs(p1.row - p2.row) === 1 && Math.abs(p1.col - p2.col) === 1) {
        diagonal++;
      }
    }
  }

  return { horizontal, vertical, diagonal };
};

export const getDayOfWeek = (dateStr: string): number => {
  const date = new Date(dateStr);
  return date.getDay(); // 0=Sun, 1=Mon, 2=Tue, ..., 5=Fri, 6=Sat
};

export const getMonth = (dateStr: string): number => {
  const date = new Date(dateStr);
  return date.getMonth(); // 0=Jan, 11=Dec
};

export const countRepetitions = (current: number[], previous: number[]): number => {
  if (!previous || previous.length === 0) return 0;
  const prevSet = new Set(previous);
  return current.filter(num => prevSet.has(num)).length;
};
