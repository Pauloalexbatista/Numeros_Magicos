import { prisma } from '../lib/prisma';

// Helper: Digital Root (1-9)
function getDigitalRoot(n: number): number {
    while (n > 9) {
        n = n.toString().split('').reduce((sum, d) => sum + parseInt(d), 0);
    }
    return n;
}

// Helper: Get binary presence of roots (1 = present, 0 = absent)
function getRootPresenceBinary(numbers: number[]): boolean[] {
    const presence = Array(10).fill(false); // Index 0 unused, 1-9 for roots
    numbers.forEach(n => {
        const root = getDigitalRoot(n);
        presence[root] = true;
    });
    return presence;
}

async function analyzeStrategy3() {
    console.log('🔍 ESTRATÉGIA 3: Sistema de Presença Binário\n');
    console.log('Objetivo: Verificar se quando raiz X está PRESENTE (sim/não),');
    console.log('          raiz Y tende a estar presente no PRÓXIMO sorteio\n');

    // Fetch last 200 draws
    console.log('📥 A carregar últimos 200 sorteios...');
    const draws = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        take: 200
    });

    const history = draws.reverse(); // Chronological order
    console.log(`✅ ${history.length} sorteios carregados\n`);

    console.log('🔄 A processar padrões de presença...\n');

    // Track: if root X is present in draw N, is root Y present in draw N+1?
    const presenceCorrelation: number[][] = Array(10).fill(0).map(() => Array(10).fill(0));
    const rootPresentCount: number[] = Array(10).fill(0); // Times each root is present

    for (let i = 0; i < history.length - 1; i++) {
        const currentDraw = history[i];
        const nextDraw = history[i + 1];

        const currentNums = JSON.parse(currentDraw.numbers) as number[];
        const nextNums = JSON.parse(nextDraw.numbers) as number[];

        const currentPresence = getRootPresenceBinary(currentNums);
        const nextPresence = getRootPresenceBinary(nextNums);

        // For each root present in current draw
        for (let rootCurrent = 1; rootCurrent <= 9; rootCurrent++) {
            if (currentPresence[rootCurrent]) {
                rootPresentCount[rootCurrent]++;

                // Check which roots are present in next draw
                for (let rootNext = 1; rootNext <= 9; rootNext++) {
                    if (nextPresence[rootNext]) {
                        presenceCorrelation[rootCurrent][rootNext]++;
                    }
                }
            }
        }

        // Progress indicator every 50 draws
        if ((i + 1) % 50 === 0) {
            const progress = Math.round(((i + 1) / (history.length - 1)) * 100);
            console.log(`   Progresso: ${progress}% (${i + 1}/${history.length - 1} transições)`);
        }
    }

    console.log('\n✅ Processamento completo!\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Calculate presence correlation percentages
    console.log('📊 MATRIZ DE PRESENÇA (Raiz N presente → Raiz N+1 presente)\n');
    console.log('Legenda: Se raiz X está presente, qual % de raiz Y estar presente no próximo?\n');

    // Header
    console.log('Presente│  1    2    3    4    5    6    7    8    9');
    console.log('────────┼──────────────────────────────────────────────');

    for (let from = 1; from <= 9; from++) {
        let row = `Raiz ${from}  │`;

        for (let to = 1; to <= 9; to++) {
            const count = presenceCorrelation[from][to];
            const total = rootPresentCount[from];
            const percentage = total > 0 ? (count / total) * 100 : 0;

            row += ` ${percentage.toFixed(0).padStart(2)}% `;
        }

        console.log(row);
    }

    console.log('\n═══════════════════════════════════════════════════════════\n');

    // Find strongest presence correlations
    console.log('🔥 TOP 10 CORRELAÇÕES DE PRESENÇA MAIS FORTES:\n');

    const correlations: Array<{ from: number, to: number, percentage: number, count: number }> = [];

    for (let from = 1; from <= 9; from++) {
        for (let to = 1; to <= 9; to++) {
            const count = presenceCorrelation[from][to];
            const total = rootPresentCount[from];
            const percentage = total > 0 ? (count / total) * 100 : 0;

            correlations.push({ from, to, percentage, count });
        }
    }

    // Sort by percentage descending
    correlations.sort((a, b) => b.percentage - a.percentage);

    correlations.slice(0, 10).forEach((corr, idx) => {
        const emoji = (corr.from === 3 && corr.to === 6) || (corr.from === 6 && corr.to === 3) ? '⚡' : '  ';
        console.log(`${emoji}${idx + 1}. Raiz ${corr.from} → Raiz ${corr.to}: ${corr.percentage.toFixed(1)}% (${corr.count}/${rootPresentCount[corr.from]})`);
    });

    console.log('\n═══════════════════════════════════════════════════════════\n');

    // Special focus on 3↔6 presence correlation
    const root3to6 = presenceCorrelation[3][6];
    const root6to3 = presenceCorrelation[6][3];
    const total3 = rootPresentCount[3];
    const total6 = rootPresentCount[6];

    const rate3to6 = total3 > 0 ? (root3to6 / total3) * 100 : 0;
    const rate6to3 = total6 > 0 ? (root6to3 / total6) * 100 : 0;

    console.log('⚡ ANÁLISE ESPECIAL: Presença 3↔6\n');
    console.log(`Raiz 3 presente: ${total3} vezes`);
    console.log(`  → Raiz 6 presente no próximo: ${root3to6} vezes (${rate3to6.toFixed(1)}%)`);
    console.log('');
    console.log(`Raiz 6 presente: ${total6} vezes`);
    console.log(`  → Raiz 3 presente no próximo: ${root6to3} vezes (${rate6to3.toFixed(1)}%)`);
    console.log('');

    const avgPresence = (rate3to6 + rate6to3) / 2;
    console.log(`Taxa média de presença 3↔6: ${avgPresence.toFixed(1)}%`);

    if (avgPresence > 60) {
        console.log('✅ CONCLUSÃO: Correlação de presença 3↔6 é FORTE!');
    } else if (avgPresence > 45) {
        console.log('🟡 CONCLUSÃO: Correlação de presença 3↔6 é MODERADA');
    } else {
        console.log('❌ CONCLUSÃO: Correlação de presença 3↔6 é FRACA');
    }

    console.log('\n═══════════════════════════════════════════════════════════\n');

    // Compare with Strategy 1 results
    console.log('📈 COMPARAÇÃO COM ESTRATÉGIA 1:\n');
    console.log('Estratégia 1 (Pares com Set):');
    console.log('  - Raiz 6 → Raiz 3: 56.0%');
    console.log('  - Raiz 3 → Raiz 6: 50.0%');
    console.log('  - Média: 53.0%\n');

    console.log('Estratégia 3 (Presença Binária):');
    console.log(`  - Raiz 6 → Raiz 3: ${rate6to3.toFixed(1)}%`);
    console.log(`  - Raiz 3 → Raiz 6: ${rate3to6.toFixed(1)}%`);
    console.log(`  - Média: ${avgPresence.toFixed(1)}%\n`);

    const difference = Math.abs(avgPresence - 53.0);
    if (difference < 2) {
        console.log('✅ Resultados IDÊNTICOS! Estratégias 1 e 3 são equivalentes.');
    } else if (avgPresence > 53.0) {
        console.log(`✅ Estratégia 3 é MELHOR! (+${(avgPresence - 53.0).toFixed(1)}%)`);
    } else {
        console.log(`⚠️ Estratégia 1 é MELHOR! (+${(53.0 - avgPresence).toFixed(1)}%)`);
    }

    console.log('\n═══════════════════════════════════════════════════════════\n');
    console.log('✅ Análise da Estratégia 3 completa!\n');
}

analyzeStrategy3()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
