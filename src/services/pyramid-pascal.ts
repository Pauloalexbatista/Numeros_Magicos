import { Draw } from '@prisma/client';
import { getGameConfig } from './game-config';

/**
 * Sistema: Pirâmide de Pascal (Funil de Convergência Temporal & Vórtice 3-6-9)
 * 
 * Constrói um funil de ressonância temporal que viaja de T-5 até T-1:
 * - T-5: 9 números (Base Tesla 9: N ± 4)
 * - T-4: 7 números (N ± 3)
 * - T-3: 5 números (Nó Tesla 6: N ± 2)
 * - T-2: 3 números (Nó Tesla 3: N ± 1)
 * - T-1: 1 número  (Vértice: N)
 * 
 * Com wrap-around cilíndrico perfeito nas extremidades do volante (1 <-> maxNum).
 */

const WEIGHTS: { [offset: number]: number }[] = [
    // T-1 (offset 0 only)
    { 0: 5.0 },
    // T-2 (offsets 0, 1)
    { 0: 4.0, 1: 3.0 },
    // T-3 (offsets 0, 1, 2)
    { 0: 3.0, 1: 2.0, 2: 1.0 },
    // T-4 (offsets 0, 1, 2, 3)
    { 0: 2.0, 1: 1.5, 2: 1.0, 3: 0.5 },
    // T-5 (offsets 0, 1, 2, 3, 4)
    { 0: 1.0, 1: 0.8, 2: 0.6, 3: 0.4, 4: 0.2 }
];

export class PyramidPascalSystem {
    name = "Pirâmide de Pascal";
    description = "Funil de Convergência Temporal e Vórtice 3-6-9 (Pascal / Tesla)";

    async generateTop10(draws: Draw[], returnFullPool?: boolean): Promise<number[]> {
        const { predCount: defaultPredCount, maxNum } = getGameConfig(draws);
        const predCount = returnFullPool ? maxNum : defaultPredCount;

        if (!draws || draws.length === 0) {
            return Array.from({ length: predCount }, (_, i) => i + 1);
        }

        // --- GUARDA DE INVERSÃO TEMPORAL AUTOMÁTICA ---
        const d0 = new Date(draws[0].date).getTime();
        const dEnd = new Date(draws[draws.length - 1].date).getTime();
        const chronDraws = (d0 < dEnd) ? [...draws].reverse() : draws;

        // Obter os últimos 5 sorteios (T-1 a T-5)
        const recentHistory = chronDraws.slice(0, 5).map(d => {
            let nums: number[] = [];
            if (typeof d.numbers === 'string') {
                nums = JSON.parse(d.numbers);
            } else if (Array.isArray(d.numbers)) {
                nums = d.numbers as unknown as number[];
            }
            return new Set<number>(nums);
        });

        // Helper para wrap-around cilíndrico
        const wrapCol = (k: number): number => {
            return (((k - 1) % maxNum) + maxNum) % maxNum + 1;
        };

        const candidates: { num: number; score: number; recentScore: number }[] = [];

        for (let n = 1; n <= maxNum; n++) {
            let totalScore = 0;
            let recentScore = 0;

            // Percorrer os níveis do funil (0 = T-1, ..., 4 = T-5)
            for (let lvl = 0; lvl < recentHistory.length; lvl++) {
                const drawSet = recentHistory[lvl];
                const weightsMap = WEIGHTS[lvl];
                const maxOffset = lvl; // 0, 1, 2, 3, 4 correspondendo a 1, 3, 5, 7, 9 colunas

                for (let offset = 0; offset <= maxOffset; offset++) {
                    const weight = weightsMap[offset] || 0;
                    if (offset === 0) {
                        // Centro N
                        if (drawSet.has(n)) {
                            totalScore += weight;
                            if (lvl === 0) recentScore += weight * 10;
                            else if (lvl === 1) recentScore += weight * 5;
                        }
                    } else {
                        // Vizinhos bilaterais (wrap-around)
                        const leftCol = wrapCol(n - offset);
                        const rightCol = wrapCol(n + offset);

                        if (drawSet.has(leftCol)) {
                            totalScore += weight;
                            if (lvl <= 1) recentScore += weight;
                        }
                        if (drawSet.has(rightCol)) {
                            totalScore += weight;
                            if (lvl <= 1) recentScore += weight;
                        }
                    }
                }
            }

            candidates.push({ num: n, score: totalScore, recentScore });
        }

        // Ordenação Canónica:
        // 1. Maior pontuação total no funil
        // 2. Maior pontuação recente (T-1, T-2)
        // 3. Opção A: ordem numérica crescente
        candidates.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            if (b.recentScore !== a.recentScore) return b.recentScore - a.recentScore;
            return a.num - b.num;
        });

        return candidates.slice(0, predCount).map(c => c.num);
    }
}
