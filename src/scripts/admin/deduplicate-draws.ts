
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Starting Deduplication Process...');
    const games = ['EUROMILLIONS', 'TOTOLOTO', 'EURODREAMS'];
    let totalRemoved = 0;

    for (const game of games) {
        console.log(`📦 Processing ${game}...`);
        const draws = await prisma.draw.findMany({
            where: { game },
            orderBy: { date: 'asc' }
        });

        const seen = new Map<string, number>(); // ISO Date -> ID

        for (const draw of draws) {
            const isoDate = draw.date.toISOString().split('T')[0];
            const normalizedDate = new Date(isoDate + "T12:00:00Z");

            if (seen.has(isoDate)) {
                const survivingId = seen.get(isoDate)!;
                console.log(`   ⚠️ Duplicate found for ${isoDate}. ID ${draw.id} -> ${survivingId}`);

                // 1. Handle SystemPerformance
                const duplicatePerformances = await prisma.systemPerformance.findMany({
                    where: { drawId: draw.id }
                });

                for (const perf of duplicatePerformances) {
                    const existingPerf = await prisma.systemPerformance.findFirst({
                        where: {
                            drawId: survivingId,
                            systemName: perf.systemName,
                            game: perf.game
                        }
                    });

                    if (!existingPerf) {
                        try {
                            await prisma.systemPerformance.update({
                                where: { id: perf.id },
                                data: { drawId: survivingId }
                            });
                        } catch (e) {
                            await prisma.systemPerformance.delete({ where: { id: perf.id } });
                        }
                    } else {
                        await prisma.systemPerformance.delete({ where: { id: perf.id } });
                    }
                }

                // 2. Handle StarSystemPerformance
                const duplicateStarPerformances = await prisma.starSystemPerformance.findMany({
                    where: { drawId: draw.id }
                });

                for (const perf of duplicateStarPerformances) {
                    const existingPerf = await prisma.starSystemPerformance.findFirst({
                        where: {
                            drawId: survivingId,
                            systemName: perf.systemName,
                            game: perf.game
                        }
                    });

                    if (!existingPerf) {
                        try {
                            await prisma.starSystemPerformance.update({
                                where: { id: perf.id },
                                data: { drawId: survivingId }
                            });
                        } catch (e) {
                            await prisma.starSystemPerformance.delete({ where: { id: perf.id } });
                        }
                    } else {
                        await prisma.starSystemPerformance.delete({ where: { id: perf.id } });
                    }
                }

                // 3. Handle SystemPrediction
                const duplicatePredictions = await prisma.systemPrediction.findMany({
                    where: { drawId: draw.id }
                });

                for (const pred of duplicatePredictions) {
                    const existingPred = await prisma.systemPrediction.findFirst({
                        where: {
                            drawId: survivingId,
                            systemName: pred.systemName,
                            game: pred.game
                        }
                    });

                    if (!existingPred) {
                        try {
                            await prisma.systemPrediction.update({
                                where: { id: pred.id },
                                data: { drawId: survivingId }
                            });
                        } catch (e) {
                            await prisma.systemPrediction.delete({ where: { id: pred.id } });
                        }
                    } else {
                        await prisma.systemPrediction.delete({ where: { id: pred.id } });
                    }
                }

                // 4. Finally delete the redundant draw
                await prisma.draw.delete({ where: { id: draw.id } });
                totalRemoved++;
                console.log(`   ✅ Removed duplicate ID ${draw.id}`);
            } else {
                seen.set(isoDate, draw.id);
                if (draw.date.getTime() !== normalizedDate.getTime()) {
                    await prisma.draw.update({
                        where: { id: draw.id },
                        data: { date: normalizedDate }
                    });
                }
            }
        }
    }

    console.log(`\n✨ Finished! Removed ${totalRemoved} duplicate draws.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
