import { prisma } from '../../lib/prisma';
import { Draw } from '@prisma/client';
import { rankedSystems } from '../../services/ranked-systems';
import { starSystems } from '../../services/star-systems';

async function backfillMissing() {
    const startTime = Date.now();
    console.log('--- BACKFILL MISSING STARTING ---\n');

    const games = ['EUROMILLIONS', 'TOTOLOTO', 'EURODREAMS', 'MEGASENA'];

    for (const game of games) {
        console.log(`\nPROCESSING GAME: ${game}`);

        const allDraws = await prisma.draw.findMany({
            where: { game },
            orderBy: { date: 'asc' }
        });

        console.log(`Loaded ${allDraws.length} draws.`);
        if (allDraws.length < 5) continue;

        // Process only NON-Diagonais systems
        const targetSystems = rankedSystems.filter(s => !s.name.includes("Diagonais"));

        for (const sys of targetSystems) {
            process.stdout.write(`   ${sys.name}: `);

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
            process.stdout.write(`done.\n`);
        }
        
        for (const sys of starSystems) {
            process.stdout.write(`   ${sys.name} (STARS): `);

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
                        accuracy: (hits / actual.length) * 100
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
            process.stdout.write(`done.\n`);
        }
    }

    console.log(`\nBACKFILL MISSING COMPLETE!`);
    await prisma.$disconnect();
}

backfillMissing();
