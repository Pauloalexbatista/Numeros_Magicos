const fs = require('fs');
let content = fs.readFileSync('src/services/ranked-systems.ts', 'utf8');

const target = `export async function generateMarkovChain(draws: Draw[], returnFullPool: boolean = false): Promise<number[]> {
    const maxNum = getMaxNumber(draws);
    if (draws.length < 2) return ensureN([], draws, returnFullPool);

    // Construir a matriz de transicao baseada no historico
    // draws[0] e o mais recente. A transicao e de draws[k+1] para draws[k]
    const transitions = {};
    const globalFreq = {};

    for (let i = 1; i <= maxNum; i++) {
        transitions[i] = {};
        globalFreq[i] = 0;
    }

    // Calcular frequencias globais para desempate
    draws.forEach(draw => {
        parseNumbers(draw).forEach(n => {
            if (globalFreq[n] !== undefined) globalFreq[n]++;
        });
    });

    for (let k = 0; k < draws.length - 1; k++) {
        const prevDrawNums = parseNumbers(draws[k + 1]);
        const nextDrawNums = parseNumbers(draws[k]);

        prevDrawNums.forEach(prev => {
            if (transitions[prev] !== undefined) {
                nextDrawNums.forEach(next => {
                    transitions[prev][next] = (transitions[prev][next] || 0) + 1;
                });
            }
        });
    }

    // Previsao baseada no ultimo sorteio (draws[0])
    const lastNumbers = parseNumbers(draws[0]);
    const scores = {};
    for (let i = 1; i <= maxNum; i++) scores[i] = 0;

    lastNumbers.forEach(prev => {
        if (transitions[prev]) {
            Object.entries(transitions[prev]).forEach(([nextStr, count]) => {
                const next = Number(nextStr);
                if (scores[next] !== undefined) {
                    scores[next] += count;
                }
            });
        }
    });

    // Ordenar: 1o por probabilidade de transicao (score), 2o por frequencia global
    const candidates = Object.keys(scores)
        .map(Number)
        .sort((a, b) => {
            const diff = scores[b] - scores[a];
            if (diff !== 0) return diff;
            return globalFreq[b] - globalFreq[a];
        });

    return ensureN(candidates, draws, returnFullPool);
}`;

const replacement = `export async function generateMarkovChain(draws: Draw[], returnFullPool: boolean = false): Promise<number[]> {
    const { predCount: defaultPredCount, maxNum } = getGameConfig(draws);
    const predCount = returnFullPool ? maxNum : defaultPredCount;

    if (!draws || draws.length === 0) {
        return Array.from({ length: predCount }, (_, i) => i + 1);
    }

    // --- GUARDA DE INVERSÃO TEMPORAL AUTOMÁTICA ---
    const d0 = new Date(draws[0].date).getTime();
    const dEnd = new Date(draws[draws.length - 1].date).getTime();
    const chronDraws = (d0 < dEnd) ? [...draws].reverse() : draws;

    if (chronDraws.length < 2) {
        return Array.from({ length: predCount }, (_, i) => i + 1);
    }

    // 1. Construir matriz de transições
    // chronDraws[0] é o mais recente (T-1). Transição vai do mais antigo para o mais recente (k+1 -> k)
    const transitions: Record<number, Record<number, number>> = {};
    for (let i = 1; i <= maxNum; i++) {
        transitions[i] = {};
    }

    for (let k = 0; k < chronDraws.length - 1; k++) {
        const prevDrawNums = parseNumbers(chronDraws[k + 1]);
        const nextDrawNums = parseNumbers(chronDraws[k]);

        prevDrawNums.forEach(prev => {
            if (transitions[prev] !== undefined) {
                nextDrawNums.forEach(next => {
                    transitions[prev][next] = (transitions[prev][next] || 0) + 1;
                });
            }
        });
    }

    // 2. Pontuação baseada estritamente no sorteio anterior (T-1 = chronDraws[0])
    const lastNumbers = parseNumbers(chronDraws[0]);
    const scores: Record<number, number> = {};
    for (let i = 1; i <= maxNum; i++) scores[i] = 0;

    lastNumbers.forEach(prev => {
        if (transitions[prev]) {
            Object.entries(transitions[prev]).forEach(([nextStr, count]) => {
                const next = Number(nextStr);
                if (scores[next] !== undefined) {
                    scores[next] += count;
                }
            });
        }
    });

    // 3. Frequência recente (últimos 20 sorteios) para desempate
    const freq20: Record<number, number> = {};
    for (let i = 1; i <= maxNum; i++) freq20[i] = 0;
    const recent20 = chronDraws.slice(0, 20);
    recent20.forEach(d => {
        parseNumbers(d).forEach(n => {
            if (freq20[n] !== undefined) freq20[n]++;
        });
    });

    // 4. Ordenação Canónica (Score desc -> Freq20 desc -> Opção A asc)
    const candidates = Array.from({ length: maxNum }, (_, i) => i + 1);
    candidates.sort((a, b) => {
        const diffScore = scores[b] - scores[a];
        if (diffScore !== 0) return diffScore;

        const diffFreq = freq20[b] - freq20[a];
        if (diffFreq !== 0) return diffFreq;

        return a - b;
    });

    return candidates.slice(0, predCount);
}`;

const normContent = content.replace(/\r\n/g, '\n');
const normTarget = target.replace(/\r\n/g, '\n');
const normReplacement = replacement.replace(/\r\n/g, '\n');

if (!normContent.includes(normTarget)) {
    console.error('Target not found in ranked-systems.ts!');
    process.exit(1);
}

fs.writeFileSync('src/services/ranked-systems.ts', normContent.replace(normTarget, normReplacement), 'utf8');
console.log('Successfully replaced generateMarkovChain in ranked-systems.ts');
