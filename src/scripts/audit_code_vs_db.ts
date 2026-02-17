
import { PrismaClient } from '@prisma/client';
import {
    rankedSystems,
    starSystems,
    totolotoRankedSystems,
    totolotoStarSystems,
    euroDreamsRankedSystems,
    euroDreamsStarSystems
} from '../services/ranking';

const prisma = new PrismaClient();

async function auditCodeVsDb() {
    console.log("🔍 AUDIT: CODE DEFINITIONS VS DATABASE RECORDS\n");

    const gameConfigs = [
        {
            game: 'EUROMILLIONS',
            codeNumbers: rankedSystems.map(s => s.name),
            codeStars: starSystems.map(s => s.name)
        },
        {
            game: 'EURODREAMS',
            codeNumbers: euroDreamsRankedSystems.map(s => s.name),
            codeStars: euroDreamsStarSystems.map(s => s.name)
        },
        {
            game: 'TOTOLOTO',
            codeNumbers: totolotoRankedSystems.map(s => s.name),
            codeStars: totolotoStarSystems.map(s => s.name)
        }
    ];

    for (const config of gameConfigs) {
        console.log(`\n🎮 JOGO: ${config.game}`);
        const dbSystems = await prisma.rankedSystem.findMany({ where: { game: config.game } });

        const expectedTotal = config.codeNumbers.length + config.codeStars.length;
        console.log(`- Código: ${config.codeNumbers.length} (Num) + ${config.codeStars.length} (Star) = ${expectedTotal}`);
        console.log(`- Banco: ${dbSystems.length}`);

        const allCodeSystems = [...config.codeNumbers, ...config.codeStars];
        const missingInDb = allCodeSystems.filter(name => !dbSystems.some(db => db.name === name));
        const inactiveInDb = dbSystems.filter(db => allCodeSystems.includes(db.name) && !db.isActive);

        if (missingInDb.length > 0) {
            console.log("❌ MISSING IN DB:", missingInDb);
        } else {
            console.log("✅ All code systems exist in DB.");
        }

        if (inactiveInDb.length > 0) {
            console.log("⚠️ INACTIVE IN DB:", inactiveInDb.map(i => i.name));
        }
    }

    await prisma.$disconnect();
}

auditCodeVsDb().catch(console.error);
