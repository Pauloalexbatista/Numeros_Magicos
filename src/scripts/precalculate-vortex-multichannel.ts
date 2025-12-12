import { prisma } from '../lib/prisma';
import { VortexMultiChannelSystem } from '../services/vortex-multichannel';

/**
 * Pre-calculate Vortex Multi-Channel predictions for ALL draws
 * Save to SystemPrediction table for fast queries
 * 
 * Calculates for both 2-Channel and 3-Channel variants
 */

async function precalculateVortexMultiChannel() {
    console.log('🌊 PRÉ-CÁLCULO VORTEX MULTI-CANAL\n');
    console.log('═'.repeat(80));

    // Get all draws
    const allDraws = await prisma.draw.findMany({
        orderBy: { date: 'desc' }
    });

    console.log(`Total de sorteios: ${allDraws.length}\n`);

    // Initialize systems
    const vortex2Channel = new VortexMultiChannelSystem(2);
    const vortex3Channel = new VortexMultiChannelSystem(3);

    console.log('🔧 Sistemas a pré-calcular:');
    console.log(`  1. ${vortex2Channel.name}`);
    console.log(`  2. ${vortex3Channel.name}\n`);

    // Delete existing predictions for these systems
    console.log('🗑️  Limpando previsões antigas...');
    await prisma.systemPrediction.deleteMany({
        where: {
            systemName: {
                in: [vortex2Channel.name, vortex3Channel.name]
            }
        }
    });
    console.log('✅ Limpeza concluída\n');

    console.log('🔄 Calculando previsões...\n');

    const total = allDraws.length - 100; // Need 100 draws history
    let processed = 0;

    const predictions2Channel: any[] = [];
    const predictions3Channel: any[] = [];

    for (let i = 0; i < allDraws.length - 100; i++) {
        const history = allDraws.slice(i + 1); // All draws before this one
        const actualDraw = allDraws[i];
        const actualNumbers = typeof actualDraw.numbers === 'string'
            ? JSON.parse(actualDraw.numbers)
            : actualDraw.numbers;

        // 2-Channel predictions
        const pred2Channel = await vortex2Channel.generateTop10(history as any[]);
        const allNums = Array.from({ length: 50 }, (_, i) => i + 1);
        const antiPred2Channel = allNums.filter(n => !pred2Channel.includes(n)).slice(0, 25);

        const hits2Channel = pred2Channel.filter(n => actualNumbers.includes(n)).length;
        const antiHits2Channel = antiPred2Channel.filter(n => actualNumbers.includes(n)).length;

        predictions2Channel.push({
            drawId: actualDraw.id,
            systemName: vortex2Channel.name,
            prediction: JSON.stringify(pred2Channel),
            antiPrediction: JSON.stringify(antiPred2Channel),
            hits: hits2Channel,
            antiHits: antiHits2Channel,
            jackpot: hits2Channel === 5,
            antiJackpot: antiHits2Channel === 5
        });

        // 3-Channel predictions
        const pred3Channel = await vortex3Channel.generateTop10(history as any[]);
        const antiPred3Channel = allNums.filter(n => !pred3Channel.includes(n)).slice(0, 25);

        const hits3Channel = pred3Channel.filter(n => actualNumbers.includes(n)).length;
        const antiHits3Channel = antiPred3Channel.filter(n => actualNumbers.includes(n)).length;

        predictions3Channel.push({
            drawId: actualDraw.id,
            systemName: vortex3Channel.name,
            prediction: JSON.stringify(pred3Channel),
            antiPrediction: JSON.stringify(antiPred3Channel),
            hits: hits3Channel,
            antiHits: antiHits3Channel,
            jackpot: hits3Channel === 5,
            antiJackpot: antiHits3Channel === 5
        });

        processed++;
        if (processed % 100 === 0) {
            console.log(`  Processados: ${processed}/${total} (${((processed / total) * 100).toFixed(1)}%)`);
        }
    }

    console.log(`\n✅ Cálculos concluídos: ${processed}/${total} sorteios\n`);

    // Save to database in batches
    console.log('💾 Guardando na base de dados...\n');

    const batchSize = 500;

    // Save 2-Channel
    console.log(`  Guardando ${vortex2Channel.name}...`);
    for (let i = 0; i < predictions2Channel.length; i += batchSize) {
        const batch = predictions2Channel.slice(i, i + batchSize);
        try {
            await prisma.systemPrediction.createMany({
                data: batch
            });
            console.log(`    Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(predictions2Channel.length / batchSize)}`);
        } catch (error) {
            console.error(`    Erro no batch ${Math.floor(i / batchSize) + 1}:`, error);
        }
    }

    // Save 3-Channel
    console.log(`  Guardando ${vortex3Channel.name}...`);
    for (let i = 0; i < predictions3Channel.length; i += batchSize) {
        const batch = predictions3Channel.slice(i, i + batchSize);
        try {
            await prisma.systemPrediction.createMany({
                data: batch
            });
            console.log(`    Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(predictions3Channel.length / batchSize)}`);
        } catch (error) {
            console.error(`    Erro no batch ${Math.floor(i / batchSize) + 1}:`, error);
        }
    }

    console.log('\n✅ Dados guardados com sucesso!\n');

    // Statistics
    console.log('═'.repeat(80));
    console.log('\n📊 ESTATÍSTICAS FINAIS\n');

    const stats2Channel = {
        jackpots: predictions2Channel.filter(p => p.jackpot).length,
        antiJackpots: predictions2Channel.filter(p => p.antiJackpot).length,
        totalHits: predictions2Channel.reduce((sum, p) => sum + p.hits, 0),
        antiTotalHits: predictions2Channel.reduce((sum, p) => sum + p.antiHits, 0)
    };

    const stats3Channel = {
        jackpots: predictions3Channel.filter(p => p.jackpot).length,
        antiJackpots: predictions3Channel.filter(p => p.antiJackpot).length,
        totalHits: predictions3Channel.reduce((sum, p) => sum + p.hits, 0),
        antiTotalHits: predictions3Channel.reduce((sum, p) => sum + p.antiHits, 0)
    };

    console.log(`${vortex2Channel.name}:`);
    console.log(`  Jackpots: ${stats2Channel.jackpots} (${((stats2Channel.jackpots / processed) * 100).toFixed(2)}%)`);
    console.log(`  Anti-Jackpots: ${stats2Channel.antiJackpots} (${((stats2Channel.antiJackpots / processed) * 100).toFixed(2)}%)`);
    console.log(`  Avg Hits: ${(stats2Channel.totalHits / (processed * 5) * 100).toFixed(2)}%`);
    console.log(`  Anti Avg Hits: ${(stats2Channel.antiTotalHits / (processed * 5) * 100).toFixed(2)}%`);

    console.log(`\n${vortex3Channel.name}:`);
    console.log(`  Jackpots: ${stats3Channel.jackpots} (${((stats3Channel.jackpots / processed) * 100).toFixed(2)}%)`);
    console.log(`  Anti-Jackpots: ${stats3Channel.antiJackpots} (${((stats3Channel.antiJackpots / processed) * 100).toFixed(2)}%)`);
    console.log(`  Avg Hits: ${(stats3Channel.totalHits / (processed * 5) * 100).toFixed(2)}%`);
    console.log(`  Anti Avg Hits: ${(stats3Channel.antiTotalHits / (processed * 5) * 100).toFixed(2)}%`);

    console.log('\n' + '═'.repeat(80));
    console.log('\n✅ Pré-cálculo concluído!');
    console.log('   Agora as queries serão INSTANTÂNEAS! ⚡');

    await prisma.$disconnect();
}

precalculateVortexMultiChannel()
    .then(() => {
        console.log('\n✅ Script concluído!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Erro:', error);
        process.exit(1);
    });
