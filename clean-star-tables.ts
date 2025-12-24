import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanStarTables() {
    console.log('🗑️  Limpando tabela StarSystemPerformance...\n');

    const perf = await prisma.starSystemPerformance.deleteMany({});
    console.log(`   ✅ Deleted ${perf.count} StarSystemPerformance records`);

    console.log('\n✅ Tabela limpa! Pronto para recalcular estrelas.\n');

    await prisma.$disconnect();
}

cleanStarTables().catch(console.error);
