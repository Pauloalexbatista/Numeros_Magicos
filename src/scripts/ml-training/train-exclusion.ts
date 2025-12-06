import { trainExclusionModel } from '../../services/exclusion-lstm';

async function main() {
    console.log('🧠 ========================================');
    console.log('   EXCLUSION LSTM - TREINO OFFLINE');
    console.log('========================================\n');

    try {
        console.log('📊 1/2 Treinando modelo NUMBERS...');
        console.log('    (Isto vai demorar 5-10 segundos)');
        const startNumbers = Date.now();
        await trainExclusionModel('NUMBERS');
        const durationNumbers = ((Date.now() - startNumbers) / 1000).toFixed(1);
        console.log(`    ✅ Concluído em ${durationNumbers}s\n`);

        console.log('⭐ 2/2 Treinando modelo STARS...');
        console.log('    (Isto vai demorar 5-10 segundos)');
        const startStars = Date.now();
        await trainExclusionModel('STARS');
        const durationStars = ((Date.now() - startStars) / 1000).toFixed(1);
        console.log(`    ✅ Concluído em ${durationStars}s\n`);

        console.log('========================================');
        console.log('✅ TODOS OS MODELOS TREINADOS!');
        console.log('========================================');
        console.log(`⏱️  Tempo total: ${((Date.now() - startNumbers) / 1000).toFixed(1)}s`);
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
