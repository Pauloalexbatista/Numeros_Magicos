
import { prisma } from '../../lib/prisma';
import { prismaProd } from '../../lib/prisma-prod';

async function checkStatus() {
    console.log('🔍 Checking System Status (Local vs Prod)...\n');

    const patterns = ['Consensus', 'Combinado', 'Vortex', 'Media'];
    const prod = prismaProd as any;

    const localSystems = await prisma.rankedSystem.findMany({
        where: {
            OR: patterns.map(p => ({ name: { contains: p } }))
        }
    });

    console.log(String(localSystems.length).padEnd(50) + ' | LOCAL | PROD');
    console.log('-'.repeat(80));

    for (const sys of localSystems) {
        const prodSys = await prod.rankedSystem.findUnique({
            where: { name: sys.name }
        });

        const localStatus = sys.isActive ? '✅ ON ' : 'fz OFF';
        const prodStatus = prodSys ? (prodSys.isActive ? '✅ ON ' : 'fz OFF') : '❌ MISSING';

        console.log(`${sys.name.padEnd(50)} | ${localStatus} | ${prodStatus}`);
    }
}

checkStatus()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
        await (prismaProd as any).$disconnect();
    });
