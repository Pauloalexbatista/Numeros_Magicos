import { prisma } from './src/lib/prisma';

async function cleanup() {
    // Delete the incorrectly named one
    const deleted = await prisma.rankedSystem.deleteMany({
        where: { name: 'LSTM Neural Net' }
    });
    console.log(`Deleted ${deleted.count} obsolete 'LSTM Neural Net' entries.`);

    // Fix systemType for the others if they are wrong
    const updated = await prisma.rankedSystem.updateMany({
        where: { 
            name: { in: ['LSTM Neural Network', 'Random Forest', 'ML Classifier'] },
            systemType: 'BASE'
        },
        data: { systemType: 'NEURAL' }
    });
    console.log(`Fixed ${updated.count} entries to NEURAL systemType.`);
}

cleanup()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
