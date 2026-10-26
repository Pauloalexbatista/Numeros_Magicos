import { IPredictiveSystem } from '../ranked-systems';
import { Draw } from '@prisma/client';
import { getGameConfig } from '../game-config';

export class SistemaGeometriaCiclos implements IPredictiveSystem {
    name = "Geometria & Ciclos";
    description = "Modelo Três Caixas: Ciclos de Fecho, Balanço Geométrico de Linhas e Fecho de Paridade";

    async generateTop10(draws: Draw[], returnFullPool?: boolean): Promise<number[]> {
        const { predCount: defaultPredCount, maxNum } = getGameConfig(draws);
        const predCount = returnFullPool ? maxNum : defaultPredCount;

        if (draws.length < 5) {
            return Array.from({ length: predCount }, (_, i) => i + 1);
        }

        // 1. Garantir ordem cronológica reversa (draws[0] = T-1 mais recente)
        const d0 = new Date(draws[0].date).getTime();
        const dEnd = new Date(draws[draws.length - 1].date).getTime();
        const chronDraws = (d0 < dEnd) ? [...draws].reverse() : draws;

        const parseDrawNumbers = (d: Draw): number[] => {
            if (typeof d.numbers === 'string') {
                try { return JSON.parse(d.numbers); } catch { return []; }
            }
            return (d.numbers as unknown as number[]) || [];
        };

        const lastDraw = parseDrawNumbers(chronDraws[0]);
        const lastSet = new Set(lastDraw);
        const drawnCount = lastDraw.length || (maxNum === 25 ? 15 : maxNum === 60 ? 6 : maxNum === 40 ? 6 : 5);

        // 2. Ciclo Natural (números que faltam sair no ciclo em aberto)
        const cycleSeen = new Set<number>();
        let cycleLength = 0;
        for (let i = 0; i < Math.min(chronDraws.length, 15); i++) {
          const nums = parseDrawNumbers(chronDraws[i]);
          cycleLength++;
          for (const n of nums) cycleSeen.add(n);
          if (cycleSeen.size >= maxNum) break;
        }
        const missingInCycle: number[] = [];
        for (let n = 1; n <= maxNum; n++) {
          if (!cycleSeen.has(n)) missingInCycle.push(n);
        }

        // 3. Janela Dinâmica das Últimas X Bolas (onde X = pool total do jogo)
        // Euromilhões (50): 10 sorteios (50 bolas)
        // Totoloto (49): 10 sorteios (~50 bolas)
        // EuroDreams (40): 7 sorteios (42 bolas)
        // Mega-Sena (60): 10 sorteios (60 bolas)
        // Lotofácil (25): 2 sorteios (30 bolas)
        const drawsInWindow = Math.max(2, Math.ceil(maxNum / drawnCount));
        const recentWindow = chronDraws.slice(0, drawsInWindow).map(parseDrawNumbers);
        const freqX: Record<number, number> = {};
        for (let n = 1; n <= maxNum; n++) freqX[n] = 0;
        for (const r of recentWindow) {
          for (const n of r) freqX[n]++;
        }

        const streak: Record<number, number> = {};
        for (let n = 1; n <= maxNum; n++) {
          let s = 0;
          while (s < chronDraws.length && parseDrawNumbers(chronDraws[s]).includes(n)) s++;
          streak[n] = s;
        }

        const gap: Record<number, number> = {};
        for (let n = 1; n <= maxNum; n++) {
          let g = 0;
          while (g < chronDraws.length && !parseDrawNumbers(chronDraws[g]).includes(n)) g++;
          gap[n] = g;
        }

        // 4. Proporção das 3 Caixas conforme o jogo
        // Lotofácil (25): Cx 1 = 10, Cx 3 = 5, Cx 2 = 10
        // Outros: Cx 1 proporcional (~60% dos sorteados), Cx 3 = corte de 20%
        const targetCx1Size = Math.max(2, Math.round(drawnCount * 0.65));
        const targetCx3Size = Math.round(maxNum * 0.20); // 5 na Lotofácil, 10 no Euromilhões

        const cx1 = new Set<number>();
        const cx3 = new Set<number>();
        const cx2: number[] = [];

        // Regra A: Imunidade de Fechamento de Ciclo
        if (cycleLength >= 4 && missingInCycle.length > 0 && missingInCycle.length <= 3) {
          for (const m of missingInCycle) {
            if (cx1.size < targetCx1Size) cx1.add(m);
          }
        }

        // Regra B: Pontuação de Retenção vs Corte calibrada pela Lei de Poisson (Últimas X Bolas)
        const scoreForRetention: { n: number; score: number }[] = [];
        for (let n = 1; n <= maxNum; n++) {
          if (cx1.has(n)) continue;

          let score = 50;

          // Fecho de ciclo imune ao corte
          if (missingInCycle.includes(n) && cycleLength >= 3) {
            score += 35;
          }

          // Janela das Últimas X Bolas (Distribuição 1/e)
          if (freqX[n] === 0) {
            // Bolas no terço de défice
            score += (missingInCycle.includes(n) ? 20 : 10);
          } else if (freqX[n] === 1) {
            // Ponto de equilíbrio estatístico ideal
            score += 15;
          } else if (freqX[n] >= 2) {
            // Repetentes: saturação se streak alta, ou manutenção se em fluxo
            if (streak[n] >= 4) score -= 30;
            else if (streak[n] >= 2) score += 5;
            else score -= 10;
          }

          // Sequência contínua
          if (streak[n] === 2 || streak[n] === 3) score += 8;

          // Regra do "falha 1 concurso e regressa"
          if (gap[n] === 1) score += 12;
          else if (gap[n] >= 4) score += 18;

          // Se saiu no concurso mais recente
          if (lastSet.has(n)) score += 12;

          scoreForRetention.push({ n, score });
        }

        // Candidatas com menor pontuação de retenção vão para o Corte (Cx 3)
        scoreForRetention.sort((a, b) => a.score - b.score);
        for (let i = 0; i < targetCx3Size; i++) {
          if (scoreForRetention[i]) cx3.add(scoreForRetention[i].n);
        }

        // As candidatas mais fortes entram na Cx 1 (Certezas)
        const bestCandidates = scoreForRetention.slice(targetCx3Size).reverse();
        for (const item of bestCandidates) {
          if (cx1.size < targetCx1Size) {
            cx1.add(item.n);
          }
        }

        // As restantes povoam a Cx 2 (Dúvidas)
        for (let n = 1; n <= maxNum; n++) {
          if (!cx1.has(n) && !cx3.has(n)) {
            cx2.push(n);
          }
        }

        // 5. Ordenação de Complementaridade da Cx 2
        // Primos e Fibonacci
        const primes = new Set([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59]);
        const halfNum = Math.floor(maxNum / 2);

        const cx1Arr = Array.from(cx1);
        const impares1 = cx1Arr.filter(n => n % 2 !== 0).length;
        const baixos1 = cx1Arr.filter(n => n <= halfNum).length;
        const primos1 = cx1Arr.filter(n => primes.has(n)).length;

        const targetImpares = Math.round(drawnCount * 0.52);
        const targetBaixos = Math.round(drawnCount * 0.50);
        const targetPrimos = Math.round(drawnCount * 0.35);

        const needImpar = targetImpares - impares1;
        const needBaixo = targetBaixos - baixos1;
        const needPrimo = targetPrimos - primos1;

        const scoredCx2 = cx2.map(n => {
          let fit = 0;
          const isImp = n % 2 !== 0;
          const isBx = n <= halfNum;
          const isPrim = primes.has(n);

          if (needImpar > 0 && isImp) fit += 4;
          if (needImpar <= 0 && !isImp) fit += 4;

          if (needBaixo > 0 && isBx) fit += 3;
          if (needBaixo <= 0 && !isBx) fit += 3;

          if (needPrimo > 0 && isPrim) fit += 3;
          if (needPrimo <= 0 && !isPrim) fit += 2;

          fit += (freqX[n] * 0.5);
          return { n, fit };
        });

        scoredCx2.sort((a, b) => b.fit - a.fit);
        const cx2Ordered = scoredCx2.map(x => x.n);

        // Chave de ordenação unificada:
        // Cx 1 (Certezas) + Cx 2 (Ordenada por Complementaridade) + Cx 3 (Cortadas)
        const fullRanking = [
          ...Array.from(cx1),
          ...cx2Ordered,
          ...Array.from(cx3)
        ];

        return fullRanking.slice(0, predCount);
    }
}
