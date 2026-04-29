
import { prisma } from '../lib/prisma';

async function auditSpecialCounts() {
    console.log('📊 AUDITORIA: Contagem de Números Especiais na Base de Dados\n');
    console.log('═'.repeat(60));

    // Buscar todos os sistemas com domínio STARS no RankedSystem
    const starSystems = await prisma.rankedSystem.findMany({
        where: { domain: 'STARS' }
    });

    console.log(`Encontrados ${starSystems.length} sistemas de Estrelas/Especiais.\n`);

    const games = ['EUROMILLIONS', 'TOTOLOTO', 'EURODREAMS'];

    for (const game of games) {
        console.log(`📍 JOGO: ${game}`);
        
        // Buscar predições em cache para este jogo
        const predictions = await prisma.cachedPrediction.findMany({
            where: {
                game: game,
                systemName: { in: starSystems.map(s => s.name) }
            }
        });

        if (predictions.length === 0) {
            console.log('   (Sem predições em cache para este jogo)\n');
            continue;
        }

        const counts: Record<number, number> = {};
        predictions.forEach(p => {
            const nums = JSON.parse(p.numbers);
            const len = nums.length;
            counts[len] = (counts[len] || 0) + 1;
        });

        Object.entries(counts).forEach(([len, count]) => {
            console.log(`   → Sugerindo ${len} números em ${count} sistemas.`);
        });
        console.log('');
    }

    console.log('═'.repeat(60));
    await prisma.$disconnect();
}

auditSpecialCounts().catch(console.error);
