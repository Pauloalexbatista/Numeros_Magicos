import { prisma } from '../../lib/prisma';
import { rankedSystems } from '../../services/ranked-systems';
import { starSystems } from '../../services/star-systems';
import {
    totolotoRankedSystems,
    totolotoStarSystems,
    euroDreamsRankedSystems,
    euroDreamsStarSystems
} from '../../services/ranking';

async function forceCacheUpdate() {
    console.log('⚡ Starting FLASH Cache Update (All Games)...');

    // 1. Get History
    const history = await prisma.draw.findMany({
        orderBy: { date: 'desc' }
    });
    console.log(`📚 History loaded: ${history.length} draws`);

    // 2. Identify All Active Systems from DB
    const dbSystems = await prisma.rankedSystem.findMany({
        where: { isActive: true }
    });
    console.log(`🔍 Found ${dbSystems.length} active systems in DB`);

    // 3. Helper to get instance from name
    const getInstance = (name: string) => {
        // Search in all game groups
        const em = (rankedSystems as any[]).find((s: any) => s.name === name);
        if (em) return { instance: em, isStars: false };

        const emStars = (starSystems as any[]).find((s: any) => s.name === name);
        if (emStars) return { instance: emStars, isStars: true };

        const tl = (totolotoRankedSystems as any[]).find((s: any) => s.name === name);
        if (tl) return { instance: tl, isStars: false };

        const tlStars = (totolotoStarSystems as any[]).find((s: any) => s.name === name);
        if (tlStars) return { instance: tlStars, isStars: true };

        const ed = (euroDreamsRankedSystems as any[]).find((s: any) => s.name === name);
        if (ed) return { instance: ed, isStars: false };

        const edStars = (euroDreamsStarSystems as any[]).find((s: any) => s.name === name);
        if (edStars) return { instance: edStars, isStars: true };

        return null;
    };

    // 4. Update Each System
    for (const dbSys of dbSystems) {
        try {
            const system = getInstance(dbSys.name);
            if (!system) {
                console.log(`⚠️  System instance not found for: ${dbSys.name}`);
                continue;
            }

            // Check if already cached today
            const existing = await prisma.cachedPrediction.findUnique({
                where: { systemName: dbSys.name }
            });

            if (existing && existing.updatedAt > new Date(Date.now() - 12 * 60 * 60 * 1000)) {
                // console.log(`⏩ Skipping ${dbSys.name} (Updated recently)`);
                continue;
            }

            process.stdout.write(`Processing ${dbSys.name}... `);
            const start = performance.now();

            const gameHistory = history.filter(d => d.game === dbSys.game);

            // Generate prediction
            const prediction = system.isStars
                ? await (system.instance as any).generatePrediction(gameHistory)
                : await (system.instance as any).generateTop10(gameHistory);

            const topPrediction = Array.from(new Set(prediction)).slice(0, 25);

            // Pool for worst numbers
            const maxNum = dbSys.domain === 'STARS'
                ? (dbSys.game === 'TOTOLOTO' ? 13 : dbSys.game === 'EURODREAMS' ? 5 : 12)
                : (dbSys.game === 'TOTOLOTO' ? 49 : dbSys.game === 'EURODREAMS' ? 40 : 50);

            const pool = Array.from({ length: maxNum }, (_, i) => i + 1);
            const worstNumbers = pool.filter(n => !topPrediction.includes(n)).slice(0, 25);

            await prisma.cachedPrediction.upsert({
                where: { systemName: dbSys.name },
                update: {
                    numbers: JSON.stringify(topPrediction),
                    worstNumbers: JSON.stringify(worstNumbers),
                    updatedAt: new Date()
                },
                create: {
                    systemName: dbSys.name,
                    numbers: JSON.stringify(topPrediction),
                    worstNumbers: JSON.stringify(worstNumbers)
                }
            });

            const end = performance.now();
            console.log(`✅ Done in ${(end - start).toFixed(0)}ms`);
        } catch (error) {
            console.log(`❌ Failed ${dbSys.name}: ${error}`);
        }
    }

    console.log('\n✨ FLASH Update (All Games) Complete!');
}

forceCacheUpdate()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
