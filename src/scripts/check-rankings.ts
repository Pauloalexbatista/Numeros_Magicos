import { prisma } from '@/lib/prisma';

/**
 * Check current system rankings and identify top performers
 */

async function checkSystemRankings() {
    console.log('🏆 RANKING DOS SISTEMAS - ANÁLISE DE PERFORMANCE\n');
    console.log('═'.repeat(80));

    // Fetch all system rankings ordered by accuracy
    const rankings = await prisma.systemRanking.findMany({
        orderBy: { avgAccuracy: 'desc' },
        take: 20 // Top 20
    });

    if (rankings.length === 0) {
        console.log('❌ Não há rankings disponíveis. Execute o cron job primeiro.');
        return;
    }

    console.log(`Total de sistemas ranqueados: ${rankings.length}\n`);
    console.log('Top 20 Sistemas por Precisão:\n');

    console.log('┌────┬─────────────────────────────────────┬──────────┬──────────┬──────────┐');
    console.log('│ #  │ Sistema                             │ Precisão │ Acertos  │ Jackpots │');
    console.log('├────┼─────────────────────────────────────┼──────────┼──────────┼──────────┤');

    rankings.forEach((rank, idx) => {
        const name = rank.systemName.padEnd(35, ' ').substring(0, 35);
        const accuracy = `${rank.avgAccuracy.toFixed(1)}%`.padStart(8, ' ');
        const hits = rank.totalHits.toString().padStart(8, ' ');
        const jackpots = rank.jackpots.toString().padStart(8, ' ');

        console.log(`│ ${(idx + 1).toString().padStart(2, ' ')} │ ${name} │ ${accuracy} │ ${hits} │ ${jackpots} │`);
    });

    console.log('└────┴─────────────────────────────────────┴──────────┴──────────┴──────────┘');

    // Find Elastic System
    const elasticSystem = rankings.find(r => r.systemName.includes('Elástico') || r.systemName.includes('Elastic'));

    if (elasticSystem) {
        console.log('\n' + '═'.repeat(80));
        console.log('\n🔍 SISTEMA ELÁSTICO - ANÁLISE DETALHADA\n');

        const position = rankings.findIndex(r => r.systemName === elasticSystem.systemName) + 1;

        console.log(`Posição no ranking: #${position}`);
        console.log(`Precisão: ${elasticSystem.avgAccuracy.toFixed(2)}%`);
        console.log(`Total de acertos: ${elasticSystem.totalHits}`);
        console.log(`Jackpots: ${elasticSystem.jackpots}`);
        console.log(`Última atualização: ${new Date(elasticSystem.updatedAt).toLocaleString('pt-PT')}`);

        // Compare with target
        const target = 60;
        const current = elasticSystem.avgAccuracy;
        const gap = target - current;

        console.log(`\n📊 Comparação com Meta:`);
        console.log(`  Atual: ${current.toFixed(2)}%`);
        console.log(`  Meta: ${target}%`);
        console.log(`  Gap: ${gap > 0 ? '+' : ''}${gap.toFixed(2)}%`);

        if (current >= target) {
            console.log(`  ✅ META ATINGIDA!`);
        } else if (current >= 55) {
            console.log(`  ⚠️  Muito perto! Faltam ${gap.toFixed(2)}%`);
        } else {
            console.log(`  ❌ Ainda longe da meta`);
        }
    } else {
        console.log('\n⚠️  Sistema Elástico não encontrado no ranking');
    }

    // Show top 3 for reference
    console.log('\n' + '═'.repeat(80));
    console.log('\n🥇 TOP 3 SISTEMAS\n');

    rankings.slice(0, 3).forEach((rank, idx) => {
        const medals = ['🥇', '🥈', '🥉'];
        console.log(`${medals[idx]} ${rank.systemName}`);
        console.log(`   Precisão: ${rank.avgAccuracy.toFixed(2)}%`);
        console.log(`   Acertos: ${rank.totalHits}`);
        console.log('');
    });

    // Show best accuracy
    const best = rankings[0];
    console.log('═'.repeat(80));
    console.log(`\n🎯 MELHOR SISTEMA ATUAL: ${best.systemName}`);
    console.log(`   Precisão: ${best.avgAccuracy.toFixed(2)}%`);

    if (best.avgAccuracy >= 60) {
        console.log(`   ✅ JÁ ATINGIU A META DE 60%!`);
    } else {
        console.log(`   ⚠️  Faltam ${(60 - best.avgAccuracy).toFixed(2)}% para atingir 60%`);
    }

    console.log('\n' + '═'.repeat(80));
}

// Run analysis
checkSystemRankings()
    .then(() => {
        console.log('\n✅ Análise concluída!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Erro:', error);
        process.exit(1);
    });
