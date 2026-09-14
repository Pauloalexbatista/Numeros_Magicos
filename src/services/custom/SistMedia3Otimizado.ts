import { IPredictiveSystem } from '../ranked-systems';
import { Draw } from '@prisma/client';
import { getGameConfig } from '../game-config';

export class SistMedia3Otimizado implements IPredictiveSystem {
    name = "Sistema Média +3 Otimizado";
    description = "Média das Casas (Últimos 50) + Vizinhos de Distância Concéntrica";

    async generateTop10(draws: Draw[], returnFullPool?: boolean): Promise<number[]> {
        const { predCount: defaultPredCount, maxNum } = getGameConfig(draws);
        const predCount = returnFullPool ? maxNum : defaultPredCount;

        // Precisamos de pelo menos 50 sorteios para a maturação estatística
        if (draws.length < 50) {
            return Array.from({ length: predCount }, (_, i) => i + 1);
        }

        // --- GUARDA DE INVERSÃO TEMPORAL AUTOMÁTICA ---
        // Garante rigorosamente que draws[0] é o sorteio mais recente (T-1)
        const d0 = new Date(draws[0].date).getTime();
        const dEnd = new Date(draws[draws.length - 1].date).getTime();
        const chronDraws = (d0 < dEnd) ? [...draws].reverse() : draws;

        // 1. Obter os últimos 50 sorteios anteriores
        const recentDraws = chronDraws.slice(0, 50).map(d => {
            let nums: number[] = [];
            if (typeof d.numbers === 'string') {
                nums = JSON.parse(d.numbers) as number[];
            } else if (Array.isArray(d.numbers)) {
                nums = d.numbers as unknown as number[];
            }
            // Assegurar ordenação crescente para definir rigorosamente as Casas
            return [...nums].sort((a, b) => a - b);
        });

        // 2. Número de casas (ex: 5 no Totoloto/EuroMillions, 6 no EuroDreams/Mega-Sena)
        const numCasas = recentDraws[0].length;
        const means: number[] = [];

        for (let c = 0; c < numCasas; c++) {
            const valuesInCasa = recentDraws.map(d => d[c]).filter(n => typeof n === 'number' && !isNaN(n));
            if (valuesInCasa.length === 0) continue;
            const sum = valuesInCasa.reduce((acc, v) => acc + v, 0);
            const avg = sum / valuesInCasa.length;
            const centralInt = Math.round(avg);
            means.push(centralInt);
        }

        // 3. Preenchimento por Varredura de Tiers Concéntricos
        const selectedNumbers: number[] = [];
        const seen = new Set<number>();

        const addNumber = (num: number) => {
            if (num >= 1 && num <= maxNum && !seen.has(num)) {
                seen.add(num);
                selectedNumbers.push(num);
            }
        };

        // Tier 0: O Coração das Médias (Centro de cada Casa)
        for (let c = 0; c < numCasas; c++) {
            addNumber(means[c]);
        }

        // Tiers Superiores: Vizinhos concêntricos (Distância 1 = Vizinhos Imediatos Média +3, depois 2, 3...)
        // O maxNum garante que varre todas as distâncias possíveis até cobrir o pool total
        for (let dist = 1; dist <= maxNum; dist++) {
            for (let c = 0; c < numCasas; c++) {
                // Vizinho abaixo
                addNumber(means[c] - dist);
                // Vizinho acima
                addNumber(means[c] + dist);
            }
            if (selectedNumbers.length >= maxNum) break;
        }

        // Fallback garantido para caso falte algum número de 1 a maxNum
        for (let k = 1; k <= maxNum; k++) {
            addNumber(k);
        }

        return selectedNumbers.slice(0, predCount);
    }
}
