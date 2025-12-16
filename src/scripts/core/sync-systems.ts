
import { PrismaClient } from '@prisma/client';
import { SystemRegistry } from '../../systems';


const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL || 'file:./prisma/dev.db'
        }
    }
});


async function main() {
    console.log(`🔄 Syncing System Registry with Database...`);

    // 1. Get all Registry Systems
    console.log(`📚 Found ${SystemRegistry.length} systems in Registry.`);

    for (const system of SystemRegistry) {
        const { name, description, isActiveByDefault } = system.metadata;

        // 2. Upsert Main System
        console.log(`   👉 Processing: ${name}`);
        await prisma.rankedSystem.upsert({
            where: { name },
            update: {
                description,
                // We DO NOT update 'isActive' here to not override user preference
                // unless we want to force re-enable? Let's respect DB state if exists.
            },
            create: {
                name,
                description,
                isActive: isActiveByDefault
            }
        });

        // 3. Upsert Anti-System (Golden Rule #1)
        const antiName = `Anti-${name}`;
        await prisma.rankedSystem.upsert({
            where: { name: antiName },
            update: {
                description: `Estratégia Inversa: Aposta contra o ${name}`,
            },
            create: {
                name: antiName,
                description: `Estratégia Inversa: Aposta contra o ${name}`,
                isActive: isActiveByDefault
            }
        });
    }

    // 4. (Optional) Check for Orphans?
    // We could check if there are systems in DB not in Registry and mark them inactive.
    // For now, let's keep it additive not to break legacy.

    console.log(`✅ Sync Complete!`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
