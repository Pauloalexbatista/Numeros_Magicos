import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

/**
 * EXPORT LOCAL DATABASE TO JSON
 * 
 * Exports all data from local SQLite database to JSON files
 * for syncing to production PostgreSQL.
 */

const prisma = new PrismaClient();

async function exportToJSON() {
    console.log('📦 ========================================');
    console.log('   EXPORT LOCAL DATABASE TO JSON');
    console.log('========================================\n');

    const exportDir = path.join(process.cwd(), 'prisma', 'seeds');

    // Create export directory if it doesn't exist
    if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
    }

    try {
        // 1. Export Draws
        console.log('📥 Exporting Draws...');
        const draws = await prisma.draw.findMany({
            orderBy: { date: 'asc' }
        });
        fs.writeFileSync(
            path.join(exportDir, 'draws.json'),
            JSON.stringify(draws, null, 2)
        );
        console.log(`   ✅ Exported ${draws.length} draws`);

        // 2. Export Ranked Systems
        console.log('📥 Exporting Ranked Systems...');
        const rankedSystems = await prisma.rankedSystem.findMany();
        fs.writeFileSync(
            path.join(exportDir, 'ranked_systems.json'),
            JSON.stringify(rankedSystems, null, 2)
        );
        console.log(`   ✅ Exported ${rankedSystems.length} ranked systems`);

        // 3. Export System Rankings
        console.log('📥 Exporting System Rankings...');
        const systemRankings = await prisma.systemRanking.findMany();
        fs.writeFileSync(
            path.join(exportDir, 'system_rankings.json'),
            JSON.stringify(systemRankings, null, 2)
        );
        console.log(`   ✅ Exported ${systemRankings.length} system rankings`);

        // 4. Export System Performance
        console.log('📥 Exporting System Performance...');
        const systemPerformance = await prisma.systemPerformance.findMany({
            orderBy: [{ drawId: 'asc' }, { systemName: 'asc' }]
        });
        fs.writeFileSync(
            path.join(exportDir, 'system_performances.json'),
            JSON.stringify(systemPerformance, null, 2)
        );
        console.log(`   ✅ Exported ${systemPerformance.length} performance records`);

        // 5. Export System Predictions
        console.log('📥 Exporting System Predictions...');
        const systemPredictions = await prisma.systemPrediction.findMany({
            orderBy: [{ drawId: 'asc' }, { systemName: 'asc' }]
        });
        fs.writeFileSync(
            path.join(exportDir, 'system_predictions.json'),
            JSON.stringify(systemPredictions, null, 2)
        );
        console.log(`   ✅ Exported ${systemPredictions.length} predictions`);

        // 6. Export Star System Rankings
        console.log('📥 Exporting Star System Rankings...');
        const starRankings = await prisma.starSystemRanking.findMany();
        fs.writeFileSync(
            path.join(exportDir, 'star_system_ranking.json'),
            JSON.stringify(starRankings, null, 2)
        );
        console.log(`   ✅ Exported ${starRankings.length} star rankings`);

        // 7. Export Star System Performance
        console.log('📥 Exporting Star System Performance...');
        const starPerformance = await prisma.starSystemPerformance.findMany({
            orderBy: [{ drawId: 'asc' }, { systemName: 'asc' }]
        });
        fs.writeFileSync(
            path.join(exportDir, 'star_system_performance.json'),
            JSON.stringify(starPerformance, null, 2)
        );
        console.log(`   ✅ Exported ${starPerformance.length} star performance records`);

        console.log('\n========================================');
        console.log('✅ EXPORT COMPLETE!');
        console.log('========================================\n');
        console.log(`Files saved to: ${exportDir}\n`);

    } catch (error) {
        console.error('\n❌ Error exporting data:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

exportToJSON();
