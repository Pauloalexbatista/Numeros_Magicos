
import { PrismaClient } from '@prisma/client';
import { evaluateDrawStars, updateStarRankings } from './src/services/ranking';

const prisma = new PrismaClient();

async function backfillStars() {
    const games = ['TOTOLOTO', 'EUROMILLIONS', 'EURODREAMS'];

    for (const game of games) {
        console.log(`\n=== Backfilling STARS for ${game} ===`);
        const draws = await prisma.draw.findMany({
            where: { game },
            orderBy: { date: 'desc' },
            select: { id: true, date: true }
        });

        console.log(`Found ${draws.length} draws.`);

        for (let i = 0; i < draws.length; i++) {
            if (i % 25 === 0) {
                console.log(`[${game}] Progress: ${i}/${draws.length} (${((i / draws.length) * 100).toFixed(1)}%)`);
            }
            try {
                await evaluateDrawStars(draws[i].id);
            } catch (err) {
                console.error(`Error in draw ${draws[i].id}:`, err.message);
            }
        }

        console.log(`Updating Rankings for ${game}...`);
        try {
            await updateStarRankings(game);
            console.log(`✅ Rankings for ${game} updated.`);
        } catch (err) {
            console.error(`Error updating rankings for ${game}:`, err.message);
        }
    }
    console.log('\n🌟 ALL STAR BACKFILLS COMPLETE');
}

backfillStars()
    .catch(err => {
        console.error('FATAL:', err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
