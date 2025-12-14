
import { prisma } from '../../lib/prisma';

async function main() {
    console.log('🧹 Starting De-Duplication of SystemPerformance...');

    // 1. Fetch all records
    // Ideally we would trigger a raw SQL query for speed, but Prisma groupBy is safer for logic
    // But groupBy doesn't give us IDs to delete.

    // Let's use raw SQL for Postgres (Vercel) compatibility
    // We want to keep the one with the MAX id (latest) or MIN id (earliest)?
    // Usually redundant seeds add NEW ids. So keeping MIN id (original) makes sense, OR MAX id.
    // Let's keep the one with the highest ID (latest inserted/updated might be better? No, original is safer).
    // Actually, simply: Partition by systemName, drawId.

    try {
        // This query finds duplicates and deletes them, keeping the one with the LOWEST ID (oldest)
        // CTID approach is specific to Postgres, but standard SQL delete with subquery works too.

        console.log('🔍 Analyzing duplicates...');

        /*
           DELETE FROM "system_performance"
           WHERE id NOT IN (
             SELECT MIN(id)
             FROM "system_performance"
             GROUP BY "systemName", "drawId"
           );
        */

        // Execute Raw Query
        const result = await prisma.$executeRawUnsafe(`
            DELETE FROM "system_performance"
            WHERE id NOT IN (
                SELECT MIN(id)
                FROM "system_performance"
                GROUP BY "systemName", "drawId"
            );
        `);

        console.log(`✨ Deleted ${result} duplicate records.`);

    } catch (e) {
        console.error('❌ SQL Error (Local SQLite might fail if syntax differs):', e);

        // Fallback for SQLite (Local) logic if needed, but the user's issue is ONLINE (Postgres).
        // For Local SQLite:
        const isSqlite = process.env.DATABASE_URL?.includes('file:');
        if (isSqlite) {
            console.log('💻 SQLite detected. Running JS-based deduplication...');
            const all perfs = await prisma.systemPerformance.findMany({
                select: { id: true, systemName: true, drawId: true }
            });

            const seen = new Set();
            const toDelete = [];

            for (const p of perfs) {
                const key = `${p.systemName}-${p.drawId}`;
                if (seen.has(key)) {
                    toDelete.push(p.id);
                } else {
                    seen.add(key);
                }
            }

            if (toDelete.length > 0) {
                await prisma.systemPerformance.deleteMany({
                    where: { id: { in: toDelete } }
                });
                console.log(`✨ Deleted ${toDelete.length} duplicates locally.`);
            }
        }
    }

    console.log('✅ Cleanup complete.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
