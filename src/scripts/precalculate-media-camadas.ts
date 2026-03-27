import { prisma } from '@/lib/prisma';
import { SistMediaCamadas } from '@/services/custom/SistMediaCamadas';

/**
 * Pre-calculate Sistema Média Camadas predictions for ALL draws
 */

async function precalculateMediaCamadas() {
    console.log('📊 PRÉ-CÁLCULO: Sistema Média Camadas\n');
    console.log('═'.repeat(80));

    const allDraws = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        select: { id: true, date: true, numbers: true }
    });

    console.log(`Total de sorteios: ${allDraws.length}`);
    console.log('Calculando previsões...\n');

    const system = new SistMediaCamadas();
    const systemName = 'Sistema Média Camadas';

    // Clear existing predictions
    await prisma.systemPrediction.deleteMany({
        where: { systemName }
    });

    let processed = 0;
    const total = allDraws.length - 10; // Need 10 draws history
    const batchSize = 100;
    const predictions: any[] = [];

    for (let i = 0; i < allDraws.length - 10; i++) {
        const history = allDraws.slice(i + 1, i + 11);
        const actualDraw = allDraws[i];
        const actualNumbers = typeof actualDraw.numbers === 'string'
            ? (typeof actualDraw.numbers === "string" ? JSON.parse(actualDraw.numbers) : actualDraw.numbers)
            : actualDraw.numbers;

        // Get prediction
        const prediction = await system.generateTop10(history as any[]);

        // Anti-system
        const allNums = Array.from({ length: 50 }, (_, i) => i + 1);
        const antiPrediction = allNums.filter(n => !prediction.includes(n)).slice(0, 25);

        // Count hits
        const hits = prediction.filter(n => actualNumbers.includes(n)).length;
        const antiHits = antiPrediction.filter(n => actualNumbers.includes(n)).length;

        predictions.push({
            drawId: actualDraw.id,
            systemName,
            prediction: JSON.stringify(prediction),
            antiPrediction: JSON.stringify(antiPrediction),
            hits,
            antiHits,
            jackpot: hits === 5,
            antiJackpot: antiHits === 5
        });

        processed++;

        // Insert in batches
        if (predictions.length >= batchSize || i === allDraws.length - 11) {
            await prisma.systemPrediction.createMany({
                data: predictions
            });
            console.log(`Processados: ${processed}/${total} (${((processed / total) * 100).toFixed(1)}%)`);
            predictions.length = 0; // Clear batch
        }
    }

    console.log('\n✅ Cálculo concluído!\n');

    // Verify and stats
    const count = await prisma.systemPrediction.count({
        where: { systemName }
    });

    const jackpots = await prisma.systemPrediction.count({
        where: { systemName, jackpot: true }
    });

    const antiJackpots = await prisma.systemPrediction.count({
        where: { systemName, antiJackpot: true }
    });

    const allPredictions = await prisma.systemPrediction.findMany({
        where: { systemName },
        select: { hits: true, antiHits: true }
    });

    const totalHits = allPredictions.reduce((sum, p) => sum + p.hits, 0);
    const totalAntiHits = allPredictions.reduce((sum, p) => sum + p.antiHits, 0);
    const precision = (totalHits / (count * 5)) * 100;
    const antiPrecision = (totalAntiHits / (count * 5)) * 100;

    console.log('📊 ESTATÍSTICAS\n');
    console.log(`Total de registos: ${count}`);
    console.log('');
    console.log(`Sistema Média Camadas:`);
    console.log(`  Jackpots: ${jackpots} (${((jackpots / count) * 100).toFixed(1)}%)`);
    console.log(`  Precisão: ${precision.toFixed(1)}%`);
    console.log('');
    console.log(`Anti-Sistema:`);
    console.log(`  Jackpots: ${antiJackpots} (${((antiJackpots / count) * 100).toFixed(1)}%)`);
    console.log(`  Precisão: ${antiPrecision.toFixed(1)}%`);

    console.log('\n' + '═'.repeat(80));
    console.log('\n✅ Sistema Média Camadas guardado na BD!');
    console.log('   Análises agora são INSTANTÂNEAS!');
}

precalculateMediaCamadas()
    .then(() => {
        console.log('\n✅ Concluído!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Erro:', error);
        process.exit(1);
    });
