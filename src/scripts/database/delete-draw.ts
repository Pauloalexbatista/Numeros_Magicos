import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteDraw() {
    try {
        // Delete the fictitious draw from 2025-11-24
        const deleteDate = new Date('2025-11-24');

        console.log(`Procurando sorteio de ${deleteDate.toISOString().split('T')[0]}...`);

        const draw = await prisma.draw.findFirst({
            where: {
                date: deleteDate
            }
        });

        if (draw) {
            console.log('\nSorteio encontrado:');
            console.log(`  Data: ${draw.date.toISOString().split('T')[0]}`);
            console.log(`  Números: ${draw.numbers}`);
            console.log(`  Estrelas: ${draw.stars}`);
            console.log(`  Jackpot: ${draw.jackpot}`);
            console.log('\nApagando...');

            await prisma.draw.delete({
                where: {
                    id: draw.id
                }
            });

            console.log('✅ Sorteio fictício apagado com sucesso!');
        } else {
            console.log('❌ Sorteio não encontrado.');
        }

        // Show remaining draws
        const remainingDraws = await prisma.draw.count();
        console.log(`\n📊 Sorteios restantes na base de dados: ${remainingDraws}`);

    } catch (error) {
        console.error('Erro ao apagar sorteio:', error);
    } finally {
        await prisma.$disconnect();
    }
}

deleteDraw();
