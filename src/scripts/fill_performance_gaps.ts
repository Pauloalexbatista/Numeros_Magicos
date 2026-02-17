
import { PrismaClient } from '@prisma/client';
import { evaluateDraw, evaluateDrawStars, updateRanking, updateStarRankings, cachePredictions } from '../services/ranking';

const prisma = new PrismaClient();

async function fillGaps() {
    console.log("🚀 Iniciando preenchimento de lacunas de performance...\n");

    const games = ['EUROMILLIONS', 'EURODREAMS', 'TOTOLOTO'];

    for (const game of games) {
        console.log(`\n🎮 JOGO: ${game}`);

        // 1. Encontrar sorteios que faltam performance de números
        const drawsMissingNumbers = await prisma.draw.findMany({
            where: {
                game,
                systemPerformances: {
                    none: {}
                }
            },
            orderBy: { date: 'asc' }
        });

        // 2. Encontrar sorteios que faltam performance de estrelas
        const drawsMissingStars = await prisma.draw.findMany({
            where: {
                game,
                starPerformances: {
                    none: {}
                }
            },
            orderBy: { date: 'asc' }
        });

        const allMissingIds = new Set([
            ...drawsMissingNumbers.map(d => d.id),
            ...drawsMissingStars.map(d => d.id)
        ]);

        console.log(`   - Encontrados ${allMissingIds.size} sorteios com falhas.`);

        const sortedIds = Array.from(allMissingIds).sort((a, b) => a - b);

        for (const drawId of sortedIds) {
            console.log(`   🔸 Processando Draw #${drawId}...`);
            try {
                await evaluateDraw(drawId);
                await evaluateDrawStars(drawId);
            } catch (err) {
                console.error(`   ❌ Erro no Draw #${drawId}:`, err);
            }
        }
    }

    console.log("\n📊 Atualizando Rankings...");
    await updateRanking();
    await updateStarRankings();

    console.log("\n🎯 Atualizando Cache de Previsões...");
    await cachePredictions();

    console.log("\n✅ Processo concluído com sucesso!");

    await prisma.$disconnect();
}

fillGaps().catch(console.error);
