import { prisma } from '../lib/prisma';

// Helper: Digital Root (1-9)
function getDigitalRoot(n: number): number {
    while (n > 9) {
        n = n.toString().split('').reduce((sum, d) => sum + parseInt(d), 0);
    }
    return n;
}

// Helper: Count frequency of each root in a draw
function getRootFrequencies(numbers: number[]): number[] {
    const frequencies = Array(10).fill(0); // Index 0 unused, 1-9 for roots
    numbers.forEach(n => {
        const root = getDigitalRoot(n);
        frequencies[root]++;
    });
    return frequencies;
}

async function analyzeStrategy2() {
    console.log('🔍 ESTRATÉGIA 2: Análise de Frequência Total\n');
    console.log('Objetivo: Verificar se a FREQUÊNCIA de cada raiz oscila');
    console.log('          ao longo dos sorteios (não apenas presença)\n');

    // Fetch last 200 draws
    console.log('📥 A carregar últimos 200 sorteios...');
    const draws = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        take: 200
    });

    const history = draws.reverse(); // Chronological order
    console.log(`✅ ${history.length} sorteios carregados\n`);

    // Track frequency changes
    console.log('🔄 A processar frequências...\n');

    const frequencyHistory: Array<{
        date: string;
        frequencies: number[];
    }> = [];

    for (let i = 0; i < history.length; i++) {
        const draw = history[i];
        const nums = JSON.parse(draw.numbers) as number[];
        const frequencies = getRootFrequencies(nums);

        frequencyHistory.push({
            date: draw.date.toISOString().split('T')[0],
            frequencies
        });

        // Progress indicator every 50 draws
        if ((i + 1) % 50 === 0) {
            const progress = Math.round(((i + 1) / history.length) * 100);
            console.log(`   Progresso: ${progress}% (${i + 1}/${history.length} sorteios)`);
        }
    }

    console.log('\n✅ Processamento completo!\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Analyze oscillation patterns
    console.log('📊 ANÁLISE DE OSCILAÇÃO DE FREQUÊNCIA\n');

    // For each root, track if frequency increases/decreases/stays same
    const oscillationStats: Record<number, {
        increases: number;
        decreases: number;
        same: number;
        avgFrequency: number;
    }> = {};

    for (let root = 1; root <= 9; root++) {
        oscillationStats[root] = {
            increases: 0,
            decreases: 0,
            same: 0,
            avgFrequency: 0
        };
    }

    // Compare consecutive draws
    for (let i = 1; i < frequencyHistory.length; i++) {
        const prev = frequencyHistory[i - 1].frequencies;
        const curr = frequencyHistory[i].frequencies;

        for (let root = 1; root <= 9; root++) {
            if (curr[root] > prev[root]) {
                oscillationStats[root].increases++;
            } else if (curr[root] < prev[root]) {
                oscillationStats[root].decreases++;
            } else {
                oscillationStats[root].same++;
            }

            oscillationStats[root].avgFrequency += curr[root];
        }
    }

    // Calculate averages
    for (let root = 1; root <= 9; root++) {
        oscillationStats[root].avgFrequency /= frequencyHistory.length;
    }

    console.log('Raiz │ Freq Média │ Aumenta │ Diminui │ Igual │ Volatilidade');
    console.log('─────┼────────────┼─────────┼─────────┼───────┼─────────────');

    for (let root = 1; root <= 9; root++) {
        const stats = oscillationStats[root];
        const total = stats.increases + stats.decreases + stats.same;
        const volatility = ((stats.increases + stats.decreases) / total) * 100;

        const emoji = (root === 3 || root === 6) ? '⚡' : (root === 9) ? '🟣' : '  ';

        console.log(
            `${emoji}${root}   │ ${stats.avgFrequency.toFixed(2).padStart(10)} │ ` +
            `${stats.increases.toString().padStart(7)} │ ` +
            `${stats.decreases.toString().padStart(7)} │ ` +
            `${stats.same.toString().padStart(5)} │ ` +
            `${volatility.toFixed(1)}%`
        );
    }

    console.log('\n═══════════════════════════════════════════════════════════\n');

    // Analyze 3↔6 frequency oscillation specifically
    console.log('⚡ ANÁLISE ESPECIAL: Oscilação de Frequência 3↔6\n');

    let oscillation36Count = 0;
    let oscillation63Count = 0;
    let totalTransitions = 0;

    for (let i = 1; i < frequencyHistory.length; i++) {
        const prev = frequencyHistory[i - 1].frequencies;
        const curr = frequencyHistory[i].frequencies;

        // Check if root 3 decreased and root 6 increased
        if (prev[3] > curr[3] && prev[6] < curr[6]) {
            oscillation36Count++;
        }

        // Check if root 6 decreased and root 3 increased
        if (prev[6] > curr[6] && prev[3] < curr[3]) {
            oscillation63Count++;
        }

        totalTransitions++;
    }

    const rate36 = (oscillation36Count / totalTransitions) * 100;
    const rate63 = (oscillation63Count / totalTransitions) * 100;
    const totalOscillation = ((oscillation36Count + oscillation63Count) / totalTransitions) * 100;

    console.log(`Raiz 3 diminui + Raiz 6 aumenta: ${oscillation36Count} vezes (${rate36.toFixed(1)}%)`);
    console.log(`Raiz 6 diminui + Raiz 3 aumenta: ${oscillation63Count} vezes (${rate63.toFixed(1)}%)`);
    console.log(`\nTaxa total de oscilação inversa 3↔6: ${totalOscillation.toFixed(1)}%`);

    if (totalOscillation > 30) {
        console.log('✅ CONCLUSÃO: Oscilação de frequência 3↔6 é SIGNIFICATIVA!');
    } else if (totalOscillation > 15) {
        console.log('🟡 CONCLUSÃO: Oscilação de frequência 3↔6 é MODERADA');
    } else {
        console.log('❌ CONCLUSÃO: Oscilação de frequência 3↔6 é FRACA');
    }

    console.log('\n═══════════════════════════════════════════════════════════\n');

    // Find most volatile roots
    console.log('🔥 TOP 5 RAÍZES MAIS VOLÁTEIS (Mudam mais frequentemente):\n');

    const volatilityRanking = Object.entries(oscillationStats)
        .map(([root, stats]) => {
            const total = stats.increases + stats.decreases + stats.same;
            const volatility = ((stats.increases + stats.decreases) / total) * 100;
            return { root: Number(root), volatility, avgFreq: stats.avgFrequency };
        })
        .sort((a, b) => b.volatility - a.volatility)
        .slice(0, 5);

    volatilityRanking.forEach((item, idx) => {
        const emoji = (item.root === 3 || item.root === 6) ? '⚡' : (item.root === 9) ? '🟣' : '';
        console.log(
            `${emoji}${idx + 1}. Raiz ${item.root}: ${item.volatility.toFixed(1)}% volatilidade ` +
            `(freq média: ${item.avgFreq.toFixed(2)})`
        );
    });

    console.log('\n═══════════════════════════════════════════════════════════\n');
    console.log('✅ Análise da Estratégia 2 completa!\n');
}

analyzeStrategy2()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
