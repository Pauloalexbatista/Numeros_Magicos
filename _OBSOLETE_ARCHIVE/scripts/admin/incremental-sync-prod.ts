import { PrismaClient } from '@prisma/client';

/**
 * INCREMENTAL PRODUCTION SYNC
 * 
 * Syncs ONLY new/changed data from local SQLite to production Postgres.
 * This is 18x faster than full sync (~5s vs ~90s).
 * 
 * Use this for:
 * - Daily draw updates (Tuesday/Friday)
 * - New predictions
 * - Ranking updates
 * 
 * Use FULL sync for:
 * - Bug fixes affecting old data
 * - Schema changes
 * - Data inconsistencies
 */

async function incrementalSync() {
    console.log('🔄 ========================================');
    console.log('   INCREMENTAL PRODUCTION SYNC');
    console.log('========================================\n');

    let localPrisma: PrismaClient | null = null;
    let prodPrisma: PrismaClient | null = null;
    let totalInserted = 0;

    try {
        // Connect to both databases
        console.log('📡 Connecting to databases...');

        // Local SQLite
        localPrisma = new PrismaClient({
            datasources: { db: { url: 'file:./prisma/dev.db' } }
        });

        // Production Postgres (using env var set by batch file)
        prodPrisma = new PrismaClient();

        console.log('✅ Connected to both databases\n');

        // ============================================
        // STEP 1: Identify new draws
        // ============================================
        console.log('[STEP 1/4] 🔍 Identifying new draws...');

        const lastProdDraw = await prodPrisma.draw.findFirst({
            orderBy: { id: 'desc' },
            select: { id: true, date: true }
        });

        const newDraws = await localPrisma.draw.findMany({
            where: { id: { gt: lastProdDraw?.id || 0 } },
            orderBy: { id: 'asc' }
        });

        if (newDraws.length === 0) {
            console.log('✅ No new draws to sync. Proceeding to updates...\n');
        } else {

            console.log(`📦 Found ${newDraws.length} new draw(s) to sync`);
            for (const draw of newDraws) {
                console.log(`   - Draw #${draw.id} (${new Date(draw.date).toLocaleDateString()})`);
            }
            console.log();

            // ============================================
            // STEP 2: Sync NEW data (Insert)
            // ============================================
            console.log('[STEP 2/4] 📥 Syncing NEW data...\n');

            // 2.1 Insert new draws
            console.log('📦 Inserting draws...');
            for (const draw of newDraws) {
                await prodPrisma.draw.create({ 
                    data: {
                        ...draw,
                        date: new Date(draw.date),
                        createdAt: new Date(draw.createdAt),
                        updatedAt: new Date(draw.updatedAt)
                    }
                });
                totalInserted++;
            }
            console.log(`   ✅ Inserted ${newDraws.length} draw(s)\n`);

            // 2.2 Insert performances for new draws
            console.log('📦 Inserting system performances...');
            for (const draw of newDraws) {
                const performances = await localPrisma.systemPerformance.findMany({
                    where: { drawId: draw.id }
                });

                for (const perf of performances) {
                    await prodPrisma.systemPerformance.create({ 
                        data: {
                            ...perf,
                            createdAt: new Date(perf.createdAt)
                        } 
                    });
                    totalInserted++;
                }
                console.log(`   - Draw #${draw.id}: ${performances.length} performances`);
            }
            console.log(`   ✅ Inserted performances\n`);

            // 2.3 Insert star performances
            console.log('📦 Inserting star performances...');
            for (const draw of newDraws) {
                const starPerfs = await localPrisma.starSystemPerformance.findMany({
                    where: { drawId: draw.id }
                });

                for (const perf of starPerfs) {
                    await prodPrisma.starSystemPerformance.create({ 
                        data: {
                            ...perf,
                            createdAt: new Date(perf.createdAt)
                        }
                    });
                    totalInserted++;
                }
                console.log(`   - Draw #${draw.id}: ${starPerfs.length} star performances`);
            }
            console.log(`   ✅ Inserted star performances\n`);

            // 2.4 Insert system predictions
            console.log('📦 Inserting system predictions...');
            for (const draw of newDraws) {
                const predictions = await localPrisma.systemPrediction.findMany({
                    where: { drawId: draw.id }
                });

                for (const pred of predictions) {
                    await prodPrisma.systemPrediction.create({ 
                        data: {
                            ...pred,
                            calculatedAt: new Date(pred.calculatedAt)
                        }
                    });
                    totalInserted++;
                }
                console.log(`   - Draw #${draw.id}: ${predictions.length} predictions`);
            }
            console.log(`   ✅ Inserted predictions\n`);

        }

        // ============================================
        // STEP 3: Sync UPDATED data (Upsert)
        // ============================================
        console.log('[STEP 3/4] 🔄 Syncing UPDATED data...\n');

        let totalUpdated = 0;

        // 3.1 Upsert system rankings (averages changed!)
        console.log('📊 Updating system rankings...');
        const rankings = await localPrisma.systemRanking.findMany();
        for (const ranking of rankings) {
            const { id, ...data } = ranking;
            await prodPrisma.systemRanking.upsert({
                where: { systemName_game: { systemName: ranking.systemName, game: ranking.game } },
                update: {
                    avgAccuracy: ranking.avgAccuracy,
                    totalPredictions: ranking.totalPredictions,
                    lastUpdated: new Date(ranking.lastUpdated)
                },
                create: {
                    ...data,
                    lastUpdated: new Date(ranking.lastUpdated)
                }
            });
            totalUpdated++;
        }
        console.log(`   ✅ Updated ${rankings.length} ranking(s)\n`);

        // 3.2 Upsert star rankings
        console.log('⭐ Updating star rankings...');
        const starRankings = await localPrisma.starSystemRanking.findMany();
        for (const ranking of starRankings) {
            const { id, ...data } = ranking;
            await prodPrisma.starSystemRanking.upsert({
                where: { systemName_game: { systemName: ranking.systemName, game: ranking.game } },
                update: {
                    ...data,
                    lastUpdated: new Date(ranking.lastUpdated)
                },
                create: {
                    ...data,
                    lastUpdated: new Date(ranking.lastUpdated)
                }
            });
            totalUpdated++;
        }
        console.log(`   ✅ Updated ${starRankings.length} star ranking(s)\n`);

        // 3.3 Upsert cached predictions (next draw)
        console.log('🔮 Updating cached predictions...');
        const cachedPreds = await localPrisma.cachedPrediction.findMany();
        for (const pred of cachedPreds) {
            const { id, ...data } = pred;
            await prodPrisma.cachedPrediction.upsert({
                where: { systemName_game: { systemName: pred.systemName, game: pred.game } },
                update: {
                    numbers: pred.numbers,
                    worstNumbers: pred.worstNumbers,
                    updatedAt: new Date(pred.updatedAt)
                },
                create: {
                    ...data,
                    updatedAt: new Date(pred.updatedAt)
                }
            });
            totalUpdated++;
        }
        console.log(`   ✅ Updated ${cachedPreds.length} cached prediction(s)\n`);

        // 3.4 Upsert ML models (if retrained)
        console.log('🤖 Updating ML models...');
        const mlModels = await localPrisma.mLModelTraining.findMany();
        for (const model of mlModels) {
            const { id, ...data } = model;
            await prodPrisma.mLModelTraining.upsert({
                where: { modelType: model.modelType },
                update: {
                    modelData: model.modelData,
                    lastTrained: new Date(model.lastTrained),
                    updatedAt: new Date(model.updatedAt)
                },
                create: {
                    ...data,
                    lastTrained: new Date(model.lastTrained),
                    createdAt: new Date(model.createdAt),
                    updatedAt: new Date(model.updatedAt)
                }
            });
            totalUpdated++;
        }
        console.log(`   ✅ Updated ${mlModels.length} ML model(s)\n`);

        // 3.5 Upsert statistics cache
        console.log('📈 Updating statistics cache...');
        const statsCache = await localPrisma.statisticsCache.findMany();
        for (const cache of statsCache) {
            await prodPrisma.statisticsCache.upsert({
                where: { key: cache.key },
                update: {
                    data: cache.data,
                    updatedAt: new Date(cache.updatedAt)
                },
                create: {
                    ...cache,
                    createdAt: new Date(cache.createdAt),
                    updatedAt: new Date(cache.updatedAt)
                }
            });
            totalUpdated++;
        }
        console.log(`   ✅ Updated ${statsCache.length} cache(s)\n`);

        // ============================================
        // STEP 4: Check for new systems
        // ============================================
        console.log('[STEP 4/4] 🆕 Checking for new systems...\n');

        const localSystems = await localPrisma.rankedSystem.findMany();
        const prodSystems = await prodPrisma.rankedSystem.findMany();

        const newSystems = localSystems.filter(
            ls => !prodSystems.find(ps => ps.name === ls.name)
        );

        if (newSystems.length > 0) {
            console.log(`⚠️  Found ${newSystems.length} new system(s):`);
            for (const system of newSystems) {
                console.log(`   - ${system.name}`);
            }
            console.log('\n⚠️  WARNING: New systems detected!');
            console.log('   You should run FULL_SYNC to import their complete history.\n');
        } else {
            console.log('✅ No new systems detected\n');
        }

        // ============================================
        // Summary
        // ============================================
        console.log('========================================');
        console.log('✅ INCREMENTAL SYNC COMPLETE!');
        console.log('========================================\n');
        console.log(`📊 Summary:`);
        console.log(`   - New draws: ${newDraws.length}`);
        console.log(`   - Records inserted: ${totalInserted}`);
        console.log(`   - Records updated: ${totalUpdated}`);
        console.log(`   - Total processed: ${totalInserted + totalUpdated}`);
        console.log();

    } catch (error) {
        console.error('\n❌ Error during incremental sync:', error);
        throw error;
    } finally {
        // Disconnect from databases
        if (localPrisma) await localPrisma.$disconnect();
        if (prodPrisma) await prodPrisma.$disconnect();
    }
}

incrementalSync()
    .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
