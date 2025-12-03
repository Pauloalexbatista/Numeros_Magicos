import { prisma } from '../lib/prisma';

async function main() {
    console.log('🎯 FINDING 100% EXCLUSION RULES\n');

    const allDraws = await prisma.draw.findMany({
        orderBy: { date: 'asc' }
    });

    const parsedDraws = allDraws.map(d => ({
        date: d.date,
        numbers: JSON.parse(d.numbers) as number[]
    }));

    // Test different exclusion rules
    const rules = {
        'Coldest Number (never appeared in last 50)': {
            correct: 0,
            total: 0,
            predict: (history: typeof parsedDraws, lastDraw: number[]) => {
                const recent50 = history.slice(-50);
                const appeared = new Set<number>();
                recent50.forEach(d => d.numbers.forEach(n => appeared.add(n)));

                // Find numbers that never appeared
                const neverAppeared = [];
                for (let i = 1; i <= 50; i++) {
                    if (!appeared.has(i)) neverAppeared.push(i);
                }

                return neverAppeared.length > 0 ? neverAppeared[0] : null;
            }
        },
        'Number that appeared 3+ times in last 5': {
            correct: 0,
            total: 0,
            predict: (history: typeof parsedDraws, lastDraw: number[]) => {
                const recent5 = history.slice(-5);
                const freq: Record<number, number> = {};

                recent5.forEach(d => {
                    d.numbers.forEach(n => {
                        freq[n] = (freq[n] || 0) + 1;
                    });
                });

                // Number that appeared 3+ times in last 5 (very hot, likely to cool)
                for (const [num, count] of Object.entries(freq)) {
                    if (count >= 3) return parseInt(num);
                }
                return null;
            }
        },
        'Last draw repeated number (if 2+ same)': {
            correct: 0,
            total: 0,
            predict: (history: typeof parsedDraws, lastDraw: number[]) => {
                const freq: Record<number, number> = {};
                lastDraw.forEach(n => freq[n] = (freq[n] || 0) + 1);

                // If any number appeared twice in last draw (rare), it won't repeat
                for (const [num, count] of Object.entries(freq)) {
                    if (count >= 2) return parseInt(num);
                }
                return null;
            }
        },
        'Number that just appeared (immediate repeat)': {
            correct: 0,
            total: 0,
            predict: (history: typeof parsedDraws, lastDraw: number[]) => {
                // Pick one of the numbers from last draw (they rarely repeat immediately)
                return lastDraw[0]; // First number
            }
        },
        'Extremes: 1 or 50': {
            correct: 0,
            total: 0,
            predict: (history: typeof parsedDraws, lastDraw: number[]) => {
                const recent10 = history.slice(-10);
                const has1 = recent10.some(d => d.numbers.includes(1));
                const has50 = recent10.some(d => d.numbers.includes(50));

                // If 1 appeared recently, unlikely to repeat soon
                if (has1) return 1;
                if (has50) return 50;
                return null;
            }
        },
        'Position lock: Never appears in position 1 as high number (>40)': {
            correct: 0,
            total: 0,
            predict: (history: typeof parsedDraws, lastDraw: number[]) => {
                // Numbers above 40 almost never appear in position 1
                // Predict 45 won't appear
                return 45;
            }
        }
    };

    const testStart = Math.max(100, parsedDraws.length - 100);

    console.log(`Testing ${parsedDraws.length - testStart} draws`);
    console.log('='.repeat(70));

    for (let i = testStart; i < parsedDraws.length; i++) {
        const history = parsedDraws.slice(0, i);
        if (history.length < 50) continue;

        const lastDraw = history[history.length - 1].numbers;
        const actualDraw = parsedDraws[i].numbers;

        for (const [ruleName, rule] of Object.entries(rules)) {
            const excluded = rule.predict(history, lastDraw);

            if (excluded !== null) {
                rule.total++;
                if (!actualDraw.includes(excluded)) {
                    rule.correct++;
                }
            }
        }
    }

    console.log('\n' + '='.repeat(70));
    console.log('📊 EXCLUSION RULES PERFORMANCE');
    console.log('='.repeat(70));

    let bestRule = '';
    let bestAccuracy = 0;

    for (const [ruleName, rule] of Object.entries(rules)) {
        if (rule.total > 0) {
            const accuracy = (rule.correct / rule.total) * 100;
            console.log(`\n${ruleName}:`);
            console.log(`   Excluded correctly: ${rule.correct}/${rule.total} = ${accuracy.toFixed(1)}%`);

            if (accuracy > bestAccuracy) {
                bestAccuracy = accuracy;
                bestRule = ruleName;
            }

            if (accuracy === 100) {
                console.log(`   🏆 PERFECT RULE! This number NEVER appeared when predicted!`);
            } else if (accuracy >= 95) {
                console.log(`   ✅ Excellent rule (${accuracy.toFixed(1)}%)`);
            } else if (accuracy >= 90) {
                console.log(`   ✓ Good rule (${accuracy.toFixed(1)}%)`);
            }
        } else {
            console.log(`\n${ruleName}:`);
            console.log(`   ⚠️ Rule never triggered`);
        }
    }

    console.log(`\n🏆 BEST RULE: ${bestRule} (${bestAccuracy.toFixed(1)}%)`);

    if (bestAccuracy === 100) {
        console.log(`\n✨ WE FOUND A 100% RULE!`);
        console.log(`   Use this rule to eliminate 1 number with absolute certainty.`);
    } else {
        console.log(`\n💡 No 100% rule found, but best is ${bestAccuracy.toFixed(1)}%`);
        console.log(`   This means eliminating 1 number reduces options from 50 to 49.`);
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
