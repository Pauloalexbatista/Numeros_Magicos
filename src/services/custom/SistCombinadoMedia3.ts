import { Draw } from '@prisma/client';
import { IPredictiveSystem } from '../ranked-systems';

export class SistCombinadoMedia3System implements IPredictiveSystem {
    name = "Sist Combinado Media+3";
    description = "Sistema costumizado criado via Admin UI";

    async generateTop10(draws: Draw[]): Promise<number[]> {
        // 1. Parse numbers from history
        const parsedDraws = draws.map(d => {
            if (typeof d.numbers === 'string') return JSON.parse(d.numbers) as number[];
            return d.numbers as unknown as number[];
        });

        // Use last 10 draws for calculation (or less if not available)
        const recentDraws = parsedDraws.slice(0, 10);
        if (recentDraws.length === 0) return [];

        const candidates = new Set<number>();

        // 2. Process each of the 5 positions (houses)
        for (let pos = 0; pos < 5; pos++) {
            // Get numbers at this position
            const valuesAtPos = recentDraws.map(d => d[pos]).filter(n => !isNaN(n));

            if (valuesAtPos.length < 3) continue;

            // 3. "Cortar as pontas" (Trimmed Mean)
            // Sort values
            valuesAtPos.sort((a, b) => a - b);

            // Remove lowest and highest (1 of each)
            const trimmedValues = valuesAtPos.slice(1, -1);

            if (trimmedValues.length === 0) continue;

            // Calculate Mean
            const sum = trimmedValues.reduce((a, b) => a + b, 0);
            const mean = Math.round(sum / trimmedValues.length);

            // 4. "2 vizinhos" (Mean -2, -1, 0, +1, +2)
            // Add Mean and neighbors to candidates
            candidates.add(mean);
            candidates.add(mean - 1);
            candidates.add(mean + 1);
            candidates.add(mean - 2);
            candidates.add(mean + 2);
        }

        // 5. Filter valid numbers (1-50)
        let result = Array.from(candidates).filter(n => n >= 1 && n <= 50);

        // 6. Fill to 25 if needed (using Hot Numbers from recent history)
        if (result.length < 25) {
            const frequency: Record<number, number> = {};
            recentDraws.flat().forEach(n => frequency[n] = (frequency[n] || 0) + 1);

            const hotNumbers = Object.entries(frequency)
                .sort(([, a], [, b]) => b - a)
                .map(([n]) => parseInt(n));

            for (const num of hotNumbers) {
                if (result.length >= 25) break;
                if (!result.includes(num)) result.push(num);
            }

            // Fallback to 1..50
            for (let i = 1; i <= 50; i++) {
                if (result.length >= 25) break;
                if (!result.includes(i)) result.push(i);
            }
        }

        return result.slice(0, 25);
    }
}
