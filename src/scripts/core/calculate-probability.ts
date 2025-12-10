/**
 * Cálculo da probabilidade de acertar exatamente K números
 * ao escolher N números de um total de T, num sorteio de S números
 */

function factorial(n: number): number {
    if (n <= 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

function combination(n: number, k: number): number {
    if (k > n) return 0;
    if (k === 0 || k === n) return 1;

    // C(n,k) = n! / (k! * (n-k)!)
    // Optimized to avoid overflow
    let result = 1;
    for (let i = 0; i < k; i++) {
        result *= (n - i);
        result /= (i + 1);
    }
    return result;
}

function probabilityExactHits(
    totalNumbers: number,    // T = 50 (números disponíveis)
    chosenNumbers: number,   // N = 25 (números escolhidos)
    drawnNumbers: number,    // S = 5 (números sorteados)
    exactHits: number        // K = 5 (acertos desejados)
): number {
    // P(K acertos) = C(N,K) * C(T-N, S-K) / C(T,S)

    const numerator =
        combination(chosenNumbers, exactHits) *           // C(25, 5)
        combination(totalNumbers - chosenNumbers, drawnNumbers - exactHits); // C(25, 0)

    const denominator = combination(totalNumbers, drawnNumbers); // C(50, 5)

    return numerator / denominator;
}

console.log('🎲 CÁLCULO DE PROBABILIDADES - EuroMillions\n');
console.log('═'.repeat(80));

const T = 50;  // Total de números
const N = 25;  // Números escolhidos
const S = 5;   // Números sorteados

console.log('\nParâmetros:');
console.log(`  Total de números disponíveis: ${T}`);
console.log(`  Números escolhidos na aposta: ${N}`);
console.log(`  Números sorteados: ${S}`);

console.log('\n📊 PROBABILIDADES TEÓRICAS:\n');

for (let k = 0; k <= 5; k++) {
    const prob = probabilityExactHits(T, N, S, k);
    const percentage = (prob * 100).toFixed(2);
    console.log(`  ${k} acertos: ${percentage}%`);
}

console.log('\n🎯 VERIFICAÇÃO ESPECÍFICA:\n');

const prob5 = probabilityExactHits(T, N, S, 5);
console.log(`Probabilidade de acertar EXATAMENTE 5 números:`);
console.log(`  Valor calculado: ${(prob5 * 100).toFixed(4)}%`);
console.log(`  Valor na tabela: 2.51%`);
console.log(`  Diferença: ${Math.abs((prob5 * 100) - 2.51).toFixed(4)}%`);

console.log('\n📈 CÁLCULOS INTERMÉDIOS:\n');
console.log(`  C(25, 5) = ${combination(25, 5)}`);
console.log(`  C(25, 0) = ${combination(25, 0)}`);
console.log(`  C(50, 5) = ${combination(50, 5)}`);
console.log(`  Numerador: ${combination(25, 5) * combination(25, 0)}`);
console.log(`  Denominador: ${combination(50, 5)}`);

console.log('\n' + '═'.repeat(80));
