import { IPredictiveSystem } from '../ranked-systems';
import { Draw } from '@prisma/client';
import { getGameConfig } from '../game-config';
import { calculateMatrizCorte } from '../matriz-corte-engine';

export class MatrizCorteSystem implements IPredictiveSystem {
    name = "Matriz de Corte";
    description = "Sistema de corte e podagem com 5 matrizes de invariantes e limites históricos, selecionando os números sobreviventes mais limpos e seguros.";
    type = 'base' as const;
    domain = 'numbers' as const;

    async generateTop10(draws: Draw[], returnFullPool?: boolean): Promise<number[]> {
        const { predCount: defaultPredCount, maxNum } = getGameConfig(draws);
        const predCount = returnFullPool ? maxNum : defaultPredCount;

        if (!draws || draws.length < 15) {
            return Array.from({ length: predCount }, (_, i) => i + 1);
        }

        // Temporal inversion guard: ensure chronological order (draws[0] oldest ... draws[last] newest)
        const d0 = new Date(draws[0].date).getTime();
        const dEnd = new Date(draws[draws.length - 1].date).getTime();
        const chronoDraws = d0 > dEnd ? [...draws].reverse() : [...draws];

        const game = (draws[0]?.game || 'EUROMILLIONS').toUpperCase();

        try {
            // Run the 5 matrices calculation on the chronological history
            const result = await calculateMatrizCorte(game, undefined, chronoDraws);

            // Sort candidate balls from Safest Survivor (cleanest) to Most Condemned (cut):
            // 1. Lowest compositeScore (penalties across all 5 matrices)
            // 2. Lowest maxProximityPct
            // 3. Ascending ball number (deterministic tie-break)
            const sorted = [...result.balls].sort((a, b) => {
                if (a.compositeScore !== b.compositeScore) return a.compositeScore - b.compositeScore;
                if (a.maxProximityPct !== b.maxProximityPct) return a.maxProximityPct - b.maxProximityPct;
                return a.ball - b.ball;
            });

            return sorted.slice(0, predCount).map(b => b.ball);
        } catch (err) {
            console.error('[MatrizCorteSystem] Error during execution:', err);
            return Array.from({ length: predCount }, (_, i) => i + 1);
        }
    }
}
