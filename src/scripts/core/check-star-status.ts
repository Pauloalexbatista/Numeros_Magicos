import { prisma } from '@/lib/prisma';

async function checkStarStatus() {
    const latest = await prisma.draw.findFirst({
        orderBy: { date: 'desc' }
    });

    const count = await prisma.starSystemPerformance.count({
        where: { drawId: latest!.id }
    });

    console.log(`📅 Sorteio: ${new Date(latest!.date).toLocaleDateString('pt-PT')}`);
    console.log(`⭐ Star Systems calculados: ${count}`);

    if (count === 0) {
        console.log('❌ NENHUM sistema de estrelas calculado para este sorteio!');
    } else {
        console.log('✅ Sistemas de estrelas atualizados.');
    }

    await prisma.$disconnect();
}

checkStarStatus();
