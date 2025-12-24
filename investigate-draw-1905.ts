import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function investigate() {
    console.log('='.repeat(70));
    console.log('INVESTIGATING DRAW 1905 (23/12/2025) DATA INTEGRITY');
    console.log('='.repeat(70));

    const draw = await prisma.draw.findFirst({
        where: { date: new Date('2025-12-23') }
    });

    if (!draw) {
        console.log('❌ Draw not found!');
        await prisma.$disconnect();
        return;
    }

    console.log(`\n📅 DRAW INFO: ID=${draw.id}, Numbers=${draw.numbers}, Stars=${draw.stars}\n`);

    // Get all predictions for this draw, ordered by hits
    const allPredictions = await prisma.systemPrediction.findMany({
        where: { drawId: draw.id },
        orderBy: { hits: 'desc' },
        select: {
            systemName: true,
            prediction: true,
            hits: true,
            calculatedAt: true
        }
    });

    console.log(`Total predictions: ${allPredictions.length}\n`);

    // Show top 30
    console.log('🏆 TOP 30 SYSTEMS BY HITS:');
    console.log('-'.repeat(70));
    allPredictions.slice(0, 30).forEach((p, i) => {
        const marker = p.hits === 5 ? '🎯' : p.hits === 4 ? '✨' : '  ';
        console.log(`${marker} ${(i + 1).toString().padStart(2)}. ${p.systemName.padEnd(45)} ${p.hits}/5`);
    });

    // Check for LSTM
    console.log('\n🧠 LSTM NEURAL NET:');
    console.log('-'.repeat(70));
    const lstm = allPredictions.find(p => p.systemName === 'LSTM Neural Net');
    if (lstm) {
        console.log(`   Prediction: ${lstm.prediction}`);
        console.log(`   Hits: ${lstm.hits}/5`);
        console.log(`   Calculated: ${lstm.calculatedAt}`);
    } else {
        console.log('   ❌ NOT FOUND!');
    }

    // Check for Vortex Multicanal
    console.log('\n🌀 VORTEX MULTICANAL SYSTEMS:');
    console.log('-'.repeat(70));
    const vortex = allPredictions.filter(p => p.systemName.includes('Vortex Multi'));
    vortex.forEach(v => {
        console.log(`   ${v.systemName}: ${v.hits}/5 - ${v.prediction}`);
    });

    // Check for Metal systems
    console.log('\n🥉 METAL SYSTEMS (Bronze, Platina, Ouro, Prata):');
    console.log('-'.repeat(70));
    const metals = allPredictions.filter(p =>
        ['Sistema Bronze', 'Sistema Platina', 'Sistema Ouro', 'Sistema Prata'].includes(p.systemName)
    );
    metals.forEach(m => {
        console.log(`   ${m.systemName}: ${m.hits}/5 - ${m.prediction}`);
    });

    // Show all with 5 hits
    console.log('\n🎯 ALL SYSTEMS WITH 5 HITS (JACKPOTS):');
    console.log('-'.repeat(70));
    const jackpots = allPredictions.filter(p => p.hits === 5);
    if (jackpots.length > 0) {
        jackpots.forEach(j => {
            console.log(`   ✅ ${j.systemName}: ${j.prediction}`);
        });
    } else {
        console.log('   (None)');
    }

    console.log('\n' + '='.repeat(70));

    await prisma.$disconnect();
}

investigate().catch(console.error);
