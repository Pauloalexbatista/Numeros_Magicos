import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAllSystemsForDuplicates() {
    console.log('🔍 CHECKING ALL SYSTEMS FOR DUPLICATES\n');
    console.log('='.repeat(70));

    try {
        // Get all active systems
        const systems = await prisma.rankedSystem.findMany({
            where: { isActive: true },
            select: { name: true },
            orderBy: { name: 'asc' }
        });

        console.log(`\nFound ${systems.length} active systems. Analyzing...\n`);

        const results: Array<{
            name: string;
            total: number;
            unique: number;
            duplicates: number;
            dupPct: string;
        }> = [];

        for (const system of systems) {
            const allRecords = await prisma.systemPerformance.findMany({
                where: { systemName: system.name },
                select: { drawId: true }
            });

            // Count unique draws
            const uniqueDraws = new Set(allRecords.map(r => r.drawId));
            const totalRecords = allRecords.length;
            const uniqueCount = uniqueDraws.size;
            const duplicates = totalRecords - uniqueCount;
            const dupPercentage = totalRecords > 0 ? ((duplicates / totalRecords) * 100).toFixed(1) : '0.0';

            results.push({
                name: system.name,
                total: totalRecords,
                unique: uniqueCount,
                duplicates: duplicates,
                dupPct: dupPercentage
            });
        }

        // Sort by number of duplicates (descending)
        results.sort((a, b) => b.duplicates - a.duplicates);

        // Display results
        console.log('📊 DUPLICATE ANALYSIS RESULTS:\n');
        console.log('System Name'.padEnd(40) + 'Total'.padEnd(10) + 'Unique'.padEnd(10) + 'Duplicates'.padEnd(12) + '% Dup');
        console.log('-'.repeat(70));

        let totalDuplicates = 0;
        let systemsWithDuplicates = 0;

        results.forEach(r => {
            const dupIndicator = r.duplicates > 0 ? '⚠️ ' : '✅ ';
            console.log(
                dupIndicator + r.name.padEnd(38) +
                r.total.toString().padEnd(10) +
                r.unique.toString().padEnd(10) +
                r.duplicates.toString().padEnd(12) +
                r.dupPct + '%'
            );

            totalDuplicates += r.duplicates;
            if (r.duplicates > 0) systemsWithDuplicates++;
        });

        console.log('-'.repeat(70));
        console.log(`\n📈 SUMMARY:`);
        console.log(`   Total Systems: ${results.length}`);
        console.log(`   Systems with Duplicates: ${systemsWithDuplicates}`);
        console.log(`   Total Duplicate Records: ${totalDuplicates}`);
        console.log(`   Average Duplicates per System: ${(totalDuplicates / results.length).toFixed(0)}`);

        if (systemsWithDuplicates > 0) {
            console.log(`\n⚠️  WARNING: ${systemsWithDuplicates} systems have duplicate records!`);
            console.log(`   The unified service will handle this automatically.`);
        } else {
            console.log(`\n✅ GOOD NEWS: No duplicates found!`);
        }

        console.log('\n' + '='.repeat(70));

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkAllSystemsForDuplicates();
