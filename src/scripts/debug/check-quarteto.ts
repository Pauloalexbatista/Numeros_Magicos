
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
    console.log('🔍 Checking for Quarteto Complementar...');

    const system = await prisma.rankedSystem.findFirst({
        where: { name: { contains: 'Quarteto' } }
    });

    if (system) {
        console.log('✅ FOUND SYSTEM:', system.name);

        const rankings = await prisma.systemRanking.findUnique({
            where: { systemName: system.name }
        });
        console.log('📊 Ranking Data:', rankings);

        const perfCount = await prisma.systemPerformance.count({
            where: { systemName: system.name }
        });
        console.log('📈 Performance Records:', perfCount);
    } else {
        console.log('❌ NOT FOUND in Local DB!');

        // List all systems just in case
        const all = await prisma.rankedSystem.findMany({ select: { name: true } });
        console.log('📋 Available Systems:', all.map(s => s.name).join(', '));
    }
}

check().finally(() => prisma.$disconnect());
