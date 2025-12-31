/**
 * Verificar JACKPOTS REAIS (5/5)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkRealJackpots() {
    console.log('🎰 VERIFICANDO JACKPOTS REAIS (5/5)\n');

    const lastDraw = await prisma.draw.findFirst({
        orderBy: { date: 'desc' }
    });

    if (!lastDraw) return;

    console.log(`📅 Sorteio: #${lastDraw.id} - ${lastDraw.date.toLocaleDateString('pt-PT')}\n`);

    // Apenas sistemas com 5/5
    const jackpots = await prisma.systemPerformance.findMany({
        where: {
            drawId: lastDraw.id,
            hits: 5
        },
        orderBy: {
            systemName: 'asc'
        }
    });

    console.log(`🏆 TOTAL DE JACKPOTS (5/5): ${jackpots.length}\n`);

    if (jackpots.length > 0) {
        console.log('SISTEMAS COM JACKPOT:\n');
        jackpots.forEach((jp, idx) => {
            console.log(`${idx + 1}. 🎉 ${jp.systemName}`);
        });
    } else {
        console.log('❌ Nenhum sistema acertou os 5 números.');
    }

    await prisma.$disconnect();
}

checkRealJackpots();
