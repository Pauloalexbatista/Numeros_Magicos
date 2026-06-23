import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BASE_NUMBER_SYSTEMS } from '@/services/system-registry';
import { totolotoRankedSystems, euroDreamsRankedSystems, rankedSystems } from '@/services/ranking';

export const dynamic = 'force-dynamic';

/**
 * Admin route to backfill SystemPerformanceFullPool for draws that are missing entries.
 * This should be called after migrating to the new FullPool architecture.
 * Only processes draws that have NO FullPool entries (safe to call multiple times).
 * 
 * POST /api/admin/backfill-full-pool?secret=magia2026&game=EURODREAMS&limit=10
 */
export async function POST(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get('secret');

        if (secret !== 'magia2026') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const game = searchParams.get('game') || null; // null = all games
        const limit = parseInt(searchParams.get('limit') || '5', 10);

        // Launch in background to avoid timeout
        (async () => {
            try {
                const games = game ? [game] : ['EUROMILLIONS', 'EURODREAMS', 'TOTOLOTO', 'MEGASENA'];
                
                for (const g of games) {
                    console.log(`\n=== Backfilling FullPool for ${g} (last ${limit} draws) ===`);

                    // Get all active number systems for this game
                    const systemsInDb = await prisma.rankedSystem.findMany({
                        where: { game: g, domain: 'NUMBERS', isActive: true }
                    });

                    // Get system instances
                    let systemInstances: any[] = [];
                    if (g === 'TOTOLOTO') systemInstances = totolotoRankedSystems as any[];
                    else if (g === 'EURODREAMS') systemInstances = euroDreamsRankedSystems as any[];
                    else systemInstances = rankedSystems as any[];

                    // Match instances with DB systems
                    const matchedSystems = systemInstances.filter(s =>
                        systemsInDb.some(db => db.name === s.name)
                    );

                    if (matchedSystems.length === 0) {
                        console.log(`No matched systems for ${g}`);
                        continue;
                    }

                    // Get recent draws, ordered oldest to newest within the limit
                    const recentDraws = await prisma.draw.findMany({
                        where: { game: g },
                        orderBy: { date: 'desc' },
                        take: limit,
                        select: { id: true, date: true, numbers: true, stars: true }
                    });

                    // Reverse to process oldest first
                    recentDraws.reverse();

                    for (const draw of recentDraws) {
                        // Check if this draw already has enough FullPool entries
                        const existingCount = await prisma.systemPerformanceFullPool.count({
                            where: { drawId: draw.id }
                        });

                        if (existingCount >= matchedSystems.length) {
                            console.log(`  [${draw.date.toISOString().split('T')[0]}] Already has ${existingCount} entries. Skipping.`);
                            continue;
                        }

                        console.log(`  [${draw.date.toISOString().split('T')[0]}] Has ${existingCount}/${matchedSystems.length} entries. Backfilling...`);

                        // Get history BEFORE this draw
                        const history = await prisma.draw.findMany({
                            where: { game: g, date: { lt: draw.date } },
                            orderBy: { date: 'desc' }
                        });

                        if (history.length < 50) {
                            console.log(`    Insufficient history (${history.length} draws). Skipping.`);
                            continue;
                        }

                        for (const system of matchedSystems) {
                            // Check if this specific system already has an entry
                            const existing = await prisma.systemPerformanceFullPool.findFirst({
                                where: { drawId: draw.id, systemName: system.name, game: g }
                            });

                            if (existing) continue;

                            try {
                                const fullPool = await (system as any).generateTop10(history, true);
                                await prisma.systemPerformanceFullPool.create({
                                    data: {
                                        drawId: draw.id,
                                        game: g,
                                        systemName: system.name,
                                        predictedNumbers: JSON.stringify(fullPool),
                                        actualNumbers: draw.numbers
                                    }
                                });
                                console.log(`    ? ${system.name} for draw ${draw.id}`);
                            } catch (err: any) {
                                console.error(`    ? ${system.name}: ${err.message}`);
                            }
                        }
                    }
                    console.log(`=== ${g} FullPool backfill complete ===`);
                }
                console.log('\n? All FullPool backfills complete!');
            } catch (err) {
                console.error('FullPool backfill background error:', err);
            }
        })();

        return NextResponse.json({
            success: true,
            message: `Processo de backfill do FullPool iniciado em segundo plano para ${game || 'todos os jogos'} (últimos ${limit} sorteios).`
        });

    } catch (error: any) {
        return NextResponse.json(
            { error: 'Internal Server Error', details: error.message },
            { status: 500 }
        );
    }
}
