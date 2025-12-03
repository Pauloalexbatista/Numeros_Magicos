import { prisma } from '../lib/prisma';

async function main() {
    console.log('🔬 TESTE: Média ±3 filtrado por Pressão/Saturação\n');

    const allDraws = await prisma.draw.findMany({
        orderBy: { date: 'asc' }
    });

    const parsedDraws = allDraws.map(d => ({
        numbers: JSON.parse(d.numbers) as number[]
    }));

    let pressureHits = 0;
    let saturationHits = 0;
    let totalTests = 0;

    const testStart = Math.max(100, parsedDraws.length - 100);

    for (let i = testStart; i < parsedDraws.length; i++) {
        const history = parsedDraws.slice(0, i);
        if (history.length < 50) continue;

        const recent50 = history.slice(-50);

        // STEP 1: Generate 35 candidates with Mean ±3
        const candidates = new Set<number>();

        for (let pos = 0; pos < 5; pos++) {
            const values = recent50.map(d => d.numbers[pos]);
            const mean = values.reduce((a, b) => a + b, 0) / values.length;

            for (let offset = -3; offset <= 3; offset++) {
                const num = Math.round(mean) + offset;
                if (num >= 1 && num <= 50) candidates.add(num);
            }
        }

        const candidateArray = Array.from(candidates);

        // STEP 2A: Calculate ABSENCE PRESSURE for each candidate
        const pressureScores: { num: number, pressure: number }[] = [];

        for (const num of candidateArray) {
            let maxAbsence = 0;
            let currentStreak = 0;

            for (let j = 0; j < history.length; j++) {
                if (history[j].numbers.includes(num)) {
                    if (currentStreak > maxAbsence) maxAbsence = currentStreak;
                    currentStreak = 0;
                } else {
                    currentStreak++;
                }
            }
            if (currentStreak > maxAbsence) maxAbsence = currentStreak;

            let currentAbsence = 0;
            for (let j = history.length - 1; j >= 0; j--) {
                if (history[j].numbers.includes(num)) break;
                currentAbsence++;
            }

            const pressure = maxAbsence > 0 ? (currentAbsence / maxAbsence) * 100 : 0;
            pressureScores.push({ num, pressure });
        }

        // STEP 2B: Calculate SATURATION for each candidate
        const saturationScores: { num: number, saturation: number }[] = [];

        for (const num of candidateArray) {
            let maxIn20 = 0;

            for (let j = 19; j < history.length; j++) {
                const window = history.slice(j - 19, j + 1);
                const count = window.filter(d => d.numbers.includes(num)).length;
                if (count > maxIn20) maxIn20 = count;
            }

            const recent20 = history.slice(-20);
            const currentIn20 = recent20.filter(d => d.numbers.includes(num)).length;
            const saturation = maxIn20 > 0 ? (currentIn20 / maxIn20) * 100 : 0;

            // Lower saturation = better (inverse score)
            saturationScores.push({ num, saturation: 100 - saturation });
        }

        // STEP 3: Pick top 25 by each method
        const top25ByPressure = pressureScores
            .sort((a, b) => b.pressure - a.pressure)
            .slice(0, 25)
            .map(item => item.num);

        const top25BySaturation = saturationScores
            .sort((a, b) => b.saturation - a.saturation)
            .slice(0, 25)
            .map(item => item.num);

        const actual = parsedDraws[i].numbers;

        pressureHits += actual.filter(n => top25ByPressure.includes(n)).length;
        saturationHits += actual.filter(n => top25BySaturation.includes(n)).length;
        totalTests++;
    }

    const pressureAcc = (pressureHits / (totalTests * 5)) * 100;
    const saturationAcc = (saturationHits / (totalTests * 5)) * 100;

    console.log('='.repeat(70));
    console.log('📊 RESULTADOS');
    console.log('='.repeat(70));

    console.log(`\n1️⃣ Média ±3 → Top 25 por PRESSÃO DE AUSÊNCIA:`);
    console.log(`   Hits: ${pressureHits}/${totalTests * 5}`);
    console.log(`   Acerto: ${pressureAcc.toFixed(1)}%`);

    console.log(`\n2️⃣ Média ±3 → Top 25 por SATURAÇÃO (inversa):`);
    console.log(`   Hits: ${saturationHits}/${totalTests * 5}`);
    console.log(`   Acerto: ${saturationAcc.toFixed(1)}%`);

    console.log(`\n💡 COMPARAÇÃO COM OUTROS MÉTODOS:`);
    console.log(`   Anti-Monte Carlo: 54.4%`);
    console.log(`   Standard Deviation: 54.2%`);
    console.log(`   Média ±3 + Frequência: 51.2%`);
    console.log(`   Média ±3 + Pressão: ${pressureAcc.toFixed(1)}%`);
    console.log(`   Média ±3 + Saturação: ${saturationAcc.toFixed(1)}%`);

    const best = Math.max(pressureAcc, saturationAcc);
    if (best > 54.4) {
        console.log(`\n   🏆🏆🏆 NOVO RECORDE ABSOLUTO!`);
    } else if (best > 51.2) {
        console.log(`\n   ✅ Melhor que Média+Frequência!`);
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
