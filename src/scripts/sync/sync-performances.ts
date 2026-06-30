import { PrismaClient as LocalPrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const localPrisma = new LocalPrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } }
});

// Load the production prisma client
let prodPrisma: any;
const { PrismaClient: ProdClient } = require('@prisma/client-prod');
const prodUrl = process.env.POSTGRES_URL_PROD + (process.env.POSTGRES_URL_PROD?.includes('?') ? '&' : '?') + 'connection_limit=1';
prodPrisma = new ProdClient({
    datasources: { db: { url: prodUrl } }
});

async function syncAllPerformances() {
    console.log('=== STARTING OPTIMIZED PERFORMANCE SYNCHRONIZATION (SINCE JUNE 1ST, 2026) ===\n');

    // Get production draws since June 1st, 2026
    const prodDraws = await prodPrisma.draw.findMany({
        where: {
            date: { gte: new Date('2026-06-01T00:00:00Z') }
        },
        orderBy: { date: 'desc' }
    });
    console.log(`Found ${prodDraws.length} recent draws in production database.`);

    let totalSystemPerf = 0;
    let totalStarPerf = 0;
    let totalFullPoolPerf = 0;

    for (const prodDraw of prodDraws) {
        console.log(`Syncing performance for ${prodDraw.game} draw date ${prodDraw.date.toISOString().split('T')[0]}...`);
        
        // Find matching local draw by game and date
        const startOfDay = new Date(prodDraw.date.toISOString().split('T')[0] + "T00:00:00Z");
        const endOfDay = new Date(prodDraw.date.toISOString().split('T')[0] + "T23:59:59Z");

        const localDraw = await localPrisma.draw.findFirst({
            where: {
                game: prodDraw.game,
                date: { gte: startOfDay, lte: endOfDay }
            }
        });

        if (!localDraw) {
            console.log(`   Local draw not found. Skipping.`);
            continue;
        }

        // 1. Sync SystemPerformance
        const localSystemPerfs = await localPrisma.systemPerformance.findMany({
            where: { drawId: localDraw.id }
        });

        if (localSystemPerfs.length > 0) {
            for (const perf of localSystemPerfs) {
                await prodPrisma.systemPerformance.upsert({
                    where: {
                        drawId_systemName_game: {
                            drawId: prodDraw.id,
                            systemName: perf.systemName,
                            game: perf.game
                        }
                    },
                    update: {
                        predictedNumbers: perf.predictedNumbers,
                        actualNumbers: perf.actualNumbers,
                        hits: perf.hits,
                        accuracy: perf.accuracy
                    },
                    create: {
                        drawId: prodDraw.id,
                        game: perf.game,
                        systemName: perf.systemName,
                        predictedNumbers: perf.predictedNumbers,
                        actualNumbers: perf.actualNumbers,
                        hits: perf.hits,
                        accuracy: perf.accuracy
                    }
                });
                totalSystemPerf++;
            }
        }

        // 2. Sync StarSystemPerformance
        const localStarPerfs = await localPrisma.starSystemPerformance.findMany({
            where: { drawId: localDraw.id }
        });

        if (localStarPerfs.length > 0) {
            for (const perf of localStarPerfs) {
                await prodPrisma.starSystemPerformance.upsert({
                    where: {
                        drawId_systemName_game: {
                            drawId: prodDraw.id,
                            systemName: perf.systemName,
                            game: perf.game
                        }
                    },
                    update: {
                        predictedStars: perf.predictedStars,
                        actualStars: perf.actualStars,
                        hits: perf.hits
                    },
                    create: {
                        drawId: prodDraw.id,
                        game: perf.game,
                        systemName: perf.systemName,
                        predictedStars: perf.predictedStars,
                        actualStars: perf.actualStars,
                        hits: perf.hits
                    }
                });
                totalStarPerf++;
            }
        }

        // 3. Sync SystemPerformanceFullPool
        const localFullPerfs = await localPrisma.systemPerformanceFullPool.findMany({
            where: { drawId: localDraw.id }
        });

        if (localFullPerfs.length > 0) {
            for (const perf of localFullPerfs) {
                await prodPrisma.systemPerformanceFullPool.upsert({
                    where: {
                        drawId_systemName_game: {
                            drawId: prodDraw.id,
                            systemName: perf.systemName,
                            game: perf.game
                        }
                    },
                    update: {
                        predictedNumbers: perf.predictedNumbers,
                        actualNumbers: perf.actualNumbers
                    },
                    create: {
                        drawId: prodDraw.id,
                        game: perf.game,
                        systemName: perf.systemName,
                        predictedNumbers: perf.predictedNumbers,
                        actualNumbers: perf.actualNumbers
                    }
                });
                totalFullPoolPerf++;
            }
        }
    }

    console.log(`\nSync Completed:`);
    console.log(`- SystemPerformance records synced: ${totalSystemPerf}`);
    console.log(`- StarSystemPerformance records synced: ${totalStarPerf}`);
    console.log(`- SystemPerformanceFullPool records synced: ${totalFullPoolPerf}`);
}

syncAllPerformances()
    .catch(console.error)
    .finally(async () => {
        await localPrisma.$disconnect();
        await prodPrisma.$disconnect();
    });
