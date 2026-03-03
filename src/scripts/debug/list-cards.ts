
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL || 'file:./prisma/dev.db'
        }
    }
});

async function main() {
    console.log("🔍 LISTA DE CARTÕES ATIVOS NO DASHBOARD...");

    const allCards = await prisma.dashboardCard.findMany({
        orderBy: { title: 'asc' },
        select: { id: true, title: true, type: true, description: true }
    });

    console.log(`\n📋 TOTAL: ${allCards.length} Cartões\n`);

    // Categorias sugeridas pelo user
    const stars = allCards.filter(c => c.title.toLowerCase().includes('star') || c.title.toLowerCase().includes('estrela'));
    const random = allCards.filter(c => c.title.toLowerCase().includes('random') || c.title.toLowerCase().includes('aleat'));
    const neural = allCards.filter(c => c.title.toLowerCase().includes('neural') || c.title.toLowerCase().includes('lstm') || c.title.toLowerCase().includes('ai'));
    const systems = allCards.filter(c => c.title.toLowerCase().includes('sistema') || c.title.toLowerCase().includes('system') || c.title.toLowerCase().includes('ensemble'));

    // O resto (Base/Outros)
    const categorizedIds = new Set([
        ...stars.map(c => c.id),
        ...random.map(c => c.id),
        ...neural.map(c => c.id),
        ...systems.map(c => c.id)
    ]);
    const others = allCards.filter(c => !categorizedIds.has(c.id));

    console.log("⭐ ESTRELAS (Para apagar?):");
    stars.forEach(c => console.log(`   - [${c.type}] ${c.title}`));

    console.log("\n🎲 RANDOM/ALEATÓRIO (Para apagar?):");
    random.forEach(c => console.log(`   - [${c.type}] ${c.title}`));

    console.log("\n🧠 NEURAL/AI (Para apagar?):");
    neural.forEach(c => console.log(`   - [${c.type}] ${c.title}`));

    console.log("\n⚙️ SISTEMAS/ENSEMBLES (Para apagar?):");
    systems.forEach(c => console.log(`   - [${c.type}] ${c.title}`));

    console.log("\n📌 OUTROS (Manter?):");
    others.forEach(c => console.log(`   - [${c.type}] ${c.title}`));

}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
