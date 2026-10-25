import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

async function purgeSystem() {
    console.log("🧹 Início da purga de 'Mais Atrasados' e 'Mais Atrasados Estrelas'...");

    // 0. Cached Predictions
    const cached = await p.cachedPrediction.deleteMany({
        where: {
            systemName: { in: ['Mais Atrasados', 'Mais Atrasados Estrelas'] }
        }
    });
    console.log(`✅ CachedPrediction: ${cached.count} registos eliminados.`);

    // 1. Delete from SystemPrediction
    const deletedPredictions = await p.systemPrediction.deleteMany({
        where: {
            systemName: { in: ['Mais Atrasados', 'Mais Atrasados Estrelas'] }
        }
    });
    console.log(`✅ SystemPrediction: ${deletedPredictions.count} registos eliminados.`);

    // 2. Delete from SystemRanking
    const deletedRankings = await p.systemRanking.deleteMany({
        where: {
            systemName: { in: ['Mais Atrasados', 'Mais Atrasados Estrelas'] }
        }
    });
    console.log(`✅ SystemRanking: ${deletedRankings.count} registos eliminados.`);

    // 3. Delete from StarPerformances if exists
    try {
        const starPerf = await p.starPerformance.deleteMany({
            where: {
                systemName: { in: ['Mais Atrasados', 'Mais Atrasados Estrelas'] }
            }
        });
        console.log(`✅ StarPerformance: ${starPerf.count} registos eliminados.`);
    } catch (e) {}

    // 4. Delete from SystemPerformance if exists
    try {
        const sysPerf = await p.systemPerformance.deleteMany({
            where: {
                systemName: { in: ['Mais Atrasados', 'Mais Atrasados Estrelas'] }
            }
        });
        console.log(`✅ SystemPerformance: ${sysPerf.count} registos eliminados.`);
    } catch (e) {}

    // 5. Delete from RankedSystem
    const deletedSystems = await p.rankedSystem.deleteMany({
        where: {
            name: { in: ['Mais Atrasados', 'Mais Atrasados Estrelas'] }
        }
    });
    console.log(`✅ RankedSystem: ${deletedSystems.count} registos eliminados.`);

    console.log("✨ Purga concluída com sucesso absoluto!");
}

purgeSystem().finally(() => p.$disconnect());
