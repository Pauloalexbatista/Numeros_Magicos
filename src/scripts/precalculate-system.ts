import { prisma } from '@/lib/prisma';
import { rankedSystems } from '@/services/ranked-systems';

/**
 * Generic script to pre-calculate ANY system
 * Usage: npx tsx src/scripts/precalculate-system.ts "System Name"
 */

async function precalculateSystem(systemName: string) {
    console.log(`📊 PRÉ-CÁLCULO: ${systemName}\n`);
    console.log('═'.repeat(80));

    // Find system
    const system = rankedSystems.find(s => s.name === systemName);

    if (!system) {
        console.log(`❌ Sistema "${systemName}" não encontrado!`);
        console.log('\nSistemas disponíveis:');
        rankedSystems.forEach((s, i) => console.log(`  ${i + 1}. ${s.name}`));
        return;
    }

    const allDraws = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        select: { id: true, date: true, numbers: true }
    });

    console.log(`Total de sorteios: ${allDraws.length}`);
    console.log(`Sistema: ${system.name}`);
    console.log('Calculando previsões...\n');

    // Clear existing predictions
    await prisma.systemPrediction.deleteMany({
        where: { systemName }
    });

    let processed = 0;
    const minHistory = 50; // Most systems need at least 50 draws
    const total = allDraws.length - minHistory;
    const batchSize = 100;
    const predictions: any[] = [];

    const startTime = Date.now();

    for (let i = 0; i < allDraws.length - minHistory; i++) {
        const history = allDraws.slice(i + 1, i + minHistory + 1);
        const actualDraw = allDraws[i];
        const actualNumbers = typeof actualDraw.numbers === 'string'
            ? (typeof actualDraw.numbers === "string" ? JSON.parse(actualDraw.numbers) : actualDraw.numbers)
            : actualDraw.numbers;

        try {
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
            if (predictions.length >= batchSize || i === allDraws.length - minHistory - 1) {
                await prisma.systemPrediction.createMany({
                    data: predictions
                });

                const elapsed = (Date.now() - startTime) / 1000;
                const rate = processed / elapsed;
                const remaining = (total - processed) / rate;

                console.log(`Processados: ${processed}/${total} (${((processed / total) * 100).toFixed(1)}%) - ETA: ${Math.ceil(remaining)}s`);
                predictions.length = 0;
            }
        } catch (error) {
            console.error(`Erro no sorteio ${actualDraw.id}:`, error);
        }
    }

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n✅ Cálculo concluído em ${totalTime}s!\n`);

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
    console.log(`${systemName}:`);
    console.log(`  Jackpots: ${jackpots} (${((jackpots / count) * 100).toFixed(1)}%)`);
    console.log(`  Precisão: ${precision.toFixed(1)}%`);
    console.log('');
    console.log(`Anti-Sistema:`);
    console.log(`  Jackpots: ${antiJackpots} (${((antiJackpots / count) * 100).toFixed(1)}%)`);
    console.log(`  Precisão: ${antiPrecision.toFixed(1)}%`);

    console.log('\n' + '═'.repeat(80));
    console.log(`\n✅ ${systemName} guardado na BD!`);
}

// Get system name from command line
const systemName = process.argv[2];

if (!systemName) {
    console.log('❌ Uso: npx tsx src/scripts/precalculate-system.ts "Nome do Sistema"');
    console.log('\nExemplo: npx tsx src/scripts/precalculate-system.ts "Hot Numbers"');
    process.exit(1);
}

precalculateSystem(systemName)
    .then(() => {
        console.log('\n✅ Concluído!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Erro:', error);
        process.exit(1);
    });
