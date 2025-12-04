import { prisma } from '@/lib/prisma';
import { Draw } from '@prisma/client';
import { getSystemByName, IPredictiveSystem } from './ranked-systems';
import { SeededRNG } from '../utils/seeded-rng';

// --- Interfaces (Mirrored from turbo-backfill for consistency) ---

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

// --- Adapter for Stateless Systems ---

class WindowedAdapter implements IStatefulSystem {
    name: string;
    private originalSystem: IPredictiveSystem;
    private historyBuffer: Draw[] = [];
    private windowSize = 100;

    constructor(system: IPredictiveSystem) {
        this.name = system.name;
        this.originalSystem = system;
    }

    reset() {
        this.historyBuffer = [];
    }

    update(draw: Draw) {
        this.historyBuffer.unshift(draw);
        if (this.historyBuffer.length > this.windowSize) {
            this.historyBuffer.pop();
        }
    }

    async predictNext(): Promise<number[]> {
        if (this.historyBuffer.length < 5) return [];
        try {
            return await this.originalSystem.generateTop10(this.historyBuffer);
        } catch (e) {
            console.error(`Error in system ${this.name}:`, e);
            return [];
        }
    }
}

// --- Main Service Functions ---

export async function runStagingBackfill(systemName: string, limit?: number) {
    console.log(`🚀 Starting Staging Backfill for ${systemName}...`);

    // 1. Get System
    const baseSystem = getSystemByName(systemName);
    if (!baseSystem) {
        throw new Error(`System ${systemName} not found.`);
    }

    // 2. Wrap in Adapter (assuming all systems in ranked-systems are stateless/windowed compatible)
    // Note: If we had stateful systems directly exported, we'd need a check here.
    // For now, we assume everything from getSystemByName is IPredictiveSystem (stateless).
    const system = new WindowedAdapter(baseSystem);

    // 3. Load Draws
    const draws = await prisma.draw.findMany({
        orderBy: { date: 'asc' },
        take: limit
    });
    console.log(`Loaded ${draws.length} draws.`);

    // 4. Ensure System Exists in RankedSystem (Required for Foreign Key)
    await prisma.rankedSystem.upsert({
        where: { name: system.name },
        update: {},
        create: {
            name: system.name,
            description: 'Staging System',
            isActive: true
        }
    });

    await prisma.rankedSystem.upsert({
        where: { name: `Anti-${system.name}` },
        update: {},
        create: {
            name: `Anti-${system.name}`,
            description: `Anti-${system.name} (Staging)`,
            isActive: true
        }
    });

    // 5. Cleanup Staging for this system
    await prisma.systemPerformanceStaging.deleteMany({
        where: {
            systemName: { in: [system.name, `Anti-${system.name}`] }
        }
    });

    // 5. Run Backfill
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
            actualNumbers: draw.numbers, // Keep original string/json format
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
            await prisma.systemPerformanceStaging.createMany({ data: buffer });
            buffer.length = 0;
        }
        processed++;
    }

    if (buffer.length > 0) {
        await prisma.systemPerformanceStaging.createMany({ data: buffer });
    }

    console.log(`✅ Staging Backfill Complete for ${systemName} (${processed} draws).`);
    return { processed, systemName };
}

export async function commitStagingToProduction(systemName: string) {
    console.log(`💾 Committing ${systemName} from Staging to Production...`);

    // 1. Get Staging Data
    const stagingData = await prisma.systemPerformanceStaging.findMany({
        where: { systemName: { in: [systemName, `Anti-${systemName}`] } }
    });

    if (stagingData.length === 0) {
        throw new Error(`No staging data found for ${systemName}`);
    }

    // 2. Delete existing Production Data for this system (to avoid duplicates/conflicts)
    // OR we could upsert. Deleting is safer for a full replace.
    await prisma.systemPerformance.deleteMany({
        where: { systemName: { in: [systemName, `Anti-${systemName}`] } }
    });

    // 3. Insert into Production
    // We need to map the data because IDs are auto-increment and shouldn't be copied
    const productionData = stagingData.map(item => ({
        drawId: item.drawId,
        systemName: item.systemName,
        predictedNumbers: item.predictedNumbers,
        actualNumbers: item.actualNumbers,
        hits: item.hits,
        accuracy: item.accuracy,
        createdAt: item.createdAt
    }));

    // Batch insert
    const batchSize = 1000;
    for (let i = 0; i < productionData.length; i += batchSize) {
        const batch = productionData.slice(i, i + batchSize);
        await prisma.systemPerformance.createMany({ data: batch });
    }

    // 4. Register System in RankedSystem if not exists
    await prisma.rankedSystem.upsert({
        where: { name: systemName },
        update: { isActive: true },
        create: {
            name: systemName,
            description: 'Committed from Staging',
            isActive: true
        }
    });

    await prisma.rankedSystem.upsert({
        where: { name: `Anti-${systemName}` },
        update: { isActive: true },
        create: {
            name: `Anti-${systemName}`,
            description: `Anti-${systemName} (Committed from Staging)`,
            isActive: true
        }
    });

    // 5. Clear Staging
    await prisma.systemPerformanceStaging.deleteMany({
        where: { systemName: { in: [systemName, `Anti-${systemName}`] } }
    });

    console.log(`✅ Commit Complete for ${systemName}.`);
}

export async function clearStaging(systemName: string) {
    await prisma.systemPerformanceStaging.deleteMany({
        where: { systemName: { in: [systemName, `Anti-${systemName}`] } }
    });
}
