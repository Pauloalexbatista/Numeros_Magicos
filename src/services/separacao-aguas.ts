import { Draw } from '@prisma/client';
import { getGameConfig } from './game-config';

/**
 * Sistema Separação das Águas (Meta-Especialista de Simetria e Polarização Perfeita)
 * Documentação canónica: docs/systems/17_separacao_das_aguas.md
 * 
 * Lógica Canónica (Génese Paulo Alexandre Batista):
 * 1. Utiliza a equipa de 5 especialistas de máxima polarização combinada (131 Jackpots no EM, 104 no TL).
 * 2. Equilibra motores diretos com motores inversos através da regra ±1000 + Quintetos de Ouro.
 * 3. Projeta os números para as duas pontas, permitindo ganhos extraordinários tanto no Direto como no Anti-Sistema.
 */

export const SEPARACAO_AGUAS_SPECIALISTS: Record<string, string[]> = {
    EUROMILLIONS: [
        'Diagonais da Matriz',
        'Transições de Markov',
        'Agrupamento de Padrões (Clustering)',
        'Sistema Média +3 Otimizado',
        'Diagonais da Matriz 3D'
    ],
    TOTOLOTO: [
        'Mais Sorteadas de Sempre',
        'Monte Carlo',
        'Agrupamento de Padrões (Clustering)',
        'Pirâmide de Intervalos',
        'Diagonais da Matriz'
    ],
    MEGASENA: [
        'Pirâmide de Intervalos',
        'Transições de Markov',
        'Diagonais da Matriz',
        'Sistema Oscilação Universal V2',
        'Random Forest AI'
    ],
    EURODREAMS: [
        'Mais Sorteadas de Sempre',
        'Agrupamento de Padrões (Clustering)',
        'Monte Carlo',
        'Sistema Média +3 Otimizado',
        'Últimos a Sair'
    ]
};

export class SeparacaoAguas {
    name = "Separação das Águas";
    description = "Meta-Especialista de simetria e polarização máxima concebido para quebrar a barreira de 130 Jackpots combinados.";

    getQuinaPoints(rank: number, halfPoint: number): number {
        const quinaIdx = Math.floor(rank / 5);
        const maxQuina = halfPoint / 5;
        if (quinaIdx >= maxQuina) return 0;

        switch (quinaIdx) {
            case 0: return 100;
            case 1: return 75;
            case 2: return 50;
            case 3: return 30;
            case 4: return 15;
            case 5: return 8;
            default: return 0;
        }
    }

    combineSpecialists(specialistPredictions: number[][], maxNum: number, halfPoint: number): number[] {
        if (!specialistPredictions || specialistPredictions.length === 0) {
            return Array.from({ length: maxNum }, (_, idx) => idx + 1);
        }

        const points = new Float32Array(maxNum + 1);
        const consensusCount = new Uint8Array(maxNum + 1);

        for (const predArr of specialistPredictions) {
            for (let rank = 0; rank < predArr.length; rank++) {
                const num = predArr[rank];
                if (num >= 1 && num <= maxNum) {
                    if (rank < halfPoint) {
                        points[num] += 1000 + this.getQuinaPoints(rank, halfPoint);
                        consensusCount[num]++;
                    } else {
                        points[num] -= 1000;
                    }
                }
            }
        }

        const scores: { num: number; pts: number; consensus: number }[] = [];
        for (let num = 1; num <= maxNum; num++) {
            scores.push({
                num,
                pts: points[num],
                consensus: consensusCount[num]
            });
        }

        // Ordenação decrescente: pontuação mais alta no Direto (Top) e mais baixa no Anti-Sistema (Fundo)
        scores.sort((a, b) => {
            const diff = b.pts - a.pts;
            if (Math.abs(diff) > 0.0001) return diff;
            const cDiff = b.consensus - a.consensus;
            if (cDiff !== 0) return cDiff;
            return a.num - b.num;
        });

        return scores.map(s => s.num);
    }
}
