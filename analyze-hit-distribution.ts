import { prisma } from './src/lib/prisma';

interface HitDistribution {
    year: number;
    hits0: number;
    hits1: number;
    hits2: number;
    hits3: number;
    hits4: number;
    hits5: number;
    total: number;
}

async function analyzeHitDistribution(systemName: string): Promise<HitDistribution[]> {
    const performances = await prisma.systemPerformance.findMany({
        where: { systemName },
        include: {
            draw: { select: { date: true } }
        },
        orderBy: {
            draw: { date: 'asc' }
        }
    });

    const yearlyHits: Record<number, number[]> = {};

    performances.forEach(perf => {
        const year = perf.draw.date.getFullYear();
        if (!yearlyHits[year]) yearlyHits[year] = [];
        yearlyHits[year].push(perf.hits);
    });

    return Object.keys(yearlyHits).map(Number).sort().map(year => {
        const hits = yearlyHits[year];
        return {
            year,
            hits0: hits.filter(h => h === 0).length,
            hits1: hits.filter(h => h === 1).length,
            hits2: hits.filter(h => h === 2).length,
            hits3: hits.filter(h => h === 3).length,
            hits4: hits.filter(h => h === 4).length,
            hits5: hits.filter(h => h === 5).length,
            total: hits.length
        };
    });
}

async function compareHitDistributions(system1: string, system2: string) {
    console.log(`🔍 Comparing Hit Distributions: ${system1} vs ${system2}\n`);

    const dist1 = await analyzeHitDistribution(system1);
    const dist2 = await analyzeHitDistribution(system2);

    console.log('📊 YEAR-BY-YEAR HIT DISTRIBUTION COMPARISON\n');
    console.log('Year | System 1 (0-1-2-3-4-5) | System 2 (0-1-2-3-4-5) | Inverse Pattern?');
    console.log('-----|------------------------|------------------------|------------------');

    let inverseYears = 0;
    let totalYears = 0;

    dist1.forEach(d1 => {
        const d2 = dist2.find(d => d.year === d1.year);
        if (!d2) return;

        totalYears++;

        // Check for inverse pattern: when S1 has many 5s, S2 should have many 0s
        const s1High = d1.hits5 >= 5;
        const s1Low = d1.hits5 <= 1;
        const s2High = d2.hits5 >= 5;
        const s2Low = d2.hits5 <= 1;

        let pattern = '';
        if ((s1High && s2Low) || (s1Low && s2High)) {
            pattern = '⚡ YES';
            inverseYears++;
        } else if ((s1High && s2High) || (s1Low && s2Low)) {
            pattern = '🔄 SAME';
        } else {
            pattern = '- Normal';
        }

        console.log(
            `${d1.year} | ${d1.hits0}-${d1.hits1}-${d1.hits2}-${d1.hits3}-${d1.hits4}-${d1.hits5}`.padEnd(26) +
            `| ${d2.hits0}-${d2.hits1}-${d2.hits2}-${d2.hits3}-${d2.hits4}-${d2.hits5}`.padEnd(26) +
            `| ${pattern}`
        );
    });

    console.log('\n🎯 CORRELATION ANALYSIS\n');
    console.log(`Total Years: ${totalYears}`);
    console.log(`Inverse Pattern Years: ${inverseYears}`);
    console.log(`Percentage: ${((inverseYears / totalYears) * 100).toFixed(1)}%`);

    // Detailed analysis for extreme years
    console.log('\n📋 DETAILED EXTREME YEARS:\n');

    dist1.forEach(d1 => {
        const d2 = dist2.find(d => d.year === d1.year);
        if (!d2) return;

        const s1High = d1.hits5 >= 5;
        const s2Low = d2.hits5 <= 1;
        const s1Low = d1.hits5 <= 1;
        const s2High = d2.hits5 >= 5;

        if ((s1High && s2Low) || (s1Low && s2High)) {
            console.log(`${d1.year}:`);
            console.log(`  ${system1}:`);
            console.log(`    Jackpots (5): ${d1.hits5}`);
            console.log(`    High (4): ${d1.hits4}`);
            console.log(`    Medium (3): ${d1.hits3}`);
            console.log(`    Low (0-1-2): ${d1.hits0 + d1.hits1 + d1.hits2}`);
            console.log(`  ${system2}:`);
            console.log(`    Jackpots (5): ${d2.hits5}`);
            console.log(`    High (4): ${d2.hits4}`);
            console.log(`    Medium (3): ${d2.hits3}`);
            console.log(`    Low (0-1-2): ${d2.hits0 + d2.hits1 + d2.hits2}`);
            console.log(`  → Inverse: ${s1High ? 'S1 HIGH, S2 LOW' : 'S1 LOW, S2 HIGH'}\n`);
        }
    });
}

const system1 = process.argv[2] || 'Anti-Vortex Pyramid';
const system2 = process.argv[3] || 'Vortex Pyramid';

compareHitDistributions(system1, system2)
    .then(() => prisma.$disconnect())
    .catch(error => {
        console.error('Error:', error);
        prisma.$disconnect();
        process.exit(1);
    });
