/**
 * PRE-MIGRATION SCRIPT
 * 
 * Populates 'ranked_systems' table from existing data in 'system_performance'
 * and 'star_system_performance', so that foreign key constraints can be applied.
 * 
 * Run BEFORE: npx prisma db push --schema=prisma/schema.postgresql.prisma
 * 
 * Usage:
 *   $env:DATABASE_URL="postgresql://..."
 *   npx ts-node --project tsconfig.scripts.json scripts/pre-migrate-ranked-systems.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: { url: process.env.DATABASE_URL }
    }
});

async function main() {
    console.log('🔧 PRE-MIGRATION: Populating ranked_systems table\n');
    console.log('DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...\n');

    // Step 1: Find all unique (systemName, game) combinations in system_performance
    console.log('📊 Step 1: Collecting systems from system_performance...');
    const numberPerfs = await prisma.$queryRaw<{ systemName: string; game: string }[]>`
        SELECT DISTINCT "systemName", COALESCE(game, 'EUROMILLIONS') as game
        FROM system_performance
        ORDER BY "systemName", game
    `;
    console.log(`   Found ${numberPerfs.length} unique systems in system_performance`);

    // Step 2: Find all unique (systemName, game) combinations in star_system_performance
    console.log('\n📊 Step 2: Collecting systems from other tables...');

    const starPerfs = await prisma.$queryRaw<{ systemName: string; game: string }[]>`
        SELECT DISTINCT "systemName", COALESCE(game, 'EUROMILLIONS') as game
        FROM star_system_performance
    `;

    const cachedPreds = await prisma.$queryRaw<{ systemName: string; game: string }[]>`
        SELECT DISTINCT "systemName", COALESCE(game, 'EUROMILLIONS') as game
        FROM cached_predictions
    `;

    const sysRankings = await prisma.$queryRaw<{ systemName: string; game: string }[]>`
        SELECT DISTINCT "systemName", COALESCE(game, 'EUROMILLIONS') as game
        FROM system_ranking
    `;

    const starRankings = await prisma.$queryRaw<{ systemName: string; game: string }[]>`
        SELECT DISTINCT "systemName", COALESCE(game, 'EUROMILLIONS') as game
        FROM star_system_ranking
    `;

    console.log(`   Found:
       - ${numberPerfs.length} in system_performance
       - ${starPerfs.length} in star_system_performance
       - ${cachedPreds.length} in cached_predictions
       - ${sysRankings.length} in system_ranking
       - ${starRankings.length} in star_system_ranking`);

    // Merge all systems
    const allSystems = new Map<string, { systemName: string; game: string; domain: string }>();

    // Helper to add systems
    const addSystems = (list: { systemName: string; game: string }[], domain: string) => {
        for (const s of list) {
            const key = `${s.systemName}|${s.game}`;
            if (!allSystems.has(key)) {
                allSystems.set(key, { systemName: s.systemName, game: s.game, domain });
            }
        }
    };

    addSystems(numberPerfs, 'NUMBERS');
    addSystems(starPerfs, 'STARS');
    addSystems(cachedPreds, 'NUMBERS'); // Default to numbers for cache if unknown
    addSystems(sysRankings, 'NUMBERS');
    addSystems(starRankings, 'STARS');

    console.log(`\n📋 Total unique systems to ensure: ${allSystems.size}`);

    // Step 3: Check existing entries in ranked_systems
    console.log('\n📊 Step 3: Checking existing ranked_systems entries...');
    const existingRaw = await prisma.$queryRaw<{ name: string; game: string }[]>`
        SELECT name, game FROM ranked_systems
    `;
    const existingSet = new Set(existingRaw.map(r => `${r.name}|${r.game}`));
    console.log(`   Already exist: ${existingSet.size} entries`);

    // Step 4: Insert missing entries
    const missing = Array.from(allSystems.values())
        .filter(s => !existingSet.has(`${s.systemName}|${s.game}`));

    console.log(`\n🚀 Step 4: Inserting ${missing.length} missing entries into ranked_systems...`);

    let inserted = 0;
    let errors = 0;

    for (const s of missing) {
        try {
            await prisma.$executeRaw`
                INSERT INTO ranked_systems (name, game, "isActive", description, "systemType", domain, complexity, priority, "createdAt")
                VALUES (
                    ${s.systemName},
                    ${s.game},
                    true,
                    ${'Auto-inserted by pre-migration script'},
                    ${'BASE'},
                    ${s.domain},
                    ${1},
                    ${50},
                    NOW()
                )
                ON CONFLICT (name, game) DO NOTHING
            `;
            inserted++;
            if (inserted % 10 === 0) {
                console.log(`   ✅ Inserted ${inserted}/${missing.length}...`);
            }
        } catch (err: any) {
            console.error(`   ❌ Error inserting ${s.systemName}/${s.game}: ${err.message}`);
            errors++;
        }
    }

    console.log(`\n✅ Pre-migration complete!`);
    console.log(`   Inserted: ${inserted}`);
    console.log(`   Errors: ${errors}`);
    console.log(`   Skipped (already existed): ${missing.length - inserted - errors}`);

    // Step 5: Verify
    const totalNow = await prisma.$queryRaw<{ count: number }[]>`
        SELECT COUNT(*) as count FROM ranked_systems
    `;
    console.log(`\n📊 Total entries in ranked_systems now: ${(totalNow[0] as any).count}`);

    console.log('\n🎉 You can now run:');
    console.log('   $env:DATABASE_URL="postgresql://..."');
    console.log('   npx prisma db push --schema=prisma/schema.postgresql.prisma --accept-data-loss');
}

main()
    .catch(err => {
        console.error('❌ Fatal error:', err);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
