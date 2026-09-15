import { Draw } from '@prisma/client';
import { getGameConfig } from './game-config';

/**
 * SuperSistema Neuronal (Meta-Ensemble AI - Quintetos de Elite com Muralha de Corte)
 * Documentação canónica: docs/systems/14_supersistema_neuronal.md
 * 
 * Lógica Canónica (Génese Paulo Alexandre Batista):
 * 1. Seleciona os 5 especialistas com melhor taxa histórica de acertos no jogo alvo.
 * 2. Avalia cada especialista por Quintetos (Blocos de 5 números), tratando cada quina
 *    como um bloco igualitário de elite (evitando castigar bolas do 3º/4º lugar).
 * 3. Aplica a Escala de Ouro:
 *    - 1ª Quina (1-5): 100 pontos
 *    - 2ª Quina (6-10): 75 pontos
 *    - 3ª Quina (11-15): 50 pontos
 *    - 4ª Quina (16-20): 30 pontos
 *    - 5ª Quina (21-25): 15 pontos
 *    - 6ª Quina (26-30 na Mega-Sena): 8 pontos
 *    - A partir do limiar de corte: 0 pontos (Muralha Sagrada dos 25 números).
 * 4. Ordena os números por pontuação acumulada decrescente.
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
    description = "Meta-Inteligência Artificial que orquestra os 5 sistemas de topo por Quintetos de Ouro e Muralha de Corte.";

    getQuinaPoints(rank: number, halfPoint: number): number {
        const quinaIdx = Math.floor(rank / 5);
        const maxQuina = halfPoint / 5;
        if (quinaIdx >= maxQuina) return 0; // Muralha de Corte: fora dos 25/30/20 pontua zero!

        switch (quinaIdx) {
            case 0: return 100; // 1-5 (Diamante)
            case 1: return 75;  // 6-10 (Ouro)
            case 2: return 50;  // 11-15 (Prata)
            case 3: return 30;  // 16-20 (Bronze)
            case 4: return 15;  // 21-25 (Limiar)
            case 5: return 8;   // 26-30 (Mega-Sena)
            default: return 0;
        }
    }

    /**
     * Combina as predições dos 5 especialistas através do algoritmo de Quintetos de Elite
     */
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
                    const pts = this.getQuinaPoints(rank, halfPoint);
                    points[num] += pts;
                    if (rank < halfPoint) {
                        consensusCount[num]++;
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

        // Ordenação decrescente: maior pontuação de quinteto, desempate por consenso e número ascendente
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
