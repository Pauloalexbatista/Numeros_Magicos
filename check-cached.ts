import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCachedPredictions() {
    console.log('='.repeat(70));
    console.log('CHECKING CACHED PREDICTIONS');
    console.log('='.repeat(70));

    const cached = await prisma.cachedPrediction.findMany({
        select: {
            systemName: true,
            numbers: true,
            updatedAt: true
        },
        orderBy: { systemName: 'asc' }
    });

    console.log(`\nTotal cached predictions: ${cached.length}\n`);

    // Find LSTM
    const lstm = cached.find(c => c.systemName === 'LSTM Neural Net');
    if (lstm) {
        console.log('🧠 LSTM NEURAL NET (CACHED):');
        console.log(`   Numbers: ${lstm.numbers}`);
        console.log(`   Updated: ${lstm.updatedAt}`);
    }

    // Find Vortex
    const vortex = cached.filter(c => c.systemName.includes('Vortex Multi'));
    if (vortex.length > 0) {
        console.log('\n🌀 VORTEX MULTICANAL (CACHED):');
        vortex.forEach(v => {
            console.log(`   ${v.systemName}: ${v.numbers}`);
            console.log(`   Updated: ${v.updatedAt}`);
        });
    }

    console.log('\n📋 ALL CACHED PREDICTIONS:');
    console.log('-'.repeat(70));
    cached.forEach(c => {
        console.log(`${c.systemName.padEnd(50)} Updated: ${c.updatedAt.toLocaleString('pt-PT')}`);
    });

    console.log('\n' + '='.repeat(70));

    await prisma.$disconnect();
}

checkCachedPredictions().catch(console.error);
