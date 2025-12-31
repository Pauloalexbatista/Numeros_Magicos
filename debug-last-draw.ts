/**
 * DEBUG: Check last draw systems
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkLastDrawSystems() {
    console.log('🔍 VERIFICANDO ÚLTIMO SORTEIO\n');

    // Get last draw
    const lastDraw = await prisma.draw.findFirst({
        orderBy: { date: 'desc' }
    });

    if (!lastDraw) {
        console.log('❌ Nenhum sorteio encontrado');
        return;
    }

    console.log(`📅 Último sorteio: #${lastDraw.id} - ${lastDraw.date.toLocaleDateString('pt-PT')}\n`);

    // Get performances for last draw
    const performances = await prisma.systemPerformance.findMany({
        where: {
            drawId: lastDraw.id
        },
        orderBy: {
            hits: 'desc'
        },
        take: 20
    });

    console.log(`📊 Total de performances: ${performances.length}\n`);
    console.log('🏆 TOP 20 SISTEMAS:\n');

    performances.forEach((perf, idx) => {
        const emoji = perf.hits === 5 ? '🎉' : perf.hits === 4 ? '🥈' : perf.hits === 3 ? '🥉' : perf.hits === 2 ? '📊' : '📉';
        console.log(`${idx + 1}. ${emoji} ${perf.systemName}: ${perf.hits}/5`);
    });

    // Check medals specifically
    console.log('\n💰 SISTEMAS MEDALS:\n');
    const medals = performances.filter(p =>
        p.systemName.includes('Ouro') ||
        p.systemName.includes('Prata') ||
        p.systemName.includes('Bronze') ||
        p.systemName.includes('Platina')
    );

    medals.forEach(m => {
        console.log(`   ${m.systemName}: ${m.hits}/5`);
    });

    await prisma.$disconnect();
}

checkLastDrawSystems();
