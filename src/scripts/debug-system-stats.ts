
import { prisma } from '../lib/prisma';

async function main() {
    console.log('🔍 Checking System Stats...');

    const systemsToCheck = [
        'Sistema Platina',
        'Sistema Média Vizinhos',
        'Sistema Ouro',
        'Sistema Bronze'
    ];

    for (const name of systemsToCheck) {
        const count = await prisma.systemPerformance.count({
            where: { systemName: name }
        });
        console.log(`- ${name}: ${count} records`);

        if (count > 0) {
            const last = await prisma.systemPerformance.findFirst({
                where: { systemName: name },
                orderBy: { drawId: 'desc' }
            });
            console.log(`  Last Draw ID: ${last?.drawId}`);
        }
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
