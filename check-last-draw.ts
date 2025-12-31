import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const lastDraw = await prisma.draw.findFirst({
        orderBy: { drawNumber: 'desc' }
    });

    console.log('\n=== ÚLTIMO SORTEIO NA BASE DE DADOS ===');
    console.log(`Número: ${lastDraw?.drawNumber}`);
    console.log(`Data: ${lastDraw?.date}`);
    console.log(`Números: ${lastDraw?.numbers}`);
    console.log(`Estrelas: ${lastDraw?.stars}`);
    console.log('=====================================\n');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
