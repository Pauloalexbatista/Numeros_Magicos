import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- ÚLTIMOS SORTEIOS ---');
    
    const games = ['EUROMILLIONS', 'EURODREAMS', 'TOTOLOTO'];
    
    for (const game of games) {
        const last = await prisma.draw.findFirst({
            where: { game },
            orderBy: { date: 'desc' }
        });
        console.log(`${game}: ${last ? last.date.toISOString().split('T')[0] : 'NENHUM'}`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
