
import { prisma } from '../lib/prisma';

async function main() {
    console.log('🔍 Auditing LSTM Neural Net Jackpots...');

    // 1. Get total count
    const count = await prisma.systemPrediction.count({
        where: {
            systemName: 'LSTM Neural Net',
            jackpot: true
        }
    });

    console.log(`\n🏆 Total Jackpots found in DB: ${count}`);

    // 2. Exploded list
    const jackpots = await prisma.systemPrediction.findMany({
        where: {
            systemName: 'LSTM Neural Net',
            jackpot: true
        },
        include: {
            draw: true
        },
        orderBy: {
            draw: { date: 'desc' }
        }
    });

    console.log('\n📅 List of Jackpots (Last 20 shown, full list saved to check):');
    jackpots.forEach((jp, index) => {
        // Show all of them since user asked "list all 73"
        // But for console view I'll just print them.
        const matches = JSON.parse(jp.prediction).filter((n: number) =>
            (jp.draw.numbers as unknown as number[]).includes(n)
        );
        console.log(`#${index + 1} | Draw ${jp.drawId} (${jp.draw.date.toLocaleDateString()}) | Hits: ${jp.hits} | Numbers: ${jp.prediction}`);
    });

    if (count === 0) {
        console.log('⚠️ No jackpots found. Checking "hits=5" directly in SystemPerformance...');
        const performanceJackpots = await prisma.systemPerformance.findMany({
            where: {
                systemName: 'LSTM Neural Net',
                hits: 5
            },
            take: 5
        });
        console.log(`Found ${performanceJackpots.length} entries with 5 hits in SystemPerformance.`);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
