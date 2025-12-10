import { prisma } from '../lib/prisma';

// Helper: Digital Root (1-9)
function getDigitalRoot(n: number): number {
    while (n > 9) {
        n = n.toString().split('').reduce((sum, d) => sum + parseInt(d), 0);
    }
    return n;
}

// Helper: Get Dominant Root of a draw
function getDominantRoot(numbers: number[]): { root: number, count: number } {
    const roots = numbers.map(getDigitalRoot);
    const counts: Record<number, number> = {};
    roots.forEach(r => counts[r] = (counts[r] || 0) + 1);

    // Find root with max count
    let maxRoot = 0;
    let maxCount = 0;

    // Sort by count desc, then value asc (for consistency)
    Object.entries(counts).sort((a, b) => b[1] - a[1] || Number(a[0]) - Number(b[0])).forEach(([root, count]) => {
        if (count > maxCount) {
            maxCount = count;
            maxRoot = Number(root);
        }
    });

    return { root: maxRoot, count: maxCount };
}

async function runProbe() {
    console.log('🕵️  RODIN PROBE: Análise Rápida (Últimos 50 Sorteios)\n');

    const draws = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        take: 50
    });

    // Reverse to show chronological order (oldest to newest)
    const history = draws.reverse();

    console.log('Data       | Números               | Raiz Dom. | Padrão Observado');
    console.log('-----------|-----------------------|-----------|-----------------');

    let stats = {
        total: 0,
        oscillation36: 0, // 3->6 or 6->3
        vortexCycle: 0,   // n -> n*2
        sameRoot: 0
    };

    for (let i = 0; i < history.length; i++) {
        const draw = history[i];
        const nums = JSON.parse(draw.numbers) as number[];
        const { root, count } = getDominantRoot(nums);

        let pattern = '';

        if (i > 0) {
            const prevNums = JSON.parse(history[i - 1].numbers) as number[];
            const prevDom = getDominantRoot(prevNums).root;

            // Check 3-6 Oscillation
            if ((prevDom === 3 && root === 6) || (prevDom === 6 && root === 3)) {
                pattern = '✅ OSC 3↔6';
                stats.oscillation36++;
            }
            // Check Vortex Cycle (x2)
            else if (root === (prevDom * 2) % 9 || (root === 9 && (prevDom * 2) % 9 === 0)) {
                pattern = '🌀 Vortex (x2)';
                stats.vortexCycle++;
            }
            // Check Stagnation
            else if (root === prevDom) {
                pattern = '⚠️ Igual';
                stats.sameRoot++;
            }
        }

        const dateStr = draw.date.toISOString().split('T')[0];
        const numsStr = nums.map(n => n.toString().padStart(2)).join(',');

        // Highlight 3 and 6
        let rootStr = `Raiz ${root} (${count})`;
        if (root === 3 || root === 6) rootStr = `⚡ ${rootStr}`;
        if (root === 9) rootStr = `🟣 ${rootStr}`;

        console.log(`${dateStr} | [${numsStr}] | ${rootStr.padEnd(12)} | ${pattern}`);
        stats.total++;
    }

    console.log('\n📊 ESTATÍSTICAS RÁPIDAS (Amostra: 50)');
    console.log('-----------------------------------');
    console.log(`Oscilação 3↔6 detectada: ${stats.oscillation36} vezes`);
    console.log(`Ciclo Vortex (x2) detectado: ${stats.vortexCycle} vezes`);
    console.log(`Raiz repetida (Estagnação): ${stats.sameRoot} vezes`);
    console.log('-----------------------------------');

    // Recommendation based on quick probe
    if (stats.oscillation36 > 5) {
        console.log('✅ CONCLUSÃO: Padrão 3↔6 parece ativo e frequente.');
    } else {
        console.log('⚠️ CONCLUSÃO: Padrão 3↔6 parece fraco nesta amostra recente.');
    }
}

runProbe()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
