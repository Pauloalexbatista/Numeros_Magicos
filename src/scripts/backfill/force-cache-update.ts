import { prisma } from '../../lib/prisma';
import { rankedSystems } from '../../services/ranked-systems';
import { starSystems } from '../../services/star-systems';
import {
    totolotoRankedSystems,
    totolotoStarSystems,
    euroDreamsRankedSystems,
    euroDreamsStarSystems
} from '../../services/ranking';
import { RankedSystem } from '@prisma/client';

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

    // 3. Helper to get instance from name (Robust)
    const resolveSystem = (dbName: string, game: string) => {
        let cleanName = dbName;
        let isAnti = false;

        // Handle Anti-Systems
        if (cleanName.startsWith('Anti-')) {
            cleanName = cleanName.replace('Anti-', '');
            isAnti = true;
        }

        // NO LONGER STRIPPING SUFFIXES: Wrappers now match DB names (e.g. "_EURODREAMS")

        let instance = null;
        let isStars = false;

        // Find in specific game arrays
        if (game === 'EUROMILLIONS') {
            instance = (rankedSystems as any[]).find((s: any) => s.name === cleanName);
            if (!instance) {
                instance = (starSystems as any[]).find((s: any) => s.name === cleanName);
                if (instance) isStars = true;
            }
        } else if (game === 'TOTOLOTO') {
            instance = (totolotoRankedSystems as any[]).find((s: any) => s.name === cleanName);
            if (!instance) {
                instance = (totolotoStarSystems as any[]).find((s: any) => s.name === cleanName);
                if (instance) isStars = true;
            }
        } else if (game === 'EURODREAMS') {
            instance = (euroDreamsRankedSystems as any[]).find((s: any) => s.name === cleanName);
            if (!instance) {
                instance = (euroDreamsStarSystems as any[]).find((s: any) => s.name === cleanName);
                if (instance) isStars = true;
            }
        }

        return instance ? { instance, isStars, isAnti } : null;
    };

    // 4. Update Each System
    let updatedCount = 0;
    let skippedCount = 0;

    for (const dbSys of dbSystems) {
        try {
            const resolved = resolveSystem(dbSys.name, dbSys.game);

            if (!resolved) {
                console.log(`⚠️  System instance not found for: ${dbSys.name}`);
                continue;
            }

            const { instance, isStars, isAnti } = resolved;

            // EXCLUSION: Anti-Systems are removed from this process per user request
            if (isAnti) {
                // console.log(`Skipping Anti-System: ${dbSys.name}`);
                continue;
            }

            // Check if already cached today
            const existing = await prisma.cachedPrediction.findUnique({
                where: { systemName: dbSys.name }
            });

            // Disable cache check to force update
            /*
            if (existing && existing.updatedAt > new Date(Date.now() - 12 * 60 * 60 * 1000)) {
                skippedCount++;
                continue;
            }
            */

            process.stdout.write(`Processing ${dbSys.name}... `);
            const start = performance.now();

            const gameHistory = history.filter(d => d.game === dbSys.game);

            // Generate base prediction
            let prediction: number[] = [];
            const sysInstance = instance as any;

            if (isStars) {
                prediction = await sysInstance.generatePrediction(gameHistory);
            } else {
                // Some systems have generateTop10, others might have predict
                // Prioritize generateTop25 for full prediction caching
                if (sysInstance.generateTop25) {
                    prediction = await sysInstance.generateTop25(gameHistory);
                } else if (sysInstance.generateTop10) {
                    prediction = await sysInstance.generateTop10(gameHistory);
                } else if (sysInstance.predict) {
                    // Adapter for newer interface
                    prediction = await sysInstance.predict(gameHistory);
                } else {
                    console.log(`❌ No prediction method found on instance`);
                    continue;
                }
            }

            // Normalize Count
            let topPrediction = Array.from(new Set(prediction)).slice(0, 25);

            // Correct Pool Calculation
            let maxNum = 50;
            if (dbSys.game === 'TOTOLOTO') maxNum = 49;
            if (dbSys.game === 'EURODREAMS') maxNum = 40;

            if (dbSys.domain === 'STARS') {
                if (dbSys.game === 'EUROMILLIONS') maxNum = 12;
                if (dbSys.game === 'TOTOLOTO') maxNum = 13;
                if (dbSys.game === 'EURODREAMS') maxNum = 5;
            }

            // Generate Inverse (Anti-System)
            if (isAnti) {
                const pool = Array.from({ length: maxNum }, (_, i) => i + 1);
                topPrediction = pool.filter(n => !prediction.includes(n)).slice(0, 25);
            }

            // Generate Worst/Inverse for storage
            const pool = Array.from({ length: maxNum }, (_, i) => i + 1);
            const invertForStorage = pool.filter(n => !topPrediction.includes(n)).slice(0, 25);

            await prisma.cachedPrediction.upsert({
                where: { systemName: dbSys.name },
                update: {
                    numbers: JSON.stringify(topPrediction),
                    worstNumbers: JSON.stringify(invertForStorage),
                    updatedAt: new Date()
                },
                create: {
                    systemName: dbSys.name,
                    numbers: JSON.stringify(topPrediction),
                    worstNumbers: JSON.stringify(invertForStorage)
                }
            });

            const end = performance.now();
            console.log(`✅ Done (${topPrediction.length} nums) in ${(end - start).toFixed(0)}ms`);
            updatedCount++;
        } catch (error) {
            console.log(`❌ Failed ${dbSys.name}: ${error}`);
        }
    }

    console.log(`\n✨ FLASH Update (All Games) Complete! Updated: ${updatedCount}, Skipped: ${skippedCount}`);
}

forceCacheUpdate()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
