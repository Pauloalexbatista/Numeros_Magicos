/**
 * Auditoria detalhada das performances do Random Forest.
 * 
 * Executar: npx tsx src/scripts/database/audit-rf-dates.ts
 */

import { prisma } from '../../lib/prisma';

async function auditRF() {
    console.log('🧐 Auditoria de Datas e Histórico (Random Forest)\n');

    const rfPerformances = await prisma.systemPerformance.findMany({
        where: { systemName: { contains: 'Random Forest' } },
        include: { draw: true },
        orderBy: { draw: { date: 'asc' } }
    });

    if (rfPerformances.length === 0) {
        console.log('❌ Nenhuma performance de números encontrada para Random Forest.');
    } else {
        const oldest = rfPerformances[0];
        const newest = rfPerformances[rfPerformances.length - 1];
        
        console.log(`📊 Números (SystemPerformance):`);
        console.log(`  - Total de registos: ${rfPerformances.length}`);
        console.log(`  - Primeiro sorteio: ${oldest.draw.date.toISOString().split('T')[0]} (ID: ${oldest.drawId})`);
        console.log(`  - Último sorteio:   ${newest.draw.date.toISOString().split('T')[0]} (ID: ${newest.drawId})`);
        
        // Contar acertos altos no histórico
        const highHits = rfPerformances.filter(p => p.hits >= 4).length;
        console.log(`  - Acertos >= 4: ${highHits} sorteios`);
    }

    console.log('\n-------------------\n');

    const starPerformances = await prisma.starSystemPerformance.findMany({
        where: { systemName: { contains: 'Random Forest' } },
        include: { draw: true },
        orderBy: { draw: { date: 'asc' } }
    });

    if (starPerformances.length === 0) {
        console.log('❌ Nenhuma performance de estrelas encontrada para Random Forest.');
    } else {
        const oldest = starPerformances[0];
        const newest = starPerformances[starPerformances.length - 1];
        
        console.log(`⭐ Estrelas (StarSystemPerformance):`);
        console.log(`  - Total de registos: ${starPerformances.length}`);
        console.log(`  - Primeiro sorteio: ${oldest.draw.date.toISOString().split('T')[0]} (ID: ${oldest.drawId})`);
        console.log(`  - Último sorteio:   ${newest.draw.date.toISOString().split('T')[0]} (ID: ${newest.drawId})`);
    }

    await prisma.$disconnect();
}

auditRF().catch(console.error);
