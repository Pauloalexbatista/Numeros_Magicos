
import { prisma } from '../../lib/prisma';
import fs from 'fs/promises';
import path from 'path';

const STATIC_DIR = path.join(process.cwd(), 'src/data/static');

async function main() {
    console.log('🔄 Syncing Draws to Prod DB...');

    const exportPath = path.join(STATIC_DIR, 'draws-export.json');

    try {
        const data = await fs.readFile(exportPath, 'utf-8');
        const draws = JSON.parse(data);
        console.log(`📂 Loaded ${draws.length} draws from JSON.`);

        let syncedCount = 0;

        for (const draw of draws) {
            // Remove ID to let target DB handle it if needed.
            // Convert dates from JSON strings to Date objects.
            const { id, date, createdAt, updatedAt, ...rest } = draw;

            await prisma.draw.upsert({
                where: { date: new Date(date) },
                update: {
                    ...rest,
                    createdAt: new Date(createdAt),
                    updatedAt: new Date(updatedAt)
                },
                create: {
                    ...rest,
                    date: new Date(date),
                    createdAt: new Date(createdAt),
                    updatedAt: new Date(updatedAt)
                }
            });
            syncedCount++;
            if (syncedCount % 100 === 0) process.stdout.write('.');
        }

        console.log(`\n✅ Synced ${syncedCount} draws to Production.`);

    } catch (e) {
        console.error('❌ Failed to sync draws:', e);
        process.exit(1);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
