
import { prisma } from '../../lib/prisma';
import { onNewDrawAdded, updateRanking } from '../../services/ranking-evaluator';

async function backfillRankings() {
    // Get game from command line argument (e.g. npx tsx backfill-rankings.ts TOTOLOTO)
    const targetGame = process.argv[2]?.toUpperCase();
    
    console.log('🚀 Starting Systems Re-evaluation...');
    if (targetGame) console.log(`🎯 Target Game: ${targetGame}`);

    const allGames = ['EUROMILLIONS', 'EURODREAMS', 'TOTOLOTO'];
    const games = targetGame ? allGames.filter(g => g === targetGame) : allGames;

    if (targetGame && !allGames.includes(targetGame)) {
        console.error(`❌ Invalid game: ${targetGame}. Choose from: ${allGames.join(', ')}`);
        process.exit(1);
    }

    for (const game of games) {
        console.log(`\n--- Processing ${game} ---`);
        
        // Get last 50 draws for this game
        const draws = await prisma.draw.findMany({
            where: { game },
            orderBy: { date: 'desc' },
            take: 50
        });

        console.log(`Found ${draws.length} draws. Re-evaluating...`);

        // Reverse to process from oldest to newest
        const chronologicalDraws = draws.reverse();

        for (const draw of chronologicalDraws) {
            process.stdout.write(`Evaluating ${draw.date.toISOString().split('T')[0]}... `);
            try {
                // Using onNewDrawAdded which already evaluates all active systems
                await onNewDrawAdded(draw);
                console.log('✅');
            } catch (e) {
                console.log('❌');
            }
        }
        
        await updateRanking(game);
    }

    console.log('\n✨ Re-evaluation Phase Complete!');
}

backfillRankings()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
