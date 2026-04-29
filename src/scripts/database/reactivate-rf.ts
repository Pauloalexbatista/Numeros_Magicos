/**
 * Reativa apenas os sistemas Random Forest na base de dados.
 * 
 * Executar: npx tsx src/scripts/database/reactivate-rf.ts
 */

import { prisma } from '../../lib/prisma';

async function reactivateRF() {
    console.log('🔄 A reativar sistemas Random Forest...\n');

    const result = await prisma.rankedSystem.updateMany({
        where: {
            name: { contains: 'Random Forest' }
        },
        data: { isActive: true }
    });

    console.log(`✅ ${result.count} sistemas Random Forest reativados com sucesso.`);
    
    // Verificar o estado atual para confirmar
    const activeRF = await prisma.rankedSystem.findMany({
        where: { 
            name: { contains: 'Random Forest' },
            isActive: true 
        }
    });

    console.log('\nEstado atual dos sistemas RF:');
    activeRF.forEach(s => {
        console.log(`  - [${s.game}/${s.domain}] "${s.name}" está ATIVO`);
    });

    await prisma.$disconnect();
}

reactivateRF().catch(console.error);
