import { PrismaClient } from '@prisma/client';

async function audit() {
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: "postgresql://neondb_owner:npg_k9J4meXqZoCR@ep-bold-fog-agxi1oca-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require"
            }
        }
    });

    console.log('--- DB AUDIT: PREDICTIONS BY GAME / SYSTEM / DOMAIN ---');

    const games = ['EUROMILLIONS', 'TOTOLOTO', 'EURODREAMS'];

    for (const game of games) {
        console.log(`\n================================`);
        console.log(`🎮 JOGO: ${game}`);
        console.log(`================================`);

        const totalDraws = await prisma.draw.count({ where: { game } });
        console.log(`Total de Sorteios Registados: ${totalDraws}`);

        // Numbers Performance
        const numRows = await prisma.systemPerformance.findMany({
            where: { game },
            select: { systemName: true }
        });

        const numCounts: Record<string, number> = {};
        numRows.forEach(r => {
            numCounts[r.systemName] = (numCounts[r.systemName] || 0) + 1;
        });

        console.log('\n📊 NÚMEROS (SystemPerformance):');
        if (Object.keys(numCounts).length === 0) {
            console.log('  (Sem registos)');
        } else {
            Object.entries(numCounts)
                .sort((a, b) => b[1] - a[1])
                .forEach(([name, count]) => {
                    console.log(`  - ${name.padEnd(40)}: ${count} sorteios calculados`);
                });
        }

        // Stars Performance
        const starRows = await prisma.starSystemPerformance.findMany({
            where: { game },
            select: { systemName: true }
        });

        const starCounts: Record<string, number> = {};
        starRows.forEach(r => {
            starCounts[r.systemName] = (starCounts[r.systemName] || 0) + 1;
        });

        console.log('\n⭐ ESTRELAS / N. SONHO (StarSystemPerformance):');
        if (Object.keys(starCounts).length === 0) {
            console.log('  (Sem registos)');
        } else {
            Object.entries(starCounts)
                .sort((a, b) => b[1] - a[1])
                .forEach(([name, count]) => {
                    console.log(`  - ${name.padEnd(40)}: ${count} sorteios calculados`);
                });
        }
    }

    await prisma.$disconnect();
}

audit();
