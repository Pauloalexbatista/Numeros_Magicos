
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

// Directory containing the Static JSONs
const STATIC_DIR = path.join(process.cwd(), 'src/data/static');

async function main() {
    console.log('🔄 SYNC: Starting Synchronization from Static JSONs to DB...');

    try {
        // 1. Sync Rankings Metrics (Lightweight)
        await syncRankings();

        // 2. Sync System Performances (Heavyweight)
        await syncPerformances();

    } catch (error) {
        console.error('❌ Fatal Error during sync:', error);
    } finally {
        await prisma.$disconnect();
    }
}

async function syncRankings() {
    console.log('\n📊 Syncing System Rankings...');
    try {
        const filePath = path.join(STATIC_DIR, 'rankings-metrics.json');
        const content = await fs.readFile(filePath, 'utf-8');
        const rankings = JSON.parse(content);

        console.log(`   > Found ${rankings.length} systems in rankings-metrics.json`);

        for (const rank of rankings) {
            // Upsert RankedSystem
            await prisma.rankedSystem.upsert({
                where: { name: rank.systemName },
                update: { description: rank.description },
                create: {
                    name: rank.systemName,
                    description: rank.description,
                    isActive: true
                }
            });

            // Upsert SystemRanking
            await prisma.systemRanking.upsert({
                where: { systemName: rank.systemName },
                update: {
                    avgAccuracy: rank.accuracy,
                    totalPredictions: rank.totalPredictions,
                    lastUpdated: new Date()
                },
                create: {
                    systemName: rank.systemName,
                    avgAccuracy: rank.accuracy,
                    totalPredictions: rank.totalPredictions,
                    lastUpdated: new Date()
                }
            });
        }
        console.log('   ✅ Rankings Synced!');

    } catch (error) {
        console.error('   ❌ Failed to sync rankings:', error);
    }
}

async function syncPerformances() {
    console.log('\n📈 Syncing System Performances (Deep History)...');

    // Get all files in static dir
    const files = await fs.readdir(STATIC_DIR);
    const detailFiles = files.filter(f => f.startsWith('system-detail-') && f.endsWith('.json'));

    console.log(`   > Found ${detailFiles.length} detail files.`);

    // Pre-fetch Draws to Map<DateString, DrawID> to avoid N+1 queries
    console.log('   > Loading Draw Map...');
    const allDraws = await prisma.draw.findMany({ select: { id: true, date: true } });
    const drawMap = new Map<string, number>();
    allDraws.forEach(d => {
        const dateStr = d.date.toISOString().split('T')[0]; // YYYY-MM-DD
        drawMap.set(dateStr, d.id);
    });
    console.log(`   > Loaded ${drawMap.size} draws.`);

    for (const file of detailFiles) {
        try {
            const content = await fs.readFile(path.join(STATIC_DIR, file), 'utf-8');
            const data = JSON.parse(content);
            const systemName = data.metadata.name;

            console.log(`   👉 Processing ${systemName}...`);

            // Optimization: Delete existing performance for this system to avoid slow individual upserts?
            // Or use upsert loop? Upsert is safer but slower. 
            // Given "update existing DB", upsert is better.

            let syncedCount = 0;
            const history = data.history.slice(0, 500); // Limit to last 500 draws per system

            for (const item of history) {
                const itemDateStr = new Date(item.date).toISOString().split('T')[0];
                const drawId = drawMap.get(itemDateStr);

                if (!drawId) {
                    // Draw missing in DB, cannot insert performance
                    continue;
                }

                await prisma.systemPerformance.upsert({
                    where: {
                        // We don't have a unique constraint on (drawId, systemName)? 
                        // Wait, schema check: @@index([drawId]), @@index([systemName]).
                        // No @@unique!
                        // However, SystemPrediction has @@unique([drawId, systemName]).
                        // SystemPerformance relies on ID. 
                        // We must findFirst before upsert logic or just create if not exists.
                        // Actually, standard prisma upsert needs a unique where.
                        // If no unique constraint, we have a problem.
                        // Let's check schema lines 160-163. No unique.

                        // Workaround: deleteMany for this draw+system, then create.
                        id: item.id // Use the ID from the JSON if it matches? 
                        // No, ID in JSON is from Local DB. Production DB IDs might differ!
                        // DO NOT USE JSON ID.
                    },
                    // Since we can't key by (drawId, systemName), we must do findFirst
                    update: {
                        predictedNumbers: JSON.stringify(item.predictedNumbers),
                        actualNumbers: JSON.stringify(item.drawNumbers),
                        hits: item.hits,
                        accuracy: (item.hits / 5) * 100
                    },
                    create: {
                        drawId: drawId,
                        systemName: systemName,
                        predictedNumbers: JSON.stringify(item.predictedNumbers),
                        actualNumbers: JSON.stringify(item.drawNumbers),
                        hits: item.hits,
                        accuracy: (item.hits / 5) * 100
                    }
                }).catch(async (e) => {
                    // Fallback manual find since upsert requires unique
                    const existing = await prisma.systemPerformance.findFirst({
                        where: { drawId, systemName }
                    });

                    if (existing) {
                        await prisma.systemPerformance.update({
                            where: { id: existing.id },
                            data: {
                                predictedNumbers: JSON.stringify(item.predictedNumbers),
                                actualNumbers: JSON.stringify(item.drawNumbers),
                                hits: item.hits,
                                accuracy: (item.hits / 5) * 100
                            }
                        });
                    } else {
                        await prisma.systemPerformance.create({
                            data: {
                                drawId,
                                systemName,
                                predictedNumbers: JSON.stringify(item.predictedNumbers),
                                actualNumbers: JSON.stringify(item.drawNumbers),
                                hits: item.hits,
                                accuracy: (item.hits / 5) * 100
                            }
                        });
                    }
                });

                syncedCount++;
            }
            // console.log(`      Synced ${syncedCount} records.`);

        } catch (err) {
            console.error(`      ❌ Error processing ${file}:`, err);
        }
    }
    console.log('   ✅ Performances Synced!');
}

main();
