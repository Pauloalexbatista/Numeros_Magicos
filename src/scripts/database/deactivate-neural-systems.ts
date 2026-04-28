/**
 * Desativa sistemas neurais que não têm motor ativo (LSTM, Random Forest)
 * da tabela ranked_systems na DB de produção.
 * 
 * Executar: npx tsx src/scripts/database/deactivate-neural-systems.ts
 */

import { prisma } from '../../lib/prisma';

const NEURAL_SYSTEM_KEYWORDS = ['LSTM', 'Random Forest', 'Neural', 'Classifier'];

async function deactivateNeuralSystems() {
    console.log('🔍 A procurar sistemas neurais na base de dados...\n');

    // Find all systems that match neural keywords
    const neuralSystems = await prisma.rankedSystem.findMany({
        where: {
            OR: NEURAL_SYSTEM_KEYWORDS.map(keyword => ({
                name: { contains: keyword }
            }))
        }
    });

    if (neuralSystems.length === 0) {
        console.log('✅ Nenhum sistema neural encontrado. Nada a fazer.');
        await prisma.$disconnect();
        return;
    }

    console.log(`Found ${neuralSystems.length} neural system(s):`);
    neuralSystems.forEach(s => {
        console.log(`  - [${s.game}/${s.domain}] "${s.name}" (isActive: ${s.isActive})`);
    });

    // Deactivate all
    const result = await prisma.rankedSystem.updateMany({
        where: {
            OR: NEURAL_SYSTEM_KEYWORDS.map(keyword => ({
                name: { contains: keyword }
            }))
        },
        data: { isActive: false }
    });

    console.log(`\n✅ ${result.count} sistema(s) desativado(s) com sucesso.`);
    console.log('ℹ️  Os sistemas continuam na DB mas não aparecem no ranking até serem reativados.');

    await prisma.$disconnect();
}

deactivateNeuralSystems().catch(console.error);
