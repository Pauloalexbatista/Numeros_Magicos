/**
 * Verificar sistemas de NÚMEROS vs ESTRELAS
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeSystems() {
    console.log('🔍 ANÁLISE DE SISTEMAS\n');

    const lastDraw = await prisma.draw.findFirst({
        orderBy: { date: 'desc' }
    });

    if (!lastDraw) return;

    // Todos os sistemas
    const allPerformances = await prisma.systemPerformance.findMany({
        where: { drawId: lastDraw.id }
    });

    // Filtrar por tipo
    const numberSystems = allPerformances.filter(p =>
        !p.systemName.includes('Star') &&
        !p.systemName.toLowerCase().includes('estrela')
    );

    const starSystems = allPerformances.filter(p =>
        p.systemName.includes('Star') ||
        p.systemName.toLowerCase().includes('estrela')
    );

    console.log(`📊 TOTAL DE SISTEMAS: ${allPerformances.length}`);
    console.log(`🔢 Sistemas de NÚMEROS: ${numberSystems.length}`);
    console.log(`⭐ Sistemas de ESTRELAS: ${starSystems.length}\n`);

    // Jackpots de números
    const numberJackpots = numberSystems.filter(s => s.hits === 5);
    console.log(`🏆 JACKPOTS DE NÚMEROS (5/5): ${numberJackpots.length}\n`);

    numberJackpots.forEach((jp, idx) => {
        console.log(`${idx + 1}. ${jp.systemName}`);
    });

    // Performance de números
    console.log('\n📊 DISTRIBUIÇÃO DE ACERTOS (NÚMEROS):\n');
    for (let hits = 5; hits >= 0; hits--) {
        const count = numberSystems.filter(s => s.hits === hits).length;
        const emoji = hits === 5 ? '🏆' : hits === 4 ? '🥈' : hits === 3 ? '🥉' : '📊';
        console.log(`${emoji} ${hits}/5: ${count} sistemas (${(count / numberSystems.length * 100).toFixed(1)}%)`);
    }

    await prisma.$disconnect();
}

analyzeSystems();
