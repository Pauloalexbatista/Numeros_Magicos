import { prisma } from './src/lib/prisma';
import * as fs from 'fs';
import * as path from 'path';

interface YearlyStats {
    year: number;
    total: number;
    jackpots: number;
    highPrizes: number;
    avgHits: number;
    jackpotRate: number;
}

interface Peak {
    year: number;
    jackpots: number;
    type: 'peak' | 'valley';
}

interface AnalysisResult {
    systemName: string;
    totalPerformances: number;
    yearlyData: YearlyStats[];
    peaks: Peak[];
    valleys: Peak[];
    cyclePattern: {
        averageGap: number;
        gaps: number[];
    };
    predictions: {
        year: number;
        prediction: string;
        confidence: 'high' | 'medium' | 'low';
    }[];
}

async function analyzeSystem(systemName: string): Promise<AnalysisResult> {
    console.log(`🔍 Analyzing ${systemName}...\n`);

    // Get all performances
    const performances = await prisma.systemPerformance.findMany({
        where: { systemName },
        include: {
            draw: {
                select: { date: true }
            }
        },
        orderBy: {
            draw: { date: 'asc' }
        }
    });

    if (performances.length === 0) {
        throw new Error(`No performances found for ${systemName}`);
    }

    console.log(`📊 Total performances: ${performances.length}\n`);

    // Group by year
    const yearlyStats: Record<number, {
        total: number;
        jackpots: number;
        highPrizes: number;
        hits: number[];
    }> = {};

    performances.forEach(perf => {
        const year = perf.draw.date.getFullYear();

        if (!yearlyStats[year]) {
            yearlyStats[year] = {
                total: 0,
                jackpots: 0,
                highPrizes: 0,
                hits: []
            };
        }

        yearlyStats[year].total++;
        yearlyStats[year].hits.push(perf.hits);

        if (perf.hits === 5) yearlyStats[year].jackpots++;
        if (perf.hits === 4) yearlyStats[year].highPrizes++;
    });

    // Convert to array
    const years = Object.keys(yearlyStats).map(Number).sort();
    const yearlyData: YearlyStats[] = years.map(year => {
        const stats = yearlyStats[year];
        const avgHits = stats.hits.reduce((a, b) => a + b, 0) / stats.total;
        const jackpotRate = (stats.jackpots / stats.total) * 100;

        return {
            year,
            total: stats.total,
            jackpots: stats.jackpots,
            highPrizes: stats.highPrizes,
            avgHits: Number(avgHits.toFixed(2)),
            jackpotRate: Number(jackpotRate.toFixed(2))
        };
    });

    // Detect peaks and valleys
    const peaks: Peak[] = [];
    const valleys: Peak[] = [];

    for (let i = 1; i < yearlyData.length - 1; i++) {
        const prev = yearlyData[i - 1].jackpots;
        const curr = yearlyData[i].jackpots;
        const next = yearlyData[i + 1].jackpots;

        if (curr > prev && curr > next) {
            peaks.push({
                year: yearlyData[i].year,
                jackpots: curr,
                type: 'peak'
            });
        } else if (curr < prev && curr < next) {
            valleys.push({
                year: yearlyData[i].year,
                jackpots: curr,
                type: 'valley'
            });
        }
    }

    // Calculate cycle pattern
    const gaps: number[] = [];
    for (let i = 1; i < peaks.length; i++) {
        gaps.push(peaks[i].year - peaks[i - 1].year);
    }
    const averageGap = gaps.length > 0
        ? Number((gaps.reduce((a, b) => a + b, 0) / gaps.length).toFixed(1))
        : 0;

    // Generate predictions
    const currentYear = new Date().getFullYear();
    const lastPeak = peaks[peaks.length - 1];
    const predictions = [];

    if (lastPeak && averageGap > 0) {
        const yearsSinceLastPeak = currentYear - lastPeak.year;

        if (yearsSinceLastPeak < averageGap) {
            // Still in peak or descending
            predictions.push({
                year: currentYear + 1,
                prediction: 'Vale esperado (descida após pico)',
                confidence: 'high' as const
            });
        } else {
            // Approaching next peak
            predictions.push({
                year: currentYear + 1,
                prediction: 'Possível novo pico',
                confidence: 'medium' as const
            });
        }
    }

    return {
        systemName,
        totalPerformances: performances.length,
        yearlyData,
        peaks,
        valleys,
        cyclePattern: {
            averageGap,
            gaps
        },
        predictions
    };
}

async function generateReport(systemName: string) {
    const result = await analyzeSystem(systemName);

    // Save JSON
    const jsonPath = path.join(__dirname, 'analysis-results', `${systemName.replace(/\s+/g, '-')}.json`);
    fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
    fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2));

    console.log(`\n✅ Analysis complete!`);
    console.log(`📄 JSON saved to: ${jsonPath}`);

    // Display summary
    console.log(`\n📊 SUMMARY:`);
    console.log(`- Total performances: ${result.totalPerformances}`);
    console.log(`- Years analyzed: ${result.yearlyData.length}`);
    console.log(`- Peaks detected: ${result.peaks.length}`);
    console.log(`- Valleys detected: ${result.valleys.length}`);
    console.log(`- Average cycle: ${result.cyclePattern.averageGap} years`);

    return result;
}

// Main execution
const systemName = process.argv[2] || 'Anti-Vortex Pyramid';

generateReport(systemName)
    .then(() => prisma.$disconnect())
    .catch(error => {
        console.error('Error:', error);
        prisma.$disconnect();
        process.exit(1);
    });
