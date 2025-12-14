
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function exportTable(modelName: string, tableName: string) {
    console.log(`📦 Exporting ${modelName}...`);
    // @ts-ignore
    const data = await prisma[modelName].findMany();

    const filePath = path.join(process.cwd(), 'prisma', 'seeds', `${tableName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    console.log(`✅ Exported ${data.length} records to ${tableName}.json`);
}

async function main() {
    const seedsDir = path.join(process.cwd(), 'prisma', 'seeds');
    if (!fs.existsSync(seedsDir)) {
        fs.mkdirSync(seedsDir, { recursive: true });
    }

    // Export existing data
    await exportTable('draw', 'draws');
    await exportTable('rankedSystem', 'ranked_systems');
    await exportTable('systemRanking', 'system_rankings');
    await exportTable('systemPerformance', 'system_performances');
    await exportTable('systemPrediction', 'system_predictions');

    // NEW: Export Star Systems
    await exportTable('starSystemRanking', 'star_system_ranking');
    await exportTable('starSystemPerformance', 'star_system_performance');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
