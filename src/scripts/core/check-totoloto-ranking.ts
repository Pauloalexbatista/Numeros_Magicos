
import { prisma } from '@/lib/prisma';

async function main() {
    console.log('🔍 Checking Totoloto Systems & Rankings...');

    // 1. Check RankedSystem entries
    const systems = await prisma.rankedSystem.findMany({
        where: { game: 'TOTOLOTO' }
    });
    console.log(`✅ Found ${systems.length} total Totoloto systems registered.`);
    systems.slice(0, 5).forEach(s => console.log(`   - ${s.name} (${s.isActive ? 'Active' : 'Inactive'})`));

    // 2. Check SystemPerformance
    const perfCount = await prisma.systemPerformance.count({
        where: { system: { game: 'TOTOLOTO' } }
    });
    console.log(`✅ Found ${perfCount} Totoloto performance records.`);

    // 3. Check SystemRanking
    const rankingCount = await prisma.systemRanking.count({
        where: { system: { game: 'TOTOLOTO' } }
    });
    console.log(`✅ Found ${rankingCount} Totoloto rankings.`);

    // 3. Show Top 5
    const topSystems = await prisma.systemRanking.findMany({
        where: { system: { game: 'TOTOLOTO' } },
        orderBy: { avgAccuracy: 'desc' },
        take: 5,
        include: { system: true }
    });

    console.log('\n🏆 Top 5 Totoloto Systems:');
    topSystems.forEach((r, i) => {
        console.log(`${i + 1}. ${r.systemName}: ${r.avgAccuracy.toFixed(2)}% (${r.totalPredictions} predictions)`);
    });

    // 4. Check Star Rankings
    // Do we have star rankings?
    // StarSystemRanking table.
    // Need to check specific names like "Hot Stars (Totoloto)"?
    // StarSystemRanking doesn't link to RankedSystem directly via ID, but via systemName unique.
    // RankedSystem has game field.
    // So we can filter by name convention or join?
    // Prisma schema relates `system` in `SystemRanking`? No, `systemName` references `RankedSystem.name`.
    // Yes! `system` relation exists.

    // Check Star Rankings manually via name pattern? Or rely on system relation if schema allows?
    // Schema: `model StarSystemRanking { ... systemName String @unique ...No relation to RankedSystem? }`
    // Let's check schema again.

    // In schema.prisma (line 195+), StarSystemRanking has NO relation to RankedSystem.
    // This is unfortunate. I have to filter by name pattern " (Totoloto)".

    const starRankings = await prisma.starSystemRanking.findMany({
        where: { systemName: { contains: '(Totoloto)' } },
        orderBy: { avgAccuracy: 'desc' },
        take: 5
    });

    console.log('\n🌟 Top 5 Totoloto Star Systems:');
    starRankings.forEach((r, i) => {
        console.log(`${i + 1}. ${r.systemName}: ${r.avgAccuracy.toFixed(2)}%`);
    });

}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
