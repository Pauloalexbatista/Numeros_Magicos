import { prisma } from './src/lib/prisma';

async function importFromWebsite() {
    console.log('📥 IMPORTANDO SORTEIOS DO SITE...\n');

    try {
        // Fetch data from the website's API
        const response = await fetch('http://localhost:3001/api/history');
        const draws = await response.json();

        console.log(`📊 Encontrados ${draws.length} sorteios no site`);

        // Import each draw
        let imported = 0;
        for (const draw of draws) {
            try {
                await prisma.draw.upsert({
                    where: { date: new Date(draw.date) },
                    update: {},
                    create: {
                        date: new Date(draw.date),
                        numbers: JSON.stringify(draw.numbers),
                        stars: JSON.stringify(draw.stars),
                        numbersDrawOrder: draw.numbersDrawOrder ? JSON.stringify(draw.numbersDrawOrder) : null,
                        starsDrawOrder: draw.starsDrawOrder ? JSON.stringify(draw.starsDrawOrder) : null,
                        jackpot: draw.jackpot || 0,
                        hasWinner: draw.hasWinner || false
                    }
                });
                imported++;
                if (imported % 100 === 0) {
                    console.log(`   Importados ${imported}/${draws.length}...`);
                }
            } catch (err: any) {
                console.error(`Erro no sorteio ${draw.date}:`, err.message);
            }
        }

        console.log(`\n✅ IMPORTAÇÃO COMPLETA: ${imported} sorteios`);

        // Verify
        const count = await prisma.draw.count();
        console.log(`📊 Total na BD: ${count}`);

    } catch (error: any) {
        console.error('❌ Erro:', error.message);
    }

    await prisma.$disconnect();
}

importFromWebsite();
