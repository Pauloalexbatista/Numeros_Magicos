import { prisma } from '@/lib/prisma';
// import { CompensationModel } from '@/models/implementations/CompensationModel';
// NOTE: CompensationModel not implemented yet - script disabled

/**
 * Test script for Compensation Model
 * Tests if numbers with statistical debt (deficit) have higher probability of appearing
 */

async function testCompensationModel() {
    console.log('🧪 TESTE DO SISTEMA DE COMPENSAÇÃO ESTATÍSTICA\n');
    console.log('═'.repeat(80));

    // Fetch all draws
    const allDraws = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        select: { id: true, date: true, numbers: true }
    });

    console.log(`📊 Total de sorteios disponíveis: ${allDraws.length}\n`);

    if (allDraws.length < 51) {
        console.log('❌ Não há sorteios suficientes para testar (mínimo 51)');
        return;
    }

    // const model = new CompensationModel();
    console.log('⚠️  Script desativado: CompensationModel não implementado');
    return;

    let totalTests = 0;
    let totalHits = 0;
    let totalPredicted = 0;

    const hitsByPosition: number[] = [0, 0, 0, 0, 0]; // Track hits for each of the 5 predictions

    console.log('🔄 Executando backtest...\n');
    console.log('Formato: [Sorteio] Previsão → Resultado Real (✓ = acerto)\n');

    // Start from draw 51 (need 50 previous draws for window)
    for (let i = 50; i < Math.min(allDraws.length - 1, 150); i++) {
        // Use draws [i+1...i+50] as history (50 draws before current)
        const history = allDraws.slice(i + 1, i + 51).reverse();

        // Predict for draw at index i
        const actualDraw = allDraws[i];
        const actualNumbers = typeof actualDraw.numbers === 'string'
            ? (typeof actualDraw.numbers === "string" ? JSON.parse(actualDraw.numbers) : actualDraw.numbers)
            : actualDraw.numbers;

        // Get prediction
        // const prediction = model.predict(history as any[], 5);
        // const predictedNumbers = prediction.numbers;

        // Count hits
        const hits = predictedNumbers.filter(num => actualNumbers.includes(num));
        totalHits += hits.length;
        totalPredicted += predictedNumbers.length;
        totalTests++;

        // Track which positions hit
        predictedNumbers.forEach((num, idx) => {
            if (actualNumbers.includes(num)) {
                hitsByPosition[idx]++;
            }
        });

        // Display result (show first 20 and last 10)
        if (i < 70 || i >= allDraws.length - 11) {
            const date = new Date(actualDraw.date).toLocaleDateString('pt-PT');
            const hitMarkers = predictedNumbers.map(num =>
                actualNumbers.includes(num) ? '✓' : '✗'
            );

            console.log(`[${date}] ${predictedNumbers.join(', ')} → ${actualNumbers.join(', ')}`);
            console.log(`           ${hitMarkers.join('  ')} (${hits.length}/5 acertos)\n`);
        } else if (i === 70) {
            console.log('... (omitindo resultados intermédios) ...\n');
        }
    }

    console.log('═'.repeat(80));
    console.log('\n📈 RESULTADOS DO BACKTEST\n');

    const accuracy = (totalHits / totalPredicted) * 100;
    const avgHitsPerDraw = totalHits / totalTests;

    console.log(`Total de testes: ${totalTests}`);
    console.log(`Total de números previstos: ${totalPredicted}`);
    console.log(`Total de acertos: ${totalHits}`);
    console.log(`\nPrecisão: ${accuracy.toFixed(2)}%`);
    console.log(`Média de acertos por sorteio: ${avgHitsPerDraw.toFixed(2)}/5`);

    console.log(`\n📊 Acertos por posição:`);
    hitsByPosition.forEach((hits, idx) => {
        const posAccuracy = (hits / totalTests) * 100;
        console.log(`   Posição ${idx + 1}: ${hits}/${totalTests} (${posAccuracy.toFixed(1)}%)`);
    });

    // Comparison with random
    const randomExpected = 5 * 0.1; // 5 numbers * 10% probability each
    const randomAccuracy = 10; // 10% per number

    console.log(`\n🎲 COMPARAÇÃO COM ALEATÓRIO\n`);
    console.log(`Esperado (aleatório): ${randomExpected.toFixed(2)} acertos/sorteio (${randomAccuracy}% precisão)`);
    console.log(`Obtido (compensação): ${avgHitsPerDraw.toFixed(2)} acertos/sorteio (${accuracy.toFixed(2)}% precisão)`);

    const improvement = ((accuracy - randomAccuracy) / randomAccuracy) * 100;

    if (accuracy > randomAccuracy + 2) {
        console.log(`\n✅ SUCESSO! O sistema é ${improvement.toFixed(1)}% melhor que aleatório!`);
        console.log(`   A compensação estatística FUNCIONA! 🎯`);
    } else if (accuracy > randomAccuracy - 2 && accuracy < randomAccuracy + 2) {
        console.log(`\n⚠️  NEUTRO: Precisão similar ao aleatório (±2%)`);
        console.log(`   A compensação estatística NÃO tem efeito significativo.`);
    } else {
        console.log(`\n❌ FALHA: Sistema pior que aleatório!`);
        console.log(`   A compensação estatística NÃO funciona.`);
        console.log(`   💡 Sugestão: Testar estratégia INVERSA (números em crédito)!`);
    }

    console.log('\n' + '═'.repeat(80));

    // Show example prediction for next draw
    console.log('\n🔮 PREVISÃO PARA PRÓXIMO SORTEIO\n');
    const latestHistory = allDraws.slice(0, 50);
    // const nextPrediction = model.predict(latestHistory as any[], 5);

    console.log(`Números previstos: ${nextPrediction.numbers.join(', ')}`);
    console.log(`\nRaciocínio: ${nextPrediction.reasoning}`);
    console.log('\n' + '═'.repeat(80));
}

// Run test
testCompensationModel()
    .then(() => {
        console.log('\n✅ Teste concluído!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Erro no teste:', error);
        process.exit(1);
    });
