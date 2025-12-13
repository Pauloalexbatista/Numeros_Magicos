
import { prisma } from '../../lib/prisma';
import fs from 'fs';
import path from 'path';

async function exportTable(tableName: string, getData: () => Promise<any[]>) {
    console.log(`📦 Exporting ${tableName}...`);
    const data = await getData();
    const filePath = path.join(process.cwd(), 'prisma', 'seeds', `${tableName}.json`);

    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`✅ Saved ${data.length} records to ${filePath}`);
}

async function main() {
    console.log('🚀 Starting Data Export for Migration...');

    // 1. Draws (Critical)
    await exportTable('draws', () => prisma.draw.findMany({ orderBy: { id: 'asc' } }));

    // 2. Ranked Systems (Config)
    await exportTable('ranked_systems', () => prisma.rankedSystem.findMany());

    // 3. System Rankings (Leaderboard)
    await exportTable('system_rankings', () => prisma.systemRanking.findMany());

    // 4. System Performances (History) - This might be huge, let's chunk or be careful
    // For now, let's export it. If it fails on memory, we'll need a stream.
    // Given 1900 draws * 20 systems ~ 40k rows. Should be fine in JSON.
    await exportTable('system_performances', () => prisma.systemPerformance.findMany());

    // 5. System Predictions (Latest Details)
    // This table is usually rebuilt by backfill, but good to have.
    await exportTable('system_predictions', () => prisma.systemPrediction.findMany());

    console.log('🎉 Export complete! Ready for Supabase migration.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
