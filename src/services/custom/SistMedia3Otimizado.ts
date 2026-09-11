import { IPredictiveSystem } from '../ranked-systems';
import { Draw } from '@prisma/client';
import { getGameConfig } from '../game-config';

export class SistMedia3Otimizado implements IPredictiveSystem {
    name = "Sistema Média +3 Otimizado";
    description = "Média Aparada (Last 20) + 3 Vizinhos com Prioridade à Proximidade";

    async generateTop10(draws: Draw[], returnFullPool?: boolean): Promise<number[]> {
        const { predCount: defaultPredCount, maxNum } = getGameConfig(draws);
        const predCount = returnFullPool ? maxNum : defaultPredCount;

        // Precisamos de pelo menos 20 sorteios para a média recente
        if (draws.length < 20) {
            return Array.from({ length: predCount }, (_, i) => i + 1);
        }

        // 1. Obter os últimos 20 sorteios
        const recentDraws = draws.slice(0, 20).map(d => {
            if (typeof d.numbers === 'string') return JSON.parse(d.numbers) as number[];
            return d.numbers as unknown as number[];
        });

        const candidateTiers: Record<number, number> = {}; // num -> min tier (0 e o melhor)

        // 2. Processar cada uma das posições
        const numCount = recentDraws[0].length;
        for (let pos = 0; pos < numCount; pos++) {
            const valuesAtPos = recentDraws.map(d => d[pos]).filter(n => !isNaN(n));
            if (valuesAtPos.length < 3) continue;

            // Média Aparada (Remover min e max para evitar outliers)
            valuesAtPos.sort((a, b) => a - b);
            const trimmedValues = valuesAtPos.slice(1, -1);
            if (trimmedValues.length === 0) continue;

            const sum = trimmedValues.reduce((a, b) => a + b, 0);
            const mean = Math.round(sum / trimmedValues.length);

            // 3. Selecionar Média + 2 Vizinhos (total de 3 candidatos)
            for (let offset = -1; offset <= 1; offset++) {
                const num = mean + offset;
                if (num < 1 || num > maxNum) continue;

                const tier = Math.abs(offset); // 0=Media (Melhor), 1=Vizinho

                // Guardar o melhor tier para este número
                if (candidateTiers[num] === undefined || tier < candidateTiers[num]) {
                    candidateTiers[num] = tier;
                }
            }
        }

        let sortedResult = Object.keys(candidateTiers).map(n => parseInt(n));

        // 4. Ordenar por Tier (ascendente), depois por frequência recente
        const frequency: Record<number, number> = {};
        recentDraws.flat().forEach(n => frequency[n] = (frequency[n] || 0) + 1);

        sortedResult.sort((a, b) => {
            const tierA = candidateTiers[a];
            const tierB = candidateTiers[b];

            if (tierA !== tierB) return tierA - tierB;

            const freqA = frequency[a] || 0;
            const freqB = frequency[b] || 0;
            return freqB - freqA;
        });

        // 5. Preencher o restante pool
        let finalPrediction = sortedResult.slice(0, predCount);

        if (finalPrediction.length < predCount) {
            const hotNumbers = Object.entries(frequency)
                .sort(([, a], [, b]) => b - a)
                .map(([n]) => parseInt(n));

            for (const num of hotNumbers) {
                if (finalPrediction.length >= predCount) break;
                if (!finalPrediction.includes(num)) finalPrediction.push(num);
            }

            for (let k = 1; k <= maxNum; k++) {
                if (finalPrediction.length >= predCount) break;
                if (!finalPrediction.includes(k)) finalPrediction.push(k);
            }
        }

        return finalPrediction;
    }
}