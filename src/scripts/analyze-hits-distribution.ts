
import { prisma } from '../lib/prisma';

async function main() {
    console.log('📊 Analyzing Hit Distribution (Prize Potential)...');

    const systems = [
        'Sistema Média Vizinhos',
        'Sistema Platina',
        'Sistema Ouro'
    ];

    for (const name of systems) {
        console.log(`\n🔍 System: ${name}`);

        const perfs = await prisma.systemPerformance.findMany({
            where: { systemName: name },
            select: { hits: true }
        });

        if (perfs.length === 0) {
            console.log('   No data found.');
            continue;
        }

        const distribution = {
            0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0
        };

        perfs.forEach(p => {
            const h = p.hits as 0 | 1 | 2 | 3 | 4 | 5;
            distribution[h]++;
        });

        console.log(`   Total Draws: ${perfs.length}`);
        console.log(`   🎯 5 Hits (Jackpot Potential): ${distribution[5]}`);
        console.log(`   💰 4 Hits (High Prize):        ${distribution[4]}`);
        console.log(`   💵 3 Hits (Medium Prize):      ${distribution[3]}`);
        console.log(`   📉 0-2 Hits (Low/No Prize):    ${distribution[0] + distribution[1] + distribution[2]}`);

        const prizeDraws = distribution[3] + distribution[4] + distribution[5];
        const prizePct = ((prizeDraws / perfs.length) * 100).toFixed(1);
        console.log(`   ✨ Prize Frequency: ${prizePct}% of draws have 3+ hits`);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
