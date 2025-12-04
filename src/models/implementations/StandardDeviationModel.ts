import { IPredictiveSystem } from '../../services/ranked-systems';
import { Draw } from '@prisma/client';

export class StandardDeviationModel implements IPredictiveSystem {
    name = "Standard Deviation";
    description = "Estatística Posicional: Usa a Média e Desvio Padrão de cada posição (1ª a 5ª bola) para encontrar alvos.";

    async generateTop10(history: Draw[]): Promise<number[]> {
        if (history.length < 50) return [];

        // Use last 50 draws for statistics
        const recentHistory = history.slice(-50).map(d => ({
            ...d,
            numbers: typeof d.numbers === 'string' ? JSON.parse(d.numbers) : d.numbers as number[]
        }));

        const candidates = new Set<number>();

        // For each of the 5 positions (1st ball, 2nd ball...)
        for (let pos = 0; pos < 5; pos++) {
            // Extract numbers at this position
            const values = recentHistory.map(d => d.numbers[pos]).filter(n => !isNaN(n));

            if (values.length === 0) continue;

            // Calculate Mean
            const sum = values.reduce((a, b) => a + b, 0);
            const mean = sum / values.length;

            // Calculate StdDev
            const squareDiffs = values.map(value => Math.pow(value - mean, 2));
            const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
            const stdDev = Math.sqrt(avgSquareDiff);

            // Strategy: Pick Mean, Neighbors, and Mean + StdDev
            const targets = [
                Math.round(mean),           // The Anchor
                Math.round(mean - 1),       // Lower Neighbor
                Math.round(mean + 1),       // Upper Neighbor
                Math.round(mean + stdDev),  // Upper Deviation
                Math.round(mean - stdDev)   // Lower Deviation
            ];

            targets.forEach(t => {
                if (t >= 1 && t <= 50) candidates.add(t);
            });
        }

        // Convert to array
        let result = Array.from(candidates);

        // Calculate frequency for all numbers in recent history (used for filling or trimming)
        const freq: Record<number, number> = {};
        recentHistory.forEach(d => {
            d.numbers.forEach((n: number) => {
                freq[n] = (freq[n] || 0) + 1;
            });
        });

        // Case 1: Too many numbers (> 25) -> Trim by frequency (keep most frequent)
        if (result.length > 25) {
            result = result.sort((a, b) => (freq[b] || 0) - (freq[a] || 0));
            result = result.slice(0, 25);
        }
        // Case 2: Too few numbers (< 25) -> Fill with most frequent numbers not yet selected
        else if (result.length < 25) {
            const allNumbers = Array.from({ length: 50 }, (_, i) => i + 1);
            // Sort all numbers by frequency descending
            const sortedByFreq = allNumbers.sort((a, b) => (freq[b] || 0) - (freq[a] || 0));

            for (const num of sortedByFreq) {
                if (result.length >= 25) break;
                if (!result.includes(num)) {
                    result.push(num);
                }
            }
        }

        return result;
    }
}
