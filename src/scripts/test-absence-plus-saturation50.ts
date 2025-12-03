import { prisma } from '../lib/prisma';

async function main() {
    console.log('🔬 TESTE: Ausência (atual) + Saturação (50 sorteios)\n');

    const allDraws = await prisma.draw.findMany({
        orderBy: { date: 'asc' }
    });

    const parsedDraws = allDraws.map(d => JSON.parse(d.numbers) as number[]);

    let hybridHits = 0;
    let totalTests = 0;

    const testStart = Math.max(120, parsedDraws.length - 100);

    for (let i = testStart; i < parsedDraws.length; i++) {
        const history = parsedDraws.slice(0, i);

        const scores: { num: number, absenceScore: number, saturationScore: number, combined: number }[] = [];

        for (let num = 1; num <= 50; num++) {
            // 1. ABSENCE PRESSURE
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

            const absencePressure = maxAbsence > 0 ? (currentAbsence / maxAbsence) * 100 : 0;

            // 2. SATURATION IN 50 DRAWS
            let maxIn50 = 0;
            const windowSize = 50;

            // Find max appearances in ANY 50-draw window
            for (let j = windowSize - 1; j < history.length; j++) {
                const window = history.slice(j - windowSize + 1, j + 1);
                const count = window.filter(d => d.includes(num)).length;
                if (count > maxIn50) maxIn50 = count;
            }

            // Current count in last 50
            const recent50 = history.slice(-Math.min(windowSize, history.length));
            const currentIn50 = recent50.filter(d => d.includes(num)).length;

            const saturation = maxIn50 > 0 ? (currentIn50 / maxIn50) * 100 : 0;

            // SCORING
            // High absence pressure = good (want to appear)
            // Low saturation = good (not saturated)
            const absenceScore = absencePressure;
            const saturationScore = 100 - saturation;

            // Combined: 50% each
            const combined = (absenceScore + saturationScore) / 2;

            scores.push({ num, absenceScore, saturationScore, combined });
        }

        scores.sort((a, b) => b.combined - a.combined);

        const top25 = scores.slice(0, 25).map(s => s.num);
        const actual = parsedDraws[i];

        const hits = actual.filter(n => top25.includes(n)).length;
        hybridHits += hits;
        totalTests++;
    }

    const accuracy = (hybridHits / (totalTests * 5)) * 100;

    console.log('='.repeat(70));
    console.log('📊 RESULTADO: Ausência + Saturação (50)');
    console.log('='.repeat(70));
    console.log(`Total testes: ${totalTests}`);
    console.log(`Total hits: ${hybridHits}/${totalTests * 5}`);
    console.log(`Acerto: ${accuracy.toFixed(1)}%`);
    console.log(`\n💡 Comparação:`);
    console.log(`   Baseline: 50%`);
    console.log(`   Este sistema: ${accuracy.toFixed(1)}%`);
    console.log(`   Diferença: ${(accuracy - 50).toFixed(1)}%`);

    if (accuracy > 52) {
        console.log(`\n   ✅ MELHOR que pressão sozinha (52.2%)!`);
    } else if (accuracy > 50) {
        console.log(`\n   ⚠️ Ligeiramente melhor que aleatório`);
    } else {
        console.log(`\n   ❌ Não melhorou`);
    }

    // Show current prediction
    console.log(`\n📍 PREVISÃO PARA PRÓXIMO SORTEIO:`);
    const history = parsedDraws;
    const currentScores: { num: number, absenceScore: number, saturationScore: number, combined: number }[] = [];

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

        const absencePressure = maxAbsence > 0 ? (currentAbsence / maxAbsence) * 100 : 0;

        let maxIn50 = 0;
        for (let j = 49; j < history.length; j++) {
            const window = history.slice(j - 49, j + 1);
            const count = window.filter(d => d.includes(num)).length;
            if (count > maxIn50) maxIn50 = count;
        }

        const recent50 = history.slice(-50);
        const currentIn50 = recent50.filter(d => d.includes(num)).length;
        const saturation = maxIn50 > 0 ? (currentIn50 / maxIn50) * 100 : 0;

        const absenceScore = absencePressure;
        const saturationScore = 100 - saturation;
        const combined = (absenceScore + saturationScore) / 2;

        currentScores.push({ num, absenceScore, saturationScore, combined });
    }

    currentScores.sort((a, b) => b.combined - a.combined);

    console.log(`\nTop 25 números recomendados:`);
    const top25 = currentScores.slice(0, 25);
    console.log(top25.map(s => s.num).join(', '));

    console.log(`\nTop 10 detalhado:`);
    console.log('| # | Num | Ausência | Saturação | Score |');
    console.log('|---|-----|----------|-----------|-------|');
    top25.slice(0, 10).forEach((s, i) => {
        console.log(`| ${(i + 1).toString().padStart(2)} | ${s.num.toString().padStart(3)} | ${s.absenceScore.toFixed(0).padStart(8)} | ${s.saturationScore.toFixed(0).padStart(9)} | ${s.combined.toFixed(1).padStart(5)} |`);
    });
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
