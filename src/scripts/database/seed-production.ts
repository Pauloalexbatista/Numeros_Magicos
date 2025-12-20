
import { prisma } from '../../lib/prisma';
import fs from 'fs';
import path from 'path';

/**
 * SEED PRODUCTION DATABASE (Complete v3)
 * 
 * Imports all data from JSON files into production PostgreSQL.
 */

async function importTable(tableName: string, modelName: string, batchSize = 1000) {
    const filePath = path.join(process.cwd(), 'prisma', 'seeds', `${tableName}.json`);

    if (!fs.existsSync(filePath)) {
        console.warn(`⚠️ File not found: ${filePath}`);
        return;
    }

    console.log(`📦 Importing ${tableName} to ${modelName}...`);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    if (data.length === 0) {
        console.log(`   ℹ️ Table is empty, skipping.`);
        return;
    }

    // Batch insert
    for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);

        try {
            // @ts-ignore - Dynamic model access
            await prisma[modelName].createMany({
                data: batch
            });
            process.stdout.write(`.`);
        } catch (e: any) {
            console.error(`\n❌ Batch error:`, e.message);
        }
    }
    console.log(`\n✅ Imported ${data.length} records.`);
}

async function main() {
    const isQuick = process.argv.includes('--quick');
    console.log(`🚀 Starting Production Database Seed - ${isQuick ? 'QUICK' : 'COMPLETE'} SYNC...`);

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
        await importTable(table.name, table.model);
    }

    console.log('\n🎉 Seeding complete!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
