
import { prisma } from '@/lib/prisma';
import { rankedSystems } from '@/services/ranked-systems';

async function main() {
    console.log('🔍 Checking predictions for Draw 02/12/2025...');
    console.log('Winning Numbers: 4, 13, 14, 20, 41');

    const winningNumbers = [4, 13, 14, 20, 41];
    const history = await prisma.draw.findMany({
        orderBy: { date: 'desc' }
    });

    console.log(`📚 History size: ${history.length} draws.`);

    let bestSystem = null;
    let maxHits = 0;

    for (const system of rankedSystems) {
        try {
            // Generate prediction
            // Note: Some systems might be slow, but we optimized ML models to be read-only!
            const prediction = await system.generateTop10(history);

            // Check hits
            const hits = prediction.filter(n => winningNumbers.includes(n)).length;

            if (hits >= 4) {
                console.log(`✨ [${system.name}] Hits: ${hits}/5`);
                console.log(`   Prediction: ${prediction.sort((a, b) => a - b).join(', ')}`);
            }

            if (hits > maxHits) {
                maxHits = hits;
                bestSystem = system.name;
            }

            if (hits === 5) {
                console.log(`🎉🎉🎉 JACKPOT! System [${system.name}] got ALL 5 numbers!`);
            }

        } catch (error) {
            console.error(`❌ Error in system ${system.name}:`, error);
        }
    }

    console.log('-----------------------------------');
    console.log(`🏆 Best Performance: ${maxHits}/5 by ${bestSystem}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
