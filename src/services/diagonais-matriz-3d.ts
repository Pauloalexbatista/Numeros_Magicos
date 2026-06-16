import { Draw } from '@prisma/client';
import { getGameConfig } from './game-config';

/**
 * Diagonais da Matriz 3D System (Cylindrical Wrap-around - Full History)
 * 
 * Logic:
 * 1. For each candidate number N (1 to maxNum), we evaluate the next draw T.
 * 2. We trace two diagonals starting from the cell directly above (T-1, N).
 * 3. The paths wrap around modularly (modulo maxNum) creating a cylindrical 3D matrix.
 * 4. We trace all the way back to the very first draw in history (d = 1 to history.length).
 * 5. Score is the sum of occurrences of drawn numbers along these two paths.
 * 6. Numbers are sorted desc by their score.
 */

export class DiagonaisMatriz3DSystem {
    name = "Diagonais da Matriz 3D";
    description = "Previsão baseada no fluxo tridimensional de diagonais cilíndricas ao longo de todo o histórico.";

    async generateTop10(history: Draw[]): Promise<number[]> {
        if (history.length === 0) return [];

        const { predCount, maxNum } = getGameConfig(history);
        const totalHistory = history.length;

        // Acesso rápido por índice de delay (1-based delay: history[delay - 1])
        const hasNumber = (delay: number, num: number): boolean => {
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

            for (let d = 1; d <= totalHistory; d++) {
                // Diagonal Esquerda (sobe-esquerda com wrap-around):
                // offset = -(d - 1)
                // col = ((N - d) % maxNum + maxNum) % maxNum + 1
                const leftCol = (( (n - d) % maxNum ) + maxNum) % maxNum + 1;
                if (hasNumber(d, leftCol)) {
                    leftSum++;
                }

                // Diagonal Direita (sobe-direita com wrap-around):
                // offset = d - 1
                // col = (N + d - 2) % maxNum + 1
                const rightCol = ( (n + d - 2) % maxNum ) + 1;
                if (hasNumber(d, rightCol)) {
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
