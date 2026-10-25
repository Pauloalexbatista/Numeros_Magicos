const fs = require('fs');
let content = fs.readFileSync('src/services/ranked-systems.ts', 'utf8');

const target = `export async function generateHotNumbers(draws: Draw[], returnFullPool: boolean = false): Promise<number[]> {
    const frequency: Record<number, number> = {};

    draws.forEach(draw => {
        const numbers = parseNumbers(draw);
        numbers.forEach(num => {
            frequency[num] = (frequency[num] || 0) + 1;
        });
    });

    const candidates = Object.entries(frequency)
        .sort(([, a], [, b]) => b - a)
        .map(([num]) => parseInt(num));

    return ensureN(candidates, draws, returnFullPool);
}`;

const replacement = `export async function generateHotNumbers(draws: Draw[], returnFullPool: boolean = false): Promise<number[]> {
    const { predCount: defaultPredCount, maxNum } = getGameConfig(draws);
    const predCount = returnFullPool ? maxNum : defaultPredCount;

    if (!draws || draws.length === 0) {
        return Array.from({ length: predCount }, (_, i) => i + 1);
    }

    // --- GUARDA DE INVERSÃO TEMPORAL AUTOMÁTICA ---
    const d0 = new Date(draws[0].date).getTime();
    const dEnd = new Date(draws[draws.length - 1].date).getTime();
    const chronDraws = (d0 < dEnd) ? [...draws].reverse() : draws;

    const totalFreq: Record<number, number> = {};
    const freq20: Record<number, number> = {};
    for (let i = 1; i <= maxNum; i++) {
        totalFreq[i] = 0;
        freq20[i] = 0;
    }

    chronDraws.forEach((draw, idx) => {
        const numbers = parseNumbers(draw);
        numbers.forEach(num => {
            if (totalFreq[num] !== undefined) totalFreq[num]++;
            if (idx < 20 && freq20[num] !== undefined) freq20[num]++;
        });
    });

    const candidates = Array.from({ length: maxNum }, (_, i) => i + 1);
    candidates.sort((a, b) => {
        const diffTotal = totalFreq[b] - totalFreq[a];
        if (diffTotal !== 0) return diffTotal;

        const diff20 = freq20[b] - freq20[a];
        if (diff20 !== 0) return diff20;

        return a - b;
    });

    return candidates.slice(0, predCount);
}`;

const normContent = content.replace(/\r\n/g, '\n');
const normTarget = target.replace(/\r\n/g, '\n');
const normReplacement = replacement.replace(/\r\n/g, '\n');

if (!normContent.includes(normTarget)) {
    console.error('Target generateHotNumbers not found in ranked-systems.ts!');
    process.exit(1);
}

fs.writeFileSync('src/services/ranked-systems.ts', normContent.replace(normTarget, normReplacement), 'utf8');
console.log('Successfully replaced generateHotNumbers with canonical tie-breaker');
