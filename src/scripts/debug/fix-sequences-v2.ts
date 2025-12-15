
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔧 Fixing Postgres Sequences (V2)...');

    // Map: Table Name (DB) -> Sequence Name (DB)
    // Standard Postgres Naming: table_column_seq
    const targets = [
        { table: 'system_ranking', seq: 'system_ranking_id_seq' },
        { table: 'ranked_systems', seq: 'ranked_systems_id_seq' },
        { table: 'system_performance', seq: 'system_performance_id_seq' },
        { table: 'star_system_ranking', seq: 'star_system_ranking_id_seq' },
        { table: 'star_system_performance', seq: 'star_system_performance_id_seq' },
        { table: 'Draw', seq: 'Draw_id_seq' }, // Check if Draw is mapped or not
    ];

    for (const t of targets) {
        try {
            console.log(`Processing ${t.table}...`);

            // 1. Get Max ID
            // We use quoteIdent style naming just in case
            const maxIdResult = await prisma.$queryRawUnsafe(`SELECT MAX(id) as max_id FROM "${t.table}"`);
            const maxId = Number((maxIdResult as any)[0]?.max_id || 0);
            const nextId = maxId + 1;

            console.log(`   Max ID: ${maxId}, Next: ${nextId}`);

            // 2. Set Sequence
            // We verify if sequence exists implicitly by just trying to set it.
            // Note: Sequence names might be case sensitive or mixed. Usually lowercase in Postgres unless quoted creation.
            // Prisma generally creates lowercase tables and sequences if using @@map, but let's try standard lower.
            const seqName = t.seq.toLowerCase();

            await prisma.$executeRawUnsafe(`SELECT setval('${seqName}', ${nextId}, false)`);
            console.log(`   ✅ Sequence '${seqName}' updated to ${nextId}`);

        } catch (error) {
            console.error(`   ❌ Failed to fix ${t.table}:`, error.message);
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
