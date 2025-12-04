
import { prisma } from '../lib/prisma';
import { Draw } from '@prisma/client';
import { SeededRNG } from '../utils/seeded-rng';
import { updateRanking, cachePredictions, initializeSystems } from '../services/ranking';

// Import Original Systems
import { PyramidPascalSystem } from '../services/pyramid-pascal';
import { PyramidGapsSystem } from '../services/pyramid-gaps';
import { VortexPyramidSystem } from '../services/vortex-pyramid';
import { RandomSystem } from '../services/random-system';
import { RandomForestModel } from '../models/implementations/RandomForestModel';
import { PatternBasedModel } from '../models/implementations/PatternBasedModel';
import { MLClassifierModel } from '../models/implementations/MLClassifierModel';
import { StandardDeviationModel } from '../models/implementations/StandardDeviationModel';
import { RootSumModel } from '../models/implementations/RootSumModel';
import { ElasticModel } from '../models/implementations/ElasticModel';
import { PredictionModelAdapter, fixedMediaSystem } from '../services/ranked-systems';

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

function ensure25(numbers: number[], fallbackFrequency: Record<number, number>): number[] {
    let result = [...new Set(numbers)];

    // Fill with most frequent numbers if needed
    if (result.length < 25) {
        const sortedFreq = Object.entries(fallbackFrequency)
            .sort(([, a], [, b]) => b - a)
            .map(([num]) => parseInt(num));

        for (const num of sortedFreq) {
            if (result.length >= 25) break;
            if (!result.includes(num)) result.push(num);
        }

        // Fallback to 1..50
        for (let i = 1; i <= 50; i++) {
            if (result.length >= 25) break;
            if (!result.includes(i)) result.push(i);
        }
    }

    return result.slice(0, 25);
}

function getInverse(numbers: number[]): number[] {
    const all = Array.from({ length: 50 }, (_, i) => i + 1);
    return all.filter(n => !numbers.includes(n)).slice(0, 25);
}

// --- System Implementations ---

class StatefulHotNumbers implements IStatefulSystem {
    name = 'Hot Numbers';
    private frequency: Record<number, number> = {};

    reset() {
        this.frequency = {};
    }

    update(draw: Draw) {
        const nums = parseNumbers(draw);
        nums.forEach(n => {
            this.frequency[n] = (this.frequency[n] || 0) + 1;
        });
    }

    async predictNext(): Promise<number[]> {
        const candidates = Object.entries(this.frequency)
            .sort(([, a], [, b]) => b - a)
            .map(([num]) => parseInt(num));
        return ensure25(candidates, this.frequency);
    }
}

class StatefulMarkovChain implements IStatefulSystem {
    name = 'Markov Chain';
    private transitions: Record<number, Record<number, number>> = {};
    private lastDrawNumbers: number[] = [];
    private frequency: Record<number, number> = {};

    reset() {
        this.transitions = {};
        this.lastDrawNumbers = [];
        this.frequency = {};
    }

    update(draw: Draw) {
        const nums = parseNumbers(draw);
        nums.forEach(n => this.frequency[n] = (this.frequency[n] || 0) + 1);

        nums.forEach(n1 => {
            if (!this.transitions[n1]) this.transitions[n1] = {};
            nums.forEach(n2 => {
                if (n1 !== n2) {
                    this.transitions[n1][n2] = (this.transitions[n1][n2] || 0) + 1;
                }
            });
        });

        this.lastDrawNumbers = nums;
    }

    async predictNext(): Promise<number[]> {
        if (this.lastDrawNumbers.length === 0) return ensure25([], this.frequency);

        const scores: Record<number, number> = {};
        this.lastDrawNumbers.forEach(prevNum => {
            if (this.transitions[prevNum]) {
                Object.entries(this.transitions[prevNum]).forEach(([nextNum, count]) => {
                    const n = parseInt(nextNum);
                    scores[n] = (scores[n] || 0) + count;
                });
            }
        });

        const candidates = Object.entries(scores)
            .sort(([, a], [, b]) => b - a)
            .map(([num]) => parseInt(num));

        return ensure25(candidates, this.frequency);
    }
}

class StatefulClustering implements IStatefulSystem {
    name = 'Clustering';
    private clusters: Record<number, number[]> = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    private frequency: Record<number, number> = {};

    reset() {
        this.clusters = { 1: [], 2: [], 3: [], 4: [], 5: [] };
        this.frequency = {};
    }

    update(draw: Draw) {
        const nums = parseNumbers(draw);
        nums.forEach(n => {
            this.frequency[n] = (this.frequency[n] || 0) + 1;
            const cluster = Math.ceil(n / 10);
            if (this.clusters[cluster]) {
                this.clusters[cluster].push(n);
            }
        });
    }

    async predictNext(): Promise<number[]> {
        const clusterActivity = Object.entries(this.clusters).map(([id, nums]) => ({
            id: parseInt(id),
            count: nums.length,
            numbers: nums
        })).sort((a, b) => b.count - a.count);

        const topClusters = clusterActivity.slice(0, 3);
        const localFreq: Record<number, number> = {};

        topClusters.forEach(c => {
            c.numbers.forEach(n => localFreq[n] = (localFreq[n] || 0) + 1);
        });

        const candidates = Object.entries(localFreq)
            .sort(([, a], [, b]) => b - a)
            .map(([num]) => parseInt(num));

        return ensure25(candidates, this.frequency);
    }
}

class StatefulMonteCarlo implements IStatefulSystem {
    name = 'Monte Carlo';
    private frequency: Record<number, number> = {};
    private totalDraws = 0;
    private lastDraw: Draw | null = null;

    reset() {
        this.frequency = {};
        this.totalDraws = 0;
        this.lastDraw = null;
    }

    update(draw: Draw) {
        const nums = parseNumbers(draw);
        nums.forEach(n => this.frequency[n] = (this.frequency[n] || 0) + 1);
        this.totalDraws++;
        this.lastDraw = draw;
    }

    async predictNext(): Promise<number[]> {
        if (this.totalDraws === 0) return ensure25([], {});

        const probabilities: Record<number, number> = {};
        Object.entries(this.frequency).forEach(([num, count]) => {
            probabilities[parseInt(num)] = count / this.totalDraws;
        });

        const seedStr = this.lastDraw ? `${this.lastDraw.id}-${this.lastDraw.date}` : 'default';
        const rng = new SeededRNG(seedStr);

        const simulationResults: Record<number, number> = {};
        const simulations = 200; // Fast simulation

        for (let i = 0; i < simulations; i++) {
            const simDraw: number[] = [];
            const available = Array.from({ length: 50 }, (_, i) => i + 1);

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

        const candidates = Object.entries(simulationResults)
            .sort(([, a], [, b]) => b - a)
            .map(([num]) => parseInt(num));

        return ensure25(candidates, this.frequency);
    }
}

class WindowedAdapter implements IStatefulSystem {
    name: string;
    private originalSystem: any;
    private historyBuffer: Draw[] = [];
    private windowSize = 100;

    constructor(system: any) {
        this.name = system.name;
        this.originalSystem = system;
    }

    reset() {
        this.historyBuffer = [];
    }

    update(draw: Draw) {
        // Add new draw to start (newest first) because systems expect desc order
        this.historyBuffer.unshift(draw);
        if (this.historyBuffer.length > this.windowSize) {
            this.historyBuffer.pop();
        }
    }

    async predictNext(): Promise<number[]> {
        if (this.historyBuffer.length < 5) return [];

        try {
            const result = await this.originalSystem.generateTop10(this.historyBuffer);
            return result;
        } catch (e) {
            return [];
        }
    }
}

// --- Main Execution ---

async function main() {
    const args = process.argv.slice(2);
    const LIMIT = args[0] ? parseInt(args[0]) : undefined;

    console.log(`🚀 Starting TURBO Backfill (All Systems)...`);
    if (LIMIT) console.log(`⚠️  LIMIT SET: Processing only first ${LIMIT} draws.`);

    const startTime = performance.now();

    // 1. Load Draws (Oldest First)
    console.log('📦 Loading history...');
    const draws = await prisma.draw.findMany({
        orderBy: { date: 'asc' },
        take: LIMIT
    });
    console.log(`Loaded ${draws.length} draws.`);

    // 1.5 Initialize Systems in DB (Ensure they exist for FK)
    console.log('🛠️  Initializing Systems in DB...');
    await initializeSystems();

    // 2. Define Systems
    const systems: IStatefulSystem[] = [
        new StatefulHotNumbers(),
        new StatefulMarkovChain(),
        new StatefulClustering(),
        new StatefulMonteCarlo(),
        new WindowedAdapter(new PyramidPascalSystem()),
        new WindowedAdapter(new PyramidGapsSystem()),
        new WindowedAdapter(new VortexPyramidSystem()),
        new WindowedAdapter(new RandomForestModel()),
        new WindowedAdapter(new RandomSystem()),
        new WindowedAdapter(new PredictionModelAdapter(new PatternBasedModel())),
        new WindowedAdapter(new PredictionModelAdapter(new MLClassifierModel())),
        new WindowedAdapter(new StandardDeviationModel()),
        new WindowedAdapter(new RootSumModel()),
        new WindowedAdapter(new ElasticModel()),
        new WindowedAdapter(fixedMediaSystem),
    ];

    // 3. Process System by System
    console.log('🛠️  Verifying System Registration...');
    for (const system of systems) {
        // Register Base System
        await prisma.rankedSystem.upsert({
            where: { name: system.name },
            update: {},
            create: {
                name: system.name,
                description: 'System initialized by Turbo Backfill',
                isActive: true
            }
        });

        // Register Anti-System (Turbo Backfill always generates Anti-versions)
        await prisma.rankedSystem.upsert({
            where: { name: `Anti-${system.name}` },
            update: {},
            create: {
                name: `Anti-${system.name}`,
                description: `Anti-${system.name} (Auto-generated)`,
                isActive: true
            }
        });
    }

    for (const system of systems) {
        const sysStart = performance.now();
        console.log(`\n🔄 Processing System: ${system.name}`);

        // CLEANUP
        await prisma.systemPerformance.deleteMany({
            where: {
                systemName: { in: [system.name, `Anti-${system.name}`] },
                drawId: { in: draws.map(d => d.id) }
            }
        });

        system.reset();

        const buffer: any[] = [];
        let processed = 0;

        for (const draw of draws) {
            const prediction = await system.predictNext();

            if (prediction.length === 0) {
                system.update(draw);
                continue;
            }

            const antiPrediction = getInverse(prediction);
            const actual = parseNumbers(draw);
            const hits = actual.filter(n => prediction.includes(n)).length;
            const antiHits = actual.filter(n => antiPrediction.includes(n)).length;

            buffer.push({
                drawId: draw.id,
                systemName: system.name,
                predictedNumbers: JSON.stringify(prediction),
                actualNumbers: draw.numbers,
                hits,
                accuracy: (hits / 5) * 100
            });

            buffer.push({
                drawId: draw.id,
                systemName: `Anti-${system.name}`,
                predictedNumbers: JSON.stringify(antiPrediction),
                actualNumbers: draw.numbers,
                hits: antiHits,
                accuracy: (antiHits / 5) * 100
            });

            system.update(draw);

            if (buffer.length >= 1000) {
                await prisma.systemPerformance.createMany({ data: buffer });
                buffer.length = 0;
                process.stdout.write('.');
            }
            processed++;
        }

        if (buffer.length > 0) {
            await prisma.systemPerformance.createMany({ data: buffer });
        }

        const sysEnd = performance.now();
        console.log(` Done (${processed} draws) in ${((sysEnd - sysStart) / 1000).toFixed(2)}s`);
    }

    // 4. Update Rankings and Cache
    console.log('\n📊 Updating Rankings (TOP)...');
    await updateRanking();

    console.log('💾 Caching Future Predictions...');
    await cachePredictions();

    const endTime = performance.now();
    console.log(`\n✅ Turbo Backfill Complete!`);
    console.log(`⏱️  Total Time: ${((endTime - startTime) / 1000).toFixed(2)}s`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
