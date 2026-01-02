
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixDrawSequence() {
    console.log('🔄 Iniciando correção da Sequência de Sorteios...');

    try {
        // 1. Fetch ALL draws ordered by Date
        const allDraws = await prisma.draw.findMany({
            orderBy: { date: 'asc' }
        });

        console.log(`📊 Encontrados ${allDraws.length} sorteios no total.`);

        let updatedCount = 0;

        // 2. Iterate and Update Sequence Number
        for (let i = 0; i < allDraws.length; i++) {
            const draw = allDraws[i];
            const correctSequence = i + 1;

            // Optional: Only update if different to save DB writes
            if (draw.sequenceNumber !== correctSequence) {
                await prisma.draw.update({
                    where: { id: draw.id },
                    data: { sequenceNumber: correctSequence }
                });
                process.stdout.write(`\r✅ Atualizado Sorteio ${draw.date.toISOString().split('T')[0]} (ID ${draw.id}) -> #${correctSequence}`);
                updatedCount++;
            }
        }

        console.log(`\n\n✨ Processo Concluído!`);
        console.log(`📝 Total Atualizados: ${updatedCount}`);
        console.log(`🔥 Último Sorteio: #${allDraws.length} em ${allDraws[allDraws.length - 1].date.toISOString()}`);

    } catch (error) {
        console.error('❌ Erro Fatal:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixDrawSequence();
