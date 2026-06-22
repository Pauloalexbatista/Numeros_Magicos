/**
 * Script to backfill missing SystemPerformanceFullPool entries for draws
 * that already have entries in the legacy SystemPerformance table.
 *
 * Run with: npx tsx src/scripts/recalc-missing-fullpool.ts [GAME] [LIMIT]
 * Example: npx tsx src/scripts/recalc-missing-fullpool.ts EURODREAMS 5
 */

import { prisma } from '../lib/prisma';
import { evaluateDrawStars, updateRanking, cachePredictions } from '../services/ranking';
import { rankedSystems, euroDreamsRankedSystems, totolotoRankedSystems } from '../services/ranking';
import { IPredictiveSystem } from '../services/ranked-systems';

const game = process.argv[2] || 'EURODREAMS';
const limit = parseInt(process.argv[3] || '3', 10);

async function main() {
    console.log(`\n=== Backfilling FullPool for ${game} (last ${limit} draws) ===\n`);

    // 1. Get system instances for this game
    let systemInstances: IPredictiveSystem[] = [];
    if (game === 'TOTOLOTO') systemInstances = totolotoRankedSystems as any;
    else if (game === 'EURODREAMS') systemInstances = euroDreamsRankedSystems as any;
    else systemInstances = rankedSystems as any;

    // 2. Get systems from DB
    const dbSystems = await prisma.rankedSystem.findMany({
        where: { game, domain: 'NUMBERS', isActive: true }
    });

    const matchedSystems = systemInstances.filter(s => dbSystems.some(db => db.name === s.name));
    console.log(`Matched ${matchedSystems.length} systems for ${game}`);

    // 3. Get recent draws
    const recentDraws = await prisma.draw.findMany({
        where: { game },
        orderBy: { date: 'desc' },
        take: limit,
        select: { id: true, date: true, numbers: true, stars: true }
    });

    // Process oldest first
    recentDraws.reverse();

    for (const draw of recentDraws) {
        const existingCount = await prisma.systemPerformanceFullPool.count({
            where: { drawId: draw.id }
        });

        if (existingCount >= matchedSystems.length) {
            console.log(`  ? [${draw.date.toISOString().split('T')[0]}] Already has ${existingCount} entries. Skipping.`);
            continue;
        }

        console.log(`\n  ?? [${draw.date.toISOString().split('T')[0]}] Has ${existingCount}/${matchedSystems.length} entries. Backfilling...`);

        // Get history BEFORE this draw
        const history = await prisma.draw.findMany({
            where: { game, date: { lt: draw.date } },
            orderBy: { date: 'desc' }
        });

        if (history.length < 50) {
            console.log(`    ?? Insufficient history (${history.length} draws). Skipping.`);
            continue;
        }

        let added = 0;
        for (const system of matchedSystems) {
            const existing = await prisma.systemPerformanceFullPool.findFirst({
                where: { drawId: draw.id, systemName: system.name, game }
            });

            if (existing) {
                continue;
            }

            try {
                const fullPool = await (system as any).generateTop10(history, true);
                await prisma.systemPerformanceFullPool.create({
                    data: {
                        drawId: draw.id,
                        game,
                        systemName: system.name,
                        predictedNumbers: JSON.stringify(fullPool),
                        actualNumbers: draw.numbers
                    }
                });
                added++;
                process.stdout.write(`    ? ${system.name}\n`);
            } catch (err: any) {
                console.error(`    ? ${system.name}: ${err.message}`);
            }
        }
        console.log(`    Added ${added} new FullPool entries for draw ${draw.id}`);
    }

    console.log('\n=== Updating rankings and predictions cache ===');
    await updateRanking();
    await cachePredictions();

    console.log('\n? Done!');
}

main()
    .catch(err => { console.error('? Fatal:', err); process.exit(1); })
    .finally(() => prisma.$disconnect());
