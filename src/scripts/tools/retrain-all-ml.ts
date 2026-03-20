import { trainMLClassifierModel } from '../../services/neural/classifier-train-core';
import { prisma } from '@/lib/prisma';

async function main() {
    console.log('🚀 Triggering Fast Training Sequence to expand ML Classifier to 25 Numbers...');
    
    // Numbers
    await trainMLClassifierModel('EUROMILLIONS', false, 50, 'CLASSIFIER_EUROMILLIONS_NUMBERS');
    await trainMLClassifierModel('TOTOLOTO', false, 49, 'CLASSIFIER_TOTOLOTO_NUMBERS');
    await trainMLClassifierModel('EURODREAMS', false, 40, 'CLASSIFIER_EURODREAMS_NUMBERS');

    // Stars
    await trainMLClassifierModel('EUROMILLIONS', true, 12, 'CLASSIFIER_EUROMILLIONS_STARS');
    await trainMLClassifierModel('TOTOLOTO', true, 13, 'CLASSIFIER_TOTOLOTO_STARS');
    await trainMLClassifierModel('EURODREAMS', true, 5, 'CLASSIFIER_EURODREAMS_DREAMS');
    
    console.log('✅ ML Classifier Normalized DB Seed Complete!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
