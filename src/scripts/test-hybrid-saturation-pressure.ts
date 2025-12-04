import { prisma } from '../lib/prisma';

async function main() {
    console.log('🔬 TESTE HÍBRIDO: Saturação + Pressão de Ausência\n');

    const allDraws = await prisma.draw.findMany({
        orderBy: { date: 'asc' }
    });

    const parsedDraws = allDraws.map(d => JSON.parse(d.numbers) as number[]);

    let hybridHits = 0;
    let saturationOnlyHits = 0;
    let pressureOnlyHits = 0;
    let totalTests = 0;

    const testStart = Math.max(120, parsedDraws.length - 100);

    for (let i = testStart; i < parsedDraws.length; i++) {
        const history = parsedDraws.slice(0, i);

        // SATURATION
        const saturationScores: Record<number, number> = {};

        for (let num = 1; num <= 50; num++) {
            let max = 0;
            for (let j = 19; j < history.length; j++) {
                const window = history.slice(j - 19, j + 1);
                const count = window.filter(d => d.includes(num)).length;
                if (count > max) max = count;
            }
            const recent20 = history.slice(-20);
            const current = recent20.filter(d => d.includes(num)).length;
            const saturation = max > 0 ? (current / max) * 100 : 0;

            // Lower saturation = higher score
            saturationScores[num] = 100 - saturation;
        }

        // PRESSURE
        const pressureScores: Record<number, number> = {};

        for (let num = 1; num <= 50; num++) {
            let maxAbsence = 0;
            let currentStreak = 0;

            for (let j = 0; j < history.length; j++) {
                if (history[j].includes(num)) {
                    if (currentStreak > maxAbsence) maxAbsence = currentStreak;
                    currentStreak = 0;
                } else {
                    currentStreak++;
                }
            }
            if (currentStreak > maxAbsence) maxAbsence = currentStreak;

            let currentAbsence = 0;
            for (let j = history.length - 1; j >= 0; j--) {
                if (history[j].includes(num)) break;
                currentAbsence++;
            }
            if (currentAbsence === history.length) currentAbsence = history.length;

            const pressure = maxAbsence > 0 ? (currentAbsence / maxAbsence) * 100 : 0;
            pressureScores[num] = pressure;
        }

        // COMBINE SCORES (weighted average)
        const combinedScores = [];
        for (let num = 1; num <= 50; num++) {
            const sat = saturationScores[num];
            const pres = pressureScores[num];

            // Weight: 50% saturation, 50% pressure
            const combined = (sat + pres) / 2;
            combinedScores.push({ num, combined, sat, pres });
        }

        combinedScores.sort((a, b) => b.combined - a.combined);

        const hybridTop25 = combinedScores.slice(0, 25).map(n => n.num);

        // Also get individual top 25s
        const satTop25 = Object.entries(saturationScores)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 25)
            .map(([num]) => parseInt(num));

        const presTop25 = Object.entries(pressureScores)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 25)
            .map(([num]) => parseInt(num));

        const actual = parsedDraws[i];

        hybridHits += actual.filter(n => hybridTop25.includes(n)).length;
        saturationOnlyHits += actual.filter(n => satTop25.includes(n)).length;
        pressureOnlyHits += actual.filter(n => presTop25.includes(n)).length;
        totalTests++;
    }

    const hybridAcc = (hybridHits / (totalTests * 5)) * 100;
    const satAcc = (saturationOnlyHits / (totalTests * 5)) * 100;
    const presAcc = (pressureOnlyHits / (totalTests * 5)) * 100;

    console.log('='.repeat(70));
    console.log('📊 COMPARAÇÃO DOS SISTEMAS');
    console.log('='.repeat(70));
    console.log(`Total de testes: ${totalTests}\n`);

    console.log(`1️⃣ Saturação apenas: ${saturationOnlyHits}/${totalTests * 5} = ${satAcc.toFixed(1)}%`);
    console.log(`2️⃣ Pressão apenas:   ${pressureOnlyHits}/${totalTests * 5} = ${presAcc.toFixed(1)}%`);
    console.log(`3️⃣ HÍBRIDO (50/50):  ${hybridHits}/${totalTests * 5} = ${hybridAcc.toFixed(1)}%`);

    console.log(`\n💡 VENCEDOR:`);
    const best = Math.max(satAcc, presAcc, hybridAcc);

    if (best === hybridAcc) {
        console.log(`   🏆 HÍBRIDO (${hybridAcc.toFixed(1)}%)`);
        console.log(`   → Combinar as duas teorias é o melhor!`);
        console.log(`   → ${(hybridAcc - 50).toFixed(1)}% melhor que aleatório`);
    } else if (best === presAcc) {
        console.log(`   🏆 PRESSÃO (${presAcc.toFixed(1)}%)`);
        console.log(`   → Usar só pressão de ausência é suficiente`);
    } else {
        console.log(`   🏆 SATURAÇÃO (${satAcc.toFixed(1)}%)`);
        console.log(`   → Usar só saturação é suficiente`);
    }

    console.log(`\n📋 BASELINE: 50%`);
    console.log(`   Melhoria do vencedor: +${(best - 50).toFixed(1)}%`);
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
