
import { prisma } from '../lib/prisma';

async function main() {
    const games = ['EUROMILLIONS', 'TOTOLOTO', 'EURODREAMS'];

    console.log('\n📊 STATUS DO HISTÓRICO (Bases de Dados):');
    console.log('------------------------------------------------');

    for (const game of games) {
        const count = await prisma.draw.count({ where: { game } });
        const first = await prisma.draw.findFirst({
            where: { game },
            orderBy: { date: 'asc' }
        });
        const last = await prisma.draw.findFirst({
            where: { game },
            orderBy: { date: 'desc' }
        });

        console.log(`\n🎲 ${game}:`);
        console.log(`   📝 Total Sorteios: ${count}`);
        console.log(`   📅 Início: ${first ? first.date.toISOString().split('T')[0] : 'N/A'}`);
        console.log(`   📅 Fim:    ${last ? last.date.toISOString().split('T')[0] : 'N/A'}`);

        // Check for gaps (simple check: count vs expected weeks)
        if (first && last) {
            const diffTime = Math.abs(last.date.getTime() - first.date.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const years = (diffDays / 365.25).toFixed(1);
            console.log(`   ⏱️  Cobertura: ~${years} anos`);
        }
    }
    console.log('\n------------------------------------------------');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
