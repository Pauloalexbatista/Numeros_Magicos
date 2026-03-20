import { initializeSystems } from './src/services/ranking';
import { prisma } from './src/lib/prisma';

async function run() {
    console.log('Running initializeSystems...');
    await initializeSystems();
    console.log('Done.');
    await prisma.$disconnect();
}

run();
