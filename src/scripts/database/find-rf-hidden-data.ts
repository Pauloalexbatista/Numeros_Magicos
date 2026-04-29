/**
 * Procura resultados do Random Forest em tabelas alternativas (Staging e Predictions).
 * 
 * Executar: npx tsx src/scripts/database/find-rf-hidden-data.ts
 */

import { prisma } from '../../lib/prisma';

async function findHiddenRF() {
    console.log('🔍 A procurar Random Forest em tabelas alternativas...\n');

    // 1. Check SystemPerformanceStaging
    const stagingCount = await prisma.systemPerformanceStaging.count({
        where: { systemName: { contains: 'Random Forest' } }
    });

    if (stagingCount > 0) {
        const sample = await prisma.systemPerformanceStaging.findFirst({
            where: { systemName: { contains: 'Random Forest' } },
            include: { draw: true },
            orderBy: { draw: { date: 'asc' } }
        });
        console.log(`✅ Tabela STAGING: ${stagingCount} registos encontrados.`);
        console.log(`   - Data mais antiga: ${sample?.draw.date.toISOString().split('T')[0]}`);
    } else {
        console.log('❌ Tabela STAGING: Nenhum registo de Random Forest.');
    }

    // 2. Check SystemPrediction
    const predictionCount = await prisma.systemPrediction.count({
        where: { systemName: { contains: 'Random Forest' } }
    });

    if (predictionCount > 0) {
        const sample = await prisma.systemPrediction.findFirst({
            where: { systemName: { contains: 'Random Forest' } },
            include: { draw: true },
            orderBy: { draw: { date: 'asc' } }
        });
        console.log(`✅ Tabela PREDICTIONS: ${predictionCount} registos encontrados.`);
        console.log(`   - Data mais antiga: ${sample?.draw.date.toISOString().split('T')[0]}`);
    } else {
        console.log('❌ Tabela PREDICTIONS: Nenhum registo de Random Forest.');
    }

    // 3. Check MLModelTraining (to see if weights exist)
    const training = await prisma.mLModelTraining.findMany({
        where: { modelType: { contains: 'RF' } }
    });
    console.log(`\n🧠 Modelos treinados (MLModelTraining): ${training.length} encontrados.`);

    await prisma.$disconnect();
}

findHiddenRF().catch(console.error);
