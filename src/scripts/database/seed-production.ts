
import { prisma } from '../../lib/prisma';
import fs from 'fs';
import path from 'path';

async function importTable(tableName: string, modelName: string, batchSize = 1000) {
    const filePath = path.join(process.cwd(), 'prisma', 'seeds', `${tableName}.json`);

    if (!fs.existsSync(filePath)) {
        console.warn(`⚠️ File not found: ${filePath}`);
        return;
    }

    console.log(`📦 Importing ${tableName} to ${modelName}...`);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // Batch insert
    for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        // Remove IDs if they are autoincrement but we want to keep them?
        // Actually for migration we usually WANT to keep IDs to preserve relations.
        // Prisma createMany is supported in Postgres.

        try {
            // @ts-ignore - Dynamic model access
            await prisma[modelName].createMany({
                data: batch
                // Note: skipDuplicates is PostgreSQL-only, not supported in SQLite
            });
            process.stdout.write(`.`);
        } catch (e: any) {
            console.error(`❌ Batch error:`, e.message);
        }
    }
    console.log(`\n✅ Imported ${data.length} records.`);
}

async function main() {
    console.log('🚀 Starting Production Database Seed...');

    // 1. Draws (Has to be first)
    await importTable('draws', 'draw');

    // 2. Ranked Systems 
    await importTable('ranked_systems', 'rankedSystem');

    // 3. System Rankings
    await importTable('system_rankings', 'systemRanking');

    // 4. System Performances
    await importTable('system_performances', 'systemPerformance');

    // 5. System Predictions
    await importTable('system_predictions', 'systemPrediction');

    // 6. Star System Rankings
    await importTable('star_system_ranking', 'starSystemRanking');

    // 7. Star System Performances
    await importTable('star_system_performance', 'starSystemPerformance');

    console.log('🎉 Seeding complete!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
