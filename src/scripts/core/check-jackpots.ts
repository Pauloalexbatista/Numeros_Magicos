import { prisma } from '@/lib/prisma';

async function checkJackpots() {
    const latestDraw = await prisma.draw.findFirst({
        orderBy: { date: 'desc' }
    });

    console.log(`📅 Sorteio: ${new Date(latestDraw!.date).toLocaleDateString('pt-PT')}`);
    console.log(`🎲 Números: ${JSON.parse(latestDraw!.numbers as string).join(', ')}\n`);

    // Check for jackpots (5/5)
    const jackpots = await prisma.systemPrediction.findMany({
        where: {
            drawId: latestDraw!.id,
            hits: 5
        },
        select: {
            systemName: true,
            prediction: true,
            hits: true
        }
    });

    // Check for anti-jackpots (5/5)
    const antiJackpots = await prisma.systemPrediction.findMany({
        where: {
            drawId: latestDraw!.id,
            antiHits: 5
        },
        select: {
            systemName: true,
            antiPrediction: true,
            antiHits: true
        }
    });

    console.log('🎯 SISTEMAS COM JACKPOT (5/5):');
    if (jackpots.length > 0) {
        jackpots.forEach(j => {
            const pred = JSON.parse(j.prediction);
            console.log(`   ✅ ${j.systemName}: ${pred.slice(0, 10).join(', ')}`);
        });
    } else {
        console.log('   ❌ Nenhum sistema acertou 5/5');
    }

    console.log('\n🎯 ANTI-SISTEMAS COM JACKPOT (5/5):');
    if (antiJackpots.length > 0) {
        antiJackpots.forEach(j => {
            const pred = JSON.parse(j.antiPrediction);
            console.log(`   ✅ ${j.systemName}: ${pred.slice(0, 10).join(', ')}`);
        });
    } else {
        console.log('   ❌ Nenhum anti-sistema acertou 5/5');
    }

    // Top performers (4/5)
    const top4 = await prisma.systemPrediction.findMany({
        where: {
            drawId: latestDraw!.id,
            hits: 4
        },
        select: {
            systemName: true,
            hits: true
        },
        orderBy: {
            systemName: 'asc'
        }
    });

    console.log(`\n📊 SISTEMAS COM 4/5 (${top4.length} sistemas):`);
    top4.forEach(s => console.log(`   • ${s.systemName}`));

    await prisma.$disconnect();
}

checkJackpots();
