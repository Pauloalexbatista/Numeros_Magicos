import { prisma } from '../lib/prisma';

// Helper: Digital Root (1-9)
function getDigitalRoot(n: number): number {
    while (n > 9) {
        n = n.toString().split('').reduce((sum, d) => sum + parseInt(d), 0);
    }
    return n;
}

// Rodin Map: cada linha representa multiplicação por essa linha (mod 9)
// Linha[i][j] = (i * j) mod 9, onde resultado 0 vira 9
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

// Map each number 1-50 to its position(s) in the Rodin map
function mapNumberToRodinPositions(num: number): Array<{ row: number, col: number }> {
    const root = getDigitalRoot(num);
    const map = buildRodinMap();
    const positions: Array<{ row: number, col: number }> = [];

    // Find all positions where this root appears
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (map[row][col] === root) {
                positions.push({ row: row + 1, col: col + 1 }); // 1-indexed
            }
        }
    }

    return positions;
}

// Create a heat map of the Rodin matrix based on recent draws
function createHeatMap(draws: number[][]): number[][] {
    const heatMap: number[][] = Array(9).fill(0).map(() => Array(9).fill(0));

    draws.forEach(drawNumbers => {
        drawNumbers.forEach(num => {
            const positions = mapNumberToRodinPositions(num);
            positions.forEach(pos => {
                heatMap[pos.row - 1][pos.col - 1]++;
            });
        });
    });

    return heatMap;
}

// Visualize the Rodin map with heat
function visualizeRodinMap(heatMap: number[][], rodinMap: number[][]): void {
    console.log('\n🗺️  MAPA DE RODIN COM CALOR (Últimos sorteios)\n');

    // Header
    console.log('     │ Col 1  Col 2  Col 3  Col 4  Col 5  Col 6  Col 7  Col 8  Col 9');
    console.log('─────┼─────────────────────────────────────────────────────────────────');

    for (let row = 0; row < 9; row++) {
        let rowStr = `Ln ${row + 1} │`;

        for (let col = 0; col < 9; col++) {
            const value = rodinMap[row][col];
            const heat = heatMap[row][col];

            // Format: [value:heat]
            const cell = `[${value}:${heat.toString().padStart(2)}]`;
            rowStr += ` ${cell}`;
        }

        console.log(rowStr);
    }

    console.log('\nLegenda: [Raiz:Frequência]');
}

// Analyze spatial patterns
function analyzeSpatialPatterns(heatMap: number[][]): void {
    console.log('\n📊 ANÁLISE DE PADRÕES ESPACIAIS\n');

    // 1. Find hottest zones
    const hotZones: Array<{ row: number, col: number, heat: number }> = [];
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (heatMap[row][col] > 0) {
                hotZones.push({ row: row + 1, col: col + 1, heat: heatMap[row][col] });
            }
        }
    }

    hotZones.sort((a, b) => b.heat - a.heat);

    console.log('🔥 TOP 10 ZONAS MAIS QUENTES:\n');
    hotZones.slice(0, 10).forEach((zone, idx) => {
        console.log(`${idx + 1}. Linha ${zone.row}, Coluna ${zone.col}: ${zone.heat} ocorrências`);
    });

    // 2. Analyze diagonal patterns
    console.log('\n📐 ANÁLISE DE DIAGONAIS:\n');

    // Main diagonal (top-left to bottom-right)
    let mainDiagHeat = 0;
    for (let i = 0; i < 9; i++) {
        mainDiagHeat += heatMap[i][i];
    }
    console.log(`Diagonal principal: ${mainDiagHeat} ocorrências`);

    // Anti-diagonal (top-right to bottom-left)
    let antiDiagHeat = 0;
    for (let i = 0; i < 9; i++) {
        antiDiagHeat += heatMap[i][8 - i];
    }
    console.log(`Diagonal secundária: ${antiDiagHeat} ocorrências`);

    // 3. Analyze row patterns
    console.log('\n📊 CALOR POR LINHA:\n');
    for (let row = 0; row < 9; row++) {
        const rowHeat = heatMap[row].reduce((sum, val) => sum + val, 0);
        const bar = '█'.repeat(Math.floor(rowHeat / 2));
        console.log(`Linha ${row + 1}: ${rowHeat.toString().padStart(3)} ${bar}`);
    }

    // 4. Analyze column patterns
    console.log('\n📊 CALOR POR COLUNA:\n');
    for (let col = 0; col < 9; col++) {
        let colHeat = 0;
        for (let row = 0; row < 9; row++) {
            colHeat += heatMap[row][col];
        }
        const bar = '█'.repeat(Math.floor(colHeat / 2));
        console.log(`Coluna ${col + 1}: ${colHeat.toString().padStart(3)} ${bar}`);
    }
}

// Predict next draw based on spatial patterns
function predictFromSpatialPatterns(heatMap: number[][], rodinMap: number[][]): void {
    console.log('\n🔮 PREVISÃO BASEADA EM PADRÕES ESPACIAIS\n');

    // Find zones with moderate heat (not too hot, not too cold)
    const predictions: Array<{ root: number, row: number, col: number, heat: number }> = [];

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const heat = heatMap[row][col];
            const root = rodinMap[row][col];

            // Look for zones with heat between 2-5 (active but not saturated)
            if (heat >= 2 && heat <= 5) {
                predictions.push({ root, row: row + 1, col: col + 1, heat });
            }
        }
    }

    // Sort by heat descending
    predictions.sort((a, b) => b.heat - a.heat);

    console.log('Zonas com atividade moderada (2-5 ocorrências):\n');
    predictions.slice(0, 10).forEach((pred, idx) => {
        console.log(`${idx + 1}. Raiz ${pred.root} (Linha ${pred.row}, Col ${pred.col}): ${pred.heat} ocorrências`);
    });

    // Get unique roots from predictions
    const predictedRoots = [...new Set(predictions.slice(0, 10).map(p => p.root))];
    console.log(`\nRaízes previstas: {${predictedRoots.join(', ')}}`);

    // Map roots to numbers
    const candidateNumbers: number[] = [];
    for (let num = 1; num <= 50; num++) {
        const root = getDigitalRoot(num);
        if (predictedRoots.includes(root)) {
            candidateNumbers.push(num);
        }
    }

    console.log(`\nNúmeros candidatos (${candidateNumbers.length}): [${candidateNumbers.slice(0, 15).join(', ')}...]`);
}

async function analyzeRodinMatrix() {
    console.log('🗺️  ANÁLISE MATRICIAL DO MAPA DE RODIN\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Build Rodin map
    console.log('📐 A construir Mapa de Rodin (9x9)...');
    const rodinMap = buildRodinMap();
    console.log('✅ Mapa construído!\n');

    // Fetch last 20 draws for heat map
    console.log('📥 A carregar últimos 20 sorteios...');
    const draws = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        take: 20
    });

    const drawNumbers = draws.map(d => (typeof d.numbers === "string" ? JSON.parse(d.numbers) : d.numbers) as number[]);
    console.log(`✅ ${draws.length} sorteios carregados\n`);

    // Create heat map
    console.log('🔥 A criar mapa de calor...');
    const heatMap = createHeatMap(drawNumbers);
    console.log('✅ Mapa de calor criado!\n');

    console.log('═══════════════════════════════════════════════════════════');

    // Visualize
    visualizeRodinMap(heatMap, rodinMap);

    console.log('\n═══════════════════════════════════════════════════════════');

    // Analyze patterns
    analyzeSpatialPatterns(heatMap);

    console.log('\n═══════════════════════════════════════════════════════════');

    // Predict
    predictFromSpatialPatterns(heatMap, rodinMap);

    console.log('\n═══════════════════════════════════════════════════════════\n');
    console.log('✅ Análise matricial completa!\n');
}

analyzeRodinMatrix()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
