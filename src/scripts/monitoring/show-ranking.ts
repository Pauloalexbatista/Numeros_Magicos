
import { prisma } from '../../lib/prisma';

async function main() {
    const ranking = await prisma.systemRanking.findMany({
        orderBy: { avgAccuracy: 'desc' },
        take: 20
    });

    console.log('\n🏆 Current System Ranking 🏆\n');
    console.log('Pos | System Name                | Accuracy');
    console.log('----|----------------------------|---------');

    ranking.forEach((r, index) => {
        const name = r.systemName.padEnd(26);
        const acc = r.avgAccuracy.toFixed(2) + '%';
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '  ';
        console.log(`${medal} ${index + 1} | ${name} | ${acc}`);
    });
}

main();
