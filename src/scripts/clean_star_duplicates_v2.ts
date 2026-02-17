
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanDuplicatesOptimized() {
    console.log("🧹 Iniciando limpeza OTIMIZADA de duplicados em StarSystemPerformance...\n");

    try {
        // Exclui todos os registros que NÃO são o ID mínimo de cada grupo (drawId, systemName)
        const deletedCount = await prisma.$executeRaw`
            DELETE FROM star_system_performance
            WHERE id NOT IN (
                SELECT MIN(id)
                FROM star_system_performance
                GROUP BY drawId, systemName
            )
        `;

        console.log(`✨ Limpeza concluída! Total de registos eliminados: ${deletedCount}`);
    } catch (error) {
        console.error("❌ Erro durante a limpeza:", error);
    } finally {
        await prisma.$disconnect();
    }
}

cleanDuplicatesOptimized().catch(console.error);
