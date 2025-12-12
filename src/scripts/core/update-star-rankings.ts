
import { prisma } from '@/lib/prisma';
import { starSystems } from '@/services/star-systems';

async function updateStarRankings() {
    console.log('⭐ ATUALIZAÇÃO DE RANKINGS DE ESTRELAS');
    console.log('═'.repeat(60));

    // Get all performances
    const performances = await prisma.starSystemPerformance.findMany();
    console.log(`📊 Total de registos de performance: ${performances.length}`);

    if (performances.length === 0) {
        console.log('⚠️ Sem dados de performance para analisar.');
        return;
    }

    for (const system of starSystems) {
        // Filter for this system
        const systemPerfs = performances.filter(p => p.systemName === system.name);

        if (systemPerfs.length === 0) continue;

        const total = systemPerfs.length;
        const totalHits = systemPerfs.reduce((sum, p) => sum + p.hits, 0);
        const jackpots = systemPerfs.filter(p => p.hits === 2).length;

        // Accuracy: (Total Hits / (Total Draws * 2)) * 100
        // Because each draw has 2 possible hits
        const accuracy = (totalHits / (total * 2)) * 100;

        console.log(`Analyzing ${system.name}:`);
        console.log(` - Draws: ${total}`);
        console.log(` - Hits: ${totalHits}`);
        console.log(` - Jackpots: ${jackpots}`);
        console.log(` - Accuracy: ${accuracy.toFixed(2)}%`);

        // Update Ranking Table
        await prisma.starSystemRanking.upsert({
            where: { systemName: system.name },
            update: {
                avgAccuracy: accuracy,
                totalPredictions: total,
                totalHits: totalHits,
                jackpots: jackpots, // Ensure schema has this, otherwise fallback or add field
                lastUpdated: new Date()
            },
            create: {
                systemName: system.name,
                avgAccuracy: accuracy,
                totalPredictions: total,
                totalHits: totalHits,
                jackpots: jackpots
            }
        });
    }

    console.log('\n✅ Rankings atualizados com sucesso!');
}

updateStarRankings()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
