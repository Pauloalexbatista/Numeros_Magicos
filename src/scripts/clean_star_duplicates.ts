
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanDuplicates() {
    console.log("🧹 Iniciando limpeza de duplicados em StarSystemPerformance...\n");

    // 1. Encontrar todos os grupos duplicados
    const duplicates = await prisma.$queryRaw`
        SELECT drawId, systemName, MIN(id) as keepId, COUNT(*) as count
        FROM star_system_performance
        GROUP BY drawId, systemName
        HAVING count > 1
    `;

    const duplicateGroups = duplicates as any[];
    console.log(`🔍 Encontrados ${duplicateGroups.length} grupos com duplicados.`);

    if (duplicateGroups.length === 0) {
        console.log("✅ Nenhum duplicado encontrado.");
        return;
    }

    let totalDeleted = 0;

    for (const group of duplicateGroups) {
        const result = await prisma.$executeRaw`
            DELETE FROM star_system_performance
            WHERE drawId = ${group.drawId} 
              AND systemName = ${group.systemName}
              AND id != ${group.keepId}
        `;
        totalDeleted += result;
    }

    console.log(`\n✨ Limpeza concluída! Total de registos eliminados: ${totalDeleted}`);

    await prisma.$disconnect();
}

cleanDuplicates().catch(console.error);
