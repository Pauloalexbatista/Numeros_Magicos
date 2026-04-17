
import { prisma } from '../../lib/prisma';

async function diagnose() {
    const games = ['EUROMILLIONS', 'TOTOLOTO', 'EURODREAMS'];
    console.log('🧪 Starting Global Data Diagnostics...\n');

    for (const game of games) {
        console.log(`--- GAME: ${game} ---`);
        const draws = await prisma.draw.findMany({
            where: { game },
            orderBy: { date: 'desc' }
        });

        if (draws.length === 0) {
            console.log('  ❌ No draws found.');
            continue;
        }

        console.log(`  Count: ${draws.length}`);
        console.log(`  Latest: ${draws[0].date.toISOString()} | ID: ${draws[0].id}`);

        // 1. Check for Out of Range Numbers
        const maxNum = game === 'EURODREAMS' ? 40 : (game === 'TOTOLOTO' ? 49 : 50);
        const maxStars = game === 'EURODREAMS' ? 5 : (game === 'TOTOLOTO' ? 13 : 12);
        
        let outOfRange = 0;
        let nullStars = 0;
        let wrongQuantity = 0;
        const expectedCount = game === 'EURODREAMS' ? 6 : 5;

        draws.forEach(d => {
            const nums = JSON.parse(d.numbers as string);
            const stars = JSON.parse(d.stars as string);
            
            if (nums.some((n: number) => n < 1 || n > maxNum)) outOfRange++;
            if (stars.some((n: number) => n < 1 || n > maxStars)) outOfRange++;
            if (nums.length !== expectedCount) wrongQuantity++;
            if (!d.stars || d.stars === '[]') nullStars++;
        });

        if (outOfRange > 0) console.log(`  🚩 Out of range numbers found: ${outOfRange}`);
        if (wrongQuantity > 0) console.log(`  🚩 Wrong number of ball count: ${wrongQuantity}`);
        if (nullStars > 0) console.log(`  🚩 Draws with missing stars: ${nullStars}`);

        // 2. Check for Chronological Gaps (Missing Week)
        const dayLimit = 10; // If gap > 10 days, it's a hole (most games are twice a week)
        let gaps = 0;
        for (let i = 0; i < draws.length - 1; i++) {
            const diff = (draws[i].date.getTime() - draws[i+1].date.getTime()) / (1000 * 60 * 60 * 24);
            if (diff > dayLimit) {
                gaps++;
                if (gaps <= 3) {
                    console.log(`  🕳️ Gap found: ${draws[i+1].date.toISOString()} -> ${draws[i].date.toISOString()} (${Math.round(diff)} days)`);
                }
            }
        }
        if (gaps > 0) console.log(`  🚩 Total gaps found: ${gaps}`);

        if (outOfRange === 0 && wrongQuantity === 0 && nullStars === 0 && gaps === 0) {
            console.log('  ✅ Data looks healthy.');
        }
        console.log('');
    }
}

diagnose().catch(console.error).finally(() => prisma.$disconnect());
