
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL || 'file:./prisma/dev.db'
        }
    }
});

async function main() {
    console.log("🧹 INICIANDO LIMPEZA DE DADOS...");

    // 1. Apagar Cartões Específicos
    const cardsToDelete = [
        'Sistema Bronze',
        'Sistema Ouro',
        'Sistema Prata',
        'Top Sistemas',
        'Padrões Estrelas'
    ];

    console.log(`\n🗑️ Apagando ${cardsToDelete.length} Cartões de Dashboard...`);
    const deleteResult = await prisma.dashboardCard.deleteMany({
        where: {
            title: { in: cardsToDelete }
        }
    });
    console.log(`✅ ${deleteResult.count} cartões apagados.`);

    // 2. Apagar Sistemas Inativos
    console.log("\n🗑️ Apagando Sistemas Inativos...");
    // Primeiro apagamos os dados dependentes (Performance, Predictions)
    // Nota: O Cascade Delete deve tratar disto, mas por segurança podemos limpar manualmente se falhar

    const inactiveSystems = await prisma.rankedSystem.findMany({
        where: { isActive: false },
        select: { name: true }
    });

    if (inactiveSystems.length > 0) {
        const names = inactiveSystems.map(s => s.name);
        console.log(`   Alvos: ${names.length} sistemas (${names.slice(0, 3).join(', ')}...)`);

        // Apagar Performances
        await prisma.systemPerformance.deleteMany({ where: { systemName: { in: names } } });
        await prisma.systemPrediction.deleteMany({ where: { systemName: { in: names } } });
        await prisma.cachedPrediction.deleteMany({ where: { systemName: { in: names } } });
        await prisma.systemRanking.deleteMany({ where: { systemName: { in: names } } });

        // Apagar o Sistema
        const sysDelete = await prisma.rankedSystem.deleteMany({
            where: { name: { in: names } }
        });
        console.log(`✅ ${sysDelete.count} sistemas inativos apagados.`);
    } else {
        console.log("   Nenhum sistema inativo encontrado.");
    }

    console.log("\n✨ Limpeza de Base de Dados Concluída!");
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
