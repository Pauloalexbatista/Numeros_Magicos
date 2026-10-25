const fs = require('fs');
let content = fs.readFileSync('src/services/ranked-systems.ts', 'utf8');

const target = `export async function generateHotRecentNumbers(draws: Draw[], returnFullPool: boolean = false): Promise<number[]> {
    const maxNum = getMaxNumber(draws);
    const recentDraws = draws.slice(0, 20);
    const recentFreq = {};
    const globalFreq = {};

    // Inicializar frequências
    for (let i = 1; i <= maxNum; i++) {
        recentFreq[i] = 0;
        globalFreq[i] = 0;
    }

    // Calcular globalFreq (para desempate)
    draws.forEach(draw => {
        parseNumbers(draw).forEach(num => {
            if (globalFreq[num] !== undefined) globalFreq[num]++;
        });
    });

    // Calcular recentFreq (últimos 20)
    recentDraws.forEach(draw => {
        parseNumbers(draw).forEach(num => {
            if (recentFreq[num] !== undefined) recentFreq[num]++;
        });
    });

    // Ordenar: 1º por frequência recente (descendente), 2º por frequência global (descendente)
    const candidates = Object.keys(recentFreq)
        .map(Number)
        .sort((a, b) => {
            const diff = recentFreq[b] - recentFreq[a];
            if (diff !== 0) return diff;
            return globalFreq[b] - globalFreq[a]; // desempate global
        });

    return ensureN(candidates, draws, returnFullPool);
}`;

const replacement = `export async function generateHotRecentNumbers(draws: Draw[], returnFullPool: boolean = false): Promise<number[]> {
    const { predCount: defaultPredCount, maxNum } = getGameConfig(draws);
    const predCount = returnFullPool ? maxNum : defaultPredCount;

    if (!draws || draws.length === 0) {
        return Array.from({ length: predCount }, (_, i) => i + 1);
    }

    // --- GUARDA DE INVERSÃO TEMPORAL AUTOMÁTICA ---
    const d0 = new Date(draws[0].date).getTime();
    const dEnd = new Date(draws[draws.length - 1].date).getTime();
    const chronDraws = (d0 < dEnd) ? [...draws].reverse() : draws;

    // Frequência base na janela de 20 sorteios
    const recent20 = chronDraws.slice(0, 20);
    const freq20: Record<number, number> = {};
    for (let i = 1; i <= maxNum; i++) freq20[i] = 0;

    recent20.forEach(draw => {
        const nums = parseNumbers(draw);
        nums.forEach(n => {
            if (freq20[n] !== undefined) freq20[n]++;
        });
    });

    // Pré-calcular frequências cumulativas para desempates progressivos (+5 em +5 sorteios)
    // Janelas de 25, 30, 35, 40, ... até ao total de sorteios
    const cumFreqWindows: Record<number, Record<number, number>> = {};
    for (let w = 25; w <= chronDraws.length + 5; w += 5) {
        const winLimit = Math.min(w, chronDraws.length);
        const winDraws = chronDraws.slice(0, winLimit);
        cumFreqWindows[w] = {};
        for (let i = 1; i <= maxNum; i++) cumFreqWindows[w][i] = 0;
        winDraws.forEach(draw => {
            parseNumbers(draw).forEach(n => {
                if (cumFreqWindows[w][n] !== undefined) cumFreqWindows[w][n]++;
            });
        });
        if (winLimit === chronDraws.length) break;
    }

    const candidates = Array.from({ length: maxNum }, (_, i) => i + 1);

    candidates.sort((a, b) => {
        // 1. REGRA DE OURO DA INVIOLABILIDADE: Nível 20 é absoluto
        const diff20 = freq20[b] - freq20[a];
        if (diff20 !== 0) return diff20;

        // 2. Desempate progressivo exclusivo dentro do mesmo escalão de empate
        for (let w = 25; w <= chronDraws.length + 5; w += 5) {
            if (cumFreqWindows[w]) {
                const diffW = cumFreqWindows[w][b] - cumFreqWindows[w][a];
                if (diffW !== 0) return diffW;
            }
            if (w >= chronDraws.length) break;
        }

        // 3. Desempate canónico final: Opção A (ordem crescente)
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
console.log('Successfully replaced generateHotRecentNumbers with tiered tie-breaker');
