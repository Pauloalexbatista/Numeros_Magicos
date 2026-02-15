import { Draw } from '@prisma/client';
import { getGameConfig } from './game-config';

/**
 * SISTEMA OSCILAÇÃO UNIVERSAL V2
 * 
 * Abordagem DIRETA de oscilação:
 * 1. Identificar raiz dominante no ÚLTIMO sorteio
 * 2. Favorece TODAS as outras raízes (oscilação)
 * 3. Usa taxa de 74% como peso
 */

export class UniversalOscillationV2System {
    name = "Sistema Oscilação Universal V2";
    description = "Previsão direta de oscilação baseada em raiz dominante";

    private getRoot(num: number): number {
        while (num > 9) {
            num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
        }
        return num;
    }



    async generateTop10(history: Draw[]): Promise<number[]> {
        const { predCount, maxNum } = getGameConfig(history);

        if (history.length === 0) {
            return Array.from({ length: predCount }, (_, i) => i + 1);
        }

        // Standardized to last 1000 draws (10 years)
        const recentHistory = history.slice(-1000);

        // Analisar ÚLTIMO sorteio
        const lastDraw = recentHistory[recentHistory.length - 1];
        const lastNumbers = typeof lastDraw.numbers === 'string'
            ? JSON.parse(lastDraw.numbers)
            : lastDraw.numbers as number[];

        // Contar raízes no último sorteio
        const rootCount: Record<number, number> = {};
        for (let i = 1; i <= 9; i++) rootCount[i] = 0;

        lastNumbers.forEach((n: number) => {
            const root = this.getRoot(n);
            rootCount[root]++;
        });

        // Encontrar raiz(es) dominante(s)
        const maxCount = Math.max(...Object.values(rootCount));
        const dominantRoots = Object.entries(rootCount)
            .filter(([, count]) => count === maxCount && count > 0)
            .map(([root]) => parseInt(root));

        // Calcular scores
        const scores: { num: number, score: number }[] = [];

        for (let candidate = 1; candidate <= maxNum; candidate++) {
            const root = this.getRoot(candidate);

            // Score base: frequência histórica (Limited to last 1000)
            const frequency = recentHistory.filter(draw => {
                const nums = typeof draw.numbers === 'string'
                    ? JSON.parse(draw.numbers)
                    : draw.numbers as number[];
                return nums.includes(candidate);
            }).length;

            let score = frequency;

            // OSCILAÇÃO: Se raiz NÃO é dominante → BOOST
            if (!dominantRoots.includes(root)) {
                score *= 1.5; // Boost de 50%
            } else {
                // Se É dominante → PENALIDADE
                score *= 0.5; // Reduz 50%
            }

            scores.push({ num: candidate, score });
        }

        // Ordenar
        scores.sort((a, b) => b.score - a.score);

        // Top 25
        const result = scores.slice(0, predCount).map(s => s.num);

        if (result.length < predCount) {
            for (let i = 1; i <= maxNum; i++) {
                if (result.length >= predCount) break;
                if (!result.includes(i)) result.push(i);
            }
        }

        return result;
    }
}
