import { Draw } from '@prisma/client';
import { getGameConfig } from './game-config';

/**
 * Diagonais da Matriz System (Flat Version - 50 Draws Depth)
 * 
 * Logic:
 * 1. For each candidate number N (1 to maxNum), we evaluate the next draw T.
 * 2. We trace two diagonals starting from the cell directly above (T-1, N):
 *    - Left diagonal (up-left): (T-1, N), (T-2, N-1), ..., (T-N, 1). Length: N.
 *    - Right diagonal (up-right): (T-1, N), (T-2, N+1), ..., (T-(maxNum-N+1), maxNum). Length: maxNum - N + 1.
 * 3. We check a depth of 50 draws. So we only trace the diagonals up to 50 steps.
 * 4. Score is the sum of occurrences of drawn numbers along these two paths.
 * 5. Numbers are sorted desc by their score.
 */

export class DiagonaisMatrizSystem {
    name = "Diagonais da Matriz";
    description = "Previsão baseada no fluxo de diagonais geométricas na matriz de sorteios.";

    async generateTop10(history: Draw[]): Promise<number[]> {
        if (history.length === 0) return [];

        const { predCount, maxNum } = getGameConfig(history);

        // Mapeamento cronológico dos sorteios históricos para acesso rápido por índice de delay d
        // history[0] é o sorteio mais recente (delay 1), history[1] é delay 2, etc.
        const hasNumber = (delay: number, num: number): boolean => {
            if (num < 1 || num > maxNum) return false;
            const draw = history[delay - 1];
            if (!draw) return false;
            
            let nums: number[] = [];
            if (typeof draw.numbers === 'string') {
                nums = JSON.parse(draw.numbers);
            } else {
                nums = draw.numbers as unknown as number[];
            }
            return nums.includes(num);
        };

        const candidates: { num: number; score: number }[] = [];

        for (let n = 1; n <= maxNum; n++) {
            let leftSum = 0;
            let rightSum = 0;

            // 1. Diagonal para a esquerda (sobe-esquerda) partindo de (T-1, N):
            // d=1: (T-1, N)
            // d=2: (T-2, N-1)
            // d=3: (T-3, N-2)
            // Limitamos a N passos (para não sair da borda esquerda) e a 50 de profundidade histórica.
            const leftSteps = Math.min(n, 50);
            for (let d = 1; d <= leftSteps; d++) {
                if (hasNumber(d, n - (d - 1))) {
                    leftSum++;
                }
            }

            // 2. Diagonal para a direita (sobe-direita) partindo de (T-1, N):
            // d=1: (T-1, N)
            // d=2: (T-2, N+1)
            // d=3: (T-3, N+2)
            // Limitamos a maxNum - N + 1 passos (para não sair da borda direita) e a 50 de profundidade.
            const rightSteps = Math.min(maxNum - n + 1, 50);
            for (let d = 1; d <= rightSteps; d++) {
                if (hasNumber(d, n + (d - 1))) {
                    rightSum++;
                }
            }

            candidates.push({
                num: n,
                score: leftSum + rightSum
            });
        }

        // Ordenar candidatos por pontuação descendente
        candidates.sort((a, b) => b.score - a.score);

        // Retornar os Top N sugeridos
        return candidates.slice(0, predCount).map(c => c.num);
    }
}
