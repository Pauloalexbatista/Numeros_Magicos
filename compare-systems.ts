import * as fs from 'fs';
import * as path from 'path';

interface YearlyStats {
    year: number;
    jackpots: number;
    highPrizes: number;
    avgHits: number;
    jackpotRate: number;
}

interface AnalysisResult {
    systemName: string;
    totalPerformances: number;
    yearlyData: YearlyStats[];
    peaks: { year: number; jackpots: number; type: string }[];
    valleys: { year: number; jackpots: number; type: string }[];
}

function loadAnalysis(systemName: string): AnalysisResult {
    const fileName = systemName.replace(/\s+/g, '-');
    const filePath = path.join(__dirname, 'analysis-results', `${fileName}.json`);
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function analyzeExtremes(system1Name: string, system2Name: string) {
    console.log(`🔍 Analyzing EXTREMES: ${system1Name} vs ${system2Name}\n`);

    const analysis1 = loadAnalysis(system1Name);
    const analysis2 = loadAnalysis(system2Name);

    console.log('📊 EXTREME YEARS ANALYSIS\n');
    console.log('When one system has HIGH jackpots, does the other have LOW jackpots?\n');

    const years = analysis1.yearlyData.map(d => d.year);
    let inverseExtremes = 0;
    let totalExtremes = 0;

    console.log('Year | ' + system1Name.padEnd(12) + ' | ' + system2Name.padEnd(12) + ' | Analysis');
    console.log('-----|' + '-'.repeat(12) + '-|-' + '-'.repeat(12) + '-|----------');

    years.forEach(year => {
        const data1 = analysis1.yearlyData.find(d => d.year === year);
        const data2 = analysis2.yearlyData.find(d => d.year === year);

        if (data1 && data2) {
            // Define "high" as >= 5 jackpots, "low" as <= 1 jackpot
            const isHigh1 = data1.jackpots >= 5;
            const isLow1 = data1.jackpots <= 1;
            const isHigh2 = data2.jackpots >= 5;
            const isLow2 = data2.jackpots <= 1;

            let analysis = '';
            let isExtreme = false;

            if (isHigh1 && isLow2) {
                analysis = '⚡ HIGH vs LOW';
                inverseExtremes++;
                isExtreme = true;
            } else if (isLow1 && isHigh2) {
                analysis = '⚡ LOW vs HIGH';
                inverseExtremes++;
                isExtreme = true;
            } else if (isHigh1 && isHigh2) {
                analysis = '🔄 Both HIGH';
                isExtreme = true;
            } else if (isLow1 && isLow2) {
                analysis = '🔄 Both LOW';
                isExtreme = true;
            } else {
                analysis = '- Normal';
            }

            if (isExtreme) totalExtremes++;

            const marker1 = isHigh1 ? '🔥' : isLow1 ? '❄️' : '  ';
            const marker2 = isHigh2 ? '🔥' : isLow2 ? '❄️' : '  ';

            console.log(
                `${year} | ${marker1} ${data1.jackpots.toString().padStart(2)}`.padEnd(15) +
                `| ${marker2} ${data2.jackpots.toString().padStart(2)}`.padEnd(15) +
                `| ${analysis}`
            );
        }
    });

    console.log('\n🎯 EXTREME CORRELATION ANALYSIS\n');
    console.log(`Total Extreme Years: ${totalExtremes}`);
    console.log(`Inverse Extremes (High vs Low): ${inverseExtremes}`);
    console.log(`Same Extremes (Both High/Low): ${totalExtremes - inverseExtremes}`);

    if (totalExtremes > 0) {
        const inversePercentage = ((inverseExtremes / totalExtremes) * 100).toFixed(1);
        console.log(`\n${inversePercentage}% of extreme years show INVERSE behavior!`);

        if (parseFloat(inversePercentage) > 60) {
            console.log('\n✅ STRONG INVERSE CORRELATION in extremes!');
            console.log('When one system is HOT (≥5 jackpots), the other is COLD (≤1 jackpot)');
        } else if (parseFloat(inversePercentage) > 40) {
            console.log('\n⚠️ MODERATE INVERSE CORRELATION in extremes');
        } else {
            console.log('\n❌ WEAK INVERSE CORRELATION in extremes');
        }
    }

    // Detailed extreme years
    console.log('\n📋 DETAILED EXTREME YEARS:\n');

    const extremeYears = years.filter(year => {
        const data1 = analysis1.yearlyData.find(d => d.year === year);
        const data2 = analysis2.yearlyData.find(d => d.year === year);
        if (!data1 || !data2) return false;

        const isHigh1 = data1.jackpots >= 5;
        const isLow1 = data1.jackpots <= 1;
        const isHigh2 = data2.jackpots >= 5;
        const isLow2 = data2.jackpots <= 1;

        return (isHigh1 && isLow2) || (isLow1 && isHigh2);
    });

    extremeYears.forEach(year => {
        const data1 = analysis1.yearlyData.find(d => d.year === year)!;
        const data2 = analysis2.yearlyData.find(d => d.year === year)!;

        console.log(`${year}:`);
        console.log(`  ${system1Name}: ${data1.jackpots} jackpots (${data1.jackpotRate}%)`);
        console.log(`  ${system2Name}: ${data2.jackpots} jackpots (${data2.jackpotRate}%)`);
        console.log(`  → Difference: ${Math.abs(data1.jackpots - data2.jackpots)} jackpots\n`);
    });
}

const system1 = process.argv[2] || 'Anti-Vortex Pyramid';
const system2 = process.argv[3] || 'Vortex Pyramid';

try {
    analyzeExtremes(system1, system2);
} catch (error: any) {
    console.error('Error:', error.message);
    process.exit(1);
}
