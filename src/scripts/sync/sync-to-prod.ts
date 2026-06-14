import { PrismaClient } from '@prisma/client';
import { EuroMillionsService } from '../../services/euroMillionsService';
import { TotolotoService } from '../../services/totolotoService';
import { EuroDreamsService } from '../../services/euroDreamsService';
import * as dotenv from 'dotenv';

dotenv.config();

const localPrisma = new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } }
});

// Since we generated the prod client to a specific folder, we should try to use it
let prodPrisma: any;
try {
    const { PrismaClient: ProdClient } = require('@prisma/client-prod');
    const prodUrl = process.env.POSTGRES_URL_PROD + (process.env.POSTGRES_URL_PROD?.includes('?') ? '&' : '?') + 'connection_limit=1';
    prodPrisma = new ProdClient({
        datasources: { db: { url: prodUrl } }
    });
} catch (e) {
    prodPrisma = new PrismaClient({
        datasources: { db: { url: process.env.POSTGRES_URL_PROD } }
    });
}

async function syncDraws(game: string) {
    console.log(`\n🔄 Syncing ${game} draws...`);

    const latestProdDraw = await prodPrisma.draw.findFirst({
        where: { game: game as any },
        orderBy: { date: 'desc' }
    });

    const minDate = latestProdDraw ? latestProdDraw.date : new Date('2000-01-01');
    console.log(`   Production is up to: ${minDate.toISOString().split('T')[0]}`);

    const missingDraws = await localPrisma.draw.findMany({
        where: {
            game: game as any,
            date: { gt: minDate }
        },
        orderBy: { date: 'asc' }
    });

    if (missingDraws.length === 0) {
        console.log(`   ✅ Production is already up to date.`);
        return;
    }

    console.log(`   🚀 Pushing ${missingDraws.length} new draws...`);

    for (const draw of missingDraws) {
        const data = {
            ...draw,
            id: undefined, // Let DB generate ID
            numbers: draw.numbers,
            stars: draw.stars,
            numbersDrawOrder: draw.numbersDrawOrder,
            starsDrawOrder: draw.starsDrawOrder,
        };

        const upserted = await prodPrisma.draw.upsert({
            where: {
                game_date: {
                    game: draw.game,
                    date: draw.date
                }
            },
            update: data as any,
            create: data as any
        });

        // --- SYNC SystemPredictions for this draw ---
        const localPreds = await localPrisma.systemPrediction.findMany({
            where: { drawId: draw.id }
        });

        for (const pred of localPreds) {
            await prodPrisma.systemPrediction.upsert({
                where: {
                    drawId_systemName: {
                        drawId: upserted.id,
                        systemName: pred.systemName
                    }
                },
                update: { ...pred, id: undefined, drawId: upserted.id } as any,
                create: { ...pred, id: undefined, drawId: upserted.id } as any
            });
        }

        console.log(`   ✅ Pushed draw and predictions: ${draw.date.toISOString().split('T')[0]}`);
    }
}

async function syncRankings() {
    console.log(`\n📊 Syncing all rankings...`);

    // Number Rankings
    const localRankings = await localPrisma.systemRanking.findMany();
    for (const rank of localRankings) {
        const data = {
            game: rank.game,
            systemName: rank.systemName,
            avgAccuracy: rank.avgAccuracy,
            totalPredictions: rank.totalPredictions,
            lastUpdated: rank.lastUpdated
        };
        await prodPrisma.systemRanking.upsert({
            where: {
                systemName_game: {
                    systemName: rank.systemName,
                    game: rank.game
                }
            },
            update: data,
            create: data
        });
    }

    // Star Rankings
    const localStarRankings = await localPrisma.starSystemRanking.findMany();
    for (const rank of localStarRankings) {
        const data = {
            game: rank.game,
            systemName: rank.systemName,
            avgAccuracy: rank.avgAccuracy,
            totalPredictions: rank.totalPredictions,
            totalHits: rank.totalHits,
            jackpots: rank.jackpots,
            lastUpdated: rank.lastUpdated
        };
        await prodPrisma.starSystemRanking.upsert({
            where: {
                systemName_game: {
                    systemName: rank.systemName,
                    game: rank.game
                }
            },
            update: data,
            create: data
        });
    }

    console.log(`   ✅ Rankings synced.`);
}

async function syncCachedPredictions() {
    console.log(`\n🔮 Syncing all cached predictions (Dashboard)...`);

    const localPredictions = await localPrisma.cachedPrediction.findMany();
    console.log(`   Found ${localPredictions.length} local predictions to sync.`);

    for (const pred of localPredictions) {
        try {
            const data = {
                game: pred.game,
                systemName: pred.systemName,
                numbers: typeof pred.numbers === 'string' ? pred.numbers : JSON.stringify(pred.numbers),
                worstNumbers: typeof pred.worstNumbers === 'string' ? pred.worstNumbers : JSON.stringify(pred.worstNumbers),
                updatedAt: pred.updatedAt
            };
            await prodPrisma.cachedPrediction.upsert({
                where: {
                    systemName_game: {
                        systemName: pred.systemName,
                        game: pred.game
                    }
                },
                update: data,
                create: data
            });
            console.log(`   ✅ Synced: ${pred.systemName}`);
        } catch (e: any) {
            console.error(`   ❌ Failed to sync prediction for: ${pred.systemName}`);
            console.error(`      Reason: ${e.message}`);
            throw e;
        }
    }
    console.log(`   ✅ All cached predictions synced.`);
}

async function syncRankedSystems() {
    console.log(`\n⚙️ Syncing Ranked Systems definition...`);
    const localSystems = await localPrisma.rankedSystem.findMany();
    console.log(`   Found ${localSystems.length} systems to sync.`);
    for (const sys of localSystems) {
        try {
            const data = {
                game: sys.game,
                name: sys.name,
                isActive: sys.isActive,
                description: sys.description,
                systemType: sys.systemType,
                domain: sys.domain,
                dependencies: sys.dependencies,
                complexity: sys.complexity,
                priority: sys.priority
            };
            await prodPrisma.rankedSystem.upsert({
                where: {
                    name_game: {
                        name: sys.name,
                        game: sys.game
                    }
                },
                update: data,
                create: data
            });
            process.stdout.write("."); // Compact progress indicator
        } catch (e: any) {
            console.error(`\n   ❌ Failed to sync ranked system: ${sys.name}`);
            console.error(`      Error:`, e);
            throw e;
        }
    }
    console.log(`\n   ✅ Systems synced.`);
}

async function main() {
    console.log("🚀 Starting Local-to-Prod Synchronization...");

    const emService = new EuroMillionsService();
    const ttService = new TotolotoService();
    const edService = new EuroDreamsService();

    // 1. Update Local DB First
    console.log("\n--- STEP 1: Updating Local Database (Skipped for Test) ---");
    /*
    try {
        console.log("🔄 Updating EuroMillions...");
        await emService.updateDatabase();
        console.log("🔄 Updating Totoloto...");
        await ttService.updateDatabase();
        console.log("🔄 Updating EuroDreams...");
        await edService.updateDatabase();
    } catch (e: any) {
        console.error("❌ Local Update Failed:", e.message);
        throw e;
    }
    */

    // 2. Push Delta to Prod
    console.log("\n--- STEP 2: Pushing Delta to Production ---");

    await syncRankedSystems();

    const games = ['EUROMILLIONS', 'TOTOLOTO', 'EURODREAMS'];

    for (const game of games) {
        await syncDraws(game);
    }

    await syncRankings();
    await syncCachedPredictions();

    console.log("\n✨ Synchronization Complete!");
}

main()
    .catch(e => {
        console.error("\n❌ Sync failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await localPrisma.$disconnect();
        await prodPrisma.$disconnect();
    });
