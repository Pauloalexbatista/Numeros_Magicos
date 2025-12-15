
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔧 Fixing Postgres Sequences...');

    const tables = [
        { name: 'system_ranking', table: 'SystemRanking' },
        { name: 'ranked_systems', table: 'RankedSystem' },
        { name: 'system_performance', table: 'SystemPerformance' },
        { name: 'star_system_ranking', table: 'StarSystemRanking' },
        { name: 'star_system_performance', table: 'StarSystemPerformance' },
        { name: 'draws', table: 'Draw' },
    ];

    for (const t of tables) {
        try {
            // Postgres specific: Reset sequence to max(id) + 1
            // We use pg_get_serial_sequence to get the sequence name correctly
            // COALESCE(MAX(id), 0) + 1 handles empty tables
            const query = `
                SELECT setval(
                    pg_get_serial_sequence('"${t.name}"', 'id'),
                    COALESCE((SELECT MAX(id) FROM "${t.name}"), 0) + 1,
                    false
                );
            `;

            await prisma.$executeRawUnsafe(query);
            console.log(`✅ Fixed sequence for table: ${t.name}`);
        } catch (error) {
            console.log(`⚠️  Could not fix ${t.name} (Result: ${error.message.split('\n')[0]})`);
            // Some tables might not have 'id' as serial or might use random keys, ignore if so.
        }
    }

    console.log('🎉 All sequences processed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
