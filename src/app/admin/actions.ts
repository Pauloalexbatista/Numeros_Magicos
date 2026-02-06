'use server';

import { prisma } from '@/lib/prisma';
import { rankedSystems } from '@/services/ranked-systems';
import { updateRanking, cachePredictions } from '@/services/ranking';
import { revalidatePath } from 'next/cache';
import { getRankingMetrics } from '../ranking/actions';

/**
 * Validates which systems are present in the Code but missing in the Database.
 */
export async function getSystemBackfillStatus(game: string = 'EUROMILLIONS') {
    // 1. Get all system names from Code for this game
    let codeSystems: string[] = [];
    if (game === 'EUROMILLIONS') {
        codeSystems = rankedSystems.map(s => s.name);
    } else if (game === 'TOTOLOTO') {
        const { totolotoRankedSystems } = await import('@/services/totoloto-systems');
        codeSystems = totolotoRankedSystems.map(s => s.name);
    } else if (game === 'EURODREAMS') {
        const { euroDreamsRankedSystems } = await import('@/services/ranking');
        codeSystems = euroDreamsRankedSystems.map(s => s.name);
    }

    // 2. Get all system names from Database for this game
    const dbSystemsData = await prisma.systemPerformance.groupBy({
        where: {
            draw: { game }
        },
        by: ['systemName'],
        _count: {
            drawId: true
        }
    });

    const dbSystemsMap = new Map(dbSystemsData.map(s => [s.systemName, s._count.drawId]));

    // 2.5 Get Ranking Metrics (Scores)
    const rankingMetrics = await getRankingMetrics();
    const scoreMap = new Map(rankingMetrics.map(r => [r.systemName, r.qualityScore]));

    // 3. Compare
    const status = codeSystems.map(name => {
        const count = dbSystemsMap.get(name) || 0;
        // Threshold: If less than 100 draws, it's considered incomplete
        const isBackfilled = count > 100;
        const score = scoreMap.get(name) || 0;

        return {
            name,
            isBackfilled,
            drawCount: count,
            status: isBackfilled ? 'OK' : 'MISSING',
            qualityScore: score
        };
    });

    // Also find "Zombie" systems (In DB for this game but not in Code)
    const zombieSystems = dbSystemsData
        .filter(s => !codeSystems.includes(s.systemName))
        .map(s => ({
            name: s.systemName,
            isBackfilled: true,
            drawCount: s._count.drawId,
            status: 'ZOMBIE',
            qualityScore: 0
        }));

    return [...status, ...zombieSystems].sort((a, b) => Number(b.qualityScore) - Number(a.qualityScore));
}

/**
 * Handles the upload of the "ML Pack" (JSON file).
 * updates CachedPrediction and SystemPrediction tables.
 */
export async function uploadPredictionPack(jsonString: string) {
    try {
        const data = JSON.parse(jsonString);

        if (!data.systems || !Array.isArray(data.systems)) {
            throw new Error('Invalid JSON format: missing "systems" array.');
        }

        let processed = 0;

        for (const sys of data.systems) {
            // 1. Update Cache
            if (sys.cache) {
                await prisma.cachedPrediction.upsert({
                    where: { systemName: sys.name },
                    update: {
                        numbers: JSON.stringify(sys.cache.numbers),
                        worstNumbers: JSON.stringify(sys.cache.worstNumbers),
                        updatedAt: new Date() // Force update time
                    },
                    create: {
                        systemName: sys.name,
                        numbers: JSON.stringify(sys.cache.numbers),
                        worstNumbers: JSON.stringify(sys.cache.worstNumbers)
                    }
                });
            }

            // 2. Update Future Prediction (SystemPrediction)
            if (sys.prediction) {
                // Find latest draw to attach prediction to?
                // Ideally the pack tells us the drawId.
                // For simplicity, we might just update the generic SystemPrediction if it stores "Next Draw" info.
                // But SystemPrediction is linked to a DrawId.
                // Let's assume the JSON contains `drawId` or we find the latest open draw.

                const latestDraw = await prisma.draw.findFirst({ orderBy: { date: 'desc' } });

                if (latestDraw) {
                    await prisma.systemPrediction.upsert({
                        where: {
                            drawId_systemName: {
                                drawId: latestDraw.id,
                                systemName: sys.name
                            }
                        },
                        update: {
                            prediction: JSON.stringify(sys.prediction),
                            antiPrediction: JSON.stringify(sys.antiPrediction || []),
                            calculatedAt: new Date()
                        },
                        create: {
                            drawId: latestDraw.id,
                            systemName: sys.name,
                            prediction: JSON.stringify(sys.prediction),
                            antiPrediction: JSON.stringify(sys.antiPrediction || []),
                            hits: 0,
                            antiHits: 0
                        }
                    });
                }
            }
            processed++;
        }

        revalidatePath('/admin');
        return { success: true, message: `Updated ${processed} systems successfully.` };

    } catch (error: any) {
        console.error('Upload failed:', error);
        return { success: false, message: error.message };
    }
}

/**
 * Recalculates Rankings (Accuracy) and updates Cached Predictions (Next Draw).
 * Important for Medal Systems (Gold/Silver/Bronze) to reflect recent performance.
 */
export async function recalculateMedals() {
    try {
        await updateRanking();
        await cachePredictions();
        revalidatePath('/admin');
        return { success: true, message: 'Medalhas e Cache atualizados com sucesso.' };
    } catch (error: any) {
        console.error('Medal update failed:', error);
        return { success: false, message: error.message };
    }
}

/**
 * Emergency Fix for Sequence Sync Issues (Postgres)
 * Resets the auto-increment counter for critical tables.
 */
export async function fixDatabaseSequences() {
    try {
        const tables = [
            'SystemRanking',
            'RankedSystem',
            'SystemPerformance',
            'StarSystemRanking',
            'StarSystemPerformance',
            // 'Draw' // Draw might be 'Draw' or 'draws', often problematic if not mapped.
        ];

        let log: string[] = [];

        for (const tableName of tables) {
            try {
                // Prisma Model Name -> Table Name (assuming standard mapping or simple lowercase if not mapped)
                // We'll rely on Prisma's internal mapping if possible, but raw query requires RAW table name.
                // Best guess: snake_case for mapped ones.
                const rawTableName = tableName === 'SystemRanking' ? 'system_ranking' :
                    tableName === 'RankedSystem' ? 'ranked_systems' :
                        tableName === 'SystemPerformance' ? 'system_performance' :
                            tableName === 'StarSystemRanking' ? 'star_system_ranking' :
                                tableName === 'StarSystemPerformance' ? 'star_system_performance' :
                                    tableName;

                // Construct standard sequence name: table_column_seq
                const seqName = `${rawTableName}_id_seq`;

                // Execute Reset
                await prisma.$executeRawUnsafe(`
                    SELECT setval('${seqName}', (SELECT COALESCE(MAX(id), 0) + 1 FROM "${rawTableName}"), false);
                `);

                log.push(`✅ ${rawTableName}`);
            } catch (err: any) {
                log.push(`⚠️ ${tableName}: ${err.message?.split('\n')[0]}`);
            }
        }

        revalidatePath('/admin');
        return { success: true, message: `Sequências reparadas: ${log.filter(l => l.includes('✅')).length}. Detalhes na consola.` };

    } catch (error: any) {
        return { success: false, message: 'Falha geral: ' + error.message };
    }
}
