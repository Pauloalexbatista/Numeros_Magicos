import { prisma } from '../../lib/prisma';
import { Draw } from '@prisma/client';
import { rankedSystems } from '../../services/ranked-systems';
import { starSystems } from '../../services/star-systems';

/**
 * MASTER BACKFILL V4 (Comprehensive)
 * Processes ALL history for 11 Number systems and 11 Star systems.
 * INCLUDES: Totoloto Stars, EuroDreams Stars, and all EuroMillions data.
 */
async function masterBackfill() {
    const startTime = Date.now();
    console.log('🚀 MASTER BACKFILL V4 STARTING (TOTAL RESTORATION)...\n');

    const games = ['EUROMILLIONS', 'TOTOLOTO', 'EURODREAMS', 'MEGASENA'];

    for (const game of games) {
        console.log(`\n-----------------------------------------`);
        console.log(`🎮 PROCESSING GAME: ${game}`);
        console.log(`-----------------------------------------`);

        const allDraws = await prisma.draw.findMany({
            where: { game },
            orderBy: { date: 'asc' }
        });

        console.log(`📦 Loaded ${allDraws.length} draws.`);
        if (allDraws.length < 5) {
            console.log('⚠️ Too few draws. Skipping.');
            continue;
        }

        // 1. Process Number Systems
        console.log('\n🔢 Numbers...');
        const targetSystems = rankedSystems.filter(s => s.name.includes("Diagonais"));
        for (const sys of targetSystems) {
            const sysStart = Date.now();
            process.stdout.write(`   🔄 ${sys.name}: `);

            await prisma.systemPerformance.deleteMany({
                where: { systemName: sys.name, game: game }
            });

            const buffer = [];
            for (let i = 20; i < allDraws.length - 1; i++) {
                const history = allDraws.slice(0, i + 1).reverse();
                const nextDraw = allDraws[i + 1];

                try {
                    const prediction = await sys.generateTop10(history);
                    const actualValue = nextDraw.numbers;
                    const actual = typeof actualValue === 'string' ? JSON.parse(actualValue) : actualValue;

                    if (!Array.isArray(actual) || actual.length === 0) continue;

                    const hits = actual.filter((n: number) => prediction.includes(n)).length;

                    buffer.push({
                        drawId: nextDraw.id,
                        game: game,
                        systemName: sys.name,
                        predictedNumbers: JSON.stringify(prediction),
                        actualNumbers: JSON.stringify(actual),
                        hits,
                        accuracy: (hits / actual.length) * 100
                    });

                    if (buffer.length >= 200) {
                        await prisma.systemPerformance.createMany({ data: buffer });
                        buffer.length = 0;
                    }
                } catch (e) { }
            }
            if (buffer.length > 0) {
                await prisma.systemPerformance.createMany({ data: buffer });
            }
            process.stdout.write(`✅\n`);
        }

        // 2. Process Star Systems
        console.log('\n⭐ Stars...');
        const targetStarSystems = starSystems.filter(s => s.name.includes("Diagonais"));
        for (const sys of targetStarSystems) {
            const sysStart = Date.now();
            process.stdout.write(`   🔄 ${sys.name}: `);

            await prisma.starSystemPerformance.deleteMany({
                where: { systemName: sys.name, game: game }
            });

            const buffer = [];
            for (let i = 20; i < allDraws.length - 1; i++) {
                const history = allDraws.slice(0, i + 1).reverse();
                const nextDraw = allDraws[i + 1];

                try {
                    const prediction = await sys.generatePrediction(history);
                    const actualValue = nextDraw.stars;
                    const actual = typeof actualValue === 'string' ? JSON.parse(actualValue) : actualValue;

                    if (!Array.isArray(actual) || actual.length === 0) continue;

                    const hits = actual.filter((n: number) => prediction.includes(n)).length;

                    buffer.push({
                        drawId: nextDraw.id,
                        game: game,
                        systemName: sys.name,
                        predictedStars: JSON.stringify(prediction),
                        actualStars: JSON.stringify(actual),
                        hits,
                        
                    });

                    if (buffer.length >= 200) {
                        await prisma.starSystemPerformance.createMany({ data: buffer });
                        buffer.length = 0;
                    }
                } catch (e) { }
            }
            if (buffer.length > 0) {
                await prisma.starSystemPerformance.createMany({ data: buffer });
            }
            process.stdout.write(`✅\n`);
        }
    }

    console.log(`\n✨ MASTER BACKFILL V4 COMPLETE!`);
    console.log(`⏱️ Total: ${((Date.now() - startTime) / 60000).toFixed(1)} min.`);
    await prisma.$disconnect();
}

masterBackfill();
