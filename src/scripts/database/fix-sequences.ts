
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixSequences() {
    console.log('🔄 Starting PostgreSQL Sequence Repair...');
    
    const tables = [
        { table: 'Draw', seq: 'Draw_id_seq' },
        { table: 'ranked_systems', seq: 'ranked_systems_id_seq' },
        { table: 'system_performance', seq: 'system_performance_id_seq' },
        { table: 'system_ranking', seq: 'system_ranking_id_seq' },
        { table: 'cached_predictions', seq: 'cached_predictions_id_seq' },
        { table: 'star_system_ranking', seq: 'star_system_ranking_id_seq' },
        { table: 'star_system_performance', seq: 'star_system_performance_id_seq' },
        { table: 'system_performance_staging', seq: 'system_performance_staging_id_seq' },
        { table: 'exclusion_cache', seq: 'exclusion_cache_id_seq' },
        { table: 'ml_model_training', seq: 'ml_model_training_id_seq' },
        { table: 'exclusion_performance', seq: 'exclusion_performance_id_seq' },
        { table: 'SystemPrediction', seq: 'SystemPrediction_id_seq' }
    ];

    for (const { table, seq } of tables) {
        try {
            console.log(`📏 Fixing sequence for table: ${table}...`);
            // Standard PostgreSQL command to set sequence to MAX(id)
            // Use double quotes for sequence name to preserve case
            await prisma.$executeRawUnsafe(`
                SELECT setval('"${seq}"', (SELECT COALESCE(MAX(id), 0) + 1 FROM "${table}"), false);
            `);
            console.log(`✅ Sequence ${seq} updated.`);
        } catch (error: any) {
            console.warn(`⚠️ Could not fix sequence for ${table}: ${error.message}`);
            // Try alternative sequence name pattern if standard failed
            try {
                const altSeq = `${table}_id_seq`;
                if (altSeq !== seq) {
                    await prisma.$executeRawUnsafe(`
                        SELECT setval('${altSeq}', (SELECT COALESCE(MAX(id), 0) + 1 FROM "${table}"), false);
                    `);
                    console.log(`✅ Sequence ${altSeq} updated (alternative).`);
                }
            } catch (innerError) {
                // Ignore
            }
        }
    }

    console.log('✨ All sequences processed.');
}

fixSequences()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
