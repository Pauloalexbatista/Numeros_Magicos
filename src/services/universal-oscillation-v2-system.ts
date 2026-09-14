import { Draw } from '@prisma/client';
import { getGameConfig } from './game-config';

/**
 * SISTEMA OSCILAÇÃO UNIVERSAL V2
 * 
 * Baseado na matemática do vórtice (Tesla) e raízes digitais (1-9):
 * 1. Identifica a raiz dominante no sorteio anterior (T-1).
 * 2. Aplica a Regra da Oscilação (taxa empírica de 74%):
 *    - Raízes NÃO dominantes: Boost de 1.5x (+50%)
 *    - Raízes dominantes: Penalização de 0.5x (-50%)
 * 3. Base de frequência histórica padronizada (até 1000 sorteios).
 * 4. Desempate canónico por frequência recente (20 sorteios) e Opção A.
 */

export class UniversalOscillationV2System {
    name = "Sistema Oscilação Universal V2";
    description = "Previsão direta de oscilação baseada em raiz dominante e vórtice";

    private getRoot(num: number): number {
        return (((num - 1) % 9) + 1);
    }

    async generateTop10(history: Draw[], returnFullPool?: boolean): Promise<number[]> {
        const { predCount: defaultPredCount, maxNum } = getGameConfig(history);
        const predCount = returnFullPool ? maxNum : defaultPredCount;

        if (!history || history.length === 0) {
            return Array.from({ length: predCount }, (_, i) => i + 1);
        }

        // --- GUARDA DE INVERSÃO TEMPORAL AUTOMÁTICA ---
        const d0 = new Date(history[0].date).getTime();
        const dEnd = new Date(history[history.length - 1].date).getTime();
        const chronHistory = (d0 < dEnd) ? [...history].reverse() : history;

        // Histórico padronizado até aos últimos 1000 sorteios (T-1 a T-1000)
        const recentHistory = chronHistory.slice(0, 1000);

        // 1. Analisar último sorteio (T-1 = chronHistory[0])
        const lastDraw = chronHistory[0];
        let lastNumbers: number[] = [];
        if (typeof lastDraw.numbers === 'string') {
            lastNumbers = JSON.parse(lastDraw.numbers);
        } else if (Array.isArray(lastDraw.numbers)) {
            lastNumbers = lastDraw.numbers as unknown as number[];
        }

        // Contar ocorrência de cada raiz no último sorteio
        const rootCount: Record<number, number> = {};
        for (let i = 1; i <= 9; i++) rootCount[i] = 0;

        lastNumbers.forEach((n: number) => {
            const root = this.getRoot(n);
            if (rootCount[root] !== undefined) rootCount[root]++;
        });

        // Encontrar a(s) raiz(es) dominante(s)
        const maxCount = Math.max(...Object.values(rootCount));
        const dominantRoots = new Set<number>();
        if (maxCount > 0) {
            Object.entries(rootCount).forEach(([rootStr, count]) => {
                if (count === maxCount) dominantRoots.add(Number(rootStr));
            });
        }

        // 2. Frequências históricas (até 1000) e recentes (20)
        const globalFreq: Record<number, number> = {};
        const freq20: Record<number, number> = {};
        for (let i = 1; i <= maxNum; i++) {
            globalFreq[i] = 0;
            freq20[i] = 0;
        }

        recentHistory.forEach((draw, idx) => {
            let nums: number[] = [];
            if (typeof draw.numbers === 'string') nums = JSON.parse(draw.numbers);
            else if (Array.isArray(draw.numbers)) nums = draw.numbers as unknown as number[];

            nums.forEach(n => {
                if (globalFreq[n] !== undefined) globalFreq[n]++;
                if (idx < 20 && freq20[n] !== undefined) freq20[n]++;
            });
        });

        // 3. Calcular pontuação final de cada número
        const candidates: { num: number; score: number; freq20: number }[] = [];

        for (let n = 1; n <= maxNum; n++) {
            const root = this.getRoot(n);
            let score = globalFreq[n];

            // Aplicação da Lei da Oscilação
            if (!dominantRoots.has(root)) {
                score *= 1.5; // Boost de 50% para quem oscila
            } else {
                score *= 0.5; // Penalização de 50% para quem satura
            }

            candidates.push({ num: n, score, freq20: freq20[n] });
        }

        // 4. Ordenação Canónica:
        // 1º: Maior Score
        // 2º: Maior Frequência nos últimos 20
        // 3º: Opção A (Ordem crescente)
        candidates.sort((a, b) => {
            const scoreDiff = b.score - a.score;
            if (Math.abs(scoreDiff) > 0.001) return scoreDiff;

            const freqDiff = b.freq20 - a.freq20;
            if (freqDiff !== 0) return freqDiff;

            return a.num - b.num;
        });

        return candidates.slice(0, predCount).map(c => c.num);
    }
}
