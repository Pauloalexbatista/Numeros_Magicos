import { prisma } from '@/lib/prisma';
import { rankedSystems, getMaxNumber } from '@/services/ranked-systems';

/**
 * Backfill all systems that have less than 100 predictions
 */

async function backfillMissingSystems() {
    console.log('🔄 BACKFILL: Sistemas com histórico incompleto\n');
    console.log('═'.repeat(80));

    // Get all systems with their counts
    const systemCounts: { name: string; count: number }[] = [];

    for (const system of rankedSystems) {
        const count = await prisma.systemPrediction.count({
            where: { systemName: system.name }
        });
        systemCounts.push({ name: system.name, count });
    }

    // Filter systems that need backfill (< 100 predictions)
    const needsBackfill = systemCounts.filter(s => s.count < 100);

    console.log(`\n📊 Sistemas a processar: ${needsBackfill.length}/${rankedSystems.length}\n`);

    if (needsBackfill.length === 0) {
        console.log('✅ Todos os sistemas já têm histórico completo!');
        await prisma.$disconnect();
        return;
    }

    // Get all draws
    const allDraws = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        select: { id: true, date: true, numbers: true }
    });

    const minHistory = 50;
    const totalDrawsToProcess = allDraws.length - minHistory;

    console.log(`Total de sorteios disponíveis: ${allDraws.length}`);
    console.log(`Sorteios a processar por sistema: ${totalDrawsToProcess}\n`);

    // Process each system
    for (let sysIdx = 0; sysIdx < needsBackfill.length; sysIdx++) {
        const systemInfo = needsBackfill[sysIdx];
        const system = rankedSystems.find(s => s.name === systemInfo.name);

        if (!system) continue;

        console.log(`\n[${sysIdx + 1}/${needsBackfill.length}] 📊 ${system.name}`);
        console.log('─'.repeat(80));

        // Clear existing predictions
        await prisma.systemPrediction.deleteMany({
            where: { systemName: system.name }
        });

        const predictions: any[] = [];
        let processed = 0;

        for (let i = 0; i < allDraws.length - minHistory; i++) {
            const history = allDraws.slice(i + 1, i + minHistory + 1);
            const actualDraw = allDraws[i];
            const actualNumbers = typeof actualDraw.numbers === 'string'
                ? (typeof actualDraw.numbers === "string" ? JSON.parse(actualDraw.numbers) : actualDraw.numbers)
                : actualDraw.numbers;

            try {
                // Get prediction
                const prediction = await system.generateTop10(history as any[]);

                // Anti-system (ALL numbers NOT predicted)
                const maxNum = getMaxNumber(history as any[]);
                const allNums = Array.from({ length: maxNum }, (_, i) => i + 1);
                const antiPrediction = allNums.filter(n => !prediction.includes(n));
                // No slice! InverseSystem already returns ALL non-predicted numbers

                // Count hits
                const hits = prediction.filter(n => actualNumbers.includes(n)).length;
                const antiHits = antiPrediction.filter(n => actualNumbers.includes(n)).length;

                predictions.push({
                    drawId: actualDraw.id,
                    systemName: system.name,
                    prediction: JSON.stringify(prediction),
                    antiPrediction: JSON.stringify(antiPrediction),
                    hits,
                    antiHits,
                    jackpot: hits === 5,
                    antiJackpot: antiHits === 5
                });

                processed++;

                // Progress update every 100
                if (processed % 100 === 0) {
                    const pct = ((processed / totalDrawsToProcess) * 100).toFixed(1);
                    process.stdout.write(`\r   Processados: ${processed}/${totalDrawsToProcess} (${pct}%)`);
                }

            } catch (error) {
                console.error(`\n   ❌ Erro no sorteio ${actualDraw.id}: ${error}`);
            }
        }

        // Save batch
        if (predictions.length > 0) {
            console.log(`\n   💾 Guardando ${predictions.length} previsões...`);
            await prisma.systemPrediction.createMany({
                data: predictions
            });

            const jackpots = predictions.filter(p => p.jackpot).length;
            const antiJackpots = predictions.filter(p => p.antiJackpot).length;

            console.log(`   ✅ Guardado! Jackpots: ${jackpots} | Anti-Jackpots: ${antiJackpots}`);
        }
    }

    console.log('\n' + '═'.repeat(80));
    console.log('✅ Backfill concluído!');

    await prisma.$disconnect();
}

backfillMissingSystems();
