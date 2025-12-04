import { IPredictiveSystem } from '../../services/ranked-systems';
import { Draw } from '@prisma/client';

export class RootSumModel implements IPredictiveSystem {
    name = "Root Sum (Raiz Digital)";
    description = "Agrupa números pela sua Raiz Digital (1-9) e joga nos grupos mais quentes.";

    async generateTop10(history: Draw[]): Promise<number[]> {
        if (history.length < 20) return [];

        // Helper: Calculate Digital Root (1-9)
        // e.g. 38 -> 3+8=11 -> 1+1=2. Or simply (n-1)%9 + 1
        const getRoot = (n: number) => (n - 1) % 9 + 1;

        // 1. Analyze Hot Roots in last 10 draws
        const recentHistory = history.slice(-10).map(d => ({
            ...d,
            numbers: typeof d.numbers === 'string' ? JSON.parse(d.numbers) : d.numbers as number[]
        }));

        const rootFreq: Record<number, number> = {};
        for (let r = 1; r <= 9; r++) rootFreq[r] = 0;

        recentHistory.forEach(d => {
            d.numbers.forEach((n: number) => {
                const root = getRoot(n);
                rootFreq[root]++;
            });
        });

        // 2. Identify Top 3 Hot Roots
        const sortedRoots = Object.entries(rootFreq)
            .sort(([, a], [, b]) => b - a)
            .map(([r]) => parseInt(r));

        // 3. Select numbers from roots until we have at least 25
        const candidates: number[] = [];
        let rootIndex = 0;

        while (candidates.length < 25 && rootIndex < sortedRoots.length) {
            const root = sortedRoots[rootIndex];

            // Add all numbers belonging to this root
            for (let n = 1; n <= 50; n++) {
                if (getRoot(n) === root) {
                    if (!candidates.includes(n)) candidates.push(n);
                }
            }
            rootIndex++;
        }

        // 4. If we have > 25, trim based on individual frequency in recent history
        if (candidates.length > 25) {
            // Calculate frequency for candidates
            const numFreq: Record<number, number> = {};
            recentHistory.forEach(d => {
                d.numbers.forEach((n: number) => {
                    if (candidates.includes(n)) numFreq[n] = (numFreq[n] || 0) + 1;
                });
            });

            // Sort candidates by frequency descending
            candidates.sort((a, b) => (numFreq[b] || 0) - (numFreq[a] || 0));

            // Keep top 25
            return candidates.slice(0, 25);
        }

        // 5. If still < 25 (unlikely as 50 numbers cover all roots), fill with random/frequent
        // But since we iterate all sortedRoots, we should eventually get all 50 numbers.
        // So this case is theoretically impossible unless history is empty.

        return candidates;
    }
}
