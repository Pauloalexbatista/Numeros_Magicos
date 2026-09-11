import { Draw } from '@prisma/client';
import { SystemType, SystemDomain } from './ranked-systems';
import { MonteCarloStarsSystem } from './new-star-systems';

export interface StarSystem {
    name: string;
    description: string;
    type?: 'base' | 'neural' | 'ensemble';
    domain?: 'stars' | 'numbers';
    dependencies?: string[];
    generatePrediction(history: Draw[]): Promise<number[]> | number[];
}

/**
 * Helper to determine max star based on game type
 */
export function getMaxStar(draws: Draw[]): number {
    if (draws.length > 0) {
        if (draws[0].game === 'TOTOLOTO') return 13;
        if (draws[0].game === 'EURODREAMS') return 5;
    }
    return 12; // Default to EuroMillions
}

/**
 * Helper to determine how many stars to predict based on game type
 */
export function getPredictionCount(draws: Draw[]): number {
    if (draws.length > 0) {
        const game = draws[0].game.toUpperCase();
        if (game === 'EURODREAMS') return 3;
        if (game === 'TOTOLOTO') return 5;
        if (game === 'EUROMILLIONS') return 6;
    }
    return 6; // Fallback
}

// 1. Hot Stars — Mais Sorteadas de Sempre
export class HotStarsSystem implements StarSystem {
    name = 'Mais Sorteadas de Sempre';
    description = 'Estrelas ordenadas da mais sorteada para a menos sorteada, desde o 1o sorteio';

    generatePrediction(history: Draw[], returnFullPool: boolean = false): number[] {
        const maxStar = getMaxStar(history);
        const predCount = returnFullPool ? maxStar : getPredictionCount(history);
        const frequency: Record<number, number> = {};

        // Inicializar todas as estrelas com 0
        for (let i = 1; i <= maxStar; i++) frequency[i] = 0;

        // Contar frequencia em TODO o historico (nao so ultimos 20)
        history.forEach(draw => {
            const stars = (typeof draw.stars === 'string' ? JSON.parse(draw.stars) : draw.stars as unknown) as number[];
            stars.forEach(star => {
                if (star >= 1 && star <= maxStar) {
                    frequency[star] = (frequency[star] || 0) + 1;
                }
            });
        });

        // Ordenar da mais frequente para a menos frequente
        return Object.entries(frequency)
            .sort(([, a], [, b]) => b - a)
            .slice(0, predCount)
            .map(([star]) => parseInt(star));
    }
}
// 2. Late Stars
export class LateStarsSystem implements StarSystem {
    name = 'Mais Atrasados Estrelas';
    description = 'Estrelas ordenadas pelo numero de sorteios desde a ultima aparicao (mais atrasada primeiro) ate ao 1o sorteio';

    generatePrediction(history: Draw[], returnFullPool: boolean = false): number[] {
        const lastSeen: Record<number, number> = {};
        const maxStar = getMaxStar(history);
        const predCount = returnFullPool ? maxStar : getPredictionCount(history);

        for (let i = 1; i <= maxStar; i++) lastSeen[i] = -1;

        for (let i = 0; i < history.length; i++) {
            const stars = (typeof history[i].stars === 'string' ? JSON.parse(history[i].stars) : history[i].stars as unknown) as number[];
            stars.forEach(star => {
                if (star >= 1 && star <= maxStar) {
                    if (lastSeen[star] === -1) lastSeen[star] = i;
                }
            });
            if (Object.values(lastSeen).every(v => v !== -1)) break;
        }

        // Se alguma estrela nunca saiu no historico, o seu atraso e o tamanho maximo do historico
        for (let i = 1; i <= maxStar; i++) {
            if (lastSeen[i] === -1) lastSeen[i] = history.length;
        }

        return Object.entries(lastSeen)
            .sort(([, a], [, b]) => b - a)
            .slice(0, predCount)
            .map(([star]) => parseInt(star));
    }
}

// 3. Markov Stars
export class MarkovStarsSystem implements StarSystem {
    name = 'Transições de Markov Estrelas';
    description = 'Estrelas ordenadas pela probabilidade de transicao a partir do ultimo sorteio';

    generatePrediction(history: Draw[], returnFullPool: boolean = false): number[] {
        const maxStar = getMaxStar(history);
        const predCount = returnFullPool ? maxStar : getPredictionCount(history);
        if (history.length < 2) {
            return Array.from({ length: predCount }, (_, i) => i + 1);
        }

        // Construir a matriz de transicoes de estrela individual i -> j
        const transitions = {};
        const globalFreq = {};
        for (let i = 1; i <= maxStar; i++) {
            transitions[i] = {};
            globalFreq[i] = 0;
        }

        // Calcular frequencia global de estrelas
        history.forEach(draw => {
            const stars = (typeof draw.stars === 'string' ? JSON.parse(draw.stars) : draw.stars as unknown) as number[];
            stars.forEach(s => {
                if (globalFreq[s] !== undefined) globalFreq[s]++;
            });
        });

        // Povoar transicoes
        for (let k = 0; k < history.length - 1; k++) {
            const prevStars = (typeof history[k+1].stars === 'string' ? JSON.parse(history[k+1].stars) : history[k+1].stars as unknown) as number[];
            const nextStars = (typeof history[k].stars === 'string' ? JSON.parse(history[k].stars) : history[k].stars as unknown) as number[];

            prevStars.forEach(prev => {
                if (transitions[prev] !== undefined) {
                    nextStars.forEach(next => {
                        transitions[prev][next] = (transitions[prev][next] || 0) + 1;
                    });
                }
            });
        }

        // Previsao baseada no ultimo sorteio (history[0])
        const lastStars = (typeof history[0].stars === 'string' ? JSON.parse(history[0].stars) : history[0].stars as unknown) as number[];
        const scores = {};
        for (let i = 1; i <= maxStar; i++) scores[i] = 0;

        lastStars.forEach(prev => {
            if (transitions[prev]) {
                Object.entries(transitions[prev]).forEach(([nextStr, count]) => {
                    const next = Number(nextStr);
                    if (scores[next] !== undefined) {
                        scores[next] += count;
                    }
                });
            }
        });

        // Ordenar
        const candidates = Object.keys(scores)
            .map(Number)
            .sort((a, b) => {
                const diff = scores[b] - scores[a];
                if (diff !== 0) return diff;
                return globalFreq[b] - globalFreq[a];
            });

        return candidates.slice(0, predCount);
        }
}

// 4. Clustering Stars
export class ClusteringStarsSystem implements StarSystem {
    name = 'Agrupamento de Padrões Estrelas';
    description = 'Estrelas ordenadas pela atividade recente do seu cluster (grupo de 3) nos últimos 20 sorteios';

    generatePrediction(history: Draw[], returnFullPool: boolean = false): number[] {
        const maxStar = getMaxStar(history);
        const predCount = returnFullPool ? maxStar : getPredictionCount(history);
        const recentDraws = history.slice(0, 20);

        // Determinar quantidade de clusters (grupos de 3)
        const numClusters = Math.ceil(maxStar / 3);
        const clusters = {};
        for (let i = 1; i <= numClusters; i++) {
            clusters[i] = [];
        }

        // Contar ocorrencias nos ultimos 20 sorteios por cluster
        recentDraws.forEach(draw => {
            const stars = (typeof draw.stars === 'string' ? JSON.parse(draw.stars) : draw.stars as unknown) as number[];
            stars.forEach(star => {
                const clusterId = Math.ceil(star / 3);
                if (clusters[clusterId] !== undefined) {
                    clusters[clusterId].push(star);
                }
            });
        });

        // Calcular atividade por cluster
        const clusterActivity = Object.entries(clusters).map(([id, nums]: [string, any]) => ({
            id: parseInt(id),
            count: nums.length
        }));

        // Ordenar clusters pelo mais ativo
        clusterActivity.sort((a, b) => b.count - a.count || a.id - b.id);

        // Contar frequencias individuais (recentes e globais)
        const recentFreq = {};
        const globalFreq = {};
        for (let i = 1; i <= maxStar; i++) {
            recentFreq[i] = 0;
            globalFreq[i] = 0;
        }

        history.forEach(draw => {
            const stars = (typeof draw.stars === 'string' ? JSON.parse(draw.stars) : draw.stars as unknown) as number[];
            stars.forEach(s => {
                if (globalFreq[s] !== undefined) globalFreq[s]++;
            });
        });

        recentDraws.forEach(draw => {
            const stars = (typeof draw.stars === 'string' ? JSON.parse(draw.stars) : draw.stars as unknown) as number[];
            stars.forEach(s => {
                if (recentFreq[s] !== undefined) recentFreq[s]++;
            });
        });

        // Montar lista completa ordenada
        const candidates: any[] = [];
        clusterActivity.forEach(activity => {
            const clusterId = activity.id;
            const startStar = (clusterId - 1) * 3 + 1;
            const endStar = Math.min(clusterId * 3, maxStar);

            const clusterStars: number[] = [];
            for (let s = startStar; s <= endStar; s++) {
                clusterStars.push(s);
            }

            clusterStars.sort((a, b) => {
                const diff = recentFreq[b] - recentFreq[a];
                if (diff !== 0) return diff;
                return globalFreq[b] - globalFreq[a];
            });

            candidates.push(...clusterStars);
        });

        return candidates.slice(0, predCount);
    }
}

// 5. PyramidPascal Stars
export class PyramidPascalStarsSystem implements StarSystem {
    name = 'Pirâmide de Pascal Estrelas';
    description = 'Estrelas ordenadas pela pontuacao dos seus digitos na Piramide de Pascal baseada no ultimo sorteio';

    generatePrediction(history: Draw[], returnFullPool: boolean = false): number[] {
        if (history.length === 0) return [];

        const maxStar = getMaxStar(history);
        const predCount = returnFullPool ? maxStar : getPredictionCount(history);

        // 1. Obter estrelas do ultimo sorteio
        const lastDraw = history[0];
        let stars = (typeof lastDraw.stars === 'string' ? JSON.parse(lastDraw.stars) : lastDraw.stars as unknown) as number[];

        const getDigits = (n) => n < 10 ? [n] : [Math.floor(n / 10), n % 10];
        const sumMod10 = (a, b) => (a + b) % 10;

        // 2. Construir piramide
        let currentRow = stars.flatMap(s => getDigits(s));
        const pyramidDigits = [...currentRow];

        while (currentRow.length > 1) {
            const nextRow: number[] = [];
            for (let i = 0; i < currentRow.length - 1; i++) {
                const sum = sumMod10(currentRow[i], currentRow[i + 1]);
                nextRow.push(sum);
                pyramidDigits.push(sum);
            }
            currentRow = nextRow;
        }

        // 3. Contar frequencia dos digitos
        const digitCounts = {};
        pyramidDigits.forEach(d => {
            digitCounts[d] = (digitCounts[d] || 0) + 1;
        });

        // 4. Pontuar estrelas (1 a maxStar)
        const candidates: any[] = [];
        const scoreStarByDigits = (num, counts) => {
            const digs = getDigits(num);
            return digs.reduce((sum, d) => sum + (counts[d] || 0), 0);
        };

        for (let i = 1; i <= maxStar; i++) {
            const score = scoreStarByDigits(i, digitCounts);
            candidates.push({ num: i, score });
        }

        // 5. Ordenar
        candidates.sort((a, b) => b.score - a.score || a.num - b.num);

        return candidates.slice(0, predCount).map(c => c.num);
    }
}
export class PyramidGapsStarsSystem implements StarSystem {
    name = 'Pirâmide de Intervalos Estrelas';
    description = 'Estrelas ordenadas pela analise de intervalos espaciais (diferencas) baseada no historico de sorteios';

    generatePrediction(history: Draw[], returnFullPool: boolean = false): number[] {
        if (history.length === 0) return [];

        const maxStar = getMaxStar(history);
        const predCount = returnFullPool ? maxStar : getPredictionCount(history);

        // Determinar quantas estrelas sao sorteadas neste jogo
        const firstDraw = history[0];
        const sampleStars = (typeof firstDraw.stars === 'string' ? JSON.parse(firstDraw.stars) : firstDraw.stars as unknown) as number[];
        const starsDrawn = sampleStars ? sampleStars.length : 0;

        const globalFreqStar = {};
        for (let i = 1; i <= maxStar; i++) globalFreqStar[i] = 0;
        history.forEach(d => {
            const stars = (typeof d.stars === 'string' ? JSON.parse(d.stars) : d.stars as unknown) as number[];
            stars.forEach(s => {
                if (globalFreqStar[s] !== undefined) globalFreqStar[s]++;
            });
        });

        if (starsDrawn <= 1) {
            // Fallback para jogos com 1 ou 0 estrelas (EuroDreams, Totoloto, MegaSena)
            // Ordenar puramente pela frequencia de saida
            const result = Object.keys(globalFreqStar)
                .map(Number)
                .sort((a, b) => globalFreqStar[b] - globalFreqStar[a] || a - b);
            return result.slice(0, predCount);
        }

        // Se tem 2 ou mais estrelas (como EuroMillions)
        const startingStarFreq = {};
        const gap1Freq = {};

        history.forEach(d => {
            const stars = ((typeof d.stars === 'string' ? JSON.parse(d.stars) : d.stars as unknown) as number[]).map(Number).sort((a, b) => a - b);
            if (stars.length >= 2) {
                startingStarFreq[stars[0]] = (startingStarFreq[stars[0]] || 0) + 1;
                const g1 = stars[1] - stars[0];
                gap1Freq[g1] = (gap1Freq[g1] || 0) + 1;
            }
        });

        const getTopK = (freq: Record<string | number, number>, k: number): number[] =>
            Object.entries(freq).sort(([, a], [, b]) => (b as number) - (a as number)).slice(0, k).map(([n]) => parseInt(n));

        const topStarts = getTopK(startingStarFreq, 3);
        const topG1 = getTopK(gap1Freq, 3);

        const candidates = new Set<number>();
        for (const start of topStarts) {
            for (const g1 of topG1) {
                const s1 = start;
                const s2 = s1 + g1;
                if (s2 <= maxStar) {
                    candidates.add(s1);
                    candidates.add(s2);
                }
            }
        }
        
        const result: number[] = Array.from(candidates);
        let fallbackIdx = 1;
        while (result.length < predCount && fallbackIdx <= maxStar) {
            if (!result.includes(fallbackIdx)) result.push(fallbackIdx);
            fallbackIdx++;
        }
        return result.slice(0, predCount);
    }
}

// 8. Media 3 Otimizado Stars
export class SistMedia3OtimizadoStarsSystem implements StarSystem {
    name = 'Sistema Média +3 Otimizado Estrelas';
    description = 'Estrelas ordenadas pela media aparada das posicoes nos ultimos 20 sorteios + vizinhos (desvio 1)';

    generatePrediction(history: Draw[], returnFullPool: boolean = false): number[] {
        const maxStar = getMaxStar(history);
        const predCount = returnFullPool ? maxStar : getPredictionCount(history);
        const recentDraws = history.slice(0, 20);

        if (recentDraws.length === 0) return [];
        const starsLength = JSON.parse(recentDraws[0].stars).length;
        const candidateTiers = {};

        for (let pos = 0; pos < starsLength; pos++) {
            const valuesAtPos = recentDraws.map(d => {
                const s = (typeof d.stars === 'string' ? JSON.parse(d.stars) : d.stars as unknown) as number[];
                return s[pos];
            }).filter(n => !isNaN(n));

            if (valuesAtPos.length < 3) continue;
            valuesAtPos.sort((a, b) => a - b);
            const trimmed = valuesAtPos.slice(1, -1);
            if (trimmed.length === 0) continue;

            const sum = trimmed.reduce((a, b) => a + b, 0);
            const mean = Math.round(sum / trimmed.length);

            // Vizinhos de desvio 1 (total de 3 candidatos por posicao)
            for (let offset = -1; offset <= 1; offset++) {
                const star = mean + offset;
                if (star >= 1 && star <= maxStar) {
                    const tier = Math.abs(offset);
                    if (candidateTiers[star] === undefined || tier < candidateTiers[star]) {
                        candidateTiers[star] = tier;
                    }
                }
            }
        }

        let sortedResult = Object.keys(candidateTiers).map(Number);

        // Ordenar por Tier, depois por frequencia recente
        const recentFreq = {};
        const globalFreq = {};
        for (let i = 1; i <= maxStar; i++) {
            recentFreq[i] = 0;
            globalFreq[i] = 0;
        }

        history.forEach(draw => {
            const stars = (typeof draw.stars === 'string' ? JSON.parse(draw.stars) : draw.stars as unknown) as number[];
            stars.forEach(s => { if (globalFreq[s] !== undefined) globalFreq[s]++; });
        });

        recentDraws.forEach(draw => {
            const stars = (typeof draw.stars === 'string' ? JSON.parse(draw.stars) : draw.stars as unknown) as number[];
            stars.forEach(s => { if (recentFreq[s] !== undefined) recentFreq[s]++; });
        });

        sortedResult.sort((a, b) => {
            const tierA = candidateTiers[a];
            const tierB = candidateTiers[b];
            if (tierA !== tierB) return tierA - tierB;
            return recentFreq[b] - recentFreq[a] || globalFreq[b] - globalFreq[a];
        });

        // Preencher o restante pool
        const result = [...sortedResult];
        const sortedGlobal = Object.keys(globalFreq)
            .map(Number)
            .sort((a, b) => globalFreq[b] - globalFreq[a] || a - b);

        for (const star of sortedGlobal) {
            if (result.length >= predCount) break;
            if (!result.includes(star)) result.push(star);
        }

        return result.slice(0, predCount);
    }
}


// 9. Universal Oscillation V2 Stars
export class UniversalOscillationV2StarsSystem implements StarSystem {
    name = 'Oscilação Universal Estrelas';
    description = 'Estrelas ordenadas pelo peso de oscilacao baseado na raiz digital dominante do ultimo sorteio';

    private getRoot(num: number): number {
        let val = num;
        while (val > 9) {
            val = val.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
        }
        return val;
    }

    generatePrediction(history: Draw[], returnFullPool: boolean = false): number[] {
        if (history.length === 0) return [];

        const maxStar = getMaxStar(history);
        const predCount = returnFullPool ? maxStar : getPredictionCount(history);

        // 1. Analisar ultimo sorteio
        const lastDraw = history[0];
        const lastStars = ((typeof lastDraw.stars === 'string' ? JSON.parse(lastDraw.stars) : lastDraw.stars as unknown) as number[]).map(Number);

        // Contar raizes no ultimo sorteio
        const rootCount = {};
        for (let i = 1; i <= 9; i++) rootCount[i] = 0;
        lastStars.forEach(s => {
            const root = this.getRoot(s);
            if (rootCount[root] !== undefined) rootCount[root]++;
        });

        // Encontrar raizes dominantes
        const maxCount = Math.max(...(Object.values(rootCount) as number[]));
        const dominantRoots = Object.entries(rootCount)
            .filter(([, count]) => count === maxCount && count > 0)
            .map(([root]) => parseInt(root));

        // Calcular frequencias recentes (limitadas a 1000 sorteios)
        const recentHistory = history.slice(0, 1000);
        const globalFreqStar = {};
        for (let i = 1; i <= maxStar; i++) globalFreqStar[i] = 0;
        recentHistory.forEach(d => {
            const stars = (typeof d.stars === 'string' ? JSON.parse(d.stars) : d.stars as unknown) as number[];
            stars.forEach(s => {
                if (globalFreqStar[s] !== undefined) globalFreqStar[s]++;
            });
        });

        // Calcular pontuacao com boost de oscilacao
        const scores: { star: number; score: number }[] = [];
        for (let candidate = 1; candidate <= maxStar; candidate++) {
            const root = this.getRoot(candidate);
            const frequency = globalFreqStar[candidate] || 0;
            let score = frequency;

            // Se nao e dominante -> BOOST 50%
            if (!dominantRoots.includes(root)) {
                score *= 1.5;
            } else {
                // Se e dominante -> PENALIZACAO 50%
                score *= 0.5;
            }
            scores.push({ star: candidate, score });
        }

        scores.sort((a, b) => b.score - a.score || a.star - b.star);

        return scores.slice(0, predCount).map(s => s.star);
    }
}
export class DiagonaisMatrizStarsSystem implements StarSystem {
    name = 'Diagonais da Matriz Estrelas';
    description = 'Estrelas ordenadas pelo fluxo de diagonais geometricas na matriz de estrelas (profundidade 50)';

    generatePrediction(history: Draw[], returnFullPool: boolean = false): number[] {
        if (history.length === 0) return [];

        const maxStar = getMaxStar(history);
        const predCount = returnFullPool ? maxStar : getPredictionCount(history);

        const hasStar = (delay, starVal) => {
            if (starVal < 1 || starVal > maxStar) return false;
            const draw = history[delay - 1];
            if (!draw) return false;
            
            let stars: number[] = [];
            if (typeof draw.stars === 'string') {
                stars = JSON.parse(draw.stars);
            } else {
                stars = draw.stars as unknown as number[];
            }
            return stars.includes(starVal);
        };

        const candidates: any[] = [];

        for (let n = 1; n <= maxStar; n++) {
            let leftSum = 0;
            let rightSum = 0;

            const leftSteps = Math.min(n, 50);
            for (let d = 1; d <= leftSteps; d++) {
                if (hasStar(d, n - (d - 1))) {
                    leftSum++;
                }
            }

            const rightSteps = Math.min(maxStar - n + 1, 50);
            for (let d = 1; d <= rightSteps; d++) {
                if (hasStar(d, n + (d - 1))) {
                    rightSum++;
                }
            }

            candidates.push({
                num: n,
                score: leftSum + rightSum
            });
        }

        candidates.sort((a, b) => b.score - a.score || a.num - b.num);

        return candidates.slice(0, predCount).map(c => c.num);
    }
}
export class DiagonaisMatriz3DStarsSystem implements StarSystem {
    name = 'Diagonais da Matriz 3D Estrelas';
    description = 'Estrelas ordenadas pelo fluxo tridimensional de diagonais cilindricas na matriz de estrelas (historico completo)';

    generatePrediction(history: Draw[], returnFullPool: boolean = false): number[] {
        if (history.length === 0) return [];

        const maxStar = getMaxStar(history);
        const predCount = returnFullPool ? maxStar : getPredictionCount(history);
        const totalHistory = history.length;

        const hasStar = (delay, starVal) => {
            const draw = history[delay - 1];
            if (!draw) return false;
            
            let stars: number[] = [];
            if (typeof draw.stars === 'string') {
                stars = JSON.parse(draw.stars);
            } else {
                stars = draw.stars as unknown as number[];
            }
            return stars.includes(starVal);
        };

        const candidates: any[] = [];

        for (let n = 1; n <= maxStar; n++) {
            let leftSum = 0;
            let rightSum = 0;

            for (let d = 1; d <= totalHistory; d++) {
                const leftCol = (( (n - d) % maxStar ) + maxStar) % maxStar + 1;
                if (hasStar(d, leftCol)) {
                    leftSum++;
                }

                const rightCol = ( (n + d - 2) % maxStar ) + 1;
                if (hasStar(d, rightCol)) {
                    rightSum++;
                }
            }

            candidates.push({
                num: n,
                score: leftSum + rightSum
            });
        }

        candidates.sort((a, b) => b.score - a.score || a.num - b.num);

        return candidates.slice(0, predCount).map(c => c.num);
    }
}
// 1.1 Hot Recent Stars — Mais Quentes Estrelas
export class HotRecentStarsSystem implements StarSystem {
    name = 'Mais Quentes Estrelas';
    description = 'Estrelas ordenadas pelo numero de vezes que sairam nos ultimos 20 sorteios';

    generatePrediction(history: Draw[], returnFullPool: boolean = false): number[] {
        const maxStar = getMaxStar(history);
        const predCount = returnFullPool ? maxStar : getPredictionCount(history);
        const recentDraws = history.slice(0, 20);
        const recentFreq = {};
        const globalFreq = {};

        // Inicializar frequencias
        for (let i = 1; i <= maxStar; i++) {
            recentFreq[i] = 0;
            globalFreq[i] = 0;
        }

        // Calcular frequencia global (para desempate)
        history.forEach(draw => {
            const stars = (typeof draw.stars === 'string' ? JSON.parse(draw.stars) : draw.stars as unknown) as number[];
            stars.forEach(star => {
                if (globalFreq[star] !== undefined) globalFreq[star]++;
            });
        });

        // Calcular frequencia recente (ultimos 20)
        recentDraws.forEach(draw => {
            const stars = (typeof draw.stars === 'string' ? JSON.parse(draw.stars) : draw.stars as unknown) as number[];
            stars.forEach(star => {
                if (recentFreq[star] !== undefined) recentFreq[star]++;
            });
        });

        // Ordenar
        const candidates = Object.keys(recentFreq)
            .map(Number)
            .sort((a, b) => {
                const diff = recentFreq[b] - recentFreq[a];
                if (diff !== 0) return diff;
                return globalFreq[b] - globalFreq[a];
            });

        return candidates.slice(0, predCount);
    }
}

const baseStarSystemsArray: StarSystem[] = [
    new HotStarsSystem(),
    new HotRecentStarsSystem(),
    new LateStarsSystem(),
    new MarkovStarsSystem(),
    new ClusteringStarsSystem(),
    new PyramidPascalStarsSystem(),
    new PyramidGapsStarsSystem(),
    new SistMedia3OtimizadoStarsSystem(),
    new UniversalOscillationV2StarsSystem(),
    new DiagonaisMatrizStarsSystem(),
    new DiagonaisMatriz3DStarsSystem(),
    new MonteCarloStarsSystem(),
];

export const starBaseSystems: StarSystem[] = baseStarSystemsArray.map(sys => {
    if (!sys.type) sys.type = 'base';
    sys.domain = 'stars';
    return sys;
});

export const starEnsembleSystems: StarSystem[] = [];

export const starSystems: StarSystem[] = [
    ...starBaseSystems
];
