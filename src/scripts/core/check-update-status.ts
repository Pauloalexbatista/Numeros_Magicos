import { prisma } from '@/lib/prisma';

async function checkStatus() {
    const latest = await prisma.draw.findFirst({
        orderBy: { date: 'desc' }
    });

    const count = await prisma.systemPrediction.count({
        where: { drawId: latest!.id }
    });

    console.log(`📅 Sorteio: ${new Date(latest!.date).toLocaleDateString('pt-PT')}`);
    console.log(`✅ Previsões calculadas: ${count}/47 sistemas`);

    if (count === 47) {
        console.log('🎉 COMPLETO! Todos os sistemas atualizados.');
    } else if (count > 0) {
        console.log(`⚠️  PARCIAL: Faltam ${47 - count} sistemas.`);
    } else {
        console.log('❌ NENHUMA previsão encontrada para este sorteio.');
    }

    await prisma.$disconnect();
}

checkStatus();
