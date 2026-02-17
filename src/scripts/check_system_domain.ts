
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSystem() {
    const sys = await prisma.rankedSystem.findUnique({
        where: { name: 'Sistema Oscilação Universal V2 (EuroDreams)' }
    });
    console.log(JSON.stringify(sys, null, 2));
    await prisma.$disconnect();
}

checkSystem().catch(console.error);
