const fs = require('fs');
let content = fs.readFileSync('src/services/ranked-systems.ts', 'utf8');

const target = `export async function generateMonteCarlo(draws: Draw[], returnFullPool: boolean = false): Promise<number[]> {
    const frequency: Record<number, number> = {};
    const maxNum = getMaxNumber(draws);

    draws.forEach(draw => {
        const numbers = parseNumbers(draw);
        numbers.forEach(num => {
            frequency[num] = (frequency[num] || 0) + 1;
        });
    });

    const totalDraws = draws.length;
    const probabilities: Record<number, number> = {};
    Object.entries(frequency).forEach(([num, count]) => {
        probabilities[parseInt(num)] = count / totalDraws;
    });

    const lastDraw = draws[0];
    const seedStr = lastDraw ? \`\${lastDraw.id}-\${lastDraw.date}\` : 'default-seed';
    const rng = new SeededRNG(seedStr);

    const simulations = 1000;
    const simulationResults: Record<number, number> = {};

    for (let i = 0; i < simulations; i++) {
        const simDraw: number[] = [];
        const available = Array.from({ length: maxNum }, (_, i) => i + 1);

        while (simDraw.length < 5) {
            const weights = available.map(n => probabilities[n] || 0.01);
            const totalWeight = weights.reduce((a, b) => a + b, 0);
            let random = rng.next() * totalWeight;

            for (let j = 0; j < available.length; j++) {
                random -= weights[j];
                if (random <= 0) {
                    const selected = available[j];
                    simDraw.push(selected);
                    available.splice(j, 1);
                    break;
                }
            }
        }

        simDraw.forEach(num => {
            simulationResults[num] = (simulationResults[num] || 0) + 1;
        });
    }

    const candidates = Object.entries(simulationResults)
        .sort(([, a], [, b]) => b - a)
        .map(([num]) => parseInt(num));

    return ensureN(candidates, draws, returnFullPool);
}`;

const replacement = `export async function generateMonteCarlo(draws: Draw[], returnFullPool: boolean = false): Promise<number[]> {
    const { predCount: defaultPredCount, maxNum } = getGameConfig(draws);
    const predCount = returnFullPool ? maxNum : defaultPredCount;

    if (!draws || draws.length === 0) {
        return Array.from({ length: predCount }, (_, i) => i + 1);
    }

    // --- GUARDA DE INVERSÃO TEMPORAL AUTOMÁTICA ---
    const d0 = new Date(draws[0].date).getTime();
    const dEnd = new Date(draws[draws.length - 1].date).getTime();
    const chronDraws = (d0 < dEnd) ? [...draws].reverse() : draws;

    const frequency: Record<number, number> = {};
    const freq20: Record<number, number> = {};
    for (let i = 1; i <= maxNum; i++) {
        frequency[i] = 0;
        freq20[i] = 0;
    }

    chronDraws.forEach((draw, idx) => {
        const numbers = parseNumbers(draw);
        numbers.forEach(num => {
            if (frequency[num] !== undefined) frequency[num]++;
            if (idx < 20 && freq20[num] !== undefined) freq20[num]++;
        });
    });

    const totalBalls = Object.values(frequency).reduce((a, b) => a + b, 0) || 1;
    const probabilities: Record<number, number> = {};
    for (let i = 1; i <= maxNum; i++) {
        probabilities[i] = Math.max(0.01, frequency[i] / totalBalls);
    }

    // Determinar número de bolas sorteadas dinamicamente pelo primeiro sorteio (5 ou 6)
    const sampleNums = parseNumbers(chronDraws[0]);
    const ballsPerDraw = sampleNums.length >= 6 ? 6 : 5;

    const lastDraw = chronDraws[0];
    const seedStr = lastDraw ? \`\${lastDraw.id}-\${lastDraw.date}\` : 'monte-carlo-seed';
    const rng = new SeededRNG(seedStr);

    const simulations = 1000;
    const simulationResults: Record<number, number> = {};
    for (let i = 1; i <= maxNum; i++) simulationResults[i] = 0;

    for (let i = 0; i < simulations; i++) {
        const simDraw: number[] = [];
        const available = Array.from({ length: maxNum }, (_, idx) => idx + 1);

        while (simDraw.length < ballsPerDraw) {
            const weights = available.map(n => probabilities[n]);
            const totalWeight = weights.reduce((a, b) => a + b, 0);
            let random = rng.next() * totalWeight;

            for (let j = 0; j < available.length; j++) {
                random -= weights[j];
                if (random <= 0) {
                    const selected = available[j];
                    simDraw.push(selected);
                    available.splice(j, 1);
                    break;
                }
            }
        }

        simDraw.forEach(num => {
            simulationResults[num]++;
        });
    }

    const candidates = Array.from({ length: maxNum }, (_, i) => i + 1);
    candidates.sort((a, b) => {
        const diffSim = simulationResults[b] - simulationResults[a];
        if (diffSim !== 0) return diffSim;

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
    console.error('Target generateMonteCarlo not found in ranked-systems.ts!');
    process.exit(1);
}

fs.writeFileSync('src/services/ranked-systems.ts', normContent.replace(normTarget, normReplacement), 'utf8');
console.log('Successfully replaced generateMonteCarlo in ranked-systems.ts');
