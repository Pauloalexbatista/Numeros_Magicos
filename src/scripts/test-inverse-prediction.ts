import { prisma } from '../lib/prisma';

async function main() {
    console.log('🔄 INVERSE ANALYSIS: Is it easier to predict what WON\'T appear?\n');

    const allDraws = await prisma.draw.findMany({
        orderBy: { date: 'asc' }
    });

    const parsedDraws = allDraws.map(d => ({
        date: d.date,
        numbers: JSON.parse(d.numbers) as number[]
    }));

    // Test: Hot Numbers vs Anti-Hot Numbers
    function getHotNumbers(history: typeof parsedDraws): number[] {
        const frequency: Record<number, number> = {};

        history.forEach(draw => {
            draw.numbers.forEach(num => {
                frequency[num] = (frequency[num] || 0) + 1;
            });
        });

        return Object.entries(frequency)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 25)
            .map(([num]) => parseInt(num));
    }

    function getColdNumbers(history: typeof parsedDraws): number[] {
        const frequency: Record<number, number> = {};

        // Initialize all
        for (let i = 1; i <= 50; i++) frequency[i] = 0;

        history.forEach(draw => {
            draw.numbers.forEach(num => {
                frequency[num] = (frequency[num] || 0) + 1;
            });
        });

        return Object.entries(frequency)
            .sort(([, a], [, b]) => a - b)
            .slice(0, 25)
            .map(([num]) => parseInt(num));
    }

    let hotHits = 0;
    let coldHits = 0;
    let hotMisses = 0; // Numbers that DIDN'T appear (correct anti-prediction)
    let coldMisses = 0;
    let totalTests = 0;

    const testStart = Math.max(100, parsedDraws.length - 100);

    console.log(`Testing ${parsedDraws.length - testStart} draws`);
    console.log('='.repeat(70));

    for (let i = testStart; i < parsedDraws.length; i++) {
        const history = parsedDraws.slice(0, i);
        if (history.length < 50) continue;

        const hotNumbers = getHotNumbers(history);
        const coldNumbers = getColdNumbers(history);

        const actual = parsedDraws[i].numbers;
        const allNumbers = Array.from({ length: 50 }, (_, i) => i + 1);
        const notDrawn = allNumbers.filter(n => !actual.includes(n)); // 45 numbers

        // HOT: How many of the predicted 25 appeared?
        const hotCorrect = actual.filter(n => hotNumbers.includes(n)).length;
        hotHits += hotCorrect;

        // HOT INVERSE: How many of the predicted 25 did NOT appear? (should be high)
        const hotNotAppeared = hotNumbers.filter(n => !actual.includes(n)).length;
        hotMisses += hotNotAppeared;

        // COLD: How many of the predicted 25 appeared?
        const coldCorrect = actual.filter(n => coldNumbers.includes(n)).length;
        coldHits += coldCorrect;

        // COLD INVERSE: How many of the predicted 25 did NOT appear? (ideally high)
        const coldNotAppeared = coldNumbers.filter(n => !actual.includes(n)).length;
        coldMisses += coldNotAppeared;

        totalTests++;

        if (totalTests <= 10 || totalTests % 20 === 0) {
            console.log(`Draw ${i}: Hot=${hotCorrect}/5 appeared | Cold=${coldCorrect}/5 appeared`);
        }
    }

    console.log('\n' + '='.repeat(70));
    console.log('📊 HOT vs COLD NUMBERS ANALYSIS');
    console.log('='.repeat(70));

    const hotAccuracy = (hotHits / (totalTests * 5)) * 100;
    const coldAccuracy = (coldHits / (totalTests * 5)) * 100;
    const hotInverseAccuracy = (hotMisses / (totalTests * 25)) * 100;
    const coldInverseAccuracy = (coldMisses / (totalTests * 25)) * 100;

    console.log(`\n🔥 HOT NUMBERS (bet they WILL appear):`);
    console.log(`   Hits: ${hotHits}/${totalTests * 5} = ${hotAccuracy.toFixed(1)}%`);

    console.log(`\n❄️ COLD NUMBERS (bet they WILL appear):`);
    console.log(`   Hits: ${coldHits}/${totalTests * 5} = ${coldAccuracy.toFixed(1)}%`);

    console.log(`\n🔄 INVERSE LOGIC:`);
    console.log(`\n   🔥 HOT (predict they WON'T appear):`);
    console.log(`      Correctly avoided: ${hotMisses}/${totalTests * 25} = ${hotInverseAccuracy.toFixed(1)}%`);
    console.log(`      (If we bet AGAINST hot numbers, we'd be right ${hotInverseAccuracy.toFixed(1)}% of the time)`);

    console.log(`\n   ❄️ COLD (predict they WON'T appear):`);
    console.log(`      Correctly avoided: ${coldMisses}/${totalTests * 25} = ${coldInverseAccuracy.toFixed(1)}%`);
    console.log(`      (If we bet AGAINST cold numbers, we'd be right ${coldInverseAccuracy.toFixed(1)}% of the time)`);

    console.log(`\n💡 KEY INSIGHT:`);
    if (coldInverseAccuracy > hotInverseAccuracy) {
        console.log(`   ✅ COLD numbers are ${(coldInverseAccuracy - hotInverseAccuracy).toFixed(1)}% MORE predictable for EXCLUSION!`);
        console.log(`   → Strategy: Use COLD NUMBERS to know what WON'T appear (${coldInverseAccuracy.toFixed(1)}% reliable)`);
    } else if (hotInverseAccuracy > coldInverseAccuracy) {
        console.log(`   ✅ HOT numbers are ${(hotInverseAccuracy - coldInverseAccuracy).toFixed(1)}% MORE predictable for EXCLUSION!`);
        console.log(`   → Strategy: Use HOT NUMBERS to narrow down (avoid them)`);
    } else {
        console.log(`   ⚠️ Both are equally (un)predictable for exclusion.`);
    }

    console.log(`\n🎯 PRACTICAL USE:`);
    console.log(`   If Cold Inverse = ${coldInverseAccuracy.toFixed(0)}%:`);
    console.log(`   → ~${Math.round(25 * coldInverseAccuracy / 100)} of the 25 cold numbers won't appear`);
    console.log(`   → Leaves ~${50 - Math.round(25 * coldInverseAccuracy / 100)} numbers to consider`);
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
