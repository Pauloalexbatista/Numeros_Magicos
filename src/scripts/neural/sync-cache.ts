import { prisma } from '../../lib/prisma';

async function syncPredictions() {
    console.log('🔄 Sincronizando previsões RF para o Cache...');
    
    const trainings = await prisma.mLModelTraining.findMany({
        where: { modelType: { startsWith: 'RF_' } }
    });

    for (const training of trainings) {
        const data = JSON.parse(training.modelData || '{}');
        const nextPrediction = data.nextPrediction;
        
        if (!nextPrediction || !Array.isArray(nextPrediction)) continue;

        const isStars = training.modelType.includes('_STARS');
        const game = training.modelType.split('_')[1]; // RF_EUROMILLIONS_NUMBERS -> EUROMILLIONS
        const systemName = isStars ? 'Random Forest (Estrelas)' : 'Random Forest (Números)';

        // Calculate worst numbers (tie breakers)
        let maxVal = 50;
        if (game === 'TOTOLOTO') maxVal = isStars ? 13 : 49;
        else if (game === 'EURODREAMS') maxVal = isStars ? 5 : 40;
        else if (game === 'EUROMILLIONS') maxVal = isStars ? 12 : 50;

        const allNums = Array.from({ length: maxVal }, (_, i) => i + 1);
        const worstNumbers = allNums.filter(n => !nextPrediction.includes(n));

        await prisma.cachedPrediction.upsert({
            where: { systemName_game: { systemName, game } },
            update: {
                numbers: JSON.stringify(nextPrediction),
                worstNumbers: JSON.stringify(worstNumbers),
                updatedAt: new Date()
            },
            create: {
                systemName,
                game,
                numbers: JSON.stringify(nextPrediction),
                worstNumbers: JSON.stringify(worstNumbers)
            }
        });
        
        console.log(`   ✅ Sincronizado: ${game} - ${systemName}`);
    }
}

syncPredictions().catch(console.error).finally(() => prisma.$disconnect());
