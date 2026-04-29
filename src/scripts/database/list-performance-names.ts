/**
 * Lista todos os nomes de sistemas únicos com performances gravadas.
 * 
 * Executar: npx tsx src/scripts/database/list-performance-names.ts
 */

import { prisma } from '../../lib/prisma';

async function listNames() {
    console.log('📋 Lista de Sistemas com Performance Gravada:\n');

    const names = await prisma.systemPerformance.groupBy({
        by: ['systemName'],
        _count: {
            systemName: true
        }
    });

    names.sort((a, b) => b._count.systemName - a._count.systemName);

    names.forEach(n => {
        console.log(`  - "${n.systemName}": ${n._count.systemName} sorteios`);
    });

    console.log('\n⭐ Estrelas (StarSystemPerformance):');
    const starNames = await prisma.starSystemPerformance.groupBy({
        by: ['systemName'],
        _count: {
            systemName: true
        }
    });
    starNames.forEach(n => {
        console.log(`  - "${n.systemName}": ${n._count.systemName} sorteios`);
    });

    await prisma.$disconnect();
}

listNames().catch(console.error);
