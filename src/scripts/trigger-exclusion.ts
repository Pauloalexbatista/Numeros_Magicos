
import { getExclusionPrediction } from '../services/exclusion-lstm';
import { prisma } from '../lib/prisma';

async function trigger() {
    console.log('🚀 TRIGGERING EXCLUSION LSTM TRAINING...');
    console.log('='.repeat(50));

    try {
        // 1. Numbers
        console.log('\n🔢 Training NUMBERS model...');
        const startNum = Date.now();
        const predNum = await getExclusionPrediction('NUMBERS');
        console.log(`✅ NUMBERS Done in ${(Date.now() - startNum) / 1000}s`);
        console.log(`   Excluded: ${predNum.excluded.join(', ')}`);
        console.log(`   Confidence: ${predNum.confidence}%`);

        // 2. Stars
        console.log('\n⭐ Training STARS model...');
        const startStar = Date.now();
        const predStar = await getExclusionPrediction('STARS');
        console.log(`✅ STARS Done in ${(Date.now() - startStar) / 1000}s`);
        console.log(`   Excluded: ${predStar.excluded.join(', ')}`);
        console.log(`   Confidence: ${predStar.confidence}%`);

        console.log('\n✨ SUCCESS! Cache populated.');

    } catch (error) {
        console.error('❌ ERROR:', error);
    } finally {
        // Disconnect prisma is handled by the lib usually, but we can exit
        process.exit(0);
    }
}

trigger();
