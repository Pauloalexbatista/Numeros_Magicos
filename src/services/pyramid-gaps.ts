import { Draw } from '@prisma/client';
import { getGameConfig } from './game-config';

/**
 * Sistema: Pirâmide de Intervalos (Diferenças Absolutas & Projeção Harmónica)
 * 
 * Constrói a pirâmide de diferenças sucessivas a partir das bolas do último sorteio (T-1):
 * - Nível 1: Bolas ordenadas
 * - Nível 2: Gaps de 1ª ordem (diferenças adjacentes)
 * - Nível 3: Gaps de 2ª ordem (diferenças entre gaps)
 * - Níveis seguintes até ao vértice (Intervalo Primordial)
 * 
 * Projeta os alvos aplicando cada intervalo para a frente e para trás com wrap-around cilíndrico.
 * Desempate de escalão e cauda pela frequência dos últimos 20 sorteios e regra Opção A.
 */

export class PyramidGapsSystem {
    name = "Pirâmide de Intervalos";
    description = "Pirâmide de Diferenças Absolutas e Projeção Harmónica de Saltos";

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

        const lastDraw = chronDraws[0];
        let lastNumbers: number[] = [];
        if (typeof lastDraw.numbers === 'string') {
            lastNumbers = JSON.parse(lastDraw.numbers);
        } else if (Array.isArray(lastDraw.numbers)) {
            lastNumbers = lastDraw.numbers as unknown as number[];
        }

        const sortedDraw = [...lastNumbers].sort((a, b) => a - b);
        if (sortedDraw.length < 2) {
            return Array.from({ length: predCount }, (_, i) => i + 1);
        }

        // 1. Construir Pirâmide de Gaps
        const pyramidLayers: number[][] = [];
        let currentLayer = [...sortedDraw];

        while (currentLayer.length > 1) {
            const nextLayer: number[] = [];
            for (let i = 0; i < currentLayer.length - 1; i++) {
                nextLayer.push(Math.abs(currentLayer[i + 1] - currentLayer[i]));
            }
            pyramidLayers.push(nextLayer);
            currentLayer = nextLayer;
        }

        // Pesos por nível da pirâmide (do topo ao mais baixo)
        // O vértice tem maior peso, descendo até à base
        const totalLevels = pyramidLayers.length; // ex: 4 níveis de gaps para 5 números
        const levelWeights = pyramidLayers.map((_, idx) => {
            // idx 0 = base de gaps, idx totalLevels-1 = vértice
            return 1.5 + (idx / Math.max(1, totalLevels - 1)) * 3.5; // varia de 1.5 até 5.0
        });

        const wrap = (k: number): number => (((k - 1) % maxNum) + maxNum) % maxNum + 1;

        const scores: Record<number, number> = {};
        for (let i = 1; i <= maxNum; i++) scores[i] = 0;

        // 2. Aplicar intervalos projetando saltos bilaterais a partir de cada bola
        sortedDraw.forEach(b => {
            pyramidLayers.forEach((layer, lvlIdx) => {
                const w = levelWeights[lvlIdx];
                layer.forEach(gap => {
                    if (gap > 0) {
                        scores[wrap(b + gap)] += w;
                        scores[wrap(b - gap)] += w;
                    }
                });
            });
        });

        // 3. Frequência recente (últimos 20 sorteios) para desempates e ordenação da cauda
        const freq20: Record<number, number> = {};
        for (let i = 1; i <= maxNum; i++) freq20[i] = 0;

        const recent20 = chronDraws.slice(0, 20);
        recent20.forEach(d => {
            let nums: number[] = [];
            if (typeof d.numbers === 'string') nums = JSON.parse(d.numbers);
            else if (Array.isArray(d.numbers)) nums = d.numbers as unknown as number[];
            nums.forEach(n => {
                if (freq20[n] !== undefined) freq20[n]++;
            });
        });

        // 4. Ordenação Canónica
        const candidates = Array.from({ length: maxNum }, (_, i) => i + 1);
        candidates.sort((a, b) => {
            const scoreDiff = scores[b] - scores[a];
            if (Math.abs(scoreDiff) > 0.001) return scoreDiff;

            // Desempate por frequência recente no mesmo patamar de pontuação
            const freqDiff = freq20[b] - freq20[a];
            if (freqDiff !== 0) return freqDiff;

            // Opção A: ordem numérica crescente
            return a - b;
        });

        return candidates.slice(0, predCount);
    }
}
