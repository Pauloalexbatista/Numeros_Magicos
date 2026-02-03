import { prisma } from '@/lib/prisma';

async function verifyClassification() {
    console.log('🔍 Verification Report\n');

    // Sample systems by type
    console.log('=== SAMPLE SYSTEMS BY TYPE ===\n');

    const baseNumbers = await prisma.rankedSystem.findMany({
        where: { systemType: 'BASE', domain: 'NUMBERS' },
        take: 3,
        orderBy: { priority: 'asc' }
    });

    console.log('BASE NUMBERS (Sample):');
    baseNumbers.forEach(s => {
        console.log(`  ${s.name}`);
        console.log(`    Priority: ${s.priority}, Complexity: ${s.complexity}`);
    });

    const neural = await prisma.rankedSystem.findMany({
        where: { systemType: 'NEURAL' },
        take: 3
    });

    console.log('\nNEURAL (Sample):');
    neural.forEach(s => {
        console.log(`  ${s.name}`);
        console.log(`    Priority: ${s.priority}, Complexity: ${s.complexity}, Domain: ${s.domain}`);
    });

    const ensemble = await prisma.rankedSystem.findMany({
        where: { systemType: 'ENSEMBLE' },
        take: 5
    });

    console.log('\nENSEMBLE (Sample):');
    ensemble.forEach(s => {
        const deps = s.dependencies ? JSON.parse(s.dependencies) : [];
        console.log(`  ${s.name}`);
        console.log(`    Priority: ${s.priority}, Complexity: ${s.complexity}, Domain: ${s.domain}`);
        if (deps.length > 0) {
            console.log(`    Dependencies: ${deps.join(', ')}`);
        }
    });

    // Count by game and type
    console.log('\n=== BY GAME AND TYPE ===\n');

    for (const game of ['EUROMILLIONS', 'TOTOLOTO', 'EURODREAMS']) {
        console.log(`${game}:`);

        for (const type of ['BASE', 'NEURAL', 'ENSEMBLE']) {
            const count = await prisma.rankedSystem.count({
                where: { game, systemType: type }
            });
            console.log(`  ${type}: ${count}`);
        }
        console.log('');
    }

    await prisma.$disconnect();
}

verifyClassification();
