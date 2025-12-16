
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
            await prisma.draw.upsert({
                where: { date: draw.date }, // Assuming date is unique, or id if preferred
                update: {
                    numbers: draw.numbers,
                    stars: draw.stars,
                    hasWinner: draw.hasWinner,
                    jackpotValue: draw.jackpotValue,
                    numbersDrawOrder: draw.numbersDrawOrder,
                    starsDrawOrder: draw.starsDrawOrder,
                    s1Winners: draw.s1Winners,
                    s1Prize: draw.s1Prize,
                    s2Winners: draw.s2Winners,
                    s2Prize: draw.s2Prize,
                    s3Winners: draw.s3Winners,
                    s3Prize: draw.s3Prize,
                    // Add other fields as necessary from schema
                },
                create: {
                    ...draw,
                    // Ensure ID is handled if needed, or let DB auto-increment (usually safer to omit ID if autoincrement, but for sync we might want to preserve it if possible. Let's rely on date uniqueness primarily)
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
