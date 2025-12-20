import { prisma } from '../../lib/prisma';
import fs from 'fs';
import path from 'path';

/**
 * EXPORT LOCAL DATABASE TO JSON (Complete v3)
 * 
 * Exports all critical data from local SQLite database to JSON files
 * for syncing to production PostgreSQL.
 */

// Use shared prisma client

async function exportToJSON() {
    console.log('📦 ========================================');
    const isQuick = process.argv.includes('--quick');
    console.log(`   EXPORT LOCAL DATABASE TO JSON - ${isQuick ? 'QUICK' : 'COMPLETE'}`);
    console.log('========================================\n');

    const exportDir = path.join(process.cwd(), 'prisma', 'seeds');

    // Create export directory if it doesn't exist
    if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
    }

    try {
        let tables = [
            { name: 'draws', model: 'draw' },
            { name: 'ranked_systems', model: 'rankedSystem' },
            { name: 'system_rankings', model: 'systemRanking' },
            { name: 'system_performances', model: 'systemPerformance' },
            { name: 'star_system_ranking', model: 'starSystemRanking' },
            { name: 'star_system_performance', model: 'starSystemPerformance' },
            { name: 'cached_predictions', model: 'cachedPrediction' }
        ];

        if (!isQuick) {
            tables = [
                ...tables,
                { name: 'system_predictions', model: 'systemPrediction' },
                { name: 'exclusion_cache', model: 'exclusionCache' },
                { name: 'ml_model_training', model: 'mLModelTraining' },
                { name: 'statistics_cache', model: 'statisticsCache' }
            ];
        }

        for (const table of tables) {
            console.log(`📥 Exporting ${table.name}...`);
            // @ts-ignore
            const data = await prisma[table.model].findMany();
            fs.writeFileSync(
                path.join(exportDir, `${table.name}.json`),
                JSON.stringify(data, null, 2)
            );
            console.log(`   ✅ Exported ${data.length} records`);
        }

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
