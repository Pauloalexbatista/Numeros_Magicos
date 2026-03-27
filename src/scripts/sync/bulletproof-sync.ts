import * as dotenv from 'dotenv';
const Database = require('better-sqlite3');

dotenv.config();

// Load the production client (Assuming npm run db:prod:generate was run)
let ProdClient: any;
try {
    ProdClient = require('@prisma/client-prod').PrismaClient;
} catch (e) {
    console.error("❌ Production Prisma Client not found. Please run 'npm run db:prod:generate' first.");
    process.exit(1);
}

const prodUrl = process.env.POSTGRES_URL_PROD + (process.env.POSTGRES_URL_PROD?.includes('?') ? '&' : '?') + 'connection_limit=1';
const prodPrisma = new ProdClient({
    datasources: { db: { url: prodUrl } }
});

const localDb = new Database('./prisma/dev.db', { readonly: true });

async function syncRankedSystems() {
    console.log(`\n⚙️ Syncing Ranked Systems...`);
    const localSystems = localDb.prepare('SELECT * FROM ranked_systems').all();
    console.log(`   Found ${localSystems.length} systems.`);

    for (const sys of localSystems) {
        const data = {
            game: sys.game,
            name: sys.name,
            isActive: sys.isActive === 1,
            description: sys.description,
            systemType: sys.systemType,
            domain: sys.domain,
            dependencies: sys.dependencies,
            complexity: sys.complexity,
            priority: sys.priority
        };
        await prodPrisma.rankedSystem.upsert({
            where: { name: sys.name },
            update: data,
            create: data
        });
    }
    console.log(`   ✅ Systems synced.`);
}

async function syncDraws() {
    console.log(`\n🔄 Syncing Draws...`);

    const games = ['EUROMILLIONS', 'TOTOLOTO', 'EURODREAMS'];

    for (const game of games) {
        const latestProdDraw = await prodPrisma.draw.findFirst({
            where: { game },
            orderBy: { date: 'desc' }
        });

        const minDateStr = latestProdDraw ? latestProdDraw.date.toISOString().split('T')[0] : '2000-01-01';
        const minTimestamp = latestProdDraw ? latestProdDraw.date.getTime() : 0;
        console.log(`   [${game}] Production up to: ${minDateStr}`);

        // SQLite date might be stored as timestamp or string depending on how it was inserted
        const missingDraws = localDb.prepare('SELECT * FROM Draw WHERE game = ? AND (date > ? OR date > ?) ORDER BY date ASC').all(game, minTimestamp, minDateStr);

        if (missingDraws.length === 0) {
            console.log(`   [${game}] ✅ Already up to date.`);
            continue;
        }

        console.log(`   [${game}] 🚀 Pushing ${missingDraws.length} new draws...`);
        for (const draw of missingDraws) {
            const data = {
                game: draw.game,
                date: new Date(draw.date),
                numbers: (typeof draw.numbers === "string" ? JSON.parse(draw.numbers) : draw.numbers),
                stars: (typeof draw.stars === "string" ? JSON.parse(draw.stars) : draw.stars),
                numbersDrawOrder: JSON.parse(draw.numbersDrawOrder || '[]'),
                starsDrawOrder: JSON.parse(draw.starsDrawOrder || '[]'),
                jackpot: draw.jackpot,
                hasWinner: draw.hasWinner === 1
            };

            const upserted = await prodPrisma.draw.upsert({
                where: { game_date: { game: draw.game, date: data.date } },
                update: data,
                create: data
            });

            // Sync predictions for this draw
            const localPreds = localDb.prepare('SELECT * FROM SystemPrediction WHERE drawId = ?').all(draw.id);
            for (const pred of localPreds) {
                await prodPrisma.systemPrediction.upsert({
                    where: { drawId_systemName: { drawId: upserted.id, systemName: pred.systemName } },
                    update: {
                        drawId: upserted.id,
                        systemName: pred.systemName,
                        predictedNumbers: pred.predictedNumbers,
                        hits: pred.hits,
                        accuracy: pred.accuracy
                    },
                    create: {
                        drawId: upserted.id,
                        systemName: pred.systemName,
                        predictedNumbers: pred.predictedNumbers,
                        hits: pred.hits,
                        accuracy: pred.accuracy
                    }
                });
            }
            console.log(`      ✅ Pushed: ${draw.date}`);
        }
    }
}

async function syncRankings() {
    console.log(`\n📊 Syncing Rankings...`);

    const numberRankings = localDb.prepare('SELECT * FROM system_ranking').all();
    for (const rank of numberRankings) {
        await prodPrisma.systemRanking.upsert({
            where: { systemName: rank.systemName },
            update: { avgAccuracy: rank.avgAccuracy, totalPredictions: rank.totalPredictions, lastUpdated: new Date() },
            create: { systemName: rank.systemName, avgAccuracy: rank.avgAccuracy, totalPredictions: rank.totalPredictions }
        });
    }

    const starRankings = localDb.prepare('SELECT * FROM star_system_ranking').all();
    for (const rank of starRankings) {
        await prodPrisma.starSystemRanking.upsert({
            where: { systemName: rank.systemName },
            update: { avgAccuracy: rank.avgAccuracy, totalPredictions: rank.totalPredictions, totalHits: rank.totalHits, jackpots: rank.jackpots },
            create: { systemName: rank.systemName, avgAccuracy: rank.avgAccuracy, totalPredictions: rank.totalPredictions, totalHits: rank.totalHits, jackpots: rank.jackpots }
        });
    }
    console.log(`   ✅ Rankings synced.`);
}

async function syncCachedPredictions() {
    console.log(`\n🔮 Syncing Cached Predictions...`);
    const cached = localDb.prepare('SELECT * FROM cached_predictions').all();
    for (const pred of cached) {
        await prodPrisma.cachedPrediction.upsert({
            where: { systemName: pred.systemName },
            update: { numbers: pred.numbers, worstNumbers: pred.worstNumbers, updatedAt: new Date() },
            create: { systemName: pred.systemName, numbers: pred.numbers, worstNumbers: pred.worstNumbers }
        });
    }
    console.log(`   ✅ Predictions synced.`);
}

async function syncPerformance() {
    console.log(`\n📈 Syncing Performance Metrics...`);

    // System Performance (Numbers)
    console.log(`   - Syncing System Performance (Numbers)...`);
    const localPerf = localDb.prepare('SELECT p.*, d.game, d.date FROM system_performance p JOIN Draw d ON p.drawId = d.id').all();
    console.log(`     Found ${localPerf.length} entries to sync.`);

    for (let i = 0; i < localPerf.length; i += 100) {
        const batch = localPerf.slice(i, i + 100);
        await Promise.all(batch.map(async (p: any) => {
            try {
                const prodDraw = await prodPrisma.draw.findFirst({
                    where: { game: p.game, date: new Date(p.date) }
                });

                if (prodDraw) {
                    // Delete existing to avoid duplicates (safest for Postgres without unique constraint)
                    await prodPrisma.systemPerformance.deleteMany({
                        where: { drawId: prodDraw.id, systemName: p.systemName }
                    });

                    await prodPrisma.systemPerformance.create({
                        data: {
                            drawId: prodDraw.id,
                            systemName: p.systemName,
                            predictedNumbers: p.predictedNumbers,
                            actualNumbers: p.actualNumbers,
                            hits: p.hits,
                            accuracy: p.accuracy
                        }
                    });
                }
            } catch (err) {
                console.error(`\n      ❌ Error:`, (err as any).message);
            }
        }));
        process.stdout.write(`\r     Progress: ${Math.min(i + 100, localPerf.length)}/${localPerf.length}`);
    }
    console.log(`\n     ✅ System Performance synced.`);

    // Star System Performance
    console.log(`   - Syncing Star System Performance...`);
    const localStarPerf = localDb.prepare('SELECT p.*, d.game, d.date FROM star_system_performance p JOIN Draw d ON p.drawId = d.id').all();
    console.log(`     Found ${localStarPerf.length} entries to sync.`);

    for (let i = 0; i < localStarPerf.length; i += 100) {
        const batch = localStarPerf.slice(i, i + 100);
        await Promise.all(batch.map(async (p: any) => {
            try {
                const prodDraw = await prodPrisma.draw.findFirst({
                    where: { game: p.game, date: new Date(p.date) }
                });

                if (prodDraw) {
                    await prodPrisma.starSystemPerformance.deleteMany({
                        where: { drawId: prodDraw.id, systemName: p.systemName }
                    });

                    await prodPrisma.starSystemPerformance.create({
                        data: {
                            drawId: prodDraw.id,
                            systemName: p.systemName,
                            predictedStars: p.predictedStars,
                            actualStars: p.actualStars,
                            hits: p.hits
                        }
                    });
                }
            } catch (err) {
                console.error(`\n      ❌ Error:`, (err as any).message);
            }
        }));
        process.stdout.write(`\r     Progress: ${Math.min(i + 100, localStarPerf.length)}/${localStarPerf.length}`);
    }
    console.log(`\n     ✅ Star System Performance synced.`);
}

async function main() {
    console.log("🚀 BULLETPROOF SYNC: Local -> Production");
    try {
        await syncRankedSystems();
        await syncDraws();
        await syncRankings();
        await syncCachedPredictions();
        // Performance sync is intensive, so we keep it separate and optional if needed
        // but for now, we run it to ensure the "missing calculations" are fixed.
        await syncPerformance();
        console.log("\n✨ SUCCESS: Production is now synchronized!");
    } catch (e) {
        console.error("\n❌ FATAL ERROR:", e);
        process.exit(1);
    } finally {
        localDb.close();
        await prodPrisma.$disconnect();
    }
}

main();
