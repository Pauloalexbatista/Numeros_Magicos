import { prisma } from '../lib/prisma';

// Helper: Digital Root (1-9)
function getDigitalRoot(n: number): number {
    while (n > 9) {
        n = n.toString().split('').reduce((sum, d) => sum + parseInt(d), 0);
    }
    return n;
}

// Helper: Get all roots present in a draw
function getRootsPresent(numbers: number[]): Set<number> {
    const roots = numbers.map(getDigitalRoot);
    return new Set(roots);
}

async function analyzeStrategy1() {
    console.log('🔍 ESTRATÉGIA 1: Análise de Pares de Raízes (Correlação)\n');
    console.log('Objetivo: Verificar se quando raiz X aparece num sorteio,');
    console.log('          raiz Y tende a aparecer no PRÓXIMO sorteio\n');

    // Fetch last 200 draws (rápido!)
    console.log('📥 A carregar últimos 200 sorteios...');
    const draws = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        take: 200
    });

    const history = draws.reverse(); // Chronological order
    console.log(`✅ ${history.length} sorteios carregados\n`);

    // Matrix to track correlations: [root in draw N] -> [root in draw N+1]
    // correlationMatrix[3][6] = count of times root 3 in N leads to root 6 in N+1
    const correlationMatrix: number[][] = Array(10).fill(0).map(() => Array(10).fill(0));
    const rootPresenceCount: number[] = Array(10).fill(0); // Total times each root appears

    console.log('🔄 A processar correlações...\n');

    for (let i = 0; i < history.length - 1; i++) {
        const currentDraw = history[i];
        const nextDraw = history[i + 1];

        const currentNums = JSON.parse(currentDraw.numbers) as number[];
        const nextNums = JSON.parse(nextDraw.numbers) as number[];

        const currentRoots = getRootsPresent(currentNums);
        const nextRoots = getRootsPresent(nextNums);

        // For each root present in current draw
        currentRoots.forEach(rootCurrent => {
            rootPresenceCount[rootCurrent]++;

            // Check which roots appear in next draw
            nextRoots.forEach(rootNext => {
                correlationMatrix[rootCurrent][rootNext]++;
            });
        });

        // Progress indicator every 50 draws
        if ((i + 1) % 50 === 0) {
            const progress = Math.round(((i + 1) / (history.length - 1)) * 100);
            console.log(`   Progresso: ${progress}% (${i + 1}/${history.length - 1} transições)`);
        }
    }

    console.log('\n✅ Processamento completo!\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Calculate correlation percentages
    console.log('📊 MATRIZ DE CORRELAÇÃO (Raiz N → Raiz N+1)\n');
    console.log('Legenda: Se raiz X aparece no sorteio, qual % de aparecer raiz Y no próximo?\n');

    // Header
    console.log('De→Para│  1    2    3    4    5    6    7    8    9');
    console.log('───────┼──────────────────────────────────────────────');

    for (let from = 1; from <= 9; from++) {
        let row = `Raiz ${from} │`;

        for (let to = 1; to <= 9; to++) {
            const count = correlationMatrix[from][to];
            const total = rootPresenceCount[from];
            const percentage = total > 0 ? (count / total) * 100 : 0;

            // Format: 2 digits + %
            row += ` ${percentage.toFixed(0).padStart(2)}% `;
        }

        console.log(row);
    }

    console.log('\n═══════════════════════════════════════════════════════════\n');

    // Find strongest correlations
    console.log('🔥 TOP 10 CORRELAÇÕES MAIS FORTES:\n');

    const correlations: Array<{ from: number, to: number, percentage: number, count: number }> = [];

    for (let from = 1; from <= 9; from++) {
        for (let to = 1; to <= 9; to++) {
            const count = correlationMatrix[from][to];
            const total = rootPresenceCount[from];
            const percentage = total > 0 ? (count / total) * 100 : 0;

            correlations.push({ from, to, percentage, count });
        }
    }

    // Sort by percentage descending
    correlations.sort((a, b) => b.percentage - a.percentage);

    correlations.slice(0, 10).forEach((corr, idx) => {
        const emoji = (corr.from === 3 && corr.to === 6) || (corr.from === 6 && corr.to === 3) ? '⚡' : '  ';
        console.log(`${emoji}${idx + 1}. Raiz ${corr.from} → Raiz ${corr.to}: ${corr.percentage.toFixed(1)}% (${corr.count} vezes)`);
    });

    console.log('\n═══════════════════════════════════════════════════════════\n');

    // Special focus on 3↔6 oscillation
    const root3to6 = correlationMatrix[3][6];
    const root6to3 = correlationMatrix[6][3];
    const total3 = rootPresenceCount[3];
    const total6 = rootPresenceCount[6];

    const rate3to6 = total3 > 0 ? (root3to6 / total3) * 100 : 0;
    const rate6to3 = total6 > 0 ? (root6to3 / total6) * 100 : 0;

    console.log('⚡ ANÁLISE ESPECIAL: Oscilação 3↔6\n');
    console.log(`Raiz 3 apareceu: ${total3} vezes`);
    console.log(`  → Seguida por raiz 6: ${root3to6} vezes (${rate3to6.toFixed(1)}%)`);
    console.log('');
    console.log(`Raiz 6 apareceu: ${total6} vezes`);
    console.log(`  → Seguida por raiz 3: ${root6to3} vezes (${rate6to3.toFixed(1)}%)`);
    console.log('');

    const avgOscillation = (rate3to6 + rate6to3) / 2;
    console.log(`Taxa média de oscilação 3↔6: ${avgOscillation.toFixed(1)}%`);

    if (avgOscillation > 60) {
        console.log('✅ CONCLUSÃO: Oscilação 3↔6 é FORTE e pode ser usada!');
    } else if (avgOscillation > 40) {
        console.log('🟡 CONCLUSÃO: Oscilação 3↔6 é MODERADA, usar com cautela');
    } else {
        console.log('❌ CONCLUSÃO: Oscilação 3↔6 é FRACA, não recomendado');
    }

    console.log('\n═══════════════════════════════════════════════════════════\n');
    console.log('✅ Análise da Estratégia 1 completa!\n');
}

analyzeStrategy1()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
