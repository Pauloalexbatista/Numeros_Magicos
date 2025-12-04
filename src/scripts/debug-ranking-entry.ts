
import { prisma } from '../lib/prisma';

async function main() {
    console.log('🔍 Checking Rankings for specific systems...');

    const systems = ['Sistema Platina', 'Sistema Média Vizinhos'];

    for (const name of systems) {
        const rank = await prisma.systemRanking.findUnique({
            where: { systemName: name }
        });
        console.log(`- ${name}: ${rank ? `Ranked with ${rank.avgAccuracy}%` : 'NOT RANKED'}`);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
