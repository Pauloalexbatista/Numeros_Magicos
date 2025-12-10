import { prisma } from '../lib/prisma';

/**
 * ANÁLISE RODIN MAP - Histórico Real
 * 
 * Testa as 5 estratégias do Rodin Map no histórico do EuroMilhões:
 * 1. Transição de Linhas (Oscilação)
 * 2. Sequência de Colunas (Posição)
 * 3. Valor no Mapa (Multiplicação Mod 9)
 * 4. Distância no Mapa (Clusters)
 * 5. Multi-Canal (Combinado)
 */

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

function getDigitalRoot(n: number): number {
    while (n > 9) {
        n = n.toString().split('').reduce((sum, d) => sum + parseInt(d), 0);
    }
    return n;
}

function getNumbersByRoot(root: number): number[] {
    const numbers: number[] = [];
    for (let i = 1; i <= 50; i++) {
        if (getDigitalRoot(i) === root) {
            numbers.push(i);
        }
    }
    return numbers;
}

function getColumnInRow(num: number, row: number): number {
    const numbersInRow = getNumbersByRoot(row);
    return numbersInRow.indexOf(num) + 1;
}

function getNumberByPosition(row: number, col: number): number {
    const numbersInRow = getNumbersByRoot(row);
    return numbersInRow[col - 1] || 0;
}

function getMapValue(row: number, col: number): number {
    const value = (row * col) % 9;
    return value === 0 ? 9 : value;
}

// ============================================================================
// ESTRATÉGIA 1: TRANSIÇÃO DE LINHAS
// ============================================================================

function analyzeLineTransition(lastDraw: number[]): number[] {
    // Mapear para linhas (raízes)
    const lines = lastDraw.map(n => getDigitalRoot(n));

    // Contar frequência de cada linha
    const lineCount: Record<number, number> = {};
    lines.forEach(line => {
        lineCount[line] = (lineCount[line] || 0) + 1;
    });

    // Identificar linha dominante
    const dominantLine = Object.keys(lineCount)
        .map(Number)
        .reduce((a, b) => lineCount[a] > lineCount[b] ? a : b);

    // Aplicar regra de oscilação
    let nextLine: number;
    if (dominantLine === 3) {
        nextLine = 6; // Oscilação 3↔6
    } else if (dominantLine === 6) {
        nextLine = 3; // Oscilação 6↔3
    } else if (dominantLine === 9) {
        nextLine = 9; // 9 é constante
    } else {
        // Ciclo vortex: duplicação mod 9
        nextLine = (dominantLine * 2) % 9 || 9;
    }

    // Retornar números da linha alvo
    return getNumbersByRoot(nextLine);
}

// ============================================================================
// ESTRATÉGIA 2: SEQUÊNCIA DE COLUNAS
// ============================================================================

function analyzeColumnPattern(lastDraw: number[]): number[] {
    // Mapear para posições [linha|coluna]
    const positions = lastDraw.map(n => {
        const row = getDigitalRoot(n);
        const col = getColumnInRow(n, row);
        return { num: n, row, col };
    });

    // Identificar linha dominante
    const rows = positions.map(p => p.row);
    const dominantRow = rows.reduce((a, b) =>
        rows.filter(r => r === a).length > rows.filter(r => r === b).length ? a : b
    );

    // Determinar próxima linha (oscilação)
    let nextRow: number;
    if (dominantRow === 3) nextRow = 6;
    else if (dominantRow === 6) nextRow = 3;
    else if (dominantRow === 9) nextRow = 9;
    else nextRow = (dominantRow * 2) % 9 || 9;

    // Usar mesmas colunas
    const cols = positions.map(p => p.col);

    // Gerar números
    const candidates = cols
        .map(col => getNumberByPosition(nextRow, col))
        .filter(n => n > 0 && n <= 50);

    // Se não houver candidatos suficientes, retornar todos da linha
    return candidates.length >= 5 ? candidates : getNumbersByRoot(nextRow);
}

// ============================================================================
// ESTRATÉGIA 3: VALOR NO MAPA
// ============================================================================

function analyzeMapValues(lastDraw: number[]): number[] {
    // Calcular valores no mapa para último sorteio
    const values = lastDraw.map(n => {
        const row = getDigitalRoot(n);
        const col = getColumnInRow(n, row);
        return getMapValue(row, col);
    });

    // Identificar padrão de valores
    const unique = [...new Set(values)];
    const is369 = unique.every(v => [3, 6, 9].includes(v));

    // Prever próximo valor
    let nextValue: number;
    if (is369) {
        // Oscilação 3↔6↔9
        const last = values[values.length - 1];
        if (last === 3) nextValue = 6;
        else if (last === 6) nextValue = 9;
        else nextValue = 3;
    } else {
        // Usar valor mais frequente
        const valueCounts: Record<number, number> = {};
        values.forEach(v => valueCounts[v] = (valueCounts[v] || 0) + 1);
        nextValue = Object.keys(valueCounts)
            .map(Number)
            .reduce((a, b) => valueCounts[a] > valueCounts[b] ? a : b);
    }

    // Determinar linha alvo
    const dominantRow = getDigitalRoot(lastDraw[0]);
    const nextRow = dominantRow === 3 ? 6 : dominantRow === 6 ? 3 : (dominantRow * 2) % 9 || 9;

    // Encontrar números com o valor alvo na linha alvo
    const candidates: number[] = [];
    for (let col = 1; col <= 10; col++) {
        if (getMapValue(nextRow, col) === nextValue) {
            const num = getNumberByPosition(nextRow, col);
            if (num > 0 && num <= 50) {
                candidates.push(num);
            }
        }
    }

    return candidates.length > 0 ? candidates : getNumbersByRoot(nextRow);
}

// ============================================================================
// ESTRATÉGIA 4: CLUSTERS (DISTÂNCIA)
// ============================================================================

function analyzeMapClusters(lastDraw: number[]): number[] {
    // Mapear posições
    const positions = lastDraw.map(n => ({
        num: n,
        row: getDigitalRoot(n),
        col: getColumnInRow(n, getDigitalRoot(n))
    }));

    // Identificar linha dominante
    const rows = positions.map(p => p.row);
    const dominantRow = rows.reduce((a, b) =>
        rows.filter(r => r === a).length > rows.filter(r => r === b).length ? a : b
    );

    // Próxima linha
    const nextRow = dominantRow === 3 ? 6 : dominantRow === 6 ? 3 : (dominantRow * 2) % 9 || 9;

    // Usar mesmas colunas (manter cluster)
    const cols = positions.map(p => p.col);

    const candidates = cols
        .map(col => getNumberByPosition(nextRow, col))
        .filter(n => n > 0 && n <= 50);

    return candidates.length >= 5 ? candidates : getNumbersByRoot(nextRow);
}

// ============================================================================
// ESTRATÉGIA 5: MULTI-CANAL (COMBINADO)
// ============================================================================

function multiChannelPrediction(lastDraw: number[], history: number[][]): number[] {
    // Executar todas as estratégias
    const strategy1 = analyzeLineTransition(lastDraw);
    const strategy2 = analyzeColumnPattern(lastDraw);
    const strategy3 = analyzeMapValues(lastDraw);
    const strategy4 = analyzeMapClusters(lastDraw);

    // Combinar com pesos
    const scores: Record<number, number> = {};

    strategy1.forEach(n => scores[n] = (scores[n] || 0) + 3); // Peso 3
    strategy2.forEach(n => scores[n] = (scores[n] || 0) + 2); // Peso 2
    strategy3.forEach(n => scores[n] = (scores[n] || 0) + 2); // Peso 2
    strategy4.forEach(n => scores[n] = (scores[n] || 0) + 1); // Peso 1

    // Adicionar frequência histórica (últimos 100 sorteios)
    const recentHistory = history.slice(-100);
    const frequency: Record<number, number> = {};
    recentHistory.forEach(draw => {
        draw.forEach(n => {
            frequency[n] = (frequency[n] || 0) + 1;
        });
    });

    Object.keys(scores).forEach(n => {
        const num = Number(n);
        scores[num] += (frequency[num] || 0) * 0.1; // Peso pequeno para frequência
    });

    // Ordenar e retornar top 25
    const sorted = Object.entries(scores)
        .sort(([, a], [, b]) => b - a)
        .map(([n]) => Number(n));

    return sorted.slice(0, 25);
}

// ============================================================================
// ANÁLISE PRINCIPAL
// ============================================================================

async function analyzeRodinMap() {
    console.log('🗺️  ANÁLISE RODIN MAP - HISTÓRICO REAL\n');
    console.log('═'.repeat(80));

    // Carregar histórico
    const allDraws = await prisma.draw.findMany({
        orderBy: { date: 'asc' }
    });

    console.log(`\n📊 Total de sorteios: ${allDraws.length}\n`);

    // Preparar histórico
    const history = allDraws.map(draw => {
        const numbers = typeof draw.numbers === 'string'
            ? JSON.parse(draw.numbers)
            : draw.numbers;
        return numbers as number[];
    });

    // Testar cada estratégia
    const strategies = [
        { name: 'Transição de Linhas', fn: analyzeLineTransition },
        { name: 'Sequência de Colunas', fn: analyzeColumnPattern },
        { name: 'Valor no Mapa', fn: analyzeMapValues },
        { name: 'Clusters (Distância)', fn: analyzeMapClusters },
    ];

    const results: Record<string, { jackpots: number; hits: number; precision: number }> = {};

    // Testar cada estratégia individualmente
    for (const strategy of strategies) {
        console.log(`\n🔍 Testando: ${strategy.name}...`);

        let jackpots = 0;
        let totalHits = 0;
        const testSize = history.length - 100;

        for (let i = 100; i < history.length; i++) {
            const lastDraw = history[i - 1];
            const actualDraw = history[i];

            // Gerar previsão
            const prediction = strategy.fn(lastDraw);

            // Contar hits
            const hits = prediction.filter(n => actualDraw.includes(n)).length;
            totalHits += hits;

            if (hits === 5) jackpots++;

            // Progress indicator a cada 200 sorteios
            if ((i - 100) % 200 === 0) {
                const progress = ((i - 100) / testSize * 100).toFixed(0);
                process.stdout.write(`\r   Progresso: ${progress}% (${i - 100}/${testSize})...`);
            }
        }

        process.stdout.write('\r' + ' '.repeat(50) + '\r'); // Limpar linha

        const precision = (jackpots / testSize) * 100;
        const avgHits = (totalHits / (testSize * 5)) * 100;

        results[strategy.name] = { jackpots, hits: totalHits, precision };

        console.log(`   ✅ Jackpots: ${jackpots}`);
        console.log(`   ✅ Precisão: ${precision.toFixed(2)}%`);
        console.log(`   ✅ Avg Hits: ${avgHits.toFixed(2)}%`);
    }

    // Testar sistema multi-canal
    console.log(`\n🔍 Testando: Multi-Canal (Combinado)...`);

    let multiJackpots = 0;
    let multiTotalHits = 0;
    const testSize = history.length - 100;

    for (let i = 100; i < history.length; i++) {
        const lastDraw = history[i - 1];
        const actualDraw = history[i];
        const historyUpToNow = history.slice(0, i);

        // Gerar previsão multi-canal
        const prediction = multiChannelPrediction(lastDraw, historyUpToNow);

        // Contar hits
        const hits = prediction.filter(n => actualDraw.includes(n)).length;
        multiTotalHits += hits;

        if (hits === 5) multiJackpots++;

        // Progress indicator a cada 200 sorteios
        if ((i - 100) % 200 === 0) {
            const progress = ((i - 100) / testSize * 100).toFixed(0);
            process.stdout.write(`\r   Progresso: ${progress}% (${i - 100}/${testSize})...`);
        }
    }

    process.stdout.write('\r' + ' '.repeat(50) + '\r'); // Limpar linha

    const multiPrecision = (multiJackpots / testSize) * 100;
    const multiAvgHits = (multiTotalHits / (testSize * 5)) * 100;

    results['Multi-Canal'] = { jackpots: multiJackpots, hits: multiTotalHits, precision: multiPrecision };

    console.log(`   ✅ Jackpots: ${multiJackpots}`);
    console.log(`   ✅ Precisão: ${multiPrecision.toFixed(2)}%`);
    console.log(`   ✅ Avg Hits: ${multiAvgHits.toFixed(2)}%`);

    // Resumo comparativo
    console.log('\n' + '═'.repeat(80));
    console.log('\n📊 RESUMO COMPARATIVO\n');

    console.log('┌─────────────────────────────┬──────────┬───────────┬──────────┐');
    console.log('│ Estratégia                  │ Jackpots │ Precisão  │ Avg Hits │');
    console.log('├─────────────────────────────┼──────────┼───────────┼──────────┤');

    Object.entries(results).forEach(([name, data]) => {
        const nameStr = name.padEnd(27);
        const jpStr = data.jackpots.toString().padStart(8);
        const precStr = data.precision.toFixed(2).padStart(8) + '%';
        const hitsStr = ((data.hits / (testSize * 5)) * 100).toFixed(2).padStart(7) + '%';

        console.log(`│ ${nameStr} │ ${jpStr} │ ${precStr} │ ${hitsStr} │`);
    });

    console.log('└─────────────────────────────┴──────────┴───────────┴──────────┘');

    // Comparação com benchmarks
    console.log('\n📈 COMPARAÇÃO COM BENCHMARKS\n');

    const benchmarks = [
        { name: 'Sistema Bronze', jps: 66, precision: 3.57 },
        { name: 'Vortex 2-Canal', jps: 62, precision: 3.44 },
        { name: 'Polaridade 3-6', jps: 57, precision: 3.17 },
        { name: 'Random (Baseline)', jps: 37, precision: 2.0 },
    ];

    const bestRodin = Object.entries(results)
        .reduce((best, [name, data]) =>
            data.jackpots > best.jackpots ? { name, ...data } : best
            , { name: '', jackpots: 0, precision: 0, hits: 0 });

    console.log(`Melhor Rodin: ${bestRodin.name}`);
    console.log(`  ${bestRodin.jackpots} jackpots (${bestRodin.precision.toFixed(2)}%)\n`);

    benchmarks.forEach(b => {
        const diff = bestRodin.jackpots - b.jps;
        const symbol = diff > 0 ? '✅' : diff < 0 ? '❌' : '➖';
        console.log(`  ${b.name}: ${b.jps} JPs (${b.precision}%) ${symbol} ${diff > 0 ? '+' : ''}${diff}`);
    });

    // Análise detalhada do melhor sistema
    console.log('\n' + '═'.repeat(80));
    console.log('\n💡 ANÁLISE DETALHADA\n');

    if (bestRodin.jackpots >= 66) {
        console.log('🏆 EXCELENTE! Rodin Map SUPERA Bronze!');
        console.log('   Recomendação: IMPLEMENTAR como sistema principal');
    } else if (bestRodin.jackpots >= 60) {
        console.log('✅ MUITO BOM! Rodin Map está no TOP 3!');
        console.log('   Recomendação: IMPLEMENTAR permanentemente');
    } else if (bestRodin.jackpots >= 55) {
        console.log('✅ BOM! Rodin Map tem performance competitiva');
        console.log('   Recomendação: Considerar para ensemble');
    } else if (bestRodin.jackpots >= 50) {
        console.log('⚠️  MÉDIO. Rodin Map funciona mas não é top-tier');
        console.log('   Recomendação: Usar como componente de ensemble');
    } else {
        console.log('❌ FRACO. Performance abaixo do esperado');
        console.log('   Recomendação: Revisar estratégias ou descartar');
    }

    // Exemplo de previsão para próximo sorteio
    console.log('\n' + '═'.repeat(80));
    console.log('\n🔮 EXEMPLO: PREVISÃO PARA PRÓXIMO SORTEIO\n');

    const lastDraw = history[history.length - 1];
    console.log(`Último sorteio: [${lastDraw.join(', ')}]\n`);

    // Mapear para Rodin
    console.log('Mapeamento Rodin:');
    lastDraw.forEach(n => {
        const row = getDigitalRoot(n);
        const col = getColumnInRow(n, row);
        const value = getMapValue(row, col);
        console.log(`  ${n.toString().padStart(2)} → [${row}|${col}] → Valor ${value}`);
    });

    // Gerar previsão
    const prediction = multiChannelPrediction(lastDraw, history);
    console.log(`\n📋 Previsão Multi-Canal (Top 10):`);
    console.log(`   ${prediction.slice(0, 10).join(', ')}`);

    console.log('\n' + '═'.repeat(80));

    await prisma.$disconnect();
}

// Executar
analyzeRodinMap()
    .then(() => {
        console.log('\n✅ Análise concluída!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Erro:', error);
        process.exit(1);
    });
