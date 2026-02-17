
import { prismaProd } from '../../lib/prisma-prod';

async function checkProdAntiSystems() {
    console.log('Checking for Anti-Systems in PRODUCTION DB...');
    const antiSystems = await prismaProd.rankedSystem.findMany({
        where: {
            name: { startsWith: 'Anti' }
        }
    });

    console.log(`Found ${antiSystems.length} Anti-Systems in PROD.`);
    antiSystems.forEach(s => {
        console.log(`- ${s.name} (Active: ${s.isActive})`);
    });
}

checkProdAntiSystems().catch(console.error).finally(() => prismaProd.$disconnect());
