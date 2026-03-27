import { prisma } from '../lib/prisma';
import { UniversalOscillationV2System } from '../services/universal-oscillation-v2-system';

async function testV2() {
    console.log('🎯 TESTE: Sistema Oscilação Universal V2 (Oscilação Direta)\n');
    console.log('═'.repeat(80));

    const allDraws = await prisma.draw.findMany({
        orderBy: { date: 'asc' }
    });

    console.log(`Total de sorteios: ${allDraws.length}\n`);

    const system = new UniversalOscillationV2System();

    let jackpots = 0;
    let totalHits = 0;
    const testSize = allDraws.length - 100;

    console.log('🔄 Testando V2...\n');

    for (let i = 100; i < allDraws.length; i++) {
        const history = allDraws.slice(0, i);
        const actualDraw = allDraws[i];
        const actualNumbers = typeof actualDraw.numbers === 'string'
            ? (typeof actualDraw.numbers === "string" ? JSON.parse(actualDraw.numbers) : actualDraw.numbers)
            : actualDraw.numbers;

        const prediction = await system.generateTop10(history as any[]);
        const hits = prediction.filter(n => actualNumbers.includes(n)).length;

        totalHits += hits;
        if (hits === 5) jackpots++;

        if ((i - 100) % 300 === 0) {
            console.log(`  Processados: ${i - 100}/${testSize}...`);
        }
    }

    const precision = (jackpots / testSize) * 100;
    const avgHits = (totalHits / (testSize * 5)) * 100;

    console.log('\n' + '═'.repeat(80));
    console.log('\n📊 RESULTADOS V2\n');

    console.log(`🌀 Oscilação Universal V2:`);
    console.log(`   Jackpots: ${jackpots} (${precision.toFixed(2)}%)`);
    console.log(`   Avg Hits: ${avgHits.toFixed(2)}%`);

    console.log('\n🔍 COMPARAÇÃO:\n');

    const benchmarks = [
        { name: 'Bronze', jps: 66 },
        { name: 'Vortex 2-Canal', jps: 62 },
        { name: 'Prata', jps: 64 },
        { name: 'Polaridade 3-6', jps: 57 },
        { name: 'Oscilação V1', jps: 49 }
    ];

    benchmarks.forEach(b => {
        const diff = jackpots - b.jps;
        const symbol = diff > 0 ? '✅' : diff < 0 ? '❌' : '➖';
        console.log(`  ${b.name}: ${b.jps} JPs ${symbol} ${diff > 0 ? '+' : ''}${diff}`);
    });

    console.log('\n' + '═'.repeat(80));

    await prisma.$disconnect();
}

testV2()
    .then(() => {
        console.log('\n✅ Teste V2 concluído!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Erro:', error);
        process.exit(1);
    });
