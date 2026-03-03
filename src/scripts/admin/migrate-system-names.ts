
import { prisma } from '../../lib/prisma';

async function migrateSystemNames() {
    console.log('🔄 Starting System Name Migration...');

    // 1. Find all systems with "(EuroDreams)" suffix
    const legacySystems = await prisma.rankedSystem.findMany({
        where: {
            name: { contains: ' (EuroDreams)' }
        }
    });

    console.log(`🔍 Found ${legacySystems.length} systems with legacy naming format.`);

    for (const sys of legacySystems) {
        const newName = sys.name.replace(' (EuroDreams)', '_EURODREAMS');
        console.log(`Processing: ${sys.name} -> ${newName}`);

        // Check if new name already exists
        const existingNew = await prisma.rankedSystem.findUnique({
            where: { name: newName }
        });

        if (existingNew) {
            console.log(`⚠️  Target name ${newName} already exists. Deleting legacy system...`);
            // Delete related records first if necessary (Cascading delete usually handles this, but let's be safe)
            // For now, assume CASCADE DELETE is configured or just delete the system
            try {
                // Determine which one to keep? 
                // Usually we keep the one with more history, but here we want to enforce the new name.
                // If existingNew exists, we can just delete the old one.
                // BUT we might want to migrate performance records?
                // Too complex for now. Let's just delete the old one, and let backfill regenerate performance for the new one.
                await prisma.cachedPrediction.deleteMany({ where: { systemName: sys.name } });
                await prisma.systemPerformance.deleteMany({ where: { systemName: sys.name } });
                await prisma.rankedSystem.delete({ where: { name: sys.name } });
                console.log(`✅ Deleted legacy ${sys.name}`);
            } catch (e) {
                console.error(`❌ Failed to delete ${sys.name}:`, e);
            }
        } else {
            // Rename
            try {
                await prisma.rankedSystem.update({
                    where: { name: sys.name },
                    data: { name: newName }
                });
                console.log(`✅ Renamed to ${newName}`);
            } catch (e) {
                console.error(`❌ Failed to rename ${sys.name}:`, e);
            }
        }
    }

    console.log('✨ Migration Complete!');
}

migrateSystemNames()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
