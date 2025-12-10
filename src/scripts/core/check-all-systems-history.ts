import { prisma } from '@/lib/prisma';
import { rankedSystems } from '@/services/ranked-systems';

async function checkSystemPredictionCounts() {
    console.log('📊 VERIFICAÇÃO DE HISTÓRICO - SystemPrediction\n');
    console.log('═'.repeat(80));

    const results: { name: string; count: number; isAnti: boolean }[] = [];

    for (const system of rankedSystems) {
        const count = await prisma.systemPrediction.count({
            where: { systemName: system.name }
        });

        results.push({
            name: system.name,
            count,
            isAnti: system.name.startsWith('Anti-')
        });
    }

    // Separate systems and anti-systems
    const systems = results.filter(r => !r.isAnti).sort((a, b) => a.count - b.count);
    const antiSystems = results.filter(r => r.isAnti).sort((a, b) => a.count - b.count);

    console.log('\n🎯 SISTEMAS NORMAIS:\n');
    systems.forEach(s => {
        const status = s.count === 0 ? '❌ VAZIO' : s.count === 1 ? '⚠️  1 SORTEIO' : s.count < 100 ? `⚠️  ${s.count}` : `✅ ${s.count}`;
        console.log(`${status.padEnd(15)} | ${s.name}`);
    });

    console.log('\n🔄 ANTI-SISTEMAS:\n');
    antiSystems.forEach(s => {
        const status = s.count === 0 ? '❌ VAZIO' : s.count === 1 ? '⚠️  1 SORTEIO' : s.count < 100 ? `⚠️  ${s.count}` : `✅ ${s.count}`;
        console.log(`${status.padEnd(15)} | ${s.name}`);
    });

    // Summary
    const empty = results.filter(r => r.count === 0);
    const single = results.filter(r => r.count === 1);
    const incomplete = results.filter(r => r.count > 1 && r.count < 1800);
    const complete = results.filter(r => r.count >= 1800);

    console.log('\n📊 RESUMO:\n');
    console.log(`Total de sistemas: ${results.length}`);
    console.log(`  ✅ Completos (≥1800): ${complete.length}`);
    console.log(`  ⚠️  Incompletos (1-1799): ${incomplete.length}`);
    console.log(`  ⚠️  Apenas 1 sorteio: ${single.length}`);
    console.log(`  ❌ Vazios (0): ${empty.length}`);

    if (single.length > 0) {
        console.log('\n⚠️  SISTEMAS COM APENAS 1 SORTEIO:');
        single.forEach(s => console.log(`   - ${s.name}`));
    }

    if (empty.length > 0) {
        console.log('\n❌ SISTEMAS VAZIOS:');
        empty.forEach(s => console.log(`   - ${s.name}`));
    }

    console.log('\n' + '═'.repeat(80));

    await prisma.$disconnect();
}

checkSystemPredictionCounts();
