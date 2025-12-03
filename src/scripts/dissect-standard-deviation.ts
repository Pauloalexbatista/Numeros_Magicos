import { prisma } from '../lib/prisma';

async function main() {
    console.log('🔍 DISSECANDO O STANDARD DEVIATION (54.2%)\n');

    const allDraws = await prisma.draw.findMany({
        orderBy: { date: 'asc' }
    });

    const parsedDraws = allDraws.map(d => ({
        numbers: JSON.parse(d.numbers) as number[]
    }));

    // Test on one example to see the process
    const testIndex = parsedDraws.length - 2;
    const history = parsedDraws.slice(0, testIndex);
    const recent50 = history.slice(-50);

    console.log('='.repeat(70));
    console.log('PASSO A PASSO DO ALGORITMO');
    console.log('='.repeat(70));

    // STEP 1: Generate candidates per position
    console.log('\n📍 PASSO 1: Gerar candidatos por posição\n');

    const candidates = new Set<number>();

    for (let pos = 0; pos < 5; pos++) {
        const values = recent50.map(d => d.numbers[pos]);
        const mean = values.reduce((a, b) => a + b, 0) / values.length;

        // Calculate StdDev
        const squareDiffs = values.map(value => Math.pow(value - mean, 2));
        const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
        const stdDev = Math.sqrt(avgSquareDiff);

        const targets = [
            Math.round(mean),           // Mean
            Math.round(mean - 1),       // Mean - 1
            Math.round(mean + 1),       // Mean + 1
            Math.round(mean + stdDev),  // Mean + StdDev
            Math.round(mean - stdDev)   // Mean - StdDev
        ];

        console.log(`Casa ${pos + 1}:`);
        console.log(`   Média: ${mean.toFixed(2)}`);
        console.log(`   Desvio Padrão: ${stdDev.toFixed(2)}`);
        console.log(`   Candidatos: ${targets.filter(t => t >= 1 && t <= 50).join(', ')}`);

        targets.forEach(t => {
            if (t >= 1 && t <= 50) candidates.add(t);
        });
    }

    console.log(`\n📊 Total de candidatos únicos: ${candidates.size}`);

    // STEP 2: Check if needs trimming or filling
    let result = Array.from(candidates);
    console.log('\n📍 PASSO 2: Ajustar para 25 números\n');

    // Calculate frequency
    const freq: Record<number, number> = {};
    recent50.forEach(d => {
        d.numbers.forEach((n: number) => {
            freq[n] = (freq[n] || 0) + 1;
        });
    });

    if (result.length > 25) {
        console.log(`   ⚠️ Tem ${result.length} candidatos (mais que 25)`);
        console.log(`   → Ordenar por FREQUÊNCIA e ficar com top 25`);

        // Sort by frequency
        const sorted = result.map(num => ({ num, freq: freq[num] || 0 }))
            .sort((a, b) => b.freq - a.freq);

        console.log(`\n   Top 10 mais frequentes:`);
        sorted.slice(0, 10).forEach((item, i) => {
            console.log(`      ${i + 1}. Número ${item.num}: ${item.freq}x`);
        });

        result = sorted.slice(0, 25).map(item => item.num);

    } else if (result.length < 25) {
        console.log(`   ⚠️ Tem ${result.length} candidatos (menos que 25)`);
        console.log(`   → Preencher com números mais frequentes`);

        const allNumbers = Array.from({ length: 50 }, (_, i) => i + 1);
        const sortedByFreq = allNumbers
            .map(num => ({ num, freq: freq[num] || 0 }))
            .sort((a, b) => b.freq - a.freq);

        for (const item of sortedByFreq) {
            if (result.length >= 25) break;
            if (!result.includes(item.num)) {
                result.push(item.num);
            }
        }
    } else {
        console.log(`   ✅ Exatamente 25 candidatos - não precisa ajustar`);
    }

    console.log(`\n📊 Resultado final: ${result.length} números`);
    console.log(`   ${result.sort((a, b) => a - b).join(', ')}`);

    // STEP 3: Test accuracy
    const actual = parsedDraws[testIndex].numbers;
    const hits = actual.filter(n => result.includes(n)).length;

    console.log(`\n📍 PASSO 3: Verificar acerto\n`);
    console.log(`   Sorteio real: ${actual.join(', ')}`);
    console.log(`   Acertos: ${hits}/5 ✅`);

    // CONCLUSION
    console.log('\n' + '='.repeat(70));
    console.log('💡 CONCLUSÃO');
    console.log('='.repeat(70));
    console.log(`\nO segredo do Standard Deviation:`);
    console.log(`1. Gera candidatos: Média, Média±1, Média±Desvio`);
    console.log(`2. Se > 25: ORDENA POR FREQUÊNCIA HISTÓRICA`);
    console.log(`3. Fica com os top 25 mais frequentes`);
    console.log(`\n🔑 A ordenação por frequência é CRÍTICA!`);
    console.log(`   Não basta gerar candidatos perto da média`);
    console.log(`   Tem de escolher os que SAEM MAIS VEZES!`);
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
