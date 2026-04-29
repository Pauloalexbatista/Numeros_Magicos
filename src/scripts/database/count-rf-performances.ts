/**
 * Conta o número de sorteios analisados por cada sistema Random Forest.
 * 
 * Executar: npx tsx src/scripts/database/count-rf-performances.ts
 */

import { prisma } from '../../lib/prisma';

async function countRFPerformances() {
    console.log('📊 Contagem de Sorteios Analisados (Random Forest)\n');

    // Get all RF systems
    const rfSystems = await prisma.rankedSystem.findMany({
        where: {
            name: { contains: 'Random Forest' }
        }
    });

    for (const sys of rfSystems) {
        const count = await prisma.systemPerformance.count({
            where: {
                systemName: sys.name,
                game: sys.game
            }
        });

        const starCount = await prisma.starSystemPerformance.count({
            where: {
                systemName: sys.name,
                game: sys.game
            }
        });

        if (count > 0 || starCount > 0) {
            console.log(`[${sys.game}] "${sys.name}":`);
            if (count > 0) console.log(`  - Números: ${count} sorteios`);
            if (starCount > 0) console.log(`  - Estrelas: ${starCount} sorteios`);
        }
    }

    await prisma.$disconnect();
}

countRFPerformances().catch(console.error);
