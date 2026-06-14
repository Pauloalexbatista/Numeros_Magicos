/**
 * Desativa sistemas neurais que não têm motor ativo (LSTM, Random Forest)
 * diretamente na base de dados PostgreSQL de produção.
 */

// Set production database URL BEFORE importing Prisma client
process.env.DATABASE_URL = 'postgresql://admin_magico:UmaSenhaForte123@187.124.32.121:5432/numeros_magicos_prod';

import { prisma } from '../../lib/prisma';

const NEURAL_SYSTEM_KEYWORDS = ['LSTM', 'Random Forest', 'Neural', 'Classifier'];

async function deactivateNeuralSystems() {
    console.log('🔍 [PRODUÇÃO] A procurar sistemas neurais na base de dados PostgreSQL de produção...\n');

    // Find all systems that match neural keywords
    const neuralSystems = await prisma.rankedSystem.findMany({
        where: {
            OR: NEURAL_SYSTEM_KEYWORDS.map(keyword => ({
                name: { contains: keyword }
            }))
        }
    });

    if (neuralSystems.length === 0) {
        console.log('✅ Nenhum sistema neural encontrado na produção. Nada a fazer.');
        await prisma.$disconnect();
        return;
    }

    console.log(`Encontrados ${neuralSystems.length} sistemas neurais na produção:`);
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

    console.log(`\n✅ ${result.count} sistema(s) desativado(s) com sucesso na PROD PostgreSQL.`);
    console.log('ℹ️  Os sistemas continuam na DB de produção mas foram removidos do ranking e dashboards.');

    await prisma.$disconnect();
}

deactivateNeuralSystems().catch(console.error);
