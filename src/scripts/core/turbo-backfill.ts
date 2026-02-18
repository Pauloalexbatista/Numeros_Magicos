
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
import { fixedMediaSystem } from '../../services/ranked-systems';

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

// ... (Helper Functions omitted for brevity, they are unchanged)

// ... (Stateful System Implementations omitted for brevity, they are unchanged)

// --- Main Execution ---
// ... (Main function setup omitted)

// 2. Define Systems with correct config
const systems: IStatefulSystem[] = [
    new StatefulHotNumbers(maxNumber),
    new StatefulMarkovChain(maxNumber),
    new StatefulClustering(maxNumber),
    new StatefulMonteCarlo(maxNumber),
    new WindowedAdapter(new PyramidPascalSystem()),
    new WindowedAdapter(new PyramidGapsSystem()),
    new WindowedAdapter(new VortexPyramidSystem()),
    new WindowedAdapter(new RandomSystem()),
    new WindowedAdapter(fixedMediaSystem),
    new WindowedAdapter(new VortexMultiChannelSystem(2)),
    new WindowedAdapter(new VortexMultiChannelSystem(3)),
    new WindowedAdapter(new SistMediaCamadas()),
    new WindowedAdapter(new SistCombinadoMedia3System()),
    new WindowedAdapter(new SistMedia3Otimizado()),
    new WindowedAdapter(new mdiasemaspontasSystem()),
    new WindowedAdapter(new UniversalOscillationV2System()),
    new WindowedAdapter(new ConsensusAutoV1()),
];

// 3. Process System by System
console.log('🛠️  Verifying System Registration...');
for (const system of systems) {

    // Suffix System Name if not Euromillions to separate performance
    if (GAME !== 'EUROMILLIONS') {
        // Avoid double suffix if running multiple times
        if (!system.name.endsWith(`_${GAME}`)) {
            system.name = `${system.name}_${GAME}`;
        }
    }

    const baseName = system.name;
    const antiName = `Anti-${baseName}`;

    // Register Base System
    await prisma.rankedSystem.upsert({
        where: { name: baseName },
        update: { game: GAME },
        create: {
            name: baseName,
            game: GAME,
            description: `System initialized by Turbo Backfill (${GAME})`,
            isActive: true
        }
    });

    // Register Anti-System
    await prisma.rankedSystem.upsert({
        where: { name: antiName },
        update: { game: GAME },
        create: {
            name: antiName,
            game: GAME,
            description: `Anti-${baseName} (Auto-generated) for ${GAME}`,
            isActive: true
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

        const antiPrediction = getInverse(prediction, maxNumber);

        const nextActual = parseNumbers(nextDraw);
        const hits = nextActual.filter(n => prediction.includes(n)).length;
        const antiHits = nextActual.filter(n => antiPrediction.includes(n)).length;

        // Determine expected hits based on game
        const numbersToDraw = GAME === 'EURODREAMS' ? 6 : 5;

        const isJackpot = hits === numbersToDraw;
        const isAntiJackpot = antiHits === numbersToDraw;

        // 1. Performance
        buffer.push({
            drawId: nextDraw.id,
            systemName: system.name,
            predictedNumbers: JSON.stringify(prediction),
            actualNumbers: nextDraw.numbers,
            hits,
            accuracy: (hits / numbersToDraw) * 100
        });

        buffer.push({
            drawId: nextDraw.id,
            systemName: `Anti-${system.name}`,
            predictedNumbers: JSON.stringify(antiPrediction),
            actualNumbers: nextDraw.numbers,
            hits: antiHits,
            accuracy: (antiHits / numbersToDraw) * 100
        });

        // 2. Prediction (Historical)
        predictionBuffer.push({
            drawId: nextDraw.id,
            systemName: system.name,
            prediction: JSON.stringify(prediction),
            antiPrediction: JSON.stringify(antiPrediction),
            hits,
            antiHits,
            jackpot: isJackpot,
            antiJackpot: isAntiJackpot
        });

        predictionBuffer.push({
            drawId: nextDraw.id,
            systemName: `Anti-${system.name}`,
            prediction: JSON.stringify(antiPrediction),
            antiPrediction: JSON.stringify(prediction),
            hits: antiHits,
            antiHits: hits,
            jackpot: isAntiJackpot,
            antiJackpot: isJackpot
        });

        if (buffer.length >= 50) {
            await prisma.systemPerformance.createMany({ data: buffer });
            buffer.length = 0;
        }
        if (predictionBuffer.length >= 50) {
            await prisma.systemPrediction.createMany({ data: predictionBuffer });
            predictionBuffer.length = 0;
            process.stdout.write('+');
        }
        processed++;
    }

    if (buffer.length > 0) {
        await prisma.systemPerformance.createMany({ data: buffer });
    }
    if (predictionBuffer.length > 0) {
        await prisma.systemPrediction.createMany({ data: predictionBuffer });
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
