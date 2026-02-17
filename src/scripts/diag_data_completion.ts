
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function diagnoseFinalReport() {
    console.log("🔍 RELATÓRIO FINAL DE INTEGRIDADE DE DADOS\n");

    const games = ['EUROMILLIONS', 'EURODREAMS', 'TOTOLOTO'];

    for (const game of games) {
        console.log(`\n================================================================================================`);
        console.log(`🎮 JOGO: ${game}`);
        const drawCount = await prisma.draw.count({ where: { game } });
        console.log(`📊 Sorteios Totais: ${drawCount}`);
        console.log(`================================================================================================`);

        const systems = await prisma.rankedSystem.findMany({
            where: { game, isActive: true },
            orderBy: [{ domain: 'asc' }, { name: 'asc' }]
        });

        console.log(`${'Sistema'.padEnd(35)} | ${'Domínio'.padEnd(8)} | ${'Números (Perf)'.padEnd(14)} | ${'Estrelas (Perf)'.padEnd(14)} | ${'Previsões (Hist)'.padEnd(15)}`);
        console.log(`-`.repeat(105));

        for (const system of systems) {
            // Count Numbers Performance
            const numPerfCount = await prisma.systemPerformance.count({
                where: { systemName: system.name, draw: { game } }
            });

            // Count Stars Performance
            const starPerfCount = await prisma.starSystemPerformance.count({
                where: { systemName: system.name, draw: { game } }
            });

            // Count Historical Predictions
            const predictionCount = await prisma.systemPrediction.count({
                where: { systemName: system.name, draw: { game } }
            });

            const prefix = system.domain === 'NUMBERS' ? '🔢' : '🌟';
            const domainLabel = system.domain.padEnd(8);

            const numLabel = String(numPerfCount).padEnd(14);
            const starLabel = String(starPerfCount).padEnd(14);
            const predLabel = String(predictionCount).padEnd(15);

            console.log(`${(prefix + ' ' + system.name).padEnd(35)} | ${domainLabel} | ${numLabel} | ${starLabel} | ${predLabel}`);
        }
    }

    await prisma.$disconnect();
}

diagnoseFinalReport().catch(console.error);
