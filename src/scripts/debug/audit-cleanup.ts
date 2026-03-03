
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL || 'file:./prisma/dev.db'
        }
    }
});

async function main() {
    console.log("🔍 INICIANDO AUDITORIA DE LIMPEZA...\n");

    // 1. Sistemas
    const totalSystems = await prisma.rankedSystem.count();
    const activeSystems = await prisma.rankedSystem.count({ where: { isActive: true } });
    const inactiveSystems = await prisma.rankedSystem.findMany({
        where: { isActive: false },
        select: { name: true, game: true }
    });

    console.log(`📊 SISTEMAS (${totalSystems} total)`);
    console.log(`✅ Ativos: ${activeSystems}`);
    console.log(`❌ Inativos: ${inactiveSystems.length}`);
    if (inactiveSystems.length > 0) {
        console.log("   (Exemplos: " + inactiveSystems.slice(0, 5).map(s => s.name).join(", ") + (inactiveSystems.length > 5 ? "..." : "") + ")");
    }
    console.log("");

    // 2. Dashboard Cards
    const totalCards = await prisma.dashboardCard.count();
    const inactiveCards = await prisma.dashboardCard.findMany({
        where: { isActive: false },
        select: { title: true, type: true }
    });

    console.log(`🃏 DASHBOARD CARDS (${totalCards} total)`);
    console.log(`✅ Ativos: ${totalCards - inactiveCards.length}`);
    console.log(`❌ Inativos: ${inactiveCards.length}`);
    inactiveCards.forEach(c => console.log(`   - [${c.type}] ${c.title}`));
    console.log("");

    // 3. Admin Users (Para limpeza de Admin)
    const adminUsers = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { email: true, name: true }
    });
    console.log(`👤 ADMINS (${adminUsers.length})`);
    adminUsers.forEach(u => console.log(`   - ${u.name} (${u.email})`));
    console.log("");

    // 4. ML Models (Se existirem)
    const mlModels = await prisma.mLModelTraining.count();
    console.log(`🧠 ML MODELS: ${mlModels}`);

}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
