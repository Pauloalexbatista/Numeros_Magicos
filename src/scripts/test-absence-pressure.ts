import { prisma } from '../lib/prisma';

async function main() {
    console.log('🧪 TESTE DA TEORIA DA PRESSÃO DE AUSÊNCIA\n');
    console.log('Hipótese: Números perto do máximo de ausência têm MAIOR probabilidade de sair\n');

    const allDraws = await prisma.draw.findMany({
        orderBy: { date: 'asc' }
    });

    const parsedDraws = allDraws.map(d => JSON.parse(d.numbers) as number[]);

    let highPressureHits = 0;
    let lowPressureHits = 0;
    let totalTests = 0;

    // Test on last 100 draws
    const testStart = Math.max(120, parsedDraws.length - 100);

    for (let i = testStart; i < parsedDraws.length; i++) {
        const history = parsedDraws.slice(0, i);

        // Calculate max absence and current absence for each number
        const numberStats: Record<number, { maxAbsence: number, currentAbsence: number, pressure: number }> = {};

        for (let num = 1; num <= 50; num++) {
            let maxAbsence = 0;
            let currentStreak = 0;

            // Find historical max absence
            for (let j = 0; j < history.length; j++) {
                if (history[j].includes(num)) {
                    if (currentStreak > maxAbsence) {
                        maxAbsence = currentStreak;
                    }
                    currentStreak = 0;
                } else {
                    currentStreak++;
                }
            }

            // Final streak (ongoing)
            if (currentStreak > maxAbsence) {
                maxAbsence = currentStreak;
            }

            // Calculate CURRENT absence (from end)
            let currentAbsence = 0;
            for (let j = history.length - 1; j >= 0; j--) {
                if (history[j].includes(num)) {
                    break;
                }
                currentAbsence++;
            }

            // If never appeared, set to history length
            if (currentAbsence === history.length) {
                currentAbsence = history.length;
            }

            const pressure = maxAbsence > 0 ? (currentAbsence / maxAbsence) * 100 : 0;

            numberStats[num] = { maxAbsence, currentAbsence, pressure };
        }

        // Sort by pressure
        const sorted = Object.entries(numberStats)
            .map(([num, stats]) => ({ num: parseInt(num), ...stats }))
            .sort((a, b) => b.pressure - a.pressure);

        // Get high pressure (top 25) and low pressure (bottom 25)
        const highPressure = sorted.slice(0, 25).map(n => n.num);
        const lowPressure = sorted.slice(-25).map(n => n.num);

        // Check actual draw
        const actual = parsedDraws[i];

        const highHits = actual.filter(n => highPressure.includes(n)).length;
        const lowHits = actual.filter(n => lowPressure.includes(n)).length;

        highPressureHits += highHits;
        lowPressureHits += lowHits;
        totalTests++;
    }

    const highAvg = highPressureHits / totalTests;
    const lowAvg = lowPressureHits / totalTests;
    const highAcc = (highPressureHits / (totalTests * 5)) * 100;
    const lowAcc = (lowPressureHits / (totalTests * 5)) * 100;

    console.log('='.repeat(70));
    console.log('📊 RESULTADOS DO TESTE');
    console.log('='.repeat(70));
    console.log(`Total de testes: ${totalTests}`);
    console.log(`\n🔥 ALTA PRESSÃO (25 números mais perto do máx de ausência):`);
    console.log(`   Total hits: ${highPressureHits}/${totalTests * 5}`);
    console.log(`   Média por sorteio: ${highAvg.toFixed(2)}/5`);
    console.log(`   Acerto: ${highAcc.toFixed(1)}%`);

    console.log(`\n❄️ BAIXA PRESSÃO (25 números longe do máx de ausência):`);
    console.log(`   Total hits: ${lowPressureHits}/${totalTests * 5}`);
    console.log(`   Média por sorteio: ${lowAvg.toFixed(2)}/5`);
    console.log(`   Acerto: ${lowAcc.toFixed(1)}%`);

    console.log(`\n💡 CONCLUSÃO:`);
    const difference = highAcc - lowAcc;

    if (difference > 2) {
        console.log(`   ✅ TEORIA VALIDADA!`);
        console.log(`   Alta pressão é ${difference.toFixed(1)}% MELHOR que baixa pressão`);
        console.log(`   → Números "atrasados" tendem a sair!`);
    } else if (difference > 0) {
        console.log(`   ⚠️ Leve vantagem (${difference.toFixed(1)}%)`);
        console.log(`   → Pode funcionar mas não é conclusivo`);
    } else {
        console.log(`   ❌ TEORIA REFUTADA!`);
        console.log(`   Baixa pressão é ${Math.abs(difference).toFixed(1)}% melhor`);
        console.log(`   → Números "atrasados" NÃO têm vantagem`);
    }

    console.log(`\n📋 BASELINE:`);
    console.log(`   25 números aleatórios = 50% acerto`);
    console.log(`   Alta pressão = ${highAcc.toFixed(1)}%`);
    console.log(`   Baixa pressão = ${lowAcc.toFixed(1)}%`);

    // Show current situation
    console.log(`\n📍 SITUAÇÃO ATUAL (para próximo sorteio):`);
    const history = parsedDraws.slice(0, parsedDraws.length);
    const currentStats: { num: number, maxAbsence: number, currentAbsence: number, pressure: number }[] = [];

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
        currentStats.push({ num, maxAbsence, currentAbsence, pressure });
    }

    currentStats.sort((a, b) => b.pressure - a.pressure);

    console.log(`\nTop 10 números com MAIOR pressão (mais atrasados):`);
    currentStats.slice(0, 10).forEach(({ num, currentAbsence, maxAbsence, pressure }) => {
        console.log(`   ${num.toString().padStart(2)}: ${currentAbsence} sorteios (máx: ${maxAbsence}) → ${pressure.toFixed(0)}% pressão`);
    });
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
