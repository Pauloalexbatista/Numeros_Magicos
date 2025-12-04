import { prisma } from '../lib/prisma';

async function main() {
    console.log('🌟 Analyzing Star Averages per Position (Casa)...');

    const draws = await prisma.draw.findMany({
        orderBy: { date: 'asc' }
    });

    console.log(`📊 Total Draws Analyzed: ${draws.length}`);

    let sumStar1 = 0;
    let sumStar2 = 0;
    let count = 0;

    const star1Frequency: Record<number, number> = {};
    const star2Frequency: Record<number, number> = {};

    for (const draw of draws) {
        try {
            // stars is stored as JSON string of sorted array e.g. "[2, 5]"
            const stars = JSON.parse(draw.stars);

            if (Array.isArray(stars) && stars.length >= 2) {
                const s1 = stars[0];
                const s2 = stars[1];

                sumStar1 += s1;
                sumStar2 += s2;
                count++;

                star1Frequency[s1] = (star1Frequency[s1] || 0) + 1;
                star2Frequency[s2] = (star2Frequency[s2] || 0) + 1;
            }
        } catch (e) {
            // ignore bad data
        }
    }

    if (count === 0) {
        console.log('No valid star data found.');
        return;
    }

    const avgStar1 = sumStar1 / count;
    const avgStar2 = sumStar2 / count;

    console.log('\n📐 Averages (Médias):');
    console.log(`   ⭐ Star 1 (1ª Casa): ${avgStar1.toFixed(2)}`);
    console.log(`   ⭐ Star 2 (2ª Casa): ${avgStar2.toFixed(2)}`);

    // Helper to find mode
    const getMode = (freq: Record<number, number>) => {
        return Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
    };

    const mode1 = getMode(star1Frequency);
    const mode2 = getMode(star2Frequency);

    console.log('\n🏆 Most Frequent (Moda):');
    console.log(`   ⭐ Star 1: ${mode1[0]} (appeared ${mode1[1]} times)`);
    console.log(`   ⭐ Star 2: ${mode2[0]} (appeared ${mode2[1]} times)`);
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
