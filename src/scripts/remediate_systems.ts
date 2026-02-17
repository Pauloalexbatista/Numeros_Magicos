
import { PrismaClient } from '@prisma/client';
import {
    rankedSystems,
    starSystems,
    totolotoRankedSystems,
    totolotoStarSystems,
    euroDreamsRankedSystems,
    euroDreamsStarSystems
} from '../services/ranking';

const prisma = new PrismaClient();

async function remediateSystems() {
    console.log("🛠️ REMEDIAÇÃO DE SISTEMAS\n");

    const allCodeSystems = [
        ...rankedSystems,
        ...starSystems,
        ...totolotoRankedSystems,
        ...totolotoStarSystems,
        ...euroDreamsRankedSystems,
        ...euroDreamsStarSystems
    ];

    const allCodeNames = allCodeSystems.map(s => s.name);

    // 1. Ativar sistemas que estão no código mas inativos no DB
    console.log("🔓 Ativando sistemas do código no DB...");
    for (const name of allCodeNames) {
        const res = await prisma.rankedSystem.updateMany({
            where: { name, isActive: false },
            data: { isActive: true }
        });
        if (res.count > 0) console.log(`   ✅ Ativado: ${name}`);
    }

    // 2. Desativar sistemas que estão no DB mas NÃO estão no código (órfãos)
    console.log("\n🔒 Desativando sistemas órfãos (não definidos no código)...");
    const orphans = await prisma.rankedSystem.findMany({
        where: {
            isActive: true,
            name: { notIn: allCodeNames }
        }
    });

    for (const orphan of orphans) {
        await prisma.rankedSystem.update({
            where: { id: orphan.id },
            data: { isActive: false }
        });
        console.log(`   🚫 Desativado: ${orphan.name} (${orphan.game})`);
    }

    // 3. Limpar Cache de sistemas órfãos
    console.log("\n🧹 Limpando cache de sistemas órfãos...");
    for (const orphan of orphans) {
        await prisma.cachedPrediction.deleteMany({
            where: { systemName: orphan.name }
        });
        await prisma.systemRanking.deleteMany({
            where: { systemName: orphan.name }
        });
        await prisma.starSystemRanking.deleteMany({
            where: { systemName: orphan.name }
        });
    }

    console.log("\n✨ Remediação de sistemas concluída!");
    await prisma.$disconnect();
}

remediateSystems().catch(console.error);
