import { prisma } from '../lib/prisma';
import { MLClassifierModel } from '../models/implementations/MLClassifierModel';

async function main() {
    console.log('🏎️ Testing ML Model Speed...');

    // 1. Fetch history
    const history = await prisma.draw.findMany({
        orderBy: { date: 'asc' }
    });
    console.log(`📚 Loaded ${history.length} draws.`);

    const model = new MLClassifierModel();

    // 2. First Run (Should Train or Load)
    console.log('⏱️ Starting Run 1...');
    const start1 = performance.now();
    await model.predict(history);
    const end1 = performance.now();
    console.log(`✅ Run 1 took: ${(end1 - start1).toFixed(2)}ms`);

    // 3. Second Run (Should Load - Instant)
    console.log('⏱️ Starting Run 2...');
    const start2 = performance.now();
    await model.predict(history);
    const end2 = performance.now();
    console.log(`✅ Run 2 took: ${(end2 - start2).toFixed(2)}ms`);

    if ((end2 - start2) < (end1 - start1)) {
        console.log('🚀 SUCCESS: Run 2 was faster (Persistence working)!');
    } else {
        console.log('⚠️ WARNING: Run 2 was not faster. Persistence might not be working as expected.');
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
