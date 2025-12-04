
import { prisma } from '../lib/prisma';

async function inspectCache() {
    const cached = await prisma.cachedPrediction.findMany({
        orderBy: { systemName: 'asc' }
    });

    console.log(`Found ${cached.length} cached predictions.`);
    console.log('---------------------------------------------------');
    console.log('| System Name                  | Predicted Numbers (Top 5 shown) |');
    console.log('---------------------------------------------------');

    cached.forEach(c => {
        const nums = JSON.parse(c.numbers);
        const preview = nums.slice(0, 5).join(', ');
        console.log(`| ${c.systemName.padEnd(28)} | [${preview}, ...] (${nums.length} total) |`);
    });
    console.log('---------------------------------------------------');
}

inspectCache()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
