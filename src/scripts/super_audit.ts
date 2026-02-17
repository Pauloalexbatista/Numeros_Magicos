
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function superAudit() {
    console.log("🕵️ SUPER AUDITORIA DE DADOS\n");

    const games = ['EUROMILLIONS', 'EURODREAMS', 'TOTOLOTO'];

    for (const game of games) {
        console.log(`\n🎮 JOGO: ${game}`);
        const draws = await prisma.draw.findMany({ where: { game } });
        const systems = await prisma.rankedSystem.findMany({ where: { game, isActive: true } });

        console.log(`- Sorteios: ${draws.length}`);
        console.log(`- Sistemas Ativos: ${systems.length}`);

        const expectedTotal = draws.length * systems.length;

        // Contagens reais
        const numSystems = systems.filter(s => s.domain === 'NUMBERS');
        const starSystems = systems.filter(s => s.domain === 'STARS');

        const perfCount = await prisma.systemPerformance.count({ where: { draw: { game } } });
        const starPerfCount = await prisma.starSystemPerformance.count({ where: { draw: { game } } });
        const predCount = await prisma.systemPrediction.count({ where: { draw: { game } } });

        const expectedPerf = draws.length * numSystems.length;
        const expectedStarPerf = draws.length * starSystems.length;
        const expectedPred = draws.length * systems.length;

        console.log(`📊 Performance Números: ${perfCount} / ${expectedPerf} (${perfCount === expectedPerf ? '✅' : '❌'})`);
        console.log(`📊 Performance Estrelas: ${starPerfCount} / ${expectedStarPerf} (${starPerfCount === expectedStarPerf ? '✅' : '❌'})`);
        console.log(`📊 Previsões Históricas: ${predCount} / ${expectedPred} (${predCount === expectedPred ? '✅' : '❌'})`);

        if (perfCount !== expectedPerf || starPerfCount !== expectedStarPerf || predCount !== expectedPred) {
            console.log("   🚩 ALERTA: Existem lacunas residuais!");
        }
    }

    console.log("\n🎯 VERIFICAÇÃO DE CACHE (PREVISÕES PARA O PRÓXIMO SORTEIO)");
    const cachedCount = await prisma.cachedPrediction.count();
    const activeSystemsTotal = await prisma.rankedSystem.count({ where: { isActive: true } });
    console.log(`📊 CachedPrediction: ${cachedCount} / ${activeSystemsTotal} (${cachedCount === activeSystemsTotal ? '✅' : '❌'})`);

    await prisma.$disconnect();
}

superAudit().catch(console.error);
