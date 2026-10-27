import { IPredictiveSystem } from '../ranked-systems';
import { Draw } from '@prisma/client';
import { getGameConfig } from '../game-config';

export class SistemaAntigravityHarmonia implements IPredictiveSystem {
    name = "Harmonia Dimensional (Antigravity)";
    description = "Ressonância Hiperbólica de Co-Ocorrência, Tensão Elástica de Atraso e Regularização por Quotas Dimensionais";

    async generateTop10(draws: Draw[], returnFullPool?: boolean): Promise<number[]> {
        const { predCount: defaultPredCount, maxNum } = getGameConfig(draws);
        const predCount = returnFullPool ? maxNum : defaultPredCount;

        if (draws.length < 5) {
            return Array.from({ length: predCount }, (_, i) => i + 1);
        }

        // 1. Garantir estrita ordem cronológica reversa (draws[0] = T-1 mais recente, SEM lookahead)
        const d0 = new Date(draws[0].date).getTime();
        const dEnd = new Date(draws[draws.length - 1].date).getTime();
        const chronDraws = (d0 < dEnd) ? [...draws].reverse() : draws;

        const parseDrawNumbers = (d: Draw): number[] => {
            if (typeof d.numbers === 'string') {
                try { return JSON.parse(d.numbers); } catch { return []; }
            }
            return (d.numbers as unknown as number[]) || [];
        };

        const totalBalls = maxNum;
        const numDecades = Math.ceil(totalBalls / 10);

        // 2. Matriz de Co-Ocorrência dos últimos 100 sorteios com decaimento hiperbólico (1/sqrt(t))
        const pairMatrix: number[][] = Array.from({ length: totalBalls + 1 }, () => new Array(totalBalls + 1).fill(0));
        const recentWindow = Math.min(100, chronDraws.length);

        for (let t = 0; t < recentWindow; t++) {
            const nums = parseDrawNumbers(chronDraws[t]);
            const w = 1.0 / Math.sqrt(t + 1);
            for (let i = 0; i < nums.length; i++) {
                for (let j = i + 1; j < nums.length; j++) {
                    const a = nums[i], b = nums[j];
                    if (a >= 1 && a <= totalBalls && b >= 1 && b <= totalBalls) {
                        pairMatrix[a][b] += w;
                        pairMatrix[b][a] += w;
                    }
                }
            }
        }

        // Sementes do último sorteio (o pulso cinético imediato T-1)
        const lastDrawNums = parseDrawNumbers(chronDraws[0]);

        // 3. Pontuação de Ressonância com o último sorteio
        const resonanceScore: number[] = new Array(totalBalls + 1).fill(0);
        for (let b = 1; b <= totalBalls; b++) {
            for (const seed of lastDrawNums) {
                if (seed >= 1 && seed <= totalBalls) {
                    resonanceScore[b] += pairMatrix[b][seed];
                }
            }
        }

        // 4. Cadência de Atraso (Delays desde a última aparição)
        const delays: number[] = new Array(totalBalls + 1).fill(chronDraws.length);
        for (let b = 1; b <= totalBalls; b++) {
            for (let t = 0; t < chronDraws.length; t++) {
                const nums = parseDrawNumbers(chronDraws[t]);
                if (nums.includes(b)) {
                    delays[b] = t;
                    break;
                }
            }
        }

        // 5. Score Composto com Fator Elástico de Retorno
        const candidates: { num: number; score: number; decade: number }[] = [];

        for (let b = 1; b <= totalBalls; b++) {
            const delay = delays[b];
            let delayFactor = 1.0;
            if (delay === 0) {
                delayFactor = 0.60; // Ressaca imediata
            } else if (delay >= 3 && delay <= 18) {
                delayFactor = 1.35; // Zona Dourada de retorno
            } else if (delay > 35) {
                delayFactor = 0.75; // Estagnação fria
            }

            const score = (resonanceScore[b] * 0.70) * delayFactor;
            const decade = Math.min(numDecades, Math.floor((b - 1) / 10) + 1);
            candidates.push({ num: b, score, decade });
        }

        // 6. Quotas Dimensionais (Garante que nenhuma década fica a zeros!)
        // Mínimo de 3 por década (ou proporcional em jogos menores)
        const minPerDecade = Math.max(1, Math.min(3, Math.floor(predCount / (numDecades * 1.5))));
        const maxPerDecade = Math.ceil(predCount / 2.5);

        const selected: number[] = [];
        const selectedSet = new Set<number>();
        const decadeCounts: Record<number, number> = {};
        for (let d = 1; d <= numDecades; d++) decadeCounts[d] = 0;

        // Garantir piso de presença em cada década
        for (let d = 1; d <= numDecades; d++) {
            const decCandidates = candidates.filter(c => c.decade === d).sort((a, b) => b.score - a.score);
            const take = Math.min(minPerDecade, decCandidates.length);
            for (let i = 0; i < take; i++) {
                selected.push(decCandidates[i].num);
                selectedSet.add(decCandidates[i].num);
                decadeCounts[d]++;
            }
        }

        // Preenchimento com as melhores bolas globais respeitando o teto por década
        const remaining = candidates.filter(c => !selectedSet.has(c.num)).sort((a, b) => b.score - a.score);
        for (const c of remaining) {
            if (selected.length >= predCount) break;
            if (decadeCounts[c.decade] < maxPerDecade) {
                selected.push(c.num);
                selectedSet.add(c.num);
                decadeCounts[c.decade]++;
            }
        }

        // Fallback para preencher até predCount se necessário
        for (const c of remaining) {
            if (selected.length >= predCount) break;
            if (!selectedSet.has(c.num)) {
                selected.push(c.num);
                selectedSet.add(c.num);
            }
        }

        return selected;
    }
}
