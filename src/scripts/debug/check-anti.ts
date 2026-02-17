
import { prisma } from '../../lib/prisma';

async function checkAntiSystems() {
    console.log('Checking for Anti-Systems in Local DB...');
    const antiSystems = await prisma.rankedSystem.findMany({
        where: {
            name: { startsWith: 'Anti' }
        },
        include: {
            performances: {
                take: 1
            }
        }
    });

    console.log(`Found ${antiSystems.length} Anti-Systems.`);
    antiSystems.forEach(s => {
        console.log(`- ${s.name} (Active: ${s.isActive})`);
    });

    const starAnti = await prisma.rankedSystem.findMany({
        where: {
            name: { startsWith: 'Anti' },
            domain: 'STARS'
        }
    });
    console.log(`Found ${starAnti.length} Anti-Star Systems.`);
}

checkAntiSystems().catch(console.error).finally(() => prisma.$disconnect());
