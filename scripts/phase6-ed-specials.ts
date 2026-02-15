/**
 * Phase 6: EuroDreams SPECIAL NUMBER Systems (Número dos Sonhos)
 * 
 * Recalculates historical predictions for 12 SPECIAL NUMBER systems
 * - 236 draws × 12 systems = ~2,832 predictions
 * - Each prediction: 3 special numbers
 * 
 * Run with: npx tsx scripts/phase6-ed-specials.ts
 */

import { PrismaClient } from '@prisma/client';
import { starBaseSystems } from '../src/services/star-systems';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 PHASE 6: EuroDreams SPECIAL NUMBER Systems\n');
    console.log(`⭐ Processing ${starBaseSystems.length} systems\n`);

    const draws = await prisma.draw.findMany({
        where: { game: 'EURODREAMS' },
        orderBy: { date: 'desc' }
    });

    console.log(`📊 Found ${draws.length} EuroDreams draws\n`);

    let totalPredictions = 0;
    const startTime = Date.now();

    for (let sysIndex = 0; sysIndex < starBaseSystems.length; sysIndex++) {
        const system = starBaseSystems[sysIndex];
        console.log(`\n[${sysIndex + 1}/${starBaseSystems.length}] Processing ${system.name}...`);

        let systemPredictions = 0;

        for (let i = 0; i < draws.length; i++) {
            const currentDraw = draws[i];
            const history = draws.slice(i + 1);

            if (history.length < 10) continue;

            try {
                const prediction = await system.generatePrediction(history);

                await prisma.systemPrediction.create({
                    data: {
                        systemName: system.name,
                        drawId: currentDraw.id,
                        prediction: JSON.stringify(prediction),
                        antiPrediction: '[]',
                        hits: 0,
                        antiHits: 0
                    }
                });

                systemPredictions++;
                totalPredictions++;

                if (systemPredictions % 50 === 0) {
                    process.stdout.write(`\r  Progress: ${systemPredictions}/${draws.length} draws`);
                }
            } catch (error) {
                console.error(`\n  ❌ Error at draw ${currentDraw.id}:`, error instanceof Error ? error.message : 'Unknown');
            }
        }

        console.log(`\r  ✅ Complete: ${systemPredictions} predictions`);
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000 / 60).toFixed(2);

    console.log(`\n${'='.repeat(60)}`);
    console.log('✅ PHASE 6 COMPLETED!');
    console.log('='.repeat(60));
    console.log(`📊 Total predictions: ${totalPredictions}`);
    console.log(`⏱️  Duration: ${duration} minutes\n`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
