import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanTables() {
    console.log('🗑️  Limpando tabelas SystemPrediction e SystemPerformance...\n');

    const pred = await prisma.systemPrediction.deleteMany({});
    console.log(`   ✅ Deleted ${pred.count} SystemPrediction records`);

    const perf = await prisma.systemPerformance.deleteMany({});
    console.log(`   ✅ Deleted ${perf.count} SystemPerformance records`);

    console.log('\n✅ Tabelas limpas! Pronto para recalcular.\n');

    await prisma.$disconnect();
}

cleanTables().catch(console.error);
