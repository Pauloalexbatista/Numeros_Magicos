import { prisma } from '../../lib/prisma';
import { trainRandomForestModel } from '../../services/neural/rf-train-core';

async function trainAllProduction() {
    console.log('🤖 [PRODUCTION] Iniciando Treino Final de Produção (Random Forest)...');

    const configs = [
        { game: 'EUROMILLIONS', isStars: false, maxVal: 50, type: 'RF_EUROMILLIONS_NUMBERS' },
        { game: 'EUROMILLIONS', isStars: true, maxVal: 12, type: 'RF_EUROMILLIONS_STARS' },
        { game: 'TOTOLOTO', isStars: false, maxVal: 49, type: 'RF_TOTOLOTO_NUMBERS' },
        { game: 'TOTOLOTO', isStars: true, maxVal: 13, type: 'RF_TOTOLOTO_STARS' },
        { game: 'EURODREAMS', isStars: false, maxVal: 40, type: 'RF_EURODREAMS_NUMBERS' },
        { game: 'EURODREAMS', isStars: true, maxVal: 5, type: 'RF_EURODREAMS_STARS' },
    ];

    for (const config of configs) {
        console.log(`\n🔵 Treinando ${config.type}...`);
        const result = await trainRandomForestModel(
            config.game,
            config.isStars,
            config.maxVal,
            config.type
        );
        
        if (result.success) {
            console.log(`   ✅ Sucesso! Precisão de Treino: ${result.accuracy}%`);
        } else {
            console.log(`   ❌ Falha: ${result.message}`);
        }
    }

    console.log('\n🏆 [PRODUCTION] Todos os modelos de produção foram atualizados na Base de Dados.');
}

trainAllProduction().catch(console.error).finally(() => prisma.$disconnect());
