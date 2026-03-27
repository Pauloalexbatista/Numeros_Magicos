import { prisma } from '../lib/prisma';

// Helper: Digital Root (1-9)
function getDigitalRoot(n: number): number {
    while (n > 9) {
        n = n.toString().split('').reduce((sum, d) => sum + parseInt(d), 0);
    }
    return n;
}

// Build Rodin Map
function buildRodinMap(): number[][] {
    const map: number[][] = [];
    for (let row = 1; row <= 9; row++) {
        const rowData: number[] = [];
        for (let col = 1; col <= 9; col++) {
            let value = (row * col) % 9;
            if (value === 0) value = 9;
            rowData.push(value);
        }
        map.push(rowData);
    }
    return map;
}

// Count how many cells each root occupies in the matrix
function countRootCells(rodinMap: number[][]): Record<number, number> {
    const counts: Record<number, number> = {};
    for (let root = 1; root <= 9; root++) {
        counts[root] = 0;
    }

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const root = rodinMap[row][col];
            counts[root]++;
        }
    }

    return counts;
}

// Create heat map
function createHeatMap(draws: number[][], rodinMap: number[][]): number[][] {
    const heatMap: number[][] = Array(9).fill(0).map(() => Array(9).fill(0));

    draws.forEach(drawNumbers => {
        drawNumbers.forEach(num => {
            const root = getDigitalRoot(num);

            // Mark all positions where this root appears
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (rodinMap[row][col] === root) {
                        heatMap[row][col]++;
                    }
                }
            }
        });
    });

    return heatMap;
}

// Calculate normalized heat per root
function calculateNormalizedHeat(heatMap: number[][], rodinMap: number[][], cellCounts: Record<number, number>): Record<number, { total: number, cells: number, normalized: number }> {
    const rootHeat: Record<number, { total: number, cells: number, normalized: number }> = {};

    for (let root = 1; root <= 9; root++) {
        let totalHeat = 0;

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (rodinMap[row][col] === root) {
                    totalHeat += heatMap[row][col];
                }
            }
        }

        const cells = cellCounts[root];
        const normalized = cells > 0 ? totalHeat / cells : 0;

        rootHeat[root] = {
            total: totalHeat,
            cells: cells,
            normalized: normalized
        };
    }

    return rootHeat;
}

async function analyzeNormalized() {
    console.log('🔥 ANÁLISE MATRICIAL NORMALIZADA\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Build Rodin map
    const rodinMap = buildRodinMap();

    // Count cells per root
    console.log('📊 CONTAGEM DE CÉLULAS POR RAIZ:\n');
    const cellCounts = countRootCells(rodinMap);

    for (let root = 1; root <= 9; root++) {
        const emoji = (root === 3 || root === 6) ? '⚡' : (root === 9) ? '🟣' : '  ';
        console.log(`${emoji}Raiz ${root}: ${cellCounts[root].toString().padStart(2)} células na matriz`);
    }

    console.log('\n═══════════════════════════════════════════════════════════\n');

    // Fetch last 20 draws
    console.log('📥 A carregar últimos 20 sorteios...');
    const draws = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        take: 20
    });

    const drawNumbers = draws.map(d => (typeof d.numbers === "string" ? JSON.parse(d.numbers) : d.numbers) as number[]);
    console.log(`✅ ${draws.length} sorteios carregados\n`);

    // Create heat map
    const heatMap = createHeatMap(drawNumbers, rodinMap);

    // Calculate normalized heat
    console.log('🔥 CALOR POR RAIZ (NORMALIZADO):\n');
    const rootHeat = calculateNormalizedHeat(heatMap, rodinMap, cellCounts);

    console.log('Raiz │ Células │ Calor Total │ Calor/Célula │ Barra');
    console.log('─────┼─────────┼─────────────┼──────────────┼──────────────────────');

    const heatData: Array<{ root: number, normalized: number }> = [];

    for (let root = 1; root <= 9; root++) {
        const data = rootHeat[root];
        const emoji = (root === 3 || root === 6) ? '⚡' : (root === 9) ? '🟣' : '  ';
        const bar = '█'.repeat(Math.round(data.normalized));

        console.log(
            `${emoji}${root}   │ ${data.cells.toString().padStart(7)} │ ` +
            `${data.total.toString().padStart(11)} │ ` +
            `${data.normalized.toFixed(2).padStart(12)} │ ${bar}`
        );

        heatData.push({ root, normalized: data.normalized });
    }

    console.log('\n═══════════════════════════════════════════════════════════\n');

    // Sort by normalized heat
    heatData.sort((a, b) => b.normalized - a.normalized);

    console.log('🏆 RANKING DE RAÍZES (Por Calor Normalizado):\n');

    heatData.forEach((data, idx) => {
        const emoji = (data.root === 3 || data.root === 6) ? '⚡' : (data.root === 9) ? '🟣' : '';
        console.log(`${emoji}${idx + 1}. Raiz ${data.root}: ${data.normalized.toFixed(2)} calor/célula`);
    });

    console.log('\n═══════════════════════════════════════════════════════════\n');

    // Analyze which roots are "hot" vs "moderate" vs "cold"
    const avgHeat = heatData.reduce((sum, d) => sum + d.normalized, 0) / heatData.length;
    const stdDev = Math.sqrt(
        heatData.reduce((sum, d) => sum + Math.pow(d.normalized - avgHeat, 2), 0) / heatData.length
    );

    console.log('📊 ANÁLISE ESTATÍSTICA:\n');
    console.log(`Média de calor: ${avgHeat.toFixed(2)}`);
    console.log(`Desvio padrão: ${stdDev.toFixed(2)}\n`);

    const hotRoots: number[] = [];
    const moderateRoots: number[] = [];
    const coldRoots: number[] = [];

    heatData.forEach(data => {
        if (data.normalized > avgHeat + stdDev * 0.5) {
            hotRoots.push(data.root);
        } else if (data.normalized < avgHeat - stdDev * 0.5) {
            coldRoots.push(data.root);
        } else {
            moderateRoots.push(data.root);
        }
    });

    console.log(`🔥 Raízes QUENTES (acima da média): {${hotRoots.join(', ')}}`);
    console.log(`🟡 Raízes MODERADAS (na média): {${moderateRoots.join(', ')}}`);
    console.log(`❄️  Raízes FRIAS (abaixo da média): {${coldRoots.join(', ')}}\n`);

    console.log('═══════════════════════════════════════════════════════════\n');

    // Prediction based on moderate roots
    console.log('🔮 PREVISÃO (Baseada em Raízes Moderadas):\n');

    if (moderateRoots.length > 0) {
        console.log(`Raízes previstas: {${moderateRoots.join(', ')}}\n`);

        const candidateNumbers: number[] = [];
        for (let num = 1; num <= 50; num++) {
            const root = getDigitalRoot(num);
            if (moderateRoots.includes(root)) {
                candidateNumbers.push(num);
            }
        }

        console.log(`Números candidatos (${candidateNumbers.length}): [${candidateNumbers.join(', ')}]`);
    } else {
        console.log('⚠️ Nenhuma raiz moderada encontrada. Usar raízes quentes:\n');
        console.log(`Raízes previstas: {${hotRoots.join(', ')}}\n`);

        const candidateNumbers: number[] = [];
        for (let num = 1; num <= 50; num++) {
            const root = getDigitalRoot(num);
            if (hotRoots.includes(root)) {
                candidateNumbers.push(num);
            }
        }

        console.log(`Números candidatos (${candidateNumbers.length}): [${candidateNumbers.slice(0, 20).join(', ')}...]`);
    }

    console.log('\n═══════════════════════════════════════════════════════════\n');

    // Compare with previous analysis
    console.log('📈 COMPARAÇÃO COM ANÁLISE ANTERIOR:\n');
    console.log('ANTES (sem normalização):');
    console.log('  - Linhas 3 & 6: +17% calor');
    console.log('  - Raiz 8: Dominava zonas quentes\n');

    console.log('DEPOIS (com normalização):');
    const top3 = heatData.slice(0, 3);
    top3.forEach((d, idx) => {
        console.log(`  ${idx + 1}. Raiz ${d.root}: ${d.normalized.toFixed(2)} calor/célula`);
    });

    console.log('\n✅ Análise normalizada completa!\n');
}

analyzeNormalized()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
