import { trainExclusionModel } from '../../services/exclusion-lstm';
import { prisma } from '../../lib/prisma';

async function main() {
    console.log('🧠 ========================================');
    console.log('   EXCLUSION LSTM - TREINO OFFLINE');
    console.log('========================================\n');

    // SMART SKIP: Check if training is needed
    console.log('🔍 Verificando se treino é necessário...');

    const totalDraws = await prisma.draw.count();
    const lastSystemPerf = await prisma.systemPerformance.findFirst({
        where: { systemName: 'LSTM Neural Net' },
        orderBy: { drawId: 'desc' },
        select: { drawId: true }
    });

    const lastDrawId = await prisma.draw.findFirst({
        orderBy: { id: 'desc' },
        select: { id: true }
    });

    // If LSTM has predictions for the latest draw, skip training
    if (lastSystemPerf && lastDrawId && lastSystemPerf.drawId === lastDrawId.id) {
        console.log(`✅ Modelo já treinado até sorteio #${lastDrawId.id}.`);
        console.log('⏩ SKIP: Sem novos dados para treinar.\n');
        console.log('========================================');
        console.log('✅ TREINO NÃO NECESSÁRIO!');
        console.log('========================================\n');
        await prisma.$disconnect();
        return; // Skip training
    }

    console.log(`📊 Novos dados disponíveis: sorteio #${lastDrawId?.id || 0}`);
    console.log('🚀 Iniciando treino...\n');

    try {
        console.log('📊 1/2 Treinando modelo NUMBERS...');
        console.log('    (Isto vai demorar 5-10 segundos)');
        const startNumbers = Date.now();
        await trainExclusionModel('NUMBERS');
        const durationNumbers = ((Date.now() - startNumbers) / 1000).toFixed(1);
        console.log(`    ✅ Concluído em ${durationNumbers} s\n`);

        console.log('⭐ 2/2 Treinando modelo STARS...');
        console.log('    (Isto vai demorar 5-10 segundos)');
        const startStars = Date.now();
        await trainExclusionModel('STARS');
        const durationStars = ((Date.now() - startStars) / 1000).toFixed(1);
        console.log(`    ✅ Concluído em ${durationStars} s\n`);

        console.log('========================================');
        console.log('✅ TODOS OS MODELOS TREINADOS!');
        console.log('========================================');
        console.log(`⏱️  Tempo total: ${((Date.now() - startNumbers) / 1000).toFixed(1)} s`);
        console.log('💾 Previsões guardadas em cache.');
        console.log('🚀 Sistema pronto para uso!\n');

    } catch (error) {
        console.error('\n❌ Erro ao treinar modelos:', error);
        process.exit(1);
    }
}

main()
    .catch(console.error)
    .finally(() => process.exit(0));
