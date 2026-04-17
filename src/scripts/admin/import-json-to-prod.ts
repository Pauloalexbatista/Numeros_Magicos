
import { prismaProd } from '../../lib/prisma-prod';
import fs from 'fs';
import path from 'path';

/**
 * IMPORT JSON TO PRODUCTION (Full Sync)
 * 
 * Imports all data from JSON files (exported from Local) into Production PostgreSQL.
 * Uses prismaProd client.
 */

async function importTable(tableName: string, modelName: string, batchSize = 1000) {
    const filePath = path.join(process.cwd(), 'prisma', 'seeds', `${tableName}.json`);

    if (!fs.existsSync(filePath)) {
        console.warn(`⚠️ File not found: ${filePath}`);
        return;
    }

    console.log(`📦 Importing ${tableName} to ${modelName}...`);

    // Read and parse JSON
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);

    if (data.length === 0) {
        console.log(`   ℹ️ Table is empty, skipping.`);
        return;
    }

    // Batch insert
    let totalImported = 0;
    const prisma = prismaProd as any;

    // Define columns that need Date conversion
    const dateFields = ['createdAt', 'updatedAt', 'lastTrained', 'lastUpdated', 'date', 'calculatedAt'];

    for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize).map((item: any) => {
            const newItem = { ...item };
            // Convert any present date fields to Date objects
            for (const field of dateFields) {
                if (newItem[field]) {
                    newItem[field] = new Date(newItem[field]);
                }
            }
            return newItem;
        });

        try {
            await prisma[modelName].createMany({
                data: batch
            });
            totalImported += batch.length;
            process.stdout.write(`.`);
        } catch (e: any) {
            console.error(`\n❌ Batch error (${i}-${i + batchSize}):`, e.message);
        }
    }
    console.log(`\n✅ Imported ${totalImported} / ${data.length} records.`);
}

async function startImport() {
    const isQuick = process.argv.includes('--quick');
    console.log(`🚀 Starting PRODUCTION Import - ${isQuick ? 'QUICK' : 'COMPLETE'} SYNC...`);

    // Define table order (Respect FKs!)
    let tables = [
        { name: 'draws', model: 'draw' },
        { name: 'ranked_systems', model: 'rankedSystem' },
        { name: 'system_rankings', model: 'systemRanking' },
        { name: 'star_system_ranking', model: 'starSystemRanking' }, // Corrected typo
        // Actually filenames in export-local-db.ts: 
        // star_system_ranking -> starSystemRanking
        // star_system_performance -> starSystemPerformance
    ];

    // Re-verify file names from export-local-db.ts
    // { name: 'draws', model: 'draw' },
    // { name: 'ranked_systems', model: 'rankedSystem' },
    // { name: 'system_rankings', model: 'systemRanking' },
    // { name: 'system_performances', model: 'systemPerformance' },
    // { name: 'star_system_ranking', model: 'starSystemRanking' },
    // { name: 'star_system_performance', model: 'starSystemPerformance' },
    // { name: 'cached_predictions', model: 'cachedPrediction' }

    // Re-check export list from Step 693
    // tables array...

    tables = [
        { name: 'draws', model: 'draw' },
        { name: 'ranked_systems', model: 'rankedSystem' },
        { name: 'system_rankings', model: 'systemRanking' },
        { name: 'star_system_ranking', model: 'starSystemRanking' }
    ];

    if (!isQuick) {
        tables.push({ name: 'system_performances', model: 'systemPerformance' });
        tables.push({ name: 'star_system_performance', model: 'starSystemPerformance' });
        tables.push({ name: 'cached_predictions', model: 'cachedPrediction' });
        tables.push({ name: 'system_predictions', model: 'systemPrediction' });
        tables.push({ name: 'exclusion_cache', model: 'exclusionCache' });
        tables.push({ name: 'ml_model_training', model: 'mLModelTraining' });
        tables.push({ name: 'statistics_cache', model: 'statisticsCache' });
    } else {
        tables.push({ name: 'cached_predictions', model: 'cachedPrediction' });
    }

    for (const table of tables) {
        await importTable(table.name, table.model);
    }

    console.log('\n🎉 Import to PRODUCTION complete!');
}

startImport()
    .catch(console.error)
    .finally(() => (prismaProd as any).$disconnect());
