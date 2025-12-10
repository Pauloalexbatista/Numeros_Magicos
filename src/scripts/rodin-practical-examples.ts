import { prisma } from '../lib/prisma';

// Helper: Digital Root (1-9)
function getDigitalRoot(n: number): number {
    while (n > 9) {
        n = n.toString().split('').reduce((sum, d) => sum + parseInt(d), 0);
    }
    return n;
}

// Helper: Get unique roots present in a draw
function getRootsPresent(numbers: number[]): Set<number> {
    const roots = numbers.map(getDigitalRoot);
    return new Set(roots);
}

// Helper: Get all numbers with specific roots
function getNumbersWithRoots(roots: number[]): number[] {
    const candidates: number[] = [];
    for (let num = 1; num <= 50; num++) {
        const root = getDigitalRoot(num);
        if (roots.includes(root)) {
            candidates.push(num);
        }
    }
    return candidates;
}

// Predict next draw based on correlations
function predictNextDraw(lastDrawNumbers: number[]): {
    predictedRoots: number[];
    predictedNumbers: number[];
    reasoning: string[];
} {
    const roots = getRootsPresent(lastDrawNumbers);
    const predictedRoots = new Set<number>();
    const reasoning: string[] = [];

    // Apply top 5 correlations
    if (roots.has(4)) {
        predictedRoots.add(4);
        reasoning.push('Raiz 4 presente → Prever raiz 4 (57.6% auto-repetição)');
    }

    if (roots.has(7)) {
        predictedRoots.add(2);
        reasoning.push('Raiz 7 presente → Prever raiz 2 (56.2% correlação)');
    }

    if (roots.has(6)) {
        predictedRoots.add(3);
        reasoning.push('Raiz 6 presente → Prever raiz 3 (56.0% correlação)');
    }

    if (roots.has(5)) {
        predictedRoots.add(3);
        reasoning.push('Raiz 5 presente → Prever raiz 3 (53.3% correlação)');
    }

    if (roots.has(2)) {
        predictedRoots.add(2);
        reasoning.push('Raiz 2 presente → Prever raiz 2 (52.6% auto-repetição)');
    }

    const predictedRootsArray = Array.from(predictedRoots);
    const predictedNumbers = getNumbersWithRoots(predictedRootsArray);

    return {
        predictedRoots: predictedRootsArray,
        predictedNumbers,
        reasoning
    };
}

// Check if prediction was successful
function checkPrediction(predictedNumbers: number[], actualNumbers: number[]): {
    matches: number[];
    matchCount: number;
    success: boolean;
} {
    const matches = predictedNumbers.filter(n => actualNumbers.includes(n));
    return {
        matches,
        matchCount: matches.length,
        success: matches.length >= 2 // Consider success if 2+ matches
    };
}

async function showPracticalExamples() {
    console.log('🎯 CASOS PRÁTICOS: Sistema Rodin em Ação\n');
    console.log('Vamos ver 10 exemplos reais de sorteios consecutivos\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Fetch last 50 draws to have enough examples
    const draws = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        take: 50
    });

    const history = draws.reverse();

    let successCount = 0;
    let totalExamples = 0;
    const maxExamples = 10;

    for (let i = 0; i < history.length - 1 && totalExamples < maxExamples; i++) {
        const currentDraw = history[i];
        const nextDraw = history[i + 1];

        const currentNums = JSON.parse(currentDraw.numbers) as number[];
        const nextNums = JSON.parse(nextDraw.numbers) as number[];

        const currentRoots = getRootsPresent(currentNums);

        // Only show examples where we have correlations to apply
        if (currentRoots.has(4) || currentRoots.has(6) || currentRoots.has(7) ||
            currentRoots.has(5) || currentRoots.has(2)) {

            totalExamples++;

            const prediction = predictNextDraw(currentNums);
            const result = checkPrediction(prediction.predictedNumbers, nextNums);

            if (result.success) successCount++;

            console.log(`📅 EXEMPLO ${totalExamples}\n`);
            console.log(`Data: ${currentDraw.date.toISOString().split('T')[0]}\n`);

            // Show current draw
            console.log('🎲 SORTEIO N (Base para previsão):');
            console.log(`   Números: [${currentNums.map(n => n.toString().padStart(2)).join(', ')}]`);
            const rootsStr = currentNums.map(n => getDigitalRoot(n)).join(', ');
            console.log(`   Raízes:  [${rootsStr}]`);
            console.log(`   Raízes únicas: {${Array.from(currentRoots).sort((a, b) => a - b).join(', ')}}\n`);

            // Show prediction logic
            console.log('🔮 PREVISÃO (Aplicando correlações):');
            prediction.reasoning.forEach(r => console.log(`   ✓ ${r}`));
            console.log(`\n   Raízes previstas: {${prediction.predictedRoots.sort((a, b) => a - b).join(', ')}}`);
            console.log(`   Números candidatos (${prediction.predictedNumbers.length}): [${prediction.predictedNumbers.slice(0, 10).join(', ')}...]`);

            // Show actual next draw
            console.log(`\n✨ SORTEIO N+1 (O que realmente saiu):`);
            console.log(`   Data: ${nextDraw.date.toISOString().split('T')[0]}`);
            console.log(`   Números: [${nextNums.map(n => n.toString().padStart(2)).join(', ')}]`);
            const nextRootsStr = nextNums.map(n => getDigitalRoot(n)).join(', ');
            console.log(`   Raízes:  [${nextRootsStr}]\n`);

            // Show result
            if (result.matchCount > 0) {
                console.log(`✅ RESULTADO: ${result.matchCount} ACERTO(S)!`);
                console.log(`   Números acertados: [${result.matches.join(', ')}]`);

                // Show which roots matched
                const matchedRoots = new Set(result.matches.map(getDigitalRoot));
                const predictedRootsSet = new Set(prediction.predictedRoots);
                const rootMatches = Array.from(matchedRoots).filter(r => predictedRootsSet.has(r));
                if (rootMatches.length > 0) {
                    console.log(`   Raízes acertadas: {${rootMatches.join(', ')}}`);
                }
            } else {
                console.log(`❌ RESULTADO: Nenhum acerto direto`);

                // Check if at least the roots were correct
                const nextRoots = getRootsPresent(nextNums);
                const predictedRootsSet = new Set(prediction.predictedRoots);
                const rootMatches = Array.from(nextRoots).filter(r => predictedRootsSet.has(r));

                if (rootMatches.length > 0) {
                    console.log(`   ⚠️ Mas acertou ${rootMatches.length} raiz(es): {${rootMatches.join(', ')}}`);
                }
            }

            console.log('\n' + '─'.repeat(60) + '\n');
        }
    }

    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('📊 ESTATÍSTICAS FINAIS:\n');
    console.log(`Total de exemplos analisados: ${totalExamples}`);
    console.log(`Sucessos (2+ acertos): ${successCount}`);
    console.log(`Taxa de sucesso: ${((successCount / totalExamples) * 100).toFixed(1)}%`);
    console.log(`\nNota: "Sucesso" = 2 ou mais números acertados`);
    console.log('      (Em lotarias, acertar 2-3 números já é significativo!)\n');
}

showPracticalExamples()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
