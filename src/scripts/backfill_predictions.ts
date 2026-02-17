
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function backfillOptimized() {
    console.log("🚀 Iniciando Backfill OTIMIZADO de SystemPrediction...\n");

    const BATCH_SIZE = 500;

    try {
        const numPerfs = await prisma.systemPerformance.findMany();
        const starPerfs = await prisma.starSystemPerformance.findMany();

        const allTasks = [
            ...numPerfs.map(p => ({ type: 'NUMBERS', p })),
            ...starPerfs.map(p => ({ type: 'STARS', p }))
        ];

        console.log(`📊 Total para processar: ${allTasks.length}`);

        for (let i = 0; i < allTasks.length; i += BATCH_SIZE) {
            const batch = allTasks.slice(i, i + BATCH_SIZE);

            await prisma.$transaction(
                batch.map(item => {
                    const { p, type } = item;
                    return prisma.systemPrediction.upsert({
                        where: {
                            drawId_systemName: { drawId: p.drawId, systemName: p.systemName }
                        },
                        update: {},
                        create: {
                            drawId: p.drawId,
                            systemName: p.systemName,
                            prediction: type === 'NUMBERS' ? (p as any).predictedNumbers : (p as any).predictedStars,
                            antiPrediction: "[]",
                            hits: p.hits,
                            antiHits: 0,
                            jackpot: type === 'NUMBERS' ? (p.hits >= 5) : (p.hits >= 2)
                        }
                    });
                })
            );

            console.log(`   - Progresso: ${Math.min(i + BATCH_SIZE, allTasks.length)}/${allTasks.length}`);
        }

        console.log(`\n✨ Concluído com sucesso!`);
    } catch (error) {
        console.error("❌ Erro:", error);
    } finally {
        await prisma.$disconnect();
    }
}

backfillOptimized().catch(console.error);
