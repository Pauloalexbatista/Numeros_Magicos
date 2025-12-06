import { prisma } from './src/lib/prisma';

async function analyzeAntiVortexPyramid() {
    console.log('🔍 Analyzing Anti-Vortex Pyramid (2004-2025)...\n');

    // Get all performances for Anti-Vortex Pyramid
    const performances = await prisma.systemPerformance.findMany({
        where: {
            systemName: 'Anti-Vortex Pyramid'
        },
        include: {
            draw: {
                select: {
                    date: true
                }
            }
        },
        orderBy: {
            draw: {
                date: 'asc'
            }
        }
    });

    console.log(`📊 Total performances: ${performances.length}\n`);

    // Group by year
    const yearlyStats: Record<number, {
        jackpots: number;
        highPrizes: number;
        total: number;
        hits: number[];
    }> = {};

    performances.forEach(perf => {
        const year = perf.draw.date.getFullYear();

        if (!yearlyStats[year]) {
            yearlyStats[year] = {
                jackpots: 0,
                highPrizes: 0,
                total: 0,
                hits: []
            };
        }

        yearlyStats[year].total++;
        yearlyStats[year].hits.push(perf.hits);

        if (perf.hits === 5) yearlyStats[year].jackpots++;
        if (perf.hits === 4) yearlyStats[year].highPrizes++;
    });

    // Display results
    console.log('📅 YEARLY PERFORMANCE (2004-2025)\n');
    console.log('Year | Draws | Jackpots (5) | High Prizes (4) | Avg Hits | Jackpot Rate');
    console.log('-----|-------|--------------|-----------------|----------|-------------');

    const years = Object.keys(yearlyStats).map(Number).sort();

    for (const year of years) {
        const stats = yearlyStats[year];
        const avgHits = (stats.hits.reduce((a, b) => a + b, 0) / stats.total).toFixed(2);
        const jackpotRate = ((stats.jackpots / stats.total) * 100).toFixed(2);

        console.log(
            `${year} | ${stats.total.toString().padStart(5)} | ${stats.jackpots.toString().padStart(12)} | ${stats.highPrizes.toString().padStart(15)} | ${avgHits.padStart(8)} | ${jackpotRate.padStart(11)}%`
        );
    }

    // Identify peaks and valleys
    console.log('\n\n🏔️ PEAKS & VALLEYS (Jackpots)\n');

    const jackpotsByYear = years.map(year => ({
        year,
        jackpots: yearlyStats[year].jackpots
    }));

    for (let i = 1; i < jackpotsByYear.length - 1; i++) {
        const prev = jackpotsByYear[i - 1].jackpots;
        const curr = jackpotsByYear[i].jackpots;
        const next = jackpotsByYear[i + 1].jackpots;

        if (curr > prev && curr > next) {
            console.log(`📈 PEAK: ${jackpotsByYear[i].year} (${curr} jackpots)`);
        } else if (curr < prev && curr < next) {
            console.log(`📉 VALLEY: ${jackpotsByYear[i].year} (${curr} jackpots)`);
        }
    }

    // Calculate time between peaks
    const peaks = [];
    for (let i = 1; i < jackpotsByYear.length - 1; i++) {
        const prev = jackpotsByYear[i - 1].jackpots;
        const curr = jackpotsByYear[i].jackpots;
        const next = jackpotsByYear[i + 1].jackpots;

        if (curr > prev && curr > next) {
            peaks.push(jackpotsByYear[i].year);
        }
    }

    if (peaks.length > 1) {
        console.log('\n⏱️ TIME BETWEEN PEAKS:\n');
        for (let i = 1; i < peaks.length; i++) {
            const gap = peaks[i] - peaks[i - 1];
            console.log(`${peaks[i - 1]} → ${peaks[i]}: ${gap} years`);
        }
    }

    await prisma.$disconnect();
}

analyzeAntiVortexPyramid()
    .catch(console.error);
