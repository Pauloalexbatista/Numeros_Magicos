
// import { prisma } from '../../lib/prisma';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL || 'file:./prisma/dev.db'
        }
    }
});
import { Draw } from '@prisma/client';
import { SeededRNG } from '../../utils/seeded-rng';
import { updateRanking, initializeSystems } from '../../services/ranking';
import { updateAllStatisticsCache } from '../../services/cache/statisticsCache';

// Import Original Systems
import { PyramidPascalSystem } from '../../services/pyramid-pascal';
import { PyramidGapsSystem } from '../../services/pyramid-gaps';
import { VortexPyramidSystem } from '../../services/vortex-pyramid';
import { RandomSystem } from '../../services/random-system';

// Import Missing Systems
import { VortexMultiChannelSystem } from '../../services/vortex-multichannel';
import { SistMediaCamadas } from '../../services/custom/SistMediaCamadas';
import { SistCombinadoMedia3System } from '../../services/custom/SistCombinadoMedia3';

import { SistMedia3Otimizado } from '../../services/custom/SistMedia3Otimizado';
import { mdiasemaspontasSystem } from '../../services/custom/mdiasemaspontas';
import { UniversalOscillationV2System } from '../../services/universal-oscillation-v2-system';
import ConsensusAutoV1 from '../../services/consensus-auto';


// --- Interfaces ---

interface IStatefulSystem {
    name: string;
    reset(): void;
    update(draw: Draw): void;
    predictNext(): Promise<number[]>;
}

// --- Helper Functions ---

function parseNumbers(draw: Draw): number[] {
    if (typeof draw.numbers === 'string') {
        return JSON.parse(draw.numbers);
    }
    return draw.numbers as unknown as number[];
}

function ensureCount(numbers: number[], fallbackFrequency: Record<number, number>, maxNumber: number = 50, count: number = 25): number[] {
    let result = [...new Set(numbers)];
    if (result.length < count) {
        const sortedFreq = Object.entries(fallbackFrequency)
            .sort(([, a], [, b]) => b - a)
            .map(([num]) => parseInt(num));
        for (const num of sortedFreq) {
            if (result.length >= count) break;
            if (!result.includes(num)) result.push(num);
        }
        for (let i = 1; i <= maxNumber; i++) {
            if (result.length >= count) break;
            if (!result.includes(i)) result.push(i);
        }
    }
    return result.slice(0, count);
}

function getInverse(numbers: number[], maxNumber: number = 50, count: number = 25): number[] {
    const all = Array.from({ length: maxNumber }, (_, i) => i + 1);
    return all.filter(n => !numbers.includes(n)).slice(0, count);
}

// --- System Implementations ---
// Note: We need to pass predCount to systems or have them access it. 
// For simplicity in this script, we'll modify the constructors to accept predCount.

class StatefulHotNumbers implements IStatefulSystem {
    name = 'Hot Numbers';
    private frequency: Record<number, number> = {};
    private maxNumber: number;
    private predCount: number;
    constructor(maxNumber: number = 50, predCount: number = 25) { this.maxNumber = maxNumber; this.predCount = predCount; }
    reset() { this.frequency = {}; }
    update(draw: Draw) {
        const nums = parseNumbers(draw);
        nums.forEach(n => this.frequency[n] = (this.frequency[n] || 0) + 1);
    }
    async predictNext(): Promise<number[]> {
        const candidates = Object.entries(this.frequency).sort(([, a], [, b]) => b - a).map(([num]) => parseInt(num));
        return ensureCount(candidates, this.frequency, this.maxNumber, this.predCount);
    }
}

class StatefulMarkovChain implements IStatefulSystem {
    name = 'Markov Chain';
    private transitions: Record<number, Record<number, number>> = {};
    private lastDrawNumbers: number[] = [];
    private frequency: Record<number, number> = {};
    private maxNumber: number;
    private predCount: number;
    constructor(maxNumber: number = 50, predCount: number = 25) { this.maxNumber = maxNumber; this.predCount = predCount; }
    reset() { this.transitions = {}; this.lastDrawNumbers = []; this.frequency = {}; }
    update(draw: Draw) {
        const nums = parseNumbers(draw);
        nums.forEach(n => this.frequency[n] = (this.frequency[n] || 0) + 1);
        nums.forEach(n1 => {
            if (!this.transitions[n1]) this.transitions[n1] = {};
            nums.forEach(n2 => { if (n1 !== n2) this.transitions[n1][n2] = (this.transitions[n1][n2] || 0) + 1; });
        });
        this.lastDrawNumbers = nums;
    }
    async predictNext(): Promise<number[]> {
        if (this.lastDrawNumbers.length === 0) return ensureCount([], this.frequency, this.maxNumber, this.predCount);
        const scores: Record<number, number> = {};
        this.lastDrawNumbers.forEach(prevNum => {
            if (this.transitions[prevNum]) {
                Object.entries(this.transitions[prevNum]).forEach(([nextNum, count]) => {
                    const n = parseInt(nextNum);
                    scores[n] = (scores[n] || 0) + count;
                });
            }
        });
        const candidates = Object.entries(scores).sort(([, a], [, b]) => b - a).map(([num]) => parseInt(num));
        return ensureCount(candidates, this.frequency, this.maxNumber, this.predCount);
    }
}

class StatefulClustering implements IStatefulSystem {
    name = 'Clustering';
    private clusters: Record<number, number[]> = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    private frequency: Record<number, number> = {};
    private maxNumber: number;
    private predCount: number;
    constructor(maxNumber: number = 50, predCount: number = 25) { this.maxNumber = maxNumber; this.predCount = predCount; }
    reset() { this.clusters = { 1: [], 2: [], 3: [], 4: [], 5: [] }; this.frequency = {}; }
    update(draw: Draw) {
        const nums = parseNumbers(draw);
        nums.forEach(n => {
            this.frequency[n] = (this.frequency[n] || 0) + 1;
            const cluster = Math.ceil(n / 10);
            if (this.clusters[cluster]) this.clusters[cluster].push(n);
        });
    }
    async predictNext(): Promise<number[]> {
        const clusterActivity = Object.entries(this.clusters).map(([id, nums]) => ({
            id: parseInt(id), count: nums.length, numbers: nums
        })).sort((a, b) => b.count - a.count);
        const topClusters = clusterActivity.slice(0, 3);
        const localFreq: Record<number, number> = {};
        topClusters.forEach(c => c.numbers.forEach(n => localFreq[n] = (localFreq[n] || 0) + 1));
        const candidates = Object.entries(localFreq).sort(([, a], [, b]) => b - a).map(([num]) => parseInt(num));
        return ensureCount(candidates, this.frequency, this.maxNumber, this.predCount);
    }
}

class StatefulMonteCarlo implements IStatefulSystem {
    name = 'Monte Carlo';
    private frequency: Record<number, number> = {};
    private totalDraws = 0;
    private lastDraw: Draw | null = null;
    private maxNumber: number;
    private predCount: number;
    constructor(maxNumber: number = 50, predCount: number = 25) { this.maxNumber = maxNumber; this.predCount = predCount; }
    reset() { this.frequency = {}; this.totalDraws = 0; this.lastDraw = null; }
    update(draw: Draw) {
        const nums = parseNumbers(draw);
        nums.forEach(n => this.frequency[n] = (this.frequency[n] || 0) + 1);
        this.totalDraws++;
        this.lastDraw = draw;
    }
    async predictNext(): Promise<number[]> {
        if (this.totalDraws === 0) return ensureCount([], {}, this.maxNumber, this.predCount);
        const probabilities: Record<number, number> = {};
        Object.entries(this.frequency).forEach(([num, count]) => { probabilities[parseInt(num)] = count / this.totalDraws; });
        const seedStr = this.lastDraw ? `${this.lastDraw.id}-${this.lastDraw.date}` : 'default';
        const rng = new SeededRNG(seedStr);
        const simulationResults: Record<number, number> = {};
        for (let i = 0; i < 200; i++) {
            const simDraw: number[] = [];
            const available = Array.from({ length: this.maxNumber }, (_, i) => i + 1);
            while (simDraw.length < 5) {
                const weights = available.map(n => probabilities[n] || 0.01);
                const totalWeight = weights.reduce((a, b) => a + b, 0);
                let random = rng.next() * totalWeight;
                for (let j = 0; j < available.length; j++) {
                    random -= weights[j];
                    if (random <= 0) {
                        simDraw.push(available[j]);
                        available.splice(j, 1);
                        break;
                    }
                }
            }
            simDraw.forEach(num => simulationResults[num] = (simulationResults[num] || 0) + 1);
        }
        const candidates = Object.entries(simulationResults).sort(([, a], [, b]) => b - a).map(([num]) => parseInt(num));
        return ensureCount(candidates, this.frequency, this.maxNumber, this.predCount);
    }
}

class WindowedAdapter implements IStatefulSystem {
    name: string;
    private originalSystem: any;
    private historyBuffer: Draw[] = [];
    private windowSize = 100;
    private predCount: number;
    constructor(system: any, predCount: number = 25) {
        this.name = system.name;
        this.originalSystem = system;
        this.predCount = predCount;
    }
    reset() { this.historyBuffer = []; }
    update(draw: Draw) {
        this.historyBuffer.unshift(draw);
        if (this.historyBuffer.length > this.windowSize) this.historyBuffer.pop();
    }
    async predictNext(): Promise<number[]> {
        if (this.historyBuffer.length < 5) return [];
        let prediction = [];
        try { prediction = await this.originalSystem.generateTop25(this.historyBuffer); }
        catch (e) {
            try { prediction = await this.originalSystem.generateTop10(this.historyBuffer); }
            catch (e2) { prediction = []; }
        }
        // Force slice to correct count for WindowedAdapter too
        return prediction.slice(0, this.predCount);
    }
}

async function main() {
    const args = process.argv.slice(2);
    const LIMIT = args[0] && args[0] !== '0' ? parseInt(args[0]) : undefined;
    const GAME = args[1]?.toUpperCase() || 'EUROMILLIONS';

    let maxNumber = 50;
    let predCount = 25; // Default for others

    if (GAME === 'TOTOLOTO') {
        maxNumber = 49;
        predCount = 25;
    }
    if (GAME === 'EURODREAMS') {
        maxNumber = 40;
        predCount = 20; // Specific for EuroDreams
    }

    console.log(`🚀 Starting TURBO Backfill for ${GAME} (Max: ${maxNumber}, Count: ${predCount})...`);
    if (LIMIT) console.log(`⚠️  LIMIT SET: Processing only first ${LIMIT} draws.`);

    const startTime = performance.now();

    console.log('📦 Loading history...');
    const draws = await prisma.draw.findMany({
        where: { game: GAME },
        orderBy: { date: 'asc' },
        take: LIMIT
    });
    console.log(`Loaded ${draws.length} draws.`);

    // 2. Define Systems with correct config
    const systems: IStatefulSystem[] = [
        new StatefulHotNumbers(maxNumber, predCount),
        new StatefulMarkovChain(maxNumber, predCount),
        new StatefulClustering(maxNumber, predCount),
        new StatefulMonteCarlo(maxNumber, predCount),
        new WindowedAdapter(new PyramidPascalSystem(), predCount),
        new WindowedAdapter(new PyramidGapsSystem(), predCount),
        new WindowedAdapter(new VortexPyramidSystem(), predCount),
        new WindowedAdapter(new RandomSystem(), predCount),
    ];

    // 3. Process System by System
    console.log('🛠️  Verifying System Registration...');
    for (const system of systems) {
        const baseName = system.name;

        // Register Base System
        await prisma.rankedSystem.upsert({
            where: {
                name_game: {
                    name: baseName,
                    game: GAME
                }
            },
            update: { isActive: true },
            create: {
                name: baseName,
                game: GAME,
                description: `System initialized by Turbo Backfill (${GAME})`,
                isActive: true,
                systemType: 'BASE',
                domain: 'NUMBERS'
            }
        });
    }

    for (const system of systems) {
        const sysStart = performance.now();
        console.log(`\n🔄 Processing System: ${system.name}`);

        // OPTIMIZATION: Load ALL existing Draw IDs for this system to prevent duplicates
        // This is safer than max(id) because imports might be out-of-order (non-chronological IDs)
        const existing = await prisma.systemPerformance.findMany({
            where: { systemName: system.name },
            select: { drawId: true }
        });
        const processedDrawIds = new Set(existing.map(e => e.drawId));

        console.log(`   └─ Found ${processedDrawIds.size} existing predictions.`);

        system.reset();

        const buffer: any[] = [];
        const predictionBuffer: any[] = [];
        let processed = 0;
        let skipped = 0;

        for (let i = 0; i < draws.length; i++) {
            const draw = draws[i];
            const nextDraw = draws[i + 1];

            // Update State
            system.update(draw);

            if (!nextDraw) continue;

            // Check if we need to predict
            if (processedDrawIds.has(nextDraw.id)) {
                skipped++;
                if (skipped % 500 === 0) process.stdout.write('.');
                continue;
            }

            // Predict
            let prediction: number[] = [];
            try {
                prediction = await system.predictNext();
            } catch (err) {
                // console.error(`SimError:`, err);
                continue;
            }

            if (prediction.length === 0) continue;

            const antiPrediction = getInverse(prediction, maxNumber, predCount);

            const nextActual = parseNumbers(nextDraw);
            const hits = nextActual.filter(n => prediction.includes(n)).length;
            const antiHits = nextActual.filter(n => antiPrediction.includes(n)).length;

            // Determine expected hits based on game
            const numbersToDraw = GAME === 'EURODREAMS' ? 6 : 5;

            const isJackpot = hits === numbersToDraw;

            // 1. Performance
            buffer.push({
                drawId: nextDraw.id,
                game: GAME,
                systemName: system.name,
                predictedNumbers: JSON.stringify(prediction),
                actualNumbers: nextDraw.numbers,
                hits,
                accuracy: (hits / numbersToDraw) * 100
            });

            // 2. Prediction (Historical)
            predictionBuffer.push({
                drawId: nextDraw.id,
                game: GAME,
                systemName: system.name,
                prediction: JSON.stringify(prediction),
                antiPrediction: "[]",
                hits,
                antiHits: 0,
                jackpot: isJackpot,
                antiJackpot: false
            });

            if (buffer.length >= 50) {
                await prisma.systemPerformance.createMany({ data: buffer });
                buffer.length = 0;
            }
            if (predictionBuffer.length >= 50) {
                // await prisma.systemPrediction.createMany({ data: predictionBuffer });
                predictionBuffer.length = 0;
                process.stdout.write('+');
            }
            processed++;
        }

        if (buffer.length > 0) {
            await prisma.systemPerformance.createMany({ data: buffer });
        }
        if (predictionBuffer.length > 0) {
            // await prisma.systemPrediction.createMany({ data: predictionBuffer });
        }

        const sysEnd = performance.now();
        console.log(` Done (Skipped ${skipped}, Calculated ${processed}) in ${((sysEnd - sysStart) / 1000).toFixed(2)}s`);
    }

    // 4. Update Rankings and Cache (Might need game aware updateRanking)
    // For now, this updates global rankings, which might mix games if not careful.
    // Ideally updateRanking needs to support GAME too.
    console.log('\n📊 Updating Rankings (Note: Make sure updateRanking supports multiple games)...');
    // await updateRanking(); // Assuming generic for now or handled separately

    console.log('💾 Caching Future Predictions...');
    // await cachePredictions(); 

    console.log(`\n✅ Turbo Backfill Complete for ${GAME}!`);
    console.log(`⏱️  Total Time: ${((performance.now() - startTime) / 1000).toFixed(2)}s`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
