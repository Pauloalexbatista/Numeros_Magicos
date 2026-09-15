import { Draw } from '@prisma/client';
import { getGameConfig } from './game-config';

/**
 * SuperSistema Neuronal (Meta-Ensemble AI)
 * Documentação canónica: docs/systems/14_supersistema_neuronal.md
 * 
 * Lógica:
 * 1. Seleciona os 5 especialistas com melhor taxa de prémios de topo comprovada no jogo alvo.
 * 2. Mapeia o ranking normalizado de cada especialista para cada bola 1..maxNum.
 * 3. Calcula o Índice de Consenso de Elite K(n) (quantos colocam a bola no Top 10).
 * 4. Aplica ponderação harmónica e penalização por divergência de opiniões.
 * 5. Ordena o pool completo de forma decrescente para fornecer Top 25 (sugestão principal) e restantes 25 (anti-sistema).
 */

export const SUPER_SISTEMA_SPECIALISTS: Record<string, string[]> = {
    EUROMILLIONS: [
        'Diagonais da Matriz',
        'Sistema Oscilação Universal V2',
        'Mais Sorteadas de Sempre',
        'Transições de Markov',
        'Random Forest AI'
    ],
    TOTOLOTO: [
        'Agrupamento de Padrões (Clustering)',
        'Diagonais da Matriz',
        'Mais Sorteadas de Sempre',
        'Mais Quentes',
        'Transições de Markov'
    ],
    MEGASENA: [
        'Random Forest AI',
        'Sistema Média +3 Otimizado',
        'Diagonais da Matriz',
        'Transições de Markov',
        'Mais Sorteadas de Sempre'
    ],
    EURODREAMS: [
        'Mais Quentes',
        'Diagonais da Matriz 3D',
        'Últimos a Sair',
        'Random Forest AI',
        'Pirâmide de Intervalos'
    ]
};

export class SuperSistemaNeuronal {
    name = "SuperSistema Neuronal";
    description = "Meta-Inteligência Artificial que orquestra e funde os 5 sistemas com melhor histórico de acertos em cada jogo.";

    /**
     * Combina as predições de um conjunto de especialistas para gerar o ranking consensual do SuperSistema
     */
    combineSpecialists(specialistPredictions: number[][], maxNum: number): number[] {
        if (!specialistPredictions || specialistPredictions.length === 0) {
            return Array.from({ length: maxNum }, (_, idx) => idx + 1);
        }

        const numSpecialists = specialistPredictions.length;
        const scores: { num: number; score: number; consensusCount: number; variance: number }[] = [];

        for (let num = 1; num <= maxNum; num++) {
            let totalWeightedPercentile = 0;
            let consensusCount = 0;
            const percentiles: number[] = [];

            specialistPredictions.forEach(pred => {
                const rankIdx = pred.indexOf(num);
                // Se o número estiver na previsão, rank é rankIdx + 1; se não estiver, fica em último
                const rank = rankIdx !== -1 ? rankIdx + 1 : maxNum;
                const percentile = (maxNum - rank + 1) / maxNum;
                percentiles.push(percentile);
                totalWeightedPercentile += percentile;

                if (rank <= 10) {
                    consensusCount++;
                }
            });

            const avgPercentile = totalWeightedPercentile / numSpecialists;
            let variance = 0;
            percentiles.forEach(p => {
                variance += Math.pow(p - avgPercentile, 2);
            });
            variance = Math.sqrt(variance / numSpecialists);

            // Fórmula do SuperSistema Neuronal:
            // Score = Percentil Médio + Bónus de Consenso no Top 10 (20%) - Penalização por Divergência (5%)
            const score = avgPercentile + (0.20 * (consensusCount / numSpecialists)) - (0.05 * variance);

            scores.push({ num, score, consensusCount, variance });
        }

        // Ordenação estrita decrescente
        scores.sort((a, b) => {
            const diff = b.score - a.score;
            if (Math.abs(diff) > 0.00001) return diff;
            const cDiff = b.consensusCount - a.consensusCount;
            if (cDiff !== 0) return cDiff;
            return a.num - b.num;
        });

        return scores.map(s => s.num);
    }
}
