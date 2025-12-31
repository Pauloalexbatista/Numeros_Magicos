/**
 * DEBUG: Check SystemPrediction vs SystemPerformance
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function compareTables() {
    console.log('🔍 COMPARANDO TABELAS\n');

    const lastDraw = await prisma.draw.findFirst({
        orderBy: { date: 'desc' }
    });

    if (!lastDraw) return;

    console.log(`📅 Último sorteio: #${lastDraw.id}\n`);

    // SystemPrediction
    const predictions = await prisma.systemPrediction.findMany({
        where: { drawId: lastDraw.id }
    });

    console.log(`📊 SystemPrediction: ${predictions.length} registos`);
    console.log('Sistemas:', predictions.map(p => p.systemName).slice(0, 10).join(', '), '...\n');

    // SystemPerformance
    const performances = await prisma.systemPerformance.findMany({
        where: { drawId: lastDraw.id }
    });

    console.log(`📊 SystemPerformance: ${performances.length} registos`);
    console.log('Top 10:', performances.sort((a, b) => b.hits - a.hits).slice(0, 10).map(p => `${p.systemName} (${p.hits}/5)`).join(', '));

    await prisma.$disconnect();
}

compareTables();
