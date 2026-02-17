
import { PrismaClient } from '@prisma/client';
import { evaluateDraw, evaluateDrawStars, updateRanking, updateStarRankings, cachePredictions } from '../services/ranking';

const prisma = new PrismaClient();

async function surgicalBackfill() {
    console.log("🚀 INICIANDO BACKFILL CIRÚRGICO (POR SISTEMA/SORTEIO)...\n");

    const activeSystems = await prisma.rankedSystem.findMany({ where: { isActive: true } });
    console.log(`📋 Sistemas Ativos: ${activeSystems.length}`);

    for (const system of activeSystems) {
        console.log(`\n🔍 Verificando: ${system.name} (${system.game})`);

        const draws = await prisma.draw.findMany({ where: { game: system.game } });

        // Encontrar draws que NÃO têm performance para ESTE sistema
        let missingDrawIds: number[] = [];

        if (system.domain === 'NUMBERS') {
            const perfs = await prisma.systemPerformance.findMany({
                where: { systemName: system.name },
                select: { drawId: true }
            });
            const existingIds = new Set(perfs.map(p => p.drawId));
            missingDrawIds = draws.filter(d => !existingIds.has(d.id)).map(d => d.id);
        } else {
            const perfs = await prisma.starSystemPerformance.findMany({
                where: { systemName: system.name },
                select: { drawId: true }
            });
            const existingIds = new Set(perfs.map(p => p.drawId));
            missingDrawIds = draws.filter(d => !existingIds.has(d.id)).map(d => d.id);
        }

        if (missingDrawIds.length > 0) {
            console.log(`   🚩 Faltam ${missingDrawIds.length} performances. Preenchendo...`);
            // Processar em chunks para não saturar
            for (const drawId of missingDrawIds) {
                if (system.domain === 'NUMBERS') {
                    await evaluateDraw(drawId);
                } else {
                    await evaluateDrawStars(drawId);
                }
            }
            console.log(`   ✅ Concluído para ${system.name}`);
        } else {
            console.log(`   ✅ 100% Completo.`);
        }
    }

    console.log("\n📊 Finalizando (Rankings e Cache)...");
    await updateRanking();
    await updateStarRankings();
    await cachePredictions();

    console.log("\n✨ BACKFILL CIRÚRGICO CONCLUÍDO!");
    await prisma.$disconnect();
}

surgicalBackfill().catch(console.error);
