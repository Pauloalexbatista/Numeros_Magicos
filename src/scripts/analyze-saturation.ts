import { prisma } from '../lib/prisma';

async function main() {
    console.log('📊 ANÁLISE DE SATURAÇÃO EM BLOCOS DE 20 SORTEIOS\n');

    const allDraws = await prisma.draw.findMany({
        orderBy: { date: 'asc' }
    });

    const parsedDraws = allDraws.map(d => JSON.parse(d.numbers) as number[]);

    // For each number, track its max in a 20-draw window
    const numberStats: Record<number, {
        maxInWindow: number,
        currentInWindow: number,
        saturation: number // 0-100%
    }> = {};

    for (let num = 1; num <= 50; num++) {
        numberStats[num] = { maxInWindow: 0, currentInWindow: 0, saturation: 0 };
    }

    // Slide through history with 20-draw windows
    for (let i = 19; i < parsedDraws.length; i++) {
        const window = parsedDraws.slice(i - 19, i + 1); // 20 draws

        for (let num = 1; num <= 50; num++) {
            const count = window.filter(draw => draw.includes(num)).length;

            // Update max if this is a new record
            if (count > numberStats[num].maxInWindow) {
                numberStats[num].maxInWindow = count;
            }
        }
    }

    // Calculate CURRENT window (last 20 draws)
    const currentWindow = parsedDraws.slice(-20);

    for (let num = 1; num <= 50; num++) {
        const currentCount = currentWindow.filter(draw => draw.includes(num)).length;
        numberStats[num].currentInWindow = currentCount;

        // Calculate saturation percentage
        if (numberStats[num].maxInWindow > 0) {
            numberStats[num].saturation = (currentCount / numberStats[num].maxInWindow) * 100;
        }
    }

    // Sort by saturation (low to high = most likely to appear)
    const sorted = Object.entries(numberStats)
        .map(([num, stats]) => ({ num: parseInt(num), ...stats }))
        .sort((a, b) => a.saturation - b.saturation);

    console.log('Janela atual: Últimos 20 sorteios');
    console.log('='.repeat(70));

    console.log('\n🎯 NÚMEROS COM BAIXA SATURAÇÃO (mais provável de sair)');
    console.log('='.repeat(70));
    console.log('| Núm | Atual | Máx | Sat(%) | Status');
    console.log('='.repeat(70));

    sorted.slice(0, 15).forEach(({ num, currentInWindow, maxInWindow, saturation }) => {
        const status = saturation === 0 ? '🔥 VAZIO!'
            : saturation < 30 ? '✅ Baixo'
                : saturation < 50 ? '➖ Médio'
                    : '⚠️ Alto';

        const bar = '█'.repeat(Math.round(saturation / 10));
        console.log(`| ${num.toString().padStart(3)} | ${currentInWindow.toString().padStart(5)} | ${maxInWindow.toString().padStart(3)} | ${saturation.toFixed(0).padStart(6)} | ${status} ${bar}`);
    });

    console.log('\n' + '='.repeat(70));
    console.log('🔴 NÚMEROS COM ALTA SATURAÇÃO (menos provável de sair)');
    console.log('='.repeat(70));
    console.log('| Núm | Atual | Máx | Sat(%) | Status');
    console.log('='.repeat(70));

    sorted.slice(-15).reverse().forEach(({ num, currentInWindow, maxInWindow, saturation }) => {
        const status = saturation >= 100 ? '🚫 MÁXIMO!'
            : saturation >= 80 ? '⛔ Muito Alto'
                : saturation >= 60 ? '⚠️ Alto'
                    : '➖ Médio';

        const bar = '█'.repeat(Math.round(saturation / 10));
        console.log(`| ${num.toString().padStart(3)} | ${currentInWindow.toString().padStart(5)} | ${maxInWindow.toString().padStart(3)} | ${saturation.toFixed(0).padStart(6)} | ${status} ${bar}`);
    });

    console.log('\n' + '='.repeat(70));
    console.log('💡 INTERPRETAÇÃO');
    console.log('='.repeat(70));

    const veryLow = sorted.filter(n => n.saturation < 30);
    const atMax = sorted.filter(n => n.saturation >= 100);

    console.log(`\n✅ Números com baixa saturação (<30%): ${veryLow.length}`);
    console.log(`   ${veryLow.map(n => n.num).join(', ')}`);
    console.log(`   → Estes números estão "famintos", mais provável de aparecer`);

    console.log(`\n🚫 Números no máximo (100%): ${atMax.length}`);
    if (atMax.length > 0) {
        console.log(`   ${atMax.map(n => n.num).join(', ')}`);
        console.log(`   → Estes números atingiram o máximo histórico, difícil de sair`);
    }

    console.log(`\n📊 Distribuição:`);
    const avgSaturation = sorted.reduce((sum, n) => sum + n.saturation, 0) / 50;
    console.log(`   Saturação média: ${avgSaturation.toFixed(1)}%`);
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
